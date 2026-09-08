"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  X,
} from "lucide-react";
import { AdmissionsFunnelBar } from "@/components/admissions/admissions-funnel-bar";
import { LeadsTab } from "@/components/admissions/leads-tab";
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
  TrialStatus,
  normalizeLeadStatus,
} from "@/types/admissions";

const STORAGE_KEY = "educenter_admissions_data_v5";

interface AdmissionsClientProps {
  classes: any[];
  teachers: any[];
}

export function AdmissionsClient({ classes, teachers }: AdmissionsClientProps) {
  const [activeTab, setActiveTab] = useState("leads");
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const [transitionDirection, setTransitionDirection] = useState<"left" | "right">("right");

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

  // Smooth directional tab transition
  function handleTabChange(tab: string) {
    if (tab === activeTab) return;
    const order = ["leads", "trials", "conversions"];
    const prevIdx = order.indexOf(activeTab);
    const nextIdx = order.indexOf(tab);
    setTransitionDirection(nextIdx > prevIdx ? "right" : "left");
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabTransitioning(false);
    }, 150);
  }

  // Load from localStorage on mount & normalize statuses
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.leads && Array.isArray(parsed.leads)) {
          setLeads(parsed.leads.map((l: any) => ({ ...l, status: normalizeLeadStatus(l.status) })));
        }
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

  // ─── Funnel metrics ───
  const leadCount = leads.length;
  const trialCount = trials.length;
  const convertedCount = conversions.filter((c) => c.status === "converted").length;

  // "Pending" = chờ xử lý tại từng bước
  const pendingLeads = useMemo(
    () => leads.filter((l) => normalizeLeadStatus(l.status) === "new").length,
    [leads]
  );
  const pendingTrials = useMemo(
    () => trials.filter((t) => t.status === "scheduled").length,
    [trials]
  );
  const pendingConversions = useMemo(
    () => conversions.filter((c) => c.status !== "converted" && c.status !== "cancelled").length,
    [conversions]
  );

  // ─── Handlers ───
  function handleAddLead(newLead: Lead) {
    setLeads((prev) => [newLead, ...prev]);
    showToast(`✅ Đã tiếp nhận Lead mới: ${newLead.studentName} vào phễu tuyển sinh!`);
  }

  function handleUpdateLeadStatus(leadId: string, status: LeadStatus, reason?: string) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status, failedReason: reason || l.failedReason, updatedAt: new Date().toISOString() }
          : l
      )
    );
    showToast("Đã cập nhật trạng thái khách hàng tiềm năng.");
  }

  function handleAddLog(newLog: InteractionLog, updatedLeadStatus?: string) {
    setLogs((prev) => [newLog, ...prev]);
    if (updatedLeadStatus) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === newLog.leadId
            ? {
                ...l,
                status: updatedLeadStatus as LeadStatus,
                callbackTime: updatedLeadStatus === "contacted" ? undefined : (newLog.reminderAt || l.callbackTime),
                updatedAt: new Date().toISOString(),
              }
            : l
        )
      );
    }
    if (updatedLeadStatus === "contacted") {
      showToast("Đã cập nhật ghi chú và chuyển sang trạng thái Đang chăm sóc!");
    } else {
      showToast(`✅ Đã ghi nhận nhật ký chăm sóc cho ${newLog.leadName}!`);
    }
  }

  function handleToggleLogCompleted(logId: string) {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, isCompleted: !l.isCompleted } : l))
    );
  }

  function handleMoveLeadToTrial(leadId: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const newTrial: TrialClass = {
      id: `trial-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.studentName,
      parentPhone: lead.parentPhone,
      targetSubject: lead.targetSubject,
      className: `${lead.targetSubject} (Chưa xếp lớp)`,
      teacherName: "Chưa phân công",
      trialDate: "Chờ xếp lịch",
      startTime: "--:--",
      endTime: "--:--",
      status: "scheduled", // Trạng thái mặc định: Chờ xếp lịch
      parentFeedback: lead.notes
        ? `[Nguồn: ${lead.source}] PH: ${lead.parentName} • Ghi chú: ${lead.notes}`
        : `[Nguồn: ${lead.source}] PH: ${lead.parentName}`,
    };

    // 1. Tự động xóa/lọc học sinh này khỏi bảng Tab 1 ("Khách hàng tiềm năng")
    setLeads((prev) => prev.filter((l) => l.id !== leadId));

    // 2. Xuất hiện ngay bên bảng Tab 2 ("Xếp lịch học thử")
    setTrials((prev) => [newTrial, ...prev]);

    // 3. Hiển thị Toast thông báo thành công
    showToast("Đã chuyển học sinh sang danh sách Xếp lịch học thử!");

    // 4. Tự động chuyển màn hình sang Quy trình 2 (Tab 2: Xếp lịch học thử)
    setTimeout(() => handleTabChange("trials"), 250);
  }

  function handleScheduleTrial(newTrial: TrialClass) {
    setTrials((prev) => [newTrial, ...prev]);
    setLeads((prev) => prev.filter((l) => l.id !== newTrial.leadId));
    showToast("Đã chuyển học sinh sang danh sách Xếp lịch học thử!");
    // Auto-switch to trials tab
    setTimeout(() => handleTabChange("trials"), 400);
  }

  function handleUpdateTrialStatus(trialId: string, status: TrialStatus) {
    setTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, status } : t))
    );
    showToast("Đã cập nhật trạng thái buổi học thử.");
  }

  function handleSaveAssessment(updatedTrial: TrialClass) {
    setTrials((prev) =>
      prev.map((t) => (t.id === updatedTrial.id ? updatedTrial : t))
    );
    showToast(`📝 Đã lưu kết quả đánh giá học thử của ${updatedTrial.leadName}!`);
  }

  function handleMoveTrialToConversion(trial: TrialClass) {
    const existing = conversions.find((c) => c.leadId === trial.leadId);

    const subjectsChoices =
      trial.trialRegistrations && trial.trialRegistrations.length > 0
        ? trial.trialRegistrations.map((r) => ({
            trialClassId: r.trialClassId,
            className: r.className,
            testScore: r.testScore,
            tuitionFee: r.className.includes("Toán") ? 2400000 : r.className.includes("Tiếng Anh") ? 1800000 : 2000000,
            isSelected: true,
          }))
        : [
            {
              trialClassId: trial.trialClassId || "class-toan-9",
              className: trial.className,
              testScore: trial.testScore,
              tuitionFee: 2400000,
              isSelected: true,
            },
          ];

    const totalFee = subjectsChoices.reduce((sum, s) => sum + s.tuitionFee, 0);

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
        subjects: subjectsChoices,
        depositAmount: 500000,
        tuitionPackageSessions: 12,
        tuitionFee: totalFee,
        isDepositPaid: false,
        isTuitionPaid: false,
        status: "pending_deposit",
      };
      setConversions((prev) => [newConv, ...prev]);
    } else {
      setConversions((prev) =>
        prev.map((c) =>
          c.leadId === trial.leadId
            ? { ...c, subjects: subjectsChoices, tuitionFee: totalFee }
            : c
        )
      );
    }
    showToast(`🎯 Đã đưa ${trial.leadName} sang phễu Ghi danh & Thu phí!`);
    // Làm sạch hàng chờ tại Tab 2 (xóa/ẩn khỏi bảng Tab 2, sĩ số lịch sử của lớp vẫn được bảo toàn)
    setTrials((prev) => prev.filter((t) => t.id !== trial.id));
    setTimeout(() => handleTabChange("conversions"), 400);
  }

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

  function handleConversionSuccess(conversionId: string, studentId: string) {
    setConversions((prev) =>
      prev.map((c) =>
        c.id === conversionId
          ? { ...c, status: "converted", isDepositPaid: true, convertedToStudentId: studentId, convertedAt: new Date().toISOString() }
          : c
      )
    );
    const conv = conversions.find((c) => c.id === conversionId);
    if (conv) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === conv.leadId
            ? { ...l, status: "contacted", updatedAt: new Date().toISOString() }
            : l
        )
      );
    }
    showToast("🎉 Thanh toán thành công! Đã tự động tạo hồ sơ học viên, hóa đơn và ghi danh vào lớp.");
  }

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

  function handleUpdateLead(updatedLead: Lead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    showToast("Đã cập nhật thông tin khách hàng thành công!");
  }

  function handleDeleteLead(leadId: string) {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    showToast("Đã xóa khách hàng thành công!");
  }

  function handleDeleteTrial(trialId: string) {
    setTrials((prev) => prev.filter((t) => t.id !== trialId));
    showToast("Đã xóa học sinh khỏi danh sách học thử thành công!");
  }

  return (
    <div className="space-y-6">
      {/* ─── Toast Notification ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-foreground text-background font-semibold text-sm rounded-xl shadow-2xl border border-border/40 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── 3-Step Funnel Bar ─── */}
      <AdmissionsFunnelBar
        leadCount={leadCount}
        trialCount={trialCount}
        convertedCount={convertedCount}
        pendingLeads={pendingLeads}
        pendingTrials={pendingTrials}
        pendingConversions={pendingConversions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* ─── Tab Content with smooth directional slide transition ─── */}
      <div
        className={`transition-all duration-200 ease-out transform ${
          isTabTransitioning
            ? transitionDirection === "right"
              ? "opacity-0 translate-x-6"
              : "opacity-0 -translate-x-6"
            : "opacity-100 translate-x-0"
        }`}
      >
        {activeTab === "leads" && (
          <LeadsTab
            leads={leads}
            logs={logs}
            onOpenCreateLead={() => setIsCreateLeadOpen(true)}
            onOpenInteraction={(leadId) => {
              setSelectedLeadForLog(leadId);
              setIsLogInteractionOpen(true);
            }}
            onOpenScheduleTrial={(leadId) => {
              handleMoveLeadToTrial(leadId);
            }}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onAddLog={handleAddLog}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        )}

        {activeTab === "trials" && (
          <TrialsTab
            trials={trials}
            leads={leads}
            onOpenScheduleTrial={() => {
              setSelectedLeadForTrial(undefined);
              setIsScheduleTrialOpen(true);
            }}
            onOpenAssessment={(trial) => {
              setSelectedTrialForAssessment(trial);
              setIsAssessmentOpen(true);
            }}
            onMoveToConversion={handleMoveTrialToConversion}
            onUpdateTrialStatus={handleUpdateTrialStatus}
            onSaveAssessment={handleSaveAssessment}
            onDeleteTrial={handleDeleteTrial}
          />
        )}

        {activeTab === "conversions" && (
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
        )}
      </div>

      {/* ─── Dialogs ─── */}
      <CreateLeadDialog
        isOpen={isCreateLeadOpen}
        onClose={() => setIsCreateLeadOpen(false)}
        onAddLead={handleAddLead}
      />

      <LogInteractionDialog
        isOpen={isLogInteractionOpen}
        onClose={() => setIsLogInteractionOpen(false)}
        leads={leads}
        defaultLeadId={selectedLeadForLog}
        onAddLog={handleAddLog}
      />

      <ScheduleTrialDialog
        isOpen={isScheduleTrialOpen}
        onClose={() => setIsScheduleTrialOpen(false)}
        leads={leads}
        classes={classes}
        teachers={teachers}
        trials={trials}
        defaultLeadId={selectedLeadForTrial}
        onScheduleTrial={handleScheduleTrial}
      />

      <AssessmentDialog
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        trial={selectedTrialForAssessment}
        onSaveAssessment={(updatedTrial, moveToConversion) => {
          handleSaveAssessment(updatedTrial);
          if (moveToConversion) handleMoveTrialToConversion(updatedTrial);
        }}
      />

      <ConvertStudentDialog
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        conversion={selectedConversion}
        classes={classes}
        onOpenVietQR={handleOpenVietQR}
        onConversionSuccess={handleConversionSuccess}
      />

      <VietQRModal
        isOpen={!!vietQrData}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />
    </div>
  );
}
