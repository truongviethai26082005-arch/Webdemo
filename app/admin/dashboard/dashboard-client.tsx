"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
  Receipt,
  QrCode,
  CheckCircle2,
  Phone,
  Sparkles,
  Zap,
  Wallet,
  TrendingUp,
  School,
  GraduationCap,
  DoorOpen,
  Clock,
  Calendar,
  Trash2,
  Check,
  CreditCard,
  Banknote,
  X,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/utils/vietqr";
import { VietQRModal } from "@/components/invoices/vietqr-modal";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import {
  markInvoiceAsPaid,
  cancelPendingInvoice,
  resolveNegativeDebt,
} from "@/lib/actions/invoices";

interface DashboardClientProps {
  stats: any;
  students: any[];
  classes: any[];
  teachers: any[];
  payroll?: any[];
}

function getTodayDayId(): string {
  const day = new Date().getDay();
  const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return map[day];
}

function getClassTodayStatus(cls: any, todaySessions: any[]) {
  const todayDayId = getTodayDayId();
  let scheduleArray: any[] = [];
  if (Array.isArray(cls.schedule)) {
    scheduleArray = cls.schedule;
  } else if (typeof cls.schedule === "string") {
    try {
      scheduleArray = JSON.parse(cls.schedule);
    } catch {
      scheduleArray = [];
    }
  }

  const hasScheduleToday = scheduleArray.some((s: any) => s.day === todayDayId);
  if (!hasScheduleToday) {
    return {
      hasSchedule: false,
      text: "Không có ca hôm nay",
      badgeClass: "bg-muted/60 text-muted-foreground border-border/60",
    };
  }

  const session = todaySessions.find((s: any) => s.class_id === cls.id || s.class?.id === cls.id);
  const isAttended = session && (session.status === "completed" || (session.attendance_count || 0) > 0);

  if (isAttended) {
    return {
      hasSchedule: true,
      isAttended: true,
      text: "Có lịch hôm nay • Đã điểm danh",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
    };
  }

  return {
    hasSchedule: true,
    isAttended: false,
    text: "Có lịch hôm nay • Chưa điểm danh",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold",
  };
}

export function DashboardClient({
  stats: initialStats,
  students,
  classes,
  teachers,
  payroll = [],
}: DashboardClientProps) {
  const [stats, setStats] = useState(initialStats);
  const [debtDetails, setDebtDetails] = useState<any[]>(initialStats.debtDetails || []);

  // Modals & Drawers
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedStudentForInvoice, setSelectedStudentForInvoice] = useState<string | undefined>();
  const [selectedClassForInvoice, setSelectedClassForInvoice] = useState<string | undefined>();
  const [vietQrData, setVietQrData] = useState<any | null>(null);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleQuickInvoice(studentId: string, classId: string) {
    setSelectedStudentForInvoice(studentId);
    setSelectedClassForInvoice(classId);
    setIsInvoiceOpen(true);
  }

  // Action: Hủy nợ ảo từng khoản
  async function handleCancelDebt(item: any) {
    if (!confirm(`Bạn có chắc chắn muốn hủy bỏ khoản nợ "${item.description}" của học sinh ${item.studentName}?`)) {
      return;
    }

    let res;
    if (item.type === "pending_invoice" && item.invoiceId) {
      res = await cancelPendingInvoice(item.invoiceId);
    } else if (item.type === "negative_balance" && item.enrollmentId) {
      res = await resolveNegativeDebt(item.enrollmentId);
    }

    if (res?.error) {
      alert(res.error);
    } else {
      const updatedList = debtDetails.filter((d) => d.id !== item.id);
      setDebtDetails(updatedList);
      const newTotal = updatedList.reduce((acc, curr) => acc + curr.amount, 0);
      setStats((prev: any) => ({
        ...prev,
        unpaidDebt: newTotal,
        debtCount: updatedList.length,
      }));
      showToast(`Đã hủy bỏ khoản nợ của học sinh ${item.studentName}!`);
    }
  }

  // Action: Thu tiền mặt ngay cho khoản nợ
  async function handleMarkPaidImmediate(item: any) {
    if (item.type === "pending_invoice" && item.invoiceId) {
      const res = await markInvoiceAsPaid(item.invoiceId);
      if (res?.error) {
        alert(res.error);
      } else {
        const updatedList = debtDetails.filter((d) => d.id !== item.id);
        setDebtDetails(updatedList);
        const newTotal = updatedList.reduce((acc, curr) => acc + curr.amount, 0);
        setStats((prev: any) => ({
          ...prev,
          unpaidDebt: newTotal,
          debtCount: updatedList.length,
          monthlyRevenue: (prev.monthlyRevenue || 0) + item.amount,
        }));
        showToast(`Đã thu ${formatVND(item.amount)} tiền mặt cho học sinh ${item.studentName}!`);
      }
    } else {
      setIsDebtModalOpen(false);
      handleQuickInvoice(item.studentId, item.classId);
    }
  }

  const [currentPage, setCurrentPage] = useState(1);

  const totalPayrollBudget = payroll.reduce((sum, p) => sum + (p.totalSalary || 0), 0);
  const grossMargin = (stats.monthlyRevenue || 0) - totalPayrollBudget;

  // ── CẢNH BÁO VẬN HÀNH (Operational Alerts - Real DB Data Only) ──
  const operationalAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      type: "no_room" | "low_balance" | "unattended";
      badgeText: string;
      badgeClass: string;
      title: string;
      subtitle?: string;
      link: string;
      actionText: string;
    }> = [];

    // 1. Lớp chưa xếp phòng
    classes.forEach((cls: any) => {
      const room = (cls.room || "").trim();
      const hasNoRoom =
        !room ||
        room === "Chưa xếp" ||
        room === "Chưa xếp phòng" ||
        room.toLowerCase() === "chưa xếp" ||
        room.toLowerCase() === "chưa xếp phòng";
      if (hasNoRoom) {
        alerts.push({
          id: `no_room_${cls.id}`,
          type: "no_room",
          badgeText: "Chưa xếp phòng",
          badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
          title: `Lớp ${cls.name}`,
          subtitle: "Lớp học chưa được bố trí phòng học",
          link: `/admin/classes/${cls.id}`,
          actionText: "Xếp phòng",
        });
      }
    });

    // 2. Học sinh sắp hết buổi (balance_sessions <= 2)
    (stats?.lowBalanceList || []).forEach((item: any) => {
      alerts.push({
        id: `low_balance_${item.enrollmentId}`,
        type: "low_balance",
        badgeText: "Cần thu phí",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
        title: `${item.studentName} (còn ${item.balanceSessions} buổi)`,
        subtitle: `Lớp ${item.className} • SĐT PH: ${item.parentPhone || "Chưa cập nhật"}`,
        link: `/admin/students`,
        actionText: "Chi tiết",
      });
    });

    // 3. Ca học hôm nay kết thúc mà chưa điểm danh
    const now = new Date();
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (timeStr?: string): number | null => {
      if (!timeStr) return null;
      const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
      if (!match) return null;
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    };

    const todaySessions = stats?.todaySessions || [];
    todaySessions.forEach((s: any) => {
      if (s.status === "cancelled") return;
      const isAttendanceChecked = s.status === "completed" || (s.attendance_count || 0) > 0;
      if (isAttendanceChecked) return;

      const endMinutes = parseTimeToMinutes(s.end_time);
      const startMinutes = parseTimeToMinutes(s.start_time);

      let isEnded = false;
      if (endMinutes !== null) {
        isEnded = currentMinutesNow >= endMinutes;
      } else if (startMinutes !== null) {
        isEnded = currentMinutesNow >= (startMinutes + 90);
      }

      if (isEnded) {
        const clsName = s.class?.name || classes.find((c: any) => c.id === s.class_id)?.name || "Lớp học";
        const classId = s.class_id || s.class?.id || "";
        const timeStr = s.start_time && s.end_time
          ? `Ca ${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`
          : s.start_time
          ? `Ca ${s.start_time.slice(0, 5)}`
          : "Ca học hôm nay";

        alerts.push({
          id: `unattended_${s.id}`,
          type: "unattended",
          badgeText: "Chưa điểm danh",
          badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
          title: `Lớp ${clsName}`,
          subtitle: `${timeStr} đã kết thúc nhưng chưa điểm danh`,
          link: classId ? `/admin/attendance?classId=${classId}` : "/admin/attendance",
          actionText: "Điểm danh",
        });
      }
    });

    return alerts;
  }, [classes, stats?.todaySessions, stats?.lowBalanceList]);

  // Today sessions (Deduplicated by class_id, session_date, start_time & status !== cancelled)
  const todaySessions = useMemo(() => {
    const raw = stats?.todaySessions || [];
    const map = new Map<string, any>();
    for (const s of raw) {
      if (s.status === "cancelled") continue;
      const classId = s.class_id || s.class?.id || "";
      const sessionDate = s.session_date || "";
      const startTime = s.start_time || "";
      const key = `${classId}_${sessionDate}_${startTime}`;
      if (!map.has(key)) {
        map.set(key, s);
      }
    }
    return Array.from(map.values());
  }, [stats?.todaySessions]);

  const pageSize = 3;
  const totalPages = Math.ceil(todaySessions.length / pageSize) || 1;
  const paginatedSessions = todaySessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-700 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Operational Center Top Banner - Quick Nav */}
      <div className="flex flex-nowrap items-center justify-between gap-1.5 p-2.5 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/70 dark:bg-sky-950/20 shadow-xs w-full max-w-full overflow-x-hidden">
        <Link
          href="/admin/dashboard"
          className="bg-blue-600 text-white font-medium text-xs tracking-tight px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:bg-blue-700"
        >
          <School className="w-4 h-4 text-white shrink-0" />
          <span>Trung Tâm Điều Hành & Vận Hành</span>
        </Link>

        <div className="flex flex-nowrap items-center gap-1.5">
          <Link
            href="/admin/classes"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-medium text-xs tracking-tight px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Quản lý Lớp học</span>
          </Link>

          <Link
            href="/admin/students"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-medium text-xs tracking-tight px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Học sinh & Xếp lớp</span>
          </Link>

          <Link
            href="/admin/teachers"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-medium text-xs tracking-tight px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Đội ngũ Giáo viên</span>
          </Link>

          <Link
            href="/admin/finance"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-medium text-xs tracking-tight px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Tài chính & Thu phí</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-medium text-xs tracking-tight px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Báo cáo & AI Insights</span>
          </Link>
        </div>
      </div>

      {/* 1. HÀNG KPI METRICS ĐẦU TRANG (Grid 4 cột phẳng) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng số Học sinh */}
        <Link href="/admin/students" className="group block h-full">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all hover:border-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng số Học sinh</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{stats.totalStudents || 0}</div>
              <div className="text-xs text-slate-400 truncate">Học sinh đang hoạt động</div>
            </div>
          </div>
        </Link>

        {/* KPI 2: Lớp học Đang mở */}
        <Link href="/admin/classes" className="group block h-full">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all hover:border-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lớp học Đang mở</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{stats.activeClasses || 0}</div>
              <div className="text-xs text-slate-400 truncate">Các lớp đang hoạt động</div>
            </div>
          </div>
        </Link>

        {/* KPI 3: CÔNG NỢ CHƯA THU */}
        <Link href="/admin/finance?tab=students&filter=debt" className="group block h-full">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all hover:border-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">CÔNG NỢ CHƯA THU</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{formatVND(stats.unpaidDebt || 0)}</div>
              <div className="text-xs text-slate-400 truncate">{stats.debtCount || 0} khoản nợ • Bấm để xem danh sách</div>
            </div>
          </div>
        </Link>

        {/* KPI 4: Doanh thu Tháng này */}
        <Link href="/admin/finance?tab=transactions" className="group block h-full">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all hover:border-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu Tháng này</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{formatVND(stats.monthlyRevenue || 0)}</div>
              <div className="text-xs text-slate-400 truncate">Học phí đã thực thu</div>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. THANH DÒNG TIỀN VẬN HÀNH & HIỆU QUẢ (Flat Metric Strip) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Dòng Tiền Vận Hành & Chi Phí Nhân Sự
            </h3>
          </div>
          <Link
            href="/admin/finance"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Xem chi tiết tài chính</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu đã thu</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {formatVND(stats.monthlyRevenue || 0)}
            </div>
            <div className="text-xs text-slate-400 truncate">Học phí đã xác nhận</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dự tính lương GV</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {formatVND(totalPayrollBudget || 0)}
            </div>
            <div className="text-xs text-slate-400 truncate">Số ca hoàn tất</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lợi nhuận gộp</span>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {formatVND(grossMargin > 0 ? grossMargin : 0)}
            </div>
            <div className="text-xs text-slate-400 truncate">Chênh lệch vận hành</div>
          </div>
        </div>
      </div>

      {/* 3. BỐ CỤC 2 CỘT ĐIỀU HÀNH BÊN DƯỚI (Grid 12 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (6/12): CẢNH BÁO VẬN HÀNH & CÔNG NỢ */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl border ${
                operationalAlerts.length > 0
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}>
                {operationalAlerts.length > 0 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Cảnh báo vận hành cần xử lý
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              operationalAlerts.length > 0
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {operationalAlerts.length} sự vụ
            </span>
          </div>

          {operationalAlerts.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400 italic">
              Hiện tại không có sự vụ vận hành nào cần xử lý. Hệ thống hoạt động bình thường.
            </div>
          ) : (
            <div className="space-y-2.5">
              {operationalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${alert.badgeClass}`}>
                        {alert.badgeText}
                      </span>
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {alert.title}
                      </span>
                    </div>
                    {alert.subtitle && (
                      <p className="text-xs text-slate-500">{alert.subtitle}</p>
                    )}
                  </div>

                  <Link
                    href={alert.link}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                  >
                    <span>{alert.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (6/12): CA HỌC HÔM NAY & ĐIỂM DANH */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Ca học hôm nay
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {todaySessions.length} ca
                </span>
              </div>
            </div>

            {todaySessions.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>Trang {currentPage} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || todaySessions.length <= 3}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Trang trước"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || todaySessions.length <= 3}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Trang sau"
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {todaySessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 italic">
              Hôm nay trung tâm không có ca học nào diễn ra.
            </div>
          ) : (
            <div className="space-y-2.5">
              {paginatedSessions.map((session: any) => {
                const isAttended = session.status === "completed" || (session.attendance_count || 0) > 0;
                const className = session.class?.name || classes.find((c: any) => c.id === session.class_id)?.name || "Lớp học";
                const teacherName = session.teacher?.full_name || "Chưa phân công";
                const roomName = session.class?.room || "Chưa xếp phòng";
                const classId = session.class_id || session.class?.id;

                return (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {className}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                            isAttended
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isAttended ? "Đã điểm danh" : "Chưa điểm danh"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {teacherName}
                        </span>
                        <span className="flex items-center gap-1">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {roomName}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={classId ? `/admin/attendance?classId=${classId}` : "/admin/attendance"}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      <span>Điểm danh</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi Tiết Công Nợ Chưa Thu & Dọn Nợ Ảo */}
      <Dialog open={isDebtModalOpen} onOpenChange={setIsDebtModalOpen}>
        <DialogContent className="max-w-2xl bg-card rounded-2xl p-6 shadow-2xl border border-border/80 max-h-[88vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    Chi Tiết Công Nợ Chưa Thu
                    <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/20 font-mono">
                      {formatVND(stats.unpaidDebt || 0)}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {debtDetails.length} khoản nợ cần thanh toán hoặc xóa bỏ
                  </DialogDescription>
                </div>
              </div>

            </div>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {debtDetails.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-2xl border border-border/60">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm text-foreground">Không còn khoản nợ nào!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tất cả học sinh đều đã hoàn tất học phí. Công nợ hiện tại là 0 đ.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {debtDetails.map((debt) => (
                  <div
                    key={debt.id}
                    className="p-4 rounded-2xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{debt.studentName}</span>
                        <span className="text-xs text-muted-foreground font-mono">({debt.parentPhone})</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            debt.type === "pending_invoice"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {debt.type === "pending_invoice" ? "Hóa đơn chờ thu" : "Nợ buổi âm"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Lớp: <strong className="text-foreground/90">{debt.className}</strong> •{" "}
                        <span>{debt.description}</span>
                      </p>

                      <p className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                        {formatVND(debt.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Nút Đã thu tiền */}
                      {debt.type === "pending_invoice" ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaidImmediate(debt)}
                          className="h-8 text-xs font-bold gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã thu tiền
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaidImmediate(debt)}
                          className="h-8 text-xs font-bold gap-1 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Tạo phiếu thu
                        </Button>
                      )}

                      {/* Nút Hủy nợ ảo */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelDebt(debt)}
                        className="h-8 text-xs font-semibold gap-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                        title="Xóa bỏ khoản nợ này nếu tạo nhầm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hủy nợ ảo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Tạo Hóa Đơn Thu Phí */}
      <CreateInvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        students={students}
        defaultStudentId={selectedStudentForInvoice}
        defaultClassId={selectedClassForInvoice}
        onCreated={(inv) => {
          // CHỈ mở popup VietQR khi KHÔNG tick đóng tiền ngay
          setVietQrData(inv);
        }}
        onSuccessPaid={(data) => {
          showToast(`Đã thu ${formatVND(data.amount)} thành công cho học sinh ${data.studentName}!`);
          setStats((prev: any) => ({
            ...prev,
            monthlyRevenue: (prev.monthlyRevenue || 0) + data.amount,
          }));
          window.location.reload();
        }}
      />

      {/* Popup VietQR (chỉ hiện khi chưa đóng tiền ngay để gửi phụ huynh) */}
      <VietQRModal
        isOpen={Boolean(vietQrData)}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />
    </div>
  );
}
