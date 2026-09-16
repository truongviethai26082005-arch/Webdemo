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

  const totalPayrollBudget = payroll.reduce((sum, p) => sum + (p.totalSalary || 0), 0);
  const grossMargin = (stats.monthlyRevenue || 0) - totalPayrollBudget;

  // ── CẢNH BÁO VẬN HÀNH (Operational Alerts) ──
  const operationalAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      type: "no_teacher" | "no_room" | "unattended";
      badgeText: string;
      badgeClass: string;
      title: string;
      subtitle?: string;
      classId: string;
    }> = [];

    // 1. Lớp chưa có giáo viên
    classes.forEach((cls: any) => {
      const hasTeacher = Boolean(
        cls.teacher_id ||
        cls.teacherId ||
        cls.teacher?.id ||
        (cls.teacherName && cls.teacherName.trim() !== "") ||
        (cls.teacher?.full_name && cls.teacher?.full_name.trim() !== "")
      );
      if (!hasTeacher) {
        alerts.push({
          id: `no_teacher_${cls.id}`,
          type: "no_teacher",
          badgeText: "Chưa có giáo viên",
          badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
          title: `Lớp ${cls.name}`,
          subtitle: "Lớp học chưa được phân công giáo viên",
          classId: cls.id,
        });
      }
    });

    // 2. Lớp chưa xếp phòng
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
          badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
          title: `Lớp ${cls.name}`,
          subtitle: "Lớp học chưa được bố trí phòng học",
          classId: cls.id,
        });
      }
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
          badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
          title: `Lớp ${clsName}`,
          subtitle: `${timeStr} đã kết thúc nhưng chưa hoàn tất điểm danh`,
          classId,
        });
      }
    });

    return alerts;
  }, [classes, stats?.todaySessions]);

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

      {/* Operational Center Top Banner */}
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/70 dark:bg-sky-950/20 shadow-xs">
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/80 dark:bg-slate-900/80 border border-sky-100 dark:border-sky-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <School className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
            Trung Tâm Điều Hành & Vận Hành
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto">
          <Link
            href="/admin/classes"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Quản lý Lớp học</span>
          </Link>

          <Link
            href="/admin/students"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Học sinh & Xếp lớp</span>
          </Link>

          <Link
            href="/admin/teachers"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Đội ngũ Giáo viên</span>
          </Link>

          <Link
            href="/admin/finance"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Tài chính & Thu phí</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white dark:bg-card hover:bg-white/90 dark:hover:bg-muted border border-sky-200/80 dark:border-sky-900/40 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Báo cáo & AI Insights</span>
          </Link>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards (Bấm được và chuyển hướng) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng số Học sinh -> /admin/students */}
        <Link href="/admin/students" className="group block h-full">
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng số Học sinh</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{stats.totalStudents}</div>
              <div className="text-xs text-slate-400 truncate">Đang học tại trung tâm (Bấm để xem)</div>
            </div>
          </div>
        </Link>

        {/* KPI 2: Lớp học Đang mở -> /admin/classes */}
        <Link href="/admin/classes" className="group block h-full">
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lớp học Đang mở</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{stats.activeClasses}</div>
              <div className="text-xs text-slate-400 truncate">Các lớp đang hoạt động (Bấm để xem)</div>
            </div>
          </div>
        </Link>

        {/* KPI 3: CÔNG NỢ CHƯA THU -> /admin/finance?tab=students&filter=debt */}
        <Link href="/admin/finance?tab=students&filter=debt" className="group block h-full">
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
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

        {/* KPI 4: Doanh thu Tháng này -> /admin/finance?tab=transactions */}
        <Link href="/admin/finance?tab=transactions" className="group block h-full">
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu Tháng này</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">{formatVND(stats.monthlyRevenue || 0)}</div>
              <div className="text-xs text-slate-400 truncate">Học phí đã thực thu (Bấm xem HĐ)</div>
            </div>
          </div>
        </Link>
      </div>

      {/* 2-Column Main Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7/12): Cảnh báo học sinh sắp hết buổi & Dòng tiền */}
        <div className="lg:col-span-7 space-y-6">
          {/* CẢNH BÁO VẬN HÀNH (Operational Alerts) */}
          <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl border ${
                      operationalAlerts.length > 0
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {operationalAlerts.length > 0 ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      CẢNH BÁO VẬN HÀNH
                    </CardTitle>
                    {operationalAlerts.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                        {operationalAlerts.length} sự vụ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        Ổn định
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href="/admin/classes"
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                >
                  Quản lý Lớp <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {operationalAlerts.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Hệ thống vận hành ổn định. Các lớp học đều đã đủ giáo viên, phòng học và hoàn tất điểm danh.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {operationalAlerts.map((alert) => (
                    <Link
                      key={alert.id}
                      href={alert.classId ? `/admin/classes/${alert.classId}` : "/admin/classes"}
                      className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors gap-3 group block"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${alert.badgeClass}`}
                          >
                            {alert.badgeText}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-primary transition-colors truncate">
                            {alert.title}
                          </span>
                        </div>
                        {alert.subtitle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {alert.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold">
                        <span className="hidden sm:inline">Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dòng tiền Vận hành & Chi phí Nhân sự */}
          <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Dòng Tiền Vận Hành & Chi Phí Nhân Sự
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ước tính doanh thu học phí thu vào và ngân sách trả lương giáo viên
                    </CardDescription>
                  </div>
                </div>

                <Link
                  href="/admin/teachers?tab=payroll"
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                >
                  Bảng lương <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh thu đã thu</span>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
                    {formatVND(stats.monthlyRevenue || 0)}
                  </div>
                  <div className="text-xs text-slate-400 truncate">Học phí tháng này</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dự tính lương GV</span>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
                    {formatVND(totalPayrollBudget)}
                  </div>
                  <div className="text-xs text-slate-400 truncate">Số ca dạy hoàn tất</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lợi nhuận gộp</span>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
                    {formatVND(grossMargin > 0 ? grossMargin : 0)}
                  </div>
                  <div className="text-xs text-slate-400 truncate">Chênh lệch vận hành</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5/12): Tình Hình Vận Hành Lớp Học (kèm Tag trạng thái ca học hôm nay) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Tình Hình Vận Hành Lớp Học
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Theo dõi ca học hôm nay và sĩ số các lớp
                    </CardDescription>
                  </div>
                </div>

                <Link
                  href="/admin/classes"
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                >
                  Tất cả ({classes.length}) <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {classes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <BookOpen className="w-9 h-9 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground">Chưa có lớp học nào</p>
                  <p className="text-xs text-muted-foreground mt-1">Tạo lớp học mới trong mục Quản lý Lớp học.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 max-h-[520px] overflow-y-auto">
                  {classes.slice(0, 10).map((cls) => {
                    const studentCount = cls.enrollment_count || 0;
                    const todayStatus = getClassTodayStatus(cls, stats.todaySessions || []);

                    return (
                      <div key={cls.id} className="p-3.5 hover:bg-muted/40 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/admin/classes/${cls.id}`}
                                className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate max-w-[170px]"
                                title={cls.name}
                              >
                                {cls.name}
                              </Link>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 shrink-0"
                              >
                                {studentCount} học viên
                              </Badge>
                            </div>

                            {/* Tag trạng thái ca học hôm nay */}
                            <div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${todayStatus.badgeClass}`}
                              >
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{todayStatus.text}</span>
                              </Badge>
                            </div>

                            <div className="text-[11px] text-muted-foreground space-y-0.5 pt-0.5">
                              <p className="flex items-center gap-1">
                                <DoorOpen className="w-3 h-3 text-muted-foreground" />
                                {cls.room || "Chưa xếp phòng"}
                              </p>
                              <p className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-muted-foreground" />
                                GV: <span className="font-semibold text-foreground/80">{cls.teacher?.full_name || "Chưa phân công"}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {formatVND(cls.fee_per_session)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">/ buổi</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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
