import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CalendarClientWrapper from "@/components/CalendarClientWrapper";

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

import { isAdmin } from "@/lib/isAdmin";

export default async function CalendarPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const emailParam = params.email as string | undefined;

  const email = session?.user?.email || emailParam;

  if (!email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect("/");
  }

  // @ts-ignore
  if (!user.isPaid && !isAdmin(email)) {
    redirect(`/payment?email=${encodeURIComponent(email)}`);
  }

  // Need to pass clean plain objects to Client Components
  const safeTasks = user.tasks.map((t: any) => ({
    id: t.id,
    content: t.content,
    dateFor: t.dateFor,
    completed: t.completed,
  }));

  return <CalendarClientWrapper tasks={safeTasks} email={email} />;
}
