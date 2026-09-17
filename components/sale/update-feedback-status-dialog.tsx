"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { updateFeedbackTicketStatus } from "@/lib/actions/feedback";
import { FeedbackStatus, FeedbackTicket } from "@/types/database";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface UpdateFeedbackStatusDialogProps {
  ticket: FeedbackTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "Mới tiếp nhận",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý xong",
};

export function UpdateFeedbackStatusDialog({
  ticket,
  open,
  onOpenChange,
  onSuccess,
}: UpdateFeedbackStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedbackStatus>(ticket?.status || "new");
  const [note, setNote] = useState(ticket?.resolution_note || "");

  const handleOpenChange = (isOpen: boolean) => {
    if (!loading) {
      onOpenChange(isOpen);
      if (isOpen && ticket) {
        setStatus(ticket.status);
        setNote(ticket.resolution_note || "");
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setError(null);
    setLoading(true);
    try {
      const result = await updateFeedbackTicketStatus({
        id: ticket.id,
        status,
        resolutionNote: note,
      });

      if (result?.error) {
        setError(result.error);
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

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>Cập nhật xử lý</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {ticket.contact_name} — {ticket.contact_phone}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 text-muted-foreground italic">
            &quot;{ticket.content}&quot;
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Trạng thái xử lý</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as FeedbackStatus)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolutionNote" className="text-xs font-semibold">
              Ghi chú xử lý
            </Label>
            <Textarea
              id="resolutionNote"
              placeholder="Đã liên hệ giáo viên bộ môn, đã đổi lịch học bù..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2 pt-3">
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
              Lưu cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
