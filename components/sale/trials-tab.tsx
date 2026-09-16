"use client";

import { useState } from "react";
import { Lead, TrialSlot, LeadTrial } from "@/types/database";
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
import { TrialSlotDialog } from "@/components/sale/trial-slot-dialog";
import { ScheduleTrialDialog } from "@/components/sale/schedule-trial-dialog";
import { TrialAssessmentDialog } from "@/components/sale/trial-assessment-dialog";
import { TrialSlotQrDialog } from "@/components/sale/trial-slot-qr-dialog";
import { SendEntranceTestDialog } from "@/components/sale/send-entrance-test-dialog";
import { rolloverTrialSlot } from "@/lib/actions/admissions";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  RotateCw,
  Award,
  Sparkles,
  Loader2,
  QrCode,
  ClipboardList,
} from "lucide-react";

interface TrialsTabProps {
  leads: Lead[];
  trialSlots: TrialSlot[];
  onRefresh: () => void;
  onStartConversion?: (lead: Lead) => void;
}

export function TrialsTab({
  leads,
  trialSlots,
  onRefresh,
  onStartConversion,
}: TrialsTabProps) {
  const [createSlotOpen, setCreateSlotOpen] = useState(false);
  const [scheduleTrialLead, setScheduleTrialLead] = useState<Lead | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [assessmentTrial, setAssessmentTrial] = useState<
    (LeadTrial & { leadName?: string; leadPhone?: string; slotName?: string }) | null
  >(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [rolloverLoadingId, setRolloverLoadingId] = useState<string | null>(null);

  const [qrSlot, setQrSlot] = useState<TrialSlot | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const [testLead, setTestLead] = useState<Lead | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);


  // Lọc các lead đang ở stage = 'trial' hoặc có trials — LOẠI TRỪ Lead đã
  // Chính thức (enrolled/waiting_class): Lead có thể chốt đơn thẳng mà không
  // quay lại chấm điểm ca học thử cũ, nếu không loại trừ sẽ còn hiện nút
  // "Chấm điểm"/"Chốt học" cho học sinh đã xong việc — bấm nhầm "Chốt học"
  // lần nữa có thể tạo trùng hồ sơ học sinh/hóa đơn (Server Action đã chặn ở
  // tầng sau, nhưng vẫn phải sửa tận gốc để không hiện nút gây nhầm lẫn).
  const trialLeads = leads.filter(
    (l) =>
      l.stage !== "enrolled" &&
      l.stage !== "waiting_class" &&
      (l.stage === "trial" || (l.trials && l.trials.length > 0))
  );

  const handleRollover = async (slotId: string) => {
    setRolloverLoadingId(slotId);
    try {
      const res = await rolloverTrialSlot(slotId);
      if (res?.error) {
        alert(res.error);
        return;
      }
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi khi mở đợt mới");
    } finally {
      setRolloverLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: CÁC CA HỌC THỬ CỐ ĐỊNH */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Các Ca Học Thử Cố Định (Lặp lại theo tuần)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý sĩ số theo từng đợt (Batch rollover). Khi ca đầy có thể mở đợt tiếp theo.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setCreateSlotOpen(true)}
            className="text-xs font-bold gap-1 h-8 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo ca học thử mới
          </Button>
        </div>

        {trialSlots.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Chưa có ca học thử nào</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nhấn &quot;Tạo ca học thử mới&quot; để thiết lập lịch học thử định kỳ!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trialSlots.map((slot) => {
              const regCount = slot.registered_count || 0;
              const isFull = regCount >= slot.max_students;
              const percent = Math.min(100, Math.round((regCount / slot.max_students) * 100));

              return (
                <div
                  key={slot.id}
                  className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-3 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground text-xs leading-tight">
                        {slot.subject}
                      </h3>
                      <Badge
                        variant={isFull ? "destructive" : "outline"}
                        className="text-[11px] shrink-0 font-bold"
                      >
                        {isFull ? "Kín chỗ" : `Đợt ${slot.batch_number}`}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Clock className="w-3 h-3 text-primary" />
                        {slot.day_of_week} • {slot.time_slot}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>GV: {slot.teacher_name || "Chưa phân công"}</span>
                        {slot.room && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {slot.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sĩ số progress bar */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> Sĩ số đã đăng ký
                      </span>
                      <span className="font-bold text-foreground">
                        {regCount}/{slot.max_students}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-rose-500" : percent > 70 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions: QR điểm danh + Rollover */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7 px-2 text-primary border-primary/30 hover:bg-primary/5 gap-1"
                      onClick={() => {
                        setQrSlot(slot);
                        setQrOpen(true);
                      }}
                      title="Xem/in mã QR điểm danh của ca học thử này"
                    >
                      <QrCode className="w-3 h-3" />
                      Mã QR
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground gap-1"
                      disabled={rolloverLoadingId === slot.id}
                      onClick={() => handleRollover(slot.id)}
                      title="Mở đợt mới tiếp theo và lưu trữ đợt cũ"
                    >
                      {rolloverLoadingId === slot.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RotateCw className="w-3 h-3" />
                      )}
                      Mở đợt {slot.batch_number + 1}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DANH SÁCH HỌC SINH ĐANG HỌC THỬ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Danh Sách Học Sinh Học Thử &amp; Chấm Điểm ({trialLeads.length})
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Theo dõi tình trạng tham gia, đánh giá năng lực đầu vào và chuyển đổi sang chốt đơn.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
                <TableHead className="font-bold">Học sinh &amp; SĐT</TableHead>
                <TableHead className="font-bold">Phụ trách</TableHead>
                <TableHead className="font-bold">Ca học thử đăng ký</TableHead>
                <TableHead className="font-bold">Ngày dự kiến</TableHead>
                <TableHead className="font-bold">Điểm &amp; Xếp loại</TableHead>
                <TableHead className="font-bold">Đánh giá / Nhận xét</TableHead>
                <TableHead className="text-right font-bold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Chưa có học sinh học thử</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hãy vào tab &quot;Leads&quot; để xếp lịch học thử cho khách hàng!
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trialLeads.map((lead) => {
                  const trials = lead.trials || [];
                  const latestTrial = trials[trials.length - 1];

                  return (
                    <TableRow key={lead.id} className="text-xs hover:bg-muted/30">
                      <TableCell>
                        <div className="font-bold text-foreground">{lead.full_name}</div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {lead.phone}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-semibold text-foreground">
                          {lead.assigned_sale?.full_name || "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {trials.length === 0 ? (
                          <span className="text-muted-foreground italic">Chưa chọn ca</span>
                        ) : (
                          <div className="space-y-1">
                            {trials.map((t) => (
                              <div key={t.id} className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[11px]">
                                  {t.slot?.subject || "Học thử"}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                  ({t.slot?.day_of_week} {t.slot?.time_slot})
                                </span>
                                {t.checked_in_at ? (
                                  <span className="text-[11px] font-semibold text-emerald-600">✓ Đã điểm danh</span>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">Chưa điểm danh</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {latestTrial?.trial_date
                          ? new Date(latestTrial.trial_date).toLocaleDateString("vi-VN")
                          : "Theo lịch ca"}
                      </TableCell>

                      <TableCell>
                        {latestTrial?.score !== null && latestTrial?.score !== undefined ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground text-sm">
                              {latestTrial.score} đ
                            </span>
                            <div>
                              <Badge
                                className={
                                  latestTrial.result === "excellent"
                                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-200 text-[11px]"
                                    : latestTrial.result === "good"
                                    ? "bg-blue-500/15 text-blue-600 border-blue-200 text-[11px]"
                                    : "bg-amber-500/15 text-amber-600 border-amber-200 text-[11px]"
                                }
                              >
                                {latestTrial.result === "excellent" && "Xuất sắc"}
                                {latestTrial.result === "good" && "Khá / Tốt"}
                                {latestTrial.result === "average" && "Đạt"}
                                {latestTrial.result === "weak" && "Yếu"}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Chưa chấm điểm</span>
                        )}
                      </TableCell>

                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {latestTrial?.evaluation || lead.note || "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {latestTrial && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                              onClick={() => {
                                setAssessmentTrial({
                                  ...latestTrial,
                                  leadName: lead.full_name,
                                  leadPhone: lead.phone,
                                  slotName: latestTrial.slot?.subject,
                                });
                                setAssessmentOpen(true);
                              }}
                            >
                              <Award className="w-3 h-3" />
                              Chấm điểm
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => {
                              setTestLead(lead);
                              setTestDialogOpen(true);
                            }}
                            title="Gửi bài test đầu vào tự làm cho học sinh"
                          >
                            <ClipboardList className="w-3 h-3" />
                            Gửi test
                          </Button>

                          <Button
                            size="sm"
                            className="text-xs h-7 px-2 font-bold gap-1 bg-gradient-to-r from-primary to-indigo-600 text-white"
                            onClick={() => onStartConversion?.(lead)}
                          >
                            <Sparkles className="w-3 h-3" />
                            Chốt học
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
      </div>

      {/* Dialogs */}
      <TrialSlotDialog
        open={createSlotOpen}
        onOpenChange={setCreateSlotOpen}
        onSuccess={onRefresh}
      />

      <ScheduleTrialDialog
        lead={scheduleTrialLead}
        trialSlots={trialSlots}
        open={scheduleOpen}
        onOpenChange={(isOpen) => {
          setScheduleOpen(isOpen);
          if (!isOpen) setScheduleTrialLead(null);
        }}
        onSuccess={onRefresh}
      />

      <TrialAssessmentDialog
        trial={assessmentTrial}
        open={assessmentOpen}
        onOpenChange={(isOpen) => {
          setAssessmentOpen(isOpen);
          if (!isOpen) setAssessmentTrial(null);
        }}
        onSuccess={onRefresh}
      />

      <TrialSlotQrDialog
        slot={qrSlot}
        open={qrOpen}
        onOpenChange={(isOpen) => {
          setQrOpen(isOpen);
          if (!isOpen) setQrSlot(null);
        }}
      />

      <SendEntranceTestDialog
        lead={testLead}
        open={testDialogOpen}
        onOpenChange={(isOpen) => {
          setTestDialogOpen(isOpen);
          if (!isOpen) setTestLead(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}
