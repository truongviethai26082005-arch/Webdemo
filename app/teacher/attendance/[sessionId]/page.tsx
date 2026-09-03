import { getAttendanceSheet } from "@/lib/actions/attendance";
import { TeacherHeader } from "@/components/layout/teacher-header";
import { notFound } from "next/navigation";
import { AttendanceSheetClient } from "./attendance-sheet-client";

export default async function AttendanceSheetPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const sheetData = await getAttendanceSheet(sessionId);

  if (!sheetData) {
    notFound();
  }

  const { session, roster } = sheetData;

  return (
    <div>
      <TeacherHeader
        title={`Bảng Điểm Danh: ${session.class?.name || "Lớp học"}`}
        subtitle={`Ngày: ${new Date(session.session_date).toLocaleDateString("vi-VN")} • Phòng: ${session.class?.room || "Chung"} • Sĩ số: ${roster.length} học sinh`}
      />
      <div className="p-6 max-w-7xl mx-auto">
        <AttendanceSheetClient
          sessionId={sessionId}
          session={session}
          initialRoster={roster}
        />
      </div>
    </div>
  );
}
