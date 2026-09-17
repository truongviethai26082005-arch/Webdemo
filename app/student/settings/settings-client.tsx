"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  StudentProfileSettingsData,
  updateStudentProfile,
} from "@/lib/actions/student";
import {
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
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
  Save,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentSettingsClientProps {
  initialProfile: StudentProfileSettingsData | null;
}

interface ToastMessage {
  type: "success" | "error";
  title: string;
  message: string;
}

export function StudentSettingsClient({
  initialProfile,
}: StudentSettingsClientProps) {
  // Tab state: "profile" | "password" | "all"
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "all">("all");

  // Profile data & edit form state
  const [profile, setProfile] = useState<StudentProfileSettingsData | null>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile?.full_name || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Floating Toast Notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Format ngày tham gia
  const formattedJoinDate = (() => {
    if (!profile?.created_at) return "Chưa cập nhật";
    try {
      const date = new Date(profile.created_at);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return "Chưa cập nhật";
    }
  })();

  // Handler: Cập nhật thông tin hồ sơ (Họ tên, SĐT) qua Server Action
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      const msg = "Họ và tên phải có tối thiểu 2 ký tự.";
      setProfileError(msg);
      setToast({ type: "error", title: "Lỗi thông tin", message: msg });
      return;
    }

    if (trimmedPhone && trimmedPhone.length > 0) {
      const cleaned = trimmedPhone.replace(/[\s\-\.\(\)]/g, "");
      if (!/^\+?[0-9]{9,12}$/.test(cleaned)) {
        const msg = "Số điện thoại không hợp lệ (cần từ 9 đến 12 chữ số).";
        setProfileError(msg);
        setToast({ type: "error", title: "Lỗi thông tin", message: msg });
        return;
      }
    }

    try {
      setIsUpdatingProfile(true);
      const res = await updateStudentProfile({
        full_name: trimmedName,
        phone: trimmedPhone,
      });

      if (res?.error) {
        setProfileError(res.error);
        setToast({
          type: "error",
          title: "Cập nhật thất bại",
          message: res.error,
        });
        return;
      }

      setProfileSuccess("Cập nhật thông tin hồ sơ học viên thành công!");
      setToast({
        type: "success",
        title: "Thành công",
        message: "Hồ sơ của bạn đã được cập nhật trên hệ thống.",
      });

      // Cập nhật state cục bộ
      if (profile) {
        setProfile({
          ...profile,
          full_name: trimmedName,
          phone: trimmedPhone,
        });
      }
    } catch (err: any) {
      const msg = err?.message || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";
      setProfileError(msg);
      setToast({ type: "error", title: "Lỗi hệ thống", message: msg });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handler: Đổi mật khẩu gọi trực tiếp qua Supabase Client Auth API
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate mật khẩu: Tối thiểu 6 ký tự
    if (!newPassword || newPassword.trim().length < 6) {
      const msg = "Mật khẩu mới phải có tối thiểu 6 ký tự.";
      setPasswordError(msg);
      setToast({ type: "error", title: "Mật khẩu không hợp lệ", message: msg });
      return;
    }

    // Validate 2 mật khẩu khớp nhau
    if (newPassword !== confirmPassword) {
      const msg = "Xác nhận mật khẩu không khớp với mật khẩu mới.";
      setPasswordError(msg);
      setToast({ type: "error", title: "Mật khẩu không khớp", message: msg });
      return;
    }

    try {
      setIsUpdatingPassword(true);

      // Gọi trực tiếp Supabase client auth API
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const errorMsg =
          error.message === "New password should be different from the old password."
            ? "Mật khẩu mới phải khác với mật khẩu cũ."
            : error.message || "Đổi mật khẩu thất bại. Vui lòng thử lại sau.";
        setPasswordError(errorMsg);
        setToast({
          type: "error",
          title: "Đổi mật khẩu thất bại",
          message: errorMsg,
        });
        return;
      }

      const successMsg = "Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới cho các lần đăng nhập tiếp theo.";
      setPasswordSuccess(successMsg);
      setToast({
        type: "success",
        title: "Đổi mật khẩu thành công",
        message: "Mật khẩu đăng nhập của bạn đã được cập nhật an toàn.",
      });

      // Xóa trắng các ô nhập sau khi đổi thành công
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
      setPasswordError(msg);
      setToast({ type: "error", title: "Lỗi hệ thống", message: msg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const studentInitial = (fullName || profile?.full_name || "H")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-6 relative">
      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3.5 transition-all ${
              toast.type === "success"
                ? "bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10"
                : "bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 shadow-rose-500/10"
            }`}
          >
            {toast.type === "success" ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-muted rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "all"
              ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
          }`}
        >
          <span>Tất cả</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "profile"
              ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Hồ sơ học viên</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "password"
              ? "bg-white dark:bg-card text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Đổi mật khẩu</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* KHỐI 1: THÔNG TIN HỒ SƠ HỌC VIÊN */}
      {/* ========================================== */}
      {(activeTab === "all" || activeTab === "profile") && (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-6 animate-in fade-in-50">
          {/* Header Card Hồ sơ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                {studentInitial}
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Thông tin hồ sơ học viên</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    Định danh
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Thông tin cá nhân được ghi nhận trong cơ sở dữ liệu đào tạo của trung tâm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Mã HV: {profile?.student_code || "#HV-2026"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Gia nhập: {formattedJoinDate}</span>
              </span>
            </div>
          </div>

          {/* Inline Feedback cho Profile */}
          {profileError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Không thể cập nhật hồ sơ</p>
                <p>{profileError}</p>
              </div>
            </div>
          )}

          {profileSuccess && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Thao tác thành công</p>
                <p>{profileSuccess}</p>
              </div>
            </div>
          )}

          {/* Form thông tin học viên */}
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ và tên (Cho phép chỉnh sửa) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="full-name"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Họ và tên</span>
                  <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Nhập họ và tên học viên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isUpdatingProfile}
                  className="text-xs border-slate-200 dark:border-border font-medium focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Tên hiển thị trên bảng điểm danh, kết quả test và giao diện hệ thống.
                </p>
              </div>

              {/* Số điện thoại (Cho phép chỉnh sửa) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="phone-number"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Số điện thoại liên hệ</span>
                </Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="Nhập số điện thoại học viên hoặc phụ huynh"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isUpdatingProfile}
                  className="text-xs border-slate-200 dark:border-border font-medium focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                />
                <p className="text-[11px] text-muted-foreground">
                  Dùng để nhận tin nhắn thông báo lịch học, kết quả thi và thông báo khẩn cấp.
                </p>
              </div>

              {/* Mã học viên (READ-ONLY) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="student-code"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mã học viên / Mã sinh viên</span>
                  </Label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Chỉ đọc
                  </span>
                </div>
                <Input
                  id="student-code"
                  readOnly
                  disabled
                  value={profile?.student_code || "#HV-2026"}
                  className="bg-slate-50/90 dark:bg-slate-900/50 text-foreground font-semibold text-xs cursor-not-allowed border-slate-200 dark:border-border border-dashed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Mã định danh duy nhất do hệ thống cấp, không thể thay đổi.
                </p>
              </div>

              {/* Email tài khoản (READ-ONLY) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="student-email"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email đăng nhập</span>
                  </Label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Chỉ đọc
                  </span>
                </div>
                <Input
                  id="student-email"
                  readOnly
                  disabled
                  value={profile?.email || "Chưa cập nhật"}
                  className="bg-slate-50/90 dark:bg-slate-900/50 text-foreground font-semibold text-xs cursor-not-allowed border-slate-200 dark:border-border border-dashed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email dùng để đăng nhập hệ thống và nhận chứng chỉ.
                </p>
              </div>

              {/* Ngày tham gia (READ-ONLY) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="join-date"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ngày tham gia trung tâm</span>
                  </Label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Chỉ đọc
                  </span>
                </div>
                <Input
                  id="join-date"
                  readOnly
                  disabled
                  value={formattedJoinDate}
                  className="bg-slate-50/90 dark:bg-slate-900/50 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border border-dashed"
                />
              </div>

              {/* Thông tin phụ huynh (nếu có) */}
              {profile?.parent_name && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="parent-name"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phụ huynh / Người bảo hộ</span>
                  </Label>
                  <Input
                    id="parent-name"
                    readOnly
                    disabled
                    value={profile.parent_name}
                    className="bg-slate-50/90 dark:bg-slate-900/50 text-foreground font-medium text-xs cursor-not-allowed border-slate-200 dark:border-border border-dashed"
                  />
                </div>
              )}
            </div>

            {/* Lưu ý thông tin */}
            <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 p-4 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-950 dark:text-blue-100">
                  Chính sách bảo toàn tính toàn vẹn dữ liệu
                </p>
                <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed">
                  Mã học viên và Email tài khoản được đặt ở trạng thái chỉ đọc để đảm bảo lịch sử điểm danh, bảng điểm thi và hoá đơn học phí được bảo toàn chính xác. Nếu cần đổi Email tài khoản, vui lòng liên hệ phòng Giáo vụ trung tâm.
                </p>
              </div>
            </div>

            {/* Nút Submit cập nhật hồ sơ */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang cập nhật hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi hồ sơ</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* KHỐI 2: ĐỔI MẬT KHẨU TÀI KHOẢN */}
      {/* ========================================== */}
      {(activeTab === "all" || activeTab === "password") && (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border p-6 shadow-xs space-y-6 animate-in fade-in-50">
          <div className="pb-4 border-b border-slate-100 dark:border-border/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/50 shrink-0">
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

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mã hóa Auth an toàn</span>
            </span>
          </div>

          {/* Inline Thông báo lỗi / thành công đổi mật khẩu */}
          {passwordError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Không thể đổi mật khẩu</p>
                <p>{passwordError}</p>
              </div>
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Thao tác thành công</p>
                <p>{passwordSuccess}</p>
              </div>
            </div>
          )}

          {/* Form đổi mật khẩu */}
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <Label
                htmlFor="new-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Mật khẩu mới</span>
                <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 - 8 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  className="pr-10 text-xs border-slate-200 dark:border-border focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
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
                Mật khẩu cần dài tối thiểu 6 ký tự (khuyến khích từ 8 ký tự trở lên kết hợp chữ và số).
              </p>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Xác nhận mật khẩu mới</span>
                <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới vừa nhập ở trên"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  className="pr-10 text-xs border-slate-200 dark:border-border focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
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

            {/* Nút Submit đổi mật khẩu */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang cập nhật mật khẩu...</span>
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
      )}
    </div>
  );
}
