import { getAdminDashboardData } from "@/lib/actions/dashboard";
import { getStudents } from "@/lib/actions/students";
import { getClasses } from "@/lib/actions/classes";
import { getTeacherOptions } from "@/lib/actions/classes";
import { getTeacherPayroll } from "@/lib/actions/teachers";
import { AdminHeader } from "@/components/layout/admin-header";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getAdminDashboardData();
  const students = await getStudents();
  const classes = await getClasses();
  const teachers = await getTeacherOptions();
  const payroll = await getTeacherPayroll();

  return (
    <div>
      <AdminHeader
        title="Tổng quan Trung tâm (Dashboard)"
        subtitle="Theo dõi vận hành tổng thể, lớp học, nhân sự, công nợ và doanh thu trung tâm"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <DashboardClient
          stats={stats}
          students={students}
          classes={classes}
          teachers={teachers}
          payroll={payroll}
        />
      </div>
    </div>
  );
}
