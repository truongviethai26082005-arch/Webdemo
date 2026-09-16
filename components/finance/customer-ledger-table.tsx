"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  onTopUp?: (student: StudentLedgerItem) => void;
  onViewHistory: (student: StudentLedgerItem) => void;
}

export function CustomerLedgerTable({
  students,
  kpis,
  onTopUp,
  onViewHistory,
}: CustomerLedgerTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get("filter");

  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<"all" | "debt" | "warning" | "safe">(
    filterParam === "debt" ? "debt" : filterParam === "warning" ? "warning" : filterParam === "safe" ? "safe" : "all"
  );

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "debt") {
      setBalanceFilter("debt");
    } else if (f === "warning") {
      setBalanceFilter("warning");
    } else if (f === "safe") {
      setBalanceFilter("safe");
    } else if (!f) {
      setBalanceFilter("all");
    }
  }, [searchParams]);

  const handleFilterChange = (newFilter: "all" | "debt" | "warning" | "safe") => {
    setBalanceFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const filteredStudents = students.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.phone.includes(searchTerm) ||
      st.classes.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    if (balanceFilter === "debt") {
      return (
        st.totalBalanceSessions <= 0 ||
        st.currentDebt > 0 ||
        ((st as any).debtAmount && (st as any).debtAmount > 0) ||
        ((st as any).remainingSessions !== undefined && (st as any).remainingSessions <= 0)
      );
    }
    if (balanceFilter === "warning") return st.totalBalanceSessions > 0 && st.totalBalanceSessions <= 2;
    if (balanceFilter === "safe") return st.totalBalanceSessions >= 3;

    return true;
  });

  return (
    <div className="space-y-5">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Tổng số dư học phí khả dụng */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Số Dư Học Phí Khả Dụng
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {kpis.totalAvailableSessions} <span className="text-sm font-normal text-slate-400">buổi</span>
            </div>
            <div className="text-xs text-slate-400 truncate">
              Tổng số buổi còn trong ví của toàn bộ học viên
            </div>
          </div>
        </div>

        {/* KPI 2: Tổng công nợ cần thu */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng Công Nợ Cần Thu
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {formatVND(kpis.totalUnpaidDebt)}
            </div>
            <div className="text-xs text-slate-400 truncate">
              Hóa đơn chờ thanh toán + các ca học nợ âm buổi
            </div>
          </div>
        </div>

        {/* KPI 3: Học viên sắp hết buổi */}
        <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-full transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Học Viên Sắp Hết Buổi
            </span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight my-1">
              {kpis.studentsNeedingReminderCount} <span className="text-sm font-normal text-slate-400">học sinh</span>
            </div>
            <div className="text-xs text-slate-400 truncate">
              Đang có số dư trong ví ≤ 2 buổi học
            </div>
          </div>
        </div>
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
            onClick={() => handleFilterChange("all")}
            className="h-8 text-xs rounded-xl px-3 font-semibold"
          >
            Tất cả ({students.length})
          </Button>

          <Button
            size="sm"
            variant={balanceFilter === "debt" ? "default" : "outline"}
            onClick={() => handleFilterChange("debt")}
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
            onClick={() => handleFilterChange("warning")}
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
            onClick={() => handleFilterChange("safe")}
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
      <Card className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-b border-slate-200">
              <TableHead className="py-3 px-4 w-[240px] text-xs font-semibold text-slate-600 uppercase tracking-wider">Học viên & SĐT</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Lớp đang học</TableHead>
              <TableHead className="py-3 px-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Số buổi còn lại</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Lũy kế đã nộp</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Công nợ hiện tại</TableHead>
              <TableHead className="py-3 px-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-bold text-sm text-slate-900">Không tìm thấy học sinh nào</p>
                  <p className="text-xs mt-0.5 text-slate-400">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((st) => {
                return (
                  <TableRow key={st.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                    {/* Cột 1: Học viên & SĐT */}
                    <TableCell className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-slate-900">{st.name}</span>
                          {st.status !== "active" && (
                            <Badge variant="outline" className="text-[9px] py-0 border-slate-200 text-slate-500">
                              {st.status === "paused" ? "Tạm nghỉ" : "Nghỉ"}
                            </Badge>
                          )}
                        </div>

                        {st.phone ? (
                          <span className="text-xs font-mono text-slate-500 block">
                            {st.phone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic block">Chưa có SĐT</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Cột 2: Lớp đang học */}
                    <TableCell className="py-3 px-4">
                      {st.classes.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Chưa xếp lớp</span>
                      ) : (
                        <div className="space-y-1">
                          {st.classes.map((cls) => (
                            <div key={cls.id} className="flex items-center gap-2 text-xs">
                              <span className="font-medium text-slate-700">{cls.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                ({formatVND(cls.feePerSession)}/b)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    {/* Cột 3: Số buổi còn lại (Badge màu trực quan) */}
                    <TableCell className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold font-mono px-2.5 py-0.5 rounded-lg ${
                            st.totalBalanceSessions <= 0
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : st.totalBalanceSessions <= 2
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {st.totalBalanceSessions} buổi
                        </Badge>
                        {st.totalBalanceSessions <= 0 ? (
                          <span className="text-[9px] font-semibold text-rose-600 mt-0.5">Cần thu gấp</span>
                        ) : st.totalBalanceSessions <= 2 ? (
                          <span className="text-[9px] font-semibold text-amber-600 mt-0.5">Sắp hết</span>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Cột 4: Lũy kế đã nộp */}
                    <TableCell className="py-3 px-4">
                      <span className="font-mono text-sm font-medium text-slate-700">
                        {formatVND(st.totalPaid)}
                      </span>
                    </TableCell>

                    {/* Cột 5: Công nợ hiện tại */}
                    <TableCell className="py-3 px-4">
                      <span
                        className={`font-mono text-sm font-medium ${
                          st.currentDebt > 0
                            ? "text-rose-600"
                            : "text-slate-400"
                        }`}
                      >
                        {formatVND(st.currentDebt)}
                      </span>
                    </TableCell>

                    {/* Cột 6: Thao tác (Duy nhất nút Lịch sử) */}
                    <TableCell className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewHistory(st)}
                          className="h-8 gap-1 text-xs rounded-xl border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition-all"
                          title="Xem lịch sử hóa đơn thu tiền của học sinh này"
                        >
                          <History className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lịch sử</span>
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
