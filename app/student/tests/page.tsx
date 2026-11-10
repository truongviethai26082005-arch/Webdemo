import { getStudentTests } from "@/lib/actions/student";
import { StudentTestsClient } from "./tests-client";
import { CalendarCheck, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lịch hẹn test | Cổng Học sinh",
};

export default async function StudentTestsPage() {
  const data = await getStudentTests();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER TRANG CHUẨN 100% ẢNH MẪU */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-50/90 via-blue-50/50 to-indigo-50/50 dark:from-card dark:via-card/90 dark:to-card border border-sky-100/80 dark:border-border p-6 sm:p-7 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        {/* Bên trái: Icon squircle gradient + Tiêu đề + Mô tả */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#38bdf8] via-[#3b82f6] to-[#6366f1] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-foreground tracking-tight">
              Lịch hẹn test
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
              Theo dõi danh sách ca thi thử sắp tới, xem quy chế phòng thi và tra cứu kết quả đánh giá năng lực
            </p>
          </div>
        </div>

        {/* Bên phải: Badge Khảo thí chuẩn hóa + Minh họa 3D vector lịch để bàn & bút */}
        <div className="flex items-center gap-4 z-10 self-start sm:self-auto">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-4 py-2 rounded-full font-semibold shadow-xs flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Khảo thí chuẩn hóa</span>
          </div>

          {/* Minh họa 3D vector lịch để bàn kèm bút viết chuẩn ảnh mẫu */}
          <div className="hidden lg:flex items-center justify-center pointer-events-none select-none opacity-95 pr-2">
            <svg width="150" height="75" viewBox="0 0 150 75" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 20L25 16M28 32L18 32M34 44L24 48" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="86" cy="64" rx="42" ry="6" fill="#e0e7ff" fillOpacity="0.6" />
              <path d="M50 16L116 10L126 58L58 64L50 16Z" fill="#3b82f6" />
              <path d="M54 18L114 12L122 56L62 62L54 18Z" fill="#ffffff" />
              <rect x="64" y="12" width="4" height="8" rx="2" fill="#2563eb" />
              <rect x="78" y="11" width="4" height="8" rx="2" fill="#2563eb" />
              <rect x="92" y="10" width="4" height="8" rx="2" fill="#2563eb" />
              <rect x="106" y="9" width="4" height="8" rx="2" fill="#2563eb" />
              <path d="M68 26L72 30L80 22" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M86 25L90 29L98 21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M104 24L108 28L116 20" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M70 38L74 42L82 34" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M88 37L92 41L100 33" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M106 36L110 40L118 32" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M72 50L76 54L84 46" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M90 49L94 53L102 45" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M128 24L136 18L140 22L132 28L128 24Z" fill="#1d4ed8" />
              <path d="M132 28L116 60L112 58L128 24L132 28Z" fill="#2563eb" />
              <path d="M112 58L116 60L110 65L112 58Z" fill="#60a5fa" />
              <line x1="120" y1="42" x2="124" y2="44" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG CHÍNH (CLIENT COMPONENT) */}
      <StudentTestsClient initialData={data} />
    </div>
  );
}
