"use client";

import { Phone, Mail, Globe, MapPin } from "lucide-react";

export function TalkClassFooter() {
  return (
    <footer className="bg-[#071738] text-white border-t border-white/10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* CỘT 1: THÔNG TIN TALK CLASS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                alt="Talk Class Logo"
                className="h-10 w-auto bg-white p-1 rounded-lg shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJnIpqevJmX7pwM0lubsC8LtjDeHQfi8tfWiH_XIPjrJlDiz0qrmNCm5WJ4b084PHLGMUmKrqvwfz5To7mOUgJPDwDXFrAShDx1_Ipxw1Ymoc3iuvRgXxWi4khEC-1LjV3dUYPnm5sHJReda0FANJ6-xBt6OWVE4Nxq2FypgOditbyqvgMIUP7x5IKJjItuO_NUna10-E8AG4Z9UWRM6fZ6Izn-Id_rEAmJ3WCUVLFtniAGhhkNP4rGHn_LZ6eeueLnQ"
              />
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Talk Class - Hệ thống trung tâm tiếng Anh giao tiếp chuyên sâu cùng 100% giảng viên bản ngữ có chứng chỉ quốc tế TESOL, CELTA.
            </p>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ff9f1c] shrink-0" />
                <span>
                  Hotline: <strong className="text-white">0984 022 247</strong>
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ff9f1c] shrink-0" />
                <span>Email: talkclass2014@gmail.com</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#ff9f1c] shrink-0" />
                <span>Website: https://talkclass.edu.vn</span>
              </p>
            </div>
          </div>

          {/* CỘT 2: ĐỊA CHỈ CÁC CƠ SỞ */}
          <div className="space-y-3.5">
            <h4 className="font-semibold text-sm text-[#ffaa00] tracking-normal font-heading">
              Hệ Thống Cơ Sở
            </h4>
            <div className="space-y-3 text-slate-300">
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ffaa00]" />
                  Cơ sở 1 (Trụ sở chính):
                </p>
                <p className="text-xs text-slate-300 pl-5 mt-0.5">
                  Số 38 Phố Yên Lãng, Thịnh Quang, Đống Đa, Hà Nội
                </p>
              </div>
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ffaa00]" />
                  Cơ sở 2:
                </p>
                <p className="text-xs text-slate-300 pl-5 mt-0.5">
                  Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội
                </p>
              </div>
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#ffaa00]" />
                  Lớp Online Trực Tuyến:
                </p>
                <p className="text-xs text-slate-300 pl-5 mt-0.5">
                  Tương tác 2 chiều với GV bản ngữ qua hệ thống chuyên dụng
                </p>
              </div>
            </div>
          </div>

          {/* CỘT 3: KHÓA HỌC & LỘ TRÌNH */}
          <div className="space-y-3.5">
            <h4 className="font-semibold text-sm text-[#ffaa00] tracking-normal font-heading">
              Chương Trình Đào Tạo
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a className="hover:text-[#ffaa00] transition-colors" href="#khoa-hoc">
                  • Tiếng Anh giao tiếp cơ bản cho người mất gốc
                </a>
              </li>
              <li>
                <a className="hover:text-[#ffaa00] transition-colors" href="#khoa-hoc">
                  • Tiếng Anh giao tiếp nâng cao & văn phòng
                </a>
              </li>
              <li>
                <a className="hover:text-[#ffaa00] transition-colors" href="#khoa-hoc">
                  • Tiếng Anh giao tiếp cho người lớn tuổi
                </a>
              </li>
              <li>
                <a className="hover:text-[#ffaa00] transition-colors" href="#khoa-hoc">
                  • Đào tạo tiếng Anh doanh nghiệp
                </a>
              </li>
              <li>
                <a className="hover:text-[#ffaa00] transition-colors" href="#khoa-hoc">
                  • Lớp kèm 1:1 theo yêu cầu đặc biệt
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 4: FANPAGE & LIÊN KẾT */}
          <div className="space-y-3.5">
            <h4 className="font-semibold text-sm text-[#ffaa00] tracking-normal font-heading">
              Kết Nối Với Chúng Tôi
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Theo dõi Fanpage với hơn 80.000+ thành viên để nhận tài liệu tự học tiếng Anh giao tiếp mỗi ngày:
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold hover:opacity-90 shadow"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
              >
                f
              </a>
              <a
                className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold hover:opacity-90 shadow"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Youtube"
              >
                ▶
              </a>
              <a
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold hover:opacity-90 shadow"
                href="https://zalo.me/0984022247"
                target="_blank"
                rel="noopener noreferrer"
                title="Zalo"
              >
                Z
              </a>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 space-y-0.5">
              <span className="block">MST: 0106998395</span>
              <span className="block leading-relaxed">
                Đơn vị chủ quản: Công ty Cổ phần Thương mại & Dịch vụ Giáo dục Allinone
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2.5">
          <p>© 2025 Talk Class English Center. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-white transition-colors" href="#">
              Chính sách bảo mật
            </a>
            <a className="hover:text-white transition-colors" href="#">
              Điều khoản sử dụng
            </a>
            <a className="hover:text-white transition-colors" href="#">
              Nội quy học vụ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
