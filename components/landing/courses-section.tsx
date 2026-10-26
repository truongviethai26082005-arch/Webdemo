"use client";

import { Clock, Calendar, Building2, ArrowRight, Sparkles } from "lucide-react";

export function CoursesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white" id="khoa-hoc">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
            Chương Trình Đào Tạo
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0c2356] font-heading mt-1">
            Các Khóa Học Tiêu Biểu Tại Talk Class
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
            Thiết kế chuyên biệt cho từng trình độ từ mất gốc đến giao tiếp nâng cao công sở
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* COURSE CARD 1: MẤT GỐC */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative overflow-hidden bg-slate-900 aspect-[16/10]">
                <img
                  alt="Khóa Tiếng Anh Giao Tiếp Cơ Bản & Mất Gốc"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr3lLTODE9ajwxdj9jLeWx8iFz8kQJGgvCH60KqmpejkEmdC0HyGYQSnRJko0GooW7diN8Mtn8xUkrVM5DarDcOQ0nzTe-cJdGHNmi8MV_Np3c1wHzZ2OUYRxLRV26Vt8Maeln0lo7HJTaDx_C7YnPG2yeEg0ZaZM7Y8aTpXEDJeVZqdIyqNQSL2ooW9g5jqKKpYjUVluAAcnYHzikKee527vYSqWNwkXYtnHnujYOxpACzrF-UgZd"
                />
                <span className="absolute top-3 left-3 bg-[#0c2356] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
                  Offline & Online
                </span>
                <span className="absolute top-3 right-3 bg-[#ff9f1c] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
                  Giảm 25%
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0c2356] group-hover:text-[#ff8c00] transition-colors leading-snug font-heading">
                  Tiếng Anh Giao Tiếp Cơ Bản & Mất Gốc
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 my-3 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    36 buổi (100% GV Bản ngữ)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    2 buổi/tuần
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  Tại trình độ này, học viên được nắn chỉnh IPA từng âm tiết, xây dựng 800+ từ vựng thông dụng và tự tin giao tiếp các chủ đề đời sống với người nước ngoài.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <a
                className="w-full py-2.5 rounded-lg bg-[#ff9f1c] hover:bg-[#e68a0f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow group/btn"
                href="#dang-ky"
              >
                <span>Xem chi tiết & nhận ưu đãi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* COURSE CARD 2: NÂNG CAO (FEATURED) */}
          <div className="bg-white rounded-2xl border-2 border-[#0c2356] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative md:-translate-y-2">
            <div className="absolute top-0 right-0 bg-[#0c2356] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-normal z-10 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ffaa00]" />
              <span>Khóa học nổi bật nhất</span>
            </div>

            <div>
              <div className="relative overflow-hidden bg-slate-900 aspect-[16/10]">
                <img
                  alt="Khóa Tiếng Anh Giao Tiếp Nâng Cao & Thuyết Trình"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqGA9Xfl5y5alujPjRmyoxi1Yz_RkF9Q9QeEEkwsQWNOK8ttYDaN_LhyLxC8DxQb-AQyI4H9QM_DNVKoxTQbJJwe6BGGDGMRHH8DhA2BYDEUX2xwXkUCkO5pQ9O-UXVZYw70Vw_FuKKVkjPUSVLQvDN1a81wDGBP1MGGM6J2e6XNKzQfHrgc3rRGlgeA26zkRvONi7Oyuz-VC8dk3lsQTqOmaRS3-wdgW5UnzsjQO63EqtO4h4Urx7"
                />
                <span className="absolute top-3 left-3 bg-[#0c2356] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
                  Offline & Online
                </span>
                <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-md">
                  Bán chạy nhất
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0c2356] group-hover:text-[#ff8c00] transition-colors leading-snug font-heading">
                  Giao Tiếp Nâng Cao & Thuyết Trình Công Sở
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 my-3 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    36 buổi (100% GV Bản ngữ)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    2 buổi/tuần
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  Dành cho người đã có nền tảng cơ bản, muốn bứt phá phản xạ tức thì, thuyết trình công việc lưu loát, đàm phán hợp đồng và viết email chuyên nghiệp.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <a
                className="w-full py-2.5 rounded-lg bg-[#0c2356] hover:bg-[#1a469d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg group/btn"
                href="#dang-ky"
              >
                <span>Xem chi tiết & nhận ưu đãi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* COURSE CARD 3: DOANH NGHIỆP */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative overflow-hidden bg-slate-900 aspect-[16/10]">
                <img
                  alt="Khóa Đào Tạo Doanh Nghiệp & 1 Kèm 1 VIP"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBolLPO6wvXh1bP04x83km0sYmbE1bWU1iMOmgr5deJ4GvNxR_wcgLmwwD3-KDYXBzpyHv-jcWCIrGDIrSfldnH_YssXoasA5du6JZACIGGL-xKpPjr30oVfNySqEbrSdVt1UVSJl4ue3L9KOKlyO_4nib9nWJ5qNBbUWjKOj0i7vfdt6T2K-H3muIvemZYbXjDVI3_VKKzapjUlDLi0liEbkX3erkeAZ475NhxxT4hX8iLq2uWNpYV"
                />
                <span className="absolute top-3 left-3 bg-[#0c2356] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
                  Doanh nghiệp / VIP
                </span>
                <span className="absolute top-3 right-3 bg-[#ff9f1c] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
                  Thiết kế riêng
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#0c2356] group-hover:text-[#ff8c00] transition-colors leading-snug font-heading">
                  Tiếng Anh Doanh Nghiệp & Kèm 1-1 Chuyên Sâu
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 my-3 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    Linh hoạt theo lịch
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    Tại cty hoặc Online
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  Chương trình được may đo theo đặc thù ngành hàng (IT, Sản xuất, Bất động sản, Thương mại) - đã đào tạo cho FPT, Ladipage, Cedo, Viedoc, Tecotec...
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <a
                className="w-full py-2.5 rounded-lg bg-[#ff9f1c] hover:bg-[#e68a0f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow group/btn"
                href="#dang-ky"
              >
                <span>Xem chi tiết & nhận ưu đãi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
