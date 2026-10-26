"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Class } from "@/types/database";
import { CenterBankSettings, formatVND } from "@/lib/utils/vietqr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddClassToStudentDialog } from "@/components/sale/add-class-to-student-dialog";
import { Search, Users, GraduationCap, PlusCircle } from "lucide-react";

// Khớp đúng shape thật getStudents() (lib/actions/students.ts) trả về —
// không sửa file đó, chỉ mô tả lại đúng phần đang dùng ở đây.
interface StudentEnrollment {
  id: string;
  class_id: string;
  balance_sessions: number;
  joined_at: string;
  class?: { id: string; name: string; fee_per_session: number } | null;
}

export interface StudentListItem {
  id: string;
  full_name: string;
  parent_name?: string | null;
  parent_phone: string;
  status: string;
  enrollments?: StudentEnrollment[];
}

interface StudentsClientProps {
  initialStudents: StudentListItem[];
  classes: Class[];
  bankSettings: CenterBankSettings;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Đang học", className: "bg-emerald-500/15 text-emerald-600 border-emerald-200" },
  paused: { label: "Bảo lưu", className: "bg-amber-500/15 text-amber-600 border-amber-200" },
  dropped: { label: "Đã nghỉ", className: "bg-rose-500/15 text-rose-600 border-rose-200" },
};

export function StudentsClient({ initialStudents, classes, bankSettings }: StudentsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = initialStudents.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.parent_phone.toLowerCase().includes(q) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(q))
    );
  });

  const handleOpenAddClass = (student: StudentListItem) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-bold text-sm text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Học Sinh Đã Chuyển Đổi — Đăng Ký Thêm Lớp
          </div>
          <p className="text-xs text-muted-foreground">
            Danh sách học sinh hiện có (đã từng chốt học qua Tuyển sinh hoặc do Admin tạo). Dùng khi
            phụ huynh muốn đăng ký thêm 1 lớp/môn học khác cho học sinh đã có sẵn.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-background/80 backdrop-blur-xs border border-border text-center shrink-0">
          <div className="text-xs text-muted-foreground">Tổng học sinh</div>
          <div className="text-lg font-black text-primary">{initialStudents.length}</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="relative min-w-[260px] max-w-md flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên học sinh, SĐT hoặc tên phụ huynh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
              <TableHead className="font-bold">Học sinh &amp; Phụ huynh</TableHead>
              <TableHead className="font-bold">SĐT liên hệ</TableHead>
              <TableHead className="font-bold">Trạng thái</TableHead>
              <TableHead className="font-bold">Lớp đang học</TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-56">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {search.trim() ? "Không tìm thấy học sinh phù hợp" : "Chưa có học sinh nào"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Học sinh sau khi chốt đơn tuyển sinh thành công sẽ xuất hiện ở đây.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => {
                const statusInfo = STATUS_LABELS[student.status] || {
                  label: student.status,
                  className: "bg-muted text-muted-foreground border-border",
                };
                const enrollments = student.enrollments || [];

                return (
                  <TableRow key={student.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <div className="font-bold text-foreground">{student.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Phụ huynh: {student.parent_name || "—"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono font-semibold text-foreground">
                        {student.parent_phone}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-[11px] ${statusInfo.className}`}>{statusInfo.label}</Badge>
                    </TableCell>

                    <TableCell>
                      {enrollments.length === 0 ? (
                        <span className="text-muted-foreground">Chưa có lớp nào</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {enrollments.map((e) => (
                            <Badge
                              key={e.id}
                              variant="outline"
                              className="text-[11px] font-semibold"
                              title={`Còn ${e.balance_sessions} buổi`}
                            >
                              {e.class?.name || "Lớp không rõ"} ({e.balance_sessions} buổi)
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 font-bold gap-1"
                        onClick={() => handleOpenAddClass(student)}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Thêm lớp mới
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddClassToStudentDialog
        student={selectedStudent}
        classes={classes}
        bankSettings={bankSettings}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedStudent(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
