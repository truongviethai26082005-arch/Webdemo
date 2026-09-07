"use client";

import { useState, useEffect } from "react";
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
import { Award, QrCode, CheckCircle2, ArrowRight, Wallet, School, Loader2 } from "lucide-react";
import { EnrollmentConversion } from "@/types/admissions";
import { formatVND } from "@/lib/utils/vietqr";
import { convertLeadToStudentAction } from "@/lib/actions/admissions";

interface ConvertStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversion: EnrollmentConversion | null;
  classes: any[];
  onOpenVietQR: (data: {
    studentName: string;
    className: string;
    amount: number;
    sessionsAdded: number;
    note: string;
  }) => void;
  onConversionSuccess: (conversionId: string, studentId: string) => void;
}

export function ConvertStudentDialog({
  isOpen,
  onClose,
  conversion,
  classes,
  onOpenVietQR,
  onConversionSuccess,
}: ConvertStudentDialogProps) {
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [sessions, setSessions] = useState(12);
  const [depositAmount, setDepositAmount] = useState(500000);
  const [tuitionFee, setTuitionFee] = useState(2400000);
  const [isDepositPaid, setIsDepositPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (conversion) {
      setClassId(conversion.classId || (classes[0]?.id || ""));
      setClassName(conversion.className || (classes[0]?.name || ""));
      setSessions(conversion.tuitionPackageSessions || 12);
      setDepositAmount(conversion.depositAmount || 500000);
      setTuitionFee(conversion.tuitionFee || 2400000);
      setIsDepositPaid(conversion.isDepositPaid || false);
      setErrorMessage(null);
    }
  }, [conversion, classes]);

  if (!conversion) return null;

  function handleClassChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const cid = e.target.value;
    setClassId(cid);
    const cls = classes.find((c) => c.id === cid);
    if (cls) {
      setClassName(cls.name);
      const feePerSession = cls.fee_per_session || 200000;
      setTuitionFee(feePerSession * sessions);
    }
  }

  function handleSessionsChange(val: number) {
    setSessions(val);
    const cls = classes.find((c) => c.id === classId);
    const feePerSession = cls?.fee_per_session || 200000;
    setTuitionFee(feePerSession * val);
  }

  // Mở VietQR nhanh
  function handleGenerateQR(amountType: "deposit" | "full") {
    const amount = amountType === "deposit" ? depositAmount : tuitionFee;
    const note =
      amountType === "deposit"
        ? `Coc hoc phi ${conversion?.studentName} lop ${className}`
        : `Hoc phi ${sessions}b ${conversion?.studentName} lop ${className}`;

    onOpenVietQR({
      studentName: conversion!.studentName,
      className,
      amount,
      sessionsAdded: amountType === "deposit" ? 0 : sessions,
      note,
    });
  }

  // 1-Click Convert sang học sinh chính thức
  async function handleConvertOfficial() {
    if (!classId) {
      alert("Vui lòng chọn lớp học chính thức cho học sinh!");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await convertLeadToStudentAction({
      leadId: conversion!.leadId,
      studentName: conversion!.studentName,
      parentName: conversion!.parentName,
      parentPhone: conversion!.parentPhone,
      classId,
      initialSessions: sessions,
      depositAmount: isDepositPaid ? depositAmount : 0,
      note: `Ghi danh từ Tuyển sinh: Gói ${sessions} buổi lớp ${className}.${isDepositPaid ? ` Đã cọc: ${formatVND(depositAmount)}.` : ""}`,
    });

    setIsSubmitting(false);

    if (res.success && res.student) {
      onConversionSuccess(conversion!.id, res.student.id);
      onClose();
    } else {
      setErrorMessage(res.error || "Không thể chuyển đổi học sinh.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
            <Award className="w-5 h-5" />
            <span>Ghi Danh & Chuyển Đổi Thành Học Viên Chính Thức</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Chốt phễu tuyển sinh, thu cọc/học phí qua VietQR và tự động tạo hồ sơ học viên trên hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Thông tin học viên */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Học viên ghi danh
              </span>
              <h4 className="text-base font-extrabold text-foreground">{conversion.studentName}</h4>
              <p className="text-xs text-muted-foreground">
                PH: {conversion.parentName} • SĐT: <strong className="text-foreground">{conversion.parentPhone}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái cọc
              </span>
              <div className="mt-0.5">
                {isDepositPaid ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Đã đóng cọc {formatVND(depositAmount)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Chưa thu cọc
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chọn Lớp học chính thức */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Lớp học chính thức sẽ nhập học</Label>
            <select
              value={classId}
              onChange={handleClassChange}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-bold text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatVND(c.fee_per_session)}/buổi - GV: {c.teacher?.full_name || "Chưa phân công"})
                </option>
              ))}
            </select>
          </div>

          {/* Gói số buổi và học phí */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Gói đăng ký số buổi ban đầu</Label>
              <select
                value={sessions}
                onChange={(e) => handleSessionsChange(parseInt(e.target.value, 10))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={8}>Gói 8 buổi (1 tháng)</option>
                <option value={12}>Gói 12 buổi (1.5 tháng)</option>
                <option value={16}>Gói 16 buổi (2 tháng)</option>
                <option value={24}>Gói 24 buổi (3 tháng)</option>
                <option value={36}>Gói 36 buổi (Khóa chuyên đề)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tổng học phí gói ({sessions} buổi)</Label>
              <Input
                type="text"
                value={formatVND(tuitionFee)}
                readOnly
                className="h-9 text-xs font-bold bg-muted/60"
              />
            </div>
          </div>

          {/* Thu tiền / Cọc & VietQR */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-foreground">
                  Thanh toán cọc hoặc học phí qua VietQR Napas 247
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDepositPaid}
                    onChange={(e) => setIsDepositPaid(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  Đã nhận cọc ({formatVND(depositAmount)})
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleGenerateQR("deposit")}
                className="text-xs h-8 gap-1.5 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
              >
                <QrCode className="w-3.5 h-3.5" />
                Tạo VietQR Cọc ({formatVND(depositAmount)})
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleGenerateQR("full")}
                className="text-xs h-8 gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                <QrCode className="w-3.5 h-3.5" />
                Tạo VietQR Toàn Bộ Học Phí ({formatVND(tuitionFee)})
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground">
              ⚡ Bấm nút dưới để tạo tài khoản học viên, mở ví buổi học và hoàn tất phễu tuyển sinh.
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConvertOfficial}
                disabled={isSubmitting}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang chuyển đổi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    1-Click Chuyển thành học viên chính thức
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
