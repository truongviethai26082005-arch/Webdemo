"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions/auth";
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error and states when modal opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      setShowPassword(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await signIn(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.success) {
        // Redirection based on role:
        // admin -> /admin/dashboard
        // teacher -> /teacher/schedule
        const targetUrl =
          result.redirectUrl ||
          (result.role === "admin" ? "/admin/dashboard" : "/teacher/schedule");

        router.push(targetUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại."
      );
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/20 backdrop-blur-sm"
        className="sm:max-w-md p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/40 bg-gradient-to-br from-white/60 via-white/30 to-white/10 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_0_rgba(31,38,135,0.15),inset_0_1px_1px_0_rgba(255,255,255,0.9),inset_0_0_20px_0_rgba(255,255,255,0.3)] text-slate-900 [&>button]:text-slate-600 [&>button]:hover:text-slate-900 [&>button]:hover:bg-white/60 [&>button]:p-1.5 [&>button]:rounded-full [&>button]:transition-all"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <DialogHeader className="text-center space-y-1.5 pb-2">
          {/* Brand Icon with frosted ring */}
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-2 ring-white/80 mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 text-center">
            Đăng nhập tài khoản
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-700 font-medium text-center">
            Truy cập bảng điều khiển trung tâm và lịch giảng dạy
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/40 text-rose-700 backdrop-blur-md text-xs flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="modal-email"
              className="text-xs font-semibold text-slate-800"
            >
              Email đăng nhập
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="modal-email"
                name="email"
                type="email"
                placeholder="admin@educenter.vn"
                required
                autoComplete="email"
                className="pl-10 h-11 bg-white/60 border-white/80 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 backdrop-blur-sm text-sm rounded-xl transition-all shadow-xs"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="modal-password"
                className="text-xs font-semibold text-slate-800"
              >
                Mật khẩu
              </Label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="modal-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="pl-10 pr-10 h-11 bg-white/60 border-white/80 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-mono text-sm rounded-xl transition-all shadow-xs"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 rounded-xl transition-all hover:shadow-xl hover:scale-[1.005] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Bảo mật dữ liệu điểm danh và học phí 24/7</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
