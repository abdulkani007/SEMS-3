import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  return <AdminDashboard session={session} />;
}



