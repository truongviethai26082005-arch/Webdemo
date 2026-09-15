import { getLeads, getTrialSlots, getAdmissionsKpiStats } from "@/lib/actions/admissions";
import { getClasses } from "@/lib/actions/classes";
import { getCenterBankSettings } from "@/lib/actions/settings";
import { SaleHeader } from "@/components/layout/sale-header";
import { AdmissionsClient } from "@/app/sale/admissions/admissions-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản lý Phễu Tuyển sinh & CRM | EduCenter",
  description: "Phân hệ Tuyển sinh - Tiếp nhận Leads, Quản lý Ca học thử và Chốt gói học phí VietQR",
};

export default async function SaleAdmissionsPage() {
  const [leads, trialSlots, classes, bankSettings, stats] = await Promise.all([
    getLeads(),
    getTrialSlots(),
    getClasses(),
    getCenterBankSettings(),
    getAdmissionsKpiStats(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Quản lý Phễu Tuyển sinh"
        subtitle="Tiếp nhận Leads, Quản lý ca học thử và Chốt gói học phí VietQR"
      />
      <div className="flex-1">
        <AdmissionsClient
          initialLeads={leads}
          initialTrialSlots={trialSlots}
          classes={classes}
          bankSettings={bankSettings}
          stats={stats}
        />
      </div>
    </div>
  );
}
