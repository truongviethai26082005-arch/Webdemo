"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import { TeacherDialog } from "@/components/teachers/teacher-dialog";
import { useAppData } from "@/lib/context/app-data-context";

interface TeachersClientProps {
  initialTeachers: any[];
  initialPayroll?: any[];
  defaultTab?: string;
}

export function TeachersClient({
  initialTeachers,
}: TeachersClientProps) {
  const { classes: globalClasses, teachers: globalTeachers, setTeachers: setGlobalTeachers } = useAppData();

  // Ưu tiên dữ liệu thật từ Server/Supabase (initialTeachers)
  const teachers = initialTeachers && initialTeachers.length > 0 ? initialTeachers : globalTeachers;

  useEffect(() => {
    if (initialTeachers && initialTeachers.length > 0 && setGlobalTeachers) {
      setGlobalTeachers(initialTeachers);
    }
  }, [initialTeachers, setGlobalTeachers]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

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

                  {/* Cột 7: Thao tác (Nút chỉnh sửa [✏️]) */}
                  <TableCell className="text-right">
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
    </div>
  );
}
