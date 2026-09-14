"use client";

import { useState } from "react";
import { Lead, LeadSource, LeadStage, LeadStatus } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateLeadDialog } from "@/components/sale/create-lead-dialog";
import { LeadDetailDrawer } from "@/components/sale/lead-detail-drawer";
import {
  Search,
  UserPlus,
  Phone,
  MessageSquare,
  Eye,
  Calendar,
  Sparkles,
  PhoneMissed,
  Filter,
} from "lucide-react";

interface LeadsTabProps {
  leads: Lead[];
  onRefresh: () => void;
  onScheduleTrial?: (lead: Lead) => void;
  onStartConversion?: (lead: Lead) => void;
}

export function LeadsTab({
  leads,
  onRefresh,
  onScheduleTrial,
  onStartConversion,
}: LeadsTabProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Client filtering
  const filteredLeads = leads.filter((lead) => {
    if (stageFilter !== "all" && lead.stage !== stageFilter) return false;
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = lead.full_name.toLowerCase().includes(q);
      const matchPhone = lead.phone.toLowerCase().includes(q);
      const matchParent = lead.parent_name?.toLowerCase().includes(q);
      const matchCourse = lead.course_interest?.toLowerCase().includes(q);
      return matchName || matchPhone || matchParent || matchCourse;
    }

    return true;
  });

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200">Mới nhận</Badge>;
      case "contacted":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200">Đã liên hệ</Badge>;
      case "callback":
        return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200">Hẹn gọi lại</Badge>;
      case "no_demand":
        return <Badge variant="destructive" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200">Không nhu cầu</Badge>;
      case "converted":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200">Đã chốt học</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStageBadge = (stage: LeadStage) => {
    switch (stage) {
      case "inquiry":
        return <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">1. Đang tư vấn</span>;
      case "trial":
        return <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">2. Học thử</span>;
      case "conversion":
        return <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">3. Chờ chốt đơn</span>;
      case "enrolled":
        return <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">✓ Đã vào lớp</span>;
      case "waiting_class":
        return <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">⏳ Chờ xếp lớp</span>;
      default:
        return <span className="text-[11px]">{stage}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT, phụ huynh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 rounded-xl">
              <SelectValue placeholder="Giai đoạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giai đoạn</SelectItem>
              <SelectItem value="inquiry">1. Tư vấn</SelectItem>
              <SelectItem value="trial">2. Học thử</SelectItem>
              <SelectItem value="conversion">3. Chờ chốt</SelectItem>
              <SelectItem value="enrolled">Đã vào lớp</SelectItem>
              <SelectItem value="waiting_class">Chờ xếp lớp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 rounded-xl">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="new">Mới nhận</SelectItem>
              <SelectItem value="contacted">Đã liên hệ</SelectItem>
              <SelectItem value="callback">Hẹn gọi lại</SelectItem>
              <SelectItem value="no_demand">Không nhu cầu</SelectItem>
              <SelectItem value="converted">Đã chốt học</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 rounded-xl">
              <SelectValue placeholder="Nguồn Lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
              <SelectItem value="fanpage">Fanpage</SelectItem>
              <SelectItem value="zalo">Zalo</SelectItem>
              <SelectItem value="referral">Giới thiệu</SelectItem>
              <SelectItem value="hotline">Hotline</SelectItem>
              <SelectItem value="walkin">Trực tiếp</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="text-xs font-bold gap-1.5 h-9 rounded-xl shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Tiếp nhận Lead mới
        </Button>
      </div>

      {/* Leads Data Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
              <TableHead className="font-bold">Học sinh &amp; Phụ huynh</TableHead>
              <TableHead className="font-bold">Liên hệ &amp; Zalo</TableHead>
              <TableHead className="font-bold">Môn học &amp; Mục tiêu</TableHead>
              <TableHead className="font-bold">Giai đoạn</TableHead>
              <TableHead className="font-bold">Trạng thái</TableHead>
              <TableHead className="font-bold">Nguồn</TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Không tìm thấy dữ liệu Lead nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const phoneDigits = lead.zalo?.replace(/\D/g, "") || lead.phone.replace(/\D/g, "");
                return (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors text-xs"
                    onClick={() => handleOpenDetail(lead)}
                  >
                    <TableCell>
                      <div className="font-bold text-foreground">{lead.full_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {lead.grade ? `${lead.grade} • ` : ""}
                        Phụ huynh: {lead.parent_name || "—"}
                      </div>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">{lead.phone}</span>
                        {lead.missed_calls_count > 0 && (
                          <span
                            title={`${lead.missed_calls_count} lần gọi nhỡ`}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded"
                          >
                            <PhoneMissed className="w-2.5 h-2.5" />
                            {lead.missed_calls_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${lead.phone}`}
                          title="Gọi điện"
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          <Phone className="w-3 h-3" /> Gọi
                        </a>
                        <a
                          href={`https://zalo.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat Zalo"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          <MessageSquare className="w-3 h-3" /> Zalo
                        </a>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {lead.course_interest || "Chưa xác định"}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {lead.target_goal || "—"}
                      </div>
                    </TableCell>

                    <TableCell>{getStageBadge(lead.stage)}</TableCell>

                    <TableCell>{getStatusBadge(lead.status)}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal uppercase">
                        {lead.source}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.stage === "inquiry" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={() => onScheduleTrial?.(lead)}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Học thử
                          </Button>
                        )}

                        {(lead.stage === "trial" || lead.stage === "conversion") && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-2 font-bold bg-primary text-primary-foreground gap-1"
                            onClick={() => onStartConversion?.(lead)}
                          >
                            <Sparkles className="w-3 h-3" />
                            Chốt đơn
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleOpenDetail(lead)}
                          title="Xem chi tiết &amp; Nhật ký"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Lead Modal */}
      <CreateLeadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          onRefresh();
        }}
      />

      {/* Lead Detail & CRM Interaction Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={(isOpen) => {
          setDrawerOpen(isOpen);
          if (!isOpen) setSelectedLead(null);
        }}
        onSuccess={() => {
          onRefresh();
        }}
        onScheduleTrial={onScheduleTrial}
        onStartConversion={onStartConversion}
      />
    </div>
  );
}
