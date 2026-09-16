import { getStudentSchedule } from "@/lib/actions/student";
import { ScheduleClient } from "./schedule-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lịch học | Cổng Học sinh",
};

export default async function StudentSchedulePage() {
  const sessions = await getStudentSchedule();

  return <ScheduleClient initialSessions={sessions} />;
}
