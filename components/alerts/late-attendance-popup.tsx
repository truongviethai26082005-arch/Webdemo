"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlarmClock, X } from "lucide-react";
import { getLateAttendanceSessions, type LateSession } from "@/lib/actions/operation-alerts";

// Thông báo nổi "ca trễ > 10 phút chưa điểm danh". Gắn ở layout Admin nên chỉ
// kiểm tra 1 lần mỗi khi Admin mở/tải lại trang (layout không remount khi
// chuyển trang bên trong /admin).
export function LateAttendancePopup() {
  const [sessions, setSessions] = useState<LateSession[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getLateAttendanceSessions().then((result) => {
      if ("error" in result) return;
      setSessions(result.sessions);
      setOpen(result.sessions.length > 0);
    });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl border border-red-500/40 bg-card shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlarmClock className="w-4 h-4" />
          <p className="text-sm font-bold">{sessions.length} ca trễ &gt; 10 phút chưa điểm danh</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <ul className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
        {sessions.map((s) => (
          <li key={s.id} className="text-xs text-foreground">
            <Link href={`/admin/classes/${s.classId}`} onClick={() => setOpen(false)} className="hover:underline">
              <span className="font-semibold">{s.className}</span> ({s.startTime}) — trễ {s.minutesLate} phút
              {s.teacherName && <span className="text-muted-foreground"> · GV {s.teacherName}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/admin/dashboard"
        onClick={() => setOpen(false)}
        className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
      >
        Xem toàn bộ cảnh báo ở Tổng quan →
      </Link>
    </div>
  );
}
