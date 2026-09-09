"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  ArrowRight,
  X,
  CornerDownLeft,
  Bot,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AIAnswer {
  targetId: string;
  sectionTitle: string;
  answer: string;
  metricBadge?: string;
}

interface AISmartNavigatorProps {
  onHighlightSection: (sectionId: string) => void;
}

const QUICK_PROMPTS = [
  { label: "Phễu tuyển sinh ở đâu?", query: "Phễu tuyển sinh ở đâu" },
  { label: "Dòng tiền 12 tháng", query: "Dòng tiền 12 tháng" },
  { label: "Lợi nhuận & Lương GV", query: "Lợi nhuận gộp và lương giáo viên" },
  { label: "Tỷ lệ giữ chân & Gia hạn", query: "Tỷ lệ giữ chân và gia hạn học phí" },
  { label: "Điểm sức khỏe AI", query: "Điểm sức khỏe vận hành AI" },
];

export function AISmartNavigator({ onHighlightSection }: AISmartNavigatorProps) {
  const [query, setQuery] = useState("");
  const [activeAnswer, setActiveAnswer] = useState<AIAnswer | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Shortcut Ctrl + K hoặc Cmd + K để focus nhanh
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearch(searchQuery: string) {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    let result: AIAnswer = {
      targetId: "section-ai-executive",
      sectionTitle: "Mục 1: Tóm Tắt Điều Hành AI & Điểm Sức Khỏe Vận Hành",
      answer:
        "Khối Tóm tắt Điều hành AI & Health Score ở Mục 1. Điểm sức khỏe vận hành toàn hệ thống đạt 86/100 (Tốt) với 3 khuyến nghị trọng yếu.",
      metricBadge: "Health Score 86/100",
    };

    if (
      q.includes("phễu") ||
      q.includes("tuyển sinh") ||
      q.includes("chuyển đổi") ||
      q.includes("học thử") ||
      q.includes("rớt") ||
      q.includes("dropout") ||
      q.includes("lead") ||
      q.includes("funnel") ||
      q.includes("khách hàng tiềm năng")
    ) {
      result = {
        targetId: "section-funnel",
        sectionTitle: "Mục 2: Báo Cáo Phễu Tuyển Sinh & Đo Lường Chuyển Đổi",
        answer:
          "Phễu tuyển sinh đang ở Mục 2. Tỷ lệ chốt sau học thử đạt 28% (đang có điểm nghẽn ở khâu chuyển đổi học phí do phụ huynh cân nhắc mức phí).",
        metricBadge: "Tỷ lệ chốt: 28%",
      };
    } else if (
      q.includes("dòng tiền") ||
      q.includes("tiền mặt") ||
      q.includes("cashflow") ||
      q.includes("doanh thu") ||
      q.includes("thu chi") ||
      q.includes("12 tháng") ||
      q.includes("tháng 8") ||
      q.includes("thặng dư")
    ) {
      result = {
        targetId: "section-cashflow",
        sectionTitle: "Mục 3: Báo Cáo Dòng Tiền 12 Tháng & Biến Động Doanh Thu",
        answer:
          "Báo cáo Dòng tiền 12 tháng đang ở Mục 3. Doanh thu lũy kế đạt đỉnh vào tháng 8 (~58.5M VND), dòng tiền ròng duy trì thặng dư dương ổn định.",
        metricBadge: "Đỉnh DT: 58.5M (T8)",
      };
    } else if (
      q.includes("lợi nhuận") ||
      q.includes("lợi nhuận gộp") ||
      q.includes("lương") ||
      q.includes("giáo viên") ||
      q.includes("gross profit") ||
      q.includes("chi phí") ||
      q.includes("biên lợi nhuận") ||
      q.includes("margin")
    ) {
      result = {
        targetId: "section-grossprofit",
        sectionTitle: "Mục 4: Phân Tích Lợi Nhuận Gộp & Chi Phí Lương Giáo Viên",
        answer:
          "Phân tích Lợi nhuận gộp đang ở Mục 4. Tỷ trọng chi phí lương giáo viên chiếm ~34.8% tổng doanh thu, nằm trong biên độ tài chính an toàn (< 40%).",
        metricBadge: "Biên LN: 65.2%",
      };
    } else if (
      q.includes("giữ chân") ||
      q.includes("gia hạn") ||
      q.includes("tái tục") ||
      q.includes("chuyên cần") ||
      q.includes("nghỉ học") ||
      q.includes("churn") ||
      q.includes("retention") ||
      q.includes("vắng mặt") ||
      q.includes("học lại")
    ) {
      result = {
        targetId: "section-retention",
        sectionTitle: "Mục 5: Tỷ Lệ Giữ Chân & Gia Hạn Học Phí",
        answer:
          "Báo cáo Giữ chân & Gia hạn ở Mục 5. Tỷ lệ đóng tiếp học phí đạt 78.5% (vượt chỉ tiêu >75%), dữ liệu tháng này 75/100 học viên đã gia hạn thành công.",
        metricBadge: "Gia hạn: 78.5%",
      };
    }

    setActiveAnswer(result);

    // Kích hoạt scroll mượt & highlight pulse
    navigateToSection(result.targetId);
  }

  function navigateToSection(targetId: string) {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      onHighlightSection(targetId);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  }

  function handleClear() {
    setQuery("");
    setActiveAnswer(null);
    inputRef.current?.focus();
  }

  return (
    <div className="w-full space-y-3 no-print">
      {/* Search Bar Container */}
      <div
        className={`relative rounded-2xl border transition-all duration-300 shadow-xs bg-card/90 backdrop-blur-md ${
          isFocused
            ? "border-primary ring-4 ring-primary/10 shadow-sm"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-2.5 gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder='🔍 Hỏi AI hoặc gõ tìm kiếm (VD: "Phễu tuyển sinh ở đâu", "Dòng tiền", "Tỷ lệ giữ chân")... [Ctrl + K]'
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono font-bold text-muted-foreground bg-muted/80 rounded-md border border-slate-300 dark:border-slate-700">
              <span>Ctrl</span>
              <span>+</span>
              <span>K</span>
            </kbd>

            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 rounded-xl gap-1.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Hỏi AI</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground px-1">
        <span className="font-semibold text-foreground/80 flex items-center gap-1 text-[11px]">
          <Compass className="w-3 h-3 text-primary" />
          Gợi ý nhanh:
        </span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            type="button"
            onClick={() => {
              setQuery(prompt.query);
              handleSearch(prompt.query);
            }}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted/60 hover:bg-primary/10 hover:text-primary border border-slate-300 dark:border-slate-700 hover:border-slate-400 transition-colors"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* AI Answer Card / Popover */}
      {activeAnswer && (
        <div className="p-4 rounded-2xl bg-card border border-slate-300 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-xs text-primary uppercase tracking-wide">
                    {activeAnswer.sectionTitle}
                  </span>
                  {activeAnswer.metricBadge && (
                    <Badge
                      variant="outline"
                      className="bg-primary/15 text-primary border-primary/30 text-[10px] font-extrabold"
                    >
                      {activeAnswer.metricBadge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                  {activeAnswer.answer}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateToSection(activeAnswer.targetId)}
                className="h-8 text-xs font-bold gap-1 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
              >
                <span>Đến ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <button
                type="button"
                onClick={() => setActiveAnswer(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
