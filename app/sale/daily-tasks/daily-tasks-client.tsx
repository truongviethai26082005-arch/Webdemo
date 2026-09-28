"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SaleDailyTasksData,
  CallbackTaskItem,
  TodayTrialTaskItem,
} from "@/lib/actions/admissions";
import { Lead, Class, LeadTrial } from "@/types/database";
import { CenterBankSettings } from "@/lib/utils/vietqr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallbackResolutionDialog } from "@/components/sale/callback-resolution-dialog";
import { QuickCallConfirmDialog } from "@/components/sale/quick-call-confirm-dialog";
import { QuickFacebookLink } from "@/components/sale/quick-call-link";
import { LeadDetailDrawer } from "@/components/sale/lead-detail-drawer";
import { TrialAssessmentDialog } from "@/components/sale/trial-assessment-dialog";
import { ConversionCheckoutModal } from "@/components/sale/conversion-checkout-modal";
import {
  CalendarCheck,
  PhoneCall,
  Clock,
  Phone,
  MessageSquare,
  Award,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DailyTasksClientProps {
  initialTasks: SaleDailyTasksData;
  allLeads: Lead[];
  classes: Class[];
  bankSettings: CenterBankSettings;
  saleName: string;
}

export function DailyTasksClient({
  initialTasks,
  allLeads,
  classes,
  bankSettings,
  saleName,
}: DailyTasksClientProps) {
  const router = useRouter();

  // Realtime: tự làm mới trang khi bảng `leads` thay đổi (VD Lead mới từ
  // webhook Google Form) — không cần F5 thủ công. Gộp sự kiện dồn dập trong
  // 1.5s thành 1 lần refresh. YÊU CẦU: bảng `leads` phải bật Realtime trên
  // Supabase (`ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;`)
  // — xem giải thích đầy đủ ở admissions-client.tsx.
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Gắn access token trước khi subscribe — lý do xem admissions-client.tsx.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) await supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase
        .channel("sale-daily-tasks-leads-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "leads" },
          () => {
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = setTimeout(() => router.refresh(), 1500);
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  // Modals state
  const [selectedCallback, setSelectedCallback] = useState<CallbackTaskItem | null>(null);
  const [callbackOpen, setCallbackOpen] = useState(false);

  const [missedCallTask, setMissedCallTask] = useState<CallbackTaskItem | null>(null);
  const [missedCallOpen, setMissedCallOpen] = useState(false);

  const [selectedDrawerLead, setSelectedDrawerLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [assessmentTrial, setAssessmentTrial] = useState<
    (LeadTrial & { leadName?: string; leadPhone?: string; slotName?: string }) | null
  >(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  const [checkoutLead, setCheckoutLead] = useState<Lead | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // State highlight khối công việc khi bấm vào các ô checklist
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedSection(sectionId);
      setTimeout(() => {
        setHighlightedSection(null);
      }, 2500);
    }
  };

  const handleOpenLeadDrawer = (leadId: string) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedDrawerLead(lead);
      setDrawerOpen(true);
    }
  };

  const handleOpenCheckout = (leadId: string) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (lead) {
      setCheckoutLead(lead);
      setCheckoutOpen(true);
    }
  };

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr).getTime() < new Date().getTime();
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* GREETING & SUMMARY BANNER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-indigo-500/10 to-emerald-500/10 border border-primary/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider">
            <CalendarCheck className="w-3 h-3" /> Lịch làm việc cá nhân hóa
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Xin chào, {saleName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Hôm nay hệ thống ghi nhận{" "}
            <strong className="text-foreground">{initialTasks.urgentTasksCount} đầu việc</strong>{" "}
            cần bạn ưu tiên xử lý: gọi lại cho phụ huynh, theo dõi ca học thử và tiếp cận Lead mới.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/sale/admissions">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 h-9 rounded-xl border-border/80"
            >
              Vào Phễu Tuyển sinh
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI SUMMARY CARDS (INTERACTIVE CHECKLIST) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lead mới — đổi lên đầu (2026-09-17) để khớp thứ tự ưu
            tiên mới của các khối bên dưới: Lead mới → Hẹn gọi lại → Học thử. */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => scrollToSection("section-new-leads")}
          onKeyDown={(e) => e.key === "Enter" && scrollToSection("section-new-leads")}
          title="Bấm để cuộn xem chi tiết Lead mới tiếp nhận"
          className="p-4 rounded-2xl bg-card border border-blue-200 dark:border-blue-900/50 shadow-xs flex items-center justify-between gap-2.5 hover:shadow-md hover:border-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground">
                {initialTasks.newLeads.length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Lead mới tiếp nhận</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
        </div>

        {/* Card 2: Hẹn gọi lại */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => scrollToSection("section-callbacks")}
          onKeyDown={(e) => e.key === "Enter" && scrollToSection("section-callbacks")}
          title="Bấm để cuộn xem chi tiết cuộc hẹn gọi lại"
          className="p-4 rounded-2xl bg-card border border-amber-200 dark:border-amber-900/50 shadow-xs flex items-center justify-between gap-2.5 hover:shadow-md hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground">
                {initialTasks.callbackTasks.length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Hẹn gọi lại cần xử lý</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
        </div>

        {/* Card 3: Ca học thử */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => scrollToSection("section-trials")}
          onKeyDown={(e) => e.key === "Enter" && scrollToSection("section-trials")}
          title="Bấm để cuộn xem chi tiết ca học thử hôm nay"
          className="p-4 rounded-2xl bg-card border border-purple-200 dark:border-purple-900/50 shadow-xs flex items-center justify-between gap-2.5 hover:shadow-md hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground">
                {initialTasks.todayTrials.length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Ca học thử / test năng lực</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
        </div>

        {/* Card 4: Học sinh chờ xếp lớp */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push("/sale/admissions/waiting-list")}
          onKeyDown={(e) => e.key === "Enter" && router.push("/sale/admissions/waiting-list")}
          title="Bấm để chuyển sang trang Học sinh chờ xếp lớp"
          className="p-4 rounded-2xl bg-card border border-emerald-200 dark:border-emerald-900/50 shadow-xs flex items-center justify-between gap-2.5 hover:shadow-md hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-foreground">
                {initialTasks.waitingStudentsCount}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Học sinh chờ xếp lớp</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
        </div>
      </div>

      {/* Bố cục lại theo đúng thứ tự ưu tiên xử lý trong ngày (yêu cầu chủ dự
          án 2026-09-17): 1. Khách hàng mới tiếp nhận (cần liên hệ ngay, dễ
          mất Lead nhất nếu chậm trễ) → 2. Lịch gọi lại cho khách hàng → 3.
          Lịch Học Thử & Test Năng Lực. Đổi từ bố cục lưới 2 cột (Hẹn gọi
          lại | Học thử) + khối Lead mới ở dưới cùng, sang xếp dọc tuần tự cả
          3 khối full-width để đúng nghĩa "1, rồi đến, cuối cùng" — không còn
          2 khối ngang hàng nhau. Giữ nguyên 100% chức năng từng khối (modal,
          nút bấm, dữ liệu) — chỉ đổi vị trí/bố cục hiển thị. */}
      <div className="space-y-6">
        {/* KHỐI 1: LEAD MỚI TIẾP NHẬN (CẦN GỌI NGAY TRONG 15 PHÚT) */}
        <div
          id="section-new-leads"
          className={`space-y-3 scroll-mt-24 p-2.5 -m-2.5 rounded-3xl transition-all duration-500 ${
            highlightedSection === "section-new-leads"
              ? "ring-4 ring-blue-400/60 bg-blue-500/5 shadow-lg shadow-blue-500/10"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Khách Hàng Mới Tiếp Nhận — Cần Liên Hệ Ngay ({initialTasks.newLeads.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Lead đăng ký từ Web Form, Chiến dịch quảng cáo hoặc Hotline chưa được tư vấn.
              </p>
            </div>

            <Link href="/sale/admissions?tab=leads&status=new">
              <Button size="sm" variant="ghost" className="text-xs text-primary font-bold gap-1">
                Xem bảng CRM đầy đủ
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {initialTasks.newLeads.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Hiện không có Lead mới nào chưa xử lý. Mọi khách hàng đều đã được tiếp cận!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialTasks.newLeads.slice(0, 6).map((lead) => {
                const phoneDigits = lead.phone.replace(/\D/g, "");
                return (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2 hover:border-primary/40 transition-all cursor-pointer"
                    onClick={() => handleOpenLeadDrawer(lead.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs">{lead.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.course_interest || "Chưa rõ môn"} • {lead.source}
                        </div>
                      </div>
                      <Badge className="bg-blue-500/15 text-blue-600 border-blue-200 text-[11px]">
                        Mới
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-foreground font-semibold">
                      <span>{lead.phone}</span>
                      <span className="text-[11px] text-muted-foreground font-sans">
                        {new Date(lead.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between pt-1 border-t border-border/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs">
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                        >
                          <Phone className="w-3 h-3" /> Gọi
                        </a>
                        <a
                          href={`https://zalo.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <MessageSquare className="w-3 h-3" /> Zalo
                        </a>
                        {/* Liên hệ Facebook — bổ sung 2026-09-17, đồng bộ với
                            leads-tab.tsx/lead-detail-drawer.tsx (tái dùng
                            đúng QuickFacebookLink đã có, không viết lại). */}
                        <QuickFacebookLink
                          lead={lead}
                          onSaved={handleRefresh}
                          className="font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          addClassName="font-bold text-muted-foreground hover:text-indigo-600 hover:underline flex items-center gap-0.5"
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px] px-2 font-semibold"
                        onClick={() => handleOpenLeadDrawer(lead.id)}
                      >
                        Mở CRM
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KHỐI 2: LỊCH HẸN GỌI LẠI (CALLBACKS) */}
        <div
          id="section-callbacks"
          className={`space-y-3 scroll-mt-24 p-2.5 -m-2.5 rounded-3xl transition-all duration-500 ${
            highlightedSection === "section-callbacks"
              ? "ring-4 ring-amber-400/60 bg-amber-500/5 shadow-lg shadow-amber-500/10"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-500" />
              Lịch gọi lại cho khách hàng ({initialTasks.callbackTasks.length})
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Ưu tiên gọi đúng giờ</span>
              <Link
                href="/sale/admissions?tab=leads&status=callback"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-colors"
                title="Xem tất cả Lead có hẹn gọi lại trong CRM"
              >
                Tất cả hẹn CRM
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {initialTasks.callbackTasks.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="font-semibold text-foreground text-sm">Không có cuộc hẹn gọi lại nào tồn đọng!</div>
              <p className="text-sm text-muted-foreground">Bạn đã hoàn thành tốt các lịch hẹn chăm sóc khách hàng.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {initialTasks.callbackTasks.map((task) => {
                const phoneDigits = task.phone.replace(/\D/g, "");
                // CallbackTaskItem không có field facebook_url (chỉ là 1
                // view rút gọn) — tra lại Lead đầy đủ từ allLeads (đã có sẵn
                // trong props, cùng cách handleOpenLeadDrawer() đang dùng)
                // để tái dùng đúng QuickFacebookLink có sẵn, không tự thêm
                // field mới vào CallbackTaskItem.
                const fullLead = allLeads.find((l) => l.id === task.leadId);
                // Thẻ "gọi nhỡ chưa đủ 3 lần" (id dạng auto-missed-<leadId>)
                // được getSaleDailyTasks() tự tính TẠI THỜI ĐIỂM ĐỌC từ
                // missed_calls_count, KHÔNG gắn với dòng lead_interactions
                // thật nào — updated_at chỉ là mốc tham khảo, không phải lịch
                // hẹn cụ thể nên không áp style "trễ hẹn", và KHÔNG được đưa
                // qua CallbackResolutionDialog (completeCallbackTask() sẽ lỗi
                // vì id không phải UUID thật).
                const overdue = !task.isMissedCallReminder && isOverdue(task.callbackAt);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl bg-card border shadow-xs space-y-2.5 transition-all hover:shadow-md ${
                      overdue
                        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20"
                        : task.isMissedCallReminder
                        ? "border-amber-300 dark:border-amber-900/60"
                        : "border-border hover:border-amber-400/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <span>{task.studentName}</span>
                          {task.parentName && (
                            <span className="text-xs text-muted-foreground font-normal">
                              (PH: {task.parentName})
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {task.phone}
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        {task.isMissedCallReminder ? (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-bold flex items-center gap-1 text-amber-600 border-amber-300"
                          >
                            <Phone className="w-3 h-3" />
                            Gọi nhỡ {task.missedCallsCount}/3
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              variant={overdue ? "destructive" : "outline"}
                              className="text-[11px] font-bold flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              {new Date(task.callbackAt).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </Badge>
                            {overdue && (
                              <span className="text-[10px] text-destructive font-semibold mt-0.5">
                                Đã trễ hẹn
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/40 text-xs text-muted-foreground italic line-clamp-2">
                      "{task.lastContent}"
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60 flex-wrap gap-y-2">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                        <a
                          href={`tel:${task.phone}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> Gọi
                        </a>
                        <a
                          href={`https://zalo.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" /> Zalo
                        </a>
                        {fullLead && (
                          <QuickFacebookLink
                            lead={fullLead}
                            onSaved={handleRefresh}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                            addClassName="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-indigo-600 hover:underline"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          onClick={() => handleOpenLeadDrawer(task.leadId)}
                        >
                          Xem chi tiết
                        </Button>
                        {task.isMissedCallReminder ? (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2.5 font-bold bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                              setMissedCallTask(task);
                              setMissedCallOpen(true);
                            }}
                          >
                            Gọi lại ngay
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2.5 font-bold bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                              setSelectedCallback(task);
                              setCallbackOpen(true);
                            }}
                          >
                            Đã gọi lại
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KHỐI 3: CA HỌC THỬ & TEST NĂNG LỰC HÔM NAY */}
        <div
          id="section-trials"
          className={`space-y-3 scroll-mt-24 p-2.5 -m-2.5 rounded-3xl transition-all duration-500 ${
            highlightedSection === "section-trials"
              ? "ring-4 ring-purple-400/60 bg-purple-500/5 shadow-lg shadow-purple-500/10"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-purple-600" />
              Lịch Học Thử &amp; Test Năng Lực ({initialTasks.todayTrials.length})
            </h2>
            <Link
              href="/sale/admissions?tab=trials"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-lg hover:bg-purple-500/20 transition-colors"
              title="Xem tất cả ca học thử trong CRM"
            >
              Tất cả ca CRM
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {initialTasks.todayTrials.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border bg-card flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="font-semibold text-foreground text-sm">Không có ca học thử nào đang chờ!</div>
              <p className="text-sm text-muted-foreground">Hãy vào phễu Tuyển sinh để xếp ca học thử cho các Lead mới.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {initialTasks.todayTrials.map((trial) => (
                <div
                  key={trial.id}
                  className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2.5 hover:border-purple-400/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-foreground text-xs">{trial.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        SĐT: {trial.phone} • {trial.slotSubject}
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[11px] font-bold">
                      {trial.slotDay} ({trial.slotTime})
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>GV: {trial.teacherName || "Chưa xếp"}</span>
                    <span>Phòng: {trial.room || "P.201"}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 font-semibold text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => {
                        setAssessmentTrial({
                          id: trial.id,
                          lead_id: trial.leadId,
                          slot_id: "",
                          status: trial.status,
                          score: trial.score,
                          created_at: "",
                          leadName: trial.studentName,
                          leadPhone: trial.phone,
                          slotName: trial.slotSubject,
                        });
                        setAssessmentOpen(true);
                      }}
                    >
                      <Award className="w-3 h-3 mr-1" />
                      Chấm điểm &amp; Đánh giá
                    </Button>

                    <Button
                      size="sm"
                      className="h-7 text-xs px-2.5 font-bold gap-1 bg-gradient-to-r from-primary to-indigo-600 text-white"
                      onClick={() => handleOpenCheckout(trial.leadId)}
                    >
                      <Sparkles className="w-3 h-3" />
                      Chốt học
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <CallbackResolutionDialog
        task={selectedCallback}
        open={callbackOpen}
        onOpenChange={setCallbackOpen}
        onSuccess={handleRefresh}
      />

      <QuickCallConfirmDialog
        leadId={missedCallTask?.leadId || null}
        leadName={missedCallTask?.studentName}
        missedCallsCount={missedCallTask?.missedCallsCount}
        open={missedCallOpen}
        onOpenChange={(isOpen) => {
          setMissedCallOpen(isOpen);
          if (!isOpen) setMissedCallTask(null);
        }}
        onSuccess={handleRefresh}
      />

      <LeadDetailDrawer
        lead={selectedDrawerLead}
        open={drawerOpen}
        onOpenChange={(isOpen) => {
          setDrawerOpen(isOpen);
          if (!isOpen) setSelectedDrawerLead(null);
        }}
        onSuccess={handleRefresh}
        onStartConversion={(lead) => {
          setDrawerOpen(false);
          setCheckoutLead(lead);
          setCheckoutOpen(true);
        }}
      />

      <TrialAssessmentDialog
        trial={assessmentTrial}
        open={assessmentOpen}
        onOpenChange={(isOpen) => {
          setAssessmentOpen(isOpen);
          if (!isOpen) setAssessmentTrial(null);
        }}
        onSuccess={handleRefresh}
      />

      <ConversionCheckoutModal
        lead={checkoutLead}
        classes={classes}
        bankSettings={bankSettings}
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open) setCheckoutLead(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
