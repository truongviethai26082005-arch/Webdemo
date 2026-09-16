"use client";

import { useState } from "react";
import { Lead, TrialSlot, Class } from "@/types/database";
import { AdmissionsKpiStats } from "@/lib/actions/admissions";
import { CenterBankSettings } from "@/lib/utils/vietqr";
import { AdmissionsKpiBar } from "@/components/sale/admissions-kpi-bar";
import { AdmissionsFunnelChart } from "@/components/sale/admissions-funnel-chart";
import { LeadsTab } from "@/components/sale/leads-tab";
import { TrialsTab } from "@/components/sale/trials-tab";
import { ConversionsTab } from "@/components/sale/conversions-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTrialDialog } from "@/components/sale/schedule-trial-dialog";
import { ConversionCheckoutModal } from "@/components/sale/conversion-checkout-modal";
import { Users, Calendar, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdmissionsClientProps {
  initialLeads: Lead[];
  initialTrialSlots: TrialSlot[];
  classes: Class[];
  bankSettings: CenterBankSettings;
  stats: AdmissionsKpiStats;
}

export function AdmissionsClient({
  initialLeads,
  initialTrialSlots,
  classes,
  bankSettings,
  stats,
}: AdmissionsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("leads");

  // State dialogs triggered from any tab
  const [scheduleLead, setScheduleLead] = useState<Lead | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [checkoutLead, setCheckoutLead] = useState<Lead | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleStartScheduleTrial = (lead: Lead) => {
    setScheduleLead(lead);
    setScheduleOpen(true);
  };

  const handleStartConversion = (lead: Lead) => {
    setCheckoutLead(lead);
    setCheckoutOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* KPI Stats Bar */}
      <AdmissionsKpiBar stats={stats} />

      {/* Biểu đồ tổng quan phễu chuyển đổi */}
      <AdmissionsFunnelChart stats={stats} />

      {/* Main 3-Tab Admissions Funnel */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-10">
            <TabsTrigger
              value="leads"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              1. Khách hàng tiềm năng
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 text-[10px]">
                {initialLeads.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="trials"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              2. Xếp lịch học thử
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 text-[10px]">
                {initialTrialSlots.length} ca
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="conversions"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
              3. Ghi danh &amp; chuyển đổi
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px]">
                {stats.conversionCount} chờ
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: LEADS CRM */}
        <TabsContent value="leads" className="m-0 focus-visible:outline-hidden">
          <LeadsTab
            leads={initialLeads}
            onRefresh={handleRefresh}
            onScheduleTrial={handleStartScheduleTrial}
            onStartConversion={handleStartConversion}
          />
        </TabsContent>

        {/* TAB 2: TRIALS */}
        <TabsContent value="trials" className="m-0 focus-visible:outline-hidden">
          <TrialsTab
            leads={initialLeads}
            trialSlots={initialTrialSlots}
            onRefresh={handleRefresh}
            onStartConversion={handleStartConversion}
          />
        </TabsContent>

        {/* TAB 3: CONVERSIONS */}
        <TabsContent value="conversions" className="m-0 focus-visible:outline-hidden">
          <ConversionsTab
            leads={initialLeads}
            classes={classes}
            bankSettings={bankSettings}
            onRefresh={handleRefresh}
            checkoutLead={checkoutLead}
            onClearCheckoutLead={() => setCheckoutLead(null)}
          />
        </TabsContent>
      </Tabs>

      {/* Global Modals callable from any tab */}
      <ScheduleTrialDialog
        lead={scheduleLead}
        trialSlots={initialTrialSlots}
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) setScheduleLead(null);
        }}
        onSuccess={handleRefresh}
      />

      <ConversionCheckoutModal
        lead={checkoutLead}
        classes={classes}
        bankSettings={bankSettings}
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open) setCheckoutLead(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
