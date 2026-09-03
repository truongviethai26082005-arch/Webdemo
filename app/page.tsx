import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/auth";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/teacher/schedule");
  }
}
