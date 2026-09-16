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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLead, CreateLeadPayload } from "@/lib/actions/admissions";
import { LeadSource } from "@/types/database";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateLeadDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLeadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [zalo, setZalo] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [source, setSource] = useState<LeadSource | "">("");
  const [referrerName, setReferrerName] = useState("");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setFullName("");
    setParentName("");
    setPhone("");
    setZalo("");
    setFacebookUrl("");
    setEmail("");
    setGrade("");
    setCourseInterest("");
    setTargetGoal("");
    setSource("");
    setReferrerName("");
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim()) {
      setError("Vui lòng nhập tên học sinh và số điện thoại liên hệ");
      return;
    }

    if (!source) {
      setError("Vui lòng chọn nguồn tiếp nhận khách hàng");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateLeadPayload = {
        fullName: fullName.trim(),
        parentName: parentName.trim() || undefined,
        phone: phone.trim(),
        zalo: zalo.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        email: email.trim() || undefined,
        grade: grade.trim() || undefined,
        courseInterest: courseInterest.trim() || undefined,
        targetGoal: targetGoal.trim() || undefined,
        source,
        referrerName: referrerName.trim() || undefined,
        note: note.trim() || undefined,
      };

      const result = await createLead(payload);

      // QUY TẮC BẮT BUỘC: Kiểm tra result?.error, không giả định thành công
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <span>Tiếp nhận Khách hàng Tiềm năng (Lead)</span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Nhập thông tin phụ huynh &amp; học sinh mới để đưa vào quy trình tư vấn và chăm sóc.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-semibold">
                Tên học sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-xs font-semibold">
                Khối / Lớp hiện tại
              </Label>
              <Input
                id="grade"
                placeholder="Lớp 9, Lớp 12..."
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentName" className="text-xs font-semibold">
                Tên Phụ huynh
              </Label>
              <Input
                id="parentName"
                placeholder="Bố/Mẹ học sinh..."
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Số điện thoại liên hệ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="0912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zalo" className="text-xs font-semibold">
                Số Zalo (nếu khác SĐT)
              </Label>
              <Input
                id="zalo"
                placeholder="Để trống nếu trùng SĐT"
                value={zalo}
                onChange={(e) => setZalo(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="phuhuynh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookUrl" className="text-xs font-semibold">
              Link Facebook / Messenger liên hệ
            </Label>
            <Input
              id="facebookUrl"
              placeholder="https://facebook.com/... hoặc https://m.me/..."
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseInterest" className="text-xs font-semibold">
                Môn học quan tâm
              </Label>
              <Input
                id="courseInterest"
                placeholder="Toán 9, Tiếng Anh giao tiếp..."
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetGoal" className="text-xs font-semibold">
                Mục tiêu học tập
              </Label>
              <Input
                id="targetGoal"
                placeholder="Lấy lại gốc, Luyện thi vào 10..."
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Nguồn khách hàng <span className="text-destructive">*</span>
              </Label>
              <Select
                value={source}
                onValueChange={(val) => setSource(val as LeadSource)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nguồn tiếp nhận..." />
                </SelectTrigger>
                {/* z-[70] > z-[60] của DialogOverlay (dialog.tsx) — không sửa file
                    dùng chung, chỉ ghi đè riêng tại đây để danh sách không bị che khuất
                    khi Select nằm bên trong Dialog. */}
                <SelectContent className="z-[70]">
                  <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                  <SelectItem value="fanpage">Fanpage Trung tâm</SelectItem>
                  <SelectItem value="zalo">Zalo OA / Tin nhắn Zalo</SelectItem>
                  <SelectItem value="referral">Người quen giới thiệu</SelectItem>
                  <SelectItem value="hotline">Hotline</SelectItem>
                  <SelectItem value="walkin">Trực tiếp đến trung tâm</SelectItem>
                  <SelectItem value="other">Nguồn khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {source === "referral" && (
              <div className="space-y-2">
                <Label htmlFor="referrerName" className="text-xs font-semibold">
                  Tên người giới thiệu
                </Label>
                <Input
                  id="referrerName"
                  placeholder="Ai giới thiệu?"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-semibold">
              Ghi chú tư vấn ban đầu
            </Label>
            <Textarea
              id="note"
              placeholder="Yêu cầu đặc biệt của phụ huynh, lịch rảnh học thử..."
              rows={2}
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
            <Button type="submit" disabled={loading} className="text-xs font-bold gap-1.5">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Lưu Lead vào phễu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
