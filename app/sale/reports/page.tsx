import { SaleHeader } from "@/components/layout/sale-header";
import { getAdmissionsReportData, getAdmissionsKpiStats } from "@/lib/actions/admissions";
import { ReportsClient } from "@/app/sale/reports/reports-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Báo cáo Tuyển sinh | Tuyển sinh EduCenter",
  description: "Hiệu suất phễu tuyển sinh theo nguồn, theo thời gian và tỷ lệ chuyển đổi sau học thử",
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function SaleReportsPage() {
  // Mặc định 30 ngày gần nhất khi mở trang lần đầu
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 29);

  // getAdmissionsKpiStats() là ảnh chụp TRỰC TIẾP hiện tại của toàn bộ Lead
  // (giống hệt cách trang "Phễu Tuyển sinh" đang dùng) — KHÔNG lọc theo
  // khoảng thời gian như getAdmissionsReportData(), nên chỉ gọi 1 lần ở
  // server, không cần refetch lại khi đổi bộ lọc ngày ở client.
  const [initialData, stats] = await Promise.all([
    getAdmissionsReportData(isoDate(from), isoDate(today)),
    getAdmissionsKpiStats(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Báo cáo Tuyển sinh"
        subtitle="Hiệu suất phễu theo nguồn, theo thời gian và tỷ lệ chuyển đổi sau học thử"
      />
      <div className="flex-1">
        <ReportsClient initialData={initialData} stats={stats} />
      </div>
    </div>
  );
}
