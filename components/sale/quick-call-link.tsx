"use client";

import { Lead } from "@/types/database";
import { logInteraction, updateLead } from "@/lib/actions/admissions";
import { Facebook } from "lucide-react";

// Bấm "Gọi" ghi nhận nhanh 1 lượt gọi nhỡ ở nền (không preventDefault — vẫn
// mở ứng dụng gọi điện bình thường). Tái sử dụng đúng logInteraction() đã có
// (tăng lead.missed_calls_count, tự chuyển "Không có nhu cầu" sau 3 lần —
// xem lib/actions/admissions.ts). Nếu cuộc gọi thực ra thành công, Sale ghi
// nhật ký đầy đủ qua Drawer (isMissedCall=false) sẽ RESET bộ đếm này về 0,
// không xung đột với luồng ghi nhật ký thủ công hiện có.
interface QuickCallLinkProps {
  lead: Lead;
  onAutoNoDemand?: (leadName: string) => void;
  onLogged?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function QuickCallLink({ lead, onAutoNoDemand, onLogged, className, children }: QuickCallLinkProps) {
  const handleClick = () => {
    logInteraction({
      leadId: lead.id,
      channel: "call",
      content: "Bấm gọi nhanh từ danh sách Lead (chưa xác nhận kết quả cuộc gọi)",
      isMissedCall: true,
    }).then((res) => {
      if (res && !res.error) {
        onLogged?.();
        if (res.autoNoDemand) {
          onAutoNoDemand?.(lead.full_name);
        }
      }
    });
  };

  return (
    <a href={`tel:${lead.phone}`} onClick={handleClick} className={className} title="Gọi điện">
      {children}
    </a>
  );
}

// Liên kết Facebook: hiện link thật nếu Lead đã có facebook_url, hoặc nút
// "+ Thêm" để Sale nhập nhanh (không tự suy ra link Facebook từ SĐT như
// Zalo — không có cơ chế nào để làm vậy đúng thực tế, xem AGENTS.md 11.1).
interface QuickFacebookLinkProps {
  lead: Lead;
  onSaved?: () => void;
  onLinkClick?: () => void;
  className?: string;
  addClassName?: string;
}

export function QuickFacebookLink({ lead, onSaved, onLinkClick, className, addClassName }: QuickFacebookLinkProps) {
  if (lead.facebook_url) {
    return (
      <a
        href={lead.facebook_url}
        target="_blank"
        rel="noopener noreferrer"
        title="Nhắn tin Facebook"
        onClick={onLinkClick}
        className={className}
      >
        <Facebook className="w-3 h-3" /> Facebook
      </a>
    );
  }

  const handleAddLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.prompt("Dán link Facebook / Messenger của phụ huynh/học sinh:");
    if (!url?.trim()) return;
    const res = await updateLead(lead.id, { facebookUrl: url.trim() });
    if (res?.error) {
      alert(res.error);
      return;
    }
    onSaved?.();
  };

  return (
    <button type="button" onClick={handleAddLink} title="Thêm link Facebook" className={addClassName}>
      <Facebook className="w-3 h-3" /> + Facebook
    </button>
  );
}
