"use client";

import { useState, useEffect } from "react";
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
  FeedbackTicket,
} from "@/types/database";
import {
  logInteraction,
  updateLead,
} from "@/lib/actions/admissions";
import { getFeedbackTicketsByStudent } from "@/lib/actions/feedback";
import { QuickFacebookLink } from "@/components/sale/quick-call-link";
import { QuickCallConfirmDialog } from "@/components/sale/quick-call-confirm-dialog";
import {
  getFunnelGroup,
  FUNNEL_GROUP_LABEL,
  getStageDetailLabel,
  canStartConversion,
} from "@/lib/utils/admissions-funnel";
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
  MessageSquareWarning,
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
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicket[]>([]);
  const [callConfirmOpen, setCallConfirmOpen] = useState(false);

  useEffect(() => {
    const studentId = lead?.converted_student_id;
    if (!open || !studentId) {
      setFeedbackTickets([]);
      return;
    }
    getFeedbackTicketsByStudent(studentId).then(setFeedbackTickets);
  }, [open, lead?.converted_student_id]);

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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
        {/* Header Drawer */}
        <div className="p-6 border-b border-border bg-muted/20">
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20"
              >
                Giai đoạn {getFunnelGroup(lead.stage)}: {FUNNEL_GROUP_LABEL[getFunnelGroup(lead.stage)]} — {getStageDetailLabel(lead.stage)}
              </Badge>

              {lead.missed_calls_count > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[11px] font-bold flex items-center gap-1"
                >
                  <PhoneMissed className="w-3 h-3" />
                  {lead.missed_calls_count} lần gọi nhỡ
                </Badge>
              )}
            </div>

            <SheetTitle className="text-xl font-black text-foreground mt-2">
              {lead.full_name}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Phụ huynh: {lead.parent_name || "Chưa cập nhật"} • SĐT: {lead.phone}
            </SheetDescription>
            <div className="text-xs text-muted-foreground">
              Phụ trách:{" "}
              <span className="font-semibold text-foreground">
                {lead.assigned_sale?.full_name || "Chưa phân công"}
              </span>
            </div>
          </SheetHeader>

          {/* Deep Links Action Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/60">
            <a
              href={`tel:${lead.phone}`}
              onClick={() => setCallConfirmOpen(true)}
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
            <QuickFacebookLink
              lead={lead}
              onSaved={onSuccess}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              addClassName="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted text-foreground hover:bg-indigo-600 hover:text-white transition-colors"
            />

            {/* VÁ LỖI THẬT (2026-09-17): Lead đã "Không có nhu cầu" (dead)
                vẫn hiện icon tiến giai đoạn — khóa tương tự bảng Leads. */}
            {lead.status !== "no_demand" && lead.stage === "potential" && (
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

            {lead.status !== "no_demand" && canStartConversion(lead.stage) && (
              <Button
                size="sm"
                className="text-xs font-bold gap-1 bg-gradient-to-r from-primary to-indigo-600 text-white"
                onClick={() => onStartConversion?.(lead)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {lead.stage === "potential" ? "Chốt học ngay (bỏ qua học thử)" : "Chốt học & VietQR"}
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
        <div className="p-6 sm:p-7 space-y-6 flex-1">
          {/* Thông tin nhu cầu */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5 text-xs">
            <div className="font-bold text-foreground flex items-center gap-2 text-sm">
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
              <div className="p-2.5 rounded-xl bg-muted/40 text-muted-foreground italic text-xs">
                "{lead.note}"
              </div>
            )}
          </div>

          {/* Thay đổi trạng thái nhanh — CHỈ hiện khi Lead chưa Chính thức (N4)
              VÀ chưa bị đóng "Không có nhu cầu". Đã chốt học/vào lớp rồi thì
              trạng thái coi như cố định là "converted"; đã "Không có nhu cầu"
              (thường do tự động sau 3 lần gọi nhỡ) cũng khóa tương tự — tránh
              bấm nhầm 1 trong 3 nút này âm thầm ghi đè quyết định tự động,
              không có cảnh báo gì (bug thật đã phát hiện 2026-09-16, Lead
              "Trần Nhật Tân"). Muốn ghi nhận liên hệ lại thật, dùng form "Ghi
              nhận nhật ký trao đổi" đầy đủ bên dưới — hàm đó tự chuyển đúng
              trạng thái theo kết quả liên hệ thật. */}
          {lead.stage === "enrolled" || lead.stage === "waiting_class" ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              ✓ Đã chốt học chính thức — trạng thái cố định, không thể đổi sang bước trước.
            </div>
          ) : lead.status === "no_demand" ? (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400 font-semibold">
              ✕ Không có nhu cầu — trạng thái cố định, không đổi qua nút nhanh. Nếu khách hàng
              thật sự liên hệ lại, ghi nhận qua form "Ghi nhận nhật ký trao đổi" bên dưới.
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-bold">Chuyển nhanh trạng thái:</Label>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={lead.status === "contacted" ? "default" : "outline"}
                  className="text-xs h-7 px-2.5"
                  disabled={statusLoading}
                  onClick={() => handleUpdateStatus("contacted")}
                >
                  Đã liên hệ
                </Button>
                <Button
                  size="sm"
                  variant={lead.status === "callback" ? "default" : "outline"}
                  className="text-xs h-7 px-2.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                  disabled={statusLoading}
                  onClick={() => handleUpdateStatus("callback")}
                >
                  Hẹn gọi lại
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2.5"
                  disabled={statusLoading}
                  onClick={() => handleUpdateStatus("no_demand")}
                >
                  Không có nhu cầu
                </Button>
              </div>
            </div>
          )}

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
                <Label className="text-xs font-semibold">Kênh liên hệ</Label>
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
                <Label className="text-xs font-semibold">Cảm nhận phụ huynh</Label>
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
                className="text-xs font-semibold cursor-pointer text-destructive flex items-center gap-1"
              >
                <PhoneMissed className="w-3.5 h-3.5" />
                Cuộc gọi nhỡ / Không nhấc máy (Gọi nhỡ 3 lần liên tiếp $\rightarrow$ tự đóng Lead)
              </Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="interactionContent" className="text-xs font-semibold">
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
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <input
                  type="datetime-local"
                  className="px-2 py-1 rounded-lg border border-border bg-background text-xs"
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
            <div className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>Lịch sử chăm sóc ({lead.interactions?.length || 0})</span>
            </div>

            {(!lead.interactions || lead.interactions.length === 0) ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
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
                        <Badge variant="outline" className="text-[11px] uppercase font-bold">
                          {it.channel === "call" && "Cuộc gọi"}
                          {it.channel === "zalo" && "Zalo"}
                          {it.channel === "in_person" && "Trực tiếp"}
                          {it.channel === "email" && "Email"}
                        </Badge>
                        {it.is_missed_call && (
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            Gọi nhỡ
                          </Badge>
                        )}
                        {it.sentiment && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            • {it.sentiment}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
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
                      <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Hẹn gọi lại: {new Date(it.callback_at).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lịch sử phản ánh/góp ý — chỉ hiện khi Lead đã chuyển đổi thành học sinh thật */}
          {lead.converted_student_id && (
            <div className="space-y-3">
              <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <MessageSquareWarning className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Lịch sử phản ánh/góp ý ({feedbackTickets.length})</span>
              </div>

              {feedbackTickets.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-2xl">
                  Chưa có phản ánh/góp ý nào từ học sinh này.
                </div>
              ) : (
                <div className="space-y-2">
                  {feedbackTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl border border-border bg-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            t.status === "resolved"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 text-[11px]"
                              : t.status === "in_progress"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 text-[11px]"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 text-[11px]"
                          }
                        >
                          {t.status === "resolved"
                            ? "Đã xử lý"
                            : t.status === "in_progress"
                            ? "Đang xử lý"
                            : "Mới tiếp nhận"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{t.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <QuickCallConfirmDialog
          leadId={lead.id}
          leadName={lead.full_name}
          missedCallsCount={lead.missed_calls_count}
          open={callConfirmOpen}
          onOpenChange={setCallConfirmOpen}
          onSuccess={() => onSuccess?.()}
        />
      </SheetContent>
    </Sheet>
  );
}
