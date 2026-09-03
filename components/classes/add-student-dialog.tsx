"use client";

import { useState } from "react";
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
import { enrollStudentInClass } from "@/lib/actions/students";
import { UserPlus, Loader2 } from "lucide-react";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  allStudents: any[];
  alreadyEnrolledStudentIds: string[];
}

export function AddStudentDialog({
  isOpen,
  onClose,
  classId,
  className,
  allStudents,
  alreadyEnrolledStudentIds,
}: AddStudentDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [initialSessions, setInitialSessions] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableStudents = allStudents.filter(
    (s) => !alreadyEnrolledStudentIds.includes(s.id) && s.status !== "dropped"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await enrollStudentInClass(selectedStudentId, classId, initialSessions);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      setSelectedStudentId("");
      onClose();
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Chọn học sinh *</Label>
            {availableStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-3 bg-muted rounded-lg">
                Tất cả học sinh hiện có đã được thêm vào lớp này hoặc chưa có học sinh mới.
              </p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn học sinh --</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.parent_phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Số buổi nạp ban đầu *</Label>
            <Input
              type="number"
              min="0"
              value={initialSessions}
              onChange={(e) => setInitialSessions(Number(e.target.value))}
              required
              className="h-10 font-bold"
            />
            <p className="text-[11px] text-muted-foreground">
              Số buổi học sinh có sẵn trong ví khi bắt đầu vào lớp này.
            </p>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedStudentId || availableStudents.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                "Thêm vào lớp"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
