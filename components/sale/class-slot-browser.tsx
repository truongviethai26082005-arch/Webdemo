"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Users,
  MapPin,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClassSlotInfo } from "@/lib/actions/admissions";
import type { Lead, TrialSlot } from "@/types/database";
import { ScheduleTrialDialog } from "@/components/sale/schedule-trial-dialog";

interface ClassSlotBrowserProps {
  classSlots: ClassSlotInfo[];
  /** Danh sách Lead để chọn khi xếp học thử */
  leads: Lead[];
  trialSlots: TrialSlot[];
  onRefresh?: () => void;
}

const DAY_LABELS: Record<string, string> = {
  T2: "Thứ 2",
  T3: "Thứ 3",
  T4: "Thứ 4",
  T5: "Thứ 5",
  T6: "Thứ 6",
  T7: "Thứ 7",
  CN: "CN",
};
const DAY_KEYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type StatusFilter = "all" | "available" | "almost_full" | "full";

function AvailabilityBar({ enrolled, max }: { enrolled: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((enrolled / max) * 100)) : 0;
  const color =
    pct >= 100
      ? "bg-rose-500"
      : pct >= 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          Đã ghi danh: <strong className="text-foreground">{enrolled}</strong>/{max}
        </span>
        <span
          className={cn(
            "font-bold",
            pct >= 100 ? "text-rose-600" : pct >= 80 ? "text-amber-600" : "text-emerald-600"
          )}
        >
          {max - enrolled > 0 ? `Còn ${max - enrolled} chỗ` : "Đã kín"}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ClassSlotBrowser({
  classSlots,
  leads,
  trialSlots,
  onRefresh,
}: ClassSlotBrowserProps) {
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("available");

  // State cho dialog xếp học thử
  const [scheduleLead, setScheduleLead] = useState<Lead | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  // Lead được chọn khi click "Xếp học thử" từ card lớp cụ thể
  const [selectedClass, setSelectedClass] = useState<ClassSlotInfo | null>(null);
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [leadPickerClassId, setLeadPickerClassId] = useState<string | null>(null);
  const [leadSearch, setLeadSearch] = useState("");

  const filtered = useMemo(() => {
    return classSlots.filter((cls) => {
      // Tìm kiếm tên
      if (
        search.trim() &&
        !cls.name.toLowerCase().includes(search.trim().toLowerCase()) &&
        !(cls.teacherName || "").toLowerCase().includes(search.trim().toLowerCase())
      ) {
        return false;
      }

      // Lọc theo thứ
      if (dayFilter.length > 0) {
        const classDays = cls.schedule.map((s) => s.day);
        if (!dayFilter.some((d) => classDays.includes(d))) return false;
      }

      // Lọc theo trạng thái
      if (statusFilter === "available" && cls.isFull) return false;
      if (statusFilter === "almost_full" && !cls.isAlmostFull) return false;
      if (statusFilter === "full" && !cls.isFull) return false;

      return true;
    });
  }, [classSlots, search, dayFilter, statusFilter]);

  const handleToggleDay = (day: string) => {
    setDayFilter((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleOpenLeadPicker = (cls: ClassSlotInfo) => {
    setSelectedClass(cls);
    setLeadPickerClassId(cls.id);
    setLeadSearch("");
    setShowLeadPicker(true);
  };

  const handleSelectLeadForTrial = (lead: Lead) => {
    setScheduleLead(lead);
    setShowLeadPicker(false);
    setScheduleOpen(true);
  };

  const activeLeads = leads.filter(
    (l) => l.status !== "converted" && l.status !== "no_demand"
  );

  const filteredLeadsForPicker = activeLeads.filter((l) =>
    leadSearch.trim()
      ? l.full_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.phone.includes(leadSearch)
      : true
  );

  // Stats summary
  const totalClasses = classSlots.length;
  const availableClasses = classSlots.filter((c) => !c.isFull).length;
  const almostFullClasses = classSlots.filter((c) => c.isAlmostFull).length;
  const fullClasses = classSlots.filter((c) => c.isFull).length;

  return (
    <div className="space-y-5">
      {/* Summary KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all hover:shadow-md",
            statusFilter === "all"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border bg-card"
          )}
        >
          <div className="text-lg font-black text-foreground">{totalClasses}</div>
          <div className="text-xs text-muted-foreground font-medium">Tổng số lớp</div>
        </button>

        <button
          onClick={() => setStatusFilter("available")}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all hover:shadow-md",
            statusFilter === "available"
              ? "border-emerald-400 bg-emerald-50/30"
              : "border-emerald-200 bg-card"
          )}
        >
          <div className="text-lg font-black text-emerald-600">{availableClasses}</div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Còn chỗ trống
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("almost_full")}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all hover:shadow-md",
            statusFilter === "almost_full"
              ? "border-amber-400 bg-amber-50/30"
              : "border-amber-200 bg-card"
          )}
        >
          <div className="text-lg font-black text-amber-600">{almostFullClasses}</div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Gần đầy (≤3 chỗ)
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("full")}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all hover:shadow-md",
            statusFilter === "full"
              ? "border-rose-400 bg-rose-50/20"
              : "border-rose-200 bg-card"
          )}
        >
          <div className="text-lg font-black text-rose-600">{fullClasses}</div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-500" /> Đã kín chỗ
          </div>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bộ lọc</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, môn học, giáo viên..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Day filter */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground self-center mr-1">Lọc theo thứ:</span>
          {DAY_KEYS.map((day) => (
            <button
              key={day}
              onClick={() => handleToggleDay(day)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all",
                dayFilter.includes(day)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              {DAY_LABELS[day]}
            </button>
          ))}
          {dayFilter.length > 0 && (
            <button
              onClick={() => setDayFilter([])}
              className="px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-border"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Hiển thị <strong className="text-foreground">{filtered.length}</strong> / {totalClasses} lớp
        </span>
      </div>

      {/* Grid lớp */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="font-semibold text-foreground text-sm">Không tìm thấy lớp phù hợp</div>
          <p className="text-xs text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <div
              key={cls.id}
              className={cn(
                "p-4 rounded-2xl bg-card border shadow-xs flex flex-col gap-3 transition-all hover:shadow-md",
                cls.isFull
                  ? "border-rose-200 dark:border-rose-900/40 opacity-75"
                  : cls.isAlmostFull
                  ? "border-amber-200 dark:border-amber-900/40"
                  : "border-border hover:border-primary/30"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-black text-foreground text-sm truncate">{cls.name}</div>
                  {cls.teacherName && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3" /> {cls.teacherName}
                    </div>
                  )}
                </div>
                <Badge
                  className={cn(
                    "shrink-0 text-[10px] font-extrabold",
                    cls.isFull
                      ? "bg-rose-500/15 text-rose-600 border-rose-200"
                      : cls.isAlmostFull
                      ? "bg-amber-500/15 text-amber-700 border-amber-200"
                      : "bg-emerald-500/15 text-emerald-700 border-emerald-200"
                  )}
                >
                  {cls.isFull ? "Đã kín" : cls.isAlmostFull ? "Gần đầy" : "Còn chỗ"}
                </Badge>
              </div>

              {/* Lịch học */}
              {cls.schedule.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {cls.schedule.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-[11px] font-semibold text-foreground"
                    >
                      <Calendar className="w-2.5 h-2.5 text-primary" />
                      {DAY_LABELS[s.day] || s.day} {s.start_time}–{s.end_time}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">Chưa có lịch học</span>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {cls.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {cls.room}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {cls.enrolledCount}/{cls.maxStudents}
                </span>
                <span className="font-semibold text-foreground">
                  {cls.feePerSession.toLocaleString("vi-VN")}đ/buổi
                </span>
              </div>

              {/* Thanh sĩ số */}
              <AvailabilityBar enrolled={cls.enrolledCount} max={cls.maxStudents} />

              {/* Hành động */}
              {!cls.isFull && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => handleOpenLeadPicker(cls)}
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Xếp học thử cho Lead
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lead Picker Modal */}
      {showLeadPicker && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLeadPicker(false)}
          />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5 space-y-4">
            <div>
              <div className="font-black text-foreground text-base">Chọn Lead cần xếp học thử</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Lớp: <strong>{selectedClass.name}</strong>
                {selectedClass.availableSlots > 0 && (
                  <span className="ml-1 text-emerald-600">• Còn {selectedClass.availableSlots} chỗ</span>
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="Tìm tên hoặc SĐT Lead..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              autoFocus
            />

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {filteredLeadsForPicker.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  Không tìm thấy Lead phù hợp
                </div>
              ) : (
                filteredLeadsForPicker.map((lead) => (
                  <button
                    key={lead.id}
                    className="w-full text-left px-3 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                    onClick={() => handleSelectLeadForTrial(lead)}
                  >
                    <div className="font-bold text-foreground text-xs">{lead.full_name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {lead.phone}
                      {lead.course_interest && ` • ${lead.course_interest}`}
                    </div>
                  </button>
                ))
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowLeadPicker(false)}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Schedule Trial Dialog */}
      <ScheduleTrialDialog
        lead={scheduleLead}
        trialSlots={trialSlots}
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) {
            setScheduleLead(null);
            setSelectedClass(null);
          }
        }}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
}
