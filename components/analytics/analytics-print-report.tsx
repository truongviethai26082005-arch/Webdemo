"use client";

import { useMemo } from "react";
import {
  Printer,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Users,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperationalSnapshot } from "@/lib/actions/ai-analytics";
import { formatVND } from "@/lib/utils/vietqr";

interface AnalyticsPrintReportProps {
  snapshot: OperationalSnapshot | null;
  aiAnalysisText?: string;
  isGeneratingAi?: boolean;
  onBack: () => void;
  onTimeChange?: (month: number, year: number, week: number) => void;
  onRegenerateAi?: () => void;
}

export function AnalyticsPrintReport({
  snapshot,
  aiAnalysisText,
  isGeneratingAi,
  onBack,
  onTimeChange,
  onRegenerateAi,
}: AnalyticsPrintReportProps) {
  const currentDateFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }, []);

  const salaryRatio = useMemo(() => {
    if (!snapshot || snapshot.paidRevenue <= 0) return 0;
    return Math.round((snapshot.teacherCosts / snapshot.paidRevenue) * 100);
  }, [snapshot]);

  const profitMargin = useMemo(() => {
    if (!snapshot || snapshot.paidRevenue <= 0) return 0;
    return Math.round((snapshot.grossProfit / snapshot.paidRevenue) * 100);
  }, [snapshot]);

  function handlePrint() {
    window.print();
  }

  if (!snapshot) {
    return (
      <div className="p-8 text-center bg-white dark:bg-card rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto my-12 space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Chưa có dữ liệu thống kê
        </h3>
        <p className="text-xs text-muted-foreground">
          Vui lòng quay lại Dashboard và chọn thời gian cần xuất báo cáo.
        </p>
        <Button onClick={onBack} size="sm" variant="outline" className="rounded-xl text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Quay lại Dashboard
        </Button>
      </div>
    );
  }

  const periodTitle = snapshot.weekLabel || `Tháng ${snapshot.month}/${snapshot.year}`;

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen py-6 sm:py-10 px-2 sm:px-4">
      {/* ─── THANH ĐIỀU HƯỚNG TRÊN CÙNG (ẨN HOÀN TOÀN KHI IN) ─── */}
      <div className="print:hidden max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-card p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Button
          onClick={onBack}
          size="sm"
          variant="outline"
          className="rounded-xl text-xs font-semibold gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Dashboard</span>
        </Button>

        {/* Bộ lọc thời gian trực tiếp trên trang báo cáo */}
        {onTimeChange && (
          <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
            <select
              value={snapshot.week ?? 0}
              onChange={(e) => onTimeChange(snapshot.month, snapshot.year, Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={0}>Cả tháng</option>
              <option value={1}>Tuần 1 (01 - 07)</option>
              <option value={2}>Tuần 2 (08 - 14)</option>
              <option value={3}>Tuần 3 (15 - 21)</option>
              <option value={4}>Tuần 4 (22 - 28)</option>
              <option value={5}>Tuần 5 (29 - hết)</option>
            </select>

            <select
              value={snapshot.month}
              onChange={(e) => onTimeChange(Number(e.target.value), snapshot.year, snapshot.week ?? 0)}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <select
              value={snapshot.year}
              onChange={(e) => onTimeChange(snapshot.month, Number(e.target.value), snapshot.week ?? 0)}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onRegenerateAi && (
            <Button
              onClick={onRegenerateAi}
              size="sm"
              variant="outline"
              disabled={isGeneratingAi}
              className="rounded-xl text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
              title="Yêu cầu AI phân tích lại theo số liệu mới"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? "animate-spin text-amber-500" : "text-amber-500"}`} />
              <span>{isGeneratingAi ? "AI đang phân tích..." : "Cập nhật AI"}</span>
            </Button>
          )}

          <Button
            onClick={handlePrint}
            size="sm"
            className="rounded-xl text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-4"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo / Xuất PDF</span>
          </Button>
        </div>
      </div>

      {/* ─── TỜ A4 BÁO CÁO CHUẨN IN ẤN (WHITE SHEET) ─── */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl p-8 sm:p-12 print:shadow-none print:rounded-none print:p-0 print:max-w-none print:m-0 border border-slate-200/80 print:border-none space-y-6 text-xs sm:text-sm leading-relaxed">
        {/* Header báo cáo */}
        <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-wider text-xs">
              <Building className="w-4 h-4" />
              <span>HỆ THỐNG TRUNG TÂM ĐÀO TẠO &amp; LUYỆN THI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              BÁO CÁO PHÂN TÍCH TÀI CHÍNH &amp; VẬN HÀNH
            </h1>
            <p className="text-sm font-semibold text-primary">
              Kỳ báo cáo: {periodTitle} ({snapshot.startDateStr} ➔ {snapshot.endDateStr})
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5 self-end">
            <div>
              Ngày xuất: <strong className="text-slate-800">{currentDateFormatted}</strong>
            </div>
            <div>
              Mã báo cáo: <strong className="text-slate-800">RP-{snapshot.year}{String(snapshot.month).padStart(2, "0")}{snapshot.week ? `-W${snapshot.week}` : ""}-EMS</strong>
            </div>
          </div>
        </div>

        {/* 1. BẢNG CHỈ SỐ TÀI CHÍNH CỐT LÕI */}
        <div className="space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-l-4 border-primary pl-2">
            <span>1. Chỉ Số Tài Chính &amp; Hiệu Quả Đào Tạo Cốt Lõi</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Doanh thu thực thu
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-1">
                {formatVND(snapshot.paidRevenue)}
              </span>
              <span className="text-[10px] text-slate-400">Từ hóa đơn status = 'paid'</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Thù lao giáo viên
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 block mt-1">
                {formatVND(snapshot.teacherCosts)}
              </span>
              <span className="text-[10px] text-slate-400">Tỷ trọng: {salaryRatio}%</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Lợi nhuận gộp dạy học
              </span>
              <span className={`text-base sm:text-lg font-bold block mt-1 ${snapshot.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {formatVND(snapshot.grossProfit)}
              </span>
              <span className="text-[10px] text-slate-400">Biên lợi nhuận: {profitMargin}%</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                An toàn chi phí lương
              </span>
              <span className={`text-base sm:text-lg font-bold block mt-1 ${salaryRatio <= 45 ? "text-emerald-700" : "text-amber-700"}`}>
                {salaryRatio <= 45 ? "ĐẠT CHUẨN" : "CẢNH BÁO"}
              </span>
              <span className="text-[10px] text-slate-400">Ngưỡng chuẩn &le; 45%</span>
            </div>
          </div>
        </div>

        {/* 2. THỐNG KÊ CÔNG NỢ & TÁI TỤC HỌC PHÍ */}
        <div className="space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-l-4 border-amber-500 pl-2">
            <span>2. Tình Trạng Công Nợ Học Phí &amp; Cảnh Báo Tái Tục</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Học viên âm buổi */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/30">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Học viên âm buổi (Nợ học phí khẩn cấp)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {snapshot.negativeDebtStudents.length} bạn
                </span>
              </div>

              {snapshot.negativeDebtStudents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Tuyệt vời! Không có học viên nào bị âm buổi học trong kỳ.
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {snapshot.negativeDebtStudents.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{st.studentName}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({st.className})</span>
                      </div>
                      <span className="font-bold text-rose-600">
                        Âm {Math.abs(st.balanceSessions)} buổi
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Học viên sắp hết buổi */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/30">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-xs text-amber-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  Học viên sắp hết buổi (&le; 2 buổi)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {snapshot.lowBalanceStudents.length} bạn
                </span>
              </div>

              {snapshot.lowBalanceStudents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Không có học viên nào trong ngưỡng cần nhắc phí khẩn cấp.
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {snapshot.lowBalanceStudents.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{st.studentName}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({st.className})</span>
                      </div>
                      <span className="font-bold text-amber-600">
                        Còn {st.balanceSessions} buổi
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. TÌNH HÌNH VẬN HÀNH CÁC LỚP HỌC */}
        <div className="space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-l-4 border-indigo-600 pl-2">
            <span>3. Tình Hình Vận Hành Chi Tiết Các Lớp Học</span>
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2 px-3">Tên lớp học</th>
                  <th className="py-2 px-3 text-center">Sĩ số đang học</th>
                  <th className="py-2 px-3 text-center">Buổi hoàn thành</th>
                  <th className="py-2 px-3 text-center">Buổi bị hủy</th>
                  <th className="py-2 px-3 text-center">Vắng không phép</th>
                  <th className="py-2 px-3 text-right">Đánh giá vận hành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {snapshot.classPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                      Chưa ghi nhận lớp học nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  snapshot.classPerformance.map((c) => {
                    const isLowOccupancy = c.activeEnrollments < 5;
                    const isHighAbsence = c.absentUnexcusedCount > 5;

                    return (
                      <tr key={c.classId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{c.className}</td>
                        <td className="py-2 px-3 text-center font-mono">{c.activeEnrollments} HS</td>
                        <td className="py-2 px-3 text-center font-mono text-emerald-700 font-semibold">
                          {c.completedSessions}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-rose-600">
                          {c.cancelledSessions}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-amber-600 font-semibold">
                          {c.absentUnexcusedCount}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isLowOccupancy ? (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Sĩ số thấp
                            </span>
                          ) : isHighAbsence ? (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Vắng nhiều
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ổn định
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. ĐÁNH GIÁ VẬN HÀNH & KẾ HOẠCH HÀNH ĐỘNG TỪ AI CODY */}
        <div className="space-y-2.5 print-break-inside-avoid">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-l-4 border-blue-600 pl-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>4. Đánh Giá Chuyên Sâu &amp; Kế Hoạch Hành Động (Cody AI Advisor)</span>
          </h2>

          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 leading-relaxed text-xs sm:text-sm text-slate-800 whitespace-pre-wrap">
            {aiAnalysisText ? (
              aiAnalysisText
            ) : (
              <div className="space-y-2 text-slate-700">
                <p>
                  <strong>Nhận xét tổng quan:</strong> Trong Tháng {snapshot.month}/{snapshot.year}, hệ thống ghi nhận doanh thu thực thu đạt {formatVND(snapshot.paidRevenue)}, thù lao giáo viên chi trả {formatVND(snapshot.teacherCosts)}, tạo ra lợi nhuận gộp dạy học {formatVND(snapshot.grossProfit)} (tương đương biên lợi nhuận {profitMargin}%).
                </p>
                <p>
                  <strong>Điểm nghẽn cần lưu ý:</strong> Hiện có {snapshot.negativeDebtStudents.length} học viên đang có số buổi học âm (cần thu học phí khẩn cấp) và {snapshot.lowBalanceStudents.length} học viên sắp hết hạn buổi (&le; 2 buổi).
                </p>
                <p>
                  <strong>Kế hoạch hành động đề xuất:</strong>
                  <br />
                  1. Gửi thông báo VietQR thu phí đối soát ngay cho phụ huynh các học viên âm buổi trong 48 giờ tới.
                  <br />
                  2. Bộ phận tuyển sinh và chăm sóc khách hàng chủ động tư vấn gia hạn cho nhóm học viên còn &le; 2 buổi.
                  <br />
                  3. Rà soát các lớp có sĩ số thấp hoặc số lượt vắng không phép cao để điều phối giáo viên hỗ trợ kèm cặp bổ trợ.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 5. PHẦN KÝ TÊN PHÊ DUYỆT BÁO CÁO */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center print-break-inside-avoid">
          <div className="space-y-16">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                Người Lập Báo Cáo
              </span>
              <span className="text-[11px] text-slate-400 italic block">
                (Ký, ghi rõ họ tên)
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              Ban Quản Trị Hệ Thống
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                Giám Đốc Trung Tâm
              </span>
              <span className="text-[11px] text-slate-400 italic block">
                (Ký và đóng dấu)
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              Phê Duyệt Ban Giám Đốc
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
