import { SaleHeader } from "@/components/layout/sale-header";
import { getAdmissionsReportData } from "@/lib/actions/admissions";
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

  const initialData = await getAdmissionsReportData(isoDate(from), isoDate(today));

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Báo cáo Tuyển sinh"
        subtitle="Hiệu suất phễu theo nguồn, theo thời gian và tỷ lệ chuyển đổi sau học thử"
      />
      <div className="flex-1">
        <ReportsClient initialData={initialData} />
      </div>
    </div>
  );
}
