"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quickCreateLead } from "@/lib/actions/admissions";
import { LeadSource } from "@/types/database";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FastLeadIntakeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FastLeadIntakeModal({
  open,
  onOpenChange,
  onSuccess,
}: FastLeadIntakeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [source, setSource] = useState<LeadSource | "">("");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setParentName("");
    setCourseInterest("");
    setSource("");
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError("Vui lòng nhập họ tên học sinh và số điện thoại liên hệ");
      return;
    }

    if (!source) {
      setError("Vui lòng chọn nguồn tiếp nhận");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await quickCreateLead({
        fullName: fullName.trim(),
        phone: phone.trim(),
        parentName: parentName.trim() || undefined,
        courseInterest: courseInterest.trim() || undefined,
        source,
        note: note.trim() || undefined,
      });

      // BẮT BUỘC: Kiểm tra res?.error
      if (res?.error) {
        setError(res.error);
        return;
      }

      resetForm();
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span>Thêm Nhanh Khách Hàng (Fast Intake)</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Dành cho cuộc gọi hotline, tin nhắn Zalo hoặc khách vãng lai cần ghi nhận gấp vào phễu.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <Label htmlFor="fastFullName" className="text-xs font-semibold">
              Họ tên học sinh <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fastFullName"
              placeholder="VD: Trần Hoàng Long"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="fastPhone" className="text-xs font-semibold">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fastPhone"
                placeholder="0912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fastParent" className="text-xs font-semibold">
                Tên Phụ huynh
              </Label>
              <Input
                id="fastParent"
                placeholder="Bố/Mẹ học sinh..."
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="fastCourse" className="text-xs font-semibold">
                Môn học quan tâm
              </Label>
              <Input
                id="fastCourse"
                placeholder="Toán 9, Lý 10..."
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Nguồn tiếp nhận <span className="text-destructive">*</span>
              </Label>
              <Select
                value={source}
                onValueChange={(v) => setSource(v as LeadSource)}
                disabled={loading}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Chọn nguồn..." />
                </SelectTrigger>
                {/* z-[70] > z-[60] của DialogOverlay (dialog.tsx) — không sửa file
                    dùng chung, chỉ ghi đè riêng tại đây để danh sách không bị che khuất
                    khi Select nằm bên trong Dialog. */}
                <SelectContent className="z-[70]">
                  <SelectItem value="hotline">Hotline</SelectItem>
                  <SelectItem value="zalo">Zalo OA / Chat</SelectItem>
                  <SelectItem value="walkin">Trực tiếp đến TT</SelectItem>
                  <SelectItem value="fanpage">Fanpage</SelectItem>
                  <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                  <SelectItem value="referral">Người quen giới thiệu</SelectItem>
                  <SelectItem value="other">Nguồn khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="fastNote" className="text-xs font-semibold">
              Ghi chú nhanh
            </Label>
            <Input
              id="fastNote"
              placeholder="Yêu cầu gấp: xếp lớp tối thứ 7..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
            <Button
              type="submit"
              disabled={loading}
              className="text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Lưu ngay vào phễu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
