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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetStudentPassword } from "@/lib/actions/students";
import { KeyRound, Loader2, AlertCircle } from "lucide-react";

interface ResetStudentPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  studentName: string;
}

export function ResetStudentPasswordDialog({ isOpen, onClose, studentId, studentName }: ResetStudentPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetAndClose() {
    setPassword("");
    setError(null);
    setSuccess(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await resetStudentPassword(studentId, password);

    setLoading(false);

    // Luôn kiểm tra result.error trước khi coi là thành công (AGENTS.md Mục 3)
    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(`Đã đổi mật khẩu cho ${studentName}. Hãy báo lại mật khẩu mới cho học sinh/phụ huynh.`);
    setPassword("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-sm bg-card rounded-2xl p-6 shadow-2xl border border-border/80">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Đổi mật khẩu học sinh</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {studentName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Mật khẩu mới <strong className="text-destructive">*</strong>
            </Label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
              minLength={8}
              className="h-9 text-xs font-mono rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={resetAndClose} disabled={loading} className="text-xs rounded-xl h-9 px-4">
              Đóng
            </Button>
            <Button type="submit" size="sm" disabled={loading || !password} className="text-xs font-bold rounded-xl h-9 px-5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Đổi mật khẩu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
