import { getLeads, getTrialSlots, getAdmissionsKpiStats, getAvailableClassSlots } from "@/lib/actions/admissions";
import { getClasses } from "@/lib/actions/classes";
import { getCenterBankSettings } from "@/lib/actions/settings";
import { getQuestions, getRecommendationRules } from "@/lib/actions/entrance-test";
import { SaleHeader } from "@/components/layout/sale-header";
import { AdmissionsClient } from "@/app/sale/admissions/admissions-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản lý Phễu Tuyển sinh & CRM | EduCenter",
  description: "Phân hệ Tuyển sinh - Tiếp nhận Leads, Quản lý Ca học thử, Chốt gói học phí VietQR và Tra cứu slot lớp trống",
};

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    stage?: string;
    leadId?: string;
  }>;
}

export default async function SaleAdmissionsPage(props: PageProps) {
  const [leads, trialSlots, classes, bankSettings, stats, classSlots, questions, recommendationRules, searchParams] = await Promise.all([
    getLeads(),
    getTrialSlots(),
    getClasses(),
    getCenterBankSettings(),
    getAdmissionsKpiStats(),
    getAvailableClassSlots(),
    getQuestions(),
    getRecommendationRules(),
    props.searchParams,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <SaleHeader
        title="Quản lý Phễu Tuyển sinh"
        subtitle="Tiếp nhận Leads, Quản lý ca học thử, Chốt gói học phí VietQR và Tra cứu slot lớp trống"
      />
      <div className="flex-1">
        <AdmissionsClient
          initialLeads={leads}
          initialTrialSlots={trialSlots}
          classes={classes}
          bankSettings={bankSettings}
          stats={stats}
          classSlots={classSlots}
          initialQuestions={questions}
          initialRecommendationRules={recommendationRules}
          initialTab={searchParams?.tab}
          initialStatus={searchParams?.status}
          initialStage={searchParams?.stage}
          initialLeadId={searchParams?.leadId}
        />
      </div>
    </div>
  );
}
