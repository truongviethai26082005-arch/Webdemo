"use client";

export function TeachersSection() {
  const teachers = [
    {
      name: "Thầy Simon",
      role: "Giảng viên Bản ngữ (Anh Quốc)",
      roleColor: "text-[#ff9f1c]",
      avatarBorder: "border-[#ff9f1c]",
      avatarBg: "bg-orange-50",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAaY6NeKvsnL47wGfaL-vIo1IZ7kGj5MgScd6pXvUMkv21hf_gf6J81As3Izk3j-d3LO0wEA9mkcquKnal8Fj5uJxdispLIRrvaVJO_rtLI6MgbkckXFyUGe45HsbAAEbH-KgE_QFqe4gxov2rdWoZL8co1wp-77aal6Md4SwNsuRyhGey1lCMrUhHTmzVOWfcnQlO3DrQe2uUZNTDQLehuKkvA6CvnRCe2xdjLdSqalOnRjK0wCjqh",
      bio: [
        "Cử nhân Lancaster University (Anh Quốc)",
        "Chứng chỉ giảng dạy quốc tế CELTA",
        "Hơn 6 năm kinh nghiệm giảng dạy tiếng Anh giao tiếp tại Hà Nội",
      ],
    },
    {
      name: "Cô Hương Mai",
      role: "Giảng viên Chuyên ngữ C1 Châu Âu",
      roleColor: "text-[#0c2356]",
      avatarBorder: "border-[#0c2356]",
      avatarBg: "bg-blue-50",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAK0FSXE0GNXjXt8ZAb2l3QzRlbUR_16zGw2dhXbZ0wXuCSnMYaOocF9fUsmseYidrc_p8OE_bTdL3QaWDpJ_Vd2o2nFgpKHpLy1kCYgRwNY9yDEOw6RBrkEzVqxtBE5LwWTUa8vbC0A91ieduAIiZkQ7Yinu2PiMU2l67E8bCFg_q6AykjhSYq1bOoOduf48pUiwVC0Sm3rwteJQCvvOq528I6kQVHDSGp-51TUzTVwVEYB_B-94Ey",
      bio: [
        "Tốt nghiệp Xuất sắc ĐH Hà Nội - chuyên ngành Ngôn ngữ Anh",
        "Đạt chứng chỉ tiếng Anh C1 Châu Âu",
        "Hơn 4 năm kinh nghiệm nắn ngữ âm và phản xạ chuyên sâu",
      ],
    },
    {
      name: "Thầy Ivan Connor",
      role: "Giảng viên Bản ngữ (Anh Quốc)",
      roleColor: "text-[#ff9f1c]",
      avatarBorder: "border-[#ff9f1c]",
      avatarBg: "bg-orange-50",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBdKF0uhBqDLc9POEeapozSjlbGBrsX7m2c8xD4nqo74gJthUAS9QWoArkaFmsf5tCWtjyh8_N3zfcC0deO4AsI_yh5A-SvB9bknU9Bxb-DVuAjV2FjdZAyLe-9GNFzVyKox1GE3vEJLihA4eTztwMbvqdB_4TMAU68xSrbW35h64LDR4nt9PkcQDQfky_8HOdDfCZbLBuOyleScOrWXVKJRHivofghUSADoKlzXaA0jALi987fdaUK",
      bio: [
        "Tốt nghiệp xuất sắc University of Sussex, Brighton, UK",
        "Chứng chỉ TEFL Quốc tế loại Xuất Sắc",
        "Hơn 7 năm kinh nghiệm giảng dạy tại ĐH FPT và Talk Class",
      ],
    },
    {
      name: "Cô Thạch Thảo",
      role: "Giảng viên Chuyên ngữ (IELTS 7.5)",
      roleColor: "text-[#0c2356]",
      avatarBorder: "border-[#0c2356]",
      avatarBg: "bg-blue-50",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBxIXONQGPojGvZj8kKP1Jsq0ukywffpw7f5zVsuZt03oXVHISTmxKpp9vEL7J4o-z9OkNKT13H-sqBgepmio1PyOYr2nNVOh0koGic887nCoYY6talHk2reDoZYN4msCOY4Xti2dsLwK3re-bjlw5L2QpSnySok2d0EmknqDDyG_h2QG0Qx35pZsiEWkwAVKKLG2M28ZU8dG7EBnkX8_dnHDa4TiAaWV1JWwiDFpnuEQSDVQh0yFGJ",
      bio: [
        "Cử nhân ĐH Mở Hà Nội - khoa Tiếng Anh chuyên nghiệp",
        "Đạt chứng chỉ IELTS 7.5 Academic",
        "Đã đào tạo hơn 1.000 học viên tự tin vượt qua rào cản phát âm",
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#f8faff] border-t border-slate-200/60" id="giang-vien">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f1c]">
            Chất Lượng Học Thuật
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0c2356] font-heading mt-1">
            Đội Ngũ Giảng Viên Bản Ngữ & Chuyên Ngữ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
            Thầy cô tốt nghiệp các trường đại học danh tiếng tại Anh, Mỹ, Úc với chứng chỉ quốc tế
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 border-2 ${teacher.avatarBorder} mb-4 ${teacher.avatarBg} shadow-sm`}
              >
                <img
                  alt={`Teacher ${teacher.name}`}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  src={teacher.avatar}
                />
              </div>

              <span className={`text-[11px] font-semibold ${teacher.roleColor} tracking-normal`}>
                {teacher.role}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0c2356] mt-0.5 font-heading">
                {teacher.name}
              </h3>

              <div className="text-xs text-slate-500 mt-3 space-y-1.5 text-left w-full border-t border-slate-100 pt-3 font-normal">
                {teacher.bio.map((item, bIdx) => (
                  <p key={bIdx} className="leading-relaxed flex items-start gap-1.5">
                    <span className="text-[#ff9f1c] font-bold">•</span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
