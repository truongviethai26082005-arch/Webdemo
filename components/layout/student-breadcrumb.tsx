"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItemConfig {
  group: string;
  label: string;
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItemConfig> = {
  dashboard: { group: "Tổng quan", label: "Tiến độ học tập" },
  schedule: { group: "Học tập", label: "Lịch học" },
  classes: { group: "Học tập", label: "Danh sách lớp học" },
  assignments: { group: "Học tập", label: "Bài tập về nhà" },
  resources: { group: "Học tập", label: "Thư viện tài liệu" },
  tests: { group: "Học tập", label: "Lịch hẹn test" },
  grades: { group: "Học tập", label: "Bảng điểm & Đánh giá" },
  notifications: { group: "Hỗ trợ", label: "Tin tức & Cảnh báo" },
  feedback: { group: "Hỗ trợ", label: "Gửi phản hồi" },
  settings: { group: "Hỗ trợ", label: "Cài đặt tài khoản" },
};

export function StudentBreadcrumb() {
  const pathname = usePathname() || "";

  // Tách các segment từ URL, ví dụ: "/student/schedule" -> ["student", "schedule"]
  const segments = pathname.split("/").filter(Boolean);

  // Nếu ở trang gốc /student hoặc /student/dashboard thì ẩn breadcrumb để khớp mockup
  const slug = segments[1] || "dashboard";
  if (slug === "dashboard") {
    return null;
  }

  const breadcrumb = BREADCRUMB_MAP[slug] || {
    group: "Học tập",
    label: slug,
  };

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 select-none max-w-7xl mx-auto w-full">
      <span className="text-slate-500 font-normal">{breadcrumb.group}</span>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-slate-800 font-medium dark:text-slate-200">
        {breadcrumb.label}
      </span>
    </div>
  );
}
