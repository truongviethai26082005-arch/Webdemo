import { getTeacherTimesheet } from "@/lib/actions/teachers";
import { AdminHeader } from "@/components/layout/admin-header";
import { TimesheetClient } from "./timesheet-client";

export const dynamic = "force-dynamic";

export default async function AdminTimesheetPage() {
  const timesheet = await getTeacherTimesheet();

  return (
    <div>
      <AdminHeader
        title="Bảng Chấm Công Giáo Viên"
        subtitle="Đối chiếu từng buổi dạy với số học sinh đã tự quét mã QR điểm danh"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <TimesheetClient initialData={timesheet} />
      </div>
    </div>
  );
}
