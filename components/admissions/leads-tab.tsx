"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  XCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead, LeadSource, LeadStatus } from "@/types/admissions";

interface LeadsTabProps {
  leads: Lead[];
  onOpenCreateLead: () => void;
  onOpenInteraction: (leadId: string) => void;
  onOpenScheduleTrial: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => void;
}

const SOURCE_BADGES: Record<LeadSource, { label: string; className: string }> = {
  facebook_ads: {
    label: "Facebook Ads",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  fanpage: {
    label: "Fanpage nhắn tin",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  zalo: {
    label: "Zalo OA",
    className: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  },
  referral: {
    label: "Người quen giới thiệu",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
  },
  walkin: {
    label: "Vãng lai / Tờ rơi",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  hotline: {
    label: "Hotline / Web",
    className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  other: {
    label: "Nguồn khác",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const STATUS_BADGES: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: "Mới tiếp nhận",
    className: "bg-blue-500 text-white font-bold animate-pulse",
  },
  contacted: {
    label: "Đã liên hệ / Đang chăm sóc",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold",
  },
  callback: {
    label: "Hẹn gọi lại sau",
    className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold",
  },
  no_answer: {
    label: "Không nghe máy",
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
  trial_scheduled: {
    label: "Đã hẹn học thử",
    className: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 font-bold",
  },
  enrolled: {
    label: "Đã ghi danh",
    className: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold",
  },
  failed: {
    label: "Thất bại / Không học",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function LeadsTab({
  leads,
  onOpenCreateLead,
  onOpenInteraction,
  onOpenScheduleTrial,
  onUpdateLeadStatus,
}: LeadsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get distinct staff members
  const staffList = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => {
      if (l.assignedStaff) s.add(l.assignedStaff);
    });
    return Array.from(s);
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !searchTerm ||
        l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentPhone.includes(searchTerm) ||
        l.targetSubject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSource = sourceFilter === "all" || l.source === sourceFilter;
      const matchStaff = staffFilter === "all" || l.assignedStaff === staffFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;

      return matchSearch && matchSource && matchStaff && matchStatus;
    });
  }, [leads, searchTerm, sourceFilter, staffFilter, statusFilter]);

  function handleMarkFailed(lead: Lead) {
    const reason = prompt(
      `Nhập lý do thất bại cho học sinh "${lead.studentName}":`,
      "Trùng lịch / Học phí cao / Đã học nơi khác"
    );
    if (reason !== null) {
      onUpdateLeadStatus(lead.id, "failed", reason || "Không nêu lý do");
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT, phụ huynh, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả nguồn Lead</option>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="fanpage">Fanpage tin nhắn</option>
            <option value="zalo">Zalo OA</option>
            <option value="referral">Người quen giới thiệu</option>
            <option value="walkin">Vãng lai / Tờ rơi</option>
            <option value="hotline">Hotline / Website</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả tư vấn viên</option>
            {staffList.map((st) => (
              <option key={st} value={st}>
                Tư vấn: {st}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Mới tiếp nhận</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="callback">Hẹn gọi lại</option>
            <option value="no_answer">Không nghe máy</option>
            <option value="trial_scheduled">Đã hẹn học thử</option>
            <option value="enrolled">Đã ghi danh</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>

        <Button
          onClick={onOpenCreateLead}
          size="sm"
          className="font-bold gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tiếp nhận Lead mới
        </Button>
      </div>

      {/* Leads Data Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Học sinh & Phụ huynh
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Nguồn khách hàng
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Nhu cầu & Mục tiêu
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Tư vấn viên
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3">
                Trạng thái Lead
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider py-3 text-right">
                Hành động tác vụ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                  Không tìm thấy dữ liệu khách hàng tiềm năng nào phù hợp bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const sourceBadge = SOURCE_BADGES[lead.source] || SOURCE_BADGES.other;
                const statusBadge = STATUS_BADGES[lead.status] || STATUS_BADGES.new;

                return (
                  <TableRow key={lead.id} className="group hover:bg-muted/30 transition-colors">
                    {/* Học sinh & Phụ huynh */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                          <span>{lead.studentName}</span>
                          {lead.studentGrade && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {lead.studentGrade}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>PH: {lead.parentName}</span>
                          <span>•</span>
                          <a
                            href={`tel:${lead.parentPhone}`}
                            className="text-primary font-medium hover:underline flex items-center gap-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {lead.parentPhone}
                          </a>
                        </div>
                      </div>
                    </TableCell>

                    {/* Nguồn khách hàng */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className={`w-fit text-[11px] font-semibold px-2 py-0.5 ${sourceBadge.className}`}
                        >
                          {sourceBadge.label}
                        </Badge>
                        {lead.referrerName && (
                          <span className="text-[10px] text-muted-foreground italic">
                            GT: {lead.referrerName}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Nhu cầu & Mục tiêu */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">
                          {lead.targetSubject}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{lead.targetGoal}</span>
                      </div>
                    </TableCell>

                    {/* Người phụ trách */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                          {lead.assignedStaff.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {lead.assignedStaff}
                        </span>
                      </div>
                    </TableCell>

                    {/* Trạng thái Lead */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className={`w-fit text-[10px] px-2 py-0.5 ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </Badge>
                        {lead.failedReason && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 italic">
                            Lý do: {lead.failedReason}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Hành động tác vụ */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        {/* Nút thêm tương tác */}
                        <Button
                          size="sm"
                          variant="outline"
                          title="Ghi nhận nhật ký tư vấn"
                          onClick={() => onOpenInteraction(lead.id)}
                          className="h-8 text-xs px-2.5 gap-1 hover:border-primary hover:text-primary"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Tư vấn</span>
                        </Button>

                        {/* Nút chuyển học thử */}
                        {lead.status !== "enrolled" && lead.status !== "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            title="Xếp lịch học thử"
                            onClick={() => onOpenScheduleTrial(lead.id)}
                            className="h-8 text-xs px-2.5 gap-1 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Học thử</span>
                          </Button>
                        )}

                        {/* Nút báo thất bại */}
                        {lead.status !== "failed" && lead.status !== "enrolled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Đánh dấu thất bại"
                            onClick={() => handleMarkFailed(lead)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
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
