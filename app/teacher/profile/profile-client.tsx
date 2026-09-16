"use client";

import { useState } from "react";
import { User, Phone, Lock, Save, CalendarCheck, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProfile, updatePassword } from "@/lib/actions/auth";
import { formatVND } from "@/lib/utils/vietqr";

interface TeacherProfileClientProps {
  profile: any;
  completedSessionsCount: number;
}

export function TeacherProfileClient({
  profile,
  completedSessionsCount,
}: TeacherProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("phone", phone);

    const res = await updateProfile(formData);
    setProfileLoading(false);

    if (res.error) {
      setProfileMessage(`❌ ${res.error}`);
    } else {
      setProfileMessage("✅ Cập nhật thông tin thành công!");
    }
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    const formData = new FormData();
    formData.append("password", newPassword);

    const res = await updatePassword(formData);
    setPasswordLoading(false);

    if (res.error) {
      setPasswordMessage(`❌ ${res.error}`);
    } else {
      setPasswordMessage("✅ Đổi mật khẩu thành công!");
      setNewPassword("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Monthly Teaching Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Số buổi dạy hoàn thành tháng này
              </span>
              <p className="text-3xl font-black text-primary mt-1">
                {completedSessionsCount} <span className="text-sm font-normal text-muted-foreground">buổi</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Mức thù lao mỗi buổi dạy
              </span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatVND(profile?.salary_per_session || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Form */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-5 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Thông tin Cá nhân
          </CardTitle>
          <CardDescription className="text-xs">
            Cập nhật tên hiển thị và số điện thoại liên hệ
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            {profileMessage && (
              <div className="p-3 rounded-lg bg-muted text-xs font-semibold">
                {profileMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Họ và tên</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Số điện thoại</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                className="h-10 font-mono"
              />
            </div>

            <Button type="submit" disabled={profileLoading} className="gap-2 text-xs font-semibold">
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi thông tin
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-5 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Đổi Mật khẩu Đăng nhập
          </CardTitle>
          <CardDescription className="text-xs">
            Thiết lập mật khẩu mới cho tài khoản của bạn (tối thiểu 6 ký tự)
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5">
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            {passwordMessage && (
              <div className="p-3 rounded-lg bg-muted text-xs font-semibold">
                {passwordMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mật khẩu mới</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-10 font-mono"
              />
            </div>

            <Button type="submit" disabled={passwordLoading || !newPassword} className="gap-2 text-xs font-semibold">
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Cập nhật Mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
