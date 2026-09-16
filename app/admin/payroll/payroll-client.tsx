"use client";

import { useState } from "react";
import {
  Wallet,
  Search,
  CheckCircle2,
  CalendarCheck,
  GraduationCap,
  Download,
  Filter,
  ArrowUpRight,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatVND } from "@/lib/utils/vietqr";
import { TeacherPayroll } from "@/types/database";

interface PayrollClientProps {
  initialPayroll: TeacherPayroll[];
}

export function PayrollClient({ initialPayroll }: PayrollClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherPayroll | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, "pending" | "paid">>({});

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const filteredPayroll = initialPayroll.filter((item) =>
    item.teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.teacher.phone && item.teacher.phone.includes(searchTerm))
  );

  const totalPayrollBudget = initialPayroll.reduce((sum, p) => sum + p.totalSalary, 0);
  const totalSessionsTaught = initialPayroll.reduce((sum, p) => sum + p.completedSessions, 0);
  const activeTeachersCount = initialPayroll.filter((p) => p.completedSessions > 0).length;
  const averageRate =
    initialPayroll.length > 0
      ? Math.round(initialPayroll.reduce((sum, p) => sum + p.salaryPerSession, 0) / initialPayroll.length)
      : 0;

  function togglePaid(teacherId: string) {
    setPaymentStatus((prev) => ({
      ...prev,
      [teacherId]: prev[teacherId] === "paid" ? "pending" : "paid",
    }));
  }

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-gradient-to-br from-emerald-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tổng Ngân Sách Thù Lao
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight font-mono">
              {formatVND(totalPayrollBudget)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Dự tính chi trả Tháng {currentMonth}/{currentYear}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-gradient-to-br from-blue-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tổng Buổi Dạy Hoàn Thành
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {totalSessionsTaught} <span className="text-sm font-normal text-muted-foreground">ca dạy</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Đã điểm danh hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-gradient-to-br from-purple-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Giáo Viên Có Ca Dạy
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {activeTeachersCount} / {initialPayroll.length} <span className="text-sm font-normal text-muted-foreground">GV</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Có phát sinh giờ dạy tháng này
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-gradient-to-br from-amber-500/5 to-transparent bg-card shadow-soft rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Thù Lao Bình Quân / Ca
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight font-mono">
              {formatVND(averageRate)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Mức thù lao trung bình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Bảng Quyết Toán Lương Giáo Viên Tháng {currentMonth}/{currentYear}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Công thức: [Số ca dạy hoàn tất trong tháng] × [Đơn giá thù lao/ca]
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Tìm giáo viên, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs h-9 rounded-xl shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                In Bảng Lương
              </Button>
            </div>
          </div>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Giáo viên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead className="text-center">Số ca dạy hoàn thành</TableHead>
              <TableHead className="text-right">Đơn giá / Buổi</TableHead>
              <TableHead className="text-right">Tổng Lương Tháng</TableHead>
              <TableHead className="text-center">Trạng thái thanh toán</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayroll.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-foreground">Chưa có dữ liệu bảng lương</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dữ liệu sẽ tự động tổng hợp khi các ca dạy được điểm danh hoàn thành.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayroll.map((item) => {
                const isPaid = paymentStatus[item.teacher.id] === "paid";
                return (
                  <TableRow key={item.teacher.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs border border-primary/20">
                          {item.teacher.full_name?.charAt(0) || "G"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.teacher.full_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.teacher.role === "admin" ? "Admin kiêm nhiệm" : "Giáo viên chính thức"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.teacher.phone || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          item.completedSessions > 0
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold text-xs"
                            : "bg-muted text-muted-foreground text-xs"
                        }
                      >
                        {item.completedSessions} ca
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-medium">
                      {formatVND(item.salaryPerSession)}
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {formatVND(item.totalSalary)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePaid(item.teacher.id)}
                        className={`h-7 px-2.5 text-[11px] font-bold rounded-full transition-all ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30"
                        }`}
                      >
                        {isPaid ? "✓ Đã thanh toán" : "○ Chờ thanh toán"}
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeacher(item)}
                        className="h-8 gap-1 text-xs rounded-xl border-border hover:bg-muted"
                      >
                        Chi tiết
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Teacher Detail Modal */}
      <Dialog open={Boolean(selectedTeacher)} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Phiếu Lương Giáo Viên</DialogTitle>
            <DialogDescription className="text-xs">
              Chi tiết thu nhập tháng {currentMonth}/{currentYear}
            </DialogDescription>
          </DialogHeader>

          {selectedTeacher && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Giáo viên:</span>
                  <span className="font-bold text-foreground">{selectedTeacher.teacher.full_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span className="font-mono text-foreground">{selectedTeacher.teacher.phone || "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Đơn giá thù lao/ca:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatVND(selectedTeacher.salaryPerSession)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Số ca đã dạy hoàn thành:</span>
                  <span className="font-bold text-primary">{selectedTeacher.completedSessions} buổi</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  Tổng Thực Nhận:
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatVND(selectedTeacher.totalSalary)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeacher(null)}
                  className="rounded-xl text-xs"
                >
                  Đóng
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    togglePaid(selectedTeacher.teacher.id);
                    setSelectedTeacher(null);
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  {paymentStatus[selectedTeacher.teacher.id] === "paid"
                    ? "Đổi về Chờ thanh toán"
                    : "Xác nhận Đã chuyển khoản"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
