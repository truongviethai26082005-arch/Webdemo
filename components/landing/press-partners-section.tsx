"use client";

export function PressPartnersSection() {
  return (
    <section className="py-14 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
          Truyền Thông & Đối Tác
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c2356] font-heading mt-1 mb-8">
          Báo Chí & Truyền Thông Nói Gì Về Talk Class
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-85">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-red-600 flex items-center gap-1.5 hover:opacity-100 transition-opacity">
            <span>VTV</span>
            <span className="text-slate-400 text-[11px] font-normal border border-slate-200 px-1.5 py-0.5 rounded">
              Đài truyền hình
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-bold tracking-tight text-red-700 hover:opacity-100 transition-opacity">
            Cafe<span className="text-blue-800">biz</span>
          </div>

          <div className="text-base sm:text-lg font-bold tracking-tight text-slate-700 hover:text-[#0c2356] transition-colors">
            Tạp Chí Điện Tử Sở Hữu Trí Tuệ
          </div>

          <div className="text-lg sm:text-xl font-black tracking-tighter text-blue-900 hover:text-blue-700 transition-colors">
            FPT Corporation
          </div>

          <div className="text-lg sm:text-xl font-bold text-slate-800 hover:text-black transition-colors">
            Ladi<span className="text-blue-600">Page</span>
          </div>
        </div>
      </div>
    </section>
  );
}
