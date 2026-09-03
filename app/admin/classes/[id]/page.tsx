import { getClassById, getTeacherOptions } from "@/lib/actions/classes";
import { getStudents } from "@/lib/actions/students";
import { AdminHeader } from "@/components/layout/admin-header";
import { notFound } from "next/navigation";
import { ClassDetailClient } from "./class-detail-client";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classData = await getClassById(id);

  if (!classData) {
    notFound();
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
