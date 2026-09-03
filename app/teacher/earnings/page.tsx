import { getCurrentProfile } from "@/lib/actions/auth";
import { getTeacherPersonalEarnings } from "@/lib/actions/teachers";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherEarningsClient } from "./earnings-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherEarningsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const earningsData = await getTeacherPersonalEarnings(profile.id);

  return (
    <div>
      <TeacherHeader
        title="Thù Lao & Thu Nhập Cá Nhân"
        subtitle="Tổng hợp số ca giảng dạy hoàn thành, đơn giá thù lao và thu nhập dự tính trong tháng"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeacherEarningsClient earningsData={earningsData} />
      </div>
    </div>
  );
}
