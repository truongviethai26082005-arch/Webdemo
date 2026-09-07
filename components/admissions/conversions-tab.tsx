"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  Phone,
  School,
  Wallet,
  ArrowRight,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrollmentConversion } from "@/types/admissions";
import { formatVND } from "@/lib/utils/vietqr";

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

  // Statistics
  const totalDeposited = useMemo(() => {
    return conversions
      .filter((c) => c.isDepositPaid)
      .reduce((sum, c) => sum + (c.depositAmount || 0), 0);
  }, [conversions]);

  const totalConverted = useMemo(() => {
    return conversions.filter((c) => c.status === "converted").length;
  }, [conversions]);

  return (
    <div className="space-y-4">
      {/* Top Conversion Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tổng học viên chốt cọc / Ghi danh
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-foreground">{conversions.length}</span>
            <span className="text-xs text-muted-foreground font-semibold">hồ sơ</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tiền cọc giữ chỗ đã thu (Napas 247)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {formatVND(totalDeposited)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Đã chuyển đổi thành học viên chính thức
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-primary">{totalConverted}</span>
            <span className="text-xs text-muted-foreground font-semibold">em đã vào lớp</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
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
            <option value="all">Tất cả trạng thái ghi danh</option>
            <option value="pending_deposit">Chờ cọc</option>
            <option value="deposited">Đã chốt cọc</option>
            <option value="converted">Đã chuyển thành học viên chính thức</option>
          </select>
        </div>
      </div>

      {/* Conversion Table */}
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
                Gói học phí đăng ký
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Tiền cọc & Thanh toán
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Trạng thái chuyển đổi
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3 text-right">
                Hành động chốt phễu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                  Không có học viên nào trong danh sách ghi danh & chốt cọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredConversions.map((conv) => {
                const isConverted = conv.status === "converted";

                return (
                  <TableRow key={conv.id} className="group hover:bg-muted/30 transition-colors">
                    {/* Học sinh & PH */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">
                          {conv.studentName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                          <span>PH: {conv.parentName}</span>
                          <span>•</span>
                          <span className="text-primary font-medium">{conv.parentPhone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Lớp học */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <School className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{conv.className}</span>
                      </div>
                    </TableCell>

                    {/* Gói học phí */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">
                          {formatVND(conv.tuitionFee)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Gói {conv.tuitionPackageSessions} buổi học
                        </span>
                      </div>
                    </TableCell>

                    {/* Tiền cọc */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {formatVND(conv.depositAmount)}
                          </span>
                          {conv.isDepositPaid ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold">
                              Đã thu cọc
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                              Chưa thu
                            </Badge>
                          )}
                        </div>

                        {/* Nút VietQR */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            onOpenVietQR({
                              studentName: conv.studentName,
                              className: conv.className,
                              amount: conv.isDepositPaid ? conv.tuitionFee : conv.depositAmount,
                              sessionsAdded: conv.isDepositPaid ? conv.tuitionPackageSessions : 0,
                              note: conv.isDepositPaid
                                ? `Hoc phi ${conv.studentName} lop ${conv.className}`
                                : `Coc hoc phi ${conv.studentName} lop ${conv.className}`,
                            })
                          }
                          className="h-6 w-fit text-[11px] px-1.5 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 p-0"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Tạo VietQR Napas 247</span>
                        </Button>
                      </div>
                    </TableCell>

                    {/* Trạng thái chuyển đổi */}
                    <TableCell className="py-3">
                      {isConverted ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã thành học viên chính thức
                          </Badge>
                          <Link
                            href="/admin/students"
                            className="text-[11px] text-primary font-medium hover:underline flex items-center gap-0.5"
                          >
                            Xem trên hồ sơ học sinh
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold">
                          Sẵn sàng chuyển đổi
                        </Badge>
                      )}
                    </TableCell>

                    {/* Hành động chốt phễu */}
                    <TableCell className="py-3 text-right">
                      {isConverted ? (
                        <span className="text-xs text-muted-foreground italic">
                          Đã hoàn tất chuyển đổi
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onOpenConvertDialog(conv)}
                          className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>1-Click Chuyển đổi</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
