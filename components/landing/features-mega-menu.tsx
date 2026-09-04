"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Users,
  BookOpen,
  DollarSign,
  Bot,
  Sparkles,
  UserCheck,
  LayoutGrid,
  GraduationCap,
  TrendingUp,
  CalendarCheck2,
  Clock,
  FileText,
  CheckCircle2,
  QrCode,
  CreditCard,
  Calculator,
  BarChart3,
  FileQuestion,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MegaCategory {
  id: string;
  name: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  headerTitle: string;
  targetSection: string;
  features: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  }[];
}

const CATEGORIES: MegaCategory[] = [
  {
    id: "management",
    name: "Quản lý",
    subtext: "Học sinh, lớp học, giáo viên",
    icon: Users,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    headerTitle: "PHÂN HỆ QUẢN LÝ TẬP TRUNG",
    targetSection: "#features",
    features: [
      {
        title: "Học sinh & Hồ sơ",
        description: "Quản lý thông tin, lịch sử học tập & ví buổi",
        icon: UserCheck,
      },
      {
        title: "Xếp lớp thông minh",
        description: "Tối ưu phòng học, ca học & kiểm soát sĩ số",
        icon: LayoutGrid,
      },
      {
        title: "Đội ngũ Giáo viên",
        description: "Hồ sơ năng lực, phân công môn & quản lý ca",
        icon: GraduationCap,
      },
      {
        title: "Phễu CRM Tuyển sinh",
        description: "Theo dõi lead, lịch hẹn test & tỷ lệ chuyển đổi",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "teaching",
    name: "Giảng dạy",
    subtext: "Điểm danh, lịch dạy, bài tập",
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    headerTitle: "PHÂN HỆ GIẢNG DẠY & CHUYÊN MÔN",
    targetSection: "#features",
    features: [
      {
        title: "Điểm danh một chạm",
        description: "Giáo viên điểm danh trên app, trừ ví tự động",
        icon: CalendarCheck2,
      },
      {
        title: "Quản lý Ca học & Lịch dạy",
        description: "Lịch trực quan tuần/tháng, thông báo đổi ca",
        icon: Clock,
      },
      {
        title: "Kho bài tập & Đề thi",
        description: "Lưu trữ tài liệu số hóa, phân phối theo lớp",
        icon: FileText,
      },
      {
        title: "Chấm điểm bài nộp",
        description: "Phản hồi kết quả, ghi chú tiến độ học viên",
        icon: CheckCircle2,
      },
    ],
  },
  {
    id: "finance",
    name: "Vận hành & Tài chính",
    subtext: "VietQR, ví học phí, lương GV",
    icon: DollarSign,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    headerTitle: "PHÂN HỆ TÀI CHÍNH & VẬN HÀNH TỰ ĐỘNG",
    targetSection: "#features",
    features: [
      {
        title: "Thu phí tự động VietQR",
        description: "NAPAS 247 sinh mã động, gạch nợ tức thì",
        icon: QrCode,
      },
      {
        title: "Quản lý Công nợ học viên",
        description: "Tự động cảnh báo khi ví học sinh dưới 2 buổi",
        icon: CreditCard,
      },
      {
        title: "Tính thù lao & Lương GV",
        description: "Tự động tính lương theo ca dạy, thưởng chuyên cần",
        icon: Calculator,
      },
      {
        title: "Báo cáo Doanh thu",
        description: "Biểu đồ dòng tiền thu chi, thống kê trực quan",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "ai-hub",
    name: "AI-Hub",
    subtext: "Trợ lý AI chấm bài & tạo đề",
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    badge: "Beta",
    headerTitle: "HỆ SINH THÁI TRỢ LÝ AI ĐỘT PHÁ",
    targetSection: "#ai-hub",
    features: [
      {
        title: "AI Chấm Speaking/Writing",
        description: "Đánh giá phát âm, sửa ngữ pháp & từ vựng",
        icon: Bot,
        tag: "Hot",
      },
      {
        title: "AI Tạo đề thi từ tài liệu",
        description: "Tự trích xuất đề trắc nghiệm/tự luận từ PDF",
        icon: FileQuestion,
      },
      {
        title: "AI Viết nhận xét phụ huynh",
        description: "Soạn tin nhắn học lực cá nhân hóa theo biểu đồ",
        icon: MessageSquare,
      },
      {
        title: "AI Phân tích nút thắt phễu",
        description: "Cố vấn kinh doanh, tìm nguyên nhân rớt lead",
        icon: Sparkles,
      },
    ],
  },
];

interface FeaturesMegaMenuProps {
  onSelectFeature?: (sectionId: string) => void;
}

export function FeaturesMegaMenu({ onSelectFeature }: FeaturesMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("management");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];

  function handleMouseEnter() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }

  function handleMouseLeave() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }

  function handleFeatureClick(sectionId: string) {
    setIsOpen(false);
    if (onSelectFeature) {
      onSelectFeature(sectionId);
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={menuContainerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 focus:outline-none ${
          isOpen
            ? "text-primary bg-primary/10 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        aria-expanded={isOpen}
      >
        <span>Tính năng</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Flyout Mega Menu Dropdown with zero-gap outer hover bridge */}
      {isOpen && (
        <div
          className="absolute top-full left-0 lg:-left-12 xl:left-0 pt-1.5 w-[760px] max-w-[92vw] z-50 pointer-events-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl shadow-indigo-950/15 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-top-2">
            {/* Subtle Top Gradient Accent */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-primary to-purple-500" />

            <div className="grid grid-cols-12 min-h-[380px]">
            {/* Left Column: Navigation Tabs / Categories (approx 38% width) */}
            <div className="col-span-5 bg-muted/40 dark:bg-muted/20 border-r border-border/60 p-3 space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                    Phân hệ hệ thống
                  </span>
                </div>

                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = cat.id === activeCategoryId;

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveCategoryId(cat.id)}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`group cursor-pointer w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : `${cat.color}`
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold ${
                                isActive ? "text-white" : "text-foreground"
                              }`}
                            >
                              {cat.name}
                            </span>
                            {cat.badge && (
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  isActive
                                    ? "bg-white/30 text-white"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[10px] leading-tight line-clamp-1 ${
                              isActive
                                ? "text-white/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {cat.subtext}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? "text-white translate-x-0.5"
                            : "text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Left Quick Tip */}
              <div className="p-3 rounded-xl bg-background/80 border border-border/50 text-[11px] text-muted-foreground space-y-1 mt-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground text-[10px] uppercase">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chuẩn hóa quy trình</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  Đồng bộ tức thì từ tuyển sinh, điểm danh đến bảng lương cuối tháng.
                </p>
              </div>
            </div>

            {/* Right Column: Detailed 2x2 / 2x3 Feature Grid */}
            <div className="col-span-7 p-5 flex flex-col justify-between bg-card">
              <div className="space-y-4">
                {/* Header of Active Category */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    {activeCategory.headerTitle}
                  </span>
                  <a
                    href={activeCategory.targetSection}
                    onClick={() => handleFeatureClick(activeCategory.targetSection)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                {/* Grid 2 Columns */}
                <div className="grid grid-cols-2 gap-3">
                  {activeCategory.features.map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <a
                        key={idx}
                        href={activeCategory.targetSection}
                        onClick={() => handleFeatureClick(activeCategory.targetSection)}
                        className="group/item p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/60 hover:border-primary/40 transition-all flex flex-col justify-between space-y-2 shadow-xs hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover/item:scale-105 group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all">
                            <FeatIcon className="w-4 h-4" />
                          </div>
                          {feat.tag && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              {feat.tag}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-foreground group-hover/item:text-primary transition-colors">
                            {feat.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                            {feat.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                <a
                  href="#features"
                  onClick={() => handleFeatureClick("#features")}
                  className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                >
                  <span>Xem toàn bộ tính năng vận hành</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                </a>

                <span className="text-[10px] text-muted-foreground font-medium">
                  Hỗ trợ 100% tiếng Việt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
