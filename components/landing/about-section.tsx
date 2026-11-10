"use client";

import { useState } from "react";
import {
  Play,
  ArrowRight,
  History,
  Route,
  Laptop,
  Users2,
  Award,
  Coffee,
  X,
  Sparkles,
} from "lucide-react";

export function AboutSection() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const reasons = [
    {
      icon: History,
      title: "Hơn 10 năm kinh nghiệm đào tạo thực chiến",
      desc: "Xây dựng vị thế trung tâm tiếng Anh giao tiếp uy tín hàng đầu tại Hà Nội với hàng chục ngàn học viên tốt nghiệp.",
      highlight: true,
    },
    {
      icon: Route,
      title: "Lộ trình học khoa học, tiết kiệm thời gian",
      desc: "Giáo trình tinh gọn, tập trung 100% vào phản xạ nghe - nói đời sống & văn phòng, rút ngắn 50% thời gian so với cách học thụ động.",
    },
    {
      icon: Laptop,
      title: "Phương pháp học hiện đại Blended Learning",
      desc: "Kết hợp học trực tiếp tương tác cao trên lớp với hệ thống phần mềm online tự ôn luyện phản xạ & phát âm mọi lúc mọi nơi.",
    },
    {
      icon: Users2,
      title: "Mô hình học tập 3 KÈM 1 độc đáo",
      desc: "Giảng viên bản ngữ dạy chính + Trợ giảng chỉnh ngữ âm chi tiết + Quản lý lớp nhắc nhở hỗ trợ bài vở 24/7 cam kết tiến bộ.",
    },
    {
      icon: Award,
      title: "100% Giảng viên bản ngữ chuẩn quốc tế TESOL, CELTA",
      desc: "Thầy cô giàu năng lượng, tận tâm chỉnh từng khẩu hình, ngữ điệu tự nhiên như người bản xứ.",
    },
    {
      icon: Coffee,
      title: "Hoạt động ngoại khóa tiếng Anh \"Cafe Tây\" đặc sắc",
      desc: "Thực hành nói tiếng Anh tự nhiên trong môi trường cởi mở, không gian cafe thực tế hàng tuần hoàn toàn miễn phí.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-100" id="gioi-thieu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ROW 1: GIỚI THIỆU TALK CLASS & VIDEO THUMBNAIL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          {/* VIDEO CARD BÊN TRÁI */}
          <div className="lg:col-span-5 relative group">
            <div
              onClick={() => setVideoModalOpen(true)}
              className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 aspect-video flex items-center justify-center cursor-pointer group hover:shadow-2xl transition-all duration-300"
            >
              <img
                alt="Talk Class Lớp học giao tiếp với giáo viên bản ngữ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK_xQQkFJLp4jAMY_ipbk0B8JX_DfEbrno27fxo9w_84l6kj0Hy_kHS8htkvbNSZprM2Sh5JyJKqkRgE0-VQuLY2FHMhDZDOP_EWpyGDMHw2-Y27Ej5VaRUZN5f0ETvZ5w3-AUhj4mYeZxK-CCUhaLt7K8LzhQ6inis1AzhQHZzJoTJzuFmsCgriK9ksLHorw3PQeJPrQhIJz8GAdQ8hYkQr0ti5bsqB7pzy_7MiafWnwGOWTXGVap"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20 group-hover:from-black/75 transition-colors"></div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-[#ff9f1c] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#ffaa00] transition-all mb-3">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
                <span className="text-xs font-semibold text-white uppercase tracking-wider bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  Xem video lớp học thực tế
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-left">
                <span className="text-xs text-[#ffaa00] font-bold block">
                  Mr. Alfred - Senior Teacher
                </span>
                <span className="text-xs text-white/90 italic">
                  &ldquo;Phương pháp phản xạ trực tiếp giúp nói tiếng Anh tự nhiên không sợ sai&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* NỘI DUNG GIỚI THIỆU BÊN PHẢI */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-5 bg-[#ff9f1c]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
                Về Chúng Tôi
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0c2356] leading-tight font-heading">
              Talk Class — Tiếng Anh Giao Tiếp Bản Ngữ Thực Chiến
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Talk Class là hệ thống đào tạo tiếng Anh giao tiếp chuyên sâu cùng 100% giáo viên bản ngữ chuẩn quốc tế. Nhu cầu thực tế của học viên là phản xạ nghe nói trôi chảy, tự tin ứng dụng trong công việc và cuộc sống hàng ngày.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Thấu hiểu điều đó, Talk Class đã tổ chức hàng ngàn lớp học, đào tạo thành công hơn 50.000 học viên từ mất gốc đến tự tin giao tiếp lưu loát, chinh phục nhà tuyển dụng quốc tế và mở rộng cơ hội thăng tiến sự nghiệp.
            </p>
            <div className="pt-1">
              <a
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff9f1c] hover:bg-[#e58a09] text-white text-xs font-semibold transition-all shadow-sm hover:shadow group"
                href="#khoa-hoc"
              >
                <span>Xem chi tiết các khóa học</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* ROW 2: 6 LÝ DO NÊN CHỌN TALK CLASS */}
        <div className="mt-8 pt-10 border-t border-slate-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
              Vì Sao Chọn Chúng Tôi
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0c2356] mt-1 font-heading">
              6 Lý Do Hàng Đầu Nên Chọn Học Tại Talk Class
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* CỘT TRÁI: 6 LỢI THẾ */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {reasons.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
                      item.highlight
                        ? "bg-[#f0f4ff] border-blue-200/80 hover:border-[#0c2356]/40"
                        : "bg-white border-slate-200/80 hover:border-blue-200 hover:bg-[#f8faff]"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                        idx % 2 === 0 ? "bg-[#0c2356]" : "bg-[#ff9f1c]"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#0c2356] font-heading">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CỘT PHẢI: ẢNH ĐỘI NGŨ GIÁO VIÊN */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-blue-50 to-orange-50/50 p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-lg text-center">
                <div className="rounded-2xl overflow-hidden shadow-md bg-white">
                  <img
                    alt="Đội ngũ giảng viên nhiệt huyết tại Talk Class"
                    className="w-full h-80 object-cover object-top hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByKKpyO9qzkwdn3xpg2S1_h-bXW0E9vc6kbSVq1Bfut-kZwTRIgomSLxUraVzXhqNKtw4eCvaON8sBB4mANmFG6X4mmi55mTZ5uH745JqCHYuuaZHe4id3qg0jFziNz0AGld7HD0plpJHn8MujW5bmyMW79hFt4b_JG8C9zE9QtBu0cK18JBFOHlYx7dxXaXRcnL1KDWlBvGoQBQ40k0UAXc8koBdWImUoRYczaOyMRXub0Y88dE1W"
                  />
                </div>
                <div className="mt-4 pb-2">
                  <span className="font-semibold text-xs sm:text-sm text-[#0c2356] block font-heading">
                    Đội Ngũ Giáo Viên & Trợ Giảng Chuyên Nghiệp
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Đồng hành cam kết kết quả học tập vượt trội cho mỗi học viên
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL POPUP */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffaa00]" />
                <span className="text-sm font-bold">Lớp Học Thực Tế Tại Talk Class</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Lớp học thực tế Talk Class"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-800 text-slate-300 text-xs flex items-center justify-between">
              <span>Phương pháp phản xạ trực tiếp 100% cùng giáo viên bản ngữ.</span>
              <a
                href="#dang-ky"
                onClick={() => setVideoModalOpen(false)}
                className="text-[#ffaa00] font-bold hover:underline"
              >
                Đăng ký học thử ngay →
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
