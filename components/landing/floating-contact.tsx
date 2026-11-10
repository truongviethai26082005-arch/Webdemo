"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowUp } from "lucide-react";

export function FloatingContact() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Nút Gọi Hotline */}
      <a
        className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative group"
        href="tel:0984022247"
        title="Gọi Hotline 0984 022 247"
        aria-label="Gọi hotline"
      >
        <Phone className="w-5 h-5 animate-bounce" />
        <span className="absolute right-14 bg-slate-900 text-white text-[11px] font-bold py-1 px-3 rounded-lg whitespace-nowrap hidden group-hover:block shadow-md">
          Hotline: 0984 022 247
        </span>
      </a>

      {/* Nút Zalo Chat */}
      <a
        className="w-12 h-12 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative group"
        href="https://zalo.me/0984022247"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat Zalo cùng chuyên viên"
        aria-label="Chat qua Zalo"
      >
        <span className="font-extrabold text-xs tracking-tight">Zalo</span>
        <span className="absolute right-14 bg-slate-900 text-white text-[11px] font-bold py-1 px-3 rounded-lg whitespace-nowrap hidden group-hover:block shadow-md">
          Nhắn tin Zalo 24/7
        </span>
      </a>

      {/* Nút Cuộn Lên Đầu Trang */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-[#ff9f1c] text-white flex items-center justify-center shadow-md hover:bg-[#e68a0f] hover:scale-105 transition-all duration-200 animate-in fade-in"
          title="Lên đầu trang"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </aside>
  );
}
