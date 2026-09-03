"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  DollarSign,
  Phone,
  Edit,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Wallet,
  Building2,
  CreditCard,
  ChevronRight,
  Sliders,
  Calendar,
  Clock,
  DoorOpen,
  FileText,
  AlertCircle,
  Sparkles,
  Printer,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatVND } from "@/lib/utils/vietqr";
import { TeacherDialog } from "@/components/teachers/teacher-dialog";
import { getTeacherPayroll } from "@/lib/actions/teachers";
import { TeacherPayroll, TeacherSessionDetail } from "@/types/database";

interface TeachersClientProps {
  initialTeachers: any[];
  initialPayroll: TeacherPayroll[];
  defaultTab?: "teachers" | "payroll";
}

export function TeachersClient({
  initialTeachers,
  initialPayroll,
  defaultTab = "teachers",
}: TeachersClientProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [payroll, setPayroll] = useState<TeacherPayroll[]>(initialPayroll);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

  // Month & Year Picker State
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);

  // Modals
  const [selectedSessionTeacher, setSelectedSessionTeacher] = useState<TeacherPayroll | null>(null);
  const [adjustingTeacher, setAdjustingTeacher] = useState<TeacherPayroll | null>(null);

  // Adjustments (Thưởng / Phạt) State
  const [adjustments, setAdjustments] = useState<
    Record<string, { bonus: number; deduction: number; note?: string }>
  >({});
  const [bonusInput, setBonusInput] = useState("0");
  const [deductionInput, setDeductionInput] = useState("0");
  const [adjustmentNote, setAdjustmentNote] = useState("");

  // Payment Status (Đã thanh toán / Chờ thanh toán)
  const [paymentStatus, setPaymentStatus] = useState<
    Record<string, { isPaid: boolean; paidAt?: string }>
  >({});

  // Fetch payroll when month or year changes
  async function fetchPayroll(m: number, y: number) {
    setIsLoadingPayroll(true);
    const data = await getTeacherPayroll(m, y);
    setPayroll(data);
    setIsLoadingPayroll(false);
  }

  function handleMonthChange(m: number) {
    setSelectedMonth(m);
    fetchPayroll(m, selectedYear);
  }

  function handleYearChange(y: number) {
    setSelectedYear(y);
    fetchPayroll(selectedMonth, y);
  }

  // Toggle or Set Paid Status
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

  // Open Adjustment Modal
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

  // Filter teachers (tab 1)
  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone && t.phone.includes(searchTerm)) ||
      (t.bank_name && t.bank_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter payroll (tab 2)
  const filteredPayroll = payroll.filter(
    (p) =>
      p.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.teacher?.phone && p.teacher.phone.includes(searchTerm))
  );

  // Compute total payroll with adjustments
  const totalPayrollBudget = payroll.reduce((sum, p) => {
    const adj = adjustments[p.teacher.id] || { bonus: 0, deduction: 0 };
    const teacherTotal = p.totalSalary + adj.bonus - adj.deduction;
    return sum + (teacherTotal > 0 ? teacherTotal : 0);
  }, 0);

  const totalSessionsTaught = payroll.reduce((sum, p) => sum + p.completedSessions, 0);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <TabsList className="grid grid-cols-2 w-full sm:w-80 h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="teachers" className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <GraduationCap className="w-4 h-4" />
              Đội ngũ Giáo viên
            </TabsTrigger>
            <TabsTrigger value="payroll" className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <Wallet className="w-4 h-4" />
              Bảng lương Tháng
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => {
              setEditingTeacher(null);
              setIsDialogOpen(true);
            }}
            className="gap-2 text-xs font-bold h-9 shadow-md shadow-primary/25 rounded-xl shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Thêm Giáo Viên Mới
          </Button>
        </div>

        {/* Tab 1: Danh sách Giáo viên */}
        <TabsContent value="teachers" className="space-y-4 mt-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo tên giáo viên, số điện thoại, ngân hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[240px] text-xs font-bold">Họ và tên giáo viên</TableHead>
                  <TableHead className="text-xs font-bold">Số điện thoại</TableHead>
                  <TableHead className="text-xs font-bold">Thù lao / Buổi</TableHead>
                  <TableHead className="text-xs font-bold">Tài khoản nhận lương</TableHead>
                  <TableHead className="text-xs font-bold">Lớp đang phụ trách</TableHead>
                  <TableHead className="text-right text-xs font-bold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                      <GraduationCap className="w-9 h-9 mx-auto mb-2 opacity-40" />
                      <p className="font-bold text-sm text-foreground">Không có giáo viên nào</p>
                      <p className="text-xs mt-0.5">Bấm "+ Thêm Giáo Viên Mới" để tạo tài khoản giáo viên.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((tc) => (
                    <TableRow key={tc.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
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

                      <TableCell>
                        <span className="text-xs font-mono font-medium text-foreground">
                          {tc.phone || "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-black text-xs font-mono text-primary">
                          {formatVND(tc.salary_per_session || 0)}
                        </span>
                      </TableCell>

                      {/* Tài khoản nhận lương */}
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

                      <TableCell>
                        {!tc.classes || tc.classes.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Chưa xếp lớp</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {tc.classes.map((cls: any) => (
                              <Badge key={cls.id} variant="secondary" className="text-[10px] font-semibold">
                                {cls.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

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
        </TabsContent>

        {/* Tab 2: Bảng lương Tháng */}
        <TabsContent value="payroll" className="space-y-4 mt-4">
          {/* Top Bar: Bộ chọn Tháng/Năm (Month Picker) & Tổng kết */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Kỳ tính lương:</span>
              </div>

              {/* Chọn Tháng */}
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

              {/* Chọn Năm */}
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

              {/* Nút Tháng này */}
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
                    Đã bao gồm các khoản thưởng / phạt bổ sung
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
                    Đã điểm danh hoàn tất trong Tháng {selectedMonth}/{selectedYear}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Bảng Thù Lao Chi Tiết Giáo Viên (Tháng {selectedMonth}/{selectedYear})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Công thức: [Số ca hoàn thành] × [Thù lao/buổi] + [Thưởng] - [Phạt]
                  </CardDescription>
                </div>
              </div>
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
                {isLoadingPayroll ? (
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
                      <p className="text-xs mt-0.5">Dữ liệu sẽ tự động tổng hợp khi giáo viên hoàn thành các ca học.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayroll.map((item) => {
                    const adj = adjustments[item.teacher.id] || { bonus: 0, deduction: 0, note: "" };
                    const finalSalary = Math.max(0, item.totalSalary + adj.bonus - adj.deduction);
                    const status = paymentStatus[item.teacher.id] || { isPaid: false };

                    return (
                      <TableRow key={item.teacher.id} className="hover:bg-muted/40 transition-colors">
                        {/* Giáo viên & STK */}
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

                        {/* Số ca dạy */}
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold text-xs font-mono">
                            {item.completedSessions} ca
                          </Badge>
                        </TableCell>

                        {/* Đơn giá */}
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            {formatVND(item.salaryPerSession)}
                          </span>
                        </TableCell>

                        {/* Thưởng / Phạt */}
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
                            {adj.note && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={adj.note}>
                                {adj.note}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Tổng lương */}
                        <TableCell>
                          <span className="font-black text-sm font-mono text-emerald-600 dark:text-emerald-400">
                            {formatVND(finalSalary)}
                          </span>
                        </TableCell>

                        {/* Trạng thái Thanh toán */}
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

                        {/* Thao tác */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Nút Thưởng / Phạt */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAdjustmentModal(item)}
                              className="h-8 gap-1 text-xs rounded-xl border-border hover:bg-muted font-semibold"
                              title="Thêm thưởng hoặc khấu trừ phạt"
                            >
                              <Sliders className="w-3.5 h-3.5 text-primary" />
                              Thưởng/Phạt
                            </Button>

                            {/* Nút Xem chi tiết ca dạy */}
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
        </TabsContent>
      </Tabs>

      {/* Modal: Xem Chi Tiết Ca Dạy */}
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
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  Chi Tiết Ca Dạy - {selectedSessionTeacher?.teacher.full_name}
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-mono">
                    Tháng {selectedMonth}/{selectedYear}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Danh sách các buổi học giáo viên đã đứng lớp và hoàn thành điểm danh
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedSessionTeacher && (
            <div className="space-y-4 pt-2">
              {/* Thống kê nhanh */}
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

              {/* Danh sách các buổi dạy */}
              {(!selectedSessionTeacher.sessions || selectedSessionTeacher.sessions.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
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
                          <span>• {sess.attendanceCount} học sinh có mặt</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSessionTeacher(null)}
                  className="rounded-xl text-xs h-9 px-4"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Nhập Bổ Sung Thưởng / Phạt */}
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
                  Điều chỉnh lương tháng {selectedMonth}/{selectedYear}
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

              {/* Tiền Thưởng */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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

              {/* Khấu Trừ / Phạt */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-rose-600 dark:text-rose-400">
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

              {/* Lý do / Ghi chú */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Lý do điều chỉnh (Ghi chú)</Label>
                <Input
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  placeholder="VD: Thưởng chuyên cần, hỗ trợ thêm ca..."
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              {/* Tạm tính sau điều chỉnh */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  Tổng Lương Sau Điều Chỉnh:
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatVND(
                    Math.max(
                      0,
                      adjustingTeacher.totalSalary +
                        parseInt(bonusInput.replace(/\D/g, "") || "0", 10) -
                        parseInt(deductionInput.replace(/\D/g, "") || "0", 10)
                    )
                  )}
                </span>
              </div>

              <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustingTeacher(null)}
                  className="rounded-xl text-xs h-9 px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveAdjustment}
                  className="rounded-xl text-xs font-bold h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Lưu điều chỉnh
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
