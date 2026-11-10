import { redirect } from "next/navigation";

export default function AdminAdmissionsRedirectPage() {
  redirect("/admin/analytics#section-funnel");
}
