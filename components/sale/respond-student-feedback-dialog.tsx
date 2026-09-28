"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { respondToStudentFeedback } from "@/lib/actions/feedback";
import type { StudentFeedbackWithStudent } from "@/lib/actions/feedback";
import { AlertCircle } from "lucide-react";

interface RespondStudentFeedbackDialogProps {
  feedback: StudentFeedbackWithStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RespondStudentFeedbackDialog({ feedback, open, onOpenChange, onSuccess }: RespondStudentFeedbackDialogProps) {
  const [status, setStatus] = useState<"pending" | "processing" | "resolved">("processing");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next && feedback) {
      setStatus((feedback.status as any) === "resolved" ? "resolved" : "processing");
      setResponse(feedback.admin_response || "");
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit() {
    if (!feedback) return;
    setLoading(true);
    setError(null);

    const result = await respondToStudentFeedback({
      id: feedback.id,
      status,
      adminResponse: response,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    onSuccess();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Trả lời phản hồi học sinh</DialogTitle>
          <DialogDescription className="text-xs">
            {feedback?.student_name} — {feedback?.title}
          </DialogDescription>
        </DialogHeader>

        {feedback && (
          <div className="space-y-4 pt-2">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground/90">
              {feedback.content}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trạng thái xử lý</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chưa xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phản hồi cho học sinh *</Label>
              <Textarea
                placeholder="Nội dung phản hồi/hướng xử lý gửi cho học sinh..."
                value={response}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponse(e.target.value)}
                rows={4}
                className="text-xs rounded-xl resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading} className="text-xs rounded-xl">
            Hủy
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={loading} className="text-xs font-bold rounded-xl">
            {loading ? "Đang lưu..." : "Lưu phản hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
