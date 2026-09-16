import { getClassSessions } from "@/lib/actions/sessions";
import { getClasses } from "@/lib/actions/classes";
import { getTeacherOptions } from "@/lib/actions/classes";
import { AdminHeader } from "@/components/layout/admin-header";
import { AttendanceAdminClient } from "./attendance-admin-client";

export default async function AdminAttendancePage() {
  const sessions = await getClassSessions();
  const classes = await getClasses();
  const teachers = await getTeacherOptions();

  return (
    <div>
      <AdminHeader
        title="Quản lý Buổi học & Lịch sử Điểm danh"
        subtitle="Lên lịch buổi học cho các lớp và theo dõi lịch sử điểm danh của giáo viên"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <AttendanceAdminClient
          initialSessions={sessions}
          classes={classes}
          teachers={teachers}
        />
      </div>
    </div>
  );
}
