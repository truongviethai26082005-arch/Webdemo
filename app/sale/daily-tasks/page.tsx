import { getSaleDailyTasks, getLeads } from "@/lib/actions/admissions";
import { getClasses } from "@/lib/actions/classes";
import { getCenterBankSettings } from "@/lib/actions/settings";
import { getCurrentProfile } from "@/lib/actions/auth";
import { SaleHeader } from "@/components/layout/sale-header";
import { DailyTasksClient } from "@/app/sale/daily-tasks/daily-tasks-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lịch Làm Việc Hôm Nay | Tuyển sinh EduCenter",
  description: "Bảng nhiệm vụ cá nhân hóa cho chuyên viên Tuyển sinh: Cuộc gọi hẹn lại, Ca học thử, Lead mới, Học sinh chờ xếp lớp",
};

export default async function DailyTasksPage() {
  const [tasks, allLeads, classes, bankSettings, profile] = await Promise.all([
    getSaleDailyTasks(),
    getLeads(),
    getClasses(),
    getCenterBankSettings(),
    getCurrentProfile(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Lịch Làm Việc Hôm Nay"
        subtitle="Quản lý các cuộc hẹn gọi lại, ca học thử và khách hàng mới"
      />
      <div className="flex-1">
        <DailyTasksClient
          initialTasks={tasks}
          allLeads={allLeads}
          classes={classes}
          bankSettings={bankSettings}
          saleName={profile?.full_name || "Chuyên viên Tuyển sinh"}
        />
      </div>
    </div>
  );
}
