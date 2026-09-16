import { getClassById, getTeacherOptions } from "@/lib/actions/classes";
import { getStudents } from "@/lib/actions/students";
import { AdminHeader } from "@/components/layout/admin-header";
import { ClassDetailClient } from "./class-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy mã lớp học hợp lệ.
      </div>
    );
  }

  const classData = await getClassById(id);

  if (!classData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Lớp học không tồn tại hoặc đã bị xóa.
      </div>
    );
  }

  const allStudents = await getStudents();
  const teachers = await getTeacherOptions();

  return (
    <div>
      <AdminHeader
        title={`Lớp: ${classData.name}`}
        subtitle={`Phòng: ${classData.room || "Chưa xếp"} • Giáo viên: ${classData.teacher?.full_name || "Chưa phân công"}`}
      />
      <div className="p-6 max-w-7xl mx-auto">
        <ClassDetailClient
          classData={classData}
          allStudents={allStudents}
          teachers={teachers}
        />
      </div>
    </div>
  );
}
