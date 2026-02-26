import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentDashboard from "./StudentDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin");
  }

  // Redirect admin users to admin dashboard
  if ((session as any)?.role === "admin") {
    redirect("/admin");
  }

  return <StudentDashboard session={session} />;
}
