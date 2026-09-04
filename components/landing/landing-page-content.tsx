"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  QrCode,
  CalendarCheck2,
  Users2,
  Calculator,
  Brain,
  FileQuestion,
  FileCheck2,
  Languages,
  Palette,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Zap,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  Check,
  Layers,
  BarChart3,
  Bot,
  HelpCircle,
  MessageSquare,
  Sparkle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "./landing-header";
import { LeadModal } from "./lead-modal";
import { AIHubPreviewModal, AIFeatureDetail } from "./ai-hub-preview-modal";

interface LandingPageContentProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
}

export function LandingPageContent({
  isLoggedIn,
  dashboardUrl,
}: LandingPageContentProps) {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("language");
  const [selectedAIFeature, setSelectedAIFeature] = useState<AIFeatureDetail | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const aiFeatures: AIFeatureDetail[] = [
    {
      id: "exam-gen",
      title: "AI Hỗ trợ Chuyển đổi & Tạo đề thi",
      badge: "Beta",
      iconName: "FileQuestion",
      description:
        "Tự động trích xuất nội dung từ giáo trình hoặc đề cương PDF và phân tách thành ngân hàng đề thi trắc nghiệm lẫn tự luận đa môn học trong vài giây.",
      highlight:
        "Giáo viên chỉ cần tải file bài giảng lên, AI tự động sinh đề thi theo ma trận chuẩn kiến thức.",
      benefits: [
        "Sinh câu hỏi trắc nghiệm kèm đáp án và thang điểm chi tiết",
        "Hỗ trợ môn Toán, Tiếng Anh, Lý, Hóa, Sinh và Ngữ Văn",
        "Xuất file PDF hoặc chuyển đổi sang bài kiểm tra online 1 chạm",
      ],
    },
    {
      id: "solution-ai",
      title: "AI Giải thích Lời giải Chi tiết",
      badge: "Beta",
      iconName: "HelpCircle",
      description:
        "Gia sư AI 24/7 đồng hành cùng học sinh, phân tích phương pháp làm bài từng bước rõ ràng, không chỉ đưa đáp án mà hướng dẫn tư duy logic.",
      highlight:
        "Học sinh có thể hỏi bài tập mọi lúc ở nhà mà không làm phiền thời gian ngoài giờ của thầy cô.",
      benefits: [
        "Giải thích từng bước chi tiết kèm lý thuyết liên quan",
        "Gợi ý các bài tập tương tự để học sinh luyện tập thêm",
        "Báo cáo câu hỏi thắc mắc nhiều nhất về cho giáo viên",
      ],
    },
    {
      id: "grading-ai",
      title: "AI Chấm điểm & Sửa bài thông minh",
      badge: "Sắp ra mắt",
      iconName: "FileCheck2",
      description:
        "Tự động chấm phát âm tiếng Anh (Speaking), phát hiện lỗi ngữ pháp, cải thiện cấu trúc câu và đề xuất từ vựng nâng cao cho bài viết (Writing).",
      highlight:
        "Tối ưu cho các trung tâm ngoại ngữ IELTS/TOEIC và các lớp rèn kỹ năng giao tiếp.",
      benefits: [
        "Chấm band điểm IELTS Speaking & Writing theo 4 tiêu chí chuẩn",
        "Sửa trực tiếp từng câu văn và giải thích lỗi ngữ pháp cụ thể",
        "Tiết kiệm 80% thời gian chấm bài thủ công mỗi tối",
      ],
    },
    {
      id: "feedback-gen",
      title: "AI Tổng hợp Kết quả & Soạn nhận xét",
      badge: "Beta",
      iconName: "MessageSquare",
      description:
        "Đọc biểu đồ chuyên cần, điểm số định kỳ và tự động soạn tin nhắn nhận xét học lực gửi phụ huynh cực kỳ chuyên nghiệp và cá nhân hóa.",
      highlight:
        "Không còn cảnh giáo viên thức khuya copy-paste hàng trăm lời nhận xét chung chung vào sổ liên lạc.",
      benefits: [
        "Cá nhân hóa theo dữ liệu chuyên cần và phong độ của từng em",
        "Tùy chỉnh phong cách: Tích cực động viên hoặc Nghiêm túc nhắc nhở",
        "Gửi tin nhắn đồng loạt qua Zalo OA hoặc ứng dụng phụ huynh",
      ],
    },
    {
      id: "crm-advisor",
      title: "AI Phân tích Phễu & Cố vấn Tuyển sinh",
      badge: "Sắp ra mắt",
      iconName: "BarChart3",
      description:
        "Phân tích toàn diện phễu chuyển đổi tuyển sinh của trung tâm, phát hiện lý do khách hàng rời bỏ ở bước học thử và gợi ý kịch bản chốt sale tối ưu.",
      highlight:
        "Đóng vai trò như một chuyên gia tư vấn kinh doanh cho chủ trung tâm.",
      benefits: [
        "Cảnh báo tỷ lệ rớt lead ở từng khâu tư vấn",
        "Đề xuất khung giờ gọi lại và kịch bản chăm sóc khách hàng",
        "Dự báo doanh thu tuyển sinh tháng tới dựa trên dữ liệu quá khứ",
      ],
    },
    {
      id: "flashcards-ai",
      title: "AI Flashcard & Ghi nhớ kiến thức",
      badge: "Sắp ra mắt",
      iconName: "Sparkles",
      description:
        "Tự động tóm tắt bài giảng buổi học và sinh bộ thẻ ghi nhớ thông minh (Spaced Repetition) giúp học sinh ôn tập trước buổi học tiếp theo.",
      highlight:
        "Tăng tỷ lệ nhớ bài của học sinh lên 200% nhờ thuật ngữ ngắt quãng khoa học.",
      benefits: [
        "Sinh flashcard từ vựng, công thức Toán - Lý - Hóa tự động",
        "Học sinh có thể ôn bài qua ứng dụng điện thoại tiện lợi",
        "Báo cáo tiến độ hoàn thành cho giáo viên kiểm tra",
      ],
    },
  ];

  function openLeadWithCategory(cat: string) {
    setSelectedCategory(cat);
    setLeadModalOpen(true);
  }

  function handleAIFeatureClick(feature: AIFeatureDetail) {
    setSelectedAIFeature(feature);
    setAiModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Sticky Header */}
      <LandingHeader
        isLoggedIn={isLoggedIn}
        dashboardUrl={dashboardUrl}
        onOpenLeadModal={() => setLeadModalOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
          {/* Ambient Glowing Orbs Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
            <div className="absolute top-[-100px] left-[15%] w-[450px] h-[450px] bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute top-[40px] right-[10%] w-[400px] h-[400px] bg-purple-500/15 dark:bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute top-[250px] left-[40%] w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Value Proposition & CTA */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>⚡ Nền tảng Vận hành Giáo dục EMS & CRM Tích hợp AI Thế Hệ Mới</span>
                </div>

                {/* Primary Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
                  Phần Mềm EMS{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-primary to-purple-600 bg-clip-text text-transparent">
                    Tích Hợp AI Toàn Diện
                  </span>{" "}
                  Cho Mọi Trung Tâm Giáo Dục
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Giải pháp &ldquo;Tất cả trong một&rdquo; giúp tự động hóa điểm danh trừ ví, thu phí VietQR tự động, quản lý phễu tuyển sinh CRM và hỗ trợ giảng dạy thông minh bằng AI. Giảm 80% thời gian vận hành thủ công cho trung tâm vừa và nhỏ.
                </p>

                {/* CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Button
                    size="lg"
                    onClick={() => setLeadModalOpen(true)}
                    className="h-13 px-7 rounded-2xl bg-gradient-to-r from-indigo-600 via-primary to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-primary/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Bắt đầu dùng thử 14 ngày (Miễn phí)</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-13 px-6 rounded-2xl border-border/80 hover:bg-muted font-bold text-sm text-foreground flex items-center justify-center gap-2"
                  >
                    <a href="#features">
                      <span>Xem Demo Vận hành</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </Button>
                </div>

                {/* 3 Checklist items with green check icons */}
                <div className="pt-4 border-t border-border/60 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Phù hợp cho mọi bộ môn: Ngoại ngữ, Toán - Văn - Lý, Nghệ thuật, Lớp kèm.</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Tự động hóa gạch nợ học phí qua VietQR & Điểm danh một chạm.</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Đo lường hiệu quả phễu tuyển sinh & Trợ lý giáo viên AI.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Grid - Mockup Thẻ Nổi 3D */}
              <div className="lg:col-span-5 relative">
                {/* Decorative border frame with gradient */}
                <div className="relative mx-auto max-w-lg lg:max-w-none space-y-4">
                  {/* Card 1: AI Assistant (Top Floating) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">AI Chấm bài & Viết nhận xét</h4>
                          <p className="text-[10px] text-muted-foreground">Phân tích học viên: Trần Minh Anh (IELTS 6.5)</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                        AI Hub
                      </Badge>
                    </div>

                    <div className="space-y-2 bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-muted-foreground">Phát âm & Từ vựng:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">8.5/10 (Xuất sắc)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full w-[85%]" />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        &ldquo;Minh Anh phát âm chuẩn các âm cuối, cần khắc phục ngữ điệu ở câu hỏi đảo ngữ.&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Dual Grid: Card 2 & Card 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 2: Vận hành trung tâm */}
                    <div className="p-4 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-lg hover:-translate-y-1 transition-transform">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                        <Users2 className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Quy mô đào tạo</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Học viên</span>
                          <span className="text-base font-black text-foreground">1,240</span>
                        </div>
                        <div className="flex items-baseline justify-between border-t border-border/40 pt-1">
                          <span className="text-xs text-muted-foreground">Giáo viên</span>
                          <span className="text-sm font-bold text-foreground">48</span>
                        </div>
                        <div className="flex items-baseline justify-between border-t border-border/40 pt-1">
                          <span className="text-xs text-muted-foreground">Lớp hoạt động</span>
                          <span className="text-sm font-bold text-foreground">18 lớp</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Dòng tiền VietQR */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card/95 to-card backdrop-blur-xl border border-emerald-500/25 shadow-lg hover:-translate-y-1 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <QrCode className="w-4 h-4" />
                          <span className="text-[11px] font-bold">VietQR NAPAS</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        +1.800.000 đ
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        Đã gạch nợ tự động thành công qua VietQR TCB • Ví học sinh +10 buổi
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Phễu tuyển sinh (Mini CRM Funnel) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-lg hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">Phễu Chuyển Đổi Tuyển Sinh Tuần Này</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Tỷ lệ chốt: 36%</span>
                    </div>

                    {/* Mini funnel visual */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-muted/60 border border-border/40">
                        <div className="text-xs text-muted-foreground">Lead mới</div>
                        <div className="text-sm font-black text-foreground">35</div>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Học thử</div>
                        <div className="text-sm font-black text-indigo-700 dark:text-indigo-300">11</div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Nhập học</div>
                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">4</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: PHÙ HỢP VỚI MỌI QUY MÔ & LĨNH VỰC ĐÀO TẠO (#solutions) */}
        {/* ============================================================ */}
        <section id="solutions" className="py-20 bg-muted/30 border-y border-border/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Tính Năng Cá Nhân Hóa Theo Ngành</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Thiết Kế May Đo Cho Mọi Mô Hình & Lĩnh Vực
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Cho dù bạn là trung tâm ngoại ngữ quy mô chuỗi, cơ sở luyện thi hay giáo viên dạy kèm tự do, EduCenter EMS đều có kịch bản vận hành tối ưu sẵn sàng.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Ngoại ngữ */}
              <div
                onClick={() => openLeadWithCategory("language")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-indigo-500/40 hover:-translate-y-1.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Languages className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    Trung tâm Ngoại ngữ
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tối ưu cho IELTS, TOEIC, Giao tiếp, Tiếng Trung, Tiếng Nhật, Tiếng Hàn. Quản lý lộ trình khóa học theo band điểm và giáo trình chuẩn quốc tế.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Xem giải pháp chuyên biệt</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Luyện thi & Văn hóa */}
              <div
                onClick={() => openLeadWithCategory("k12")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-purple-500/40 hover:-translate-y-1.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-purple-600 transition-colors">
                    Luyện thi & Dạy văn hóa
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Các lớp Toán, Lý, Hóa, Văn, Tiếng Anh từ Tiểu học đến Ôn thi Đại học. Kiểm soát sỉ số lớp đông, điểm danh nhanh và quản lý học phí theo gói tháng.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-purple-600">
                  <span>Xem giải pháp chuyên biệt</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Dạy kèm & Giáo viên độc lập */}
              <div
                onClick={() => openLeadWithCategory("tutor")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    Lớp kèm & Giáo viên tự do
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quản lý học sinh riêng, kiểm soát chính xác số buổi trong ví học phí. Không lo phụ huynh khiếu nại hay quên số buổi đã học nhờ SMS/Zalo tức thì.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>Xem giải pháp chuyên biệt</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: Kỹ năng & Nghệ thuật */}
              <div
                onClick={() => openLeadWithCategory("skills")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                    Kỹ năng & Nghệ thuật
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lập trình nhí, Hội họa, Âm nhạc, Thể thao, Kỹ năng mềm. Linh hoạt xếp lịch học bù, đổi ca giảng dạy và quản lý dụng cụ thực hành lớp học.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Xem giải pháp chuyên biệt</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: 4 MODULE VẬN HÀNH THỰC CHIẾN (#features) */}
        {/* ============================================================ */}
        <section id="features" className="py-24 space-y-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Vận Hành Đơn Giản • Hiệu Quả Tối Đa</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                4 Trụ Cột Vận Hành Cốt Lõi Của EduCenter EMS
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Chấm dứt hoàn toàn tình trạng thất thoát học phí, nhầm lẫn lịch dạy và sự quá tải của đội ngũ nhân sự quản lý.
              </p>
            </div>

            {/* Module 1: Điểm danh 1 chạm & Ví học phí tự động */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarCheck2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Module 01
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Điểm danh 1 chạm & Ví học phí tự động
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Giáo viên thao tác điểm danh nhanh ngay trên điện thoại hoặc máy tính bảng. Hệ thống tự động khấu trừ 1 buổi học trong ví của học sinh có mặt, đồng thời ghi nhận lý do vắng có phép/không phép.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cảnh báo tức thì khi số dư ví của học sinh xuống dưới 2 buổi.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Hạn chế 100% việc tranh cãi về số buổi học giữa phụ huynh và trung tâm.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Hỗ trợ học bù, chuyển lớp mà không làm đứt gãy lịch sử trừ ví.</span>
                  </div>
                </div>
              </div>

              {/* Module 1 Mockup */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-foreground">Lớp IELTS Fighter A2 • Hôm nay 18:00</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold">
                      Sĩ số: 12/12
                    </Badge>
                  </div>

                  {/* Student row mockups */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
                      <div>
                        <p className="text-xs font-bold text-foreground">Nguyễn Hoàng Long</p>
                        <p className="text-[10px] text-muted-foreground">Ví: 8 buổi • Đã học 4 buổi</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                          ✓ Có mặt (-1 buổi)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
                      <div>
                        <p className="text-xs font-bold text-foreground">Trần Thị Hương Mai</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Ví: 1 buổi (Sắp hết ví)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                          ✓ Có mặt (-1 buổi)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
                      <div>
                        <p className="text-xs font-bold text-foreground">Vũ Đức Duy</p>
                        <p className="text-[10px] text-muted-foreground">Ví: 10 buổi</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-lg bg-muted">
                          Nghỉ có phép (Giữ ví)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 2: Thu học phí thông minh qua VietQR (NAPAS 247) - Reverse layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Mockup Left */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-foreground">Hóa Đơn Thu Phí Thông Minh</span>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Gạch nợ tức thì
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="p-4 rounded-2xl bg-background border border-border/60 text-center space-y-2">
                      <div className="w-32 h-32 mx-auto bg-muted rounded-xl p-2 border border-border/80 flex items-center justify-center">
                        {/* Simulated QR Code box */}
                        <div className="w-full h-full border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                          <QrCode className="w-12 h-12 text-primary" />
                          <span className="text-[9px] font-mono text-muted-foreground mt-1">VIETQR DYNAMIC</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">Quét bằng mọi ứng dụng ngân hàng</p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-muted/50">
                        <span className="text-[10px] text-muted-foreground block">Học viên nhận:</span>
                        <span className="font-bold text-foreground">Trần Bảo Nam (Lớp Toán 9A)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/50">
                        <span className="text-[10px] text-muted-foreground block">Số tiền thanh toán:</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">2.400.000 đ</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/50">
                        <span className="text-[10px] text-muted-foreground block">Cú pháp chuyển khoản:</span>
                        <span className="font-mono font-bold text-primary text-[11px]">HP NAM9A 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Right */}
              <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Module 02
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Thu học phí thông minh qua VietQR (NAPAS 247)
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Sinh mã QR động chuẩn xác theo từng học sinh, khóa học và số tiền cần nạp. Phụ huynh chỉ cần mở app ngân hàng quét mã, hệ thống tự động đối soát nội dung và cộng số buổi vào ví học sinh ngay lập tức.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Không cần kế toán canh sao kê ngân hàng đối chiếu thủ công mỗi ngày.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tương thích 100% với Vietcombank, Techcombank, MB Bank, ACB, VPBank...</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tự động gửi biên lai học phí kèm chữ ký điện tử qua Zalo phụ huynh.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 3: Quản lý Tuyển sinh & Phễu chuyển đổi (Mini CRM) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Module 03
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Quản lý Tuyển sinh & Phễu chuyển đổi (Mini CRM)
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Theo dõi học viên từ lúc còn là Data thô → Đã gọi tư vấn → Đến học thử → Chốt nhập học. Không bỏ sót bất kỳ khách hàng tiềm năng nào và đo lường chính xác tỷ lệ hoàn vốn trên từng kênh quảng cáo.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Bảng Kanban kéo thả trực quan phân loại trạng thái học viên.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Nhắc lịch gọi chăm sóc tự động cho chuyên viên tuyển sinh.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Báo cáo nguồn tuyển sinh: Facebook, Giới thiệu, Website, Trực tiếp.</span>
                  </div>
                </div>
              </div>

              {/* Module 3 Mockup */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="text-xs font-bold text-foreground">Phễu CRM Tuyển Sinh (Kanban)</span>
                    <Badge variant="outline" className="text-[10px] font-mono">Tháng 9/2026</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Stage 1 */}
                    <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Tư vấn</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-background text-[10px]">12</span>
                      </div>
                      <div className="p-2 rounded-xl bg-background border border-border/60 text-[11px] space-y-1 shadow-sm">
                        <p className="font-semibold text-foreground">Phan Thu Nga</p>
                        <p className="text-[9px] text-muted-foreground">Quan tâm: Luyện thi IELTS</p>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        <span>Học thử</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px]">5</span>
                      </div>
                      <div className="p-2 rounded-xl bg-background border border-indigo-500/30 text-[11px] space-y-1 shadow-sm">
                        <p className="font-semibold text-foreground">Lê Quốc Huy</p>
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400">Lịch học thử: T7 này</p>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span>Chốt nạp ví</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px]">8</span>
                      </div>
                      <div className="p-2 rounded-xl bg-background border border-emerald-500/30 text-[11px] space-y-1 shadow-sm">
                        <p className="font-semibold text-foreground">Đặng Mỹ Linh</p>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">Đã nạp ví 24 buổi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 4: Chấm công & Tự động tính lương Giáo viên - Reverse layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Mockup Left */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-bold text-foreground">Bảng Lương Giáo Viên Tự Động</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">Kỳ công: 01/09 - 30/09</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-foreground">Cô Nguyễn Minh Hà (Thạc sĩ Anh)</h5>
                        <p className="text-[11px] text-muted-foreground">Mức thù lao: 250.000 đ / buổi</p>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px]">
                        24 buổi dạy
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                      <div className="p-2 rounded-xl bg-muted/40">
                        <span className="text-[10px] text-muted-foreground block">Lương buổi</span>
                        <span className="text-xs font-bold text-foreground">6.000.000 đ</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10">
                        <span className="text-[10px] text-emerald-600 block">Thưởng chuyên cần</span>
                        <span className="text-xs font-bold text-emerald-600">+500.000 đ</span>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-500/10">
                        <span className="text-[10px] text-primary block">Thực nhận</span>
                        <span className="text-xs font-black text-primary">6.500.000 đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Right */}
              <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Module 04
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Chấm công & Tự động tính lương Giáo viên
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Xóa bỏ toàn bộ sổ sách Excel cuối tháng. Hệ thống tổng hợp tự động số ca dạy đã hoàn thành dựa trên lịch sử điểm danh thực tế, áp dụng công thức thù lao theo giờ/buổi, thưởng/phạt chỉ sau 1 click.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Minh bạch số ca dạy giữa quản lý và giáo viên, tránh tranh cãi cuối kỳ.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Xuất phiếu lương cá nhân và chuyển khoản nhanh qua ngân hàng tích hợp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Hỗ trợ chia tỷ lệ phần trăm doanh thu hoặc tính lương cố định linh hoạt.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: AI-HUB TRỢ LÝ GIÁO DỤC ĐỘT PHÁ (#ai-hub) */}
        {/* ============================================================ */}
        <section id="ai-hub" className="py-24 bg-gradient-to-b from-purple-950/10 via-background to-indigo-950/10 border-t border-border/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EduCenter AI-Hub • Tương Lai Của EdTech</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Hệ Sinh Thái Trợ Lý AI Dành Riêng Cho Giáo Dục
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tích hợp các mô hình trí tuệ nhân tạo chuyên biệt để tự động hóa khâu chuyên môn giảng dạy, biến trung tâm của bạn thành trường học thông minh dẫn đầu thị trường.
              </p>
            </div>

            {/* 6 AI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAIFeatureClick(item)}
                  className="group cursor-pointer p-6 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-purple-500/40 hover:-translate-y-1.5 transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {item.id === "exam-gen" && <FileQuestion className="w-6 h-6" />}
                        {item.id === "solution-ai" && <HelpCircle className="w-6 h-6" />}
                        {item.id === "grading-ai" && <FileCheck2 className="w-6 h-6" />}
                        {item.id === "feedback-gen" && <MessageSquare className="w-6 h-6" />}
                        {item.id === "crm-advisor" && <BarChart3 className="w-6 h-6" />}
                        {item.id === "flashcards-ai" && <Sparkle className="w-6 h-6" />}
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          item.badge === "Beta"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-xs font-bold"
                        }
                      >
                        {item.badge}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <span>Khám phá & Đăng ký thử nghiệm</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: BẢNG GIÁ & ĐĂNG KÝ (#pricing) */}
        {/* ============================================================ */}
        <section id="pricing" className="py-24 border-t border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chi Phí Hợp Lý • Hoàn Vốn Nhanh</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Bảng Giá Minh Bạch Dành Cho Mọi Quy Mô
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Dùng thử đầy đủ tính năng trong 14 ngày. Không phát sinh chi phí ẩn. Hỗ trợ đào tạo nhân sự tận tâm.
              </p>
            </div>

            {/* 3 Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Plan 1: Khởi nghiệp */}
              <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Lớp Dạy Kèm & Tự Do</h3>
                    <p className="text-xs text-muted-foreground">Dành cho giáo viên dạy kèm hoặc trung tâm mới thành lập</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">199.000</span>
                    <span className="text-xs font-bold text-muted-foreground">đ / tháng</span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quản lý tối đa 40 học viên</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Điểm danh 1 chạm & Ví học phí tự động</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Tạo mã thanh toán VietQR động</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Hỗ trợ kỹ thuật qua Zalo</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => openLeadWithCategory("tutor")}
                  variant="outline"
                  className="w-full h-11 rounded-xl font-bold text-xs"
                >
                  Chọn Gói Khởi Nghiệp
                </Button>
              </div>

              {/* Plan 2: Tiêu chuẩn (POPULAR) */}
              <div className="p-7 rounded-3xl bg-card border-2 border-primary shadow-2xl relative flex flex-col justify-between space-y-6">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                  Phổ Biến Nhất
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Trung Tâm Tiêu Chuẩn</h3>
                    <p className="text-xs text-muted-foreground">Dành cho trung tâm vừa và các cơ sở đào tạo chuyên nghiệp</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary">499.000</span>
                    <span className="text-xs font-bold text-muted-foreground">đ / tháng</span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quản lý đến 200 học viên & 15 giáo viên</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Đối soát gạch nợ VietQR tự động 24/7</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Phễu tuyển sinh Mini CRM & Phân loại lead</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Tự động tính lương & Chấm công giáo viên</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quyền dùng trước các module AI-Hub</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => openLeadWithCategory("language")}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:shadow-xl"
                >
                  Đăng Ký Gói Tiêu Chuẩn
                </Button>
              </div>

              {/* Plan 3: Chuyên nghiệp */}
              <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Doanh Nghiệp & Chuỗi</h3>
                    <p className="text-xs text-muted-foreground">Dành cho trung tâm quy mô lớn hoặc chuỗi nhiều chi nhánh</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">Liên Hệ</span>
                    <span className="text-xs font-bold text-muted-foreground">tùy biến</span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Không giới hạn học viên & lớp học</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quản lý đa chi nhánh tập trung 1 màn hình</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Tích hợp AI-Hub chuyên sâu (Custom Model)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Đội ngũ kỹ thuật hỗ trợ Onsite & Setup dữ liệu</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => openLeadWithCategory("other")}
                  variant="outline"
                  className="w-full h-11 rounded-xl font-bold text-xs"
                >
                  Nhận Tư Vấn Doanh Nghiệp
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: CALL TO ACTION CUỐI TRANG */}
        {/* ============================================================ */}
        <section className="py-20 bg-muted/40 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-2xl text-center space-y-6">
              {/* Background light glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Sẵn sàng hiện đại hóa trung tâm của bạn ngay hôm nay?
                </h2>
                <p className="text-sm sm:text-base text-indigo-100/80 leading-relaxed">
                  Gia nhập cùng hàng trăm quản lý và giáo viên đang tiết kiệm 80% thời gian vận hành mỗi ngày với EduCenter EMS.
                </p>
              </div>

              <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setLeadModalOpen(true)}
                  className="h-12 px-8 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-extrabold text-sm shadow-xl transition-all"
                >
                  Bắt đầu trải nghiệm miễn phí 14 ngày
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 rounded-xl border-white/30 text-white hover:bg-white/10 font-semibold text-sm"
                >
                  <a href="tel:0901234567" className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" />
                    <span>Hotline: 0901.234.567</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="border-t border-border/60 bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-primary text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-black text-lg tracking-tight text-foreground">
                  EduCenter EMS
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nền tảng Quản lý & Vận hành Giáo dục toàn diện tích hợp Trí tuệ nhân tạo thế hệ mới.
              </p>
            </div>

            {/* Col 2: Liên kết */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Giải Pháp</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Điểm danh & Ví học sinh</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Thu phí VietQR NAPAS</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Quản lý Phễu CRM</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Chấm công & Lương giáo viên</a></li>
              </ul>
            </div>

            {/* Col 3: AI Hub */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">EduCenter AI</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Tạo đề thi tự động</a></li>
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Chấm speaking & writing</a></li>
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Soạn nhận xét học lực</a></li>
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Flashcard thông minh</a></li>
              </ul>
            </div>

            {/* Col 4: Liên hệ */}
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Liên Hệ & Hỗ Trợ</h4>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Hotline: 0901.234.567 (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Email: hotro@educenter.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} EduCenter EMS Platform. Toàn quyền bảo lưu.</p>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-foreground transition-colors">Điều khoản dịch vụ</a>
              <a href="#terms" className="hover:text-foreground transition-colors">Chính sách bảo mật</a>
              <Link href="/login" className="hover:text-foreground font-semibold text-primary">Cổng nội bộ</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      <LeadModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        defaultCategory={selectedCategory}
      />

      {/* AI Hub Feature Preview Modal */}
      <AIHubPreviewModal
        feature={selectedAIFeature}
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onOpenLeadModal={() => setLeadModalOpen(true)}
      />
    </div>
  );
}
