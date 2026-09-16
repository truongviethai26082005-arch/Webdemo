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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetStudentPassword } from "@/lib/actions/students";
import { StudentAccountItem } from "@/lib/actions/accounts";
import { KeyRound, Loader2, AlertCircle, Copy, Check, Sparkles } from "lucide-react";

interface ResetPasswordDialogProps {
  target: StudentAccountItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  target,
  open,
  onOpenChange,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  if (!target) return null;

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError("Mật khẩu mới phải có tối thiểu 8 ký tự");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await resetStudentPassword(target.id, password);

      // BẮT BUỘC: Kiểm tra res?.error
      if (res?.error) {
        setError(res.error);
        return;
      }

      setPassword("");
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
              <KeyRound className="w-4 h-4" />
            </div>
            <span>Đặt Lại Mật Khẩu Học Sinh</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Học sinh: <strong className="text-foreground">{target.full_name}</strong> • Email:{" "}
            <span className="font-mono text-foreground">{target.email}</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="newPassword" className="text-xs font-semibold">
                Mật khẩu mới (tối thiểu 8 ký tự) <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3" />
                Sinh ngẫu nhiên
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                id="newPassword"
                type="text"
                placeholder="Nhập mật khẩu mới..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyPassword}
                disabled={!password}
                className="shrink-0 h-9 w-9"
                title="Sao chép mật khẩu"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
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
              Lưu mật khẩu mới
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
