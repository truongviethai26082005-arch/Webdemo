"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Send, Loader2, Check } from "lucide-react";
import { submitLead } from "@/lib/actions/leads";

export function RegisterFormSection() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetAudience, setTargetAudience] = useState("Sinh viên");
  const [learningFormat, setLearningFormat] = useState("Cơ sở Đống Đa (38 Yên Lãng)");
  const [preferredTime, setPreferredTime] = useState("Ca tối (18h00 - 19h30)");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim()) {
      setError("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    setLoading(true);
    try {
      const note = `[Talk Class Test Registration] Đối tượng: ${targetAudience} | Hình thức: ${learningFormat} | Khung giờ: ${preferredTime}`;
      const result = await submitLead({
        fullName: fullName.trim(),
        phone: phone.trim(),
        centerName: "Talk Class Student",
        email: `${phone.trim()}@talkclass.guest`,
        scale: targetAudience,
        category: "talk_class_level_test",
        note,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } catch {
      setError("Không thể gửi thông tin lúc này. Vui lòng gọi trực tiếp hotline: 0984 022 247");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-[#0c2356] text-white relative overflow-hidden" id="dang-ky">
      {/* Ambient background glow effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ff9f1c]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* BÊN TRÁI: QUYỀN LỢI NHẬN ĐƯỢC */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ffaa00] text-xs font-semibold w-fit tracking-normal border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#ffaa00] animate-pulse"></span>
              <span>Ưu đãi đặc biệt: Nhận trọn bộ học liệu & test 1:1</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-tight font-heading">
              Test Trình Độ 1:1 Miễn Phí Cùng Giáo Viên Bản Ngữ
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Xác định chính xác điểm nghẽn phản xạ, nhận lộ trình cá nhân hóa và tư vấn lịch học phù hợp nhất cho lịch trình của bạn.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#ffaa00] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-semibold">Giảm 25% học phí</strong> khi hoàn tất đăng ký giữ chỗ trong tuần này
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#ffaa00] shrink-0 mt-0.5" />
                <span>
                  Tặng phần mềm học tiếng Anh <strong className="text-white font-semibold">Blended Learning trị giá 2.000.000đ</strong>
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#ffaa00] shrink-0 mt-0.5" />
                <span>
                  Tặng khóa học kỹ năng thuyết trình công việc <strong className="text-white font-semibold">trị giá 1.500.000đ</strong>
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between max-w-md backdrop-blur-xs">
              <span className="text-xs font-medium text-slate-300">
                Ưu đãi kết thúc sau:
              </span>
              <div className="flex items-center gap-1.5 text-center font-mono">
                <div className="bg-[#ff9f1c] text-white px-2.5 py-1 rounded-lg text-xs shadow-sm">
                  <span className="text-sm sm:text-base block font-bold font-heading">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-normal uppercase">Ngày</span>
                </div>
                <span className="text-white/60 font-bold">:</span>
                <div className="bg-[#ff9f1c] text-white px-2.5 py-1 rounded-lg text-xs shadow-sm">
                  <span className="text-sm sm:text-base block font-bold font-heading">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-normal uppercase">Giờ</span>
                </div>
                <span className="text-white/60 font-bold">:</span>
                <div className="bg-[#ff9f1c] text-white px-2.5 py-1 rounded-lg text-xs shadow-sm">
                  <span className="text-sm sm:text-base block font-bold font-heading">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-normal uppercase">Phút</span>
                </div>
                <span className="text-white/60 font-bold">:</span>
                <div className="bg-[#ff9f1c] text-white px-2.5 py-1 rounded-lg text-xs shadow-sm">
                  <span className="text-sm sm:text-base block font-bold font-heading">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-normal uppercase">Giây</span>
                </div>
              </div>
            </div>
          </div>

          {/* BÊN PHẢI: FORM ĐĂNG KÝ */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-slate-100">
              {submitted ? (
                <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0c2356] font-heading">
                    Đăng Ký Thành Công!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed font-normal">
                    Cảm ơn bạn <strong className="text-slate-800 font-semibold">{fullName}</strong> đã đăng ký. Chuyên viên đào tạo của Talk Class sẽ liên hệ qua số điện thoại{" "}
                    <strong className="text-slate-800 font-semibold">{phone}</strong> trong vòng 15 phút để xếp lịch test 1:1 miễn phí cho bạn.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFullName("");
                      setPhone("");
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0c2356] text-white text-xs font-semibold hover:bg-[#1a469d] transition-all"
                  >
                    <span>Gửi thêm thông tin khác</span>
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0c2356] text-center mb-1 font-heading">
                    Điền Thông Tin Tư Vấn & Đặt Lịch Test
                  </h3>
                  <p className="text-xs text-slate-500 text-center mb-5 font-normal">
                    Chuyên viên Talk Class sẽ liên hệ xác nhận trong vòng 15 phút
                  </p>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                      {error}
                    </div>
                  )}

                  <form className="space-y-3.5" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên của bạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c2356] focus:border-[#0c2356] outline-none transition-all"
                        placeholder="Ví dụ: Nguyễn Văn An"
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại (Zalo) <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c2356] focus:border-[#0c2356] outline-none transition-all"
                          placeholder="0984 xxx xxx"
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Đối tượng học viên
                        </label>
                        <select
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c2356] focus:border-[#0c2356] outline-none bg-white transition-all"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                        >
                          <option>Sinh viên</option>
                          <option>Người đi làm</option>
                          <option>Người mất gốc hoàn toàn</option>
                          <option>Đào tạo doanh nghiệp</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Hình thức theo học
                        </label>
                        <select
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c2356] focus:border-[#0c2356] outline-none bg-white transition-all"
                          value={learningFormat}
                          onChange={(e) => setLearningFormat(e.target.value)}
                        >
                          <option>Cơ sở Đống Đa (38 Yên Lãng)</option>
                          <option>Học Online tương tác trực tiếp</option>
                          <option>Cơ sở Cầu Giấy (Dự kiến)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Khung giờ mong muốn
                        </label>
                        <select
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c2356] focus:border-[#0c2356] outline-none bg-white transition-all"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                        >
                          <option>Ca tối (18h00 - 19h30)</option>
                          <option>Ca tối (19h45 - 21h15)</option>
                          <option>Cuối tuần (Thứ 7 - CN)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      className="w-full mt-2 py-3 rounded-lg bg-[#ff9f1c] hover:bg-[#e68a0f] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-70"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <span>Đăng ký test 1:1 miễn phí ngay</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-400 mt-2">
                      Talk Class cam kết bảo mật 100% thông tin học viên.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
