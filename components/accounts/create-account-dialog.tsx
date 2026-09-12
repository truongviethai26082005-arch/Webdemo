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
import { createAccountByAdmin } from "@/lib/actions/auth";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

interface CreateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Quản trị viên (Admin)" },
  { value: "teacher", label: "Giáo viên" },
  { value: "sale", label: "Tuyển sinh (Sale)" },
  { value: "student", label: "Học sinh" },
];

export function CreateAccountDialog({ isOpen, onClose, students }: CreateAccountDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("sale");
  const [studentId, setStudentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const studentsWithoutLogin = (students || []).filter((s) => !s.auth_user_id);

  function resetAndClose() {
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("sale");
    setStudentId("");
    setError(null);
    setSuccess(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await createAccountByAdmin({
      email,
      password: password || undefined,
      fullName,
      role: role as any,
      phone: phone || undefined,
      studentId: role === "student" && studentId ? studentId : undefined,
    });

    setLoading(false);

    // Luôn kiểm tra result.error trước khi coi là thành công (AGENTS.md Mục 3)
    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(`Đã tạo tài khoản thành công cho ${fullName} (${email})`);
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setStudentId("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-2xl border border-border/80">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Tạo tài khoản mới</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Cấp quyền đăng nhập cho 1 người dùng mới
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
              Vai trò <strong className="text-destructive">*</strong>
            </Label>
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setStudentId(""); }}
              className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {role === "student" && (
            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/80">
              <Label className="text-xs font-semibold text-foreground">
                Liên kết với học sinh đã có sẵn (không bắt buộc)
              </Label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Không chọn: tạo mới hồ sơ học sinh --</option>
                {studentsWithoutLogin.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Chọn 1 học sinh đã ghi danh để gắn tài khoản đăng nhập cho đúng hồ sơ đó. Để trống nếu muốn tạo hồ sơ học sinh mới.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Họ và tên <strong className="text-destructive">*</strong>
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Thị Lan"
              required
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Email đăng nhập <strong className="text-destructive">*</strong>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@educenter.vn"
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Mật khẩu ban đầu <strong className="text-destructive">*</strong>
              </Label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
                className="h-9 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Số điện thoại</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987654321"
              className="h-9 text-xs font-mono rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={resetAndClose} disabled={loading} className="text-xs rounded-xl h-9 px-4">
              Đóng
            </Button>
            <Button type="submit" size="sm" disabled={loading || !fullName || !email || !password} className="text-xs font-bold rounded-xl h-9 px-5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
