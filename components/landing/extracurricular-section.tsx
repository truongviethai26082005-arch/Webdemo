"use client";

import { Star } from "lucide-react";

export function ExtracurricularSection() {
  const activities = [
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbDoUPUpQYXzlBIlm2EyEZR_N3v6TJr5WrT_h8p8foQGF-Y4B8TgD_oR_ebEllAgu89BRU9hEcCT9d9Pi0kgVLrVt-mfH1Ch5DZsmm6vyjF29m19uGuINfEIl-pKexSnACNb0RJe5-_JKwxOQxAHyC0zYLuK-zXZH0Htd4CLFmw1xocUzv0TxHdp_wXQ4HdVap4wdTNuZ0h600ohs8LogOHlTfsR96QjuyAZ2mC-YOZAwE5LDy2lpQ",
      caption: "Giao lưu văn hóa tự nhiên ngoài lớp học",
    },
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxCLUU61eMGG3GkOXOwL6jRDJ1UB72ghllPnT9bmWeo_uj0aUsM3YYBBWzdNDf4Gve4i2t-TubJ5fSU4_unlt_t8GnaOASbeWR7HlXuaZNkhfF7USxavrIxbYlzXWuoNmRzFQKdl8UdOxxcggvSwPe1vtcNCOuDmbvr1eAWVGjp-BZfyWk1sxJVpQxQoo2aM2HXC2fj1tySmiXwh8OBDWnznOGLJbA7Eq_e255GzhqnhpNKs7SVeS9",
      caption: "Thử thách nói chuyện cùng du khách nước ngoài",
    },
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChYku8OcT9FCuhcmntT-qqEb8zDDqtBC_Y619XrtW92u4MufXnb6OV4_P3mGgRAbSfB0xW9-dMFyd3Xeddb0wCINOTpop5tVfuwaPbh-dHrwy1ebBskdyF0scNJ82C28r7EAUb5RhK16znbmlPvCXisRfO6ar1nkP-9D6rwEKKxV0h2BYrbT1pwkpGRVDQnmk5jzKDIwMBGs7tSUu8IfYMVJ12aX5xb37qcE-THUjFNGTqRP4a0QJD",
      caption: "Tương tác boardgame, xóa tan nỗi sợ nói",
    },
  ];

  const testimonials = [
    {
      name: "Chị Huyền Trang",
      classCode: "Học viên lớp GT24",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDeJ7by1N9rCWLUO3hK4jR5rXoy-mzPi1T-moaPmEhu-dZgzNNWICsgBovY6NsB-ST9Xlh5MMDJQJgyNLS7Ke7BwzhgzpPnXH_MJU69nKLpByuLWooqHmDLnoKlxCUX8c2SUjlSsNSBAUuwUi_-SotrvQt9cah8ROCdRZUvyn4vtrwhXneGzk6i23LNVt9avnPf3knYzfjrQdcCnPD7NO0ecEOSvykcVaqUGnUNp5xTTUsFY7VXi2Ms",
      quote:
        "Điều tôi yêu nhất ở Talk Class là cộng đồng học viên. Thầy cô bản ngữ siêu nhiệt tình, không khí lớp học rất vui vẻ, không bị áp lực ngữ pháp khô khan.",
    },
    {
      name: "Bạn Hà My",
      classCode: "Học viên lớp TC21",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCzrp2vFFp2dt-83pTB2j2cz42vRDjTCn9fqoSeVW_2ucqCS_KDba166-aERjRHc_YSMrDVh6Tc9aaQXEzb3BeiZ1XpoX1TkAhjiUv6sz5ji5YWSrVF7wRBPRQHD6m1QqMc3JpJI7NIv-d1t1bDvEBNIV7FFFqtDQXQpVyCZRkz9NXdLVYCyqu0Xkc_Kiza23mQiw5FuRTgBINIThjk1eDZMJVriv5Ixubx_xMrsjs81tMsJSkJRHh0",
      quote:
        "Giáo trình của Talk Class thực sự ấn tượng. Mỗi bài học đều được thiết kế như một tình huống làm việc thực tế, giúp mình ứng dụng ngay vào công việc ở cty.",
    },
    {
      name: "Chị Vân Anh",
      classCode: "Học viên lớp TC21",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDaT4hscinS8BcH88EgdsqCwUE2NSg1y8E-Qs03XFIMI-6PIzICYGRzZ2m9nPlK9_WltKaqdant9dg0Nse_QFsB5geGYD2rlt8QPWmIvCbPwk9fuCn1jzGvFRzDyayoqRzhb3za0GrPbcQrbWHQ-N6cl-yGA3UWjOzAh32Kay3_hBim_hBSNr6ygvLAwQ0DbhG7yp1zppHrWWS8Whz9qyqU78tKp0QV3td_01F5Xp6V5wpBy_sD2Yze",
      quote:
        "Khoá học tiếng Anh giao tiếp của Talk Class đã thực sự mở rộng khả năng phản xạ của tôi. Giáo viên sửa từng âm đuôi rất tỉ mỉ và kiên nhẫn.",
    },
    {
      name: "Bạn Cường",
      classCode: "Học viên lớp TC21",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCjHPJ6uxVKX3KdLWKpDczYMFzzNWgGtJYZ3Ki6ZuVnJpQcNvX7bt1Q5zpcfvV_vEG81pC7TnyYwgjfEepW5Bs37pPUR7NrALxf_gd-07-C9_bh4JzOhEYny05AuhncC2MU1THe4S274_uLsc7WU0-KKkpwakIEjYJmoBxM_nNvcL394Sc_fpLrK97KwpFso0BOJK4rtdiv2ZWfuYKuMtFRAaJEC3OSzkeH5fMG8i8t9daUSun7Z_j2",
      quote:
        "Trước khi tham gia, mình rất ngập ngừng khi gặp người nước ngoài. Sau 3 tháng tại Talk Class, mình đã tự tin phỏng vấn việc làm bằng tiếng Anh thành công!",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white" id="ngoai-khoa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* CAFE TÂY SECTION */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
            Ngoại Khóa Độc Quyền
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0c2356] font-heading mt-1">
            Câu Lạc Bộ &ldquo;Cafe Tây&rdquo; Hàng Tuần
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
            Không gian giao lưu thực tế giữa học viên và bạn bè quốc tế tại phố cổ Hà Nội
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {activities.map((act, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden shadow-sm aspect-[4/3] relative group"
            >
              <img
                alt={act.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={act.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                <span className="text-white text-xs sm:text-[13px] font-semibold drop-shadow">
                  {act.caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CẢM NHẬN HỌC VIÊN */}
        <div className="pt-10 border-t border-slate-100">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
              Feedback Học Viên
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0c2356] font-heading mt-1">
              Cảm Nhận Từ Học Viên Talk Class
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={item.avatar}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#0c2356] font-heading">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.classCode}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed italic font-normal">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[#ffaa00] gap-0.5">
                  {[...Array(5)].map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className="w-3.5 h-3.5 fill-[#ffaa00] text-[#ffaa00]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
