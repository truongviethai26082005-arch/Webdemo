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
  UserCheck,
  LayoutGrid,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHeader } from "./landing-header";
import { LeadModal } from "./lead-modal";
import { AIHubPreviewModal, AIFeatureDetail } from "./ai-hub-preview-modal";
import { LoginModal } from "./login-modal";
import { motion, type Variants } from "framer-motion";

const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

interface LandingPageContentProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
}

export function LandingPageContent({
  isLoggedIn,
  dashboardUrl,
}: LandingPageContentProps) {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("language");
  const [selectedAIFeature, setSelectedAIFeature] = useState<AIFeatureDetail | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const aiFeatures: AIFeatureDetail[] = [
    {
      id: "exam-grading-ai",
      title: "AI Hỗ trợ Ra đề & Chấm điểm Đa môn",
      badge: "Beta",
      iconName: "FileCheck2",
      description:
        "Tự động quét tài liệu PDF/Word của giáo viên để sinh ngân hàng đề thi hoặc hỗ trợ chữa bài, chấm điểm trắc nghiệm/tự luận chi tiết (Toán, Văn, Lý, Ngoại ngữ...).",
      highlight:
        "Tiết kiệm 90% thời gian biên soạn đề và chấm bài kiểm tra cho giáo viên mọi môn học.",
      benefits: [
        "Quét file PDF/Word trích xuất câu hỏi trắc nghiệm & tự luận chuẩn ma trận",
        "Chấm bài tự động theo barem đáp án hoặc AI giải thích chi tiết từng bước",
        "Hỗ trợ đa dạng bộ môn: Toán, Văn, Lý, Hóa, Ngoại ngữ, Lịch sử, Sinh học...",
      ],
    },
    {
      id: "student-eval-ai",
      title: "AI Theo dõi Quá trình Học tập & Đánh giá Học sinh",
      badge: "Beta",
      iconName: "MessageSquare",
      description:
        "Phân tích chuyên cần, điểm số định kỳ để viết nhận xét cá nhân hóa gửi phụ huynh chuyên nghiệp qua Zalo/SMS.",
      highlight:
        "Xóa bỏ cảnh giáo viên thức khuya copy-paste hàng trăm lời nhận xét chung chung vào sổ liên lạc.",
      benefits: [
        "Tự động tổng hợp dữ liệu chuyên cần, kết quả bài test và biểu đồ tiến bộ",
        "Soạn tin nhắn nhận xét học lực cá nhân hóa, mang tính xây dựng và tích cực",
        "Tích hợp gửi đồng loạt qua Zalo OA hoặc ứng dụng phụ huynh chỉ sau 1 click",
      ],
    },
    {
      id: "crm-funnel-ai",
      title: "AI Phân tích Phễu Tuyển sinh",
      badge: "Sắp ra mắt",
      iconName: "BarChart3",
      description:
        "Đọc tỷ lệ rớt lead qua từng nấc phễu để chỉ ra nguyên nhân và gợi ý giải pháp cải thiện chuyển đổi.",
      highlight:
        "Cố vấn kinh doanh thông minh giúp chủ trung tâm tối ưu hóa chi phí quảng cáo và tuyển sinh.",
      benefits: [
        "Đo lường tỷ lệ chuyển đổi qua từng nấc: Lead thô → Tư vấn → Test/Học thử → Nộp tiền",
        "Phát hiện chính xác nút thắt rớt học viên và đề xuất kịch bản sale tối ưu",
        "Gợi ý khung giờ vàng gọi lại và kịch bản chăm sóc khách hàng cá nhân hóa",
      ],
    },
    {
      id: "cashflow-forecast-ai",
      title: "AI Dự báo Dòng tiền & Cảnh báo Nguy cơ",
      badge: "Sắp ra mắt",
      iconName: "TrendingUp",
      description:
        "Dự báo học sinh có xu hướng nghỉ học và ước tính dòng tiền chu kỳ tiếp theo.",
      highlight:
        "Phát hiện sớm nguy cơ học sinh thôi học trước 3-4 tuần để trung tâm chủ động giữ chân học viên.",
      benefits: [
        "Cảnh báo sớm nguy cơ nghỉ học dựa trên số buổi vắng và sự sụt giảm điểm số",
        "Ước tính dòng tiền thực thu các chu kỳ tiếp theo dựa trên số dư ví khả dụng",
        "Cảnh báo công nợ tồn đọng và đề xuất chính sách tái tục nạp ví đúng lúc",
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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary relative">
      {/* Fixed Header */}
      <LandingHeader
        isLoggedIn={isLoggedIn}
        dashboardUrl={dashboardUrl}
        onOpenLeadModal={() => setLeadModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Main Page Body with offset for fixed header */}
      <main className="flex-1 pt-20 overflow-x-hidden">
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
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainerVariants}
                className="lg:col-span-7 space-y-6 text-left"
              >
                {/* Top Badge */}
                <motion.div variants={staggerItemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>⚡ Giải pháp B2B SaaS &apos;All-in-One&apos; cho Trung tâm Giáo dục (Đặc biệt vừa &amp; nhỏ)</span>
                </motion.div>

                {/* Primary Heading */}
                <motion.h1 variants={staggerItemVariants} className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
                  Hệ Sinh Thái Quản Lý &amp; Vận Hành Giáo Dục{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-primary to-purple-600 bg-clip-text text-transparent">
                    Tích Hợp AI Thế Hệ Mới
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p variants={staggerItemVariants} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Thay thế hoàn toàn sổ sách giấy, file Excel rời rạc và các nhóm chat hỗn tạp. Đồng bộ quy trình toàn diện từ Tuyển sinh (CRM) →  Vận hành lớp học → Thu phí VietQR tự động → Giảng dạy &amp; Trợ lý AI trên một nền tảng duy nhất.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={staggerItemVariants} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Button
                    size="lg"
                    onClick={() => setLeadModalOpen(true)}
                    className="h-13 px-7 rounded-2xl bg-gradient-to-r from-indigo-600 via-primary to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-primary/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Trải nghiệm miễn phí ngay →</span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-13 px-6 rounded-2xl border-border/80 hover:bg-muted font-bold text-sm text-foreground flex items-center justify-center gap-2"
                  >
                    <a href="#features">
                      <span>Khám phá giải pháp</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </Button>
                </motion.div>

                {/* 3 Checklist items with green check icons */}
                <motion.div variants={staggerItemVariants} className="pt-4 border-t border-border/60 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Tối ưu cho mọi mô hình: Ngoại ngữ, Luyện thi văn hóa, Dạy kèm, Năng khiếu &amp; Kỹ năng.</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Tự động hóa gạch nợ học phí qua VietQR Napas 247 &amp; Cảnh báo sắp hết buổi.</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Phễu tuyển sinh CRM đo lường chuyển đổi kết hợp Cố vấn kinh doanh AI.</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column: Visual Grid - Mockup Thẻ Nổi 3D */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 relative"
              >
                {/* Decorative border frame with gradient */}
                <div className="relative mx-auto max-w-lg lg:max-w-none space-y-4">
                  {/* Card 1: AI Assistant (Top Floating) */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-xl shadow-indigo-500/5 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">AI Chữa bài &amp; Viết nhận xét</h4>
                          <p className="text-[10px] text-muted-foreground">Phân tích học viên: Trần Minh Anh (Toán &amp; Khoa học)</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                        AI Hub
                      </Badge>
                    </div>

                    <div className="space-y-2 bg-muted/40 p-2.5 rounded-xl border border-border/40">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-muted-foreground">Tư duy logic &amp; Trình bày:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">9.0/10 (Xuất sắc)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full w-[90%]" />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        &ldquo;Minh Anh nắm vững phương pháp giải bài, lập luận mạch lạc, cần chú ý ghi rõ đơn vị ở câu hỏi hình học.&rdquo;
                      </p>
                    </div>
                  </motion.div>

                  {/* Dual Grid: Card 2 & Card 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 2: Vận hành trung tâm */}
                    <div className="p-4 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-lg hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/50 transition-all duration-300">
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
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card/95 to-card backdrop-blur-xl border border-emerald-500/25 shadow-lg hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/50 transition-all duration-300"
                    >
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
                    </motion.div>
                  </div>

                  {/* Card 4: Phễu tuyển sinh (Mini CRM Funnel) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-lg hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/50 transition-all duration-300">
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
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: PHÙ HỢP VỚI MỌI QUY MÔ & LĨNH VỰC ĐÀO TẠO (#solutions) */}
        {/* ============================================================ */}
        <section id="solutions" className="py-20 bg-muted/30 border-y border-border/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="text-center max-w-3xl mx-auto space-y-3 mb-14"
            >
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
            </motion.div>

            {/* 4 Cards Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Card 1: Ngoại ngữ */}
              <motion.div
                variants={staggerItemVariants}
                onClick={() => openLeadWithCategory("language")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-indigo-400/50 hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
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
              </motion.div>

              {/* Card 2: Luyện thi & Văn hóa */}
              <motion.div
                variants={staggerItemVariants}
                onClick={() => openLeadWithCategory("k12")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-purple-400/50 hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
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
              </motion.div>

              {/* Card 3: Dạy kèm & Giáo viên độc lập */}
              <motion.div
                variants={staggerItemVariants}
                onClick={() => openLeadWithCategory("tutor")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-emerald-400/50 hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
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
              </motion.div>

              {/* Card 4: Kỹ năng & Nghệ thuật */}
              <motion.div
                variants={staggerItemVariants}
                onClick={() => openLeadWithCategory("skills")}
                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-blue-400/50 hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
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
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: ĐỐI TƯỢNG PHỤC VỤ (USER ROLES) (#roles) */}
        {/* ============================================================ */}
        <section id="roles" className="py-20 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="text-center max-w-3xl mx-auto space-y-3 mb-14"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Users2 className="w-3.5 h-3.5" />
                <span>Phân Quyền Tối Ưu • Đúng Người Đúng Việc</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Giao Diện Chuyên Biệt Cho Từng Vai Trò Cốt Lõi
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Được thiết kế may đo cho hai lực lượng nòng cốt quyết định hiệu quả vận hành của trung tâm: Đội ngũ điều hành và Đội ngũ giảng dạy.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainerVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
            >
              {/* Card Role 1: Admin */}
              <motion.div
                variants={staggerItemVariants}
                className="relative group p-8 rounded-3xl bg-gradient-to-br from-card via-card/90 to-indigo-500/[0.03] border border-border/80 shadow-lg hover:shadow-2xl hover:border-indigo-400/50 hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold px-3 py-1">
                      Dành Cho Quản Trị Viên
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                      Dành cho Chủ trung tâm &amp; Quản lý (Admin)
                    </h3>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border/50">
                      &ldquo;Kiểm soát toàn bộ hoạt động trung tâm trong một màn hình Dashboard: Nắm trọn dòng tiền thực thu, công nợ tồn đọng, tỷ lệ chuyển đổi phễu sale và đối soát lương giáo viên chỉ sau 1 click.&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Dashboard tổng quan: Nắm trọn dòng tiền thực thu và công nợ tồn đọng.</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Đo lường tỷ lệ chuyển đổi phễu sale từ lead thô đến lúc chốt đóng tiền.</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Đối soát lương giáo viên theo ca dạy thực tế chỉ sau 1 click chuột.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/50">
                  <Button
                    onClick={() => setLeadModalOpen(true)}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-indigo-500/30 hover:bg-indigo-500/10 font-bold text-xs text-foreground flex items-center justify-center gap-2"
                  >
                    <span>Trải nghiệm Dashboard Quản lý</span>
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                  </Button>
                </div>
              </motion.div>

              {/* Card Role 2: Teacher */}
              <motion.div
                variants={staggerItemVariants}
                className="relative group p-8 rounded-3xl bg-gradient-to-br from-card via-card/90 to-purple-500/[0.03] border border-border/80 shadow-lg hover:shadow-2xl hover:border-purple-400/50 hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold px-3 py-1">
                      Dành Cho Giảng Viên
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Dành cho Đội ngũ Giáo viên (Teacher)
                    </h3>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border/50">
                      &ldquo;Giải phóng sức lao động với điểm danh 1 chạm trên di động, quản lý lịch dạy minh bạch, theo dõi thù lao ca dạy theo thời gian thực và tận dụng trợ lý AI hỗ trợ học liệu.&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Điểm danh 1 chạm ngay trên di động, tự động khấu trừ ví học sinh chuẩn xác.</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quản lý lịch dạy minh bạch, chống trùng ca và nhận thông báo đổi giờ học.</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Theo dõi thù lao ca dạy theo thời gian thực và tận dụng trợ lý AI hỗ trợ học liệu.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/50">
                  <Button
                    onClick={() => setLeadModalOpen(true)}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-purple-500/30 hover:bg-purple-500/10 font-bold text-xs text-foreground flex items-center justify-center gap-2"
                  >
                    <span>Khám phá Không gian Giáo viên</span>
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: HỆ SINH THÁI TOÀN DIỆN (CORE PILLARS) (#features) */}
        {/* ============================================================ */}
        <section id="features" className="py-24 space-y-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="text-center max-w-3xl mx-auto space-y-3 mb-16"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Hệ Sinh Thái Toàn Diện • Vận Hành Thực Chiến</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                4 Trụ Cột Vận Hành Cốt Lõi Của EduCenter EMS
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Đồng bộ hóa toàn diện từ khâu tuyển sinh, lớp học thực chiến đến dòng tiền học phí và không gian số học tập.
              </p>
            </motion.div>

            {/* Trụ cột 1: CRM & Phễu Tuyển Sinh Tích Hợp AI */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              <div className="lg:col-span-6 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Trụ cột 1
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    CRM &amp; Phễu Tuyển Sinh Tích Hợp AI
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Đo lường trực quan toàn bộ hành trình chuyển đổi: Lead thô → Đã tư vấn → Học thử / Test → Chốt cọc đóng tiền. AI tự động phân tích dữ liệu, đánh giá hiệu quả, phát hiện nút thắt rớt học viên và đề xuất kịch bản sale tối ưu.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Trực quan hóa toàn bộ phễu chuyển đổi qua bảng Kanban phân loại trạng thái.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>AI tự động phát hiện nút thắt rớt học viên và đề xuất kịch bản sale tối ưu.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Nhắc lịch gọi chăm sóc và đặt lịch kiểm tra trình độ hoàn toàn tự động.</span>
                  </div>
                </div>
              </div>

              {/* Trụ cột 1 Mockup */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-400/40 transition-all duration-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-foreground">Phễu Chuyển Đổi Tuyển Sinh (Kanban)</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">
                      Tỷ lệ chốt: 38%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Stage 1 */}
                    <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Đã tư vấn</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-background text-[10px]">14</span>
                      </div>
                      <div className="p-2 rounded-xl bg-background border border-border/60 text-[11px] space-y-1 shadow-sm">
                        <p className="font-semibold text-foreground">Phan Thu Nga</p>
                        <p className="text-[9px] text-muted-foreground">Quan tâm: Lớp Toán 9A</p>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        <span>Học thử / Test</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px]">6</span>
                      </div>
                      <div className="p-2 rounded-xl bg-background border border-indigo-500/30 text-[11px] space-y-1 shadow-sm">
                        <p className="font-semibold text-foreground">Lê Quốc Huy</p>
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400">Lịch test: Thứ Bảy 15:00</p>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span>Chốt cọc nộp tiền</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px]">9</span>
                      </div>
                      <div className="p-2 rounded-xl bg-background border border-emerald-500/30 text-[11px] space-y-1 shadow-sm">
                        <p className="font-semibold text-foreground">Đặng Mỹ Linh</p>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">Đã nạp ví 24 buổi</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Insight Box */}
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-2.5">
                    <Bot className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      <span className="font-bold text-foreground">AI Cố vấn Kinh doanh:</span> &ldquo;Tỷ lệ chuyển đổi sau học thử đạt 75%. Đề xuất gọi lại trong vòng 24h để tăng khả năng chốt cọc thêm 22%.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trụ cột 2: Quản Lý & Vận Hành Lớp Học Thực Chiến - Reverse layout */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              {/* Mockup Left */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-400/40 transition-all duration-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-foreground">Lớp Ôn Thi Toán 9A • Hôm nay 18:00</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold">
                      Sĩ số: 12/12
                    </Badge>
                  </div>

                  {/* Student rows */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
                      <div>
                        <p className="text-xs font-bold text-foreground">Nguyễn Hoàng Long</p>
                        <p className="text-[10px] text-muted-foreground">Ví: 8 buổi khả dụng • Đã học 4 buổi</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                        ✓ Có mặt (-1 buổi)
                      </span>
                    </div>

                    {/* RED ALERT ROW */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/[0.04] border border-red-500/30">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground">Trần Thị Hương Mai</p>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-red-500 text-white animate-pulse">
                            Cảnh báo đỏ
                          </span>
                        </div>
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                          Ví: Còn 1 buổi (Sắp hết số buổi học khả dụng)
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                        ✓ Có mặt (-1 buổi)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
                      <div>
                        <p className="text-xs font-bold text-foreground">Vũ Đức Duy</p>
                        <p className="text-[10px] text-muted-foreground">Ví: 10 buổi khả dụng</p>
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-lg bg-muted">
                        Nghỉ có phép (Bảo lưu ví)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Right */}
              <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarCheck2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Trụ cột 2
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Quản Lý &amp; Vận Hành Lớp Học Thực Chiến
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Quản lý hồ sơ học sinh, xếp lớp, theo dõi lịch dạy chống trùng ca. Hệ thống tự động kiểm tra và gửi cảnh báo đỏ khi học sinh sắp hết số buổi học khả dụng, đảm bảo không thất thoát doanh thu.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Quản lý hồ sơ học sinh, xếp lớp thông minh và theo dõi lịch dạy chống trùng ca.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Hệ thống tự động kiểm tra và gửi cảnh báo đỏ khi học sinh sắp hết số buổi học khả dụng.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Điểm danh 1 chạm trên di động, khấu trừ ví minh bạch, đảm bảo không thất thoát doanh thu.</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trụ cột 3: Vận Hành Dòng Tiền & Bảng Lương Minh Bạch */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              <div className="lg:col-span-6 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Trụ cột 3
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Vận Hành Dòng Tiền &amp; Bảng Lương Minh Bạch
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tự động sinh mã VietQR Napas 247 đúng cú pháp và số tiền. Quản lý công nợ học viên theo dạng sổ cái (Customer Ledger) và tự động tính thù lao giáo viên theo ca dạy thực tế, giải phóng hoàn toàn khâu tính toán cuối tháng.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tự động sinh mã VietQR Napas 247 đúng cú pháp và số tiền, gạch nợ tức thì 24/7.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Quản lý công nợ học viên theo dạng sổ cái (Customer Ledger), theo dõi chi tiết từng biến động nạp rút.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tự động tính thù lao giáo viên theo ca dạy thực tế, giải phóng hoàn toàn khâu tính toán cuối tháng.</span>
                  </div>
                </div>
              </div>

              {/* Trụ cột 3 Mockup */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-400/40 transition-all duration-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-foreground">Thu Phí Tự Động VietQR Napas 247</span>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Gạch nợ tức thì
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="p-4 rounded-2xl bg-background border border-border/60 text-center space-y-2">
                      <div className="w-28 h-28 mx-auto bg-muted rounded-xl p-2 border border-border/80 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-emerald-500/40 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                          <QrCode className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[8px] font-mono text-muted-foreground mt-1">VIETQR NAPAS 247</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">Quét bằng mọi App Ngân hàng</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-muted/50">
                        <span className="text-[10px] text-muted-foreground block">Học viên &amp; Lớp:</span>
                        <span className="font-bold text-foreground">Trần Bảo Nam (Toán 9A)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/50">
                        <span className="text-[10px] text-muted-foreground block">Số tiền thanh toán:</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">2.400.000 đ</span>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/50">
                        <span className="text-[10px] text-muted-foreground block">Cú pháp chuyển khoản:</span>
                        <span className="font-mono font-bold text-primary text-[11px]">HP NAM9A 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Payroll Preview */}
                  <div className="p-3 rounded-2xl bg-background border border-border/60 space-y-2 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Calculator className="w-4 h-4 text-primary" />
                        <span>Sổ cái &amp; Bảng lương: Cô Nguyễn Minh Hà</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">24 ca dạy thực tế</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-muted/40">
                        <span className="text-[9px] text-muted-foreground block">Thù lao ca</span>
                        <span className="font-bold text-foreground">6.000.000 đ</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <span className="text-[9px] text-emerald-600 block">Thưởng</span>
                        <span className="font-bold text-emerald-600">+500.000 đ</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-indigo-500/10">
                        <span className="text-[9px] text-primary block">Thực nhận</span>
                        <span className="font-black text-primary">6.500.000 đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trụ cột 4: Cổng Học Viên & Không Gian Số Học Tập - Reverse layout */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              {/* Mockup Left */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-muted/40 border border-border/80 shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/40 transition-all duration-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold text-foreground">Cổng Học Viên &amp; Phụ Huynh</span>
                    </div>
                    <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                      Thời gian thực
                    </Badge>
                  </div>

                  {/* Student Portal Card Details */}
                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-foreground">Học sinh: Lê Bảo Anh</h5>
                        <p className="text-[11px] text-muted-foreground">Lớp: Ôn Thi Chuyên Toán 9A</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Số dư ví học phí</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">8 buổi khả dụng</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                      <div className="p-2 rounded-xl bg-muted/40 text-xs">
                        <span className="text-[10px] text-muted-foreground block">Lịch học tiếp theo</span>
                        <span className="font-semibold text-foreground">Thứ Tư 18:00 (P.201)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-xs flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] text-primary font-bold">Nạp tiền VietQR</span>
                        <span className="text-[9px] text-muted-foreground">Nhận mã tức thì</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-[11px]">Kho đề thi &amp; Bài giảng số:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Đã nộp: 9.5/10</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Chuyên đề Hàm số bậc hai • Giáo viên đã chấm chữa chi tiết</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Right */}
              <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Trụ cột 4
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Cổng Học Viên &amp; Không Gian Số Học Tập
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Kết nối trực tiếp phụ huynh và học sinh với trung tâm: Tra cứu số dư ví học phí theo thời gian thực, xem lịch học - điểm danh minh bạch, nhận mã VietQR nộp tiền nhanh chóng và truy cập kho bài giảng, đề thi hoặc làm bài kiểm tra được cung cấp.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tra cứu số dư ví học phí theo thời gian thực, xem lịch học và điểm danh minh bạch.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Nhận mã VietQR nộp tiền nhanh chóng, gạch nợ ví tức thì không cần đợi xác nhận thủ công.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Truy cập kho bài giảng số, đề thi và làm bài kiểm tra trực tuyến được cung cấp.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: HỆ SINH THÁI AI-HUB (#ai-hub) */}
        {/* ============================================================ */}
        <section id="ai-hub" className="py-24 bg-gradient-to-b from-purple-950/10 via-background to-indigo-950/10 border-t border-border/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="text-center max-w-3xl mx-auto space-y-3 mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EduCenter AI-Hub • Thế Hệ Mới</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Hệ Sinh Thái AI-Hub: Hỗ trợ giảng dạy &amp; kinh doanh
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Ứng dụng trí tuệ nhân tạo thế hệ mới, chia làm 2 nhánh trợ lý chuyên sâu phục vụ trực tiếp cho Giáo viên và Chủ trung tâm.
              </p>
            </motion.div>

            {/* 2 Dedicated Branches Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainerVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Branch 1: AI Trợ lý Sư phạm & Giảng dạy (Academic AI) */}
              <motion.div
                variants={staggerItemVariants}
                className="p-7 rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-xl hover:border-indigo-400/50 hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        AI Trợ lý Sư phạm &amp; Giảng dạy
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">Academic AI</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-xs font-bold">
                    Dành Cho Giáo Viên
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Card 1: Ra đề & Chấm điểm */}
                  <div
                    onClick={() => handleAIFeatureClick(aiFeatures[0])}
                    className="group cursor-pointer p-5 rounded-2xl bg-muted/40 hover:bg-indigo-500/[0.04] border border-border/60 hover:border-indigo-400/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          AI Hỗ trợ Ra đề &amp; Chấm điểm Đa môn
                        </h4>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                        Beta
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Tự động quét tài liệu PDF/Word của giáo viên để sinh ngân hàng đề thi hoặc hỗ trợ chữa bài, chấm điểm trắc nghiệm/tự luận chi tiết (Toán, Văn, Lý, Ngoại ngữ...).
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Xem chi tiết giải pháp</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Card 2: Theo dõi & Đánh giá */}
                  <div
                    onClick={() => handleAIFeatureClick(aiFeatures[1])}
                    className="group cursor-pointer p-5 rounded-2xl bg-muted/40 hover:bg-indigo-500/[0.04] border border-border/60 hover:border-indigo-400/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          AI Theo dõi Quá trình Học tập &amp; Đánh giá Học sinh
                        </h4>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                        Beta
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Phân tích chuyên cần, điểm số định kỳ để viết nhận xét cá nhân hóa gửi phụ huynh chuyên nghiệp qua Zalo/SMS.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Xem chi tiết giải pháp</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Branch 2: AI Trợ lý Kinh doanh & Vận hành (Business AI) */}
              <motion.div
                variants={staggerItemVariants}
                className="p-7 rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-xl hover:border-emerald-400/50 hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        AI Trợ lý Kinh doanh &amp; Vận hành
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">Business AI</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
                    Dành Cho Chủ Trung Tâm
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Card 3: Phân tích phễu */}
                  <div
                    onClick={() => handleAIFeatureClick(aiFeatures[2])}
                    className="group cursor-pointer p-5 rounded-2xl bg-muted/40 hover:bg-emerald-500/[0.04] border border-border/60 hover:border-emerald-400/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          AI Phân tích Phễu Tuyển sinh
                        </h4>
                      </div>
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
                        Sắp ra mắt
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Đọc tỷ lệ rớt lead qua từng nấc phễu để chỉ ra nguyên nhân và gợi ý giải pháp cải thiện chuyển đổi.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Đăng ký nhận thông báo sớm</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Card 4: Dự báo dòng tiền */}
                  <div
                    onClick={() => handleAIFeatureClick(aiFeatures[3])}
                    className="group cursor-pointer p-5 rounded-2xl bg-muted/40 hover:bg-emerald-500/[0.04] border border-border/60 hover:border-emerald-400/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          AI Dự báo Dòng tiền &amp; Cảnh báo Nguy cơ
                        </h4>
                      </div>
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
                        Sắp ra mắt
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Dự báo học sinh có xu hướng nghỉ học và ước tính dòng tiền chu kỳ tiếp theo.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Đăng ký nhận thông báo sớm</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: BẢNG GIÁ & ĐĂNG KÝ (#pricing) */}
        {/* ============================================================ */}
        <section id="pricing" className="py-24 border-t border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUpVariants}
              className="text-center max-w-3xl mx-auto space-y-3 mb-16"
            >
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
            </motion.div>

            {/* 3 Pricing Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
            >
              {/* Plan 1: Khởi nghiệp */}
              <motion.div
                variants={staggerItemVariants}
                className="p-7 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-indigo-400/50 hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between space-y-6"
              >
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
              </motion.div>

              {/* Plan 2: Tiêu chuẩn (POPULAR) */}
              <motion.div
                variants={staggerItemVariants}
                className="p-7 rounded-3xl bg-card border-2 border-primary shadow-2xl relative hover:shadow-2xl hover:border-primary hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between space-y-6"
              >
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
              </motion.div>

              {/* Plan 3: Chuyên nghiệp */}
              <motion.div
                variants={staggerItemVariants}
                className="p-7 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-indigo-400/50 hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between space-y-6"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: CALL TO ACTION CUỐI TRANG */}
        {/* ============================================================ */}
        <section className="py-20 bg-muted/40 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUpVariants}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          >
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
          </motion.div>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Trụ Cột Vận Hành</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">CRM &amp; Phễu Tuyển Sinh AI</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Vận hành Lớp học Thực chiến</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Thu VietQR &amp; Bảng lương minh bạch</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Cổng Học Viên &amp; Không Gian Số</a></li>
              </ul>
            </div>

            {/* Col 3: AI Hub */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">EduCenter AI-Hub</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Ra đề &amp; Chấm điểm Đa môn</a></li>
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Theo dõi &amp; Đánh giá Học sinh</a></li>
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Phân tích Phễu Tuyển sinh</a></li>
                <li><a href="#ai-hub" className="hover:text-foreground transition-colors">AI Dự báo Dòng tiền &amp; Cảnh báo</a></li>
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
              {isLoggedIn ? (
                <Link href={dashboardUrl} className="hover:text-foreground font-semibold text-primary">Cổng nội bộ</Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="hover:text-foreground font-semibold text-primary transition-colors cursor-pointer"
                >
                  Cổng nội bộ
                </button>
              )}
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

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
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
