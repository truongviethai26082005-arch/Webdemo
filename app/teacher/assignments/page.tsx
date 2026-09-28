import { getCurrentProfile } from "@/lib/actions/auth";
import { getClassesByTeacher } from "@/lib/actions/classes";
import { getTeacherAssignments } from "@/lib/actions/assignments";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherAssignmentsClient } from "./assignments-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const [teacherClasses, assignments] = await Promise.all([
    getClassesByTeacher(profile.id),
    getTeacherAssignments(),
  ]);

  return (
    <div>
      <TeacherHeader
        title="Bài Tập & Kiểm Tra"
        subtitle="Thiết lập bài tập về nhà, bài test định kỳ và theo dõi tiến độ nộp bài của học sinh"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeacherAssignmentsClient classes={teacherClasses} assignments={assignments} />
      </div>
    </div>
  );
}
