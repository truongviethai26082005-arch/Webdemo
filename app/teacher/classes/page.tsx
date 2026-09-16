import { getCurrentProfile } from "@/lib/actions/auth";
import { getClassesByTeacher } from "@/lib/actions/classes";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherClassesClient } from "./classes-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const teacherClasses = await getClassesByTeacher(profile.id);

  return (
    <div>
      <TeacherHeader
        title="Lớp Học Của Tôi"
        subtitle="Danh sách các lớp học và học sinh thuộc lớp phụ trách giảng dạy"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeacherClassesClient
          initialClasses={teacherClasses}
          teacherName={profile.full_name}
        />
      </div>
    </div>
  );
}
