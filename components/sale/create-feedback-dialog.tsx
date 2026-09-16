"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFeedbackTicket } from "@/lib/actions/feedback";
import { FeedbackCategory, FeedbackChannel, Student } from "@/types/database";
import { MessageSquareWarning, Loader2, AlertCircle } from "lucide-react";

interface CreateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onSuccess?: () => void;
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  teaching_quality: "Chất lượng giảng dạy",
  schedule: "Lịch học",
  tuition: "Học phí",
  facility: "Cơ sở vật chất",
  other: "Khác",
};

export function CreateFeedbackDialog({
  open,
  onOpenChange,
  students,
  onSuccess,
}: CreateFeedbackDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState<string>("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [channel, setChannel] = useState<FeedbackChannel | "">("");
  const [content, setContent] = useState("");

  const resetForm = () => {
    setStudentId("");
    setContactName("");
    setContactPhone("");
    setCategory("");
    setChannel("");
    setContent("");
    setError(null);
  };

  const handleSelectStudent = (id: string) => {
    setStudentId(id);
    const student = students.find((s) => s.id === id);
    if (student) {
      setContactName((prev) => prev || student.parent_name || student.full_name);
      setContactPhone((prev) => prev || student.parent_phone || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contactName.trim() || !contactPhone.trim()) {
      setError("Vui lòng nhập tên và số điện thoại người phản ánh");
      return;
    }
    if (!category) {
      setError("Vui lòng chọn phân loại phản ánh");
      return;
    }
    if (!channel) {
      setError("Vui lòng chọn kênh tiếp nhận");
      return;
    }
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung phản ánh");
      return;
    }

    setLoading(true);
    try {
      const result = await createFeedbackTicket({
        studentId: studentId || undefined,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        category,
        channel,
        content: content.trim(),
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!loading) {
          if (!isOpen) resetForm();
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
            <span>Tiếp nhận Phản ánh / Góp ý</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Ghi nhận phàn nàn hoặc góp ý của phụ huynh/học sinh để theo dõi xử lý.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Học sinh liên quan (nếu có)</Label>
            <Select value={studentId} onValueChange={handleSelectStudent} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Không gắn với học sinh cụ thể..." />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.full_name} ({s.parent_phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-xs font-semibold">
                Tên người phản ánh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactName"
                placeholder="Phụ huynh/học sinh"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-xs font-semibold">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPhone"
                placeholder="0912 345 678"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Phân loại <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as FeedbackCategory)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phân loại..." />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Kênh tiếp nhận <span className="text-destructive">*</span>
              </Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as FeedbackChannel)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kênh..." />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  <SelectItem value="in_person">Trực tiếp tại cơ sở</SelectItem>
                  <SelectItem value="hotline">Điện thoại / Hotline</SelectItem>
                  <SelectItem value="zalo">Zalo (nhóm lớp/nhắn riêng)</SelectItem>
                  <SelectItem value="facebook">Fanpage / Messenger</SelectItem>
                  <SelectItem value="system">Hệ thống nội bộ (Web/App)</SelectItem>
                  <SelectItem value="email">Email chính thức</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-xs font-semibold">
              Nội dung phản ánh <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Mô tả chi tiết phàn nàn/góp ý của phụ huynh..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="text-xs font-bold gap-1.5">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Lưu phản ánh
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
