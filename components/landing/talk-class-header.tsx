"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Search,
  ChevronDown,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

interface TalkClassHeaderProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  onOpenLoginModal: () => void;
  onOpenRegisterModal?: () => void;
}

export function TalkClassHeader({
  isLoggedIn,
  dashboardUrl,
  onOpenLoginModal,
}: TalkClassHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* MAIN STICKY HEADER */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all duration-200 ${
          isScrolled ? "shadow-md py-2.5" : "shadow-sm py-3"
        }`}
      >
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 xl:gap-6">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <img
              alt="Talk Class Logo"
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJnIpqevJmX7pwM0lubsC8LtjDeHQfi8tfWiH_XIPjrJlDiz0qrmNCm5WJ4b084PHLGMUmKrqvwfz5To7mOUgJPDwDXFrAShDx1_Ipxw1Ymoc3iuvRgXxWi4khEC-1LjV3dUYPnm5sHJReda0FANJ6-xBt6OWVE4Nxq2FypgOditbyqvgMIUP7x5IKJjItuO_NUna10-E8AG4Z9UWRM6fZ6Izn-Id_rEAmJ3WCUVLFtniAGhhkNP4rGHn_LZ6eeueLnQ"
            />
          </Link>

          {/* DESKTOP NAVIGATION MENU */}
          <nav className="hidden lg:flex items-center gap-2.5 xl:gap-4 2xl:gap-5 text-[13px] font-semibold text-slate-700 shrink-0 tracking-tight">
            <Link
              href="#"
              className="text-[#ff9f1c] border-b-2 border-[#ff9f1c] pb-0.5 font-bold whitespace-nowrap shrink-0"
            >
              Trang chủ
            </Link>

            {/* DROPDOWN KHÓA HỌC */}
            <div
              className="relative py-2 whitespace-nowrap shrink-0"
              onMouseEnter={() => setCourseDropdownOpen(true)}
              onMouseLeave={() => setCourseDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#0c2356] transition-colors focus:outline-none whitespace-nowrap shrink-0 font-semibold"
                onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              >
                <span>Khóa học</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
                    courseDropdownOpen ? "rotate-180 text-[#0c2356]" : ""
                  }`}
                />
              </button>

              {courseDropdownOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <a
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0c2356] border-b border-slate-50 transition-colors"
                    href="#khoa-hoc"
                    onClick={() => setCourseDropdownOpen(false)}
                  >
                    <div className="font-semibold text-slate-900 tracking-tight">Tiếng Anh Giao Tiếp Mất Gốc</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Nắn chuẩn IPA, phản xạ 800+ từ vựng</div>
                  </a>
                  <a
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0c2356] border-b border-slate-50 transition-colors"
                    href="#khoa-hoc"
                    onClick={() => setCourseDropdownOpen(false)}
                  >
                    <div className="font-semibold text-slate-900 tracking-tight">Giao Tiếp Nâng Cao & Công Sở</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Thuyết trình, đàm phán & viết email chuẩn</div>
                  </a>
                  <a
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0c2356] border-b border-slate-50 transition-colors"
                    href="#khoa-hoc"
                    onClick={() => setCourseDropdownOpen(false)}
                  >
                    <div className="font-semibold text-slate-900 tracking-tight">Tiếng Anh Cho Người Lớn Tuổi</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Học chậm, nhớ lâu, tự tin giao tiếp du lịch</div>
                  </a>
                  <a
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0c2356] transition-colors"
                    href="#khoa-hoc"
                    onClick={() => setCourseDropdownOpen(false)}
                  >
                    <div className="font-semibold text-slate-900 tracking-tight">Tiếng Anh Doanh Nghiệp & 1 Kèm 1</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">May đo theo FPT, Ladipage, Cedo...</div>
                  </a>
                </div>
              )}
            </div>

            <a className="hover:text-[#0c2356] transition-colors whitespace-nowrap shrink-0" href="#gioi-thieu">
              Giới thiệu
            </a>
            <a className="hover:text-[#0c2356] transition-colors whitespace-nowrap shrink-0" href="#khoa-hoc">
              Lộ trình học
            </a>
            <a className="hover:text-[#0c2356] transition-colors whitespace-nowrap shrink-0" href="#giang-vien">
              Giảng viên
            </a>
            <a className="hover:text-[#0c2356] transition-colors whitespace-nowrap shrink-0" href="#ngoai-khoa">
              CLB Cafe Tây
            </a>
            <a
              className="text-red-600 hover:text-red-700 flex items-center gap-1.5 font-bold whitespace-nowrap shrink-0"
              href="#dang-ky"
            >
              <span>Ưu đãi</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </a>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
            {/* SEARCH BUTTON */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-slate-500 hover:text-[#0c2356] hover:bg-slate-100 rounded-full transition-colors shrink-0"
                title="Tìm kiếm khóa học"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm khóa học, giáo viên..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs space-y-1">
                      <a
                        href="#khoa-hoc"
                        onClick={() => setSearchOpen(false)}
                        className="block px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        🔎 Tìm kiếm: &ldquo;{searchQuery}&rdquo;
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* HOTLINE BUTTON */}
            <a
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#ff8c00] hover:text-[#e07b00] border border-[#ff8c00]/30 rounded-lg bg-orange-50/60 transition-all hover:bg-orange-100/60 shadow-xs whitespace-nowrap shrink-0"
              href="tel:0984022247"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0984 022 247</span>
            </a>

            {/* LMS LOGIN / DASHBOARD BUTTON */}
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Bảng điều khiển</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-700 hover:text-[#0c2356] hover:bg-slate-100 text-xs font-medium border border-slate-200 transition-all whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập LMS</span>
              </button>
            )}

            {/* ĐĂNG KÝ TEST THỬ CTA */}
            <a
              className="inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg bg-[#0c2356] text-white text-xs font-semibold hover:bg-[#1a469d] shadow-sm hover:shadow transition-all group whitespace-nowrap shrink-0"
              href="#dang-ky"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ffaa00] group-hover:rotate-12 transition-transform" />
              <span>Đăng ký test thử</span>
            </a>

            {/* MOBILE BURGER TOGGLE */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#0c2356] hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              aria-label="Mở menu di động"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <Link
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-orange-50 text-[#ff8c00] font-semibold"
              >
                Trang chủ
              </Link>
              <a
                href="#khoa-hoc"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#0c2356]"
              >
                Các khóa học
              </a>
              <a
                href="#gioi-thieu"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#0c2356]"
              >
                Giới thiệu Talk Class
              </a>
              <a
                href="#giang-vien"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#0c2356]"
              >
                Đội ngũ giảng viên
              </a>
              <a
                href="#ngoai-khoa"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[#0c2356]"
              >
                CLB Cafe Tây hàng tuần
              </a>
              <a
                href="#dang-ky"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 flex items-center justify-between"
              >
                <span>Ưu đãi tháng</span>
                <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  Giảm 25%
                </span>
              </a>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href="tel:0984022247"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#ff8c00]/30 bg-orange-50 text-[#ff8c00] text-xs font-bold"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hotline: 0984 022 247</span>
                </a>

                {isLoggedIn ? (
                  <Link
                    href={dashboardUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Bảng điều khiển quản lý</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập hệ thống LMS</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
