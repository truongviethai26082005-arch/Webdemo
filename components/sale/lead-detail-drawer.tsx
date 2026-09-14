"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lead,
  LeadStatus,
  LeadStage,
  InteractionChannel,
  FeedbackSentiment,
} from "@/types/database";
import {
  logInteraction,
  updateLead,
} from "@/lib/actions/admissions";
import {
  Phone,
  MessageSquare,
  Clock,
  Send,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  PhoneMissed,
  ExternalLink,
} from "lucide-react";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onScheduleTrial?: (lead: Lead) => void;
  onStartConversion?: (lead: Lead) => void;
}

export function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
  onSuccess,
  onScheduleTrial,
  onStartConversion,
}: LeadDetailDrawerProps) {
  const [logLoading, setLogLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction Form State
  const [channel, setChannel] = useState<InteractionChannel>("call");
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<FeedbackSentiment>("high_interest");
  const [isMissedCall, setIsMissedCall] = useState(false);
  const [callbackAt, setCallbackAt] = useState("");

  if (!lead) return null;

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung tương tác trao đổi với phụ huynh");
      return;
    }

    setLogLoading(true);
    setError(null);
    try {
      const res = await logInteraction({
        leadId: lead.id,
        channel,
        content: content.trim(),
        sentiment,
        isMissedCall,
        callbackAt: callbackAt || undefined,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      setContent("");
      setIsMissedCall(false);
      setCallbackAt("");
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi ghi nhận nhật ký");
    } finally {
      setLogLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: LeadStatus) => {
    setStatusLoading(true);
    setError(null);
    try {
      const res = await updateLead(lead.id, { status: newStatus });
      if (res?.error) {
        setError(res.error);
        return;
      }
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi đổi trạng thái");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUpdateStage = async (newStage: LeadStage) => {
    setStatusLoading(true);
    setError(null);
    try {
      const res = await updateLead(lead.id, { stage: newStage });
      if (res?.error) {
        setError(res.error);
        return;
      }
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi đổi giai đoạn");
    } finally {
      setStatusLoading(false);
    }
  };

  const phoneForZalo = lead.zalo?.replace(/\D/g, "") || lead.phone.replace(/\D/g, "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
        {/* Header Drawer */}
        <div className="p-6 border-b border-border bg-muted/20">
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20"
              >
                {lead.stage === "inquiry" && "Giai đoạn: Tiếp nhận & Tư vấn"}
                {lead.stage === "trial" && "Giai đoạn: Học thử & Đánh giá"}
                {lead.stage === "conversion" && "Giai đoạn: Chờ chốt gói"}
                {lead.stage === "enrolled" && "Đã ghi danh chính thức"}
                {lead.stage === "waiting_class" && "Đã nộp tiền — Chờ xếp lớp"}
              </Badge>

              {lead.missed_calls_count > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] font-bold flex items-center gap-1"
                >
                  <PhoneMissed className="w-3 h-3" />
                  {lead.missed_calls_count} lần gọi nhỡ
                </Badge>
              )}
            </div>

            <SheetTitle className="text-lg font-black text-foreground mt-2">
              {lead.full_name}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Phụ huynh: {lead.parent_name || "Chưa cập nhật"} • SĐT: {lead.phone}
            </SheetDescription>
          </SheetHeader>

          {/* Deep Links Action Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/60">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Gọi ngay
            </a>
            <a
              href={`https://zalo.me/${phoneForZalo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Zalo
              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
            </a>

            {lead.stage === "inquiry" && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                onClick={() => onScheduleTrial?.(lead)}
              >
                <Calendar className="w-3.5 h-3.5" />
                Xếp lịch học thử
              </Button>
            )}

            {(lead.stage === "trial" || lead.stage === "conversion") && (
              <Button
                size="sm"
                className="text-xs font-bold gap-1 bg-gradient-to-r from-primary to-indigo-600 text-white"
                onClick={() => onStartConversion?.(lead)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Chốt học &amp; VietQR
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Thông tin nhu cầu */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5 text-xs">
            <div className="font-bold text-foreground flex items-center gap-2">
              <span>Mục tiêu &amp; Nhu cầu học</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Khối lớp:</span>{" "}
                {lead.grade || "Chưa rõ"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Môn quan tâm:</span>{" "}
                {lead.course_interest || "Chưa rõ"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Nguồn tiếp cận:</span>{" "}
                {lead.source}
              </div>
              <div>
                <span className="font-semibold text-foreground">Trạng thái:</span>{" "}
                <span className="capitalize font-semibold text-foreground">{lead.status}</span>
              </div>
            </div>
            {lead.target_goal && (
              <div className="pt-2 border-t border-border/60">
                <span className="font-semibold text-foreground">Mục tiêu:</span> {lead.target_goal}
              </div>
            )}
            {lead.note && (
              <div className="p-2.5 rounded-xl bg-muted/40 text-muted-foreground italic text-[11px]">
                "{lead.note}"
              </div>
            )}
          </div>

          {/* Thay đổi trạng thái nhanh */}
          <div className="space-y-2">
            <Label className="text-xs font-bold">Chuyển nhanh trạng thái:</Label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={lead.status === "contacted" ? "default" : "outline"}
                className="text-[11px] h-7 px-2.5"
                disabled={statusLoading}
                onClick={() => handleUpdateStatus("contacted")}
              >
                Đã liên hệ
              </Button>
              <Button
                size="sm"
                variant={lead.status === "callback" ? "default" : "outline"}
                className="text-[11px] h-7 px-2.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                disabled={statusLoading}
                onClick={() => handleUpdateStatus("callback")}
              >
                Hẹn gọi lại
              </Button>
              <Button
                size="sm"
                variant={lead.status === "no_demand" ? "destructive" : "outline"}
                className="text-[11px] h-7 px-2.5"
                disabled={statusLoading}
                onClick={() => handleUpdateStatus("no_demand")}
              >
                Không có nhu cầu
              </Button>
            </div>
          </div>

          {/* Form thêm nhật ký tương tác */}
          <form
            onSubmit={handleAddInteraction}
            className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3"
          >
            <div className="flex items-center justify-between font-bold text-xs text-primary">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Ghi nhận nhật ký trao đổi (CRM)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] font-semibold">Kênh liên hệ</Label>
                <Select
                  value={channel}
                  onValueChange={(v) => setChannel(v as InteractionChannel)}
                  disabled={logLoading}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Cuộc gọi điện</SelectItem>
                    <SelectItem value="zalo">Nhắn tin Zalo</SelectItem>
                    <SelectItem value="in_person">Gặp trực tiếp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-semibold">Cảm nhận phụ huynh</Label>
                <Select
                  value={sentiment}
                  onValueChange={(v) => setSentiment(v as FeedbackSentiment)}
                  disabled={logLoading}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_interest">Quan tâm cao / Hào hứng</SelectItem>
                    <SelectItem value="price_concern">Lăn tăn học phí</SelectItem>
                    <SelectItem value="schedule_conflict">Vướng lịch học</SelectItem>
                    <SelectItem value="need_consult">Cần hỏi ý kiến con</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-background/80 border border-border/60">
              <Checkbox
                id="isMissedCall"
                checked={isMissedCall}
                onCheckedChange={(checked) => setIsMissedCall(Boolean(checked))}
                disabled={logLoading}
              />
              <Label
                htmlFor="isMissedCall"
                className="text-[11px] font-semibold cursor-pointer text-destructive flex items-center gap-1"
              >
                <PhoneMissed className="w-3.5 h-3.5" />
                Cuộc gọi nhỡ / Không nhấc máy (Gọi nhỡ 3 lần liên tiếp $\rightarrow$ tự đóng Lead)
              </Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="interactionContent" className="text-[11px] font-semibold">
                Nội dung trao đổi chi tiết
              </Label>
              <Textarea
                id="interactionContent"
                placeholder="Phụ huynh trao đổi gì? Thắc mắc điều gì? Hẹn khi nào phản hồi..."
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={logLoading}
                className="text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <input
                  type="datetime-local"
                  className="px-2 py-1 rounded-lg border border-border bg-background text-[11px]"
                  value={callbackAt}
                  onChange={(e) => setCallbackAt(e.target.value)}
                  disabled={logLoading}
                  placeholder="Lịch hẹn gọi lại"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={logLoading}
                className="text-xs font-bold gap-1"
              >
                {logLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Lưu nhật ký
              </Button>
            </div>
          </form>

          {/* Lịch sử tương tác Timeline */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-foreground flex items-center justify-between">
              <span>Lịch sử chăm sóc ({lead.interactions?.length || 0})</span>
            </div>

            {(!lead.interactions || lead.interactions.length === 0) ? (
              <div className="text-center py-6 text-xs text-muted-foreground italic border border-dashed rounded-2xl">
                Chưa có nhật ký trao đổi nào. Hãy ghi lại cuộc gọi hoặc tin nhắn đầu tiên!
              </div>
            ) : (
              <div className="space-y-2.5">
                {lead.interactions.map((it) => (
                  <div
                    key={it.id}
                    className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {it.channel === "call" && "Cuộc gọi"}
                          {it.channel === "zalo" && "Zalo"}
                          {it.channel === "in_person" && "Trực tiếp"}
                          {it.channel === "email" && "Email"}
                        </Badge>
                        {it.is_missed_call && (
                          <Badge variant="destructive" className="text-[9px] font-bold">
                            Gọi nhỡ
                          </Badge>
                        )}
                        {it.sentiment && (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            • {it.sentiment}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(it.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {it.content}
                    </p>

                    {it.callback_at && (
                      <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Hẹn gọi lại: {new Date(it.callback_at).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
