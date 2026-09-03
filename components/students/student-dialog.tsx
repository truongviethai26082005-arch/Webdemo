"use client";

import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createStudent, updateStudent } from "@/lib/actions/students";
import {
  User,
  Loader2,
  Calendar,
  Phone,
  BookOpen,
  FileText,
  AlertCircle,
  Coins,
} from "lucide-react";

interface StudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classes?: any[];
  editingStudent?: any | null;
  onSaved?: (student?: any) => void;
}

// Convert YYYY-MM-DD to DD/MM/YYYY
function toDmyDate(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD/MM/YYYY
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    return isoDate;
  }
  return isoDate;
}

// Convert DD/MM/YYYY to YYYY-MM-DD for PostgreSQL storage
function toIsoDate(dmyDate: string): string | null {
  if (!dmyDate) return null;
  const parts = dmyDate.trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return dmyDate;
}

export function StudentDialog({
  isOpen,
  onClose,
  classes = [],
  editingStudent,
  onSaved,
}: StudentDialogProps) {
  const [fullName, setFullName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [birthDateDmy, setBirthDateDmy] = useState("");
  const [note, setNote] = useState("");
  const [classId, setClassId] = useState("");
  const [initialSessions, setInitialSessions] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [parentPhoneError, setParentPhoneError] = useState<string | null>(null);

  const nativeDatePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingStudent) {
      setFullName(editingStudent.full_name || "");
      setParentName(editingStudent.parent_name || "");
      setParentPhone(editingStudent.parent_phone || "");
      setBirthDateDmy(editingStudent.birth_date ? toDmyDate(editingStudent.birth_date) : "");
      setNote(editingStudent.note || "");
      setStatus(editingStudent.status || "active");
    } else {
      setFullName("");
      setParentName("");
      setParentPhone("");
      setBirthDateDmy("");
      setNote("");
      setStatus("active");
      setClassId("");
      setInitialSessions("");
    }

    setError(null);
    setFullNameError(null);
    setParentPhoneError(null);
  }, [editingStudent, isOpen]);

  // Masking input for DD/MM/YYYY
  function handleBirthDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputVal = e.target.value;
    if (inputVal.length < birthDateDmy.length) {
      setBirthDateDmy(inputVal);
      return;
    }

    const digits = inputVal.replace(/\D/g, "");
    if (digits.length <= 2) {
      setBirthDateDmy(digits);
    } else if (digits.length <= 4) {
      setBirthDateDmy(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setBirthDateDmy(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFullNameError(null);
    setParentPhoneError(null);

    let hasError = false;

    if (!fullName.trim()) {
      setFullNameError("Vui lòng nhập họ và tên học sinh");
      hasError = true;
    }

    if (!parentPhone.trim()) {
      setParentPhoneError("Vui lòng nhập số điện thoại phụ huynh");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("full_name", fullName.trim());
    formData.append("parent_name", parentName.trim());
    formData.append("parent_phone", parentPhone.trim());
    formData.append("status", status || "active");

    if (birthDateDmy.trim()) {
      const isoDate = toIsoDate(birthDateDmy);
      if (isoDate) formData.append("birth_date", isoDate);
    }

    if (note.trim()) {
      formData.append("note", note.trim());
    }

    if (!editingStudent && classId) {
      formData.append("class_id", classId);
      const sessionsNum = initialSessions.trim() !== "" ? Number(initialSessions) : 0;
      formData.append("initial_sessions", String(sessionsNum));
    }

    let result;
    if (editingStudent) {
      result = await updateStudent(editingStudent.id, formData);
    } else {
      result = await createStudent(formData);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      if (onSaved) onSaved("data" in result ? result.data : undefined);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card rounded-2xl p-6 shadow-xl border border-border/80 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingStudent ? "Chỉnh Sửa Hồ Sơ Học Sinh" : "Thêm Học Sinh Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Quản lý thông tin học sinh, phụ huynh và xếp lớp học ban đầu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 2-Column Balanced Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            {/* 1. Họ và tên học sinh (Bắt buộc) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Họ và tên học sinh <strong className="text-destructive">*</strong>
              </Label>
              <Input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (e.target.value.trim()) setFullNameError(null);
                }}
                placeholder="VD: Nguyễn Bảo Nam"
                className={`h-9 text-xs rounded-xl ${
                  fullNameError ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {fullNameError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {fullNameError}
                </p>
              )}
            </div>

            {/* 2. Ngày sinh (Định dạng dd/mm/yyyy) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>Ngày sinh (Tùy chọn)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">dd/mm/yyyy</span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="dd/mm/yyyy (VD: 15/08/2012)"
                  value={birthDateDmy}
                  onChange={handleBirthDateChange}
                  maxLength={10}
                  className="h-9 text-xs rounded-xl font-mono pr-9"
                />
                {/* Hidden native datepicker triggerable via calendar icon */}
                <input
                  type="date"
                  ref={nativeDatePickerRef}
                  onChange={(e) => {
                    if (e.target.value) {
                      setBirthDateDmy(toDmyDate(e.target.value));
                    }
                  }}
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 w-6 h-6 cursor-pointer"
                  title="Chọn từ lịch"
                />
                <button
                  type="button"
                  onClick={() => nativeDatePickerRef.current?.showPicker?.()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Mở lịch chọn ngày"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. Tên phụ huynh */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Tên phụ huynh</Label>
              <Input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="VD: Chị Lan (Mẹ)"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* 4. SĐT phụ huynh (Bắt buộc) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span>SĐT phụ huynh <strong className="text-destructive">*</strong></span>
              </Label>
              <Input
                value={parentPhone}
                onChange={(e) => {
                  setParentPhone(e.target.value);
                  if (e.target.value.trim()) setParentPhoneError(null);
                }}
                placeholder="0912345678"
                className={`h-9 text-xs rounded-xl font-mono ${
                  parentPhoneError ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              {parentPhoneError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {parentPhoneError}
                </p>
              )}
            </div>

            {/* Editing mode only: Cho phép chỉnh trạng thái nếu đang sửa */}
            {editingStudent && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">Trạng thái học tập</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="active">🟢 Đang học (Active)</option>
                  <option value="paused">🟡 Tạm dừng (Paused)</option>
                  <option value="dropped">🔴 Đã nghỉ (Dropped)</option>
                </select>
              </div>
            )}

            {/* 5. Ghi chú học lực / đặc điểm (Textarea full-width) */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span>Ghi chú (Học lực, mục tiêu, lưu ý đặc biệt...)</span>
              </Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Cần củng cố ngữ pháp câu bị động, phụ huynh nhờ nhắc nhở nộp bài đúng hạn..."
                rows={2}
                className="text-xs rounded-xl resize-none"
              />
            </div>
          </div>

          {/* Ghi danh lớp ban đầu (Chỉ hiển thị khi tạo mới) */}
          {!editingStudent && classes.length > 0 && (
            <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  Ghi danh lớp ban đầu (Tùy chọn)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Tự động nạp buổi vào ví lớp học
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Chọn lớp học</Label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Chưa ghi danh vào lớp --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.room ? `(${c.room})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {classId ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        <span>Số buổi mua / đóng tiền ban đầu</span>
                      </Label>
                      <span className="text-[10px] text-muted-foreground">(Gợi ý: 12 buổi)</span>
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="200"
                        value={initialSessions}
                        onChange={(e) => setInitialSessions(e.target.value)}
                        className="h-9 text-xs rounded-xl font-mono font-bold pr-12"
                        placeholder="Nhập số buổi (Gợi ý: 12)..."
                      />
                      {initialSessions && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold pointer-events-none">
                          buổi
                        </span>
                      )}
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-muted-foreground">Gợi ý nhanh:</span>
                      {[8, 12, 16, 24].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setInitialSessions(String(num))}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all ${
                            initialSessions === String(num)
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {num} buổi
                        </button>
                      ))}
                    </div>

                    {initialSessions && Number(initialSessions) > 0 ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Học sinh sẽ có sẵn {initialSessions} buổi trong ví lớp học sau khi tạo.
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        Nhập số buổi học sinh đóng tiền ban đầu (để trống nếu chưa đóng tiền).
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-muted-foreground pt-6">
                    <span>(Chọn lớp để nhập số buổi nạp ban đầu)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs rounded-xl h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="text-xs font-bold rounded-xl h-9 px-5 gap-1.5 shadow-md shadow-primary/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý dữ liệu...</span>
                </>
              ) : editingStudent ? (
                "Lưu Thay Đổi"
              ) : (
                "Thêm Học Sinh"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
