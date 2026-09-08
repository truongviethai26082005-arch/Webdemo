"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  AlertTriangle,
  Users,
  Layers,
  UserX,
  RotateCcw,
  Sparkles,
  School,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  TrialClass,
  TrialStatus,
  Lead,
  DEFAULT_FIXED_TRIAL_SLOTS,
  FixedTrialSlot,
  isStudentInTrialSlot,
  TrialRegistration,
} from "@/types/admissions";

function getCleanTrialName(className: string, teacherName?: string): string {
  if (!className) return "";
  let name = className.trim().replace(/^[•\-\*]\s*/, "");
  
  if (name.includes("(Sáng T7)")) {
    name = name.replace("(Sáng T7)", "(Cô Emily)");
  }

  if (!name.includes("(") && teacherName && teacherName !== "Chưa phân công") {
    name = `${name} (${teacherName})`;
  }
  
  return name;
}

const SOURCE_LABELS: Record<string, string> = {
  facebook_ads: "Facebook Ads",
  fanpage: "Fanpage",
  zalo: "Zalo OA",
  referral: "Người quen giới thiệu",
  walkin: "Vãng lai / Trực tiếp",
  hotline: "Hotline",
  other: "Nguồn khác",
};

const TRIAL_STATUS_CONFIG: Record<
  TrialStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Đã xếp lịch",
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 font-semibold",
  },
  attended: {
    label: "Đã tham gia",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 font-bold",
  },
  absent: {
    label: "Vắng mặt",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 font-medium",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

/* ─── Modal 1: Chọn lớp học thử cố định (Capacity Check Max 20/30) ─── */
interface RegisterTrialSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  trials: TrialClass[];
  onSave: (updated: TrialClass) => void;
}

/* ─── Modal 1: Chọn lớp học thử cố định (Capacity Check Max 20/30) ─── */
interface RegisterTrialSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  trials: TrialClass[];
  onSave: (updated: TrialClass) => void;
}

function RegisterTrialSlotModal({
  isOpen,
  onClose,
  trial,
  trials,
  onSave,
}: RegisterTrialSlotModalProps) {
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const slotOccupancy = useMemo(() => {
    const map: Record<string, number> = {};
    DEFAULT_FIXED_TRIAL_SLOTS.forEach((slot) => {
      const count = trials.filter((t) => isStudentInTrialSlot(t, slot)).length;
      map[slot.id] = count;
    });
    return map;
  }, [trials]);

  useEffect(() => {
    if (trial) {
      if (trial.trialRegistrations && trial.trialRegistrations.length > 0) {
        setSelectedClassIds(trial.trialRegistrations.map((r) => r.trialClassId));
      } else {
        const matched = DEFAULT_FIXED_TRIAL_SLOTS.find(
          (s) => (trial.trialClassId && s.id === trial.trialClassId) || s.className === trial.className
        );
        setSelectedClassIds(matched ? [matched.id] : [DEFAULT_FIXED_TRIAL_SLOTS[0]?.id || ""]);
      }
    }
  }, [trial]);

  if (!trial) return null;

  const handleToggleClass = (classId: string, isFull: boolean) => {
    if (isFull) return; // Nếu lớp đã đủ sĩ số thì chặn
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId) // Bỏ chọn nếu đã có
        : [...prev, classId]                   // Thêm vào danh sách nếu chưa có
    );
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trial || selectedClassIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 lớp học thử!");
      return;
    }

    const chosenSlots = DEFAULT_FIXED_TRIAL_SLOTS.filter((s) => selectedClassIds.includes(s.id));
    const fullSlots = chosenSlots.filter((s) => (slotOccupancy[s.id] || 0) >= s.maxCapacity);
    if (fullSlots.length > 0) {
      alert(`Lớp học thử đã đủ số lượng: ${fullSlots.map((s) => s.className).join(", ")}. Vui lòng chọn ca khác!`);
      return;
    }

    const existingRegs = trial.trialRegistrations || [];
    const updatedRegs: TrialRegistration[] = chosenSlots.map((s) => {
      const existing = existingRegs.find((r) => r.trialClassId === s.id || r.className === s.className);
      if (existing) return existing;
      return {
        trialClassId: s.id,
        className: s.className,
        schedule: s.dayTime,
        teacherName: s.teacherName,
        room: s.room,
        status: "scheduled",
      };
    });

    const primarySlot = chosenSlots[0];

    const updated: TrialClass = {
      ...trial,
      status: trial.status === "cancelled" ? "scheduled" : trial.status,
      trialClassId: primarySlot?.id,
      trialRegistrations: updatedRegs,
      targetSubject: chosenSlots.map((s) => s.subject).join(" & "),
      className: chosenSlots.map((s) => s.className).join(" & "),
      trialDate: primarySlot?.trialDate || trial.trialDate,
      startTime: primarySlot?.startTime || trial.startTime,
      endTime: primarySlot?.endTime || trial.endTime,
      room: primarySlot?.room || trial.room,
      teacherName: primarySlot?.teacherName || trial.teacherName,
    };

    onSave(updated);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-bold text-slate-900">
            Xếp ca học thử cho học sinh: {trial.leadName}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 pt-1">
            SĐT PH: {trial.parentPhone} • Đã chọn: <strong className="text-slate-800">{selectedClassIds.length} ca</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Danh sách lớp học thử cố định (Tích chọn nhiều môn)</span>
              <span className="text-[11px] text-slate-500 font-normal">Chuyên 20 / Đại trà 30</span>
            </Label>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {DEFAULT_FIXED_TRIAL_SLOTS.map((slot) => {
                const count = slotOccupancy[slot.id] || 0;
                const isFull = count >= slot.maxCapacity;
                const isChecked = selectedClassIds.includes(slot.id);

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleToggleClass(slot.id, isFull)}
                    className={`p-3 rounded-lg border transition-all ${
                      isFull
                        ? "border-rose-200 bg-rose-50/50 opacity-50 pointer-events-none cursor-not-allowed"
                        : isChecked
                        ? "border-purple-600 bg-purple-50/70 shadow-xs cursor-pointer"
                        : "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isFull}
                          readOnly
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer pointer-events-none"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {slot.className}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                            <span>{slot.dayTime}</span>
                            <span>•</span>
                            <span>{slot.room}</span>
                            <span>•</span>
                            <span>GV: {slot.teacherName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isFull ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-semibold">
                            [Đã đủ chỗ] ({count}/{slot.maxCapacity})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            Còn chỗ ({count}/{slot.maxCapacity})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 px-4 text-xs">
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={selectedClassIds.length === 0}
              className="h-8 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
            >
              Lưu {selectedClassIds.length} ca học thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 2: Tương tác khi Click vào "Điểm test" (3 mục theo đặc tả) ─── */
interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  onSave: (updated: TrialClass) => void;
}

function TestResultModal({ isOpen, onClose, trial, onSave }: TestResultModalProps) {
  const [selectedRegId, setSelectedRegId] = useState<string>("");
  const [testScore, setTestScore] = useState<string>("8");
  const [studentFeedback, setStudentFeedback] = useState<string>("");
  const [studentDesire, setStudentDesire] = useState<string>("");

  const registrations = useMemo(() => {
    if (!trial) return [];
    if (trial.trialRegistrations && trial.trialRegistrations.length > 0) {
      return trial.trialRegistrations;
    }
    return [
      {
        trialClassId: trial.trialClassId || "class-toan-9",
        className: trial.className,
        schedule: `${trial.startTime} - ${trial.endTime}`,
        testScore: trial.testScore,
        teacherFeedback: trial.teacherFeedback,
        parentFeedback: trial.parentFeedback,
        status: trial.status,
      },
    ];
  }, [trial]);

  useEffect(() => {
    if (trial && registrations.length > 0) {
      const activeReg = registrations.find((r) => r.trialClassId === selectedRegId) || registrations[0];
      if (activeReg) {
        if (!selectedRegId || !registrations.some((r) => r.trialClassId === selectedRegId)) {
          setSelectedRegId(activeReg.trialClassId);
        }
        setTestScore(activeReg.testScore !== undefined ? String(activeReg.testScore) : "8");
        setStudentFeedback(activeReg.teacherFeedback || "Bé theo kịp bài giảng, hiểu bài tốt và hòa đồng với bạn bè.");
        setStudentDesire(activeReg.parentFeedback?.startsWith("Lý do:") ? "" : activeReg.parentFeedback || "Bé mong muốn đăng ký học chính thức.");
      }
    }
  }, [trial, selectedRegId, registrations]);

  if (!trial) return null;

  const currentReg = registrations.find((r) => r.trialClassId === selectedRegId) || registrations[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trial) return;
    const numScore = parseFloat(testScore) || 0;

    const targetId = selectedRegId || registrations[0]?.trialClassId;

    const updatedRegs: TrialRegistration[] = registrations.map((r) => {
      if (r.trialClassId === targetId || r.className === targetId) {
        return {
          ...r,
          status: "attended" as TrialStatus,
          testScore: numScore,
          teacherFeedback: studentFeedback.trim() || undefined,
          parentFeedback: studentDesire.trim() || undefined,
        };
      }
      return r;
    });

    const updated: TrialClass = {
      ...trial,
      status: "attended",
      testScore: numScore,
      teacherFeedback: studentFeedback.trim() || undefined,
      parentFeedback: studentDesire.trim() || undefined,
      trialRegistrations: updatedRegs,
      nextStep: "convert",
    };

    onSave(updated);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-bold text-slate-900">
            Kết quả & Nguyện vọng sau ca học thử
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 pt-0.5">
            Học sinh: <strong className="text-slate-800">{trial.leadName}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Tab chọn môn học thử nếu học sinh có nhiều môn */}
        {registrations.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-b pb-2.5">
            {registrations.map((reg) => {
              const isSelected = selectedRegId === reg.trialClassId;
              return (
                <button
                  key={reg.trialClassId}
                  type="button"
                  onClick={() => setSelectedRegId(reg.trialClassId)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {reg.className.split("(")[0].trim()} ({reg.testScore !== undefined ? `${reg.testScore}/10` : "Chưa test"})
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block">Đang nhập điểm cho môn:</span>
            <strong className="text-slate-900 text-sm">{currentReg?.className}</strong>
          </div>

          {/* Mục 1: Điểm test đầu vào */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              1. Điểm test đầu vào (Thang điểm 10)
            </Label>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={testScore}
                onChange={(e) => setTestScore(e.target.value)}
                placeholder="VD: 8"
                className="h-9 font-bold text-slate-900 text-sm pl-3 pr-10"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                /10
              </span>
            </div>
          </div>

          {/* Mục 2: Ghi chú phản hồi của học sinh sau ca học */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              2. Ghi chú phản hồi của học sinh sau ca học
            </Label>
            <textarea
              rows={3}
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              placeholder="Nhập nhận xét & cảm nhận của học sinh sau khi học thử..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 font-normal leading-relaxed resize-none"
            />
          </div>

          {/* Mục 3: Nguyện vọng của học sinh sau ca học thử */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              3. Nguyện vọng của học sinh sau ca học thử
            </Label>
            <textarea
              rows={2}
              value={studentDesire}
              onChange={(e) => setStudentDesire(e.target.value)}
              placeholder="VD: Học sinh muốn đăng ký học chính thức lớp Thầy Dũng tuần tới..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 font-normal leading-relaxed resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 px-4 text-xs">
              Hủy
            </Button>
            <Button type="submit" size="sm" className="h-8 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
              Lưu kết quả
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 3: Ghi nhận Vắng mặt ─── */
interface AbsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  onSave: (updated: TrialClass) => void;
}

function AbsentModal({ isOpen, onClose, trial, onSave }: AbsentModalProps) {
  const [reason, setReason] = useState<string>("Phụ huynh bận đột xuất");

  if (!trial) return null;

  const quickReasons = [
    "Bé bị ốm đột xuất",
    "Phụ huynh bận đột xuất",
    "Trùng lịch học thêm ở trường",
    "Quên lịch / Không nghe máy",
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trial) return;
    const updated: TrialClass = {
      ...trial,
      status: "absent",
      parentFeedback: `Lý do: ${reason.trim() || "Phụ huynh bận đột xuất"}`,
    };

    onSave(updated);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-bold text-slate-900">
            Báo vắng mặt học thử
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 pt-0.5">
            Học sinh: <strong className="text-slate-800">{trial.leadName}</strong> ({trial.className})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Lý do không tham gia:
            </Label>

            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-[11px] px-2.5 py-1 rounded border transition-all ${
                    reason === r
                      ? "bg-rose-50 text-rose-700 border-rose-300 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Phụ huynh báo bé bị sốt đột xuất, xin dời lịch..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 font-normal resize-none"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 px-4 text-xs">
              Hủy
            </Button>
            <Button type="submit" size="sm" className="h-8 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white">
              Đánh dấu Vắng mặt & Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 4: Xem danh sách học sinh đã đăng ký trong 1 Lớp ─── */
interface ClassStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: FixedTrialSlot | null;
  trials: TrialClass[];
  leads?: Lead[];
  onSave?: (updated: TrialClass) => void;
}

function ClassStudentsModal({
  isOpen,
  onClose,
  slot,
  trials,
  leads = [],
  onSave,
}: ClassStudentsModalProps) {
  if (!slot) return null;

  const enrolledTrials = useMemo(() => {
    if (!slot) return [];
    return trials.filter((t) => isStudentInTrialSlot(t, slot));
  }, [slot, trials]);

  function handleToggleAttendance(t: TrialClass) {
    const isAttended = t.status === "attended";
    const newStatus: TrialStatus = isAttended ? "absent" : "attended";
    
    const updated: TrialClass = {
      ...t,
      status: newStatus,
      testScore: newStatus === "attended" ? (t.testScore ?? 8) : t.testScore,
      parentFeedback: newStatus === "absent" ? "Lý do: Vắng mặt" : (t.parentFeedback || "Đã điểm danh tham gia ca học thử"),
      nextStep: newStatus === "attended" ? "convert" : t.nextStep,
    };

    if (onSave) {
      onSave(updated);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-slate-800" />
              <DialogTitle className="text-base font-bold text-slate-900">
                Danh sách học sinh đăng ký — {slot.className}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              GV: <strong className="text-slate-800">{slot.teacherName}</strong> • {slot.dayTime} • {slot.room} • Sĩ số:{" "}
              <strong className="text-purple-700">{enrolledTrials.length}/{slot.maxCapacity} học sinh</strong>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="pt-3 space-y-4">
          {enrolledTrials.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Hiện chưa có học sinh nào đăng ký ca học thử này.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[12%] text-center">STT</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[38%]">Tên học sinh</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[25%]">Số điện thoại</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[25%] text-right">Điểm danh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledTrials.map((t, idx) => {
                    const isAttended = t.status === "attended";
                    return (
                      <TableRow key={t.id} className="hover:bg-slate-50/70 border-b border-slate-100 text-xs">
                        <TableCell className="text-center font-mono font-bold text-slate-500 py-3">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-slate-900 py-3">{t.leadName}</TableCell>
                        <TableCell className="font-mono text-slate-700 font-medium py-3">
                          {t.parentPhone}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          {isAttended ? (
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(t)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                              title="Click để dời sang Vắng mặt"
                            >
                              <span>✅ Có mặt</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(t)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-xs font-medium hover:bg-rose-100 transition-all cursor-pointer"
                              title="Click để Điểm danh Có mặt"
                            >
                              <span>Vắng mặt</span>
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 px-4 text-xs font-semibold">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 5: Xác nhận Xóa học sinh khỏi lịch học thử ─── */
interface DeleteTrialConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  onConfirmDelete: (trialId: string) => void;
}

function DeleteTrialConfirmModal({
  isOpen,
  onClose,
  trial,
  onConfirmDelete,
}: DeleteTrialConfirmModalProps) {
  if (!trial) return null;

  function handleConfirm() {
    if (!trial) return;
    onConfirmDelete(trial.id);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 bg-rose-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Xác nhận xóa học sinh khỏi lịch học thử
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa học sinh <strong className="text-slate-900">{trial.leadName}</strong> khỏi danh sách học thử không?
          </p>
          <p className="text-xs text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            💡 Nếu học sinh đã có lịch, sĩ số của lớp tương ứng sẽ được tự động giảm đi 1 chỗ.
          </p>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 px-4 text-xs font-medium">
            Hủy bỏ
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            className="h-8 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main TrialsTab Component ─── */
interface TrialsTabProps {
  trials: TrialClass[];
  leads?: Lead[];
  onOpenScheduleTrial: () => void;
  onOpenAssessment: (trial: TrialClass) => void;
  onMoveToConversion: (trial: TrialClass) => void;
  onUpdateTrialStatus: (trialId: string, status: TrialStatus) => void;
  onSaveAssessment: (trial: TrialClass) => void;
  onDeleteTrial?: (trialId: string) => void;
}

export function TrialsTab({
  trials,
  leads = [],
  onOpenScheduleTrial,
  onOpenAssessment,
  onMoveToConversion,
  onUpdateTrialStatus,
  onSaveAssessment,
  onDeleteTrial,
}: TrialsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Scroll ref for horizontal slider
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal control states
  const [registerModalTrial, setRegisterModalTrial] = useState<TrialClass | null>(null);
  const [testResultModalTrial, setTestResultModalTrial] = useState<TrialClass | null>(null);
  const [absentTrial, setAbsentTrial] = useState<TrialClass | null>(null);
  const [selectedClassModalSlot, setSelectedClassModalSlot] = useState<FixedTrialSlot | null>(null);
  const [deleteConfirmTrial, setDeleteConfirmTrial] = useState<TrialClass | null>(null);

  // Real-time capacity occupancy per fixed trial slot
  const slotOccupancy = useMemo(() => {
    const map: Record<string, number> = {};
    DEFAULT_FIXED_TRIAL_SLOTS.forEach((slot) => {
      const count = trials.filter((t) => isStudentInTrialSlot(t, slot)).length;
      map[slot.id] = count;
    });
    return map;
  }, [trials]);

  const filteredTrials = useMemo(() => {
    return trials.filter((t) => {
      const matchSearch =
        !searchTerm ||
        t.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.parentPhone.includes(searchTerm) ||
        t.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trials, searchTerm, statusFilter]);

  // Scroll handlers
  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  }

  // Counts per status
  const unassignedCount = trials.filter(
    (t) => t.trialDate === "Chờ xếp lịch" || t.className.includes("Chưa xếp")
  ).length;
  const attendedCount = trials.filter((t) => t.status === "attended").length;
  const absentCount = trials.filter((t) => t.status === "absent").length;

  return (
    <div className="space-y-4">
      {/* ─── Khối "LỚP HỌC THỬ" dạng Carousel Horizontal Scroll ─── */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              LỚP HỌC THỬ
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
              Sức chứa: Lớp Nâng cao 20 HS / Lớp Đại trà 30 HS
            </span>
            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                title="Cuộn qua trái"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                title="Cuộn qua phải"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slider Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scroll-smooth snap-x my-1"
        >
          {DEFAULT_FIXED_TRIAL_SLOTS.map((slot) => {
            const count = slotOccupancy[slot.id] || 0;
            const isFull = count >= slot.maxCapacity;
            const percentage = Math.min(100, Math.round((count / slot.maxCapacity) * 100));

            return (
              <div
                key={slot.id}
                onClick={() => setSelectedClassModalSlot(slot)}
                className={`min-w-[280px] max-w-[310px] shrink-0 snap-start p-3 rounded-xl border bg-white transition-all cursor-pointer group hover:border-blue-400 hover:shadow-md ${
                  isFull ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
                }`}
                title="Click để xem danh sách học sinh đã đăng ký"
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      {slot.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {slot.className}
                    </span>
                  </div>
                  {isFull ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold shrink-0">
                      [Đã đủ số lượng]
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold shrink-0">
                      [Còn chỗ]
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium mb-2 flex items-center justify-between">
                  <span>{slot.dayTime} • {slot.room}</span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {count}/{slot.maxCapacity}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isFull ? "bg-rose-500" : percentage >= 80 ? "bg-amber-500" : "bg-slate-800"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT, lớp học thử, giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs border-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã xếp lịch</option>
            <option value="attended">Đã tham gia</option>
            <option value="absent">Vắng mặt</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <Button
          onClick={onOpenScheduleTrial}
          size="sm"
          className="h-8 font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Xếp lịch học thử mới
        </Button>
      </div>

      {/* ─── 5-Column Clean SaaS Table ─── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[160px]">
                Học sinh & Lớp test
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[210px]">
                Ca học thử
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[120px]">
                Trạng thái
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[150px]">
                Điểm test (Click để xem)
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 text-right min-w-[200px]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredTrials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-slate-500 text-xs"
                >
                  Không tìm thấy lịch học thử nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrials.map((trial) => {
                const statusCfg =
                  TRIAL_STATUS_CONFIG[trial.status] ||
                  TRIAL_STATUS_CONFIG.scheduled;

                const isUnassigned =
                  trial.trialDate === "Chờ xếp lịch" ||
                  trial.className.includes("Chưa xếp");

                return (
                  <TableRow
                    key={trial.id}
                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100"
                  >
                    {/* Cột 1: Học sinh & Lớp test */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-900">
                          {trial.leadName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {trial.targetSubject}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cột 2: Ca học thử */}
                    <TableCell className="py-3">
                      {isUnassigned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRegisterModalTrial(trial)}
                          className="h-7 text-xs px-2.5 font-medium text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-md cursor-pointer"
                          title="Nhấp để xếp lịch ca học thử"
                        >
                          Xếp lịch
                        </Button>
                      ) : (
                        <div
                          onClick={() => setRegisterModalTrial(trial)}
                          className="cursor-pointer group flex flex-col gap-1.5 text-left"
                          title="Nhấp vào để đổi hoặc thêm ca học thử khác"
                        >
                          {trial.trialRegistrations && trial.trialRegistrations.length > 0 ? (
                            trial.trialRegistrations.map((reg, idx) => {
                              const cleanName = getCleanTrialName(reg.className, reg.teacherName);
                              return (
                                <div key={idx} className="flex flex-col text-left">
                                  <span className="text-sm font-medium text-slate-800 group-hover:text-purple-600 transition-colors">
                                    {cleanName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-normal">
                                    {reg.schedule} {reg.room ? `• ${reg.room}` : ""}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-medium text-slate-800 group-hover:text-purple-600 transition-colors">
                                {getCleanTrialName(trial.className, trial.teacherName)}
                              </span>
                              <span className="text-[11px] text-slate-500 font-normal">
                                {trial.startTime} - {trial.endTime} {trial.room ? `• ${trial.room}` : "• P.201"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Cột 3: Trạng thái */}
                    <TableCell className="py-3">
                      {isUnassigned ? (
                        <span className="text-xs font-medium text-slate-400">
                          Chưa xếp lịch
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Cột 4: Điểm test (Hiển thị chi tiết từng môn) */}
                    <TableCell className="py-3">
                      <div
                        onClick={() => setTestResultModalTrial(trial)}
                        className="cursor-pointer flex flex-col gap-1"
                        title="Click để nhập hoặc xem chi tiết điểm test & nguyện vọng"
                      >
                        {trial.trialRegistrations && trial.trialRegistrations.length > 0 ? (
                          trial.trialRegistrations.map((reg, idx) => (
                            <div key={idx} className="text-xs flex items-center gap-1 hover:underline">
                              <span className="text-slate-500 font-medium">{reg.className.split("(")[0].trim()}:</span>
                              {reg.testScore !== undefined ? (
                                <span className="font-bold text-blue-600 underline">{reg.testScore}/10</span>
                              ) : (
                                <span className="text-slate-400 font-normal">Chưa test</span>
                              )}
                            </div>
                          ))
                        ) : trial.status === "attended" && trial.testScore !== undefined ? (
                          <span className="font-semibold text-xs text-blue-600 underline hover:text-blue-800">
                            {trial.testScore}/10 (Xem chi tiết)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
                            -
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Cột 5: Hành động */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Đã có ít nhất 1 điểm test / Đã tham gia ➔ Hiển thị [✨ Chuyển sang Ghi danh ➔] */}
                        {trial.status === "attended" ||
                        trial.testScore !== undefined ||
                        (trial.trialRegistrations &&
                          trial.trialRegistrations.some(
                            (r) => r.testScore !== undefined || r.status === "attended"
                          )) ? (
                          <Button
                            size="sm"
                            onClick={() => onMoveToConversion(trial)}
                            className="h-7 text-xs px-3 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-md shadow-2xs"
                            title="Đẩy thẳng hồ sơ sang Quy trình 3: Ghi danh & Chốt phí"
                          >
                            <span>✨ Chuyển sang Ghi danh ➔</span>
                          </Button>
                        ) : trial.status === "absent" || trial.status === "cancelled" ? (
                          /* 2. Đã báo vắng ➔ Hiển thị nút [🔄 Xếp lại ca khác] */
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRegisterModalTrial(trial)}
                            className="h-7 text-xs px-2.5 font-medium text-slate-700 border-slate-300 hover:bg-slate-100 rounded-md"
                            title="Xếp lại ca học thử mới"
                          >
                            🔄 Xếp lại ca khác
                          </Button>
                        ) : (
                          /* 3. Chưa test / Chưa tham gia ➔ Cột Hành động hiển thị nút [Báo vắng] */
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAbsentTrial(trial)}
                            className="h-7 text-xs px-2.5 font-medium text-rose-700 border-rose-200 hover:bg-rose-50 rounded-md"
                            title="Đánh dấu học sinh vắng mặt buổi học thử"
                          >
                            Báo vắng
                          </Button>
                        )}

                        {/* Nút [🗑️ Xóa] học sinh khỏi lịch học thử */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTrial(trial)}
                          className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer border border-transparent hover:border-rose-200"
                          title="Xóa học sinh khỏi danh sách học thử"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[11px] text-slate-500 px-1">
        Hiển thị <strong>{filteredTrials.length}</strong> / {trials.length} lịch học thử
      </p>

      {/* Modals */}
      <RegisterTrialSlotModal
        isOpen={!!registerModalTrial}
        onClose={() => setRegisterModalTrial(null)}
        trial={registerModalTrial}
        trials={trials}
        onSave={(updated) => {
          onSaveAssessment(updated);
        }}
      />

      <TestResultModal
        isOpen={!!testResultModalTrial}
        onClose={() => setTestResultModalTrial(null)}
        trial={testResultModalTrial}
        onSave={onSaveAssessment}
      />

      <AbsentModal
        isOpen={!!absentTrial}
        onClose={() => setAbsentTrial(null)}
        trial={absentTrial}
        onSave={onSaveAssessment}
      />

      <ClassStudentsModal
        isOpen={!!selectedClassModalSlot}
        onClose={() => setSelectedClassModalSlot(null)}
        slot={selectedClassModalSlot}
        trials={trials}
        leads={leads}
        onSave={onSaveAssessment}
      />

      <DeleteTrialConfirmModal
        isOpen={!!deleteConfirmTrial}
        onClose={() => setDeleteConfirmTrial(null)}
        trial={deleteConfirmTrial}
        onConfirmDelete={(trialId) => {
          if (onDeleteTrial) {
            onDeleteTrial(trialId);
          }
        }}
      />
    </div>
  );
}
