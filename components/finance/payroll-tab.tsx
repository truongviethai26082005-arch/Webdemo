"use client";

import { useState } from "react";
import { TeacherPayroll, TeacherSessionDetail } from "@/types/database";
import { formatVND } from "@/lib/utils/vietqr";
import { getTeacherPayroll } from "@/lib/actions/teachers";
import {
  Wallet,
  CalendarCheck,
  Calendar,
  CreditCard,
  Sliders,
  ChevronRight,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PayrollTabProps {
  initialPayroll: TeacherPayroll[];
  currentMonth: number;
  currentYear: number;
}

export function PayrollTab({
  initialPayroll,
  currentMonth: initMonth,
  currentYear: initYear,
}: PayrollTabProps) {
  const [payroll, setPayroll] = useState<TeacherPayroll[]>(initialPayroll);
  const [selectedMonth, setSelectedMonth] = useState(initMonth);
  const [selectedYear, setSelectedYear] = useState(initYear);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [selectedSessionTeacher, setSelectedSessionTeacher] = useState<TeacherPayroll | null>(null);
  const [adjustingTeacher, setAdjustingTeacher] = useState<TeacherPayroll | null>(null);

  // Adjustments (Thưởng / Phạt)
  const [adjustments, setAdjustments] = useState<
    Record<string, { bonus: number; deduction: number; note?: string }>
  >({});
  const [bonusInput, setBonusInput] = useState("0");
  const [deductionInput, setDeductionInput] = useState("0");
  const [adjustmentNote, setAdjustmentNote] = useState("");

  // Payment Status
  const [paymentStatus, setPaymentStatus] = useState<
    Record<string, { isPaid: boolean; paidAt?: string }>
  >({});

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026, 2027];

  async function fetchPayroll(m: number, y: number) {
    setIsLoading(true);
    const data = await getTeacherPayroll(m, y);
    setPayroll(data);
    setIsLoading(false);
  }

  function handleMonthChange(m: number) {
    setSelectedMonth(m);
    fetchPayroll(m, selectedYear);
  }

  function handleYearChange(y: number) {
    setSelectedYear(y);
    fetchPayroll(selectedMonth, y);
  }

  function togglePaid(teacherId: string) {
    setPaymentStatus((prev) => {
      const current = prev[teacherId];
      const willBePaid = !current?.isPaid;
      return {
        ...prev,
        [teacherId]: {
          isPaid: willBePaid,
          paidAt: willBePaid ? new Date().toLocaleDateString("vi-VN") : undefined,
        },
      };
    });
  }

  function openAdjustmentModal(item: TeacherPayroll) {
    setAdjustingTeacher(item);
    const current = adjustments[item.teacher.id] || { bonus: 0, deduction: 0, note: "" };
    setBonusInput(current.bonus > 0 ? new Intl.NumberFormat("vi-VN").format(current.bonus) : "0");
    setDeductionInput(current.deduction > 0 ? new Intl.NumberFormat("vi-VN").format(current.deduction) : "0");
    setAdjustmentNote(current.note || "");
  }

  function saveAdjustment() {
    if (!adjustingTeacher) return;
    const rawBonus = parseInt(bonusInput.replace(/\D/g, "") || "0", 10);
    const rawDeduction = parseInt(deductionInput.replace(/\D/g, "") || "0", 10);

    setAdjustments((prev) => ({
      ...prev,
      [adjustingTeacher.teacher.id]: {
        bonus: rawBonus,
        deduction: rawDeduction,
        note: adjustmentNote.trim(),
      },
    }));
    setAdjustingTeacher(null);
  }

  const filteredPayroll = payroll.filter(
    (p) =>
      p.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.teacher?.phone && p.teacher.phone.includes(searchTerm))
  );

  const totalPayrollBudget = payroll.reduce((sum, p) => {
    const adj = adjustments[p.teacher.id] || { bonus: 0, deduction: 0 };
    const teacherTotal = p.totalSalary + adj.bonus - adj.deduction;
    return sum + (teacherTotal > 0 ? teacherTotal : 0);
  }, 0);

  const totalSessionsTaught = payroll.reduce((sum, p) => sum + p.completedSessions, 0);

  return (
    <div className="space-y-5">
      {/* Month & Year Picker Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Kỳ tính lương:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="h-8 px-2.5 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="h-8 px-2.5 rounded-xl border border-input bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedMonth(now.getMonth() + 1);
              setSelectedYear(now.getFullYear());
              fetchPayroll(now.getMonth() + 1, now.getFullYear());
            }}
            className="h-8 text-[11px] rounded-xl font-semibold border-border hover:bg-muted"
          >
            Tháng hiện tại
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* 2 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-border/80 bg-gradient-to-b from-emerald-500/10 to-transparent bg-card shadow-soft rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Tổng Ngân Sách Lương Tháng {selectedMonth}/{selectedYear}
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatVND(totalPayrollBudget)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Đã cộng thưởng và trừ khấu trừ nếu có
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-border/80 bg-gradient-to-b from-blue-500/10 to-transparent bg-card shadow-soft rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Tổng Buổi Dạy Hoàn Thành
              </span>
              <p className="text-2xl font-black text-foreground mt-1">
                {totalSessionsTaught} <span className="text-sm font-normal text-muted-foreground">ca học</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Đã điểm danh hoàn tất trong kỳ
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b border-border/70 bg-muted/20">
          <CardTitle className="text-sm font-bold text-foreground">
            Bảng Thù Lao Chi Tiết Giáo Viên (Tháng {selectedMonth}/{selectedYear})
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Tự động tính: [Số ca hoàn thành] × [Thù lao/buổi] + [Thưởng] - [Phạt]
          </CardDescription>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[220px] text-xs font-bold">Giáo viên & STK</TableHead>
              <TableHead className="text-center text-xs font-bold">Số ca dạy</TableHead>
              <TableHead className="text-xs font-bold">Đơn giá / Ca</TableHead>
              <TableHead className="text-xs font-bold">Thưởng / Phạt</TableHead>
              <TableHead className="text-xs font-bold">Tổng Lương Tháng</TableHead>
              <TableHead className="text-center text-xs font-bold">Trạng thái</TableHead>
              <TableHead className="text-right text-xs font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Đang tổng hợp dữ liệu ca dạy Tháng {selectedMonth}/{selectedYear}...</p>
                </TableCell>
              </TableRow>
            ) : filteredPayroll.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <Wallet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm text-foreground">Chưa có dữ liệu tính lương Tháng {selectedMonth}/{selectedYear}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayroll.map((item) => {
                const adj = adjustments[item.teacher.id] || { bonus: 0, deduction: 0, note: "" };
                const finalSalary = Math.max(0, item.totalSalary + adj.bonus - adj.deduction);
                const status = paymentStatus[item.teacher.id] || { isPaid: false };

                return (
                  <TableRow key={item.teacher.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-foreground block">
                          {item.teacher.full_name}
                        </span>
                        {item.teacher.bank_account_no ? (
                          <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-primary" />
                            <span>{item.teacher.bank_account_no}</span>
                            <span className="text-[9px]">({item.teacher.bank_name || "NH"})</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground italic font-mono">{item.teacher.phone || "—"}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-bold text-xs font-mono">
                        {item.completedSessions} ca
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {formatVND(item.salaryPerSession)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        {adj.bonus > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600 block">
                            +{formatVND(adj.bonus)}
                          </span>
                        )}
                        {adj.deduction > 0 && (
                          <span className="text-[11px] font-bold text-rose-600 block">
                            -{formatVND(adj.deduction)}
                          </span>
                        )}
                        {adj.bonus === 0 && adj.deduction === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-black text-sm font-mono text-emerald-600 dark:text-emerald-400">
                        {formatVND(finalSalary)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePaid(item.teacher.id)}
                        className={`h-7 px-2.5 text-[10px] font-bold rounded-full transition-all ${
                          status.isPaid
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30"
                        }`}
                      >
                        {status.isPaid ? "✓ Đã thanh toán" : "○ Chờ thanh toán"}
                      </Button>
                      {status.paidAt && (
                        <span className="text-[9px] text-muted-foreground block mt-0.5 font-mono">
                          {status.paidAt}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAdjustmentModal(item)}
                          className="h-8 gap-1 text-xs rounded-xl border-border hover:bg-muted font-semibold"
                        >
                          <Sliders className="w-3.5 h-3.5 text-primary" />
                          Thưởng/Phạt
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSessionTeacher(item)}
                          className="h-8 gap-1 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-bold"
                        >
                          Xem ca dạy
                          <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Modal Xem Ca Dạy */}
      <Dialog
        open={Boolean(selectedSessionTeacher)}
        onOpenChange={(open) => !open && setSelectedSessionTeacher(null)}
      >
        <DialogContent className="max-w-2xl bg-card rounded-2xl p-6 shadow-2xl border border-border/80 max-h-[88vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Chi Tiết Ca Dạy - {selectedSessionTeacher?.teacher.full_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Tháng {selectedMonth}/{selectedYear}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedSessionTeacher && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/70 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Số ca hoàn thành:</span>
                  <span className="font-bold text-foreground text-sm font-mono">
                    {selectedSessionTeacher.completedSessions} ca
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Đơn giá thù lao:</span>
                  <span className="font-bold text-primary text-sm font-mono">
                    {formatVND(selectedSessionTeacher.salaryPerSession)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tổng lương thù lao:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                    {formatVND(selectedSessionTeacher.totalSalary)}
                  </span>
                </div>
              </div>

              {(!selectedSessionTeacher.sessions || selectedSessionTeacher.sessions.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="font-semibold text-sm">Chưa có ca dạy nào trong tháng này</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 max-h-[380px] overflow-y-auto border rounded-xl">
                  {selectedSessionTeacher.sessions.map((sess, idx) => (
                    <div key={sess.id || idx} className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">{sess.className}</span>
                          {sess.room && (
                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                              {sess.room}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                            Hoàn tất
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {sess.sessionDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sess.startTime} - {sess.endTime}
                          </span>
                          <span>• {sess.attendanceCount} HS có mặt</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatVND(selectedSessionTeacher.salaryPerSession)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter className="pt-2 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={() => setSelectedSessionTeacher(null)} className="rounded-xl text-xs">
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Thưởng / Phạt */}
      <Dialog
        open={Boolean(adjustingTeacher)}
        onOpenChange={(open) => !open && setAdjustingTeacher(null)}
      >
        <DialogContent className="max-w-md bg-card rounded-2xl p-6 shadow-2xl border border-border/80">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Thưởng / Phạt - {adjustingTeacher?.teacher.full_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Tháng {selectedMonth}/{selectedYear}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {adjustingTeacher && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lương cơ bản ({adjustingTeacher.completedSessions} ca):</span>
                  <span className="font-mono font-bold text-foreground">{formatVND(adjustingTeacher.totalSalary)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-emerald-600">
                  + Thưởng thêm (VNĐ)
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={bonusInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const num = parseInt(raw || "0", 10);
                      setBonusInput(new Intl.NumberFormat("vi-VN").format(num));
                    }}
                    placeholder="VD: 200.000"
                    className="h-9 text-xs font-mono font-bold pr-10 rounded-xl"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    đ
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-rose-600">
                  - Khấu trừ / Phạt (VNĐ)
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={deductionInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const num = parseInt(raw || "0", 10);
                      setDeductionInput(new Intl.NumberFormat("vi-VN").format(num));
                    }}
                    placeholder="VD: 50.000"
                    className="h-9 text-xs font-mono font-bold pr-10 rounded-xl"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    đ
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Ghi chú điều chỉnh</Label>
                <Input
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  placeholder="VD: Thưởng chuyên cần, đi trễ..."
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAdjustingTeacher(null)} className="rounded-xl text-xs">
                  Hủy
                </Button>
                <Button type="button" size="sm" onClick={saveAdjustment} className="rounded-xl text-xs font-bold h-9 px-5 bg-primary">
                  Lưu
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
