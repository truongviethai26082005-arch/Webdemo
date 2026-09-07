"use client";

import { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Sparkles,
  Award,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdmissionsFunnelBar } from "@/components/admissions/admissions-funnel-bar";
import { LeadsTab } from "@/components/admissions/leads-tab";
import { InteractionsTab } from "@/components/admissions/interactions-tab";
import { TrialsTab } from "@/components/admissions/trials-tab";
import { ConversionsTab } from "@/components/admissions/conversions-tab";

import { CreateLeadDialog } from "@/components/admissions/create-lead-dialog";
import { LogInteractionDialog } from "@/components/admissions/log-interaction-dialog";
import { ScheduleTrialDialog } from "@/components/admissions/schedule-trial-dialog";
import { AssessmentDialog } from "@/components/admissions/assessment-dialog";
import { ConvertStudentDialog } from "@/components/admissions/convert-student-dialog";
import { VietQRModal, VietQRInvoiceData } from "@/components/invoices/vietqr-modal";

import {
  INITIAL_LEADS,
  INITIAL_INTERACTION_LOGS,
  INITIAL_TRIALS,
  INITIAL_CONVERSIONS,
} from "@/lib/data/admissions-seed";
import {
  Lead,
  InteractionLog,
  TrialClass,
  EnrollmentConversion,
  LeadStatus,
} from "@/types/admissions";

const STORAGE_KEY = "educenter_admissions_data_v2";

interface AdmissionsClientProps {
  classes: any[];
  teachers: any[];
}

export function AdmissionsClient({ classes, teachers }: AdmissionsClientProps) {
  const [activeTab, setActiveTab] = useState("leads");

  // Main Data States
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [logs, setLogs] = useState<InteractionLog[]>(INITIAL_INTERACTION_LOGS);
  const [trials, setTrials] = useState<TrialClass[]>(INITIAL_TRIALS);
  const [conversions, setConversions] = useState<EnrollmentConversion[]>(INITIAL_CONVERSIONS);

  // Dialog States
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [isLogInteractionOpen, setIsLogInteractionOpen] = useState(false);
  const [selectedLeadForLog, setSelectedLeadForLog] = useState<string | undefined>();
  const [isScheduleTrialOpen, setIsScheduleTrialOpen] = useState(false);
  const [selectedLeadForTrial, setSelectedLeadForTrial] = useState<string | undefined>();
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [selectedTrialForAssessment, setSelectedTrialForAssessment] = useState<TrialClass | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState<EnrollmentConversion | null>(null);

  // VietQR Modal State
  const [vietQrData, setVietQrData] = useState<VietQRInvoiceData | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.trials) setTrials(parsed.trials);
        if (parsed.conversions) setConversions(parsed.conversions);
      }
    } catch (e) {
      console.error("Failed to load admissions from localStorage", e);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ leads, logs, trials, conversions })
      );
    } catch (e) {
      console.error("Failed to save admissions to localStorage", e);
    }
  }, [leads, logs, trials, conversions]);

  // Funnel calculations
  const leadCount = leads.length;
  const contactedCount = leads.filter(
    (l) => l.status !== "new" && l.status !== "failed"
  ).length;
  const trialCount = trials.length;
  const convertedCount = conversions.filter((c) => c.status === "converted").length;

  // Handler: Add Lead
  function handleAddLead(newLead: Lead) {
    setLeads((prev) => [newLead, ...prev]);
    showToast(`Đã tiếp nhận Lead mới: ${newLead.studentName} vào phễu tuyển sinh!`);
  }

  // Handler: Update Lead status
  function handleUpdateLeadStatus(leadId: string, status: LeadStatus, reason?: string) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status,
              failedReason: reason || l.failedReason,
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
    showToast("Đã cập nhật trạng thái khách hàng tiềm năng.");
  }

  // Handler: Add Interaction Log
  function handleAddLog(newLog: InteractionLog, updatedLeadStatus?: string) {
    setLogs((prev) => [newLog, ...prev]);
    if (updatedLeadStatus) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === newLog.leadId
            ? { ...l, status: updatedLeadStatus as LeadStatus, updatedAt: new Date().toISOString() }
            : l
        )
      );
    }
    showToast(`Đã ghi nhận nhật ký chăm sóc cho ${newLog.leadName}!`);
  }

  // Handler: Toggle Log Completed
  function handleToggleLogCompleted(logId: string) {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId ? { ...l, isCompleted: !l.isCompleted } : l
      )
    );
  }

  // Handler: Schedule Trial
  function handleScheduleTrial(newTrial: TrialClass) {
    setTrials((prev) => [newTrial, ...prev]);
    // update lead status
    setLeads((prev) =>
      prev.map((l) =>
        l.id === newTrial.leadId
          ? { ...l, status: "trial_scheduled", updatedAt: new Date().toISOString() }
          : l
      )
    );
    showToast(`Đã xếp lịch học thử cho học sinh ${newTrial.leadName}!`);
  }

  // Handler: Save Assessment
  function handleSaveAssessment(updatedTrial: TrialClass, moveToConversion?: boolean) {
    setTrials((prev) =>
      prev.map((t) => (t.id === updatedTrial.id ? updatedTrial : t))
    );

    if (moveToConversion) {
      const existingConv = conversions.find((c) => c.leadId === updatedTrial.leadId);
      if (!existingConv) {
        const lead = leads.find((l) => l.id === updatedTrial.leadId);
        const newConv: EnrollmentConversion = {
          id: `conv-${Date.now()}`,
          leadId: updatedTrial.leadId,
          studentName: updatedTrial.leadName,
          parentName: lead?.parentName || "Phụ huynh",
          parentPhone: updatedTrial.parentPhone,
          classId: updatedTrial.classId || (classes[0]?.id || ""),
          className: updatedTrial.className,
          depositAmount: 500000,
          tuitionPackageSessions: 12,
          tuitionFee: 2400000,
          isDepositPaid: false,
          isTuitionPaid: false,
          status: "pending_deposit",
        };
        setConversions((prev) => [newConv, ...prev]);
      }
      setActiveTab("conversions");
      showToast(`Đã chuyển học sinh ${updatedTrial.leadName} sang danh sách Ghi danh & Chốt cọc!`);
    } else {
      showToast(`Đã lưu kết quả đánh giá học thử của ${updatedTrial.leadName}!`);
    }
  }

  // Handler: Move trial directly to conversion
  function handleMoveTrialToConversion(trial: TrialClass) {
    const existing = conversions.find((c) => c.leadId === trial.leadId);
    if (!existing) {
      const lead = leads.find((l) => l.id === trial.leadId);
      const newConv: EnrollmentConversion = {
        id: `conv-${Date.now()}`,
        leadId: trial.leadId,
        studentName: trial.leadName,
        parentName: lead?.parentName || "Phụ huynh",
        parentPhone: trial.parentPhone,
        classId: trial.classId || (classes[0]?.id || ""),
        className: trial.className,
        depositAmount: 500000,
        tuitionPackageSessions: 12,
        tuitionFee: 2400000,
        isDepositPaid: false,
        isTuitionPaid: false,
        status: "pending_deposit",
      };
      setConversions((prev) => [newConv, ...prev]);
    }
    setActiveTab("conversions");
    showToast(`Đã đưa ${trial.leadName} sang phễu Ghi danh & Chốt cọc!`);
  }

  // Handler: Open VietQR
  function handleOpenVietQR(data: {
    studentName: string;
    className: string;
    amount: number;
    sessionsAdded: number;
    note: string;
  }) {
    setVietQrData({
      id: `qr-${Date.now()}`,
      studentName: data.studentName,
      className: data.className,
      amount: data.amount,
      sessionsAdded: data.sessionsAdded,
      note: data.note,
    });
  }

  // Handler: Conversion Success (1-Click Convert)
  function handleConversionSuccess(conversionId: string, studentId: string) {
    setConversions((prev) =>
      prev.map((c) =>
        c.id === conversionId
          ? {
              ...c,
              status: "converted",
              isDepositPaid: true,
              convertedToStudentId: studentId,
              convertedAt: new Date().toISOString(),
            }
          : c
      )
    );

    const conv = conversions.find((c) => c.id === conversionId);
    if (conv) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === conv.leadId
            ? { ...l, status: "enrolled", updatedAt: new Date().toISOString() }
            : l
        )
      );
    }

    showToast("🎉 Chúc mừng! Đã chuyển đổi thành công học sinh vào hệ thống đào tạo chính thức!");
  }

  // Reset to default seed data
  function handleResetSeed() {
    if (confirm("Khôi phục toàn bộ dữ liệu mẫu tuyển sinh chuẩn?")) {
      setLeads(INITIAL_LEADS);
      setLogs(INITIAL_INTERACTION_LOGS);
      setTrials(INITIAL_TRIALS);
      setConversions(INITIAL_CONVERSIONS);
      localStorage.removeItem(STORAGE_KEY);
      showToast("Đã khôi phục dữ liệu mẫu chuẩn.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-700 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conversion Funnel Bar at the top */}
      <AdmissionsFunnelBar
        leadCount={leadCount}
        contactedCount={contactedCount}
        trialCount={trialCount}
        convertedCount={convertedCount}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1.5 rounded-2xl bg-muted/60 border border-border/60">
            <TabsTrigger
              value="leads"
              className="rounded-xl py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Tab 1: Khách hàng tiềm năng</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300">
                {leadCount}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="interactions"
              className="rounded-xl py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Tab 2: Tư vấn & Chăm sóc</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {logs.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="trials"
              className="rounded-xl py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Tab 3: Xếp lịch & Học thử</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300">
                {trialCount}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="conversions"
              className="rounded-xl py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Tab 4: Ghi danh & Chuyển đổi</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold">
                {conversions.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <button
            onClick={handleResetSeed}
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 self-end sm:self-auto px-2 py-1 rounded-lg hover:bg-muted/80 transition-colors"
            title="Khôi phục dữ liệu demo mẫu"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Dữ liệu mẫu</span>
          </button>
        </div>

        {/* TAB 1: Leads */}
        <TabsContent value="leads" className="mt-0 focus-visible:outline-none">
          <LeadsTab
            leads={leads}
            onOpenCreateLead={() => setIsCreateLeadOpen(true)}
            onOpenInteraction={(leadId) => {
              setSelectedLeadForLog(leadId);
              setIsLogInteractionOpen(true);
            }}
            onOpenScheduleTrial={(leadId) => {
              setSelectedLeadForTrial(leadId);
              setIsScheduleTrialOpen(true);
            }}
            onUpdateLeadStatus={handleUpdateLeadStatus}
          />
        </TabsContent>

        {/* TAB 2: Interactions & CRM Log */}
        <TabsContent value="interactions" className="mt-0 focus-visible:outline-none">
          <InteractionsTab
            logs={logs}
            onOpenNewInteraction={() => {
              setSelectedLeadForLog(undefined);
              setIsLogInteractionOpen(true);
            }}
            onToggleLogCompleted={handleToggleLogCompleted}
          />
        </TabsContent>

        {/* TAB 3: Trials & Assessments */}
        <TabsContent value="trials" className="mt-0 focus-visible:outline-none">
          <TrialsTab
            trials={trials}
            onOpenScheduleTrial={() => {
              setSelectedLeadForTrial(undefined);
              setIsScheduleTrialOpen(true);
            }}
            onOpenAssessment={(trial) => {
              setSelectedTrialForAssessment(trial);
              setIsAssessmentOpen(true);
            }}
            onMoveToConversion={handleMoveTrialToConversion}
          />
        </TabsContent>

        {/* TAB 4: Conversions */}
        <TabsContent value="conversions" className="mt-0 focus-visible:outline-none">
          <ConversionsTab
            conversions={conversions}
            onOpenConvertDialog={(conv) => {
              setSelectedConversion(conv);
              setIsConvertOpen(true);
            }}
            onOpenVietQR={handleOpenVietQR}
            onToggleDepositPaid={(convId) => {
              setConversions((prev) =>
                prev.map((c) =>
                  c.id === convId ? { ...c, isDepositPaid: !c.isDepositPaid } : c
                )
              );
              showToast("Đã cập nhật trạng thái tiền cọc.");
            }}
          />
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: Create Lead */}
      <CreateLeadDialog
        isOpen={isCreateLeadOpen}
        onClose={() => setIsCreateLeadOpen(false)}
        onAddLead={handleAddLead}
      />

      {/* DIALOG 2: Log Interaction */}
      <LogInteractionDialog
        isOpen={isLogInteractionOpen}
        onClose={() => setIsLogInteractionOpen(false)}
        leads={leads}
        defaultLeadId={selectedLeadForLog}
        onAddLog={handleAddLog}
      />

      {/* DIALOG 3: Schedule Trial */}
      <ScheduleTrialDialog
        isOpen={isScheduleTrialOpen}
        onClose={() => setIsScheduleTrialOpen(false)}
        leads={leads}
        classes={classes}
        teachers={teachers}
        defaultLeadId={selectedLeadForTrial}
        onScheduleTrial={handleScheduleTrial}
      />

      {/* DIALOG 4: Assessment */}
      <AssessmentDialog
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        trial={selectedTrialForAssessment}
        onSaveAssessment={handleSaveAssessment}
      />

      {/* DIALOG 5: Convert Student */}
      <ConvertStudentDialog
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        conversion={selectedConversion}
        classes={classes}
        onOpenVietQR={handleOpenVietQR}
        onConversionSuccess={handleConversionSuccess}
      />

      {/* VietQR Modal */}
      <VietQRModal
        isOpen={!!vietQrData}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />
    </div>
  );
}
