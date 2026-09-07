"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Sparkles,
  XCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ExternalLink,
  ChevronRight,
  Calendar,
  Clock,
  X,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead, LeadSource, LeadStatus, InteractionLog } from "@/types/admissions";

/* ──────────────────────────────────────────────
   Audit log entry (chỉ lưu trong phiên hiện tại)
────────────────────────────────────────────── */
interface AuditEntry {
  leadId: string;
  leadName: string;
  phone: string;
  revealedAt: string; // ISO timestamp
  staff: string;
}

/* ─── Source / Status badge configs ─── */
const SOURCE_BADGES: Record<LeadSource, { label: string; className: string }> = {
  facebook_ads: { label: "Facebook Ads", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  fanpage: { label: "Fanpage nhắn tin", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30" },
  zalo: { label: "Zalo OA", className: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30" },
  referral: { label: "Người quen giới thiệu", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold" },
  walkin: { label: "Vãng lai / Tờ rơi", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  hotline: { label: "Hotline / Web", className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" },
  other: { label: "Nguồn khác", className: "bg-muted text-muted-foreground border-border" },
};

const STATUS_BADGES: Record<LeadStatus, { label: string; className: string; icon: string }> = {
  new: { label: "Mới tiếp nhận", className: "bg-blue-500 text-white font-bold", icon: "🆕" },
  contacted: { label: "Đang chăm sóc", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold", icon: "📞" },
  callback: { label: "Hẹn gọi lại", className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold", icon: "🕐" },
  no_answer: { label: "Không nghe máy", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30", icon: "📵" },
  trial_scheduled: { label: "Đã hẹn học thử", className: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 font-bold", icon: "🗓️" },
  enrolled: { label: "Đã ghi danh", className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold", icon: "✅" },
  failed: { label: "Thất bại / Không học", className: "bg-muted text-muted-foreground border-border", icon: "❌" },
};

/* ─── Phone masking helper ─── */
function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  const cleaned = phone.replace(/\s+/g, "");
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-3);
  return `${start} ••• ${end}`;
}

/* ─── Masked phone cell component ─── */
function PhoneCell({
  phone,
  leadId,
  leadName,
  onReveal,
  isRevealed,
}: {
  phone: string;
  leadId: string;
  leadName: string;
  onReveal: (leadId: string, phone: string, leadName: string) => void;
  isRevealed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {isRevealed ? (
        <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
          <span className="font-mono text-xs font-extrabold text-foreground tracking-wide bg-muted/60 px-2 py-1 rounded-md border border-border/70">
            {phone}
          </span>
          <a
            href={`tel:${phone}`}
            onClick={(e) => e.stopPropagation()}
            title="Bấm để gọi trực tiếp"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <Phone className="w-2.5 h-2.5" /> Gọi
          </a>
          <a
            href={`https://zalo.me/${phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Mở chat Zalo với phụ huynh"
            className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded-md shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-2.5 h-2.5" /> Zalo
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-muted-foreground tracking-widest font-semibold bg-muted/40 px-2 py-1 rounded-md border border-border/40">
            {maskPhone(phone)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReveal(leadId, phone, leadName);
            }}
            title="Nhấn để giải mã số điện thoại (Hệ thống ghi vết Audit Log tự động)"
            className="group/btn flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md px-2 py-1 transition-all duration-150 shadow-xs hover:border-amber-500"
          >
            <Lock className="w-3 h-3 text-amber-500 group-hover/btn:hidden" />
            <Eye className="w-3 h-3 text-amber-600 hidden group-hover/btn:inline" />
            <span>Mở xem</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Audit Log Modal ─── */
function AuditLogModal({
  isOpen,
  onClose,
  auditLogs,
}: {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditEntry[];
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Nhật Ký Kiểm Toán Xem Số Điện Thoại (Audit Log)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Hệ thống tự động ghi vết nhân viên giải mã dữ liệu để chống tuồn data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              Chưa có thao tác giải mã số điện thoại nào trong phiên làm việc này.
            </div>
          ) : (
            auditLogs.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span>{entry.leadName}</span>
                    <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">
                      {entry.phone}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Nhân viên: <strong className="text-foreground">{entry.staff}</strong>
                  </div>
                </div>
                <div className="text-right text-[10px] text-muted-foreground font-mono">
                  {new Date(entry.revealedAt).toLocaleTimeString("vi-VN")}
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Ghi vết an toàn
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border/60 bg-muted/20 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs h-8">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Lead Drawer (bên phải) ─── */
function LeadDrawer({
  lead,
  logs,
  isOpen,
  onClose,
  onOpenInteraction,
  onOpenScheduleTrial,
  onUpdateLeadStatus,
  onQuickSaveNote,
}: {
  lead: Lead | null;
  logs: InteractionLog[];
  isOpen: boolean;
  onClose: () => void;
  onOpenInteraction: (leadId: string) => void;
  onOpenScheduleTrial: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => void;
  onQuickSaveNote: (leadId: string, content: string, reminderAt?: string) => void;
}) {
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const [quickSaved, setQuickSaved] = useState(false);

  if (!lead) return null;

  const leadLogs = logs.filter((l) => l.leadId === lead.id);
  const statusBadge = STATUS_BADGES[lead.status] || STATUS_BADGES.new;

  function handleMarkFailed() {
    const reason = prompt(
      `Nhập lý do chưa chốt được cho học sinh "${lead!.studentName}":`,
      "Trùng lịch / Học phí cao / Đã học nơi khác"
    );
    if (reason !== null) {
      onUpdateLeadStatus(lead!.id, "failed", reason || "Không nêu lý do");
      onClose();
    }
  }

  function handleSaveQuickNote() {
    if (!callbackNote.trim()) {
      alert("Vui lòng nhập ghi chú phản hồi của phụ huynh!");
      return;
    }
    onQuickSaveNote(lead!.id, callbackNote.trim(), callbackDate || undefined);
    setQuickSaved(true);
    setCallbackNote("");
    setCallbackDate("");
    setTimeout(() => setQuickSaved(false), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] z-50 bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between p-5 border-b border-border bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{statusBadge.icon}</span>
              <h3 className="font-extrabold text-foreground text-base tracking-tight">
                {lead.studentName}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Phụ huynh: <strong className="text-foreground">{lead.parentName}</strong>
              {" • "}
              Tư vấn: <span className="text-primary font-semibold">{lead.assignedStaff}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lead Info Grid */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/60">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Thông tin chi tiết Lead
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] mb-0.5">Môn học quan tâm</span>
                <span className="font-extrabold text-foreground">{lead.targetSubject}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] mb-0.5">Mục tiêu học tập</span>
                <span className="font-semibold text-foreground">{lead.targetGoal}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] mb-0.5">Nguồn tiếp nhận</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 ${SOURCE_BADGES[lead.source]?.className || ""}`}
                >
                  {SOURCE_BADGES[lead.source]?.label || "Khác"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] mb-0.5">Trạng thái hiện tại</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </Badge>
              </div>
            </div>
            {lead.notes && (
              <div className="pt-2 border-t border-border/40 text-xs text-foreground">
                <span className="text-muted-foreground font-semibold">Nhu cầu ban đầu: </span>
                {lead.notes}
              </div>
            )}
          </div>

          {/* Quick Callback & Notes (Chăm sóc nhanh) */}
          <div className="space-y-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Chăm sóc nhanh & Đặt hẹn gọi lại
              </h4>
              <span className="text-[10px] text-muted-foreground">Lưu 1 chạm</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                  Thời gian hẹn gọi lại:
                </label>
                <input
                  type="datetime-local"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                  Ghi chú phản hồi phụ huynh / Lý do từ chối:
                </label>
                <textarea
                  placeholder="VD: Phụ huynh đang bận đi làm, hẹn 19h30 tối nay gọi lại để chốt lịch thử Toán..."
                  value={callbackNote}
                  onChange={(e) => setCallbackNote(e.target.value)}
                  className="w-full h-20 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveQuickNote}
                  className={`flex-1 h-8 text-xs font-bold gap-1.5 transition-all ${
                    quickSaved
                      ? "bg-emerald-600 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {quickSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu ghi chú & lịch hẹn!
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" /> Lưu nhanh nhật ký
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenInteraction(lead.id);
                    onClose();
                  }}
                  className="h-8 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="w-3 h-3" /> Chi tiết
                </Button>
              </div>
            </div>
          </div>

          {/* Interaction History */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Lịch sử tương tác ({leadLogs.length} lần)
            </h4>
            {leadLogs.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic p-3 bg-muted/30 rounded-lg border border-border/40">
                Chưa có ghi chép tư vấn nào. Sử dụng khung phía trên để ghi nhận cuộc gọi đầu tiên!
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {leadLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{log.staffName}</span>
                      <span className="text-muted-foreground text-[10px]">{log.date}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{log.content}</p>
                    {log.reminderAt && (
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-[10px]">
                        <Calendar className="w-3 h-3" />
                        Hẹn gọi lại: {log.reminderAt}
                        {log.isCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer — Action CTA */}
        <div className="border-t border-border p-4 space-y-2 bg-muted/20">
          {lead.status !== "enrolled" && lead.status !== "failed" && (
            <Button
              className="w-full h-10 font-extrabold gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 text-xs hover:-translate-y-0.5 transition-all"
              onClick={() => {
                onOpenScheduleTrial(lead.id);
                onClose();
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Chuyển sang Học thử (Bước 2)
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          )}

          {lead.status !== "failed" && lead.status !== "enrolled" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkFailed}
              className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Đánh dấu chưa phù hợp / Không học
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main LeadsTab Component ─── */
interface LeadsTabProps {
  leads: Lead[];
  logs: InteractionLog[];
  onOpenCreateLead: () => void;
  onOpenInteraction: (leadId: string) => void;
  onOpenScheduleTrial: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => void;
  onAddLog?: (newLog: InteractionLog, updatedLeadStatus?: string) => void;
}

export function LeadsTab({
  leads,
  logs,
  onOpenCreateLead,
  onOpenInteraction,
  onOpenScheduleTrial,
  onUpdateLeadStatus,
  onAddLog,
}: LeadsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Revealed phones (audit log)
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Drawer state
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function handleRevealPhone(leadId: string, phone: string, leadName: string) {
    setRevealedPhones((prev) => new Set(prev).add(leadId));
    const entry: AuditEntry = {
      leadId,
      leadName,
      phone,
      revealedAt: new Date().toISOString(),
      staff: "Tư vấn viên (Ca trực)",
    };
    setAuditLogs((prev) => [entry, ...prev]);
  }

  function handleRowClick(lead: Lead) {
    setDrawerLead(lead);
    setIsDrawerOpen(true);
  }

  function handleQuickSaveNote(leadId: string, content: string, reminderAt?: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (onAddLog) {
      const newLog: InteractionLog = {
        id: `log-${Date.now()}`,
        leadId,
        leadName: lead.studentName,
        parentPhone: lead.parentPhone,
        staffName: lead.assignedStaff || "Tư vấn viên",
        channel: "call",
        sentiment: "need_consult",
        content,
        nextAction: reminderAt ? `Gọi lại tư vấn lúc ${reminderAt}` : "Tiếp tục chăm sóc",
        date: new Date().toLocaleDateString("vi-VN"),
        reminderAt,
        isCompleted: false,
      };
      onAddLog(newLog, reminderAt ? "callback" : "contacted");
    } else {
      onUpdateLeadStatus(leadId, reminderAt ? "callback" : "contacted");
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !searchTerm ||
        l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentPhone.includes(searchTerm) ||
        l.targetSubject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSource = sourceFilter === "all" || l.source === sourceFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;

      return matchSearch && matchSource && matchStatus;
    });
  }, [leads, searchTerm, sourceFilter, statusFilter]);

  // Counts for summary
  const newCount = leads.filter((l) => l.status === "new").length;
  const callbackCount = leads.filter((l) => l.status === "callback").length;
  const noAnswerCount = leads.filter((l) => l.status === "no_answer").length;

  return (
    <>
      <div className="space-y-4">
        {/* Quick Stats Row - Directly under Funnel Bar */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "new" ? "all" : "new")}
            title="Bấm để lọc danh sách: Mới tiếp nhận"
            className={`p-3.5 sm:p-4 rounded-2xl text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${
              statusFilter === "new"
                ? "bg-blue-500/20 border-2 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                : "bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/15"
            }`}
          >
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {newCount}
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wide mt-1 flex items-center justify-center gap-1.5">
              <span>🆕</span>
              <span>Mới tiếp nhận</span>
            </div>
            {statusFilter === "new" && (
              <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "callback" ? "all" : "callback")}
            title="Bấm để lọc danh sách: Hẹn gọi lại"
            className={`p-3.5 sm:p-4 rounded-2xl text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${
              statusFilter === "callback"
                ? "bg-purple-500/20 border-2 border-purple-500 ring-2 ring-purple-500/20 shadow-md"
                : "bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/15"
            }`}
          >
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {callbackCount}
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wide mt-1 flex items-center justify-center gap-1.5">
              <span>🕐</span>
              <span>Hẹn gọi lại</span>
            </div>
            {statusFilter === "callback" && (
              <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "no_answer" ? "all" : "no_answer")}
            title="Bấm để lọc danh sách: Không nghe máy"
            className={`p-3.5 sm:p-4 rounded-2xl text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${
              statusFilter === "no_answer"
                ? "bg-rose-500/20 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-md"
                : "bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/15"
            }`}
          >
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {noAnswerCount}
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wide mt-1 flex items-center justify-center gap-1.5">
              <span>📵</span>
              <span>Không nghe máy</span>
            </div>
            {statusFilter === "no_answer" && (
              <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên bé, phụ huynh, SĐT, môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Tất cả nguồn Lead</option>
              <option value="facebook_ads">Facebook Ads</option>
              <option value="fanpage">Fanpage tin nhắn</option>
              <option value="zalo">Zalo OA</option>
              <option value="referral">Người quen giới thiệu</option>
              <option value="walkin">Vãng lai / Tờ rơi</option>
              <option value="hotline">Hotline / Website</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="new">🆕 Mới tiếp nhận</option>
              <option value="contacted">📞 Đang chăm sóc</option>
              <option value="callback">🕐 Hẹn gọi lại</option>
              <option value="no_answer">📵 Không nghe máy</option>
              <option value="trial_scheduled">🗓️ Đã hẹn học thử</option>
              <option value="enrolled">✅ Đã ghi danh</option>
              <option value="failed">❌ Thất bại</option>
            </select>
          </div>

          <Button
            onClick={onOpenCreateLead}
            size="sm"
            className="font-extrabold gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 text-xs h-9 px-4"
          >
            <Plus className="w-4 h-4" />
            Tiếp nhận Lead mới
          </Button>
        </div>

        {/* Security notice & Audit Log link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Bảo mật SĐT & Zalo:</strong> Mặc định che số. Nhấp xem để gọi/nhắn Zalo, hệ thống tự động ghi vết Audit Log ngăn rò rỉ dữ liệu.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-white flex items-center gap-1 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            Xem Audit Log ({auditLogs.length} lần mở)
          </button>
        </div>

        {/* Leads Table */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  Học sinh & Phụ huynh
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  SĐT / Zalo <Lock className="inline w-3 h-3 ml-1 text-amber-500" />
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  Nguồn & Môn quan tâm
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  Trạng thái Lead
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5 text-right">
                  Hành động chuyển đổi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground text-xs"
                  >
                    Không tìm thấy Lead nào phù hợp. Thử điều chỉnh bộ lọc tìm kiếm.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const sourceBadge =
                    SOURCE_BADGES[lead.source] || SOURCE_BADGES.other;
                  const statusBadge =
                    STATUS_BADGES[lead.status] || STATUS_BADGES.new;
                  const isRevealed = revealedPhones.has(lead.id);

                  return (
                    <TableRow
                      key={lead.id}
                      className="group hover:bg-blue-500/5 transition-all duration-150 cursor-pointer"
                      onClick={() => handleRowClick(lead)}
                    >
                      {/* Học sinh & Phụ huynh */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground text-xs group-hover:text-primary transition-colors">
                            {lead.studentName}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            PH: <strong className="text-foreground font-semibold">{lead.parentName}</strong>
                          </span>
                        </div>
                      </TableCell>

                      {/* SĐT ẩn/hiện thông minh */}
                      <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                        <PhoneCell
                          phone={lead.parentPhone}
                          leadId={lead.id}
                          leadName={lead.studentName}
                          onReveal={handleRevealPhone}
                          isRevealed={isRevealed}
                        />
                      </TableCell>

                      {/* Nguồn & Môn quan tâm */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`w-fit text-[10px] font-bold px-2 py-0.5 ${sourceBadge.className}`}
                          >
                            {sourceBadge.label}
                          </Badge>
                          <span className="text-xs font-bold text-foreground">
                            {lead.targetSubject}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {lead.targetGoal}
                          </span>
                        </div>
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`w-fit text-[10px] px-2 py-0.5 font-bold ${statusBadge.className}`}
                        >
                          {statusBadge.icon} {statusBadge.label}
                        </Badge>
                        {lead.failedReason && (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 italic mt-1">
                            {lead.failedReason}
                          </p>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        className="py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {lead.status !== "enrolled" &&
                            lead.status !== "failed" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenScheduleTrial(lead.id);
                                }}
                                className="h-8 text-xs px-3 gap-1.5 font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs hover:shadow-md hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Chuyển sang Học thử</span>
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(lead);
                            }}
                            className="h-8 w-8 p-0 hover:border-primary hover:text-primary"
                            title="Mở thanh chăm sóc Lead"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total count */}
        <p className="text-[11px] text-muted-foreground px-1">
          Hiển thị <strong>{filteredLeads.length}</strong> / {leads.length} khách hàng tiềm năng
        </p>
      </div>

      {/* Lead Drawer */}
      <LeadDrawer
        lead={drawerLead}
        logs={logs}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenInteraction={onOpenInteraction}
        onOpenScheduleTrial={onOpenScheduleTrial}
        onUpdateLeadStatus={onUpdateLeadStatus}
        onQuickSaveNote={handleQuickSaveNote}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
      />
    </>
  );
}
