import { getTeacherSessions } from "@/lib/actions/sessions";
import { getCurrentProfile } from "@/lib/actions/auth";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherScheduleClient } from "./schedule-client";

export default async function TeacherSchedulePage() {
  const profile = await getCurrentProfile();
  const sessions = await getTeacherSessions(profile?.id);

  return (
    <div>
      <TeacherHeader
        title={`Xin chào, ${profile?.full_name || "Thầy/Cô"}`}
        subtitle="Lịch dạy và danh sách các buổi học cần điểm danh"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TeacherScheduleClient sessions={sessions} />
      </div>
    </div>
  );
}
