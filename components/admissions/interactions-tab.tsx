"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  Filter,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InteractionLog, FeedbackSentiment, InteractionChannel } from "@/types/admissions";

interface InteractionsTabProps {
  logs: InteractionLog[];
  onOpenNewInteraction: () => void;
  onToggleLogCompleted: (logId: string) => void;
}

const CHANNEL_CONFIG: Record<InteractionChannel, { label: string; icon: string; className: string }> = {
  call: { label: "Gọi điện", icon: "📞", className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
  zalo: { label: "Zalo Chat", icon: "💬", className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20" },
  in_person: { label: "Gặp trực tiếp", icon: "🏢", className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" },
  email: { label: "Email", icon: "✉️", className: "bg-muted text-muted-foreground border-border" },
};

const SENTIMENT_CONFIG: Record<FeedbackSentiment, { label: string; className: string }> = {
  high_interest: { label: "Quan tâm cao", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold" },
  price_concern: { label: "Đắn đo học phí", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold" },
  schedule_conflict: { label: "Trùng lịch học", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold" },
  need_consult: { label: "Cần trao đổi thêm", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold" },
  other: { label: "Phản hồi khác", className: "bg-muted text-muted-foreground border-border" },
};

export function InteractionsTab({
  logs,
  onOpenNewInteraction,
  onToggleLogCompleted,
}: InteractionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const staffList = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(l.staffName));
    return Array.from(s);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !searchTerm ||
        l.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.parentPhone.includes(searchTerm) ||
        l.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.nextAction.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStaff = staffFilter === "all" || l.staffName === staffFilter;
      const matchSentiment = sentimentFilter === "all" || l.sentiment === sentimentFilter;
      const matchChannel = channelFilter === "all" || l.channel === channelFilter;

      return matchSearch && matchStaff && matchSentiment && matchChannel;
    });
  }, [logs, searchTerm, staffFilter, sentimentFilter, channelFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT, nội dung cuộc họp, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả hình thức</option>
            <option value="call">📞 Cuộc gọi thoại</option>
            <option value="zalo">💬 Tin nhắn Zalo</option>
            <option value="in_person">🏢 Gặp mặt tại TT</option>
            <option value="email">✉️ Email</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả phản hồi</option>
            <option value="high_interest">Quan tâm cao</option>
            <option value="price_concern">Đắn đo học phí</option>
            <option value="schedule_conflict">Trùng lịch học</option>
            <option value="need_consult">Cần trao đổi thêm</option>
          </select>

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
        </div>

        <Button
          onClick={onOpenNewInteraction}
          size="sm"
          className="font-bold gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ghi nhận tương tác mới
        </Button>
      </div>

      {/* Timeline View of Interaction Touchpoints */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-border/80 bg-card text-muted-foreground text-xs shadow-soft">
            Chưa có ghi chép tư vấn hoặc điểm chạm nào phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const channel = CHANNEL_CONFIG[log.channel] || CHANNEL_CONFIG.call;
            const sentiment = SENTIMENT_CONFIG[log.sentiment] || SENTIMENT_CONFIG.other;

            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft hover:border-border transition-colors space-y-3"
              >
                {/* Header: Student name, staff, time, badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base">{channel.icon}</span>
                    <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${channel.className}`}>
                      {channel.label}
                    </Badge>
                    <h4 className="text-sm font-extrabold text-foreground">{log.leadName}</h4>
                    <span className="text-xs text-muted-foreground">({log.parentPhone})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${sentiment.className}`}>
                      {sentiment.label}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {log.date}
                    </span>
                    <span className="font-semibold text-foreground text-[11px]">
                      • Tư vấn: {log.staffName}
                    </span>
                  </div>
                </div>

                {/* Content: Conversation notes & parent feedback */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground leading-relaxed">
                  <strong className="text-muted-foreground font-semibold">Nội dung trao đổi & Phản hồi phụ huynh: </strong>
                  <span>{log.content}</span>
                </div>

                {/* Next Action & Reminder */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Việc cần làm tiếp theo:
                    </span>
                    <span className="font-semibold text-foreground">{log.nextAction}</span>
                  </div>

                  {log.reminderAt && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Hẹn gọi lại: {log.reminderAt}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={log.isCompleted ? "secondary" : "outline"}
                        onClick={() => onToggleLogCompleted(log.id)}
                        className={`h-7 text-xs px-2 gap-1 ${
                          log.isCompleted ? "text-emerald-600 bg-emerald-500/15 border-emerald-500/30" : ""
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{log.isCompleted ? "Đã gọi xong" : "Đánh dấu đã xử lý"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
