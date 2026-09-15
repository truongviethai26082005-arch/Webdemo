"use client";

import { useState } from "react";
import {
  StudentProfileSettingsData,
  updateStudentPassword,
} from "@/lib/actions/student";
import {
  User,
  Mail,
  Phone,
  Hash,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  KeyRound,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentSettingsClientProps {
  initialProfile: StudentProfileSettingsData | null;
}

export function StudentSettingsClient({
  initialProfile,
}: StudentSettingsClientProps) {
  // Profile Data
  const profile = initialProfile;

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!newPassword || newPassword.trim().length < 6) {
      setErrorMessage("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await updateStudentPassword(newPassword);

      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }

      setSuccessMessage(
        "Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới cho các lần đăng nhập sau."
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const studentName = profile?.full_name || "Học viên";
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* PHẦN 1: THÔNG TIN TÀI KHOẢN (READ-ONLY) */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {studentInitial}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Hồ sơ học viên</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Đã xác thực
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Thông tin định danh của học viên trong hệ thống trung tâm
              </p>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span>Mã HV: {profile?.student_code || "#HV-2026"}</span>
            </span>
          </div>
        </div>

        {/* Lưới thông tin chỉ đọc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Họ và tên</span>
            </Label>
            <div className="relative">
              <Input
                readOnly
                disabled
                value={profile?.full_name || ""}
                className="bg-slate-50/80 dark:bg-slate-900/40 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border"
              />
            </div>
          </div>

          {/* Mã học viên */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Mã học viên</span>
            </Label>
            <Input
              readOnly
              disabled
              value={profile?.student_code || ""}
              className="bg-slate-50/80 dark:bg-slate-900/40 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border"
            />
          </div>

          {/* Email đăng nhập */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email tài khoản</span>
            </Label>
            <Input
              readOnly
              disabled
              value={profile?.email || "Chưa cập nhật"}
              className="bg-slate-50/80 dark:bg-slate-900/40 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Số điện thoại liên hệ</span>
            </Label>
            <Input
              readOnly
              disabled
              value={profile?.phone || "Chưa cập nhật"}
              className="bg-slate-50/80 dark:bg-slate-900/40 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border"
            />
          </div>

          {/* Thông tin phụ huynh (nếu có) */}
          {profile?.parent_name && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Phụ huynh / Người bảo hộ</span>
              </Label>
              <Input
                readOnly
                disabled
                value={profile.parent_name}
                className="bg-slate-50/80 dark:bg-slate-900/40 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border"
              />
            </div>
          )}

          {profile?.parent_phone && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Số điện thoại phụ huynh</span>
              </Label>
              <Input
                readOnly
                disabled
                value={profile.parent_phone}
                className="bg-slate-50/80 dark:bg-slate-900/40 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border"
              />
            </div>
          )}
        </div>

        {/* Khối ghi chú liên hệ giáo vụ */}
        <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 p-4 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-950 dark:text-blue-100">
              Lưu ý về cập nhật thông tin cá nhân
            </p>
            <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed">
              Các thông tin định danh (Họ tên, SĐT, Email, Phụ huynh) được quản lý tập trung nhằm đảm bảo quyền lợi điểm danh và chứng chỉ học tập.
              Nếu cần đính chính hoặc cập nhật thông tin, vui lòng <strong>liên hệ trực tiếp phòng Giáo vụ trung tâm</strong> hoặc trao đổi với giáo viên chủ nhiệm.
            </p>
          </div>
        </div>
      </div>

      {/* PHẦN 2: FORM ĐỔI MẬT KHẨU */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100 dark:border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/50">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Đổi mật khẩu tài khoản
              </h2>
              <p className="text-xs text-muted-foreground">
                Cập nhật mật khẩu định kỳ để nâng cao tính bảo mật cho tài khoản học viên
              </p>
            </div>
          </div>
        </div>

        {/* Thông báo lỗi / thành công */}
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Không thể đổi mật khẩu</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Thao tác thành công</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Form đổi mật khẩu */}
        <form onSubmit={handleSubmitPassword} className="space-y-4 max-w-xl">
          {/* Mật khẩu mới */}
          <div className="space-y-1.5">
            <Label
              htmlFor="new-password"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Mật khẩu mới</span>
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10 text-xs border-slate-200 dark:border-border"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mật khẩu cần dài tối thiểu 6 ký tự, nên kết hợp cả chữ và số.
            </p>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Xác nhận mật khẩu mới</span>
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10 text-xs border-slate-200 dark:border-border"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lưu mật khẩu mới</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
