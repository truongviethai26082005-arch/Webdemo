import {
  getAdmissionsKpiStats,
  getAdmissionsReportData,
  getWaitingListStudents,
} from "@/lib/actions/admissions";
import { getFeedbackKpiStats } from "@/lib/actions/feedback";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdmissionsReportClient } from "./admissions-report-client";

export const dynamic = "force-dynamic";

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminAdmissionsReportPage() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 29);

  const [kpiStats, reportData, waitingList, feedbackStats] = await Promise.all([
    getAdmissionsKpiStats(),
    getAdmissionsReportData(formatDateISO(from), formatDateISO(today)),
    getWaitingListStudents(),
    getFeedbackKpiStats(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Báo cáo Tuyển sinh & Phản ánh"
        subtitle="Số liệu tổng hợp từ phân hệ Sale — chỉ xem, không thao tác chi tiết (đúng nguyên tắc 1 tính năng 1 chủ sở hữu)"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <AdmissionsReportClient
          kpiStats={kpiStats}
          reportData={reportData}
          waitingList={waitingList}
          feedbackStats={feedbackStats}
        />
      </div>
    </div>
  );
}
