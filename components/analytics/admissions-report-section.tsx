"use client";

import {
  Clock,
  MessageSquareWarning,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import type { AdmissionsKpiStats, WaitingListStudentItem } from "@/lib/actions/admissions";
import type { FeedbackKpiStats } from "@/lib/actions/feedback";
import { AdmissionsFunnelCard } from "./admissions-funnel-card";

export interface AdmissionsReportSectionProps {
  kpiStats?: AdmissionsKpiStats | null;
  waitingList?: WaitingListStudentItem[] | null;
  feedbackStats?: FeedbackKpiStats | null;
}

export function AdmissionsReportSection({
  kpiStats,
  waitingList = [],
  feedbackStats,
}: AdmissionsReportSectionProps) {
  const safeWaitingList = waitingList || [];
  const safeFeedback = feedbackStats || { newCount: 0, inProgressCount: 0, resolvedCount: 0, totalCount: 0 };

  return (
    <div className="space-y-6">
      {/* Header Phễu tuyển sinh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Phễu Tuyển Sinh &amp; Tỷ Lệ Chuyển Đổi
            </h3>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5"
            >
              Tổng hợp từ Sale
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Báo cáo hiệu suất chuyển đổi tuyển sinh, danh sách học sinh chờ xếp lớp và tiếp nhận phản ánh
          </p>
        </div>
      </div>

      {/* 1. Biểu đồ Phễu chuyển đổi Tuyển sinh (Funnel Chart 3 tầng) */}
      <AdmissionsFunnelCard stats={kpiStats} />

      {/* 2. Khối Học sinh đã đóng tiền, đang chờ xếp lớp */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Học sinh đã đóng tiền, đang chờ xếp lớp ({safeWaitingList.length})
          </CardTitle>
          <CardDescription className="text-[11px]">
            Học sinh đã hoàn tất học phí nhưng chưa được xếp vào lớp học. Vào "Học sinh &amp; Xếp lớp" hoặc "Quản lý Lớp học" để phân lớp khi sẵn sàng.
          </CardDescription>
        </CardHeader>
        {safeWaitingList.length === 0 ? (
          <p className="p-5 text-xs text-muted-foreground text-center">Không có học sinh nào đang chờ xếp lớp.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Học sinh</TableHead>
                <TableHead className="text-xs">SĐT phụ huynh</TableHead>
                <TableHead className="text-xs">Lớp quan tâm</TableHead>
                <TableHead className="text-xs text-center">Số buổi đã đóng</TableHead>
                <TableHead className="text-xs text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeWaitingList.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs font-semibold">{w.fullName}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{w.parentPhone}</TableCell>
                  <TableCell className="text-xs">{w.targetClassName || "—"}</TableCell>
                  <TableCell className="text-xs text-center font-mono">{w.paidSessions}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-semibold text-emerald-600">
                    {formatVND(w.paidAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* 3. Khối Phản ánh & Góp ý (Sale tiếp nhận) */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-rose-600" />
            Phản ánh &amp; Góp ý (Sale tiếp nhận)
          </CardTitle>
          <CardDescription className="text-[11px]">
            Tổng hợp tình trạng xử lý các phản ánh, góp ý từ phụ huynh/học sinh do bộ phận Tuyển sinh ghi nhận.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <p className="text-[11px] text-muted-foreground font-semibold">Mới</p>
            <p className="text-lg font-black text-rose-600 mt-0.5">{safeFeedback.newCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-[11px] text-muted-foreground font-semibold">Đang xử lý</p>
            <p className="text-lg font-black text-amber-600 mt-0.5">{safeFeedback.inProgressCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[11px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xử lý
            </p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">{safeFeedback.resolvedCount}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground text-center pt-1">
        Đây là báo cáo tổng hợp CHỈ XEM dành cho Quản trị viên — thao tác chi tiết từng Lead/lịch thử/phản ánh thuộc thẩm quyền phân hệ Tuyển sinh.
      </p>
    </div>
  );
}
