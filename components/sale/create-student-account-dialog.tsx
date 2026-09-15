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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccountByAdmin } from "@/lib/actions/auth";
import { KeyRound, Loader2, AlertCircle, Copy, Check, Sparkles } from "lucide-react";

interface CreateStudentAccountDialogProps {
  students: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateStudentAccountDialog({
  students,
  open,
  onOpenChange,
  onSuccess,
}: CreateStudentAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const studentsWithoutLogin = (students || []).filter((s) => !s.auth_user_id);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSelectExisting = (sId: string) => {
    setSelectedStudentId(sId);
    if (sId === "new_student") {
      setFullName("");
      setPhone("");
      return;
    }
    const found = students.find((s) => s.id === sId);
    if (found) {
      setFullName(found.full_name);
      setPhone(found.parent_phone || "");
    }
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setSelectedStudentId("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || password.length < 8) {
      setError("Vui lòng nhập email và mật khẩu (tối thiểu 8 ký tự)");
      return;
    }

    if (!fullName.trim()) {
      setError("Vui lòng nhập tên học sinh");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await createAccountByAdmin({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        role: "student",
        phone: phone.trim() || undefined,
        studentId: selectedStudentId && selectedStudentId !== "new_student" ? selectedStudentId : undefined,
      });

      // BẮT BUỘC: Kiểm tra res?.error trước khi coi là thành công
      if (res?.error) {
        setError(res.error);
        return;
      }

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!loading) {
          if (!isOpen) resetForm();
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <span>Cấp Tài Khoản Đăng Nhập Cho Học Sinh</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Chỉ cấp quyền vai trò Học sinh (Student). Mật khẩu bắt buộc từ 8 ký tự trở lên.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Gán cho học sinh trong hệ thống</Label>
            <Select
              value={selectedStudentId}
              onValueChange={handleSelectExisting}
              disabled={loading}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Chọn học sinh chưa có tài khoản..." />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                <SelectItem value="new_student">-- Tạo mới học sinh hoàn toàn --</SelectItem>
                {studentsWithoutLogin.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.full_name} ({s.parent_phone || "Không có SĐT"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stuFullName" className="text-xs font-semibold">
              Họ và tên học sinh <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stuFullName"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || (Boolean(selectedStudentId) && selectedStudentId !== "new_student")}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stuEmail" className="text-xs font-semibold">
              Email đăng nhập của học sinh / phụ huynh <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stuEmail"
              type="email"
              placeholder="hocsinh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="stuPass" className="text-xs font-semibold">
                Mật khẩu (tối thiểu 8 ký tự) <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3" />
                Sinh ngẫu nhiên
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                id="stuPass"
                type="text"
                placeholder="Nhập mật khẩu hoặc bấm sinh ngẫu nhiên..."
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

          <DialogFooter className="gap-2 pt-2">
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
              Cấp tài khoản ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
