"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  UserPlus,
  CalendarCheck,
  Receipt,
  Phone,
  Trash2,
  ArrowLeft,
  DollarSign,
  School,
  AlertCircle,
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import { AddStudentDialog } from "@/components/classes/add-student-dialog";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import { VietQRModal } from "@/components/invoices/vietqr-modal";
import { removeStudentFromClass as removeStudentFromClassServer } from "@/lib/actions/students";
import { useAppData } from "@/lib/context/app-data-context";

interface ClassDetailClientProps {
  classData: any;
  allStudents: any[];
  teachers: any[];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

export function ClassDetailClient({
  classData: initialClassData,
  allStudents,
  teachers,
}: ClassDetailClientProps) {
  const { classes, students, invoices, removeStudentFromClass } = useAppData();
  const classData = classes.find((c) => c.id === initialClassData.id) || initialClassData;

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [selectedStudentForInvoice, setSelectedStudentForInvoice] = useState<string | undefined>();
  const [vietQrData, setVietQrData] = useState<any | null>(null);

  // Kiểm tra lớp đã kết thúc hay chưa
  const isCompleted = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const eDate = classData.endDate || classData.end_date;
    const total = classData.totalPlannedSessions || 0;
    const comp = classData.completedSessions || 0;
    return (
      classData.status === "completed" ||
      Boolean(eDate && eDate < today) ||
      Boolean(total > 0 && comp >= total)
    );
  }, [classData]);

  // 1. Tính toán Sĩ số ĐỘNG và danh sách học sinh thuộc lớp này từ Single Source of Truth
  const enrolledStudents = useMemo(() => {
    return (students || []).filter(
      (s: any) => s.classId === classData.id || s.className === classData.name
    );
  }, [students, classData.id, classData.name]);

  // Chuẩn hóa danh sách học sinh hiển thị trong bảng
  const effectiveEnrollments = useMemo(() => {
    if (enrolledStudents.length > 0) {
      return enrolledStudents.map((s: any) => ({
        id: `enr-${s.id}`,
        student_id: s.id,
        status: s.status || "active",
        student: {
          id: s.id,
          full_name: s.full_name || s.name || "Học sinh",
          student_code: s.studentCode || s.code || `HS-${s.id.slice(-4).toUpperCase()}`,
          dob: s.dob || s.birth_date,
          parent_name: s.parent_name || s.parentName || "Phụ huynh",
          parent_phone: s.parent_phone || s.parentPhone || "",
          attendedSessions: s.attendedSessions,
          absentCount: s.absentCount,
          isPaid: s.isPaid,
          tuitionStatus: s.tuitionStatus,
        },
      }));
    }
    return (classData.enrollments || []).map((e: any) => ({
      ...e,
      student: {
        ...e.student,
        id: e.student?.id || e.student_id,
        full_name: e.student?.full_name || "Học sinh",
        student_code: e.student?.studentCode || e.student?.code || `HS-${(e.student_id || e.id || "0000").slice(-4).toUpperCase()}`,
        parent_name: e.student?.parent_name || "Phụ huynh",
        parent_phone: e.student?.parent_phone || "",
      },
    }));
  }, [enrolledStudents, classData.enrollments]);

  const actualCount = effectiveEnrollments.length;
  const maxCap = classData.maxCapacity || classData.max_students || 20;
  const alreadyEnrolledStudentIds = effectiveEnrollments.map((e: any) => e.student?.id || e.student_id);

  // Tính tiến trình buổi học
  const plannedSessions = classData.totalPlannedSessions || 24;
  const doneSessions = classData.completedSessions || 0;
  const sessionPercent = Math.min(100, Math.round((doneSessions / (plannedSessions || 1)) * 100));

  async function handleRemove(studentIdOrEnrollmentId: string, studentName: string) {
    if (confirm(`Bạn có chắc muốn xóa học sinh "${studentName}" khỏi lớp này?`)) {
      removeStudentFromClass(classData.id, studentIdOrEnrollmentId);
      try {
        await removeStudentFromClassServer(studentIdOrEnrollmentId, classData.id);
      } catch (e) {
        console.warn("Background db remove warning:", e);
      }
    }
  }

  function handleQuickInvoice(studentId: string) {
    setSelectedStudentForInvoice(studentId);
    setIsInvoiceOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách Lớp học
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSessionOpen(true)}
            className="gap-2 text-xs"
          >
            <CalendarCheck className="w-4 h-4 text-primary" />
            Tạo Buổi học Lớp này
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddStudentOpen(true)}
            disabled={isCompleted}
            className={`gap-2 text-xs shadow-sm ${
              isCompleted ? "opacity-60 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted" : ""
            }`}
            title={isCompleted ? "Khóa học đã kết thúc, không thể ghi danh thêm học sinh mới" : undefined}
          >
            <UserPlus className="w-4 h-4" />
            {isCompleted ? "Đã khóa ghi danh" : "+ Thêm Học Sinh Vào Lớp"}
          </Button>
        </div>
      </div>

      {/* 1. Header Tiến độ Khóa học Chung của Lớp (Cohort Progress) */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft space-y-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              Tiến độ khóa học:
            </span>
            <span className="font-mono font-bold text-primary text-sm bg-primary/10 px-2 py-0.5 rounded-lg">
              Đã dạy {doneSessions} / {plannedSessions} buổi
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-medium">
              Khóa {classData.durationMonths || 3} tháng ({formatDate(classData.startDate || classData.start_date)} → {formatDate(classData.endDate || classData.end_date)})
            </span>
          </div>
          <span className="font-mono font-bold text-xs text-primary shrink-0">
            {sessionPercent}% hoàn thành
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? "bg-slate-400" : "bg-primary"
            }`}
            style={{ width: `${sessionPercent}%` }}
          />
        </div>
      </div>

      {/* Completion Alert Banner if Completed */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-zinc-500/10 border border-zinc-400/30 text-zinc-700 dark:text-zinc-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-500/20 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">
                  Khóa học đã kết thúc (Bế giảng)
                </span>
                <Badge variant="outline" className="bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-400/30 text-[11px] font-bold">
                  ⚪ Đã kết thúc
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lớp học đã qua thời hạn kết thúc ({formatDate(classData.startDate || classData.start_date)} → {formatDate(classData.endDate || classData.end_date)}) hoặc đã hoàn tất chương trình ({doneSessions}/{plannedSessions} buổi). Hệ thống đã tự động khóa tính năng ghi danh mới.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Class KPI Summary Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sĩ số */}
        <Card className="border bg-card shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sĩ số lớp</span>
            <Users className="w-4 h-4 text-primary/70" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-foreground">
              {actualCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ {maxCap} học sinh</span>
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all ${
                  actualCount >= maxCap ? "bg-red-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, Math.round((actualCount / maxCap) * 100))}%` }}
              />
            </div>
          </div>
        </Card>

        {/* 2. Thời hạn khóa học */}
        <Card className="border bg-card shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Thời hạn</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-foreground">
              {classData.durationMonths || 3} <span className="text-xs font-normal text-muted-foreground">tháng</span>
            </p>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">
              {formatDate(classData.startDate || classData.start_date)} → {formatDate(classData.endDate || classData.end_date)}
            </p>
          </div>
        </Card>

        {/* 3. Tiến trình buổi học */}
        <Card className="border bg-card shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tiến trình</span>
            <span className="text-xs font-black font-mono text-primary">{sessionPercent}%</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-foreground font-mono">
              {doneSessions}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ {plannedSessions} buổi</span>
            </p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${sessionPercent}%` }}
              />
            </div>
          </div>
        </Card>

        {/* 4. Học phí & Giáo viên */}
        <Card className="border bg-card shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Học phí & GV</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-primary font-mono">{formatVND(classData.fee_per_session)}</p>
            <p className="text-[11px] text-foreground font-medium truncate mt-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>{classData.teacher?.full_name || classData.teacherName || "Chưa phân công"}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Enrolled Students Table - Cohort Standardized */}
      <Card className="border bg-card shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold">Danh sách Học sinh trong lớp</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Khóa học vận hành theo kỳ đồng nhất ({classData.durationMonths || 3} tháng • {plannedSessions} buổi) • Tất cả học sinh học chung tiến độ
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">
              {actualCount} học sinh
            </Badge>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[240px]">Học sinh</TableHead>
              <TableHead>Phụ huynh & SĐT</TableHead>
              <TableHead className="text-center">Chuyên cần</TableHead>
              <TableHead className="text-center">Học phí khóa học</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actualCount === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">Chưa có học sinh nào trong lớp này</p>
                  <p className="text-xs mt-0.5">Bấm "+ Thêm Học Sinh Vào Lớp" để bắt đầu ghi danh.</p>
                </TableCell>
              </TableRow>
            ) : (
              effectiveEnrollments.map((enr: any) => {
                const s = enr.student;
                
                // 1. Chuyên cần: Số buổi có mặt thực tế / Tổng số buổi đã diễn ra
                const studentAttended = doneSessions === 0
                  ? 0
                  : (s.attendedSessions ?? (s.absentCount ? Math.max(0, doneSessions - s.absentCount) : doneSessions));
                const attendanceRate = doneSessions > 0 ? Math.round((studentAttended / doneSessions) * 100) : 100;

                // 2. Học phí khóa học: Đã đóng đủ cả khóa vs Còn nợ đợt 2
                const studentInvoices = (invoices || []).filter(
                  (inv: any) =>
                    (inv.student_id === s.id || inv.studentId === s.id) &&
                    (inv.class_id === classData.id || inv.classId === classData.id || !inv.class_id)
                );
                const hasUnpaidInvoice = studentInvoices.some(
                  (inv: any) => inv.status === "pending" || inv.status === "unpaid"
                );
                const isPaidFull =
                  s.tuitionStatus === "paid" ||
                  s.isPaid === true ||
                  (studentInvoices.length > 0 && !hasUnpaidInvoice && studentInvoices.some((inv: any) => inv.status === "paid"));

                return (
                  <TableRow key={enr.id || enr.student_id} className="hover:bg-muted/50 transition-colors">
                    {/* Cột 1: Học sinh (Họ tên + Ngày sinh/Mã HS) */}
                    <TableCell>
                      <div className="font-bold text-sm text-foreground">{s.full_name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-2">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold text-foreground/80">
                          {s.student_code || `HS-${(s.id || "").slice(-4).toUpperCase()}`}
                        </span>
                        {s.dob && (
                          <span>NS: {formatDate(s.dob)}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Cột 2: Phụ huynh & SĐT */}
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{s.parent_name || "Phụ huynh"}</span>
                        <p className="text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-primary" />
                          {s.parent_phone || "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    {/* Cột 3: Chuyên cần (Số buổi có mặt thực tế / Tiến độ hiện tại của lớp) */}
                    <TableCell className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium text-center">
                      <span className="font-mono font-semibold text-xs">
                        {s.attendedSessions || doneSessions || 8}/{doneSessions || 8} buổi
                      </span>
                    </TableCell>

                    {/* Cột 4: Học phí khóa học */}
                    <TableCell className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        Đã đóng cả khóa
                      </span>
                    </TableCell>

                    {/* Cột 5: Thao tác */}
                    <TableCell className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickInvoice(s.id || enr.student_id)}
                          className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/10 px-2.5 rounded-lg"
                          title="Xem chi tiết thanh toán / Xuất hóa đơn"
                        >
                          <Receipt className="w-3.5 h-3.5 mr-1" />
                          Chi tiết
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleRemove(enr.student_id || enr.id, s.full_name)}
                          title="Xóa khỏi lớp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialogs */}
      <AddStudentDialog
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        classId={classData.id}
        className={classData.name}
        allStudents={students && students.length > 0 ? students : allStudents}
        alreadyEnrolledStudentIds={alreadyEnrolledStudentIds}
      />

      <CreateSessionDialog
        isOpen={isSessionOpen}
        onClose={() => setIsSessionOpen(false)}
        classes={[classData]}
        teachers={teachers}
        defaultClassId={classData.id}
      />

      <CreateInvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        students={students && students.length > 0 ? students : allStudents}
        defaultStudentId={selectedStudentForInvoice}
        defaultClassId={classData.id}
        onCreated={(inv) => setVietQrData(inv)}
      />

      <VietQRModal
        isOpen={Boolean(vietQrData)}
        onClose={() => setVietQrData(null)}
        invoice={vietQrData}
      />
    </div>
  );
}
