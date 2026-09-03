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
import { Checkbox } from "@/components/ui/checkbox";
import { createInvoice } from "@/lib/actions/invoices";
import { formatVND } from "@/lib/utils/vietqr";
import {
  Receipt,
  Loader2,
  Coins,
  CreditCard,
  Banknote,
  FileText,
  AlertCircle,
  QrCode,
  CheckCircle2,
} from "lucide-react";

interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  defaultStudentId?: string;
  defaultClassId?: string;
  onCreated?: (invoice: any) => void;
  onSuccessPaid?: (data: any) => void;
  onSuccessCash?: (data: any) => void;
}

export function CreateInvoiceDialog({
  isOpen,
  onClose,
  students,
  defaultStudentId,
  defaultClassId,
  onCreated,
  onSuccessPaid,
  onSuccessCash,
}: CreateInvoiceDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || "");
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId || "");
  const [sessionsAdded, setSessionsAdded] = useState(12);
  const [feePerSession, setFeePerSession] = useState(0);

  // Amount with thousands separator formatting
  const [customAmount, setCustomAmount] = useState(0);
  const [amountInput, setAmountInput] = useState("");

  // Payment method & immediate payment
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cash">("cash");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy học sinh hiện tại
  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const studentEnrollments = currentStudent?.enrollments || [];

  useEffect(() => {
    if (defaultStudentId) setSelectedStudentId(defaultStudentId);
    if (defaultClassId) setSelectedClassId(defaultClassId);
  }, [defaultStudentId, defaultClassId]);

  useEffect(() => {
    if (studentEnrollments.length > 0 && !selectedClassId) {
      setSelectedClassId(studentEnrollments[0].class?.id || "");
    }
  }, [selectedStudentId, studentEnrollments]);

  // Recalculate amount when class or sessions change
  useEffect(() => {
    const currentEnrollment = studentEnrollments.find(
      (e: any) => e.class?.id === selectedClassId
    );
    const fee = currentEnrollment?.class?.fee_per_session || 0;
    setFeePerSession(fee);

    const calculated = fee * sessionsAdded;
    setCustomAmount(calculated);
    setAmountInput(calculated > 0 ? new Intl.NumberFormat("vi-VN").format(calculated) : "");
  }, [selectedClassId, sessionsAdded, studentEnrollments]);

  // Manual amount edit with thousands formatting
  function handleAmountInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawDigits = e.target.value.replace(/\D/g, "");
    if (!rawDigits) {
      setCustomAmount(0);
      setAmountInput("");
      return;
    }
    const numeric = parseInt(rawDigits, 10);
    setCustomAmount(numeric);
    setAmountInput(new Intl.NumberFormat("vi-VN").format(numeric));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedStudentId || !selectedClassId) {
      setError("Vui lòng chọn học sinh và lớp học cần nạp");
      return;
    }
    if (customAmount <= 0) {
      setError("Số tiền thanh toán phải lớn hơn 0 đ");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedMethod = isPaid ? paymentMethod : "transfer";

    const formData = new FormData();
    formData.append("student_id", selectedStudentId);
    formData.append("class_id", selectedClassId);
    formData.append("sessions_added", String(sessionsAdded));
    formData.append("amount", String(customAmount));
    formData.append("is_paid", isPaid ? "true" : "false");
    formData.append("payment_method", selectedMethod);
    if (note.trim()) {
      formData.append("note", note.trim());
    }

    const result = await createInvoice(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();

      const className =
        studentEnrollments.find((e: any) => e.class?.id === selectedClassId)?.class?.name || "Lớp học";

      if (isPaid) {
        // Học sinh ĐÃ ĐÓNG TIỀN NGAY:
        // Đã lưu status = 'paid', tự động cộng buổi vào ví.
        // TUYỆT ĐỐI KHÔNG mở popup VietQR!
        const successData = {
          studentName: currentStudent?.full_name || "Học sinh",
          className,
          amount: customAmount,
          sessionsAdded,
          paymentMethod,
        };
        if (onSuccessPaid) onSuccessPaid(successData);
        if (onSuccessCash) onSuccessCash(successData);
      } else {
        // KHÔNG tick đóng ngay (tạo công nợ chờ chuyển khoản):
        // Mở popup mã VietQR để gửi phụ huynh
        if (onCreated && result.data) {
          onCreated({
            id: result.data.id,
            studentName: currentStudent?.full_name || "Học sinh",
            studentCode: currentStudent?.student_code || currentStudent?.code || "",
            className,
            amount: customAmount,
            sessionsAdded,
            paymentMethod: "transfer",
            note: note.trim(),
          });
        }
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card rounded-2xl p-6 shadow-xl border border-border/80 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Tạo Phiếu Thu Học Phí
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Nạp thêm buổi học và ghi nhận thanh toán tiền mặt hoặc VietQR
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chọn Học sinh */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Chọn Học sinh <strong className="text-destructive">*</strong>
            </Label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setSelectedClassId("");
              }}
              required
              className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.parent_phone})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Lớp học */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Lớp học cần nạp <strong className="text-destructive">*</strong>
            </Label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              required
              disabled={!selectedStudentId || studentEnrollments.length === 0}
              className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              <option value="">-- Chọn lớp học --</option>
              {studentEnrollments.map((e: any) => (
                <option key={e.class?.id} value={e.class?.id}>
                  {e.class?.name} (Số dư: {e.balance_sessions} buổi - {formatVND(e.class?.fee_per_session || 0)}/buổi)
                </option>
              ))}
            </select>
            {selectedStudentId && studentEnrollments.length === 0 && (
              <p className="text-[11px] text-destructive">
                Học sinh này chưa được ghi danh vào lớp học nào.
              </p>
            )}
          </div>

          {/* Số buổi nạp & Đơn giá */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Số buổi nạp *</Label>
              <Input
                type="number"
                min="1"
                max="200"
                value={sessionsAdded}
                onChange={(e) => setSessionsAdded(Math.max(1, Number(e.target.value)))}
                required
                className="h-9 text-xs rounded-xl font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Đơn giá / buổi</Label>
              <Input
                type="text"
                disabled
                value={formatVND(feePerSession)}
                className="h-9 text-xs rounded-xl bg-muted font-medium font-mono"
              />
            </div>
          </div>

          {/* Tổng tiền thanh toán (Định dạng phân cách hàng nghìn, cho phép sửa tay) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Tổng tiền thanh toán (VNĐ) <strong className="text-destructive">*</strong></span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                (Có thể chỉnh sửa nếu có chiết khấu)
              </span>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={amountInput}
                onChange={handleAmountInputChange}
                required
                placeholder="VD: 800.000"
                className="h-10 text-sm font-bold font-mono text-primary pr-12 rounded-xl"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold pointer-events-none">
                đ
              </span>
            </div>
          </div>

          {/* Ghi chú phiếu thu */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span>Ghi chú phiếu thu (Tùy chọn)</span>
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đóng sớm được giảm 10%, nộp tiền tại cơ sở..."
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Trạng thái thanh toán ngay */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_paid"
                checked={isPaid}
                onCheckedChange={(checked) => setIsPaid(Boolean(checked))}
              />
              <label
                htmlFor="is_paid"
                className="text-xs font-bold leading-none cursor-pointer select-none text-foreground"
              >
                Học sinh đã đóng tiền ngay (Tự cộng buổi vào ví)
              </label>
            </div>

            {/* Khi tick chọn 'Học sinh đã đóng tiền ngay': Hiển thị lựa chọn Phương thức thanh toán */}
            {isPaid && (
              <div className="pl-6 pt-1 space-y-2 border-t border-border/50">
                <Label className="text-[11px] font-semibold text-muted-foreground block">
                  Hình thức thanh toán đã nhận:
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === "cash"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-xs"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Tiền mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentMethod === "transfer"
                        ? "bg-primary/10 text-primary border-primary shadow-xs"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Chuyển khoản
                  </button>
                </div>
              </div>
            )}
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

            {/* Nút Submit đổi màu và icon ngay lập tức khi isPaid được tick */}
            <Button
              type="submit"
              size="sm"
              disabled={loading || !selectedStudentId || !selectedClassId}
              className={`text-xs font-bold rounded-xl h-9 px-5 gap-1.5 shadow-md transition-all ${
                isPaid
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : isPaid ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận đã thu tiền</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Tạo phiếu thu & VietQR</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
