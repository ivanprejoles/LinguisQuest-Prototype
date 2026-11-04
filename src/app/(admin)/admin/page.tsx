import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminGatewayPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/404");
  }

  redirect(`/admin-portal/${user.id}`);
}