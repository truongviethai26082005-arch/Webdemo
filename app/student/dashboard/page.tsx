import {
  getStudentDashboardStats,
  getStudentGrades,
  getStudentSchedule,
} from "@/lib/actions/student";
import { StudentDashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trang chủ học tập | Cổng Học sinh",
};

export default async function StudentDashboardPage() {
  // 1. Chỉ đọc dữ liệu thông qua Server Actions có sẵn (tuân thủ RLS & Data Isolation)
  const [statsData, gradesData, scheduleData] = await Promise.all([
    getStudentDashboardStats(),
    getStudentGrades(),
    getStudentSchedule(),
  ]);

  return (
    <StudentDashboardClient
      statsData={statsData}
      gradesData={gradesData}
      scheduleData={scheduleData}
    />
  );
}
