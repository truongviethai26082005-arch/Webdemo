import { getCurrentProfile } from "@/lib/actions/auth";
import { getTeacherSessions } from "@/lib/actions/sessions";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { TeacherProfileClient } from "./profile-client";

export default async function TeacherProfilePage() {
  const profile = await getCurrentProfile();
  const sessions = await getTeacherSessions(profile?.id);

  const thisMonth = new Date().getMonth();
  const completedThisMonth = sessions.filter(
    (s) => s.status === "completed" && new Date(s.session_date).getMonth() === thisMonth
  ).length;

  return (
    <div>
      <TeacherHeader
        title="Hồ sơ Cá nhân"
        subtitle="Thông tin tài khoản, cập nhật số điện thoại và đổi mật khẩu"
      />
      <div className="p-6 max-w-4xl mx-auto">
        <TeacherProfileClient
          profile={profile}
          completedSessionsCount={completedThisMonth}
        />
      </div>
    </div>
  );
}
