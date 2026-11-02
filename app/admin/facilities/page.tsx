import { redirect } from "next/navigation";

export default function FacilitiesPage() {
  redirect("/admin/classes?tab=schedule");
}
