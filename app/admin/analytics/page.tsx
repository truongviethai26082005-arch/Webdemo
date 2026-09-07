import { getAnalyticsReportData } from "@/lib/actions/analytics";
import { AdminHeader } from "@/components/layout/admin-header";
import { AnalyticsClient } from "./analytics-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Báo cáo & AI Insights | EduCenter EMS",
  description:
    "Phân hệ phân tích dữ liệu, trợ lý AI đề xuất giải pháp, phễu chuyển đổi 4 tầng và báo cáo dòng tiền",
};

export default async function AnalyticsPage() {
  const reportData = await getAnalyticsReportData();

  return (
    <div>
      <AdminHeader
        title="Báo cáo & AI Insights (Analytics & AI Advisor)"
        subtitle="Hệ thống phân tích thông minh, phễu chuyển đổi 4 tầng đảo ngược, biến động dòng tiền và đề xuất chiến lược từ AI"
      />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <AnalyticsClient
          initialFunnelStages={reportData.funnelStages}
          initialFunnelDropBox={reportData.funnelDropBox}
          initialCashFlow={reportData.cashFlow12Months}
          initialGrossProfit={reportData.grossProfitData}
          initialRetention={reportData.retentionData}
          initialAiAdvisor={reportData.aiAdvisor}
        />
      </div>
    </div>
  );
}
