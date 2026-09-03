"use client";

import { useState, useEffect } from "react";
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
import { createTeacher, updateTeacher } from "@/lib/actions/teachers";
import { GraduationCap, Loader2, Building2, CreditCard, DollarSign } from "lucide-react";
import { POPULAR_BANKS } from "@/lib/utils/vietqr";

interface TeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTeacher?: any | null;
}

export function TeacherDialog({
  isOpen,
  onClose,
  editingTeacher,
}: TeacherDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Salary with thousands separator
  const [salaryPerSession, setSalaryPerSession] = useState(250000);
  const [salaryInput, setSalaryInput] = useState("250.000");

  // Bank Info (Optional)
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTeacher) {
      setFullName(editingTeacher.full_name || "");
      setPhone(editingTeacher.phone || "");
      const salary = editingTeacher.salary_per_session || 0;
      setSalaryPerSession(salary);
      setSalaryInput(new Intl.NumberFormat("vi-VN").format(salary));
      setBankName(editingTeacher.bank_name || "");
      setBankAccountNo(editingTeacher.bank_account_no || "");
      setEmail("");
      setPassword("");
    } else {
      setFullName("");
      setEmail("");
      setPassword("123456");
      setPhone("");
      setSalaryPerSession(250000);
      setSalaryInput("250.000");
      setBankName("");
      setBankAccountNo("");
    }
  }, [editingTeacher, isOpen]);

  // Handle salary input with auto thousands separators
  function handleSalaryInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawDigits = e.target.value.replace(/\D/g, "");
    if (!rawDigits) {
      setSalaryPerSession(0);
      setSalaryInput("");
      return;
    }
    const numeric = parseInt(rawDigits, 10);
    setSalaryPerSession(numeric);
    setSalaryInput(new Intl.NumberFormat("vi-VN").format(numeric));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("phone", phone);
    formData.append("salary_per_session", String(salaryPerSession));
    formData.append("bank_name", bankName);
    formData.append("bank_account_no", bankAccountNo);

    if (!editingTeacher) {
      formData.append("email", email);
      formData.append("password", password);
    }

    let result;
    if (editingTeacher) {
      result = await updateTeacher(editingTeacher.id, formData);
    } else {
      result = await createTeacher(formData);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card rounded-2xl p-6 shadow-2xl border border-border/80 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingTeacher ? "Chỉnh sửa Hồ sơ Giáo viên" : "Thêm Giáo Viên Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Cấu hình thông tin giảng dạy, thù lao ca dạy và tài khoản nhận lương
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Họ và tên & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Họ và tên giáo viên <strong className="text-destructive">*</strong>
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Thầy Nguyễn Văn Minh"
                required
                className="h-9 text-xs rounded-xl"
              />
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
          </div>

          {/* Email & Mật khẩu khởi tạo (chỉ khi tạo mới) */}
          {!editingTeacher && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/80">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Email đăng nhập <strong className="text-destructive">*</strong>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher.minh@educenter.vn"
                  required
                  className="h-9 text-xs rounded-xl bg-background"
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
                  className="h-9 text-xs font-mono rounded-xl bg-background"
                />
              </div>
            </div>
          )}

          {/* Mức thù lao mỗi buổi dạy (Có định dạng hàng nghìn) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span>Mức thù lao mỗi buổi dạy (VNĐ) <strong className="text-destructive">*</strong></span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Tự động tính lương tháng</span>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={salaryInput}
                onChange={handleSalaryInputChange}
                required
                placeholder="VD: 250.000"
                className="h-10 text-sm font-bold font-mono text-primary pr-10 rounded-xl"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold pointer-events-none">
                đ
              </span>
            </div>
          </div>

          {/* Thông tin Ngân hàng nhận lương (Tùy chọn) */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Tài Khoản Ngân Hàng Nhận Lương (Tùy chọn)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Tên ngân hàng</Label>
                <div className="space-y-1">
                  <select
                    value={POPULAR_BANKS.some((b) => b.name === bankName || b.id === bankName) ? bankName : "custom"}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setBankName("");
                      } else {
                        const found = POPULAR_BANKS.find((b) => b.id === e.target.value);
                        setBankName(found ? found.name : e.target.value);
                      }
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    <option value="custom">Ngân hàng khác (Gõ tay)</option>
                  </select>

                  {(!POPULAR_BANKS.some((b) => b.name === bankName) || bankName === "") && (
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="VD: Techcombank, VPBank, ACB..."
                      className="h-8 text-xs rounded-xl mt-1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Số tài khoản ngân hàng
                </Label>
                <div className="relative">
                  <Input
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value.replace(/\s+/g, ""))}
                    placeholder="VD: 556826082005"
                    className="h-9 text-xs font-mono font-bold rounded-xl pr-8"
                  />
                  <CreditCard className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs rounded-xl h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !fullName}
              className="text-xs font-bold rounded-xl h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : editingTeacher ? (
                "Lưu thay đổi"
              ) : (
                "+ Tạo Giáo Viên"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
