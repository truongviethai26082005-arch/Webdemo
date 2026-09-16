"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Sparkles,
  XCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  Clock,
  X,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent, PopoverArrow } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead, LeadSource, LeadStatus, InteractionLog, normalizeLeadStatus } from "@/types/admissions";

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
  new: { label: "Mới tiếp nhận", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold", icon: "🆕" },
  contacted: { label: "Đang chăm sóc", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold", icon: "📞" },
  callback: { label: "Hẹn gọi lại", className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold", icon: "🕐" },
  no_demand: { label: "Không có nhu cầu", className: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 font-bold", icon: "⬛" },
  converted: { label: "Đã ghi danh", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold", icon: "🎓" },
  ready_to_enroll: { label: "Chờ ghi danh", className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold", icon: "⭐" },
};

/* ─── Branded Icons ─── */
function ZaloIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0068FF" />
      <path
        d="M13 16h22l-14 16h14"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessengerIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0084FF" />
          <stop offset="50%" stopColor="#9B30FF" />
          <stop offset="100%" stopColor="#FF4D4D" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C6.477 2 2 6.145 2 11.258c0 2.912 1.455 5.512 3.734 7.222-.055 1.14-.378 2.984-.962 4.094-.132.25.146.52.378.36 1.487-1.026 3.193-2.227 3.99-2.775.91.25 1.867.387 2.86.387 5.523 0 10-4.145 10-9.288C22 6.145 17.523 2 12 2z"
        fill="url(#msgGrad)"
      />
      <path
        d="M6.8 13.6l3.6-3.8 2.3 2.3 4.5-4.5-3.6 3.8-2.3-2.3-4.5 4.5z"
        fill="white"
      />
    </svg>
  );
}

/* ─── Quick Link Helpers ─── */
function getZaloUrl(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://zalo.me/${clean}`;
}

function getMessengerUrl(messengerField?: string): string | null {
  if (!messengerField) return null;
  const raw = messengerField.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  if (raw.startsWith("m.me/") || raw.startsWith("facebook.com/")) {
    return `https://${raw}`;
  }
  return `https://m.me/${raw.replace(/^@/, "")}`;
}

/* ─── 100% Phone & Quick Actions Cell (với Popover ghi nhận kết quả cuộc gọi neo tại chỗ) ─── */
function ContactCell({
  lead,
  onOpenMessengerPrompt,
  onConnected,
  onMissedCall,
  onNoDemand,
}: {
  lead: Lead;
  onOpenMessengerPrompt: (lead: Lead) => void;
  onConnected: (lead: Lead, note?: string) => void;
  onMissedCall: (lead: Lead, note?: string) => void;
  onNoDemand: (lead: Lead, note?: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quickNote, setQuickNote] = useState("");
  const phone = lead.parentPhone;
  const cleanPhone = phone.replace(/\D/g, "");
  const zaloUrl = getZaloUrl(phone);
  const messengerUrl = getMessengerUrl(lead.parentMessenger);

  const currentMissed = lead.missedCallsCount || 0;
  const nextMissed = currentMissed + 1;

  function handleTriggerCall(e: React.MouseEvent) {
    e.stopPropagation();
    // Kích hoạt cuộc gọi qua tel:
    window.location.href = `tel:${cleanPhone}`;
    // Mở Popover neo tại nút bấm
    setQuickNote("");
    setIsOpen(true);
  }

  function handleSelectConnected(e: React.MouseEvent) {
    e.stopPropagation();
    onConnected(lead, quickNote.trim());
    setIsOpen(false);
  }

  function handleSelectMissed(e: React.MouseEvent) {
    e.stopPropagation();
    onMissedCall(lead, quickNote.trim());
    setIsOpen(false);
  }

  function handleSelectNoDemand(e: React.MouseEvent) {
    e.stopPropagation();
    onNoDemand(lead, quickNote.trim());
    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* Popover neo tại chỗ vào Nút Số điện thoại & Icon gọi */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-1.5">
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={handleTriggerCall}
              title={`Bấm để gọi điện tới ${phone} & mở bảng ghi nhận kết quả cuộc gọi`}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-black text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:border-emerald-500/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs select-all active:scale-95"
            >
              <span>{phone}</span>
            </button>
          </PopoverTrigger>

          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={handleTriggerCall}
              title={`Bấm để gọi điện tới ${phone} & mở bảng ghi nhận kết quả cuộc gọi`}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all hover:scale-110 active:scale-95 shadow-2xs cursor-pointer"
            >
              <Phone className="w-3 h-3" />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="w-[330px] sm:w-[350px] p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-card shadow-xl z-50 animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <PopoverArrow className="fill-white dark:fill-card" />

          {/* Dòng tiêu đề nhỏ */}
          <div className="flex items-start justify-between pb-2 mb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">📞</span>
              <div className="leading-snug">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Ghi nhận kết quả gọi cho:
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[230px]">
                  {lead.studentName} <span className="font-normal text-muted-foreground text-[11px]">(PH: {lead.parentName})</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ô ghi chú ngắn */}
          <div className="mb-2.5">
            <Input
              type="text"
              placeholder="Ghi chú nhanh cuộc gọi..."
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="h-8 text-xs bg-muted/40 border-border/80 focus:bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSelectConnected(e as any);
                }
              }}
            />
          </div>

          {/* 3 nút bấm kết quả (dạng list 1-chạm) */}
          <div className="space-y-1.5">
            {/* 1: Đã nghe máy & Trao đổi */}
            <button
              type="button"
              onClick={handleSelectConnected}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 transition-all font-bold text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">✅</span>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs">
                    Đã nghe máy & Trao đổi
                  </div>
                  <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-normal">
                    ➔ Chuyển sang "Đang chăm sóc"
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 2: Không nghe máy / Bận */}
            <button
              type="button"
              onClick={handleSelectMissed}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-900 dark:text-purple-200 transition-all font-bold text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📵</span>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-purple-800 dark:text-purple-300 text-xs">
                    Không nghe máy / Bận
                  </div>
                  <div className="text-[10px] text-purple-700/80 dark:text-purple-400 font-normal">
                    {nextMissed < 3
                      ? `Tăng gọi nhỡ (Lần ${nextMissed}) ➔ Chuyển "Hẹn gọi lại"`
                      : `Gọi nhỡ lần 3 ➔ Đóng lead "Không có nhu cầu"`}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 3: Không nhu cầu / Chặn số */}
            <button
              type="button"
              onClick={handleSelectNoDemand}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 text-slate-800 dark:text-slate-200 transition-all font-bold text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🚫</span>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                    Không nhu cầu / Chặn số
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">
                    ➔ Chuyển sang "Không có nhu cầu"
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* 2 Quick Interaction Buttons: Zalo & Messenger */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Nút Zalo */}
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`Mở chat Zalo với phụ huynh ${lead.parentName} (${phone})`}
          className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-[#0068FF]/10 text-[#0068FF] dark:text-sky-300 dark:bg-[#0068FF]/20 hover:bg-[#0068FF] hover:text-white dark:hover:bg-[#0068FF] dark:hover:text-white border border-[#0068FF]/30 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ZaloIcon className="w-3 h-3 shrink-0" />
          <span>Zalo</span>
        </a>

        {/* Nút Messenger */}
        {messengerUrl ? (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Mở chat Messenger với phụ huynh ${lead.parentName}`}
            className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-[#0084FF]/10 via-[#9B30FF]/10 to-[#FF4D4D]/10 text-[#0084FF] dark:text-purple-300 hover:from-[#0084FF] hover:to-[#A033FF] hover:text-white dark:hover:text-white border border-[#0084FF]/30 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <MessengerIcon className="w-3 h-3 shrink-0" />
            <span>Messenger</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMessengerPrompt(lead);
            }}
            title="Nhấn để liên kết link Messenger của phụ huynh"
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80 shadow-2xs transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <MessengerIcon className="w-3 h-3 shrink-0 opacity-70" />
            <span>+ Messenger</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Cột Trạng thái Lead - BADGE TĨNH (Không có menu dropdown, chỉ hiển thị trạng thái hiện tại) ─── */
function LeadStatusBadge({ lead }: { lead: Lead }) {
  const currentStatus = normalizeLeadStatus(lead.status);
  const badgeConfig = STATUS_BADGES[currentStatus] || STATUS_BADGES.new;
  const missedCount = lead.missedCallsCount || 0;

  return (
    <div className="flex flex-col gap-1 items-start select-none" onClick={(e) => e.stopPropagation()}>
      <span
        className={`inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-md font-bold border shadow-2xs ${badgeConfig.className}`}
        title={`Trạng thái: ${badgeConfig.label}`}
      >
        <span>{badgeConfig.icon}</span>
        <span>{badgeConfig.label}</span>
      </span>

      {/* Thông tin phụ hiển thị tĩnh nếu có */}
      {currentStatus === "callback" && missedCount > 0 && (
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
          📵 Gọi nhỡ Lần {missedCount}
        </span>
      )}

      {currentStatus === "callback" && missedCount === 0 && lead.callbackTime && (
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
          <Clock className="w-2.5 h-2.5 text-purple-600 shrink-0" />
          <span>Hẹn: {lead.callbackTime}</span>
        </span>
      )}
    </div>
  );
}

/* ─── Modal liên kết / mở nhanh Messenger ─── */
function MessengerModal({
  lead,
  isOpen,
  onClose,
  onSaveMessenger,
}: {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMessenger: (leadId: string, messengerUrl: string) => void;
}) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (lead) {
      setUrl(lead.parentMessenger || "");
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalUrl = url.trim();
    if (!finalUrl) return;

    onSaveMessenger(lead!.id, finalUrl);

    // Auto open in new tab
    const openUrl =
      finalUrl.startsWith("http://") || finalUrl.startsWith("https://")
        ? finalUrl
        : finalUrl.startsWith("m.me/") || finalUrl.startsWith("facebook.com/")
        ? `https://${finalUrl}`
        : `https://m.me/${finalUrl.replace(/^@/, "")}`;

    window.open(openUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  function handleOpenGeneric() {
    window.open("https://www.messenger.com/", "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <MessengerIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Kết nối Messenger Phụ huynh
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Học sinh: <strong className="text-foreground">{lead.studentName}</strong> (PH: {lead.parentName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Nhập link hoặc username Facebook / Messenger:
            </label>
            <Input
              autoFocus
              placeholder="VD: m.me/nguyenvanhung hoặc https://facebook.com/id..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              💡 Hệ thống sẽ lưu link này vào hồ sơ để nhân viên click mở chat trực tiếp 1-chạm ở các lần sau.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenGeneric}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              Mở Messenger chung
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs h-8"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-8 font-bold gap-1.5 bg-gradient-to-r from-[#0084FF] to-[#A033FF] hover:opacity-90 text-white shadow-xs"
              >
                <MessengerIcon className="w-3.5 h-3.5" />
                Lưu & Mở Chat
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal Chỉnh sửa thông tin Lead ─── */
function EditLeadModal({
  lead,
  isOpen,
  onClose,
  onSaveLead,
}: {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLead: (updatedLead: Lead) => void;
}) {
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("facebook_ads");
  const [targetSubject, setTargetSubject] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (lead && isOpen) {
      setStudentName(lead.studentName || "");
      setParentName(lead.parentName || "");
      setParentPhone(lead.parentPhone || "");
      setSource(lead.source || "facebook_ads");
      setTargetSubject(lead.targetSubject || "");
      setTargetGoal(lead.targetGoal || "");
      setNotes(lead.notes || "");
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim() || !parentPhone.trim()) {
      alert("Vui lòng nhập họ tên học sinh và số điện thoại phụ huynh!");
      return;
    }

    const updated: Lead = {
      ...lead!,
      studentName: studentName.trim(),
      parentName: parentName.trim() || "Phụ huynh",
      parentPhone: parentPhone.trim(),
      source,
      targetSubject: targetSubject.trim(),
      targetGoal: targetGoal.trim(),
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveLead(updated);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-500/30 font-bold text-lg">
              ✏️
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Chỉnh sửa thông tin khách hàng tiềm năng
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Học sinh: <strong className="text-foreground">{lead.studentName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Tên học sinh *</label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-9 text-xs"
                placeholder="Nhập tên học sinh"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Tên phụ huynh</label>
              <Input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="h-9 text-xs"
                placeholder="Nhập tên phụ huynh"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Số điện thoại *</label>
              <Input
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="h-9 text-xs font-mono"
                placeholder="VD: 0912345678"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Nguồn tiếp nhận</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="facebook_ads">Facebook Ads</option>
                <option value="fanpage">Fanpage nhắn tin</option>
                <option value="zalo">Zalo OA</option>
                <option value="referral">Người quen giới thiệu</option>
                <option value="walkin">Vãng lai / Tờ rơi</option>
                <option value="hotline">Hotline / Website</option>
                <option value="other">Nguồn khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Môn quan tâm</label>
              <Input
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                className="h-9 text-xs"
                placeholder="VD: Toán 9, Tiếng Anh"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Mục tiêu / Nhu cầu</label>
              <Input
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="h-9 text-xs"
                placeholder="VD: Luyện thi vào 10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Ghi chú bổ sung</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
              placeholder="Nhập thông tin tư vấn bổ sung nếu có..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs h-9 px-5 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal Xác nhận xóa Lead ─── */
function DeleteConfirmModal({
  lead,
  isOpen,
  onClose,
  onConfirmDelete,
}: {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (leadId: string) => void;
}) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center border border-rose-500/30 font-bold text-lg">
              🗑️
            </div>
            <h3 className="text-sm font-extrabold text-foreground">
              Xác nhận xóa khách hàng
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <strong className="text-foreground font-bold">{lead.studentName}</strong> (PH: {lead.parentName} - {lead.parentPhone}) khỏi danh sách tiềm năng không? Thao tác này không thể hoàn tác.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 px-4 text-muted-foreground hover:text-foreground"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onConfirmDelete(lead.id);
                onClose();
              }}
              className="text-xs h-9 px-4 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Xác nhận Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Lên lịch hẹn gọi lại & Nhật ký tư vấn ─── */
function CallbackScheduleModal({
  lead,
  isOpen,
  onClose,
  onSaveCallback,
  onFinishCallAndMoveToContacted,
}: {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCallback: (leadId: string, datetime: string, note: string) => void;
  onFinishCallAndMoveToContacted: (leadId: string, note: string) => void;
}) {
  const [datetime, setDatetime] = useState("");
  const [note, setNote] = useState("");

  const nowIso = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && lead) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setDatetime(`${year}-${month}-${day}T${hours}:${minutes}`);
      setNote("");
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  function handleFinishCall(e: React.MouseEvent) {
    e.preventDefault();
    onFinishCallAndMoveToContacted(lead!.id, note.trim());
    onClose();
  }

  function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSaveCallback(lead!.id, datetime || nowIso, note.trim());
    onClose();
  }

  function handleQuickSetTime(hoursToAdd: number) {
    const d = new Date();
    d.setHours(d.getHours() + hoursToAdd);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    setDatetime(`${year}-${month}-${day}T${hours}:${minutes}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-gradient-to-r from-purple-500/15 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/30 font-bold text-lg">
              🕐
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Cập nhật tư vấn & Lên lịch hẹn gọi lại
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Học sinh: <strong className="text-foreground">{lead.studentName}</strong> (PH: {lead.parentName} - {lead.parentPhone})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleScheduleSubmit} className="p-4 space-y-4">
          {/* Textarea note (Không bắt buộc) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Ghi chú phản hồi phụ huynh / Nội dung trao đổi (Tùy chọn):
            </label>
            <textarea
              rows={3}
              placeholder="Nhập nội dung trao đổi với phụ huynh hoặc để trống nếu không có ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Date-Time Selector */}
          <div className="space-y-1.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <label className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center justify-between">
              <span>Đổi hoặc đặt lịch hẹn gọi lại lần tới (nếu chưa chốt xong):</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                (Giờ : Phút, Ngày / Tháng / Năm)
              </span>
            </label>
            <input
              type="datetime-local"
              min={nowIso}
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold">Gợi ý nhanh:</span>
              <button
                type="button"
                onClick={() => handleQuickSetTime(1)}
                className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/20 transition-all"
              >
                +1 Giờ
              </button>
              <button
                type="button"
                onClick={() => handleQuickSetTime(3)}
                className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/20 transition-all"
              >
                +3 Giờ
              </button>
              <button
                type="button"
                onClick={() => handleQuickSetTime(24)}
                className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/20 transition-all"
              >
                Ngày mai
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 px-4 text-muted-foreground hover:text-foreground"
            >
              Hủy
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Nút 1: Lên lịch hẹn mới */}
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="w-full sm:w-auto text-xs h-9 px-3.5 font-bold gap-1.5 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
              >
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Lưu lịch hẹn khác
              </Button>

              {/* Nút 2 CTA Nổi bật: Trao đổi xong -> Chuyển sang Đang chăm sóc */}
              <Button
                type="button"
                size="sm"
                onClick={handleFinishCall}
                className="w-full sm:w-auto text-xs h-9 px-4 font-extrabold gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 hover:-translate-y-0.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Chuyển sang "Đang chăm sóc"</span>
              </Button>
            </div>
          </div>
        </form>
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
  onOpenMessengerPrompt,
}: {
  lead: Lead | null;
  logs: InteractionLog[];
  isOpen: boolean;
  onClose: () => void;
  onOpenInteraction: (leadId: string) => void;
  onOpenScheduleTrial: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => void;
  onQuickSaveNote: (leadId: string, content: string, reminderAt?: string) => void;
  onOpenMessengerPrompt: (lead: Lead) => void;
}) {
  const [callbackNote, setCallbackNote] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const [quickSaved, setQuickSaved] = useState(false);

  if (!lead) return null;

  const leadLogs = logs.filter((l) => l.leadId === lead.id);
  const statusBadge = STATUS_BADGES[normalizeLeadStatus(lead.status)] || STATUS_BADGES.new;

  function handleMarkFailed() {
    const reason = prompt(
      `Nhập lý do chưa chốt được cho học sinh "${lead!.studentName}":`,
      "Trùng lịch / Học phí cao / Đã học nơi khác"
    );
    if (reason !== null) {
      onUpdateLeadStatus(lead!.id, "contacted", reason || "Không nêu lý do");
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Contact Bar for Counselors */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-primary/5 to-purple-500/10 border border-border shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-primary" />
                Liên hệ phụ huynh ({lead.parentName})
              </span>
              <span className="font-mono text-xs font-black text-foreground bg-background px-2 py-0.5 rounded-md border border-border/80 shadow-2xs select-all">
                {lead.parentPhone}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${lead.parentPhone.replace(/\D/g, "")}`}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:scale-102 active:scale-98"
                title={`Gọi điện tới ${lead.parentPhone}`}
              >
                <Phone className="w-3.5 h-3.5" /> Gọi điện
              </a>

              <a
                href={getZaloUrl(lead.parentPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold bg-[#0068FF] hover:bg-[#0055d4] text-white shadow-xs transition-all hover:scale-102 active:scale-98"
                title="Mở chat Zalo trên tab mới"
              >
                <ZaloIcon className="w-3.5 h-3.5" /> Zalo
              </a>

              <button
                type="button"
                onClick={() => onOpenMessengerPrompt(lead)}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#0084FF] to-[#A033FF] hover:opacity-95 text-white shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                title={lead.parentMessenger ? "Mở chat Messenger" : "Liên kết Messenger"}
              >
                <MessengerIcon className="w-3.5 h-3.5" /> Messenger
              </button>
            </div>
          </div>

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
            {lead.failedReason && (
              <div className="pt-2 border-t border-border/40 text-xs text-rose-600 dark:text-rose-400">
                <span className="font-semibold">Lý do đóng lead / chưa phù hợp: </span>
                {lead.failedReason}
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

          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkFailed}
            className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Ghi chú chưa phù hợp
          </Button>
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
  onUpdateLead?: (updatedLead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function LeadsTab({
  leads,
  logs,
  onOpenCreateLead,
  onOpenInteraction,
  onOpenScheduleTrial,
  onUpdateLeadStatus,
  onAddLog,
  onUpdateLead,
  onDeleteLead,
}: LeadsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Messenger modal & overrides
  const [messengerModalLead, setMessengerModalLead] = useState<Lead | null>(null);
  const [isMessengerModalOpen, setIsMessengerModalOpen] = useState(false);
  const [messengerOverrides, setMessengerOverrides] = useState<Record<string, string>>({});

  // Callback schedule modal
  const [callbackModalLead, setCallbackModalLead] = useState<Lead | null>(null);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  // Edit & Delete Modals
  const [editModalLead, setEditModalLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalLead, setDeleteModalLead] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Drawer state
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function handleOutcomeConnected(lead: Lead, note?: string) {
    const contentNote = note?.trim() || "Đã nghe máy & trao đổi trực tiếp với phụ huynh";
    const updated: Lead = {
      ...lead,
      status: "contacted",
      updatedAt: new Date().toISOString(),
    };
    if (onUpdateLead) {
      onUpdateLead(updated);
    }
    if (onAddLog) {
      const newLog: InteractionLog = {
        id: `log-${Date.now()}`,
        leadId: lead.id,
        leadName: lead.studentName,
        parentPhone: lead.parentPhone,
        staffName: lead.assignedStaff || "Tư vấn viên",
        channel: "call",
        sentiment: "need_consult",
        content: contentNote,
        nextAction: "Tiếp tục chăm sóc & tư vấn",
        date: new Date().toLocaleDateString("vi-VN"),
        isCompleted: true,
      };
      onAddLog(newLog, "contacted");
    } else {
      onUpdateLeadStatus(lead.id, "contacted");
    }
  }

  function handleOutcomeMissed(lead: Lead, note?: string) {
    const currentCount = lead.missedCallsCount || 0;
    const newCount = currentCount + 1;
    const userNote = note?.trim();

    if (newCount < 3) {
      const updated: Lead = {
        ...lead,
        status: "callback",
        missedCallsCount: newCount,
        updatedAt: new Date().toISOString(),
      };
      if (onUpdateLead) {
        onUpdateLead(updated);
      }
      if (onAddLog) {
        const newLog: InteractionLog = {
          id: `log-${Date.now()}`,
          leadId: lead.id,
          leadName: lead.studentName,
          parentPhone: lead.parentPhone,
          staffName: lead.assignedStaff || "Tư vấn viên",
          channel: "call",
          sentiment: "need_consult",
          content: userNote
            ? `[Gọi nhỡ Lần ${newCount}] ${userNote}`
            : `[Gọi nhỡ Lần ${newCount}] Phụ huynh không nghe máy / máy bận. Cập nhật Hẹn gọi lại.`,
          nextAction: `Gọi lại lần ${newCount + 1}`,
          date: new Date().toLocaleDateString("vi-VN"),
          reminderAt: "Hẹn gọi lại sau",
          isCompleted: false,
        };
        onAddLog(newLog, "callback");
      } else {
        onUpdateLeadStatus(lead.id, "callback");
      }
    } else {
      // Gọi nhỡ đến lần thứ 3 -> Tự động chuyển "no_demand"
      const updated: Lead = {
        ...lead,
        status: "no_demand",
        missedCallsCount: newCount,
        failedReason: "Không bắt máy sau 3 lần gọi",
        updatedAt: new Date().toISOString(),
      };
      if (onUpdateLead) {
        onUpdateLead(updated);
      }
      if (onAddLog) {
        const newLog: InteractionLog = {
          id: `log-${Date.now()}`,
          leadId: lead.id,
          leadName: lead.studentName,
          parentPhone: lead.parentPhone,
          staffName: lead.assignedStaff || "Tư vấn viên",
          channel: "call",
          sentiment: "other",
          content: userNote
            ? `[Gọi nhỡ Lần 3] ${userNote} (Tự động chuyển Không có nhu cầu)`
            : `[Hệ thống tự động] Gọi nhỡ 3 lần liên tiếp. Tự động chuyển sang Không có nhu cầu.`,
          nextAction: "Đóng lead & lưu trữ",
          date: new Date().toLocaleDateString("vi-VN"),
          isCompleted: true,
        };
        onAddLog(newLog, "no_demand");
      } else {
        onUpdateLeadStatus(lead.id, "no_demand", "Không bắt máy sau 3 lần gọi");
      }
    }
  }

  function handleOutcomeNoDemand(lead: Lead, note?: string) {
    const userNote = note?.trim();
    const reason = userNote || "Khách không có nhu cầu / Chặn số";
    const updated: Lead = {
      ...lead,
      status: "no_demand",
      failedReason: reason,
      updatedAt: new Date().toISOString(),
    };
    if (onUpdateLead) {
      onUpdateLead(updated);
    }
    if (onAddLog) {
      const newLog: InteractionLog = {
        id: `log-${Date.now()}`,
        leadId: lead.id,
        leadName: lead.studentName,
        parentPhone: lead.parentPhone,
        staffName: lead.assignedStaff || "Tư vấn viên",
        channel: "call",
        sentiment: "other",
        content: `[Không có nhu cầu] ${reason}`,
        nextAction: "Đóng lead",
        date: new Date().toLocaleDateString("vi-VN"),
        isCompleted: true,
      };
      onAddLog(newLog, "no_demand");
    } else {
      onUpdateLeadStatus(lead.id, "no_demand", reason);
    }
  }

  function handleSaveMessenger(leadId: string, messengerUrl: string) {
    setMessengerOverrides((prev) => ({ ...prev, [leadId]: messengerUrl }));
    if (drawerLead && drawerLead.id === leadId) {
      setDrawerLead((prev) => (prev ? { ...prev, parentMessenger: messengerUrl } : null));
    }
  }

  function handleOpenMessengerPrompt(lead: Lead) {
    const activeUrl = messengerOverrides[lead.id] || lead.parentMessenger;
    if (activeUrl) {
      const openUrl =
        activeUrl.startsWith("http://") || activeUrl.startsWith("https://")
          ? activeUrl
          : activeUrl.startsWith("m.me/") || activeUrl.startsWith("facebook.com/")
          ? `https://${activeUrl}`
          : `https://m.me/${activeUrl.replace(/^@/, "")}`;
      window.open(openUrl, "_blank", "noopener,noreferrer");
    } else {
      setMessengerModalLead(lead);
      setIsMessengerModalOpen(true);
    }
  }

  function handleRowClick(lead: Lead) {
    setDrawerLead(lead);
    setIsDrawerOpen(true);
  }

  function formatCallbackTime(datetimeStr: string): string {
    const dt = new Date(datetimeStr);
    const now = new Date();

    const timeStr = dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const isToday =
      dt.getDate() === now.getDate() &&
      dt.getMonth() === now.getMonth() &&
      dt.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      dt.getDate() === tomorrow.getDate() &&
      dt.getMonth() === tomorrow.getMonth() &&
      dt.getFullYear() === tomorrow.getFullYear();

    if (isToday) {
      return `${timeStr} - Hôm nay`;
    } else if (isTomorrow) {
      return `${timeStr} - Ngày mai`;
    } else {
      const dateStr = dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      return `${timeStr} - ${dateStr}`;
    }
  }

  function handleSaveCallbackSchedule(leadId: string, datetime: string, note: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const formattedReminder = formatCallbackTime(datetime);

    handleQuickSaveNote(leadId, note, formattedReminder);
  }

  function handleFinishCallAndMoveToContacted(leadId: string, note: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const contentNote = note.trim() || "Đã liên hệ trao đổi với phụ huynh";

    if (onAddLog) {
      const newLog: InteractionLog = {
        id: `log-${Date.now()}`,
        leadId,
        leadName: lead.studentName,
        parentPhone: lead.parentPhone,
        staffName: lead.assignedStaff || "Tư vấn viên",
        channel: "call",
        sentiment: "need_consult",
        content: contentNote,
        nextAction: "Đã hoàn thành cuộc gọi hẹn - Chuyển sang Đang chăm sóc",
        date: new Date().toLocaleDateString("vi-VN"),
        reminderAt: undefined,
        isCompleted: true,
      };
      onAddLog(newLog, "contacted");
    } else {
      onUpdateLeadStatus(leadId, "contacted");
    }
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

  // Danh sách các môn học quan tâm (unique) phục vụ bộ lọc môn học riêng biệt
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    leads.forEach((l) => {
      if (l.targetSubject && l.targetSubject.trim()) {
        subjects.add(l.targetSubject.trim());
      }
    });
    return Array.from(subjects).sort((a, b) => a.localeCompare(b, "vi"));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !searchTerm ||
        l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentPhone.includes(searchTerm) ||
        l.targetSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.targetGoal.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSource = sourceFilter === "all" || l.source === sourceFilter;
      const matchSubject =
        subjectFilter === "all" ||
        l.targetSubject.toLowerCase() === subjectFilter.toLowerCase();
      const matchStatus = statusFilter === "all" || normalizeLeadStatus(l.status) === statusFilter;

      return matchSearch && matchSource && matchSubject && matchStatus;
    });
  }, [leads, searchTerm, sourceFilter, subjectFilter, statusFilter]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    sourceFilter !== "all" ||
    subjectFilter !== "all" ||
    statusFilter !== "all";

  function handleResetFilters() {
    setSearchTerm("");
    setSourceFilter("all");
    setSubjectFilter("all");
    setStatusFilter("all");
  }

  // Counts for summary (4 KPI cards)
  const newCount = leads.filter((l) => normalizeLeadStatus(l.status) === "new").length;
  const contactedCount = leads.filter((l) => normalizeLeadStatus(l.status) === "contacted").length;
  const callbackCount = leads.filter((l) => normalizeLeadStatus(l.status) === "callback").length;
  const noDemandCount = leads.filter((l) => normalizeLeadStatus(l.status) === "no_demand").length;

  return (
    <>
      <div className="space-y-4">
        {/* Quick Stats Row (4 KPI Cards) - Directly under Funnel Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
            onClick={() => setStatusFilter(statusFilter === "contacted" ? "all" : "contacted")}
            title="Bấm để lọc danh sách: Đang chăm sóc"
            className={`p-3.5 sm:p-4 rounded-2xl text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${
              statusFilter === "contacted"
                ? "bg-amber-500/20 border-2 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                : "bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/15"
            }`}
          >
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {contactedCount}
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wide mt-1 flex items-center justify-center gap-1.5">
              <span>📞</span>
              <span>Đang chăm sóc</span>
            </div>
            {statusFilter === "contacted" && (
              <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
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
            onClick={() => setStatusFilter(statusFilter === "no_demand" ? "all" : "no_demand")}
            title="Bấm để lọc danh sách: Không có nhu cầu"
            className={`p-3.5 sm:p-4 rounded-2xl text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${
              statusFilter === "no_demand"
                ? "bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/20 shadow-md"
                : "bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-200/50"
            }`}
          >
            <div className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 tracking-tight">
              {noDemandCount}
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide mt-1 flex items-center justify-center gap-1.5">
              <span>⬛</span>
              <span>Không có nhu cầu</span>
            </div>
            {statusFilter === "no_demand" && (
              <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên bé, phụ huynh, SĐT, môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Bộ lọc riêng: Nguồn tiếp nhận */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">Tất cả nguồn tiếp nhận</option>
              <option value="facebook_ads">Facebook Ads</option>
              <option value="fanpage">Fanpage tin nhắn</option>
              <option value="zalo">Zalo OA</option>
              <option value="referral">Người quen giới thiệu</option>
              <option value="walkin">Vãng lai / Tờ rơi</option>
              <option value="hotline">Hotline / Website</option>
              <option value="other">Nguồn khác</option>
            </select>

            {/* Bộ lọc riêng: Môn quan tâm */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">Tất cả môn quan tâm</option>
              {availableSubjects.map((subj) => {
                const count = leads.filter(
                  (l) => l.targetSubject.toLowerCase() === subj.toLowerCase()
                ).length;
                return (
                  <option key={subj} value={subj}>
                    {subj} ({count})
                  </option>
                );
              })}
            </select>

            {/* Bộ lọc: Trạng thái Lead */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer font-semibold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="new">🆕 Mới tiếp nhận</option>
              <option value="contacted">📞 Đang chăm sóc</option>
              <option value="callback">🕐 Hẹn gọi lại</option>
              <option value="no_demand">⬛ Không có nhu cầu</option>
              <option value="converted">🎓 Đã ghi danh</option>
            </select>

            {/* Nút xóa / đặt lại bộ lọc */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground px-2.5 gap-1.5"
                title="Xóa toàn bộ bộ lọc"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </Button>
            )}
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

        {/* Quick Contact & Action Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              <strong>Tương tác nhanh 1-chạm & Ghi nhận cuộc gọi:</strong> Nhấp icon điện thoại để gọi điện & chọn ngay kết quả (Đã nghe máy, Gọi nhỡ, Không nhu cầu). Sau 3 lần gọi nhỡ hệ thống sẽ tự động chuyển lead sang "Không có nhu cầu".
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-semibold shrink-0">
            ⚡ Tối ưu luồng telesales tuyển sinh
          </span>
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
                  Liên hệ nhanh (SĐT • Zalo • Messenger)
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  Nguồn tiếp nhận
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  Môn quan tâm
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5">
                  Trạng thái Lead
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5 text-right">
                  Chuyển đổi (Chỉ hiện khi Đang chăm sóc)
                </TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider py-3.5 text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground text-xs"
                  >
                    Không tìm thấy Lead nào phù hợp. Thử điều chỉnh bộ lọc tìm kiếm.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const sourceBadge =
                    SOURCE_BADGES[lead.source] || SOURCE_BADGES.other;
                  const activeMessenger =
                    messengerOverrides[lead.id] || lead.parentMessenger;
                  const isNoDemand = normalizeLeadStatus(lead.status) === "no_demand";

                  return (
                    <TableRow
                      key={lead.id}
                      onClick={() => handleRowClick(lead)}
                      className={`hover:bg-muted/30 transition-all duration-150 cursor-pointer ${
                        isNoDemand ? "opacity-75 bg-slate-500/5 dark:bg-slate-900/20" : ""
                      }`}
                    >
                      {/* Học sinh & Phụ huynh */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {lead.studentName}
                          </span>
                          <span className="font-normal text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            PH: {lead.parentName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Thông tin liên hệ & 2 nút tương tác nhanh (với Popover kết quả cuộc gọi) */}
                      <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                        <ContactCell
                          lead={{
                            ...lead,
                            parentMessenger: activeMessenger,
                          }}
                          onOpenMessengerPrompt={handleOpenMessengerPrompt}
                          onConnected={handleOutcomeConnected}
                          onMissedCall={handleOutcomeMissed}
                          onNoDemand={handleOutcomeNoDemand}
                        />
                      </TableCell>

                      {/* Cột 1 riêng biệt: Nguồn tiếp nhận */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10.5px] font-bold px-2.5 py-0.5 shadow-2xs whitespace-nowrap rounded-md ${sourceBadge.className}`}
                        >
                          {sourceBadge.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 2 riêng biệt: Môn quan tâm */}
                      <TableCell className="py-3.5">
                        <div className="text-xs leading-snug">
                          <span className="font-extrabold text-foreground">
                            {lead.targetSubject}
                          </span>
                          {lead.targetGoal && (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              - {lead.targetGoal}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Cột Trạng thái Lead - BADGE TĨNH */}
                      <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                        <LeadStatusBadge lead={lead} />
                      </TableCell>

                      {/* Hành động chuyển đổi - CHỈ HIỂN THỊ KHI TRẠNG THÁI LÀ "ĐANG CHĂM SÓC" */}
                      <TableCell
                        className="py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {normalizeLeadStatus(lead.status) === "contacted" ? (
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
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 italic font-medium">
                            {isNoDemand ? "Đã đóng lead" : "Cần chăm sóc trước"}
                          </span>
                        )}
                      </TableCell>

                      {/* Cột Thao tác: Sửa & Xóa */}
                      <TableCell
                        className="py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditModalLead(lead);
                              setIsEditModalOpen(true);
                            }}
                            className="h-8 text-xs px-2.5 gap-1 font-bold text-muted-foreground hover:text-foreground hover:border-primary"
                            title="Chỉnh sửa thông tin khách hàng"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Sửa</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModalLead(lead);
                              setIsDeleteModalOpen(true);
                            }}
                            className="h-8 text-xs px-2.5 gap-1 font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
                            title="Xóa khách hàng này"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Xóa</span>
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
        lead={
          drawerLead
            ? {
                ...drawerLead,
                parentMessenger:
                  messengerOverrides[drawerLead.id] || drawerLead.parentMessenger,
              }
            : null
        }
        logs={logs}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenInteraction={onOpenInteraction}
        onOpenScheduleTrial={onOpenScheduleTrial}
        onUpdateLeadStatus={onUpdateLeadStatus}
        onQuickSaveNote={handleQuickSaveNote}
        onOpenMessengerPrompt={handleOpenMessengerPrompt}
      />

      {/* Messenger Mapping Modal */}
      <MessengerModal
        lead={messengerModalLead}
        isOpen={isMessengerModalOpen}
        onClose={() => {
          setIsMessengerModalOpen(false);
          setMessengerModalLead(null);
        }}
        onSaveMessenger={handleSaveMessenger}
      />

      {/* Modal Lên lịch hẹn gọi lại & Nhật ký tư vấn */}
      <CallbackScheduleModal
        lead={callbackModalLead}
        isOpen={isCallbackModalOpen}
        onClose={() => {
          setIsCallbackModalOpen(false);
          setCallbackModalLead(null);
        }}
        onSaveCallback={handleSaveCallbackSchedule}
        onFinishCallAndMoveToContacted={handleFinishCallAndMoveToContacted}
      />

      {/* Modal Chỉnh sửa thông tin Lead */}
      <EditLeadModal
        lead={editModalLead}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditModalLead(null);
        }}
        onSaveLead={(updated) => {
          if (onUpdateLead) onUpdateLead(updated);
        }}
      />

      {/* Modal Xác nhận Xóa Lead */}
      <DeleteConfirmModal
        lead={deleteModalLead}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteModalLead(null);
        }}
        onConfirmDelete={(leadId) => {
          if (onDeleteLead) onDeleteLead(leadId);
        }}
      />
    </>
  );
}
