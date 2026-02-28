import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CalendarClient from "@/components/CalendarClient";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect("/");
  }

  // Need to pass clean plain objects to Client Components
  const safeTasks = user.tasks.map(t => ({
    id: t.id,
    content: t.content,
    dateFor: t.dateFor,
    completed: t.completed,
  }));

  return <CalendarClient tasks={safeTasks} />;
}
