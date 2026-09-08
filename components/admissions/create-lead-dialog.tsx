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
import { UserPlus, Sparkles } from "lucide-react";
import { Lead, LeadSource } from "@/types/admissions";

interface CreateLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: "facebook_ads", label: "Facebook Ads" },
  { value: "fanpage", label: "Fanpage nhắn tin" },
  { value: "zalo", label: "Zalo OA / Tin nhắn" },
  { value: "referral", label: "Người quen giới thiệu" },
  { value: "walkin", label: "Vãng lai / Tờ rơi" },
  { value: "hotline", label: "Hotline / Website" },
  { value: "other", label: "Khác" },
];

const STAFF_LIST = [
  "Trần Thu Hà",
  "Nguyễn Minh Tuấn",
  "Lê Hoàng Yến",
  "Phạm Quốc Bảo",
];

export function CreateLeadDialog({
  isOpen,
  onClose,
  onAddLead,
}: CreateLeadDialogProps) {
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("Lớp 9");
  const [studentDob, setStudentDob] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentMessenger, setParentMessenger] = useState("");
  const [source, setSource] = useState<LeadSource>("facebook_ads");
  const [referrerName, setReferrerName] = useState("");
  const [targetSubject, setTargetSubject] = useState("Toán 9");
  const [targetGoal, setTargetGoal] = useState("Luyện thi vào 10");
  const [assignedStaff, setAssignedStaff] = useState("Trần Thu Hà");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim() || !parentPhone.trim()) {
      alert("Vui lòng nhập họ tên học sinh và số điện thoại phụ huynh!");
      return;
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      studentName: studentName.trim(),
      studentGrade,
      studentDob: studentDob || undefined,
      parentName: parentName.trim() || "Phụ huynh",
      parentPhone: parentPhone.trim(),
      parentZalo: parentPhone.trim(),
      parentMessenger: parentMessenger.trim() || undefined,
      source,
      referrerName: source === "referral" ? referrerName.trim() : undefined,
      targetSubject: targetSubject.trim(),
      targetGoal: targetGoal.trim(),
      status: "new",
      assignedStaff,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    onAddLead(newLead);
    onClose();

    // Reset form
    setStudentName("");
    setParentName("");
    setParentPhone("");
    setParentMessenger("");
    setNotes("");
    setReferrerName("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <UserPlus className="w-5 h-5" />
            <span>Tiếp Nhận Khách Hàng Tiềm Năng (Lead Mới)</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập thông tin ban đầu của học sinh và phụ huynh vào đầu phễu tuyển sinh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Section: Thông tin học sinh */}
          <div className="space-y-3 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Thông tin học sinh
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">
                  Họ tên học sinh <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: Nguyễn Minh Khang"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Khối / Lớp</Label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Khối tiểu học">Tiểu học</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ngày sinh (nếu có)</Label>
              <Input
                type="date"
                value={studentDob}
                onChange={(e) => setStudentDob(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Section: Thông tin phụ huynh */}
          <div className="space-y-3 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="text-xs font-bold text-foreground">
              Thông tin liên hệ phụ huynh
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Họ tên phụ huynh</Label>
                <Input
                  placeholder="Ví dụ: Bố Hùng / Mẹ Mai"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Số điện thoại / Zalo <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  placeholder="0912345678"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Link Messenger / Facebook phụ huynh (tùy chọn)
              </Label>
              <Input
                placeholder="VD: m.me/nguyenvanhung hoặc facebook.com/id..."
                value={parentMessenger}
                onChange={(e) => setParentMessenger(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Section: Nguồn & Nhu cầu */}
          <div className="space-y-3 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="text-xs font-bold text-foreground">
              Phân loại nguồn & Nhu cầu đào tạo
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nguồn khách hàng</Label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {source === "referral" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tên người giới thiệu</Label>
                  <Input
                    placeholder="Ví dụ: Phụ huynh em Tuấn (Lớp 10A)"
                    value={referrerName}
                    onChange={(e) => setReferrerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tư vấn viên phụ trách</Label>
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {STAFF_LIST.map((staff) => (
                      <option key={staff} value={staff}>
                        {staff}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Môn học quan tâm</Label>
                <Input
                  placeholder="Ví dụ: Toán 9, Tiếng Anh, Vật lý"
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mục tiêu học tập</Label>
                <Input
                  placeholder="Ví dụ: Lấy lại gốc, Thi vào 10"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ghi chú ban đầu</Label>
              <textarea
                rows={2}
                placeholder="Ghi chú thêm về hoàn cảnh, thời gian thuận tiện gọi điện..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Lưu Lead vào phễu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
