"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lead, TrialSlot, Class, EntranceTestQuestion, CourseRecommendationRule } from "@/types/database";
import { AdmissionsKpiStats, ClassSlotInfo } from "@/lib/actions/admissions";
import { CenterBankSettings } from "@/lib/utils/vietqr";
import { AdmissionsKpiBar } from "@/components/sale/admissions-kpi-bar";
import { AdmissionsFunnelChart } from "@/components/sale/admissions-funnel-chart";
import { LeadsTab } from "@/components/sale/leads-tab";
import { TrialsTab } from "@/components/sale/trials-tab";
import { ConversionsTab } from "@/components/sale/conversions-tab";
import { ClassSlotBrowser } from "@/components/sale/class-slot-browser";
import { EntranceTestTab } from "@/components/sale/entrance-test-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTrialDialog } from "@/components/sale/schedule-trial-dialog";
import { ConversionCheckoutModal } from "@/components/sale/conversion-checkout-modal";
import { Users, Calendar, QrCode, LayoutGrid, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdmissionsClientProps {
  initialLeads: Lead[];
  initialTrialSlots: TrialSlot[];
  classes: Class[];
  bankSettings: CenterBankSettings;
  stats: AdmissionsKpiStats;
  leadPayments: Record<string, number>;
  classSlots: ClassSlotInfo[];
  initialQuestions: EntranceTestQuestion[];
  initialRecommendationRules: CourseRecommendationRule[];
  initialTab?: string;
  initialStatus?: string;
  initialStage?: string;
  initialLeadId?: string;
}

export function AdmissionsClient({
  initialLeads,
  initialTrialSlots,
  classes,
  bankSettings,
  stats,
  leadPayments,
  classSlots,
  initialQuestions,
  initialRecommendationRules,
  initialTab,
  initialStatus,
  initialStage,
  initialLeadId,
}: AdmissionsClientProps) {
  const router = useRouter();

  // Realtime: tự làm mới trang khi bảng `leads` thay đổi (VD Lead mới từ
  // webhook Google Form, hoặc đồng nghiệp khác vừa cập nhật) — không cần
  // F5 thủ công. `router.refresh()` chỉ re-fetch dữ liệu Server Component
  // (initialLeads...), không mất state cục bộ đang mở (Drawer, filter...).
  // Gộp nhiều sự kiện dồn dập trong 1.5s thành 1 lần refresh để tránh gọi
  // liên tục khi nhiều Lead đổi cùng lúc. YÊU CẦU: bảng `leads` phải được
  // bật Realtime trên Supabase (`ALTER PUBLICATION supabase_realtime ADD
  // TABLE public.leads;`) — nếu chưa bật, tính năng này không có tác dụng
  // nhưng cũng không lỗi gì (im lặng không nhận được sự kiện nào).
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Phải gắn access token của phiên đăng nhập vào Realtime TRƯỚC khi
    // subscribe: nếu subscribe ngay, kênh join bằng publishable key (role
    // `anon`) vì phiên chưa kịp nạp từ cookie, và policy RLS của `leads`
    // (chỉ cho `authenticated`) sẽ âm thầm lọc bỏ mọi sự kiện.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) await supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase
        .channel("sale-admissions-leads-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "leads" },
          () => {
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = setTimeout(() => router.refresh(), 1500);
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  const validTabs = ["leads", "trials", "conversions", "slots", "entrance-test"];
  const defaultTab = initialTab && validTabs.includes(initialTab) ? initialTab : "leads";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // State dialogs triggered from any tab
  const [scheduleLead, setScheduleLead] = useState<Lead | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [checkoutLead, setCheckoutLead] = useState<Lead | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Deep-link Lead cụ thể vào tab Leads — tách thành state riêng (khởi tạo
  // từ prop URL) để popover xem nhanh của AdmissionsKpiBar cũng dùng lại
  // được đúng cơ chế mở Drawer có sẵn ở LeadsTab, không viết luồng mở Drawer
  // song song riêng.
  const [deepLinkLeadId, setDeepLinkLeadId] = useState(initialLeadId);

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

  const handlePreviewLeadSelect = (lead: Lead) => {
    setActiveTab("leads");
    setDeepLinkLeadId(lead.id);
  };

  const availableCount = classSlots.filter((c) => !c.isFull).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* KPI Stats Bar — bấm vào từng thẻ để xem nhanh danh sách Lead tương
          ứng (2026-09-18), không cần cuộn xuống lọc thủ công. */}
      <AdmissionsKpiBar
        stats={stats}
        leads={initialLeads}
        leadPayments={leadPayments}
        onSelectLead={handlePreviewLeadSelect}
      />

      {/* Biểu đồ tổng quan phễu chuyển đổi */}
      <AdmissionsFunnelChart stats={stats} />

      {/* Main 4-Tab Admissions Funnel */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b border-border pb-2 overflow-x-auto">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-10 w-max min-w-full flex flex-nowrap gap-0.5">
            <TabsTrigger
              value="leads"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              Leads
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 text-[11px]">
                {initialLeads.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="trials"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              Ca Học thử
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 text-[11px]">
                {initialTrialSlots.length}
              </span>
            </TabsTrigger>

            {/* Đổi vị trí sang ngay sau "Ca Học thử" (2026-09-17, theo yêu
                cầu chủ dự án) — đúng quy trình nghiệp vụ thật: học thử xong
                mới tới bước làm test đầu vào để đánh giá năng lực, RỒI mới
                ghi danh chính thức. Trước đây tab này nằm cuối cùng (sau cả
                "Ghi danh & VietQR"), sai thứ tự luồng nghiệp vụ dù không sai
                về mặt kỹ thuật. */}
            <TabsTrigger
              value="entrance-test"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs whitespace-nowrap"
            >
              <ClipboardList className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              Test Đầu Vào
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-600 text-[11px]">
                {initialQuestions.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="conversions"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Ghi danh &amp; VietQR
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 text-[11px]">
                {stats.conversionCount}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="slots"
              className="text-xs font-bold gap-1.5 rounded-lg data-[state=active]:shadow-xs whitespace-nowrap"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              Slot Lớp Trống
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-600 text-[11px]">
                {availableCount}
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
            initialStatusFilter={initialStatus}
            initialStageFilter={initialStage}
            initialLeadId={deepLinkLeadId}
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

        {/* TAB 3: TEST ĐẦU VÀO (ngay sau Học thử, đúng thứ tự nghiệp vụ) */}
        <TabsContent value="entrance-test" className="m-0 focus-visible:outline-hidden">
          <EntranceTestTab
            questions={initialQuestions}
            recommendationRules={initialRecommendationRules}
            classes={classes}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* TAB 4: CONVERSIONS */}
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

        {/* TAB 5: TRA CỨU SLOT LỚP TRỐNG */}
        <TabsContent value="slots" className="m-0 focus-visible:outline-hidden">
          <ClassSlotBrowser
            classSlots={classSlots}
            leads={initialLeads}
            trialSlots={initialTrialSlots}
            onRefresh={handleRefresh}
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
