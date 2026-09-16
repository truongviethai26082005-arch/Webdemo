import { getStudents } from "@/lib/actions/students";
import { getClasses } from "@/lib/actions/classes";
import { AdminHeader } from "@/components/layout/admin-header";
import { StudentsClient } from "./students-client";

export default async function StudentsPage() {
  const students = await getStudents();
  const classes = await getClasses();

  return (
    <div>
      <AdminHeader
        title="Quản lý Học sinh"
        subtitle="Hồ sơ học sinh, thông tin phụ huynh và theo dõi số dư buổi học theo lớp"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <StudentsClient initialStudents={students} classes={classes} />
      </div>
    </div>
  );
}
