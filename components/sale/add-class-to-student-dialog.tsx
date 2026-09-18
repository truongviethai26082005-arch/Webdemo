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
import { Class } from "@/types/database";
import { enrollStudentInAdditionalClass } from "@/lib/actions/admissions";
import { CenterBankSettings, formatVND, generateVietQRUrl } from "@/lib/utils/vietqr";
import type { StudentListItem } from "@/app/sale/students/students-client";
import {
  QrCode,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Phone,
} from "lucide-react";

interface AddClassToStudentDialogProps {
  student: StudentListItem | null;
  classes: Class[];
  bankSettings: CenterBankSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddClassToStudentDialog({
  student,
  classes,
  bankSettings,
  open,
  onOpenChange,
  onSuccess,
}: AddClassToStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // KHÔNG tự chọn sẵn lớp đầu tiên — bắt buộc Sale tự chọn đúng lớp thật
  // (đúng nguyên tắc AGENTS.md Mục 11.1, tránh gán nhầm môn/lớp).
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [sessions, setSessions] = useState<number>(24);

  if (!student) return null;

  // Chỉ hiện các lớp học sinh CHƯA có — tránh chọn nhầm lớp đã học, vì
  // enrollStudentInAdditionalClass() ở server đã chặn cứng trường hợp này
  // (upsert sẽ ghi đè balance_sessions hiện có nếu cho phép chọn trùng).
  const enrolledClassIds = new Set((student.enrollments || []).map((e) => e.class_id));
  const availableClasses = classes.filter((c) => !enrolledClassIds.has(c.id));

  const selectedClass = availableClasses.find((c) => c.id === selectedClassId) || null;
  const feePerSession = selectedClass?.fee_per_session || 0;
  const totalAmount = feePerSession * sessions;

  const cleanStudentName = student.full_name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .trim();
  const transferMemo = `HP ${student.parent_phone.replace(/\D/g, "")} ${cleanStudentName}`.slice(0, 50);

  const vietQrUrl = selectedClass
    ? generateVietQRUrl(totalAmount, transferMemo, {
        bankId: bankSettings.bank_id,
        accountNo: bankSettings.bank_account_no,
        accountName: bankSettings.bank_account_name,
      })
    : null;

  const handleConfirmPayment = async () => {
    if (!selectedClassId) {
      setError("Vui lòng chọn lớp học mới cho học sinh");
      return;
    }
    if (sessions <= 0 || totalAmount <= 0) {
      setError("Số buổi và học phí phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await enrollStudentInAdditionalClass({
        studentId: student.id,
        classId: selectedClassId,
        sessions,
        amount: totalAmount,
        paymentMethod: "transfer",
      });

      // BẮT BUỘC: Kiểm tra res?.error trước khi báo thành công
      if (res?.error) {
        setError(res.error);
        return;
      }

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
      <DialogContent className="sm:max-w-[690px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span>Đăng Ký Thêm Lớp &amp; Xuất Mã VietQR Thu Học Phí</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Ghi danh học sinh đã có sẵn vào 1 lớp mới, độc lập với các lớp đang học.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* CỘT TRÁI: CẤU HÌNH GÓI HỌC */}
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                {student.full_name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {student.parent_phone} • Phụ huynh: {student.parent_name || "—"}
              </div>
              {(student.enrollments?.length || 0) > 0 && (
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 mt-1">
                  Đang học: {student.enrollments!.map((e) => e.class?.name || "Lớp không rõ").join(", ")}
                </div>
              )}
            </div>

            {/* Chọn lớp học thật */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Chọn lớp mới <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={loading}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Chọn lớp..." />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {availableClasses.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Học sinh đã có tất cả các lớp hiện có
                    </div>
                  ) : (
                    availableClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name} ({formatVND(c.fee_per_session)}/buổi)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Chọn gói số buổi */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Gói số buổi mua</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {[12, 24, 36, 48].map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={sessions === s ? "default" : "outline"}
                    className="text-xs h-8"
                    disabled={loading}
                    onClick={() => setSessions(s)}
                  >
                    {s} buổi
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Hoặc nhập số buổi:</span>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={sessions}
                  onChange={(e) => setSessions(Number(e.target.value) || 1)}
                  disabled={loading}
                  className="w-20 h-7 text-xs"
                />
              </div>
            </div>

            {/* Bảng tính tổng tiền */}
            <div className="p-3 rounded-xl bg-card border border-border space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Đơn giá/buổi:</span>
                <span className="font-semibold text-foreground">{formatVND(feePerSession)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Số lượng buổi:</span>
                <span className="font-semibold text-foreground">{sessions} buổi</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border/60 text-sm font-black text-primary">
                <span>Tổng học phí:</span>
                <span>{formatVND(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MÃ VIETQR ĐỘNG */}
          <div className="flex flex-col items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-full text-center space-y-1">
              <div className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {bankSettings.bank_name || "Ngân hàng nhận học phí"}
              </div>
              <div className="text-xs text-muted-foreground">
                STK: <strong className="font-mono text-foreground">{bankSettings.bank_account_no}</strong> •{" "}
                {bankSettings.bank_account_name}
              </div>
            </div>

            {vietQrUrl ? (
              <>
                <div className="my-3 p-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Chuyển khoản học phí"
                    className="w-48 h-48 object-contain mx-auto"
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    Quét mã qua App Ngân hàng bất kỳ (Napas 24/7)
                  </div>
                </div>

                <div className="w-full p-2.5 rounded-xl bg-background border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nội dung CK:</span>
                    <span className="font-mono font-bold text-foreground truncate max-w-[170px]" title={transferMemo}>
                      {transferMemo}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-3">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="w-full text-xs font-bold gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Xác nhận đã nhận tiền &amp; Ghi danh
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <QrCode className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs">
                  Vui lòng chọn lớp mới ở cột bên trái để hệ thống tạo mã QR đúng số tiền.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
