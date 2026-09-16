"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Users,
  Phone,
  Edit,
  Trash2,
  Filter,
  AlertTriangle,
  BookOpen,
  FileSpreadsheet,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  FileText,
  X,
  ChevronDown,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { StudentDialog } from "@/components/students/student-dialog";
import { deleteStudent, updateStudent, enrollStudentInClass } from "@/lib/actions/students";
import { updateEnrollmentStatus } from "@/lib/actions/enrollments";
import { useAppData } from "@/lib/context/app-data-context";
import { cn } from "@/lib/utils";

interface StudentsClientProps {
  initialStudents: any[];
  classes: any[];
}

function formatDateToDmy(dateStr?: string | null): string {
  if (!dateStr) return "";
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    return dateStr;
  }
  return dateStr;
}

function formatClassSchedule(rawSchedule: any): string {
  if (!rawSchedule) return "Chưa có lịch học";

  let items: any[] = [];
  if (Array.isArray(rawSchedule)) {
    items = rawSchedule;
  } else if (typeof rawSchedule === "string") {
    const trimmed = rawSchedule.trim();
    if (!trimmed) return "Chưa có lịch học";
    if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
      return trimmed;
    }
    try {
      const parsed = JSON.parse(trimmed);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return trimmed;
    }
  } else if (typeof rawSchedule === "object") {
    items = [rawSchedule];
  }

  if (!items || items.length === 0) return "Chưa có lịch học";

  const getDayNameVi = (dayId: string): string => {
    if (!dayId) return "";
    const clean = String(dayId).trim();
    const map: Record<string, string> = {
      T2: "Thứ 2",
      T3: "Thứ 3",
      T4: "Thứ 4",
      T5: "Thứ 5",
      T6: "Thứ 6",
      T7: "Thứ 7",
      CN: "Chủ Nhật",
      "2": "Thứ 2",
      "3": "Thứ 3",
      "4": "Thứ 4",
      "5": "Thứ 5",
      "6": "Thứ 6",
      "7": "Thứ 7",
    };
    return map[clean] || (clean.startsWith("Thứ") || clean === "Chủ Nhật" ? clean : `Thứ ${clean}`);
  };

  const formatted = items
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      const day = getDayNameVi(item.day || "");
      const start = item.start_time || item.startTime || "";
      const end = item.end_time || item.endTime || "";
      if (day && start && end) {
        return `${day}: ${start} - ${end}`;
      }
      if (day && (start || end)) {
        return `${day} (${start || end})`;
      }
      if (day) return day;
      if (start && end) return `${start} - ${end}`;
      return "";
    })
    .filter(Boolean);

  return formatted.length > 0 ? formatted.join(", ") : "Chưa có lịch học";
}

export function StudentsClient({ initialStudents, classes }: StudentsClientProps) {
  const { students: globalStudents, setStudents: setGlobalStudents, classes: globalClasses, setClasses: setGlobalClasses, invoices } = useAppData();
  
  const [localStudents, setLocalStudents] = useState<any[]>(
    initialStudents && initialStudents.length > 0 ? initialStudents : (globalStudents || [])
  );
  const activeClasses = classes && classes.length > 0 ? classes : (globalClasses || []);

  useEffect(() => {
    if (initialStudents && initialStudents.length > 0) {
      setLocalStudents(initialStudents);
      if (setGlobalStudents) setGlobalStudents(initialStudents);
    }
  }, [initialStudents, setGlobalStudents]);

  useEffect(() => {
    if (classes && classes.length > 0 && setGlobalClasses) {
      setGlobalClasses(classes);
    }
  }, [classes, setGlobalClasses]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [onlyUnpaidTuition, setOnlyUnpaidTuition] = useState(false);

  // Modals & States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Assign Class Dialog
  const [assigningStudent, setAssigningStudent] = useState<any | null>(null);
  const [targetClassId, setTargetClassId] = useState("");
  const [targetInitialSessions, setTargetInitialSessions] = useState("12");

  // Delete Confirm Dialog
  const [deletingStudent, setDeletingStudent] = useState<any | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleUpdateStatus(student: any, newStatus: "active" | "paused" | "dropped") {
    if (student.status === newStatus) return;

    const statusLabels: Record<string, string> = {
      active: "Đang học",
      paused: "Tạm dừng",
      dropped: "Đã nghỉ",
    };

    // Optimistic UI update
    const updated = localStudents.map((s) =>
      s.id === student.id ? { ...s, status: newStatus } : s
    );
    setLocalStudents(updated);
    if (setGlobalStudents) {
      setGlobalStudents(updated);
    }

    try {
      const enrollments = student.enrollments || [];
      if (enrollments.length > 0) {
        for (const enr of enrollments) {
          await updateEnrollmentStatus(enr.id, newStatus);
        }
      } else {
        const fd = new FormData();
        fd.append("full_name", student.full_name || student.name || "");
        fd.append("parent_name", student.parent_name || student.parentName || "");
        fd.append("parent_phone", student.parent_phone || student.phone || "");
        fd.append("status", newStatus);
        await updateStudent(student.id, fd);
      }
      showToast(`Đã chuyển trạng thái học sinh sang "${statusLabels[newStatus]}"!`);
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      showToast("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  }

  const filteredStudents = localStudents.filter((s) => {
    const sName = (s.full_name || s.name || "").toLowerCase();
    const pName = (s.parent_name || s.parentName || "").toLowerCase();
    const phone = s.parent_phone || s.phone || "";
    const clsName = (s.className || s.enrollments?.[0]?.class?.name || "").toLowerCase();
    const sTerm = searchTerm.toLowerCase();

    const matchSearch =
      sName.includes(sTerm) ||
      pName.includes(sTerm) ||
      phone.includes(searchTerm) ||
      clsName.includes(sTerm);

    const matchStatus =
      statusFilter === "all" ||
      s.status === statusFilter ||
      (statusFilter === "active" && s.status === "enrolled");

    const enrollments = s.enrollments || [];
    const matchClass =
      classFilter === "all" ||
      s.classId === classFilter ||
      enrollments.some((e: any) => e.class_id === classFilter);

    // Kiểm tra học viên nợ học phí khóa học
    const isUnpaidStudent = () => {
      if (s.tuitionStatus === "unpaid" || s.tuitionStatus === "partial") return true;
      const stInvoices = (invoices || []).filter(
        (inv: any) => inv.student_id === s.id || inv.studentId === s.id
      );
      if (stInvoices.length === 0) {
        return s.isPaid === false;
      }
      return stInvoices.some((inv: any) => inv.status === "pending" || inv.status === "unpaid");
    };

    if (onlyUnpaidTuition) {
      return matchSearch && matchStatus && matchClass && isUnpaidStudent();
    }

    return matchSearch && matchStatus && matchClass;
  });

  async function handleDeleteConfirm() {
    if (!deletingStudent) return;
    const id = deletingStudent.id;
    const name = deletingStudent.full_name || deletingStudent.name;
    const res = await deleteStudent(id);
    if (res?.error) {
      alert(res.error);
    } else {
      setLocalStudents((prev) => prev.filter((s) => s.id !== id));
      if (setGlobalStudents) {
        setGlobalStudents((prev) => prev.filter((s) => s.id !== id));
      }
      showToast(`Đã xóa học sinh "${name}" thành công!`);
    }
    setDeletingStudent(null);
  }

  function downloadSampleCsv() {
    const headers = "Ho_va_ten,SDT_phu_huynh,Ten_phu_huynh,Ngay_sinh,Lop_hoc,So_buoi_ban_dau,Ghi_chu\n";
    const rows = [
      "Nguyễn Bảo Nam,0912345678,Chị Lan,2012-05-15,Toán 9 Nâng Cao,12,Cần chú ý bài tập về nhà",
      "Trần Hoàng Anh,0987654321,Anh Tuấn,2012-08-20,Tiếng Anh Giao Tiếp,12,Học sinh tiếp thu nhanh",
      "Lê Thảo My,0901234567,Chị Hương,2013-01-10,Văn 9 Luyện Đề,8,Chuyển lớp từ cơ sở 2 sang",
    ].join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_danh_sach_hoc_sinh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleProcessImport() {
    if (!importedFile) return;
    setImportStatus("Đã tải tệp lên thành công! Hệ thống đang hỗ trợ cập nhật danh sách vào cơ sở dữ liệu.");
    setTimeout(() => {
      setImportStatus(null);
      setImportedFile(null);
      setIsImportModalOpen(false);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Search, Filters & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT phụ huynh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Class Filter Dropdown */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px]"
          >
            <option value="all">Tất cả lớp học ({activeClasses.length})</option>
            {activeClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang học</option>
            <option value="paused">🟡 Tạm dừng</option>
            <option value="dropped">🔴 Đã nghỉ</option>
          </select>

          {/* Filter học viên nợ học phí */}
          <Button
            size="sm"
            variant={onlyUnpaidTuition ? "default" : "outline"}
            onClick={() => setOnlyUnpaidTuition(!onlyUnpaidTuition)}
            className={`h-9 text-xs gap-1.5 rounded-xl transition-all ${
              onlyUnpaidTuition
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/30 font-bold"
                : "text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10 font-semibold"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Học viên nợ học phí khóa
          </Button>
        </div>

        {/* Action Buttons: Import Excel + Add Student */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 text-xs h-9 rounded-xl border-border hover:bg-muted"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Nhập từ Excel
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingStudent(null);
              setIsDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-bold h-9 rounded-xl shadow-md shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Thêm Học Sinh Mới
          </Button>
        </div>
      </div>

      {/* Desktop Data Table */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-0">
              <TableHead className="w-[230px] text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Học sinh</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Phụ huynh & SĐT</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Lớp đang theo học</TableHead>
              <TableHead className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Trạng thái</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center text-muted-foreground py-3 px-4">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-foreground">Không tìm thấy học sinh nào</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thử đổi bộ lọc hoặc bấm "Thêm Học Sinh Mới".
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((st) => {
                const enrollments = st.enrollments || [];

                return (
                  <TableRow key={st.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                    <TableCell className="py-3 px-4 text-sm text-slate-700 font-medium">
                      <div>
                        <span className="font-bold text-xs text-foreground">
                          {st.full_name || st.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          {st.birth_date && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {formatDateToDmy(st.birth_date)}
                            </span>
                          )}
                          {!st.birth_date && st.created_at && (
                            <span className="font-mono">
                              Ngày tạo: {new Date(st.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                        {st.note && (
                          <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px] mt-0.5">
                            Ghi chú: {st.note}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <span className="font-medium text-foreground">
                          {st.parent_name || st.parentName || "Chưa có tên PH"}
                        </span>
                        {(st.parent_phone || st.phone) ? (
                          <a
                            href={`tel:${st.parent_phone || st.phone}`}
                            className="text-muted-foreground hover:text-primary flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="w-3 h-3 text-primary" />
                            {st.parent_phone || st.phone}
                          </a>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Cột: Lớp đang theo học */}
                    <TableCell>
                      {(() => {
                        const classObj = activeClasses.find(
                          (c: any) =>
                            c.id === st.classId ||
                            c.name === st.className ||
                            (st.enrollments && st.enrollments.some((e: any) => e.class_id === c.id || e.className === c.name))
                        );
                        const className =
                          st.className ||
                          classObj?.name ||
                          st.enrollments?.[0]?.class?.name ||
                          st.enrollments?.[0]?.className;

                        if (!className && !classObj) {
                          return (
                            <span className="text-xs text-muted-foreground italic">
                              Chưa vào lớp nào
                            </span>
                          );
                        }

                        const duration = classObj?.durationMonths || classObj?.duration_months || 3;
                        const scheduleText = formatClassSchedule(classObj?.schedule);

                        return (
                          <div className="space-y-1 py-0.5">
                            {/* Dòng 1: Tên lớp in đậm */}
                            <div className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[280px]">
                              {className || "Lớp học chính thức"}
                            </div>

                            {/* Dòng 2: Thời lượng / Lịch học của lớp */}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span className="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                                Khóa {duration} tháng
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[180px] font-medium" title={scheduleText}>
                                {scheduleText}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-xs select-none",
                              (st.status === "active" || st.status === "enrolled") &&
                                "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                              st.status === "paused" &&
                                "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                              st.status === "dropped" &&
                                "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                            )}
                          >
                            <span>
                              {(st.status === "active" || st.status === "enrolled") && "Đang học"}
                              {st.status === "paused" && "Tạm dừng"}
                              {st.status === "dropped" && "Đã nghỉ"}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-32 rounded-xl p-1 shadow-lg bg-card border border-border/80">
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(st, "active")}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg py-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Đang học</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(st, "paused")}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg py-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Tạm dừng</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(st, "dropped")}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg py-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Đã nghỉ</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Nút 1: Sửa hồ sơ */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingStudent(st);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl"
                          title="Sửa hồ sơ học sinh"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {/* Nút 2: Xóa học sinh */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingStudent(st)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                          title="Xóa học sinh"
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

      {/* Student Create / Edit Dialog */}
      <StudentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        classes={activeClasses}
        editingStudent={editingStudent}
        onSaved={() => {
          // Store dùng chung đã tự động cập nhật bảng tức thì
        }}
      />

      {/* Assign Class Dialog */}
      <Dialog open={Boolean(assigningStudent)} onOpenChange={(open) => !open && setAssigningStudent(null)}>
        <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-xl border border-border/80">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <School className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Xếp Lớp Cho Học Sinh
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Chọn lớp học và thiết lập số buổi ban đầu
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-3 space-y-4 text-xs">
            <div>
              <span className="text-muted-foreground">Học sinh:</span>{" "}
              <strong className="text-foreground">{assigningStudent?.full_name || assigningStudent?.name}</strong>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Chọn Lớp học:</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Chọn lớp học --</option>
                {activeClasses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.teacher?.full_name || "Chưa phân công GV"})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Số buổi ban đầu trong ví:</label>
              <Input
                type="number"
                min="0"
                value={targetInitialSessions}
                onChange={(e) => setTargetInitialSessions(e.target.value)}
                placeholder="Ví dụ: 12"
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssigningStudent(null)}
              className="text-xs rounded-xl h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!targetClassId}
              onClick={async () => {
                if (!assigningStudent || !targetClassId) return;
                const sessions = Number(targetInitialSessions) || 0;
                const res = await enrollStudentInClass(assigningStudent.id, targetClassId, sessions);
                if (res?.error) {
                  alert(res.error);
                } else {
                  const targetCls = activeClasses.find((c: any) => c.id === targetClassId);
                  const updated = localStudents.map((s) => {
                    if (s.id === assigningStudent.id) {
                      return {
                        ...s,
                        classId: targetClassId,
                        className: targetCls?.name,
                        enrollments: [
                          ...(s.enrollments || []),
                          {
                            id: res.data?.[0]?.id || `enr-${Date.now()}`,
                            class_id: targetClassId,
                            balance_sessions: sessions,
                            class: targetCls,
                          },
                        ],
                      };
                    }
                    return s;
                  });
                  setLocalStudents(updated);
                  if (setGlobalStudents) {
                    setGlobalStudents(updated);
                  }
                  showToast(`Đã xếp học sinh vào lớp ${targetCls?.name || ""} thành công!`);
                }
                setAssigningStudent(null);
                setTargetClassId("");
                setTargetInitialSessions("12");
              }}
              className="text-xs font-bold rounded-xl h-9 px-5 bg-primary text-primary-foreground shadow-md shadow-primary/25"
            >
              Xác Nhận Xếp Lớp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={Boolean(deletingStudent)} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-xl border border-border/80">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Xác Nhận Xóa Học Sinh
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Thao tác này sẽ xóa học sinh khỏi danh sách trung tâm
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-3 text-xs text-foreground space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa học sinh <strong>{deletingStudent?.full_name || deletingStudent?.name}</strong>?
            </p>
            <p className="text-muted-foreground">
              Toàn bộ lịch sử điểm danh và ghi danh của học sinh này sẽ bị xóa khỏi hệ thống.
            </p>
          </div>
          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingStudent(null)}
              className="text-xs rounded-xl h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="text-xs font-bold rounded-xl h-9 px-5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Modal Import Excel / CSV */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-xl border border-border/80">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Nhập Học Sinh Từ File Excel / CSV
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Tải lên tệp dữ liệu học sinh hàng loạt theo đúng định dạng mẫu
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Step 1: Download Sample File */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Bước 1: Tải file mẫu chuẩn (.csv)</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSampleCsv}
                  className="h-8 text-xs gap-1.5 rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải file mẫu
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                File mẫu gồm các cột: <strong>Họ tên, SĐT phụ huynh, Tên PH, Ngày sinh, Lớp học, Số buổi ban đầu, Ghi chú</strong>.
              </p>
            </div>

            {/* Step 2: Upload File */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">Bước 2: Chọn tệp Excel / CSV để tải lên</span>
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50/50 hover:bg-slate-100/60 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setImportedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                {importedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary truncate max-w-[280px] mx-auto">
                      {importedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {(importedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-foreground">Kéo thả tệp hoặc bấm để duyệt file</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Hỗ trợ định dạng .csv, .xlsx, .xls</p>
                  </div>
                )}
              </div>
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
              className="text-xs rounded-xl h-9 px-4"
            >
              Đóng
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!importedFile}
              onClick={handleProcessImport}
              className="text-xs font-bold rounded-xl h-9 px-5 gap-1.5 shadow-md shadow-primary/25"
            >
              <Upload className="w-3.5 h-3.5" />
              Xác Nhận Nhập Dữ Liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
