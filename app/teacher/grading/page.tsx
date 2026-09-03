import { getCurrentProfile } from "@/lib/actions/auth";
import { getClassesByTeacher } from "@/lib/actions/classes";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherGradingClient } from "./grading-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherGradingPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const teacherClasses = await getClassesByTeacher(profile.id);

  return (
    <div>
      <TeacherHeader
        title="Chấm Điểm & Nhận Xét"
        subtitle="Quản lý danh sách bài tập nộp của học sinh, chấm điểm và gửi nhận xét chuyên môn"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeacherGradingClient classes={teacherClasses} />
      </div>
    </div>
  );
}
