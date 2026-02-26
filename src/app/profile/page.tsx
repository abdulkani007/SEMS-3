import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePage from "./ProfilePage";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin");
  }

  return <ProfilePage session={session} />;
}
