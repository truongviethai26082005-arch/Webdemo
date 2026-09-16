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
import { logInteraction } from "@/lib/actions/admissions";
import { PhoneCall, PhoneMissed, Loader2, AlertCircle } from "lucide-react";

interface QuickCallConfirmDialogProps {
  leadId: string | null;
  leadName?: string;
  missedCallsCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Xác nhận nhanh kết quả cuộc gọi ngay sau khi bấm "Gọi ngay" — tái dùng
// ĐÚNG logInteraction() đã có sẵn (không viết luồng đếm gọi nhỡ song song):
// mỗi lần chọn "Không nhấc máy" sẽ +1 vào missed_calls_count, tự động chuyển
// "Không có nhu cầu" khi đủ 3 lần liên tiếp — logic này vốn đã tồn tại,
// component này chỉ thêm 1 bước xác nhận nhanh, không cần điền form dài.
export function QuickCallConfirmDialog({
  leadId,
  leadName,
  missedCallsCount = 0,
  open,
  onOpenChange,
  onSuccess,
}: QuickCallConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoNoDemandNote, setAutoNoDemandNote] = useState(false);

  if (!leadId) return null;

  const handleConfirm = async (connected: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await logInteraction({
        leadId,
        channel: "call",
        content: connected
          ? "Gọi nhanh (nút Gọi ngay) — đã liên hệ được."
          : "Gọi nhanh (nút Gọi ngay) — không nhấc máy.",
        isMissedCall: !connected,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (res.autoNoDemand) {
        setAutoNoDemandNote(true);
        onSuccess?.();
        return;
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAutoNoDemandNote(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span>Cuộc gọi vừa rồi thế nào?</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {leadName ? <strong className="text-foreground">{leadName}</strong> : "Khách hàng"} —
            đã gọi nhỡ {missedCallsCount}/3 lần liên tiếp.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {autoNoDemandNote ? (
          <>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              Đã gọi nhỡ đủ 3 lần liên tiếp — hệ thống tự động chuyển Lead này sang trạng thái
              "Không có nhu cầu".
            </div>
            <DialogFooter className="pt-1">
              <Button className="w-full text-xs font-bold" onClick={handleClose}>
                Đã hiểu
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="text-xs font-bold gap-1.5 h-11 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              onClick={() => handleConfirm(true)}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneCall className="w-3.5 h-3.5" />}
              Đã liên hệ được
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="text-xs font-bold gap-1.5 h-11 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => handleConfirm(false)}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneMissed className="w-3.5 h-3.5" />}
              Không nhấc máy
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
