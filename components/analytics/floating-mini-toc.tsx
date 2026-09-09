"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Filter,
  TrendingUp,
  Wallet,
  Users,
  ArrowUp,
  Printer,
  ListTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingMiniTocProps {
  activeSectionId: string;
  onNavigate: (sectionId: string) => void;
  onPrint: () => void;
}

const TOC_ITEMS = [
  {
    id: "section-ai-executive",
    index: "01",
    label: "Tổng quan & AI",
    subtitle: "Health Score",
    icon: Sparkles,
  },
  {
    id: "section-funnel",
    index: "02",
    label: "Phễu tuyển sinh",
    subtitle: "Tỷ lệ chuyển đổi",
    icon: Filter,
  },
  {
    id: "section-cashflow",
    index: "03",
    label: "Dòng tiền 12T",
    subtitle: "Thu chi thực tế",
    icon: TrendingUp,
  },
  {
    id: "section-grossprofit",
    index: "04",
    label: "Lợi nhuận gộp",
    subtitle: "Chi phí lương GV",
    icon: Wallet,
  },
  {
    id: "section-retention",
    index: "05",
    label: "Tỷ lệ giữ chân",
    subtitle: "Gia hạn & Duy trì",
    icon: Users,
  },
];

export function FloatingMiniToc({
  activeSectionId,
  onNavigate,
  onPrint,
}: FloatingMiniTocProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Tính thanh tiến trình cuộn trang
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleScrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <aside className="no-print sticky top-20 w-64 shrink-0 hidden xl:flex flex-col gap-3 self-start">
      {/* Container Box */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-card/95 backdrop-blur-xl p-3.5 shadow-xs space-y-3">
        {/* Header Mục Lục */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-foreground">
              Mục Lục Báo Cáo
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground font-mono">
            {Math.round(scrollProgress)}%
          </span>
        </div>

        {/* Progress bar mỏng */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-150 rounded-full"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Danh sách 5 Điểm Neo */}
        <nav className="space-y-1">
          {TOC_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSectionId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all relative group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full" />
                )}

                <span
                  className={`text-[10px] font-mono font-bold shrink-0 ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground/60"
                  }`}
                >
                  {item.index}
                </span>

                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                />

                <div className="flex-1 truncate">
                  <span className="block truncate leading-tight">{item.label}</span>
                  <span
                    className={`text-[9px] block truncate font-normal ${
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground/70"
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Action Buttons: Print & Scroll to Top */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPrint}
            className="flex-1 h-8 text-xs font-bold gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-muted shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            <span>In / PDF</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleScrollTop}
            className="h-8 w-8 p-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
