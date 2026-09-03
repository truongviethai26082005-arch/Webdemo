import { getCurrentProfile } from "@/lib/actions/auth";
import { getClassesByTeacher } from "@/lib/actions/classes";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherResourcesClient } from "./resources-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherResourcesPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const teacherClasses = await getClassesByTeacher(profile.id);

  return (
    <div>
      <TeacherHeader
        title="Tài Nguyên Học Tập"
        subtitle="Quản lý slide bài giảng, file PDF, giáo trình và học liệu theo từng lớp học"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeacherResourcesClient classes={teacherClasses} />
      </div>
    </div>
  );
}
