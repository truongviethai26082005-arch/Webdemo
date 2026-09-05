"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Lock, Mail, Eye, EyeOff, Loader2, Sparkles, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-tr from-slate-100 via-indigo-50/40 to-slate-50 dark:from-background dark:via-background dark:to-muted/20 relative overflow-hidden">
      {/* Soft background ambient rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-background/80 border border-transparent hover:border-border/60 backdrop-blur-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Quay lại Trang chủ</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-3 ring-4 ring-primary/10">
            <School className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">EduCenter Pro</h1>
          <p className="text-xs text-muted-foreground mt-1">Hệ thống Quản lý Lớp học & Điểm danh Thông minh</p>
        </div>

        <Card className="shadow-card border-border/80 bg-card/95 backdrop-blur-md rounded-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-lg font-bold text-foreground">Đăng nhập tài khoản</CardTitle>
            <CardDescription className="text-xs">
              Truy cập bảng điều khiển trung tâm và lịch giảng dạy
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email đăng nhập</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@educenter.vn"
                    required
                    className="pl-10 h-11 bg-background"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">Mật khẩu</Label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 h-11 bg-background font-mono"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-11 font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/25 rounded-xl transition-all hover:shadow-lg"
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

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật dữ liệu điểm danh và học phí 24/7</span>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          © {new Date().getFullYear()} EduCenter Pro. Phiên bản Desktop tối ưu.
        </p>
      </div>
    </div>
  );
}
