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
  Pencil,
  History,
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
  normalizeTrialStatus,
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

function formatSlotSubjectBadge(slot: FixedTrialSlot): string {
  if (!slot || !slot.subject) return "[LỚP HỌC THỬ]";
  const cleanSubject = slot.subject
    .replace(/\s*\((Chuyên sâu|Đại trà|Chuyên|Cơ bản|Nâng cao)\)/gi, "")
    .trim()
    .toUpperCase();

  const levelTag =
    slot.level === "advanced" ||
    slot.subject.toLowerCase().includes("chuyên") ||
    slot.className.toLowerCase().includes("nâng cao")
      ? "CHUYÊN SÂU"
      : "ĐẠI TRÀ";

  return `[${cleanSubject} • ${levelTag}]`;
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
  no_demand: {
    label: "Không có nhu cầu",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-300 font-semibold",
  },
};

/* ─── Modal 0: Tạo Lớp Học Thử Mới (Admin) ─── */
interface CreateTrialClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSlot: (newSlot: FixedTrialSlot) => void;
}

function CreateTrialClassModal({
  isOpen,
  onClose,
  onCreateSlot,
}: CreateTrialClassModalProps) {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("Toán");
  const [level, setLevel] = useState<"basic" | "advanced">("basic");
  const [maxCapacity, setMaxCapacity] = useState<number>(30);
  const [teacherName, setTeacherName] = useState("Thầy Nguyễn Tiến Dũng");
  const [trialDate, setTrialDate] = useState("2026-09-15");
  const [dayTime, setDayTime] = useState("Thứ 5 (18:00 - 19:30)");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [room, setRoom] = useState("P.201");

  useEffect(() => {
    if (isOpen) {
      setClassName("");
      setSubject("Toán");
      setLevel("basic");
      setMaxCapacity(30);
      setTeacherName("Thầy Nguyễn Tiến Dũng");
      setTrialDate("2026-09-15");
      setDayTime("Thứ 5 (18:00 - 19:30)");
      setStartTime("18:00");
      setEndTime("19:30");
      setRoom("P.201");
    }
  }, [isOpen]);

  const handleLevelChange = (newLevel: "basic" | "advanced") => {
    setLevel(newLevel);
    setMaxCapacity(30);
  };

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!className.trim()) {
      alert("Vui lòng nhập tên lớp học thử!");
      return;
    }

    const finalCapacity = Math.min(30, Math.max(1, Number(maxCapacity) || 30));

    const newSlot: FixedTrialSlot = {
      id: `slot-${Date.now()}`,
      className: className.trim(),
      subject: subject.trim(),
      dayTime: dayTime.trim() || `Thứ 5 (${startTime} - ${endTime})`,
      trialDate,
      startTime,
      endTime,
      teacherName,
      room,
      maxCapacity: finalCapacity,
      level,
    };

    onCreateSlot(newSlot);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6 bg-white border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200">
              🏫
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Tạo Lớp Học Thử / Test Trình Độ
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-0.5">
                Tạo ca trải nghiệm độc lập & thiết lập định mức sĩ số
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Tên lớp học thử */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">
              Tên lớp học thử *
            </Label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="VD: Toán 9 Nâng Cao - Thầy Dũng, Tiếng Anh 6 Ôn Luyện..."
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Môn học & Phân loại lớp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Môn học</Label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-background px-3 text-xs font-medium cursor-pointer"
              >
                <option value="Toán">Toán</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Vật Lý">Vật Lý</option>
                <option value="Ngữ Văn">Ngữ Văn</option>
                <option value="Hóa Học">Hóa Học</option>
                <option value="Sinh Học">Sinh Học</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Phân loại lớp (Class Level)</Label>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="level"
                    checked={level === "basic"}
                    onChange={() => handleLevelChange("basic")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Cơ bản (Đại trà)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="level"
                    checked={level === "advanced"}
                    onChange={() => handleLevelChange("advanced")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Nâng cao (Chuyên sâu)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sĩ số tối đa & Giáo viên */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Sĩ số tối đa (Max Capacity)</span>
                <span className="text-[10px] text-slate-500 font-semibold">(Tối đa 30 HS)</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="h-9 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Giáo viên phụ trách</Label>
              <select
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-background px-3 text-xs font-medium cursor-pointer"
              >
                <option value="Thầy Nguyễn Tiến Dũng">Thầy Nguyễn Tiến Dũng</option>
                <option value="Cô Trần Thị Mai">Cô Trần Thị Mai</option>
                <option value="Cô Emily Nguyễn">Cô Emily Nguyễn</option>
                <option value="Thầy Lê Văn Hùng">Thầy Lê Văn Hùng</option>
                <option value="Thầy Phạm Văn Nam">Thầy Phạm Văn Nam</option>
                <option value="Cô Nguyễn Thu Phương">Cô Nguyễn Thu Phương</option>
              </select>
            </div>
          </div>

          {/* Ngày học & Lịch ca học */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Ngày học thử</Label>
              <Input
                type="date"
                value={trialDate}
                onChange={(e) => setTrialDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Khung giờ / Ca học</Label>
              <Input
                value={dayTime}
                onChange={(e) => setDayTime(e.target.value)}
                placeholder="VD: Thứ 5 (18:00 - 19:30)"
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Phòng học */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Phòng học</Label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-background px-3 text-xs font-medium cursor-pointer"
            >
              <option value="P.102">P.102 (Tầng 1)</option>
              <option value="P.201">P.201 (Tầng 2)</option>
              <option value="P.203">P.203 (Tầng 2)</option>
              <option value="P.302">P.302 (Tầng 3)</option>
              <option value="Online Zoom">Phòng Online Zoom</option>
            </select>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
            >
              + Tạo lớp học thử
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 1: Chọn lớp học thử cố định ─── */
interface RegisterTrialSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  trials: TrialClass[];
  trialSlots?: FixedTrialSlot[];
  onSave: (updated: TrialClass) => void;
}

function RegisterTrialSlotModal({
  isOpen,
  onClose,
  trial,
  trials,
  trialSlots = DEFAULT_FIXED_TRIAL_SLOTS,
  onSave,
}: RegisterTrialSlotModalProps) {
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const activeTrialSlots = trialSlots && trialSlots.length > 0 ? trialSlots : DEFAULT_FIXED_TRIAL_SLOTS;

  const slotOccupancy = useMemo(() => {
    const map: Record<string, number> = {};
    activeTrialSlots.forEach((slot) => {
      const count = trials.filter((t) => isStudentInTrialSlot(t, slot)).length;
      map[slot.id] = count;
    });
    return map;
  }, [trials, activeTrialSlots]);

  useEffect(() => {
    if (trial) {
      if (trial.trialRegistrations && trial.trialRegistrations.length > 0) {
        setSelectedClassIds(trial.trialRegistrations.map((r) => r.trialClassId));
      } else {
        const matched = activeTrialSlots.find(
          (s) => (trial.trialClassId && s.id === trial.trialClassId) || s.className === trial.className
        );
        setSelectedClassIds(matched ? [matched.id] : [activeTrialSlots[0]?.id || ""]);
      }
    }
  }, [trial, activeTrialSlots]);

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

    const chosenSlots = activeTrialSlots.filter((s) => selectedClassIds.includes(s.id));
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
      status: "scheduled",
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
              <span>Danh sách lớp học thử (Tích chọn nhiều ca)</span>
              <span className="text-[11px] text-slate-500 font-normal">Tối đa 30 học sinh/lớp</span>
            </Label>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {activeTrialSlots.map((slot) => {
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
    const hasValidScore = numScore > 0;

    const targetId = selectedRegId || registrations[0]?.trialClassId;

    const updatedRegs: TrialRegistration[] = registrations.map((r) => {
      if (r.trialClassId === targetId || r.className === targetId) {
        return {
          ...r,
          status: (hasValidScore ? "attended" : r.status) as TrialStatus,
          testScore: hasValidScore ? numScore : undefined,
          teacherFeedback: studentFeedback.trim() || undefined,
          parentFeedback: studentDesire.trim() || undefined,
        };
      }
      return r;
    });

    const updated: TrialClass = {
      ...trial,
      status: hasValidScore ? "attended" : trial.status,
      testScore: hasValidScore ? numScore : trial.testScore,
      teacherFeedback: studentFeedback.trim() || undefined,
      parentFeedback: studentDesire.trim() || undefined,
      trialRegistrations: updatedRegs,
      nextStep: hasValidScore ? "convert" : trial.nextStep,
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

/* ─── Modal: Xác nhận không có nhu cầu / Dừng phễu ─── */
interface TrialNoDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: TrialClass | null;
  onSave: (updated: TrialClass) => void;
}

const NO_DEMAND_REASONS = [
  "Không đến học / Bỏ ca học thử",
  "Rào cản học phí (chê đắt / cần gói chia nhỏ)",
  "Trùng lịch học ở trường hoặc học môn khác",
  "Chưa hài lòng với lớp học thử / giáo viên",
  "Gia đình tạm hoãn kế hoạch học tập",
  "Khác (cho phép gõ ghi chú ngắn)",
];

function TrialNoDemandModal({ isOpen, onClose, trial, onSave }: TrialNoDemandModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(NO_DEMAND_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>("");

  useEffect(() => {
    if (trial) {
      if (trial.parentFeedback && trial.parentFeedback.startsWith("Lý do từ chối:")) {
        const fullReason = trial.parentFeedback.replace("Lý do từ chối: ", "");
        const matched = NO_DEMAND_REASONS.find((r) => fullReason.startsWith(r));
        if (matched) {
          setSelectedReason(matched);
          const extra = fullReason.slice(matched.length).replace(/^ - /, "").trim();
          setCustomNote(extra);
        } else {
          setSelectedReason(NO_DEMAND_REASONS[5] || "Khác (cho phép gõ ghi chú ngắn)");
          setCustomNote(fullReason.replace(/^Khác: /, ""));
        }
      } else {
        setSelectedReason(NO_DEMAND_REASONS[0]);
        setCustomNote("");
      }
    }
  }, [trial]);

  if (!trial) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trial) return;

    let finalReasonText = selectedReason;
    if (selectedReason.startsWith("Khác")) {
      finalReasonText = customNote.trim() ? `Khác: ${customNote.trim()}` : "Khác";
    } else if (customNote.trim()) {
      finalReasonText = `${selectedReason} - ${customNote.trim()}`;
    }

    const updated: TrialClass = {
      ...trial,
      status: "no_demand",
      parentFeedback: `Lý do từ chối: ${finalReasonText}`,
      nextStep: "failed",
    };

    onSave(updated);
    onClose();
  }

  function handleReactivate() {
    if (!trial) return;
    const updated: TrialClass = {
      ...trial,
      status: "scheduled",
      parentFeedback: undefined,
      nextStep: undefined,
    };
    onSave(updated);
    onClose();
  }

  const isAlreadyNoDemand = trial.status === "no_demand";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-slate-300 shadow-2xl animate-in zoom-in-95 duration-200">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base border border-slate-200">
              🚫
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Ghi nhận học sinh không có nhu cầu
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-0.5">
                Học sinh: <strong className="text-slate-800">{trial.leadName}</strong> ({trial.parentPhone})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-800">
              Chọn nhanh lý do từ chối / Dừng phễu *
            </Label>
            <div className="space-y-1.5">
              {NO_DEMAND_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "border-slate-400 bg-slate-100 font-semibold text-slate-900 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-normal"
                  }`}
                >
                  <input
                    type="radio"
                    name="no_demand_reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 text-slate-700 focus:ring-slate-500"
                  />
                  <span className="leading-snug">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-800">
              Ghi chú thêm (nếu có):
            </Label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Gõ chi tiết lý do từ chối hoặc ghi chú chăm sóc lại sau..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 font-normal leading-relaxed resize-none"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t">
            {isAlreadyNoDemand ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReactivate}
                className="h-9 px-3 text-xs font-semibold text-purple-700 border-purple-300 hover:bg-purple-50 cursor-pointer"
                title="Kích hoạt lại học sinh và đưa về trạng thái Đã xếp lịch"
              >
                🔄 Kích hoạt chăm sóc lại
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
              >
                Xác nhận dừng phễu
              </Button>
            </div>
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
    const newStatus: TrialStatus = isAttended ? "scheduled" : "attended";
    
    const updated: TrialClass = {
      ...t,
      status: newStatus,
      testScore: newStatus === "attended" ? (t.testScore ?? 8) : undefined,
      parentFeedback: newStatus === "attended" ? (t.parentFeedback || "Đã điểm danh tham gia ca học thử") : undefined,
      nextStep: newStatus === "attended" ? "convert" : undefined,
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
                              title="Click để chuyển về Đã xếp lịch"
                            >
                              <span>✅ Đã tham gia</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(t)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium hover:bg-purple-100 transition-all cursor-pointer"
                              title="Click để Điểm danh Đã tham gia"
                            >
                              <span>Đã xếp lịch</span>
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

/* ─── Modal 6: Chỉnh sửa thông tin Lớp Học Thử (Admin) ─── */
interface EditTrialClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: FixedTrialSlot | null;
  onSaveSlot: (updatedSlot: FixedTrialSlot) => void;
}

function EditTrialClassModal({
  isOpen,
  onClose,
  slot,
  onSaveSlot,
}: EditTrialClassModalProps) {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("Toán");
  const [level, setLevel] = useState<"basic" | "advanced">("basic");
  const [maxCapacity, setMaxCapacity] = useState<number>(30);
  const [teacherName, setTeacherName] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [dayTime, setDayTime] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    if (slot && isOpen) {
      setClassName(slot.className);
      setSubject(slot.subject);
      setLevel(slot.level || "basic");
      setMaxCapacity(slot.maxCapacity || 30);
      setTeacherName(slot.teacherName);
      setTrialDate(slot.trialDate);
      setDayTime(slot.dayTime);
      setRoom(slot.room);
    }
  }, [slot, isOpen]);

  if (!slot || !isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return;
    if (!className.trim()) {
      alert("Vui lòng nhập tên lớp học thử!");
      return;
    }

    const finalCapacity = Math.min(30, Math.max(1, Number(maxCapacity) || 30));

    const updated: FixedTrialSlot = {
      ...slot,
      className: className.trim(),
      subject: subject.trim(),
      level,
      maxCapacity: finalCapacity,
      teacherName: teacherName.trim(),
      trialDate,
      dayTime: dayTime.trim(),
      room: room.trim(),
    };

    onSaveSlot(updated);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6 bg-white border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-200">
              ✏️
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Chỉnh sửa Lớp Học Thử: {slot.className}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-0.5">
                Cập nhật phòng học, giáo viên, ca học hoặc sĩ số tối đa
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Tên lớp học thử *</Label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Môn học</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Phân loại lớp</Label>
              <div className="flex items-center gap-2 pt-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="editLevel"
                    checked={level === "basic"}
                    onChange={() => setLevel("basic")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Cơ bản (Đại trà)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="editLevel"
                    checked={level === "advanced"}
                    onChange={() => setLevel("advanced")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Nâng cao (Chuyên sâu)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Sĩ số tối đa</span>
                <span className="text-[10px] text-slate-500">(Tối đa 30 HS)</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="h-9 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Giáo viên phụ trách</Label>
              <Input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Ngày học thử</Label>
              <Input
                type="date"
                value={trialDate}
                onChange={(e) => setTrialDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Khung giờ / Ca học</Label>
              <Input
                value={dayTime}
                onChange={(e) => setDayTime(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">Phòng học</Label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-semibold">
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-5 text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 7: Cảnh báo Không thể Xóa Lớp (Khi Sĩ số > 0) ─── */
interface DeleteSlotAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: FixedTrialSlot | null;
  count: number;
}

function DeleteSlotAlertModal({
  isOpen,
  onClose,
  slot,
  count,
}: DeleteSlotAlertModalProps) {
  if (!slot || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-rose-300 shadow-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 bg-rose-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Không thể xóa lớp học thử!
              </DialogTitle>
              <DialogDescription className="text-xs text-rose-600 font-semibold pt-0.5">
                Lớp học đang có học sinh xếp lịch
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed">
            Lớp <strong className="text-slate-900">{slot.className}</strong> (Đợt {slot.currentBatch || 1}) hiện đang có{" "}
            <strong className="text-rose-600 font-bold font-mono">{count} học sinh</strong> xếp lịch tham gia.
          </p>
          <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
            💡 Vui lòng dời hoặc hủy lịch của các học sinh này sang ca học khác trước khi thực hiện xóa ca học thử!
          </p>
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-9 px-5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
          >
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 8: Xác nhận Xóa Lớp Học Thử (Khi Sĩ số = 0) ─── */
interface DeleteSlotConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: FixedTrialSlot | null;
  onConfirmDelete: (slotId: string) => void;
}

function DeleteSlotConfirmModal({
  isOpen,
  onClose,
  slot,
  onConfirmDelete,
}: DeleteSlotConfirmModalProps) {
  if (!slot || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-slate-300 shadow-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 bg-rose-100 rounded-xl">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Xác nhận xóa lớp học thử
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-0.5">
                Xóa ca trải nghiệm khỏi hệ thống
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed">
            Bạn có chắc chắn muốn xóa lớp học thử <strong className="text-slate-900">{slot.className}</strong> ({slot.dayTime}) không?
          </p>
          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            Hành động này sẽ gỡ lớp khỏi danh sách chọn ca học thử của trung tâm.
          </p>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-semibold">
            Hủy bỏ
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirmDelete(slot.id);
              onClose();
            }}
            className="h-9 px-5 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
          >
            🔴 Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 9: Mở Đợt Mới / Batch Rollover ─── */
interface BatchRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: FixedTrialSlot | null;
  currentEnrolledCount: number;
  onConfirmRollover: (slot: FixedTrialSlot) => void;
}

function BatchRolloverModal({
  isOpen,
  onClose,
  slot,
  currentEnrolledCount,
  onConfirmRollover,
}: BatchRolloverModalProps) {
  if (!slot || !isOpen) return null;

  const currentBatchNum = slot.currentBatch || 1;
  const nextBatchNum = currentBatchNum + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-indigo-200 shadow-2xl animate-in zoom-in-95 duration-200">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl border border-indigo-200">
              🔄
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Mở Đợt Học Thử Mới (Batch Rollover)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-0.5">
                Đóng đợt cũ & làm mới sĩ số đón học sinh đợt mới
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Lớp học thử:</span>
              <strong className="text-slate-900 font-bold">{slot.className}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Khung giờ & Phòng:</span>
              <span className="text-slate-800 font-medium">{slot.dayTime} • {slot.room}</span>
            </div>
            <div className="flex justify-between items-center border-t border-indigo-100 pt-1.5 mt-1.5">
              <span className="text-slate-600">Đợt hiện tại:</span>
              <span className="font-bold text-slate-800">Đợt {currentBatchNum} ({currentEnrolledCount} học sinh)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-700 font-bold">Chuyển sang:</span>
              <span className="font-black text-indigo-700 text-sm">Đợt {nextBatchNum}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
            <span className="font-bold text-slate-800 block">💡 Cơ chế sau khi mở đợt mới:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>Danh sách <strong className="text-slate-800">{currentEnrolledCount} học sinh</strong> Đợt {currentBatchNum} sẽ được lưu trữ vào <em>"Lịch sử đợt cũ"</em> để tra cứu đối soát.</li>
              <li>Sĩ số ca hiện tại tự động reset về <strong className="text-emerald-700 font-mono font-bold">0/{slot.maxCapacity}</strong> sẵn sàng xếp học sinh đợt mới.</li>
              <li>Phòng học, giáo viên và ca học giữ nguyên mà không cần tạo lại lớp.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-semibold">
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirmRollover(slot);
              onClose();
            }}
            className="h-9 px-5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🚀 Xác nhận Mở Đợt {nextBatchNum}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Modal 10: Tra cứu Lịch Sử Đợt Học Thử Cũ ─── */
interface PastBatchesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: FixedTrialSlot[];
  trials: TrialClass[];
  initialSlotId?: string;
}

function PastBatchesHistoryModal({
  isOpen,
  onClose,
  slots,
  trials,
  initialSlotId = "all",
}: PastBatchesHistoryModalProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(initialSlotId);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlotId(initialSlotId || "all");
    }
  }, [isOpen, initialSlotId]);

  if (!isOpen) return null;

  const pastRecords = trials.filter((t) => {
    if (selectedSlotId !== "all") {
      const targetSlot = slots.find((s) => s.id === selectedSlotId);
      if (targetSlot) {
        return isStudentInTrialSlot(t, targetSlot, false);
      }
    }
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-700" />
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Lịch sử Các Đợt Học Thử Cũ & Đối Soát
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Tra cứu lại danh sách học sinh theo từng đợt trải nghiệm đã đóng
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="pt-3 space-y-4">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Label className="text-xs font-bold text-slate-700 shrink-0">Lọc theo Ca Học Thử:</Label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer flex-1"
            >
              <option value="all">Tất cả các ca học thử</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} (Hiện tại: Đợt {s.currentBatch || 1})
                </option>
              ))}
            </select>
          </div>

          {pastRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Chưa có dữ liệu học sinh thuộc lịch sử đợt học thử này.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[8%] text-center">STT</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[25%]">Học sinh</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[20%]">SĐT Phụ huynh</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[15%]">Đợt học</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[17%]">Trạng thái</TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-600 w-[15%] text-right">Điểm test</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastRecords.map((t, idx) => {
                    const statusCfg = TRIAL_STATUS_CONFIG[t.status] || TRIAL_STATUS_CONFIG.scheduled;
                    return (
                      <TableRow key={t.id} className="hover:bg-slate-50/70 border-b border-slate-100 text-xs">
                        <TableCell className="text-center font-mono font-bold text-slate-500 py-2.5">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-slate-900 py-2.5">{t.leadName}</TableCell>
                        <TableCell className="font-mono text-slate-700 font-medium py-2.5">{t.parentPhone}</TableCell>
                        <TableCell className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            Đợt {t.batchNumber || 1}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${statusCfg.className}`}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-800 py-2.5">
                          {t.testScore !== undefined ? `${t.testScore}/10` : "Chưa test"}
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

  // Dynamic Trial Slots State (Persisted in localStorage)
  const [trialSlots, setTrialSlots] = useState<FixedTrialSlot[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("educenter_trial_slots_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load trial slots from localStorage", e);
      }
    }
    return DEFAULT_FIXED_TRIAL_SLOTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("educenter_trial_slots_v1", JSON.stringify(trialSlots));
    } catch (e) {
      console.error("Failed to save trial slots to localStorage", e);
    }
  }, [trialSlots]);

  // Scroll ref for horizontal slider
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal control states
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [registerModalTrial, setRegisterModalTrial] = useState<TrialClass | null>(null);
  const [testResultModalTrial, setTestResultModalTrial] = useState<TrialClass | null>(null);
  const [noDemandModalTrial, setNoDemandModalTrial] = useState<TrialClass | null>(null);
  const [selectedClassModalSlot, setSelectedClassModalSlot] = useState<FixedTrialSlot | null>(null);
  const [deleteConfirmTrial, setDeleteConfirmTrial] = useState<TrialClass | null>(null);

  // New Slot Management Modals State
  const [editingSlot, setEditingSlot] = useState<FixedTrialSlot | null>(null);
  const [deleteSlotAlert, setDeleteSlotAlert] = useState<{ slot: FixedTrialSlot; count: number } | null>(null);
  const [deleteSlotConfirm, setDeleteSlotConfirm] = useState<FixedTrialSlot | null>(null);
  const [rolloverSlot, setRolloverSlot] = useState<FixedTrialSlot | null>(null);
  const [historySlotModalOpen, setHistorySlotModalOpen] = useState<boolean>(false);
  const [selectedHistorySlotId, setSelectedHistorySlotId] = useState<string>("all");

  function handleCreateTrialSlot(newSlot: FixedTrialSlot) {
    setTrialSlots((prev) => [newSlot, ...prev]);
  }

  function handleSaveSlot(updatedSlot: FixedTrialSlot) {
    setTrialSlots((prev) =>
      prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
    );
  }

  function handleDeleteSlot(slotId: string) {
    setTrialSlots((prev) => prev.filter((s) => s.id !== slotId));
  }

  function handleConfirmRollover(slotToRollover: FixedTrialSlot) {
    const currentBatchNum = slotToRollover.currentBatch || 1;
    const newBatchNum = currentBatchNum + 1;

    setTrialSlots((prev) =>
      prev.map((s) => (s.id === slotToRollover.id ? { ...s, currentBatch: newBatchNum } : s))
    );

    // Stamp previous batch number on existing trials for this slot if not set
    trials.forEach((t) => {
      const isInSlot = isStudentInTrialSlot(t, slotToRollover, false);
      if (isInSlot) {
        let updated = false;
        let newRegs = t.trialRegistrations;
        if (newRegs && newRegs.length > 0) {
          newRegs = newRegs.map((r) => {
            if ((r.trialClassId === slotToRollover.id || r.className === slotToRollover.className) && !r.batchNumber) {
              updated = true;
              return { ...r, batchNumber: currentBatchNum };
            }
            return r;
          });
        }
        const updatedTrial: TrialClass = {
          ...t,
          batchNumber: t.batchNumber || currentBatchNum,
          trialRegistrations: newRegs,
        };
        if (updated || !t.batchNumber) {
          onSaveAssessment(updatedTrial);
        }
      }
    });

    setRolloverSlot(null);
  }

  // Real-time capacity occupancy per trial slot
  const slotOccupancy = useMemo(() => {
    const map: Record<string, number> = {};
    trialSlots.forEach((slot) => {
      const count = trials.filter((t) => isStudentInTrialSlot(t, slot)).length;
      map[slot.id] = count;
    });
    return map;
  }, [trials, trialSlots]);

  const filteredTrials = useMemo(() => {
    return trials.filter((t) => {
      const matchSearch =
        !searchTerm ||
        t.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.parentPhone.includes(searchTerm) ||
        t.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

      const normalizedStatus = normalizeTrialStatus(t.status);
      const matchStatus = statusFilter === "all" || normalizedStatus === statusFilter;
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

  return (
    <div className="space-y-4">
      {/* ─── Khối "LỚP HỌC THỬ" dạng Carousel Horizontal Scroll ─── */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-700" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              LỚP HỌC THỬ & CA TRẢI NGHIỆM ({trialSlots.length} lớp)
            </h4>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
              Sĩ số: Nâng cao ≤ 30 HS / Cơ bản 30 HS
            </span>

            {/* Nút bấm Tra cứu Lịch sử Các Đợt Học Cũ */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedHistorySlotId("all");
                setHistorySlotModalOpen(true);
              }}
              className="h-8 font-semibold text-xs border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Lịch sử các đợt học</span>
            </Button>

            {/* Nút bấm Tạo lớp học thử mới nổi bật */}
            <Button
              size="sm"
              onClick={() => setIsCreateClassModalOpen(true)}
              className="h-8 font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tạo lớp học thử mới</span>
            </Button>

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
                title="Cuộn qua trái"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
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
          {trialSlots.map((slot) => {
            const count = slotOccupancy[slot.id] || 0;
            const isFull = count >= slot.maxCapacity;
            const percentage = Math.min(100, Math.round((count / slot.maxCapacity) * 100));
            const subjectHeaderTag = formatSlotSubjectBadge(slot);
            const currentBatchNum = slot.currentBatch || 1;

            return (
              <div
                key={slot.id}
                onClick={() => setSelectedClassModalSlot(slot)}
                className={`min-w-[290px] max-w-[320px] shrink-0 snap-start p-3.5 rounded-xl border bg-white transition-all cursor-pointer group hover:border-indigo-400 hover:shadow-md ${
                  isFull ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
                }`}
                title="Click để xem danh sách học sinh đã đăng ký ca này"
              >
                {/* Dòng 1: Tag phân loại (Không trùng lặp) + Batch Badge + Action Pencil/Trash */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {subjectHeaderTag}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-extrabold">
                      Đợt {currentBatchNum}
                    </span>
                    {isFull ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-extrabold">
                        [Đã đủ]
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                        [Còn chỗ]
                      </span>
                    )}

                    {/* Nút Sửa */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSlot(slot);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="Sửa thông tin lớp học thử"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Nút Xóa */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (count > 0) {
                          setDeleteSlotAlert({ slot, count });
                        } else {
                          setDeleteSlotConfirm(slot);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa lớp học thử"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dòng 2: Tên lớp và Giáo viên phụ trách in đậm */}
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-0.5">
                  {slot.className}
                </div>

                {/* Dòng 3: Thời gian cụ thể + Phòng học */}
                <div className="text-[11px] text-slate-500 font-medium mb-2">
                  {slot.dayTime} • {slot.room}
                </div>

                {/* Dòng 4: Bộ đếm sĩ số ca học */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-500 font-medium">Sĩ số Đợt {currentBatchNum}:</span>
                    <span className={`font-mono font-extrabold ${isFull ? "text-rose-600 font-black" : "text-slate-800"}`}>
                      {count}/{slot.maxCapacity}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull ? "bg-rose-500" : percentage >= 80 ? "bg-amber-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Dòng 5: Cụm nút Mở đợt mới & Xem lịch sử */}
                <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRolloverSlot(slot);
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-0.5 rounded transition-all cursor-pointer border border-indigo-200"
                    title="Đóng đợt hiện tại & Mở đợt học thử mới"
                  >
                    <RotateCcw className="w-3 h-3 text-indigo-600" />
                    <span>🔄 Mở đợt mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHistorySlotId(slot.id);
                      setHistorySlotModalOpen(true);
                    }}
                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer flex items-center gap-0.5"
                    title="Xem lịch sử các đợt học cũ"
                  >
                    <History className="w-3 h-3 text-slate-400" />
                    <span>Lịch sử đợt cũ</span>
                  </button>
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
            className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã xếp lịch</option>
            <option value="attended">Đã tham gia</option>
            <option value="no_demand">Không có nhu cầu</option>
          </select>
        </div>

        <Button
          onClick={onOpenScheduleTrial}
          size="sm"
          className="h-8 font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white shrink-0 cursor-pointer"
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
                const normalizedStatus = normalizeTrialStatus(trial.status);
                const statusCfg =
                  TRIAL_STATUS_CONFIG[normalizedStatus] ||
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
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2.5 py-0.5 border ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </Badge>
                    </TableCell>

                    {/* Cột 4: Điểm test */}
                    <TableCell className="py-3">
                      {trial.testScore !== undefined && trial.testScore > 0 ? (
                        <button
                          type="button"
                          onClick={() => setTestResultModalTrial(trial)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 transition-all cursor-pointer shadow-2xs"
                          title="Click để xem hoặc cập nhật điểm test & nhận xét"
                        >
                          <span className="font-extrabold">{trial.testScore}/10 điểm</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTestResultModalTrial(trial)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50 text-xs font-medium text-slate-500 hover:text-purple-700 transition-all cursor-pointer"
                          title="Click để nhập điểm test cho học sinh"
                        >
                          <span>[Nhập điểm test]</span>
                        </button>
                      )}
                    </TableCell>

                    {/* Cột 5: Hành động */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {normalizedStatus === "attended" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onMoveToConversion(trial)}
                              className="h-7 text-xs px-2.5 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-2xs gap-1 cursor-pointer"
                              title="Chuyển sang Ghi danh chính thức & chốt học phí"
                            >
                              <span>Chuyển Ghi danh</span>
                              <ArrowRight className="w-3 h-3" />
                            </Button>

                            <button
                              type="button"
                              onClick={() => setNoDemandModalTrial(trial)}
                              className="h-7 border border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-xs px-2.5 rounded-md transition-all font-medium cursor-pointer shrink-0 inline-flex items-center gap-1"
                              title="Phụ huynh không muốn học tiếp / Chê học phí"
                            >
                              <span>🚫 Không có nhu cầu</span>
                            </button>
                          </>
                        )}

                        {normalizedStatus === "scheduled" && (
                          <button
                            type="button"
                            onClick={() => setNoDemandModalTrial(trial)}
                            className="h-7 border border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-xs px-2.5 rounded-md transition-all font-medium cursor-pointer shrink-0 inline-flex items-center gap-1"
                            title="Học sinh không đến học / Bỏ ca học thử"
                          >
                            <span>🚫 Không có nhu cầu</span>
                          </button>
                        )}

                        {normalizedStatus === "no_demand" && (
                          <button
                            type="button"
                            onClick={() => setNoDemandModalTrial(trial)}
                            className="h-7 text-xs px-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md cursor-pointer inline-flex items-center gap-1.5"
                            title="Đã đóng phễu (Click để xem lý do hoặc kích hoạt chăm sóc lại)"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>📋 Đã đóng phễu</span>
                          </button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmTrial(trial)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Xóa khỏi danh sách học thử"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      <p className="text-[11px] text-slate-500 px-1">
        Hiển thị <strong>{filteredTrials.length}</strong> / {trials.length} lịch học thử
      </p>

      {/* Modals */}
      <CreateTrialClassModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        onCreateSlot={handleCreateTrialSlot}
      />

      <RegisterTrialSlotModal
        isOpen={!!registerModalTrial}
        onClose={() => setRegisterModalTrial(null)}
        trial={registerModalTrial}
        trials={trials}
        trialSlots={trialSlots}
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

      <TrialNoDemandModal
        isOpen={!!noDemandModalTrial}
        onClose={() => setNoDemandModalTrial(null)}
        trial={noDemandModalTrial}
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

      <EditTrialClassModal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        slot={editingSlot}
        onSaveSlot={handleSaveSlot}
      />

      <DeleteSlotAlertModal
        isOpen={!!deleteSlotAlert}
        onClose={() => setDeleteSlotAlert(null)}
        slot={deleteSlotAlert?.slot || null}
        count={deleteSlotAlert?.count || 0}
      />

      <DeleteSlotConfirmModal
        isOpen={!!deleteSlotConfirm}
        onClose={() => setDeleteSlotConfirm(null)}
        slot={deleteSlotConfirm}
        onConfirmDelete={handleDeleteSlot}
      />

      <BatchRolloverModal
        isOpen={!!rolloverSlot}
        onClose={() => setRolloverSlot(null)}
        slot={rolloverSlot}
        currentEnrolledCount={rolloverSlot ? slotOccupancy[rolloverSlot.id] || 0 : 0}
        onConfirmRollover={handleConfirmRollover}
      />

      <PastBatchesHistoryModal
        isOpen={historySlotModalOpen}
        onClose={() => setHistorySlotModalOpen(false)}
        slots={trialSlots}
        trials={trials}
        initialSlotId={selectedHistorySlotId}
      />
    </div>
  );
}
