import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // For easy dev testing without login:
  const mockEmail = process.env.NODE_ENV === "development" ? "cartoonworldd24x7@gmail.com" : null;
  const mockName = process.env.NODE_ENV === "development" ? "Test Admin" : null;

  const userEmail = session?.user?.email || mockEmail;
  const userName = session?.user?.name || mockName;

  return <DashboardClient userEmail={userEmail} userName={userName} />;
}
