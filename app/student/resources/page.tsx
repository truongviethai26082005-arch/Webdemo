import { getStudentResources } from "@/lib/actions/student";
import { StudentResourcesClient } from "./resources-client";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thư viện tài liệu | Cổng Học sinh",
};

export default async function StudentResourcesPage() {
  const resources = await getStudentResources();

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. BANNER TIÊU ĐỀ TRÊN CÙNG (Chuẩn 100% thiết kế mẫu) */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/60 dark:from-card dark:via-card/90 dark:to-card border border-blue-100/60 dark:border-border p-5 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        {/* Bên trái: Icon quyển sách nền gradient xanh tím + Tiêu đề + Mô tả */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white flex items-center justify-center p-3 shadow-md shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-800 dark:text-foreground tracking-tight">
              Thư viện tài liệu học tập
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              Kho giáo trình điện tử, slide bài giảng, file PDF và học liệu bổ trợ từ các lớp học của bạn
            </p>
          </div>
        </div>

        {/* Ở giữa: Minh họa 3D vector chồng sách xanh tím & chậu cây xanh nhỏ */}
        <div className="hidden lg:flex items-center justify-center pointer-events-none select-none opacity-90 pr-4 z-0">
          <svg width="150" height="74" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Vệt sáng lấp lánh tím bên trái */}
            <path d="M35 22L30 18M32 34L22 34M38 46L28 50" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Quyển sách tím bên dưới (góc nghiêng isometric) */}
            <path d="M42 46L82 28L124 44L84 62L42 46Z" fill="#6366f1" />
            <path d="M42 46L42 56L84 72L84 62L42 46Z" fill="#4f46e5" />
            <path d="M84 62L84 72L124 54L124 44L84 62Z" fill="#e0e7ff" />
            <line x1="86" y1="67" x2="120" y2="52" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Quyển sách xanh dương bên trên */}
            <path d="M50 34L88 18L126 32L88 48L50 34Z" fill="#3b82f6" />
            <path d="M50 34L50 42L88 56L88 48L50 34Z" fill="#1d4ed8" />
            <path d="M88 48L88 56L126 40L126 32L88 48Z" fill="#f8fafc" />
            <path d="M68 32L88 24L104 30L84 38L68 32Z" fill="#ffffff" fillOpacity="0.4" />

            {/* Chậu cây xanh nhỏ xíu bên phải */}
            <ellipse cx="132" cy="56" rx="14" ry="4" fill="#e2e8f0" />
            <path d="M122 42H142L139 60H125L122 42Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M132 42C126 32 124 20 132 12C134 22 132 32 132 42Z" fill="#34d399" />
            <path d="M132 42C138 34 144 24 140 14C136 24 133 34 132 42Z" fill="#10b981" />
            <path d="M132 42C124 38 116 32 120 22C126 28 130 36 132 42Z" fill="#059669" />
          </svg>
        </div>

        {/* Bên phải: Badge Tổng cộng số tài liệu dạng pill xanh nổi bật */}
        <div className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs px-4 py-2 rounded-full font-semibold shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all z-10">
          <BookOpen className="w-3.5 h-3.5 text-white" />
          <span>
            Tổng cộng: {resources.length} tài liệu
          </span>
        </div>
      </div>

      {/* 2. GIAO DIỆN TƯƠNG TÁC (CLIENT COMPONENT) */}
      <StudentResourcesClient initialResources={resources} />
    </div>
  );
}
