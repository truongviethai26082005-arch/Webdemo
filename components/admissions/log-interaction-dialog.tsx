"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Phone, Calendar, Clock, Sparkles } from "lucide-react";
import {
  Lead,
  InteractionLog,
  InteractionChannel,
  FeedbackSentiment,
} from "@/types/admissions";

interface LogInteractionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  defaultLeadId?: string;
  onAddLog: (log: InteractionLog, updatedLeadStatus?: string) => void;
}

const CHANNELS: { value: InteractionChannel; label: string; icon: string }[] = [
  { value: "call", label: "Gọi điện thoại", icon: "📞" },
  { value: "zalo", label: "Nhắn tin Zalo", icon: "💬" },
  { value: "in_person", label: "Gặp trực tiếp tại TT", icon: "🏢" },
  { value: "email", label: "Gửi Email", icon: "✉️" },
];

const SENTIMENTS: { value: FeedbackSentiment; label: string; badgeColor: string }[] = [
  { value: "high_interest", label: "Quan tâm cao / Hào hứng", badgeColor: "text-emerald-600" },
  { value: "price_concern", label: "Đắn đo học phí", badgeColor: "text-amber-600" },
  { value: "schedule_conflict", label: "Trùng lịch học thêm", badgeColor: "text-purple-600" },
  { value: "need_consult", label: "Cần trao đổi thêm với vợ/chồng", badgeColor: "text-blue-600" },
  { value: "other", label: "Khác", badgeColor: "text-muted-foreground" },
];

export function LogInteractionDialog({
  isOpen,
  onClose,
  leads,
  defaultLeadId,
  onAddLog,
}: LogInteractionDialogProps) {
  const [selectedLeadId, setSelectedLeadId] = useState(defaultLeadId || "");
  const [channel, setChannel] = useState<InteractionChannel>("call");
  const [staffName, setStaffName] = useState("Trần Thu Hà");
  const [sentiment, setSentiment] = useState<FeedbackSentiment>("high_interest");
  const [content, setContent] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [updateStatus, setUpdateStatus] = useState("contacted");

  useEffect(() => {
    if (defaultLeadId) {
      setSelectedLeadId(defaultLeadId);
      const matched = leads.find((l) => l.id === defaultLeadId);
      if (matched) setStaffName(matched.assignedStaff);
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
      setStaffName(leads[0].assignedStaff);
    }
  }, [defaultLeadId, leads, selectedLeadId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) {
      alert("Vui lòng chọn học viên tiềm năng!");
      return;
    }
    if (!content.trim()) {
      alert("Vui lòng ghi lại nội dung cuộc trao đổi!");
      return;
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: InteractionLog = {
      id: `log-${Date.now()}`,
      leadId: lead.id,
      leadName: `${lead.studentName} (${lead.parentName})`,
      parentPhone: lead.parentPhone,
      channel,
      staffName,
      date: dateFormatted,
      sentiment,
      content: content.trim(),
      nextAction: nextAction.trim() || "Tiếp tục theo dõi",
      reminderAt: reminderAt ? reminderAt.replace("T", " ") : undefined,
      isCompleted: false,
    };

    onAddLog(newLog, updateStatus);
    onClose();

    // Reset
    setContent("");
    setNextAction("");
    setReminderAt("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <MessageSquarePlus className="w-5 h-5" />
            <span>Ghi Nhận Nhật Ký Tư Vấn & Chăm Sóc (CRM Log)</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Lưu vết điểm chạm giữa tư vấn viên và phụ huynh, ghi nhận phản hồi và đặt lịch nhắc hẹn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Chọn học sinh */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Học sinh / Phụ huynh liên hệ</Label>
            <select
              value={selectedLeadId}
              onChange={(e) => {
                setSelectedLeadId(e.target.value);
                const matched = leads.find((l) => l.id === e.target.value);
                if (matched) setStaffName(matched.assignedStaff);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.studentName} - {l.parentName} ({l.parentPhone}) - [{l.targetSubject}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hình thức tương tác</Label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as InteractionChannel)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tư vấn viên phụ trách</Label>
              <Input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mức độ / Phản hồi chính</Label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as FeedbackSentiment)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SENTIMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cập nhật trạng thái Lead</Label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-semibold text-primary"
              >
                <option value="contacted">Đã liên hệ / Đang chăm sóc</option>
                <option value="callback">Hẹn gọi lại sau</option>
                <option value="no_answer">Không nghe máy</option>
                <option value="trial_scheduled">Chuyển sang Học thử</option>
                <option value="failed">Thất bại / Không phù hợp</option>
              </select>
            </div>
          </div>

          {/* Nội dung chi tiết */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Nội dung cuộc trao đổi & Ghi chú phản hồi của PH{" "}
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Ví dụ thực tế</span>
            </div>
            <textarea
              required
              rows={3}
              placeholder="VD: Mẹ khen trung tâm gần nhà, nhưng chê học phí hơi đắt so với mặt bằng, hẹn sang tuần tới xem cơ sở vật chất rồi quyết định..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Hành động tiếp theo & Nhắc hẹn */}
          <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Kế hoạch hành động tiếp theo & Đặt lịch nhắc hẹn (Reminder)
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Hành động tiếp theo (Next Action)
              </Label>
              <Input
                placeholder="VD: Gọi lại tối thứ 6 sau 20h / Gửi bảng lộ trình cam kết qua Zalo"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Đặt lịch nhắc hẹn tư vấn viên gọi lại (Reminder)
              </Label>
              <Input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Lưu nhật ký chăm sóc
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
