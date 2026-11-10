import { redirect } from "next/navigation";

export default function AdminAdmissionsReportRedirectPage() {
  redirect("/admin/analytics#section-funnel");
}
