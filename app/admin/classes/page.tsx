import { getClasses, getTeacherOptions } from "@/lib/actions/classes";
import { AdminHeader } from "@/components/layout/admin-header";
import { ClassesClient } from "./classes-client";

export default async function ClassesPage() {
  const classes = await getClasses();
  const teachers = await getTeacherOptions();

  return (
    <div>
      <AdminHeader
        title="Quản lý Lớp học"
        subtitle="Danh sách các lớp, phòng học, giáo viên phụ trách và biểu phí"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <ClassesClient initialClasses={classes} teachers={teachers} />
      </div>
    </div>
  );
}
