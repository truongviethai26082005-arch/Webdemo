"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  DollarSign,
  Edit,
  Trash2,
  ArrowRight,
  School,
  LayoutGrid,
  List,
  AlertTriangle,
  TrendingUp,
  DoorOpen,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import { ClassDialog } from "@/components/classes/class-dialog";
import { deleteClass } from "@/lib/actions/classes";

interface ClassesClientProps {
  initialClasses: any[];
  teachers: any[];
}

export function ClassesClient({ initialClasses, teachers }: ClassesClientProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((acc, c) => acc + (c.enrollment_count || 0), 0);
    const nearCapacityClasses = classes.filter((c) => {
      const max = c.max_students || 15;
      const count = c.enrollment_count || 0;
      return count / max >= 0.8;
    }).length;

    return { totalClasses, totalStudents, nearCapacityClasses };
  }, [classes]);

  // Filter logic
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.room && c.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.teacher?.full_name && c.teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTeacher = teacherFilter === "all" || c.teacher_id === teacherFilter;

      let matchStatus = true;
      const count = c.enrollment_count || 0;
      const max = c.max_students || 15;
      const ratio = count / max;

      if (statusFilter === "active") {
        matchStatus = count > 0;
      } else if (statusFilter === "empty") {
        matchStatus = count === 0;
      } else if (statusFilter === "near_full") {
        matchStatus = ratio >= 0.8 && ratio < 1;
      } else if (statusFilter === "full") {
        matchStatus = ratio >= 1;
      }

      return matchSearch && matchTeacher && matchStatus;
    });
  }, [classes, searchTerm, teacherFilter, statusFilter]);

  async function handleDelete(id: string, name: string) {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${name}"? Thao tác này sẽ xóa dữ liệu ghi danh của lớp.`)) {
      const res = await deleteClass(id);
      if (res.error) {
        alert(res.error);
      } else {
        setClasses(classes.filter((c) => c.id !== id));
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Top 3 Quick Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng số lớp */}
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng số lớp học
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">
              {stats.totalClasses}
            </span>
            <span className="text-xs text-muted-foreground">lớp đang mở</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Bao quát tất cả bộ môn tại trung tâm
          </p>
        </Card>

        {/* Card 2: Tổng học sinh */}
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng học sinh đang học
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.totalStudents}
            </span>
            <span className="text-xs text-muted-foreground">lượt ghi danh</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Trung bình {(stats.totalStudents / (stats.totalClasses || 1)).toFixed(1)} HS / lớp
          </p>
        </Card>

        {/* Card 3: Lớp gần đầy sĩ số */}
        <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lớp gần đầy sĩ số (≥80%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.nearCapacityClasses}
            </span>
            <span className="text-xs text-muted-foreground">lớp sắp kín chỗ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Cần lên kế hoạch mở thêm lớp mới
          </p>
        </Card>
      </div>

      {/* 2. Search, Filter Bar & View Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo tên lớp, phòng, giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Teacher Filter Dropdown */}
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px]"
          >
            <option value="all">Tất cả giáo viên ({teachers.length})</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang hoạt động</option>
            <option value="near_full">🟡 Gần đầy sĩ số (≥80%)</option>
            <option value="full">🔴 Đã đầy lớp (100%)</option>
            <option value="empty">⚪ Chưa có học sinh</option>
          </select>
        </div>

        {/* Action Controls: View Mode Toggle & Create Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle (Grid vs Table) */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Xem dạng thẻ (Grid Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Xem dạng bảng (Table)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setEditingClass(null);
              setIsDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-bold h-9 rounded-xl shadow-md shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Tạo Lớp Học Mới
          </Button>
        </div>
      </div>

      {/* 3. Render Views: Cards vs Table */}
      {filteredClasses.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border border-border/80 bg-card shadow-soft">
          <School className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">Không tìm thấy lớp học nào phù hợp</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Thử thay đổi từ khóa tìm kiếm, bộ lọc hoặc bấm "Tạo Lớp Học Mới".
          </p>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const count = cls.enrollment_count || 0;
            const max = cls.max_students || 15;
            const percentage = Math.min(Math.round((count / max) * 100), 100);

            // Progress bar and badge styling
            let statusBadge = {
              text: "Đang mở",
              variant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
              progressColor: "bg-emerald-500",
            };

            if (percentage >= 100) {
              statusBadge = {
                text: "Đã đầy sĩ số",
                variant: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
                progressColor: "bg-rose-500",
              };
            } else if (percentage >= 80) {
              statusBadge = {
                text: "Gần đầy sĩ số",
                variant: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
                progressColor: "bg-amber-500",
              };
            } else if (count === 0) {
              statusBadge = {
                text: "Chưa có HS",
                variant: "bg-muted text-muted-foreground border-border",
                progressColor: "bg-muted-foreground/30",
              };
            }

            const scheduleArray = Array.isArray(cls.schedule)
              ? cls.schedule
              : typeof cls.schedule === "string"
              ? JSON.parse(cls.schedule || "[]")
              : [];

            return (
              <Card
                key={cls.id}
                className="rounded-2xl border border-border/80 bg-card shadow-soft hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Header: Class Name & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link
                        href={`/admin/classes/${cls.id}`}
                        className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 group-hover:text-primary"
                        title={cls.name}
                      >
                        {cls.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                          <strong className="text-foreground/90 font-medium">
                            {cls.room || "Chưa xếp phòng"}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${statusBadge.variant}`}>
                      {statusBadge.text}
                    </Badge>
                  </div>

                  {/* Teacher & Fee */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        Giáo viên:
                      </span>
                      <span className="font-bold text-foreground truncate max-w-[150px]">
                        {cls.teacher?.full_name || "Chưa phân công"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Học phí:</span>
                      <span className="font-mono font-black text-primary">
                        {formatVND(cls.fee_per_session)} <span className="text-[10px] font-normal text-muted-foreground">/buổi</span>
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold text-foreground">Lịch học:</span>
                    </div>
                    {scheduleArray.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 pl-5">
                        <span className="font-bold text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded-md">
                          {scheduleArray.map((s: any) => s.day).join(", ")}
                        </span>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          ({scheduleArray[0]?.start_time || "18:00"} - {scheduleArray[0]?.end_time || "19:30"})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic pl-5 text-[11px]">
                        Chưa thiết lập thời khóa biểu
                      </span>
                    )}
                  </div>

                  {/* Sĩ số Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        Sĩ số lớp:
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {count} / {max} HS <span className="text-muted-foreground font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${statusBadge.progressColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2">
                  <Link href={`/admin/classes/${cls.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold rounded-xl gap-1">
                      Xem chi tiết
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl"
                      onClick={() => {
                        setEditingClass(cls);
                        setIsDialogOpen(true);
                      }}
                      title="Chỉnh sửa lớp"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => handleDelete(cls.id, cls.name)}
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Tên Lớp & Phòng học</TableHead>
                <TableHead>Giáo viên phụ trách</TableHead>
                <TableHead>Lịch học tuần</TableHead>
                <TableHead>Học phí / Buổi</TableHead>
                <TableHead className="w-[180px]">Sĩ số (Học sinh)</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => {
                const count = cls.enrollment_count || 0;
                const max = cls.max_students || 15;
                const percentage = Math.min(Math.round((count / max) * 100), 100);

                const scheduleArray = Array.isArray(cls.schedule)
                  ? cls.schedule
                  : typeof cls.schedule === "string"
                  ? JSON.parse(cls.schedule || "[]")
                  : [];

                return (
                  <TableRow key={cls.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/classes/${cls.id}`}
                          className="font-bold text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          {cls.name}
                          <ArrowRight className="w-3 h-3 opacity-50" />
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <DoorOpen className="w-3 h-3 text-muted-foreground" />
                          <span>Phòng: <strong className="text-foreground/90 font-medium">{cls.room || "Chưa xếp"}</strong></span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {cls.teacher ? (
                        <div>
                          <span className="font-semibold text-xs text-foreground">{cls.teacher.full_name}</span>
                          <p className="text-[11px] text-muted-foreground font-mono">{cls.teacher.phone || "Chưa có SĐT"}</p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground bg-muted/40 text-[10px]">
                          Chưa phân công
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {scheduleArray.length > 0 ? (
                        <div className="text-xs">
                          <span className="font-bold text-primary text-[11px]">
                            {scheduleArray.map((s: any) => s.day).join(", ")}
                          </span>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {scheduleArray[0]?.start_time || "18:00"} - {scheduleArray[0]?.end_time || "19:30"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Chưa xếp lịch</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-black text-xs text-primary font-mono">
                        {formatVND(cls.fee_per_session)}
                      </span>
                    </TableCell>

                    {/* Sĩ số Column with Progress bar */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-foreground">{count} / {max} HS</span>
                          <span className="text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 100
                                ? "bg-rose-500"
                                : percentage >= 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/classes/${cls.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 rounded-lg">
                            Xem
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                          onClick={() => {
                            setEditingClass(cls);
                            setIsDialogOpen(true);
                          }}
                          title="Chỉnh sửa lớp"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleDelete(cls.id, cls.name)}
                          title="Xóa lớp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Class Create / Edit Dialog with full conflict checking */}
      <ClassDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        teachers={teachers}
        existingClasses={classes}
        editingClass={editingClass}
        onSaved={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
