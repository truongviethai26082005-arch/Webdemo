"use client";

import {
  Award,
  GraduationCap,
  Users2,
  ThumbsUp,
  ShieldCheck,
  Trophy,
} from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      icon: Award,
      value: "10+",
      label: "Năm kinh nghiệm đào tạo",
      isLarge: true,
    },
    {
      icon: GraduationCap,
      value: "50.000+",
      label: "Học viên thành xuất sắc",
      isLarge: true,
    },
    {
      icon: Users2,
      value: "100+",
      label: "Giảng viên bản ngữ TESOL",
      isLarge: true,
    },
    {
      icon: ThumbsUp,
      value: "80.000+",
      label: "Lượt theo dõi mạng xã hội",
      isLarge: true,
    },
    {
      icon: ShieldCheck,
      value: "Top 3+",
      label: "Trung tâm uy tín Hà Nội",
      isLarge: true,
    },
    {
      icon: Trophy,
      value: "Giải Thưởng",
      label: "Top 10 Thương hiệu uy tín",
      isLarge: false,
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-[#f4f7fc] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-9">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
            Dấu Ấn 10 Năm
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0c2356] font-heading mt-1">
            Những Con Số Ấn Tượng Của Talk Class
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 text-center">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#ff9f1c] flex items-center justify-center mb-2.5 group-hover:scale-105 group-hover:bg-[#ff9f1c] group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`font-extrabold text-[#0c2356] font-heading tracking-tight ${
                    item.isLarge ? "text-2xl sm:text-[28px]" : "text-lg sm:text-xl leading-tight"
                  }`}
                >
                  {item.value}
                </span>
                <span className="text-xs text-slate-500 mt-1 leading-snug font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
