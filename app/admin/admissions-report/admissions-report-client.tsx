"use client";

import {
  Users,
  TrendingUp,
  GraduationCap,
  Wallet,
  Clock,
  MessageSquareWarning,
  CheckCircle2,
  Hourglass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils/vietqr";
import type { AdmissionsKpiStats, AdmissionsReportData, WaitingListStudentItem } from "@/lib/actions/admissions";
import type { FeedbackKpiStats } from "@/lib/actions/feedback";
import type { LeadSource } from "@/types/database";

interface AdmissionsReportClientProps {
  kpiStats: AdmissionsKpiStats;
  reportData: AdmissionsReportData;
  waitingList: WaitingListStudentItem[];
  feedbackStats: FeedbackKpiStats;
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  facebook_ads: "Facebook Ads",
  fanpage: "Fanpage",
  zalo: "Zalo",
  referral: "Giới thiệu",
  walkin: "Khách vãng lai",
  hotline: "Hotline",
  other: "Khác",
};

function KpiCard({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string | number; sub?: string; tone: string }) {
  return (
    <Card className="border border-border/80 bg-card shadow-soft rounded-2xl">
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground truncate">{label}</p>
          <p className="text-xl font-black text-foreground">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdmissionsReportClient({ kpiStats, reportData, waitingList, feedbackStats }: AdmissionsReportClientProps) {
  return (
    <div className="space-y-6">
      {/* KPI tổng quan phễu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Tổng Lead (toàn thời gian)" value={kpiStats.totalLeads} tone="bg-primary/10 text-primary" />
        <KpiCard icon={GraduationCap} label="Đã ghi danh" value={kpiStats.enrolledCount} tone="bg-emerald-500/10 text-emerald-600" />
        <KpiCard icon={Hourglass} label="Đã đóng tiền, chờ xếp lớp" value={kpiStats.waitingClassCount} tone="bg-amber-500/10 text-amber-600" />
        <KpiCard icon={TrendingUp} label="Tỷ lệ chuyển đổi" value={`${kpiStats.conversionRate}%`} tone="bg-blue-500/10 text-blue-600" />
      </div>

      {/* Doanh thu + hiệu suất 30 ngày gần nhất */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl">
        <CardHeader className="p-5 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            Hiệu suất Tuyển sinh — 30 ngày gần nhất ({reportData.dateFrom} → {reportData.dateTo})
          </CardTitle>
          <CardDescription className="text-xs">
            Doanh thu tính từ hóa đơn đã thanh toán của các Lead tạo trong khoảng thời gian này.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Lead mới</p>
            <p className="text-lg font-black text-foreground">{reportData.totalLeads}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Đã chuyển đổi</p>
            <p className="text-lg font-black text-foreground">{reportData.totalConverted} ({reportData.overallRate}%)</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Tổng doanh thu</p>
            <p className="text-lg font-black text-emerald-600">{formatVND(reportData.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">TB / Lead chốt</p>
            <p className="text-lg font-black text-foreground">{formatVND(reportData.avgRevenuePerConverted)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Theo nguồn khách hàng + theo nhân viên Sale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold">Theo nguồn khách hàng</CardTitle>
          </CardHeader>
          {reportData.bySource.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground text-center">Chưa có dữ liệu trong khoảng thời gian này.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nguồn</TableHead>
                  <TableHead className="text-xs text-center">Lead</TableHead>
                  <TableHead className="text-xs text-center">Chốt</TableHead>
                  <TableHead className="text-xs text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.bySource.map((s) => (
                  <TableRow key={s.source}>
                    <TableCell className="text-xs font-semibold">{SOURCE_LABELS[s.source] || s.source}</TableCell>
                    <TableCell className="text-xs text-center font-mono">{s.total}</TableCell>
                    <TableCell className="text-xs text-center font-mono">{s.converted} ({s.rate}%)</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatVND(s.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold">Theo nhân viên Tuyển sinh</CardTitle>
          </CardHeader>
          {reportData.bySalesperson.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground text-center">Chưa có dữ liệu trong khoảng thời gian này.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nhân viên</TableHead>
                  <TableHead className="text-xs text-center">Lead</TableHead>
                  <TableHead className="text-xs text-center">Chốt</TableHead>
                  <TableHead className="text-xs text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.bySalesperson.map((s) => (
                  <TableRow key={s.saleId}>
                    <TableCell className="text-xs font-semibold">{s.saleName}</TableCell>
                    <TableCell className="text-xs text-center font-mono">{s.total}</TableCell>
                    <TableCell className="text-xs text-center font-mono">{s.converted} ({s.rate}%)</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatVND(s.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Danh sách chờ xếp lớp */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Học sinh đã đóng tiền, đang chờ xếp lớp ({waitingList.length})
          </CardTitle>
          <CardDescription className="text-[11px]">
            Vào "Quản lý Lớp học" để xếp học sinh vào lớp phù hợp khi đã sẵn sàng.
          </CardDescription>
        </CardHeader>
        {waitingList.length === 0 ? (
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
              {waitingList.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs font-semibold">{w.fullName}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{w.parentPhone}</TableCell>
                  <TableCell className="text-xs">{w.targetClassName || "—"}</TableCell>
                  <TableCell className="text-xs text-center font-mono">{w.paidSessions}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatVND(w.paidAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Phản ánh & Góp ý */}
      <Card className="border border-border/80 bg-card shadow-soft rounded-2xl">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-rose-600" />
            Phản ánh & Góp ý (Sale tiếp nhận)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Mới</p>
            <p className="text-lg font-black text-rose-600">{feedbackStats.newCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Đang xử lý</p>
            <p className="text-lg font-black text-amber-600">{feedbackStats.inProgressCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Đã xử lý
            </p>
            <p className="text-lg font-black text-emerald-600">{feedbackStats.resolvedCount}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Đây là báo cáo tổng hợp CHỈ XEM — quản lý chi tiết từng Lead/hóa đơn/phản ánh do bộ phận Tuyển sinh phụ trách.
      </p>
    </div>
  );
}
