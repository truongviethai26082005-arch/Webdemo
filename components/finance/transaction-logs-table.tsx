"use client";

import { useState, useEffect } from "react";
import { TransactionInvoice } from "@/lib/actions/finance";
import { formatVND } from "@/lib/utils/vietqr";
import {
  Search,
  Receipt,
  CheckCircle2,
  Calendar,
  CreditCard,
  Banknote,
  FileSpreadsheet,
  Printer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  onOpenVietQR?: (invoice: TransactionInvoice) => void;
  onOpenReceipt: (invoice: TransactionInvoice) => void;
  onMarkPaid?: (invoiceId: string) => void;
  externalSearchTerm?: string;
  onClearExternalSearch?: () => void;
}

export function TransactionLogsTable({
  invoices,
  onOpenReceipt,
  externalSearchTerm,
  onClearExternalSearch,
}: TransactionLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("month");
  const [methodFilter, setMethodFilter] = useState<"all" | "cash" | "transfer">("all");

  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

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

  // Admin chỉ đối soát các hóa đơn đã thanh toán thành công (thực thu)
  const paidInvoices = invoices.filter(
    (inv) => inv.status === "paid" || (inv.status as string) === "completed"
  );

  const filteredInvoices = paidInvoices.filter((inv) => {
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

    return true;
  });

  // Calculate total amount
  const totalAmountFiltered = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

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
      "Đã thanh toán",
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
      {/* 1 thẻ KPI duy nhất: Tổng tiền thực thu (Đã thanh toán) */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent bg-card border border-border/80 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Tổng Tiền Thực Thu (Đã Thanh Toán)
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {formatVND(totalAmountFiltered)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Từ các hóa đơn đã thanh toán thành công khớp theo bộ lọc hiện tại
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="w-6 h-6" />
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === "" && onClearExternalSearch) {
                  onClearExternalSearch();
                }
              }}
              className="pl-9 pr-8 h-9 text-xs rounded-xl"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  if (onClearExternalSearch) onClearExternalSearch();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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

        {/* Filter Controls: Thời gian & Hình thức */}
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  methodFilter === m.id
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
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
              <TableHead className="w-[140px] text-xs font-bold">Ngày thanh toán</TableHead>
              <TableHead className="text-xs font-bold">Học viên</TableHead>
              <TableHead className="text-xs font-bold">Lớp & Số buổi</TableHead>
              <TableHead className="text-xs font-bold">Số tiền</TableHead>
              <TableHead className="text-xs font-bold">Phương thức</TableHead>
              <TableHead className="text-right text-xs font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  <Receipt className="w-9 h-9 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm text-foreground">Không có hóa đơn nào</p>
                  <p className="text-xs mt-0.5">Không tìm thấy giao dịch đã thanh toán nào phù hợp với bộ lọc hiện tại.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => {
                const isCash = inv.paymentMethod === "cash";

                return (
                  <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                    {/* Mã HĐ */}
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {inv.code}
                      </span>
                    </TableCell>

                    {/* Ngày thanh toán */}
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

                    {/* Phương thức Badge */}
                    <TableCell>
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
                    </TableCell>

                    {/* Thao tác: Duy nhất nút In biên lai */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenReceipt(inv)}
                          className="h-8 gap-1.5 text-xs rounded-xl border-border hover:bg-muted font-semibold transition-all"
                          title="Xem và in phiếu thu đối soát"
                        >
                          <Printer className="w-3.5 h-3.5 text-primary" />
                          <span>In biên lai</span>
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
