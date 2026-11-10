import { ArrowRight } from "lucide-react";

export function CredentialBar() {
  return (
    <section className="bg-gradient-to-r from-[#071738] via-[#0c2356] to-[#071738] text-white py-5 px-4 sm:px-6 lg:px-8 shadow-md relative z-10 border-b border-white/10">
      <div className="max-w-[1440px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#ff9f1c] text-white font-extrabold flex flex-col items-center justify-center text-xs shadow-md shrink-0">
            <span className="text-[10px] leading-tight">TOP</span>
            <span className="text-sm font-black leading-none">3</span>
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-2 font-heading">
              <span>Top 3 Trung Tâm Tiếng Anh Giao Tiếp Hàng Đầu Tại Hà Nội</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              100% chuyên giao tiếp cùng đội ngũ giáo viên bản ngữ có chứng chỉ quốc tế CELTA & TESOL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ff9f1c] text-white text-xs font-semibold hover:bg-[#e68a0f] transition-all shadow-sm hover:shadow group whitespace-nowrap shrink-0"
            href="#dang-ky"
          >
            <span>Kiểm tra trình độ miễn phí</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}
