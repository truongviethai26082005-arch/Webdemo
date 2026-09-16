"use client";

import { CheckCircle2 } from "lucide-react";

interface PrintReportHeaderProps {
  generatedAt?: string;
}

export function PrintReportHeader({ generatedAt }: PrintReportHeaderProps) {
  const printDate =
    generatedAt ||
    new Date().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="hidden print:block mb-8 pb-6 border-b-2 border-slate-900 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
            EC
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              Hệ Thống Trung Tâm Giáo Dục EduCenter
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Hệ thống Quản trị & Phân tích Đào tạo Toàn diện (EduCenter EMS)
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-900 text-sm uppercase">
            Báo Cáo Hợp Nhất Toàn Diện
          </div>
          <div>
            Mã tài liệu: <span className="font-mono font-semibold">EC-REPORT-2026</span>
          </div>
          <div>
            Thời điểm xuất: <span className="font-semibold">{printDate}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase text-slate-900">Phạm vi báo cáo:</span>
          <span>• Tóm Tắt Điều Hành & Health Score</span>
          <span>• Phễu Tuyển Sinh</span>
          <span>• Dòng Tiền 12T</span>
          <span>• Lợi Nhuận Gộp</span>
          <span>• Tỷ Lệ Giữ Chân & Gia Hạn</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Dữ liệu hợp nhất xác thực từ AI Engine</span>
        </div>
      </div>
    </div>
  );
}

export function PrintReportFooter() {
  return (
    <div className="hidden print:block mt-12 pt-8 border-t-2 border-slate-300 print-break-inside-avoid">
      <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
        <div className="space-y-16">
          <div>
            <p className="font-bold uppercase">Người Lập Báo Cáo</p>
            <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <p className="font-semibold text-slate-900">Hệ Thống AI Advisor</p>
        </div>

        <div className="space-y-16">
          <div>
            <p className="font-bold uppercase">Kế Toán Trưởng</p>
            <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <p className="font-semibold text-slate-900">Phòng Tài Chính - Kế Toán</p>
        </div>

        <div className="space-y-16">
          <div>
            <p className="font-bold uppercase">Ban Giám Đốc Phê Duyệt</p>
            <p className="text-[11px] text-slate-500 italic">(Ký, đóng dấu)</p>
          </div>
          <p className="font-semibold text-slate-900">Giám Đốc Trung Tâm</p>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-500">
        Trang in được tạo tự động bởi EduCenter EMS • Bản quyền thuộc về EduCenter Education Management System • A4 Standard
      </div>
    </div>
  );
}
