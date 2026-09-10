"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enrollStudentInClass, createStudent } from "@/lib/actions/students";
import { useAppData } from "@/lib/context/app-data-context";
import { UserPlus, UserCheck, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  allStudents?: any[];
  alreadyEnrolledStudentIds?: string[];
  onEnrolled?: (student: any) => void;
}

export function AddStudentDialog({
  isOpen,
  onClose,
  classId,
  className,
  allStudents = [],
  alreadyEnrolledStudentIds = [],
  onEnrolled,
}: AddStudentDialogProps) {
  const { classes, students: storeStudents, enrollStudentToClass } = useAppData();

  const [tabMode, setTabMode] = useState<"existing" | "new">("existing");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [initialSessions, setInitialSessions] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra lớp đã kết thúc hay chưa
  const isTargetClassCompleted = useMemo(() => {
    const target = (classes || []).find((c: any) => c.id === classId);
    if (!target) return false;
    const today = new Date().toISOString().split("T")[0];
    const eDate = target.endDate || target.end_date;
    const total = target.totalPlannedSessions || 0;
    const comp = target.completedSessions || 0;
    return (
      target.status === "completed" ||
      Boolean(eDate && eDate < today) ||
      Boolean(total > 0 && comp >= total)
    );
  }, [classes, classId]);

  // Form fields cho tạo mới nhanh
  const [newStudentName, setNewStudentName] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");

  // Hợp nhất danh sách học sinh từ store và props
  const effectiveStudentsList = useMemo(() => {
    const list = storeStudents && storeStudents.length > 0 ? storeStudents : allStudents;
    return (list || []).filter(
      (s: any) =>
        !alreadyEnrolledStudentIds.includes(s.id) &&
        s.classId !== classId &&
        s.status !== "dropped"
    );
  }, [storeStudents, allStudents, alreadyEnrolledStudentIds, classId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isTargetClassCompleted) {
      setError("Khóa học này đã kết thúc hoặc bế giảng. Không thể ghi danh thêm học sinh mới vào lớp!");
      setLoading(false);
      return;
    }

    try {
      if (tabMode === "existing") {
        if (!selectedStudentId) {
          setError("Vui lòng chọn một học sinh trong danh sách.");
          setLoading(false);
          return;
        }

        const chosenStudent = (storeStudents || allStudents).find(
          (s: any) => s.id === selectedStudentId
        );

        if (!chosenStudent) {
          setError("Không tìm thấy thông tin học sinh đã chọn.");
          setLoading(false);
          return;
        }

        // 1. Đồng bộ Store toàn cục ngay tức thì
        enrollStudentToClass(classId, {
          id: chosenStudent.id,
          name: chosenStudent.name || chosenStudent.full_name,
          full_name: chosenStudent.full_name || chosenStudent.name,
          parentName: chosenStudent.parentName || chosenStudent.parent_name,
          parent_name: chosenStudent.parent_name || chosenStudent.parentName,
          phone: chosenStudent.phone || chosenStudent.parentPhone || chosenStudent.parent_phone,
          parentPhone: chosenStudent.parentPhone || chosenStudent.phone || chosenStudent.parent_phone,
          parent_phone: chosenStudent.parent_phone || chosenStudent.parentPhone || chosenStudent.phone,
          initialSessions: initialSessions,
          remainingSessions: initialSessions,
          classId,
          className,
        });

        // 2. Cố gắng ghi vào database trong background (nếu có Supabase kết nối)
        try {
          await enrollStudentInClass(selectedStudentId, classId, initialSessions);
        } catch (dbErr) {
          console.warn("Database sync background warning (store already updated):", dbErr);
        }

        onEnrolled?.(chosenStudent);
      } else {
        // Tab Mode: "new" (Tạo nhanh học sinh mới)
        if (!newStudentName.trim() || !newParentPhone.trim()) {
          setError("Vui lòng nhập Tên học sinh và Số điện thoại phụ huynh.");
          setLoading(false);
          return;
        }

        const newStudentId = `std-${Date.now().toString().slice(-6)}`;
        const studentPayload = {
          id: newStudentId,
          name: newStudentName.trim(),
          full_name: newStudentName.trim(),
          parentName: newParentName.trim() || "Phụ huynh",
          parent_name: newParentName.trim() || "Phụ huynh",
          phone: newParentPhone.trim(),
          parentPhone: newParentPhone.trim(),
          parent_phone: newParentPhone.trim(),
          classId,
          className,
          initialSessions,
          remainingSessions: initialSessions,
          totalSessions: initialSessions,
          status: "active",
        };

        // 1. Đồng bộ Store toàn cục ngay tức thì
        enrollStudentToClass(classId, studentPayload);

        // 2. Cố gắng ghi vào database trong background
        try {
          const formData = new FormData();
          formData.append("full_name", newStudentName.trim());
          formData.append("parent_name", newParentName.trim() || "Phụ huynh");
          formData.append("parent_phone", newParentPhone.trim());
          formData.append("class_id", classId);
          formData.append("initial_sessions", String(initialSessions));
          await createStudent(formData);
        } catch (dbErr) {
          console.warn("Database sync background warning (store already updated):", dbErr);
        }

        onEnrolled?.(studentPayload);
      }

      setLoading(false);
      setSelectedStudentId("");
      setNewStudentName("");
      setNewParentName("");
      setNewParentPhone("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi ghi danh học sinh.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Thêm Học Sinh Vào Lớp
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lớp học: <span className="font-semibold text-foreground">{className}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Tab switch giữa "Chọn học sinh có sẵn" và "Tạo nhanh học sinh mới" */}
        <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border text-xs font-semibold mt-1">
          <button
            type="button"
            onClick={() => {
              setTabMode("existing");
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tabMode === "existing"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Chọn có sẵn ({effectiveStudentsList.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTabMode("new");
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tabMode === "new"
                ? "bg-background text-foreground shadow-xs font-bold text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Tạo mới nhanh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isTargetClassCompleted && (
            <div className="p-3 rounded-xl bg-destructive/15 text-destructive border border-destructive/30 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Khóa học này đã kết thúc hoặc bế giảng. Đã khóa tính năng ghi danh mới!</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {tabMode === "existing" ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Chọn học sinh trong hệ thống *</Label>
              {effectiveStudentsList.length === 0 ? (
                <div className="p-3.5 bg-muted/40 rounded-xl border text-xs text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground">
                    Tất cả học sinh hiện có đã được xếp vào lớp này hoặc chưa có học sinh tự do.
                  </p>
                  <p>
                    Vui lòng bấm sang tab <strong>"Tạo mới nhanh"</strong> ở trên để thêm học sinh mới ngay lập tức.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  disabled={isTargetClassCompleted}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">-- Chọn học sinh ({effectiveStudentsList.length} bạn) --</option>
                  {effectiveStudentsList.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.name} • SĐT: {s.parent_phone || s.phone || "Chưa có SĐT"} • Còn {s.remainingSessions ?? 12} buổi
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Họ và tên học sinh *</Label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Gia Huy"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                  disabled={isTargetClassCompleted}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Họ tên phụ huynh</Label>
                  <Input
                    type="text"
                    placeholder="Ví dụ: Chị Lan"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    disabled={isTargetClassCompleted}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Số điện thoại *</Label>
                  <Input
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    required
                    disabled={isTargetClassCompleted}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Số buổi nạp ban đầu *</Label>
            <Input
              type="number"
              min="1"
              value={initialSessions}
              onChange={(e) => setInitialSessions(Math.max(1, Number(e.target.value)))}
              required
              disabled={isTargetClassCompleted}
              className="h-10 font-bold font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Số buổi học sinh có sẵn trong tài khoản khi bắt đầu vào lớp này.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                isTargetClassCompleted ||
                (tabMode === "existing" && (!selectedStudentId || effectiveStudentsList.length === 0)) ||
                (tabMode === "new" && (!newStudentName.trim() || !newParentPhone.trim()))
              }
              className="font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : isTargetClassCompleted ? (
                "Lớp đã kết thúc"
              ) : (
                "Xác nhận thêm vào lớp"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
