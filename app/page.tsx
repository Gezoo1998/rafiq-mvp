import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  switch (session.role) {
    case "student":
      redirect("/missions");
    case "teacher":
      redirect("/teacher");
    case "school_admin":
      redirect("/school");
    case "system_admin":
      redirect("/system");
    default:
      redirect("/login");
  }
}
