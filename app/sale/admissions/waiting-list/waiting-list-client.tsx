"use client";

import { useState } from "react";
import { WaitingListStudentItem } from "@/lib/actions/admissions";
import { Class } from "@/types/database";
import { formatVND } from "@/lib/utils/vietqr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AssignClassDialog } from "@/components/sale/assign-class-dialog";
import { Clock, Search, BookOpen, UserCheck, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

interface WaitingListClientProps {
  initialStudents: WaitingListStudentItem[];
  classes: Class[];
}

export function WaitingListClient({
  initialStudents,
  classes,
}: WaitingListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<WaitingListStudentItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = initialStudents.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.parentPhone.toLowerCase().includes(q) ||
      (s.parentName && s.parentName.toLowerCase().includes(q)) ||
      (s.targetClassName && s.targetClassName.toLowerCase().includes(q))
    );
  });

  const handleOpenAssign = (student: WaitingListStudentItem) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-primary/10 border border-indigo-200 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Học Sinh Đã Đóng Học Phí — Chờ Xếp Lớp
          </div>
          <p className="text-xs text-muted-foreground">
            Các học sinh này đã nộp học phí qua VietQR (doanh thu Admin đã ghi nhận) nhưng chưa vào lớp chính thức do chờ mở lớp mới hoặc chờ gom đủ sĩ số.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-background/80 backdrop-blur-xs border border-border text-center shrink-0">
          <div className="text-xs text-muted-foreground">Tổng đang chờ</div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {initialStudents.length} học sinh
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="relative min-w-[260px] max-w-md flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên học sinh, SĐT phụ huynh, lớp quan tâm..."
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
              <TableHead className="font-bold">Lớp / Môn quan tâm</TableHead>
              <TableHead className="font-bold">Gói đã mua &amp; Học phí</TableHead>
              <TableHead className="font-bold">Ngày thanh toán</TableHead>
              <TableHead className="font-bold">Trạng thái</TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Hiện không có học sinh nào trong danh sách chờ xếp lớp.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                  <TableCell>
                    <div className="font-bold text-foreground">{item.fullName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Phụ huynh: {item.parentName || "—"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono font-semibold text-foreground">
                      {item.parentPhone}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-semibold text-foreground">
                      {item.targetClassName || "Chưa chọn môn"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatVND(item.paidAmount)}
                      </span>
                      <div className="text-[11px] text-muted-foreground">
                        {item.paidSessions} buổi học
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.paidAt ? new Date(item.paidAt).toLocaleDateString("vi-VN") : "—"}
                  </TableCell>

                  <TableCell>
                    <Badge className="bg-amber-500/15 text-amber-600 border-amber-200 text-[10px]">
                      ⏳ Chờ mở lớp
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="text-[11px] h-8 font-bold gap-1 bg-primary text-primary-foreground shadow-xs"
                      onClick={() => handleOpenAssign(item)}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Xếp vào lớp
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign Class Dialog */}
      <AssignClassDialog
        student={selectedStudent}
        classes={classes}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedStudent(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
