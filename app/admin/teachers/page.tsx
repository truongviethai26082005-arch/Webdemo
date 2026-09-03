import { getTeachers, getTeacherPayroll } from "@/lib/actions/teachers";
import { AdminHeader } from "@/components/layout/admin-header";
import { TeachersClient } from "./teachers-client";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialTab = resolvedParams?.tab === "payroll" ? "payroll" : "teachers";
  const teachers = await getTeachers();
  const payroll = await getTeacherPayroll();

  return (
    <div>
      <AdminHeader
        title="Quản lý Giáo viên & Bảng lương Tháng"
        subtitle="Quản lý hồ sơ giáo viên, thiết lập thù lao mỗi buổi dạy và chốt lương tự động"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeachersClient
          initialTeachers={teachers}
          initialPayroll={payroll}
          defaultTab={initialTab}
        />
      </div>
    </div>
  );
}
