"use client";

import { useState } from "react";
import { TransactionInvoice } from "@/lib/actions/finance";
import { formatVND } from "@/lib/utils/vietqr";
import {
  Search,
  Download,
  Receipt,
  QrCode,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  CreditCard,
  Banknote,
  FileSpreadsheet,
  Printer,
  ChevronRight,
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

interface TransactionLogsTableProps {
  invoices: TransactionInvoice[];
  onOpenVietQR: (invoice: TransactionInvoice) => void;
  onOpenReceipt: (invoice: TransactionInvoice) => void;
  onMarkPaid: (invoiceId: string) => void;
}

export function TransactionLogsTable({
  invoices,
  onOpenVietQR,
  onOpenReceipt,
  onMarkPaid,
}: TransactionLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("month");
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "transfer">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Helper date filters
  function isThisWeek(dateStr: string) {
    const d = new Date(dateStr);
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    return d >= monday;
  }

  function isThisMonth(dateStr: string) {
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  const filteredInvoices = invoices.filter((inv) => {
    // 1. Search text
    const matchSearch =
      inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.parentPhone.includes(searchTerm);

    if (!matchSearch) return false;

    // 2. Filter time
    const date = inv.paidAt || inv.createdAt;
    if (timeFilter === "today" && !date.startsWith(todayStr)) return false;
    if (timeFilter === "week" && !isThisWeek(date)) return false;
    if (timeFilter === "month" && !isThisMonth(date)) return false;

    // 3. Filter method
    if (methodFilter !== "all" && inv.paymentMethod !== methodFilter) return false;

    // 4. Filter status
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;

    return true;
  });

  // Calculate totals
  const totalAmountFiltered = filteredInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmountFiltered = filteredInvoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Export CSV function (UTF-8 BOM supported for Vietnamese Excel)
  function handleExportCSV() {
    const headers = [
      "Mã Hóa Đơn",
      "Ngày Tạo",
      "Ngày Thanh Toán",
      "Tên Học Sinh",
      "SĐT Phụ Huynh",
      "Lớp Học",
      "Số Buổi Nạp",
      "Số Tiền (VNĐ)",
      "Hình Thức",
      "Trạng Thái",
      "Ghi Chú",
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.code,
      new Date(inv.createdAt).toLocaleString("vi-VN"),
      inv.paidAt ? new Date(inv.paidAt).toLocaleString("vi-VN") : "",
      `"${inv.studentName}"`,
      `"${inv.parentPhone}"`,
      `"${inv.className}"`,
      inv.sessionsAdded,
      inv.amount,
      inv.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản (VietQR)",
      inv.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán",
      `"${inv.note || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Nhat_Ky_Giao_Dich_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-5">
      {/* Overview Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Tổng tiền thực thu (Đã thanh toán)
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {formatVND(totalAmountFiltered)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Từ các hóa đơn khớp theo bộ lọc hiện tại
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Hóa đơn đang chờ thanh toán
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              {formatVND(pendingAmountFiltered)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Cần gửi phụ huynh chuyển khoản hoặc thu tiền mặt
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm mã HĐ, tên học sinh, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Export to Excel */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 text-xs font-bold rounded-xl border-border hover:bg-muted shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel ({filteredInvoices.length})</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
          {/* Time filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Thời gian:</span>
            {(
              [
                { id: "today", label: "Hôm nay" },
                { id: "week", label: "Tuần này" },
                { id: "month", label: "Tháng này" },
                { id: "all", label: "Tất cả" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === t.id
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Method filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Hình thức:</span>
            {(
              [
                { id: "all", label: "Tất cả" },
                { id: "transfer", label: "VietQR" },
                { id: "cash", label: "Tiền mặt" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMethodFilter(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  methodFilter === m.id
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Trạng thái:</span>
            {(
              [
                { id: "all", label: "Tất cả" },
                { id: "paid", label: "Đã thu" },
                { id: "pending", label: "Chờ thu" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s.id
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[110px] text-xs font-bold">Mã HĐ</TableHead>
              <TableHead className="w-[140px] text-xs font-bold">Ngày tạo / Thu</TableHead>
              <TableHead className="text-xs font-bold">Học viên</TableHead>
              <TableHead className="text-xs font-bold">Lớp & Số buổi</TableHead>
              <TableHead className="text-xs font-bold">Số tiền</TableHead>
              <TableHead className="text-xs font-bold">Phương thức & Trạng thái</TableHead>
              <TableHead className="text-right text-xs font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  <Receipt className="w-9 h-9 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm text-foreground">Không có hóa đơn nào</p>
                  <p className="text-xs mt-0.5">Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => {
                const isPaid = inv.status === "paid";
                const isCash = inv.paymentMethod === "cash";

                return (
                  <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                    {/* Mã HĐ */}
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {inv.code}
                      </span>
                    </TableCell>

                    {/* Ngày tạo */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(inv.paidAt || inv.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        {new Date(inv.paidAt || inv.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </TableCell>

                    {/* Học viên */}
                    <TableCell>
                      <div>
                        <span className="font-bold text-xs text-foreground block">
                          {inv.studentName}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {inv.parentPhone}
                        </span>
                      </div>
                    </TableCell>

                    {/* Lớp & Số buổi */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-foreground/90 block">
                          {inv.className}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono font-bold">
                          +{inv.sessionsAdded} buổi
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Số tiền */}
                    <TableCell>
                      <span className="font-black text-xs font-mono text-foreground">
                        {formatVND(inv.amount)}
                      </span>
                    </TableCell>

                    {/* Phương thức & Trạng thái Badge */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {isPaid ? (
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold inline-flex items-center gap-1 w-fit ${
                              isCash
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {isCash ? "Đã TT - Tiền mặt" : "Đã TT - VietQR"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1 w-fit"
                          >
                            <Clock className="w-3 h-3" />
                            Chờ thanh toán
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPaid ? (
                          // Nút Xem Biên Lai (In phiếu thu)
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenReceipt(inv)}
                            className="h-8 gap-1 text-xs rounded-xl border-border hover:bg-muted font-semibold"
                            title="Xem và in biên lai thu tiền"
                          >
                            <Printer className="w-3.5 h-3.5 text-primary" />
                            Biên lai
                          </Button>
                        ) : (
                          // Hóa đơn Chờ thanh toán: Xem VietQR & Xác nhận đã thu
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onOpenVietQR(inv)}
                              className="h-8 gap-1 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-bold"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Xem VietQR
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => onMarkPaid(inv.id)}
                              className="h-8 gap-1 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã thu
                            </Button>
                          </>
                        )}
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
