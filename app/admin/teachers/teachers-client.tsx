"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  BarChart3,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/utils/vietqr";
import { TeacherDialog } from "@/components/teachers/teacher-dialog";
import { useAppData } from "@/lib/context/app-data-context";
import { deleteTeacher } from "@/lib/actions/teachers";

interface TeachersClientProps {
  initialTeachers: any[];
  initialPayroll?: any[];
  defaultTab?: string;
}

export function TeachersClient({
  initialTeachers,
}: TeachersClientProps) {
  const { classes: globalClasses, teachers: globalTeachers, setTeachers: setGlobalTeachers } = useAppData();

  // State cục bộ cho danh sách giáo viên
  const [localTeachers, setLocalTeachers] = useState<any[]>(
    initialTeachers && initialTeachers.length > 0 ? initialTeachers : (globalTeachers || [])
  );

  useEffect(() => {
    if (initialTeachers && initialTeachers.length > 0) {
      setLocalTeachers(initialTeachers);
      if (setGlobalTeachers) {
        setGlobalTeachers(initialTeachers);
      }
    }
  }, [initialTeachers, setGlobalTeachers]);

  const teachers = localTeachers;

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

  // States quản lý xóa giáo viên
  const [deletingTeacher, setDeletingTeacher] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleDeleteTeacherConfirm() {
    if (!deletingTeacher) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteTeacher(deletingTeacher.id);

    if (res?.error) {
      // Bắt buộc theo AGENTS.md: Không nuốt lỗi, giữ nguyên state, hiển thị thông báo lỗi
      setDeleteError(res.error);
      setIsDeleting(false);
      return;
    }

    const teacherName = deletingTeacher.full_name || "Giáo viên";
    // Chỉ cập nhật state khi xóa thực sự thành công trên máy chủ
    setLocalTeachers((prev) => prev.filter((t) => t.id !== deletingTeacher.id));
    if (setGlobalTeachers) {
      setGlobalTeachers((prev: any[]) => prev.filter((t) => t.id !== deletingTeacher.id));
    }

    setIsDeleting(false);
    setDeletingTeacher(null);
    showToast(`Đã xóa giáo viên "${teacherName}" thành công!`);
  }

  // Filter teachers
  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone && t.phone.includes(searchTerm)) ||
      (t.bank_name && t.bank_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên giáo viên, số điện thoại, ngân hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <Button
          onClick={() => {
            setEditingTeacher(null);
            setIsDialogOpen(true);
          }}
          className="gap-2 text-xs font-bold h-9 shadow-md shadow-primary/25 rounded-xl shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Giáo Viên Mới
        </Button>
      </div>

      {/* Bảng Danh Sách Giáo Viên (Chuẩn 7 cột) */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-0">
              {/* Cột 1 */}
              <TableHead className="w-[240px] text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Họ và tên giáo viên</TableHead>
              {/* Cột 2 */}
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Số điện thoại</TableHead>
              {/* Cột 3 */}
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Thù lao / Buổi</TableHead>
              {/* Cột 4 */}
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Tài khoản nhận lương</TableHead>
              {/* Cột 5 */}
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Lớp đang phụ trách</TableHead>
              {/* Cột 6 */}
              <TableHead className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Bảng lương</TableHead>
              {/* Cột 7 */}
              <TableHead className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider py-3 px-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground py-3 px-4">
                  <GraduationCap className="w-9 h-9 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm text-foreground">Không có giáo viên nào</p>
                  <p className="text-xs mt-0.5">Bấm "Thêm Giáo Viên Mới" để tạo tài khoản giáo viên.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((tc) => (
                <TableRow key={tc.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                  {/* Cột 1: Họ và tên giáo viên (Họ tên in đậm + Ngày tham gia) */}
                  <TableCell className="py-3 px-4 text-sm text-slate-700 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20 shadow-xs">
                        {tc.full_name?.charAt(0) || "G"}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-foreground">{tc.full_name}</span>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          Tham gia: {new Date(tc.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Cột 2: Số điện thoại */}
                  <TableCell>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {tc.phone || "—"}
                    </span>
                  </TableCell>

                  {/* Cột 3: Thù lao / Buổi */}
                  <TableCell>
                    <span className="font-black text-xs font-mono text-primary">
                      {formatVND(tc.salary_per_session || 0)}
                    </span>
                  </TableCell>

                  {/* Cột 4: Tài khoản nhận lương */}
                  <TableCell>
                    {tc.bank_account_no ? (
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {tc.bank_account_no}
                        </span>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {tc.bank_name || "Ngân hàng"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Chưa cài đặt STK</span>
                    )}
                  </TableCell>

                  {/* Cột 5: Lớp đang phụ trách */}
                  <TableCell>
                    {(() => {
                      const tId = tc.id;
                      const tName = (tc.full_name || tc.name || "").toLowerCase().trim();
                      const cleanName = tName.replace(/^(thầy|cô)\s+/i, "");

                      const assignedClasses = globalClasses.filter((cls) => {
                        const clsTeacherId = cls.teacher_id || (cls as any).teacherId || cls.teacher?.id;
                        if (clsTeacherId && clsTeacherId === tId) return true;

                        const clsTeacherName = (cls.teacherName || cls.teacher?.full_name || "").toLowerCase().trim();
                        if (!clsTeacherName || !tName) return false;

                        if (clsTeacherName === tName) return true;
                        if (clsTeacherName.includes(tName) || tName.includes(clsTeacherName)) return true;
                        if (cleanName && (clsTeacherName.includes(cleanName) || cleanName.includes(clsTeacherName))) return true;

                        return false;
                      });

                      if (assignedClasses.length === 0) {
                        return <span className="text-xs text-muted-foreground italic">Chưa phụ trách lớp nào</span>;
                      }

                      return (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedClasses.map((cls) => {
                            const count = cls.currentEnrolled ?? cls.enrollment_count ?? cls.currentStudents ?? 0;
                            return (
                              <Badge key={cls.id} variant="secondary" className="text-[10px] font-semibold gap-1 bg-secondary/80 hover:bg-secondary">
                                <span>{cls.name}</span>
                                <span className="text-primary font-bold font-mono">({count} HS)</span>
                              </Badge>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </TableCell>

                  {/* Cột 6: Bảng lương (Nút Xem bảng lương ➔ trỏ sang /admin/finance) */}
                  <TableCell className="text-center">
                    <Link
                      href={`/admin/finance?tab=payroll&teacherId=${tc.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Xem bảng lương ➔</span>
                    </Link>
                  </TableCell>

                  {/* Cột 7: Thao tác (Nút chỉnh sửa [✏️] & Nút xóa [🗑️]) */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-xl"
                        onClick={() => {
                          setEditingTeacher(tc);
                          setIsDialogOpen(true);
                        }}
                        title="Sửa thông tin / Thù lao / STK"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => {
                          setDeletingTeacher(tc);
                          setDeleteError(null);
                        }}
                        title="Xóa giáo viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal: Tạo / Sửa Giáo Viên */}
      <TeacherDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          // Reload data
          window.location.reload();
        }}
        editingTeacher={editingTeacher}
      />

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-700 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Xác nhận Xóa Giáo viên */}
      <Dialog
        open={!!deletingTeacher}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingTeacher(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-2xl border border-border/80">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Xác nhận xóa giáo viên
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Hành động này sẽ xóa vĩnh viễn hồ sơ và tài khoản đăng nhập của giáo viên.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {deleteError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{deleteError}</span>
              </div>
            )}

            {deletingTeacher && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Giáo viên:</span>
                  <span className="text-xs font-bold text-foreground">{deletingTeacher.full_name}</span>
                </div>
                {deletingTeacher.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Số điện thoại:</span>
                    <span className="text-xs font-mono font-medium text-foreground">{deletingTeacher.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Thù lao / buổi:</span>
                  <span className="text-xs font-mono font-bold text-primary">
                    {formatVND(deletingTeacher.salary_per_session || 0)}
                  </span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Lưu ý: Hệ thống sẽ tự động chặn xóa nếu giáo viên đang phụ trách lớp học hoặc đã có lịch sử buổi dạy trong hệ thống.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setDeletingTeacher(null);
                setDeleteError(null);
              }}
              className="text-xs rounded-xl h-9 px-4"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteTeacherConfirm}
              className="text-xs font-bold rounded-xl h-9 px-4 gap-1.5 shadow-md shadow-destructive/25"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Xác nhận xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
