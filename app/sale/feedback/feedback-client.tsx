"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FeedbackTicket,
  FeedbackCategory,
  FeedbackStatus,
  Student,
} from "@/types/database";
import { FeedbackKpiStats } from "@/lib/actions/feedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateFeedbackDialog } from "@/components/sale/create-feedback-dialog";
import { UpdateFeedbackStatusDialog } from "@/components/sale/update-feedback-status-dialog";
import { MessageSquareWarning, Plus, Phone } from "lucide-react";

interface FeedbackClientProps {
  initialTickets: FeedbackTicket[];
  stats: FeedbackKpiStats;
  students: Student[];
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  teaching_quality: "Chất lượng giảng dạy",
  schedule: "Lịch học",
  tuition: "Học phí",
  facility: "Cơ sở vật chất",
  other: "Khác",
};

function getStatusBadge(status: FeedbackStatus) {
  switch (status) {
    case "new":
      return (
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200">
          Mới tiếp nhận
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200">
          Đang xử lý
        </Badge>
      );
    case "resolved":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200">
          Đã xử lý
        </Badge>
      );
  }
}

export function FeedbackClient({ initialTickets, stats, students }: FeedbackClientProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);

  const handleRefresh = () => router.refresh();

  const filteredTickets = useMemo(() => {
    return initialTickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [initialTickets, statusFilter, categoryFilter]);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Tổng số phản ánh</span>
          <div className="text-2xl font-black text-foreground mt-1.5">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-blue-200 dark:border-blue-900/50 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Mới tiếp nhận</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">{stats.newCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Đang xử lý</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {stats.inProgressCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Đã xử lý</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {stats.resolvedCount}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="new">Mới tiếp nhận</SelectItem>
            <SelectItem value="in_progress">Đang xử lý</SelectItem>
            <SelectItem value="resolved">Đã xử lý</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[190px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phân loại</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => setCreateOpen(true)}
          className="ml-auto text-xs font-bold gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tiếp nhận Phản ánh mới
        </Button>
      </div>

      {/* Danh sách */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-12 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <MessageSquareWarning className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Chưa có phản ánh/góp ý nào {statusFilter !== "all" || categoryFilter !== "all" ? "khớp bộ lọc" : ""}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-xs flex items-start justify-between gap-4 flex-wrap hover:shadow-md transition-shadow"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">{t.contact_name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {t.contact_phone}
                  </span>
                  {t.student && (
                    <Badge variant="outline" className="text-xs font-normal">
                      HS: {t.student.full_name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-normal">
                    {CATEGORY_LABELS[t.category]}
                  </Badge>
                  {getStatusBadge(t.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.content}</p>
                {t.resolution_note && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 italic">
                    Đã xử lý: {t.resolution_note}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/70">
                  {new Date(t.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <Button
                size="sm"
                variant={t.status === "resolved" ? "outline" : "default"}
                className="text-xs shrink-0"
                onClick={() => {
                  setSelectedTicket(t);
                  setUpdateOpen(true);
                }}
              >
                {t.status === "resolved" ? "Xem lại" : "Xử lý"}
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateFeedbackDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        students={students}
        onSuccess={handleRefresh}
      />

      <UpdateFeedbackStatusDialog
        ticket={selectedTicket}
        open={updateOpen}
        onOpenChange={(open) => {
          setUpdateOpen(open);
          if (!open) setSelectedTicket(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
