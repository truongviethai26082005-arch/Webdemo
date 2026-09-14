"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CallbackTaskItem, completeCallbackTask } from "@/lib/actions/admissions";
import { LeadStatus } from "@/types/database";
import { PhoneCall, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface CallbackResolutionDialogProps {
  task: CallbackTaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CallbackResolutionDialog({
  task,
  open,
  onOpenChange,
  onSuccess,
}: CallbackResolutionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resolutionNote, setResolutionNote] = useState("");
  const [nextStatus, setNextStatus] = useState<LeadStatus>("contacted");

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      setError("Vui lòng nhập kết quả cuộc gọi trao đổi lại với phụ huynh");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await completeCallbackTask(
        task.id,
        task.leadId,
        resolutionNote.trim(),
        nextStatus
      );

      // BẮT BUỘC: Kiểm tra res?.error
      if (res?.error) {
        setError(res.error);
        return;
      }

      setResolutionNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span>Ghi Nhận Kết Quả Cuộc Hẹn Gọi Lại</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Học sinh: <strong className="text-foreground">{task.studentName}</strong> • SĐT:{" "}
            {task.phone} • Lần trước: "{task.lastContent}"
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Cập nhật trạng thái khách hàng</Label>
            <Select
              value={nextStatus}
              onValueChange={(val) => setNextStatus(val as LeadStatus)}
              disabled={loading}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacted">Đã liên hệ lại (Đang trao đổi thêm)</SelectItem>
                <SelectItem value="callback">Vẫn cần hẹn gọi lại lần khác</SelectItem>
                <SelectItem value="no_demand">Không có nhu cầu học nữa</SelectItem>
                <SelectItem value="converted">Đồng ý đăng ký học / Chốt gói</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resNote" className="text-xs font-semibold">
              Nội dung trao đổi cuộc gọi lại <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="resNote"
              placeholder="Phụ huynh đồng ý cho con học thử vào cuối tuần, phụ huynh yêu cầu giảm giá..."
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              disabled={loading}
              className="text-xs"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-bold gap-1.5">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Hoàn thành nhiệm vụ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
