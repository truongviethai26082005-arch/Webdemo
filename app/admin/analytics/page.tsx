import { AdminHeader } from "@/components/layout/admin-header";
import { AnalyticsClient } from "./analytics-client";
import {
  getAdmissionsKpiStats,
  getWaitingListStudents,
} from "@/lib/actions/admissions";
import { getFeedbackKpiStats } from "@/lib/actions/feedback";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Báo cáo & AI Insights | EduCenter EMS",
  description:
    "Phân hệ phân tích dữ liệu, trợ lý AI đề xuất giải pháp, phễu tuyển sinh & tỷ lệ chuyển đổi và báo cáo dòng tiền",
};

export default async function AnalyticsPage() {
  const [admissionsKpi, waitingList, feedbackStats] = await Promise.all([
    getAdmissionsKpiStats(),
    getWaitingListStudents(),
    getFeedbackKpiStats(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Báo cáo & AI Insights (Analytics & AI Advisor)"
        subtitle="Hệ thống phân tích thông minh, phễu tuyển sinh & tỷ lệ chuyển đổi, biến động dòng tiền và đề xuất chiến lược từ AI"
      />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <AnalyticsClient
          monthlyData={[]}
          initialCashFlow={[]}
          admissionsKpi={admissionsKpi}
          waitingList={waitingList}
          feedbackStats={feedbackStats}
        />
      </div>
    </div>
  );
}
