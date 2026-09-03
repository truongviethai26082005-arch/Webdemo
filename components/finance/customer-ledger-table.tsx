"use client";

import { useState } from "react";
import {
  StudentLedgerItem,
  FinancialKPIs,
} from "@/lib/actions/finance";
import { formatVND } from "@/lib/utils/vietqr";
import {
  Users,
  Search,
  AlertTriangle,
  Wallet,
  Phone,
  MessageCircle,
  Receipt,
  History,
  CheckCircle2,
  ExternalLink,
  Plus,
  BookOpen,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerLedgerTableProps {
  students: StudentLedgerItem[];
  kpis: FinancialKPIs;
  onTopUp: (student: StudentLedgerItem) => void;
  onViewHistory: (student: StudentLedgerItem) => void;
}

export function CustomerLedgerTable({
  students,
  kpis,
  onTopUp,
  onViewHistory,
}: CustomerLedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<"all" | "debt" | "warning" | "safe">("all");

  const filteredStudents = students.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.phone.includes(searchTerm) ||
      st.classes.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    if (balanceFilter === "debt") return st.totalBalanceSessions <= 0 || st.currentDebt > 0;
    if (balanceFilter === "warning") return st.totalBalanceSessions > 0 && st.totalBalanceSessions <= 2;
    if (balanceFilter === "safe") return st.totalBalanceSessions >= 3;

    return true;
  });

  return (
    <div className="space-y-5">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Tổng số dư học phí khả dụng */}
        <Card className="border border-border/80 bg-gradient-to-b from-blue-500/10 to-transparent bg-card shadow-soft rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Số Dư Học Phí Khả Dụng
              </span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                {kpis.totalAvailableSessions} <span className="text-sm font-normal text-muted-foreground">buổi</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tổng số buổi còn trong ví của toàn bộ học viên
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 2: Tổng công nợ cần thu */}
        <Card className="border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent bg-card shadow-soft rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Tổng Công Nợ Cần Thu
              </span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                {formatVND(kpis.totalUnpaidDebt)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Hóa đơn chờ thanh toán + các ca học nợ âm buổi
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 3: Học viên cần nhắc phí */}
        <Card className="border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent bg-card shadow-soft rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Học Viên Cần Nhắc Phí
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {kpis.studentsNeedingReminderCount} <span className="text-sm font-normal text-muted-foreground">học sinh</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Đang có số dư trong ví ≤ 2 buổi học
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên học sinh, SĐT, lớp học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        {/* Quick balance filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={balanceFilter === "all" ? "default" : "outline"}
            onClick={() => setBalanceFilter("all")}
            className="h-8 text-xs rounded-xl px-3 font-semibold"
          >
            Tất cả ({students.length})
          </Button>

          <Button
            size="sm"
            variant={balanceFilter === "debt" ? "default" : "outline"}
            onClick={() => setBalanceFilter("debt")}
            className={`h-8 text-xs rounded-xl px-3 font-semibold ${
              balanceFilter === "debt"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
            }`}
          >
            Nợ / Âm buổi
          </Button>

          <Button
            size="sm"
            variant={balanceFilter === "warning" ? "default" : "outline"}
            onClick={() => setBalanceFilter("warning")}
            className={`h-8 text-xs rounded-xl px-3 font-semibold ${
              balanceFilter === "warning"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
            }`}
          >
            Sắp hết (≤2 buổi)
          </Button>

          <Button
            size="sm"
            variant={balanceFilter === "safe" ? "default" : "outline"}
            onClick={() => setBalanceFilter("safe")}
            className={`h-8 text-xs rounded-xl px-3 font-semibold ${
              balanceFilter === "safe"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            }`}
          >
            An toàn (≥3 buổi)
          </Button>
        </div>
      </div>

      {/* Customer Ledger Table */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[240px] text-xs font-bold">Học viên & Zalo</TableHead>
              <TableHead className="text-xs font-bold">Lớp đang học</TableHead>
              <TableHead className="text-center text-xs font-bold">Số buổi còn lại</TableHead>
              <TableHead className="text-xs font-bold">Lũy kế đã nộp</TableHead>
              <TableHead className="text-xs font-bold">Công nợ hiện tại</TableHead>
              <TableHead className="text-right text-xs font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm text-foreground">Không tìm thấy học sinh nào</p>
                  <p className="text-xs mt-0.5">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((st) => {
                const cleanPhone = st.phone ? st.phone.replace(/\D/g, "") : "";
                const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : null;

                return (
                  <TableRow key={st.id} className="hover:bg-muted/40 transition-colors">
                    {/* Cột 1: Học viên & Zalo */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">{st.name}</span>
                          {st.status !== "active" && (
                            <Badge variant="outline" className="text-[9px] py-0">
                              {st.status === "paused" ? "Tạm nghỉ" : "Nghỉ"}
                            </Badge>
                          )}
                        </div>

                        {st.phone ? (
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <span>{st.phone}</span>
                            {zaloUrl && (
                              <a
                                href={zaloUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
                                title="Mở chat Zalo với phụ huynh"
                              >
                                <MessageCircle className="w-2.5 h-2.5" />
                                Zalo
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Chưa có SĐT</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Cột 2: Lớp đang học */}
                    <TableCell>
                      {st.classes.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">Chưa xếp lớp</span>
                      ) : (
                        <div className="space-y-1">
                          {st.classes.map((cls) => (
                            <div key={cls.id} className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-foreground/90">{cls.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                ({formatVND(cls.feePerSession)}/b)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    {/* Cột 3: Số buổi còn lại (Badge màu trực quan) */}
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <Badge
                          variant="outline"
                          className={`text-xs font-black font-mono px-2.5 py-0.5 ${
                            st.totalBalanceSessions <= 0
                              ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                              : st.totalBalanceSessions <= 2
                              ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {st.totalBalanceSessions} buổi
                        </Badge>
                        {st.totalBalanceSessions <= 0 ? (
                          <span className="text-[9px] font-bold text-rose-600 mt-0.5">Cần thu gấp</span>
                        ) : st.totalBalanceSessions <= 2 ? (
                          <span className="text-[9px] font-bold text-amber-600 mt-0.5">Sắp hết</span>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Cột 4: Lũy kế đã nộp */}
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatVND(st.totalPaid)}
                      </span>
                    </TableCell>

                    {/* Cột 5: Công nợ hiện tại */}
                    <TableCell>
                      <span
                        className={`font-mono text-xs font-bold ${
                          st.currentDebt > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatVND(st.currentDebt)}
                      </span>
                    </TableCell>

                    {/* Cột 6: Thao tác nhanh */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Nút + Thu phí */}
                        <Button
                          size="sm"
                          onClick={() => onTopUp(st)}
                          className="h-8 gap-1 text-xs rounded-xl font-bold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thu phí
                        </Button>

                        {/* Nút Lịch sử (Mở Slide-over Sheet) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewHistory(st)}
                          className="h-8 gap-1 text-xs rounded-xl border-border hover:bg-muted font-semibold"
                          title="Xem sao kê nạp tiền và các buổi học đã bị trừ điểm danh"
                        >
                          <History className="w-3.5 h-3.5 text-primary" />
                          Lịch sử
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
