"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Phone,
  Trash2,
  ArrowLeft,
  School,
  AlertCircle,
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
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
  const { classes, students, removeStudentFromClass } = useAppData();
  // Ưu tiên dữ liệu thật từ Server/Supabase (initialClassData)
  const classData = initialClassData || classes.find((c) => c.id === initialClassData?.id);

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

  // Chuẩn hóa danh sách học sinh hiển thị trong bảng từ Server (Single Source of Truth)
  const effectiveEnrollments = useMemo(() => {
    return (classData?.enrollments || [])
      .filter(
        (e: any) =>
          e &&
          (!e.status || e.status === "active") &&
          e.student &&
          e.student.id &&
          (e.student.full_name || e.student.name)
      )
      .map((e: any) => ({
        id: e.id,
        student_id: e.student_id || e.student.id,
        balance_sessions: e.balance_sessions,
        status: e.status || "active",
        student: {
          id: e.student.id,
          full_name: e.student.full_name || e.student.name,
          student_code: e.student.student_code || e.student.code || `HS-${e.student.id.slice(-4).toUpperCase()}`,
          dob: e.student.dob || e.student.birth_date,
          parent_name: e.student.parent_name || e.student.parentName || "Chưa có",
          parent_phone: e.student.parent_phone || e.student.parentPhone || "",
          attendedSessions: e.student.attendedSessions,
          absentCount: e.student.absentCount,
          isPaid: e.student.isPaid,
          tuitionStatus: e.student.tuitionStatus,
        },
      }));
  }, [classData?.enrollments]);

  const actualCount = effectiveEnrollments.length;
  const maxCap = classData.maxCapacity || classData.max_students || 20;

  // Tính tiến trình buổi học
  const plannedSessions = classData.totalPlannedSessions ?? classData.total_planned_sessions ?? null;
  const doneSessions = classData.completedSessions || 0;
  const sessionPercent = plannedSessions && plannedSessions > 0
    ? Math.min(100, Math.round((doneSessions / plannedSessions) * 100))
    : 0;

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
      </div>

      {/* 1. Header Tiến độ Khóa học Chung của Lớp (Cohort Progress) */}
      {plannedSessions && plannedSessions > 0 ? (
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
              {(classData.startDate || classData.start_date) && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground font-medium">
                    {classData.durationMonths || classData.duration_months ? `Khóa ${classData.durationMonths || classData.duration_months} tháng ` : ""}
                    ({formatDate(classData.startDate || classData.start_date)} → {formatDate(classData.endDate || classData.end_date)})
                  </span>
                </>
              )}
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
      ) : null}

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
                Lớp học đã qua thời hạn kết thúc ({formatDate(classData.startDate || classData.start_date)} → {formatDate(classData.endDate || classData.end_date)}){plannedSessions ? ` hoặc đã hoàn tất chương trình (${doneSessions}/${plannedSessions} buổi)` : ""}. Hệ thống đã tự động khóa tính năng ghi danh mới.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Class KPI Summary Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sĩ số */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sĩ số lớp</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {actualCount} <span className="text-sm font-normal text-slate-400">/ {maxCap} HS <span className="text-xs font-normal text-slate-400 font-mono">({Math.min(100, Math.round((actualCount / (maxCap || 1)) * 100))}%)</span></span>
            </div>
            <div className="text-xs text-slate-400 truncate">Học sinh đang theo học</div>
          </div>
        </div>

        {/* 2. Thời hạn khóa học */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thời hạn</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {classData.durationMonths || classData.duration_months || "Chưa cấu hình"} <span className="text-sm font-normal text-slate-400">tháng</span>
            </div>
            <div className="text-xs text-slate-400 truncate">
              {formatDate(classData.startDate || classData.start_date)} → {formatDate(classData.endDate || classData.end_date)}
            </div>
          </div>
        </div>

        {/* 3. Tiến trình buổi học */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiến trình</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {doneSessions} <span className="text-sm font-normal text-slate-400">/ {plannedSessions} buổi</span>
            </div>
            <div className="text-xs text-slate-400 truncate">{sessionPercent}% hoàn thành khóa học</div>
          </div>
        </div>

        {/* 4. Giáo viên phụ trách */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Giáo viên phụ trách</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1 truncate">
              {classData.teacher?.full_name || classData.teacherName || "Chưa phân công"}
            </div>
            <div className="text-xs text-slate-400 truncate">
              Học phí: {formatVND(classData.fee_per_session)} / buổi
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Students Table - Cohort Standardized */}
      <Card className="border bg-card shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold">Danh sách Học sinh trong lớp</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Khóa học vận hành theo kỳ đồng nhất (
                {(classData.durationMonths || classData.duration_months) ? `${classData.durationMonths || classData.duration_months} tháng • ` : ""}
                {plannedSessions ?? "Chưa cấu hình"} buổi) • Tất cả học sinh học chung tiến độ
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">
              {actualCount} học sinh
            </Badge>
          </div>
        </CardHeader>

        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-0">
              <TableHead className="w-[280px] text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Học sinh</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Phụ huynh & SĐT</TableHead>
              <TableHead className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Chuyên cần</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actualCount === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-8 text-center text-sm text-slate-400 italic">
                  Lớp học hiện chưa có học sinh nào. Học sinh sẽ được tự động thêm vào đây khi hoàn tất Ghi danh tại phân hệ Tuyển sinh.
                </TableCell>
              </TableRow>
            ) : (
              effectiveEnrollments.map((enr: any) => {
                const s = enr.student;
                
                // Chuyên cần: Số buổi có mặt thực tế / Tổng số buổi đã diễn ra
                const studentAttended = doneSessions === 0
                  ? 0
                  : (s.attendedSessions ?? (s.absentCount ? Math.max(0, doneSessions - s.absentCount) : doneSessions));

                return (
                  <TableRow key={enr.id || enr.student_id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                    {/* Cột 1: Học sinh */}
                    <TableCell className="py-3 px-4 text-sm text-slate-700 font-medium">
                      <div className="font-bold text-sm text-foreground">{s.full_name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {s.student_code || `HS-${(s.id || "").slice(-4).toUpperCase()}`}
                      </div>
                    </TableCell>

                    {/* Cột 2: Phụ huynh & SĐT */}
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{s.parent_name || "Chưa có"}</span>
                        {s.parent_phone ? (
                          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-primary" />
                            {s.parent_phone}
                          </p>
                        ) : (
                          <p className="text-muted-foreground/60 text-[11px] mt-0.5 italic">
                            Chưa có SĐT
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Cột 3: Chuyên cần */}
                    <TableCell className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium text-center">
                      <span className="font-mono font-semibold text-xs">
                        {doneSessions > 0 ? `${studentAttended}/${doneSessions} buổi` : "0/0 buổi"}
                      </span>
                    </TableCell>

                    {/* Cột 4: Thao tác */}
                    <TableCell className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href="/admin/students">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                            title="Xem hồ sơ học sinh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
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

    </div>
  );
}
