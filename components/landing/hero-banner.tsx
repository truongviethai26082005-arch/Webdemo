"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Award,
  GraduationCap,
  Building2,
  Coffee,
  ShieldCheck,
} from "lucide-react";

interface HeroSlide {
  id: number;
  tag: string;
  isCustomHero?: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  bgImage?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "Kỷ Niệm 10 Năm Thành Lập",
    isCustomHero: true,
    title: "10 Năm Đào Tạo Tiếng Anh Giao Tiếp Bản Ngữ",
    subtitle: "Dành cho Sinh viên, Người đi làm & Doanh nghiệp",
    description:
      "Hệ thống đào tạo phản xạ giao tiếp tiếng Anh chuyên sâu cùng 100% giáo viên bản ngữ chuẩn quốc tế CELTA & TESOL tại Hà Nội.",
    ctaText: "Đăng ký test trình độ miễn phí",
    ctaLink: "#dang-ky",
    secondaryCtaText: "Xem các khóa học",
    secondaryCtaLink: "#khoa-hoc",
  },
  {
    id: 2,
    tag: "Chất Lượng Học Thuật",
    title: "100% Giảng Viên Bản Ngữ Có Chứng Chỉ Quốc Tế",
    subtitle: "Giảng viên từ Anh, Mỹ, Úc với bằng cấp CELTA & TESOL",
    description:
      "Phương pháp phản xạ tương tác tự nhiên, chỉnh sửa ngữ âm chuyên sâu từng học viên. Tự tin nói tiếng Anh lưu loát mà không còn rào cản e ngại.",
    ctaText: "Xem đội ngũ giảng viên",
    ctaLink: "#giang-vien",
    secondaryCtaText: "Đăng ký test thử",
    secondaryCtaLink: "#dang-ky",
    bgImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuByKKpyO9qzkwdn3xpg2S1_h-bXW0E9vc6kbSVq1Bfut-kZwTRIgomSLxUraVzXhqNKtw4eCvaON8sBB4mANmFG6X4mmi55mTZ5uH745JqCHYuuaZHe4id3qg0jFziNz0AGld7HD0plpJHn8MujW5bmyMW79hFt4b_JG8C9zE9QtBu0cK18JBFOHlYx7dxXaXRcnL1KDWlBvGoQBQ40k0UAXc8koBdWImUoRYczaOyMRXub0Y88dE1W",
  },
  {
    id: 3,
    tag: "Thực Hành Thực Tế",
    title: "Hoạt Động Ngoại Khóa Cafe Tây Hàng Tuần",
    subtitle: "Giao lưu thực chiến cùng du khách quốc tế tại Hà Nội",
    description:
      "Tham gia hoàn toàn miễn phí câu lạc bộ Cafe Tây và săn Tây bờ hồ mỗi tuần. Ứng dụng ngay từ vựng và phản xạ vào những cuộc trò chuyện đời thực sống động.",
    ctaText: "Khám phá Cafe Tây",
    ctaLink: "#ngoai-khoa",
    secondaryCtaText: "Đăng ký tham gia",
    secondaryCtaLink: "#dang-ky",
    bgImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBK_xQQkFJLp4jAMY_ipbk0B8JX_DfEbrno27fxo9w_84l6kj0Hy_kHS8htkvbNSZprM2Sh5JyJKqkRgE0-VQuLY2FHMhDZDOP_EWpyGDMHw2-Y27Ej5VaRUZN5f0ETvZ5w3-AUhj4mYeZxK-CCUhaLt7K8LzhQ6inis1AzhQHZzJoTJzuFmsCgriK9ksLHorw3PQeJPrQhIJz8GAdQ8hYkQr0ti5bsqB7pzy_7MiafWnwGOWTXGVap",
  },
];

const TRUST_PARTNERS = [
  { name: "FPT Telecom", desc: "Tập đoàn công nghệ" },
  { name: "LadiPage", desc: "Nền tảng chuyển đổi" },
  { name: "Cedo Tech", desc: "Tập đoàn công nghệ quốc tế" },
  { name: "Viedoc", desc: "Y tế & Dược phẩm" },
  { name: "Tecotec", desc: "Công nghệ đo lường" },
  { name: "Nextone", desc: "Giải pháp phần mềm" },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full bg-[#071738] overflow-hidden select-none">
      <div className="w-full max-w-[1920px] mx-auto relative group">
        {/* SLIDE CONTENT AREA */}
        <div className="relative min-h-[540px] sm:min-h-[580px] lg:min-h-[620px] flex items-center">
          {activeSlide.isCustomHero ? (
            /* SLIDE 1: CODED 10-YEAR HERO BANNER (NO SCREENSHOT IMAGE) */
            <div className="w-full h-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#061430] via-[#0c2356] to-[#071942] flex items-center transition-all duration-500 animate-in fade-in">
              {/* Subtle Ambient Glows */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff9f1c]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,159,28,0.06)_0,transparent_70%)] pointer-events-none" />

              <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Left Column: Headline, Bullets, CTA, Trust Badges */}
                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  {/* Badge Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff9f1c]/15 border border-[#ff9f1c]/30 text-[#ffaa00] text-xs font-semibold tracking-normal mb-4 shadow-sm backdrop-blur-sm whitespace-nowrap shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff9f1c]" />
                    <span>Hệ thống Tiếng Anh Giao Tiếp Bản Ngữ Talk Class</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white leading-tight sm:leading-[1.15] tracking-tight font-heading">
                    <span className="text-[#ff9f1c] drop-shadow-sm">10 Năm</span>{" "}
                    Đào Tạo Tiếng Anh Giao Tiếp Bản Ngữ
                  </h1>

                  {/* Subtitle / Focus groups */}
                  <p className="mt-3 text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal">
                    Giải pháp phản xạ nghe nói tự nhiên, tự tin bứt phá dành cho:
                  </p>

                  {/* Target Audience Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-white text-xs sm:text-[13px] font-medium backdrop-blur-sm whitespace-nowrap shrink-0">
                      <GraduationCap className="w-3.5 h-3.5 text-[#ffaa00]" />
                      Sinh viên & Người mất gốc
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-white text-xs sm:text-[13px] font-medium backdrop-blur-sm whitespace-nowrap shrink-0">
                      <Users className="w-3.5 h-3.5 text-[#ffaa00]" />
                      Người đi làm công sở
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-white text-xs sm:text-[13px] font-medium backdrop-blur-sm whitespace-nowrap shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-[#ffaa00]" />
                      Doanh nghiệp & Tập đoàn
                    </span>
                  </div>

                  {/* 3 Core Commitments */}
                  <div className="mt-6 space-y-2 w-full">
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#ff9f1c] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white font-semibold">100% Giảng viên bản ngữ</strong> có chứng chỉ quốc tế CELTA, TESOL từ Anh, Mỹ, Úc.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#ff9f1c] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white font-semibold">Cam kết phản xạ sau 3 tháng</strong> — nắn chuẩn phát âm IPA, phản xạ không cần dịch nhẩm.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#ff9f1c] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white font-semibold">CLB Ngoại khóa Cafe Tây miễn phí</strong> thực hành giao tiếp thực chiến hàng tuần.
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <a
                      href="#dang-ky"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff9f1c] hover:bg-[#e68a0f] text-white font-semibold text-sm shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    >
                      <span>Đăng ký test trình độ miễn phí</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </a>
                    <a
                      href="#khoa-hoc"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 backdrop-blur-sm transition-all whitespace-nowrap shrink-0"
                    >
                      <span>Xem lộ trình khóa học</span>
                    </a>
                  </div>

                  {/* Trusted Enterprise Partners Row */}
                  <div className="mt-8 pt-6 border-t border-white/10 w-full">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
                      Đối tác đào tạo & tuyển dụng tiêu biểu:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {TRUST_PARTNERS.map((partner) => (
                        <div
                          key={partner.name}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:border-white/30 text-slate-200 text-xs font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0"
                          title={partner.desc}
                        >
                          {partner.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Academic Showcase Cards */}
                <div className="lg:col-span-5 flex flex-col gap-4 relative">
                  {/* Highlight Feature Card 1 */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group hover:border-white/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#ffaa00]" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffaa00]">
                          Uy Tín 10 Năm
                        </span>
                      </div>
                      <span className="text-[11px] font-bold bg-[#ff9f1c] text-white px-2.5 py-0.5 rounded-full">
                        Hà Nội
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug font-heading">
                      Top 3 Trung Tâm Tiếng Anh Giao Tiếp Hàng Đầu
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-300 mt-2 leading-relaxed">
                      Đã đồng hành và thay đổi khả năng nói tiếng Anh cho hơn <strong className="text-white">50.000+</strong> học viên từ mất gốc đến giao tiếp lưu loát trong môi trường quốc tế.
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/5 rounded-xl p-2.5">
                        <div className="text-xl font-extrabold text-[#ffaa00] font-heading">50K+</div>
                        <div className="text-[11px] text-slate-300 font-medium">Học viên</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5">
                        <div className="text-xl font-extrabold text-[#ffaa00] font-heading">100%</div>
                        <div className="text-[11px] text-slate-300 font-medium">Bản ngữ</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5">
                        <div className="text-xl font-extrabold text-[#ffaa00] font-heading">98%</div>
                        <div className="text-[11px] text-slate-300 font-medium">Hài lòng</div>
                      </div>
                    </div>
                  </div>

                  {/* Highlight Feature Card 2 */}
                  <div className="bg-gradient-to-r from-orange-500/20 via-[#ff9f1c]/15 to-transparent border border-[#ff9f1c]/30 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#ff9f1c] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">CLB Ngoại Khóa Cafe Tây</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">Thực hành tương tác cùng du khách ngoại quốc mỗi tuần</p>
                      </div>
                    </div>
                    <a
                      href="#ngoai-khoa"
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 transition-colors"
                    >
                      Chi tiết
                    </a>
                  </div>

                  {/* Guarantee Pill */}
                  <div className="flex items-center justify-center gap-2 text-xs font-normal text-slate-300 bg-black/20 backdrop-blur-sm py-2 px-3 rounded-lg border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-[#ffaa00] shrink-0" />
                    <span>Cam kết bảo hành kết quả đào tạo & học lại miễn phí nếu chưa đạt mục tiêu</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SLIDES 2 & 3: PHOTO BACKGROUND WITH ELEGANT DARK OVERLAY & CLEAN TYPOGRAPHY */
            <div className="w-full h-full relative min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden">
              {/* Background Image */}
              <img
                key={activeSlide.id}
                alt={activeSlide.title}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 animate-in fade-in duration-500"
                src={activeSlide.bgImage}
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#061430]/95 via-[#0c2356]/85 to-black/40" />

              {/* Slide Content Container */}
              <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="max-w-2xl text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff9f1c]/20 border border-[#ff9f1c]/40 text-[#ffaa00] text-xs font-semibold tracking-normal mb-3 whitespace-nowrap shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activeSlide.tag}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-tight sm:leading-[1.2] tracking-tight font-heading">
                    {activeSlide.title}
                  </h2>

                  <p className="mt-2 text-sm sm:text-base text-[#ffaa00] font-semibold">
                    {activeSlide.subtitle}
                  </p>

                  <p className="mt-3 text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                    {activeSlide.description}
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href={activeSlide.ctaLink}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff9f1c] hover:bg-[#e68a0f] text-white font-semibold text-sm shadow-md transition-all whitespace-nowrap shrink-0"
                    >
                      <span>{activeSlide.ctaText}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </a>
                    {activeSlide.secondaryCtaText && (
                      <a
                        href={activeSlide.secondaryCtaLink}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 backdrop-blur-sm transition-all whitespace-nowrap shrink-0"
                      >
                        <span>{activeSlide.secondaryCtaText}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SLIDER NAVIGATION ARROWS */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg focus:outline-none z-20"
          aria-label="Slide trước"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg focus:outline-none z-20"
          aria-label="Slide kế tiếp"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* SLIDER DOTS / INDICATORS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full z-20 border border-white/10">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                currentSlide === idx
                  ? "w-8 bg-[#ff9f1c]"
                  : "w-2.5 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Chuyển tới slide ${idx + 1}: ${slide.tag}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
