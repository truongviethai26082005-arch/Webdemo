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
  cleanUpTestPendingInvoices,
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
  const [isCleaning, setIsCleaning] = useState(false);

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

  // Action: Dọn sạch toàn bộ hóa đơn pending test (đặc biệt học sinh Lâm)
  async function handleCleanAllTestDebt() {
    setIsCleaning(true);
    const res = await cleanUpTestPendingInvoices("ALL");
    setIsCleaning(false);

    if (res?.error) {
      alert(res.error);
    } else {
      setDebtDetails([]);
      setStats((prev: any) => ({
        ...prev,
        unpaidDebt: 0,
        debtCount: 0,
      }));
      showToast("Đã dọn sạch toàn bộ các hóa đơn nợ test! Công nợ hiện tại là 0 đ.");
    }
  }

  const totalPayrollBudget = payroll.reduce((sum, p) => sum + (p.totalSalary || 0), 0);
  const grossMargin = (stats.monthlyRevenue || 0) - totalPayrollBudget;

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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-xs">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Trung Tâm Điều Hành & Vận Hành</h3>
            <p className="text-xs text-muted-foreground">
              Bao quát tình hình hoạt động, lớp học, học viên và tài chính trung tâm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/classes">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              Quản lý Lớp học
            </Button>
          </Link>

          <Link href="/admin/students">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted"
            >
              <Users className="w-4 h-4 text-primary" />
              Học sinh & Xếp lớp
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              setSelectedStudentForInvoice(undefined);
              setSelectedClassForInvoice(undefined);
              setIsInvoiceOpen(true);
            }}
            className="gap-2 text-xs font-bold h-9 shadow-md shadow-primary/25 rounded-xl"
          >
            <Receipt className="w-4 h-4" />
            + Thu Học Phí (VietQR)
          </Button>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards (Bấm được và chuyển hướng / mở modal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng số Học sinh -> /admin/students */}
        <Link href="/admin/students" className="group block">
          <Card className="h-full relative overflow-hidden border border-border/80 bg-gradient-to-b from-blue-500/5 to-transparent bg-card shadow-soft rounded-2xl group-hover:border-blue-500/50 group-hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  <span>Tổng số Học sinh</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-2xl font-black text-foreground font-mono tracking-tight">
                  {stats.totalStudents}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Đang học tại trung tâm (Bấm để xem)
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* KPI 2: Lớp học Đang mở -> /admin/classes */}
        <Link href="/admin/classes" className="group block">
          <Card className="h-full relative overflow-hidden border border-border/80 bg-gradient-to-b from-indigo-500/5 to-transparent bg-card shadow-soft rounded-2xl group-hover:border-indigo-500/50 group-hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                  <span>Lớp học Đang mở</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-2xl font-black text-foreground font-mono tracking-tight">
                  {stats.activeClasses}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Các lớp đang hoạt động (Bấm để xem)
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* KPI 3: Công nợ chưa thu -> Bấm vào MỞ MODAL CHI TIẾT */}
        <div onClick={() => setIsDebtModalOpen(true)} className="group cursor-pointer">
          <Card className="h-full relative overflow-hidden border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent bg-card shadow-soft rounded-2xl group-hover:border-rose-500 group-hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <span>Công nợ chưa thu</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                  {formatVND(stats.unpaidDebt || 0)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.debtCount || 0} khoản nợ • Bấm để xử lý / xóa nợ
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI 4: Doanh thu Tháng này -> /admin/finance?tab=transactions */}
        <Link href="/admin/finance?tab=transactions" className="group block">
          <Card className="h-full relative overflow-hidden border border-border/80 bg-gradient-to-b from-amber-500/5 to-transparent bg-card shadow-soft rounded-2xl group-hover:border-amber-500/50 group-hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                  <span>Doanh thu Tháng này</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                  {formatVND(stats.monthlyRevenue || 0)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Học phí đã thực thu (Bấm xem HĐ)
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 2-Column Main Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7/12): Cảnh báo học sinh sắp hết buổi & Dòng tiền */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cảnh Báo Thu Phí (Học sinh <= 2 buổi) */}
          <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Cảnh Báo Thu Học Phí (Sắp Hết Buổi)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Học sinh còn ≤ 2 buổi trong ví lớp học cần thu phí
                    </CardDescription>
                  </div>
                </div>

                <Link
                  href="/admin/students"
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                >
                  Xem tất cả <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {stats.lowBalanceList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-foreground">Tất cả học sinh đều có đủ số dư</p>
                  <p className="text-xs text-muted-foreground mt-1">Không có học sinh nào bị nợ buổi hoặc sắp hết buổi.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {stats.lowBalanceList.slice(0, 5).map((item: any) => {
                    const isZeroOrNegative = item.balanceSessions <= 0;
                    return (
                      <div
                        key={item.enrollmentId}
                        className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-foreground">
                              {item.studentName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                                isZeroOrNegative
                                  ? "bg-rose-500 text-white"
                                  : "bg-amber-500 text-white"
                              }`}
                            >
                              {item.balanceSessions} buổi
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Lớp: <span className="font-semibold text-foreground/80">{item.className}</span> •{" "}
                            <span className="font-mono text-[11px]">{item.parentPhone}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickInvoice(item.studentId, item.classId)}
                            className="h-8 gap-1 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            Thu phí VietQR
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70">
                  <p className="text-[11px] text-muted-foreground font-semibold">Doanh thu đã thu</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {formatVND(stats.monthlyRevenue || 0)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Học phí tháng này</p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70">
                  <p className="text-[11px] text-muted-foreground font-semibold">Dự tính lương GV</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                    {formatVND(totalPayrollBudget)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Số ca dạy hoàn tất</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">Lợi nhuận gộp</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {formatVND(grossMargin > 0 ? grossMargin : 0)}
                  </p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">Chênh lệch vận hành</p>
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

              {debtDetails.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isCleaning}
                  onClick={handleCleanAllTestDebt}
                  className="text-xs font-bold gap-1.5 h-8 rounded-xl border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Dọn sạch nợ test (Về 0đ)</span>
                </Button>
              )}
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
