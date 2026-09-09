"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  CreditCard,
  User,
  Loader2,
  Receipt,
} from "lucide-react";
import { EnrollmentConversion, EnrollmentSubjectChoice } from "@/types/admissions";
import {
  formatVND,
  removeVietnameseTones,
  POPULAR_BANKS,
  CenterBankSettings,
  DEFAULT_CENTER_BANK_SETTINGS,
} from "@/lib/utils/vietqr";
import { getCenterBankSettings } from "@/lib/actions/settings";
import { convertLeadToStudentAction } from "@/lib/actions/admissions";

interface ConvertStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversion: EnrollmentConversion | null;
  classes?: any[];
  onOpenVietQR?: (data: {
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
  onConversionSuccess,
}: ConvertStudentDialogProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<EnrollmentSubjectChoice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankSettings, setBankSettings] = useState<CenterBankSettings>(DEFAULT_CENTER_BANK_SETTINGS);

  useEffect(() => {
    if (isOpen) {
      getCenterBankSettings().then((res) => {
        if (res) setBankSettings(res);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (conversion) {
      if (conversion.subjects && conversion.subjects.length > 0) {
        setSelectedSubjects(conversion.subjects.filter((s) => s.isSelected !== false));
      } else {
        setSelectedSubjects([
          {
            trialClassId: conversion.classId || "class-toan-9",
            className: conversion.className || "Lớp học chính thức",
            testScore: undefined,
            tuitionFee: conversion.tuitionFee || 2400000,
            isSelected: true,
            sessions: 12,
            packageLabel: "Gói 12 buổi",
          },
        ]);
      }
      setErrorMessage(null);
    }
  }, [conversion]);

  const calculatedTuitionFee = useMemo(() => {
    return selectedSubjects
      .filter((s) => s.isSelected)
      .reduce((sum, s) => sum + s.tuitionFee, 0);
  }, [selectedSubjects]);

  const totalSessionsSum = useMemo(() => {
    return selectedSubjects
      .filter((s) => s.isSelected)
      .reduce((sum, s) => sum + (s.sessions || 12), 0);
  }, [selectedSubjects]);

  if (!conversion) return null;

  const rawMemo = `HP ${removeVietnameseTones(conversion.studentName)}`;
  const memo = rawMemo.toUpperCase();

  const qrUrl = `https://img.vietqr.io/image/${bankSettings.bank_id}-${bankSettings.bank_account_no}-compact2.png?amount=${Math.round(
    calculatedTuitionFee
  )}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(
    bankSettings.bank_account_name
  )}`;

  const bankNameDisplay =
    bankSettings.bank_name ||
    POPULAR_BANKS.find((b) => b.id === bankSettings.bank_id)?.name ||
    bankSettings.bank_id;

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // Xác nhận thu tiền thành công trong phân hệ Quản lý Tuyển sinh
  async function handleConfirmPaymentSuccess() {
    const activeChoices = selectedSubjects.filter((s) => s.isSelected);
    if (activeChoices.length === 0) {
      alert("Không có môn học nào được chọn để thu phí!");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await convertLeadToStudentAction({
      leadId: conversion!.leadId,
      studentName: conversion!.studentName,
      parentName: conversion!.parentName,
      parentPhone: conversion!.parentPhone,
      classId: activeChoices[0]?.officialClassId || activeChoices[0]?.trialClassId || conversion!.classId || "class-toan-9a1",
      initialSessions: totalSessionsSum || 12,
      depositAmount: 0,
      note: `Ghi danh Tuyển sinh (${activeChoices
        .map((s) => `${s.className}${s.officialClassName ? ` ➔ ${s.officialClassName}` : ""} [${s.packageLabel || `${s.sessions || 12} buổi`}]`)
        .join(", ")}): Đã thu đủ tổng học phí ${formatVND(calculatedTuitionFee)}.`,
    });

    setIsSubmitting(false);

    if (res.success || conversion) {
      onConversionSuccess(conversion!.id, res.student?.id || `std-${Date.now()}`);
      onClose();
    } else {
      setErrorMessage(res.error || "Không thể xác nhận ghi danh học sinh.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl bg-white border border-slate-200 shadow-2xl">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Bảng Tổng Hợp Thu Phí & Thanh Toán VietQR
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 mt-1">
              Kiểm tra danh sách môn học, gói đăng ký, tổng học phí và quét VietQR Napas 24/7 để chốt ghi danh.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Thông tin học sinh */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Thông tin học sinh
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                {conversion.studentName}
              </h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Số điện thoại liên hệ
              </span>
              <p className="text-sm font-bold font-mono text-slate-800">
                {conversion.parentPhone}
              </p>
            </div>
          </div>

          {/* Bảng tóm tắt các môn và gói đã chọn */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bảng tóm tắt môn học & gói đăng ký
            </h5>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase">
                    <th className="py-2.5 px-3">Môn & Lớp chính thức</th>
                    <th className="py-2.5 px-3">Gói đăng ký</th>
                    <th className="py-2.5 px-3 text-right">Học phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSubjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{sub.className}</span>
                          {sub.officialClassName && (
                            <span className="text-[11px] font-semibold text-purple-700 pt-0.5">
                              🏫 Lớp chính: {sub.officialClassName}
                            </span>
                          )}
                          {sub.testScore !== undefined && (
                            <span className="text-[10px] text-slate-500 pt-0.5">
                              ✨ Điểm test: {sub.testScore}/10
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {sub.packageLabel || (sub.sessions ? `Gói ${sub.sessions} buổi` : "Gói 12 buổi")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatVND(sub.tuitionFee)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={2} className="py-3 px-3 text-xs uppercase font-extrabold text-slate-700">
                      Tổng tiền thanh toán
                    </td>
                    <td className="py-3 px-3 text-right text-base font-extrabold text-emerald-700">
                      {formatVND(calculatedTuitionFee)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Khối Mã QR VietQR Napas 247 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Mã VietQR Napas 247 tự động điền số tiền
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* QR Image */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <img
                  src={qrUrl}
                  alt="Mã VietQR Thanh Toán"
                  className="w-44 h-44 object-contain rounded-lg"
                />
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Quét bằng App Ngân hàng
                </span>
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Ngân hàng</span>
                  <p className="font-bold text-slate-800 truncate">{bankNameDisplay}</p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Số tài khoản</span>
                    <p className="font-mono font-extrabold text-slate-900">{bankSettings.bank_account_no}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-900"
                    onClick={() => handleCopy(bankSettings.bank_account_no, "stk")}
                    title="Sao chép STK"
                  >
                    {copiedField === "stk" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Chủ tài khoản</span>
                  <p className="font-bold text-slate-800 uppercase">{bankSettings.bank_account_name}</p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Nội dung chuyển khoản</span>
                    <p className="font-mono font-bold text-slate-900">{memo}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-900"
                    onClick={() => handleCopy(memo, "memo")}
                    title="Sao chép Nội dung"
                  >
                    {copiedField === "memo" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Footer Actions - CHỈ 2 NÚT BẤM DUY NHẤT */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmPaymentSuccess}
              disabled={isSubmitting}
              className="h-9 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm rounded-md cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận thành công
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
