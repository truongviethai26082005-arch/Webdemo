import { getTeachers, getTeacherPayroll } from "@/lib/actions/teachers";
import { AdminHeader } from "@/components/layout/admin-header";
import { TeachersClient } from "./teachers-client";

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div>
      <AdminHeader
        title="Quản lý Đội ngũ Giáo viên"
        subtitle="Quản lý hồ sơ giáo viên, phân công lớp học và thiết lập thù lao mỗi buổi dạy"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeachersClient initialTeachers={teachers} />
      </div>
    </div>
  );
}
