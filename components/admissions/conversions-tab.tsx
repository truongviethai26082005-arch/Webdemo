"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  QrCode,
  CheckCircle2,
  School,
  Wallet,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Package,
  CreditCard,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrollmentConversion } from "@/types/admissions";
import { formatVND } from "@/lib/utils/vietqr";

/* ─── Tuition packages ─── */
const TUITION_PACKAGES = [
  { sessions: 8, pricePerSession: 220000, label: "Gói 8 buổi (Khởi động 1 tháng)", badge: "Cơ bản" },
  { sessions: 12, pricePerSession: 200000, label: "Gói 12 buổi (Phổ biến 1.5 tháng)", badge: "Khuyên dùng" },
  { sessions: 20, pricePerSession: 190000, label: "Gói 20 buổi (Tiết kiệm 2.5 tháng)", badge: "Tiết kiệm" },
  { sessions: 30, pricePerSession: 180000, label: "Gói 30 buổi (Toàn diện dài hạn)", badge: "Ưu đãi lớn" },
];

/* ─── Inline enrollment detail panel ─── */
function EnrollmentDetailPanel({
  conversion,
  onOpenVietQR,
  onOpenConvertDialog,
  onToggleDepositPaid,
}: {
  conversion: EnrollmentConversion;
  onOpenVietQR: (data: {
    studentName: string;
    className: string;
    amount: number;
    sessionsAdded: number;
    note: string;
  }) => void;
  onOpenConvertDialog: (conversion: EnrollmentConversion) => void;
  onToggleDepositPaid: (conversionId: string) => void;
}) {
  const [selectedPackageIdx, setSelectedPackageIdx] = useState(
    TUITION_PACKAGES.findIndex((p) => p.sessions === conversion.tuitionPackageSessions) >= 0
      ? TUITION_PACKAGES.findIndex((p) => p.sessions === conversion.tuitionPackageSessions)
      : 1
  );
  const [depositMode, setDepositMode] = useState<"deposit" | "full">(
    conversion.isDepositPaid ? "full" : "deposit"
  );

  const selectedPkg = TUITION_PACKAGES[selectedPackageIdx] || TUITION_PACKAGES[1];
  const totalFee = selectedPkg.sessions * selectedPkg.pricePerSession;
  const depositAmount = conversion.depositAmount || 500000;
  const payAmount = depositMode === "deposit" ? depositAmount : totalFee;

  const isConverted = conversion.status === "converted";

  return (
    <div className="p-5 space-y-4 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent border-t border-emerald-500/20 animate-in slide-in-from-top-2 duration-200">
      {isConverted ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">
                Đã hoàn tất chuyển đổi thành học viên chính thức!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đã tự động tạo hồ sơ học sinh, ghi hóa đơn và mở ví số dư buổi học.
              </p>
            </div>
          </div>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-bold text-primary hover:bg-muted transition-colors shadow-xs"
          >
            <span>Xem hồ sơ học sinh</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Cột 1: Chọn gói buổi đăng ký */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                1. Chọn gói buổi đăng ký học
              </label>
              <span className="text-[11px] text-muted-foreground font-semibold">
                Lớp: <strong className="text-foreground">{conversion.className}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TUITION_PACKAGES.map((pkg, idx) => {
                const isSelected = selectedPackageIdx === idx;
                const pkgTotal = pkg.sessions * pkg.pricePerSession;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPackageIdx(idx)}
                    className={`text-left p-3 rounded-xl border transition-all duration-150 relative ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/15 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
                        : "border-border/70 hover:border-border hover:bg-muted/40 bg-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {pkg.sessions} buổi
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {pkg.badge}
                      </span>
                    </div>

                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatVND(pkgTotal)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {formatVND(pkg.pricePerSession)}/buổi
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trạng thái cọc hiện tại */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tình trạng cọc:</span>
                {conversion.isDepositPaid ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận cọc {formatVND(depositAmount)}
                  </span>
                ) : (
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    ⏳ Chưa nhận cọc
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleDepositPaid(conversion.id)}
                className="h-7 text-[11px] font-semibold"
              >
                {conversion.isDepositPaid ? "Đánh dấu chưa cọc" : "Xác nhận đã cọc"}
              </Button>
            </div>
          </div>

          {/* Cột 2: Thu phí & VietQR & Kích hoạt 1 chạm */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              2. Phương thức & Chốt thanh toán
            </label>

            {/* Toggle Đặt cọc / Toàn phần */}
            <div className="flex rounded-xl border border-border/80 overflow-hidden bg-muted/40 p-1 gap-1">
              <button
                type="button"
                onClick={() => setDepositMode("deposit")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  depositMode === "deposit"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                💰 Đặt cọc giữ chỗ ({formatVND(depositAmount)})
              </button>
              <button
                type="button"
                onClick={() => setDepositMode("full")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  depositMode === "full"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🎯 Học phí toàn phần ({formatVND(totalFee)})
              </button>
            </div>

            {/* Hộp số tiền thanh toán */}
            <div className="p-3.5 rounded-xl bg-card border border-border/80 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Số tiền cần thu qua VietQR
                </span>
                <span className="text-[11px] text-primary font-bold">
                  {depositMode === "deposit"
                    ? "Tiền cọc giữ chỗ lớp"
                    : `Học phí toàn phần (${selectedPkg.sessions} buổi)`}
                </span>
              </div>
              <div className="text-xl font-black text-foreground">
                {formatVND(payAmount)}
              </div>
            </div>

            {/* Action Buttons: VietQR + 1-Chạm Convert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Nút VietQR */}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onOpenVietQR({
                    studentName: conversion.studentName,
                    className: conversion.className,
                    amount: payAmount,
                    sessionsAdded: depositMode === "full" ? selectedPkg.sessions : 0,
                    note:
                      depositMode === "deposit"
                        ? `Coc hoc phi ${conversion.studentName} lop ${conversion.className}`
                        : `Hoc phi ${conversion.studentName} lop ${conversion.className}`,
                  })
                }
                className="h-10 text-xs font-bold gap-2 border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10 hover:border-blue-500 transition-all shadow-xs"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Tạo mã VietQR Napas 247</span>
              </Button>

              {/* Nút 1-Chạm Chuyển đổi */}
              <Button
                type="button"
                onClick={() => onOpenConvertDialog(conversion)}
                className="h-10 text-xs font-extrabold gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Thanh toán & Hoàn tất (1 Chạm)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Button>
            </div>

            {/* Cơ chế kích hoạt 1 chạm caption */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-200">
              <Zap className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>
                <strong>Cơ chế 1 chạm:</strong> Tự động tạo hồ sơ học sinh, ghi nhận hóa đơn và mở ví buổi mà không cần nhập lại bất kỳ thông tin nào.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Status config ─── */
const CONVERSION_STATUS_CONFIG = {
  pending_deposit: {
    label: "Chờ cọc",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    icon: "⏳",
  },
  deposited: {
    label: "Đã chốt cọc",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold",
    icon: "💰",
  },
  converted: {
    label: "Đã ghi danh chính thức",
    className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-extrabold",
    icon: "🎓",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-muted text-muted-foreground border-border",
    icon: "🚫",
  },
};

/* ─── Main ConversionsTab ─── */
interface ConversionsTabProps {
  conversions: EnrollmentConversion[];
  onOpenConvertDialog: (conversion: EnrollmentConversion) => void;
  onOpenVietQR: (data: {
    studentName: string;
    className: string;
    amount: number;
    sessionsAdded: number;
    note: string;
  }) => void;
  onToggleDepositPaid: (conversionId: string) => void;
}

export function ConversionsTab({
  conversions,
  onOpenConvertDialog,
  onOpenVietQR,
  onToggleDepositPaid,
}: ConversionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredConversions = useMemo(() => {
    return conversions.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.parentPhone.includes(searchTerm) ||
        c.className.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [conversions, searchTerm, statusFilter]);

  const totalDeposited = useMemo(
    () =>
      conversions
        .filter((c) => c.isDepositPaid)
        .reduce((sum, c) => sum + (c.depositAmount || 0), 0),
    [conversions]
  );
  const totalConverted = useMemo(
    () => conversions.filter((c) => c.status === "converted").length,
    [conversions]
  );
  const totalTuition = useMemo(
    () =>
      conversions
        .filter((c) => c.status === "converted")
        .reduce((sum, c) => sum + (c.tuitionFee || 0), 0),
    [conversions]
  );

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tổng hồ sơ ghi danh
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-foreground">
              {conversions.length}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">hồ sơ</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tiền cọc đã thu (Napas 247)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {formatVND(totalDeposited)}
            </span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Học viên chính thức (tổng học phí)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-primary">{totalConverted}</span>
            <span className="text-xs text-muted-foreground font-semibold">em •</span>
            <span className="text-sm font-bold text-emerald-600">{formatVND(totalTuition)}</span>
          </div>
        </div>
      </div>

      {/* 1-click info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/25">
        <Zap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          <strong>Cơ chế kích hoạt 1 chạm:</strong> Nhấn "Thanh toán & Hoàn tất" sẽ tự động tạo hồ sơ học sinh, ghi nhận vào Lịch sử hóa đơn và mở ví buổi Tài chính học viên — không cần nhập lại bất kỳ thông tin nào.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT phụ huynh, lớp đăng ký..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending_deposit">⏳ Chờ cọc</option>
            <option value="deposited">💰 Đã chốt cọc</option>
            <option value="converted">🎓 Đã ghi danh chính thức</option>
          </select>
        </div>
      </div>

      {/* Conversions Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Học sinh & Phụ huynh
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Lớp học chính thức
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Gói học phí
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Trạng thái chuyển đổi
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3 text-right">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground text-xs"
                >
                  Không có học viên nào trong danh sách ghi danh.
                </TableCell>
              </TableRow>
            ) : (
              filteredConversions.map((conv) => {
                const statusCfg =
                  CONVERSION_STATUS_CONFIG[conv.status] ||
                  CONVERSION_STATUS_CONFIG.pending_deposit;
                const isExpanded = expandedRow === conv.id;
                const isConverted = conv.status === "converted";

                return (
                  <>
                    <TableRow
                      key={conv.id}
                      className={`group hover:bg-muted/30 transition-colors ${
                        isConverted ? "opacity-75" : ""
                      }`}
                    >
                      {/* Học sinh & PH */}
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground">
                            {conv.studentName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <span>PH: {conv.parentName}</span>
                            <span>•</span>
                            <span className="text-primary font-medium">
                              {conv.parentPhone}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Lớp học */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <School className="w-3.5 h-3.5 text-primary shrink-0" />
                          {conv.className}
                        </div>
                      </TableCell>

                      {/* Gói học phí */}
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground">
                            {formatVND(conv.tuitionFee)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {conv.tuitionPackageSessions} buổi học
                          </span>
                          {conv.isDepositPaid ? (
                            <Badge
                              variant="outline"
                              className="w-fit mt-1 text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold"
                            >
                              ✓ Đã thu cọc {formatVND(conv.depositAmount)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="w-fit mt-1 text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            >
                              Cọc: {formatVND(conv.depositAmount)} — Chưa thu
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 flex w-fit items-center gap-1 ${statusCfg.className}`}
                        >
                          <span>{statusCfg.icon}</span>
                          {statusCfg.label}
                        </Badge>
                        {isConverted && conv.convertedAt && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(conv.convertedAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 text-right">
                        {isConverted ? (
                          <span className="text-xs text-muted-foreground italic">Hoàn tất</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : conv.id)
                            }
                            className={`h-8 text-xs gap-1.5 font-bold transition-all ${
                              isExpanded
                                ? "border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                                : "hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-300"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Chốt phễu
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded enrollment detail */}
                    {isExpanded && (
                      <TableRow key={`${conv.id}-detail`}>
                        <TableCell
                          colSpan={5}
                          className="p-0 bg-emerald-500/3 border-b border-emerald-500/20"
                        >
                          <EnrollmentDetailPanel
                            conversion={conv}
                            onOpenVietQR={onOpenVietQR}
                            onOpenConvertDialog={onOpenConvertDialog}
                            onToggleDepositPaid={onToggleDepositPaid}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[11px] text-muted-foreground px-1">
        Hiển thị <strong>{filteredConversions.length}</strong> / {conversions.length} hồ sơ ghi danh
      </p>
    </div>
  );
}
