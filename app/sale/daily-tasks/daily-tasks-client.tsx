"use client";

import { useState } from "react";
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
  Users,
  CheckCircle2,
  ExternalLink,
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

  // Modals state
  const [selectedCallback, setSelectedCallback] = useState<CallbackTaskItem | null>(null);
  const [callbackOpen, setCallbackOpen] = useState(false);

  const [selectedDrawerLead, setSelectedDrawerLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [assessmentTrial, setAssessmentTrial] = useState<
    (LeadTrial & { leadName?: string; leadPhone?: string; slotName?: string }) | null
  >(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  const [checkoutLead, setCheckoutLead] = useState<Lead | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleRefresh = () => {
    router.refresh();
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* GREETING & SUMMARY BANNER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-indigo-500/10 to-emerald-500/10 border border-primary/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
            <CalendarCheck className="w-3 h-3" /> Lịch làm việc cá nhân hóa
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Xin chào, {saleName}! 👋
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl">
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

      {/* 4 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-card border border-amber-200 dark:border-amber-900/50 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-foreground">
              {initialTasks.callbackTasks.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Hẹn gọi lại cần xử lý</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-purple-200 dark:border-purple-900/50 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-foreground">
              {initialTasks.todayTrials.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Ca học thử / test năng lực</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-blue-200 dark:border-blue-900/50 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-foreground">
              {initialTasks.newLeads.length}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Lead mới tiếp nhận</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-emerald-200 dark:border-emerald-900/50 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-foreground">
              {initialTasks.waitingStudentsCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Học sinh chờ xếp lớp</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KHỐI 1: LỊCH HẸN GỌI LẠI (CALLBACKS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-500" />
              Lịch Hẹn Gọi Lại Cho Phụ Huynh ({initialTasks.callbackTasks.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">Ưu tiên gọi đúng giờ</span>
          </div>

          {initialTasks.callbackTasks.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed text-center text-xs text-muted-foreground bg-card space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <div className="font-semibold text-foreground">Không có cuộc hẹn gọi lại nào tồn đọng!</div>
              <p>Bạn đã hoàn thành tốt các lịch hẹn chăm sóc khách hàng.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {initialTasks.callbackTasks.map((task) => {
                const phoneDigits = task.phone.replace(/\D/g, "");
                const overdue = isOverdue(task.callbackAt);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl bg-card border shadow-xs space-y-2.5 transition-all hover:shadow-md ${
                      overdue
                        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20"
                        : "border-border hover:border-amber-400/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <span>{task.studentName}</span>
                          {task.parentName && (
                            <span className="text-[11px] text-muted-foreground font-normal">
                              (PH: {task.parentName})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {task.phone}
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <Badge
                          variant={overdue ? "destructive" : "outline"}
                          className="text-[10px] font-bold flex items-center gap-1"
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
                          <span className="text-[9px] text-destructive font-semibold mt-0.5">
                            Đã trễ hẹn
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted-foreground italic line-clamp-2">
                      "{task.lastContent}"
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${task.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> Gọi
                        </a>
                        <a
                          href={`https://zalo.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" /> Zalo
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2"
                          onClick={() => handleOpenLeadDrawer(task.leadId)}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-[11px] px-2.5 font-bold bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => {
                            setSelectedCallback(task);
                            setCallbackOpen(true);
                          }}
                        >
                          Đã gọi lại
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KHỐI 2: CA HỌC THỬ & TEST NĂNG LỰC HÔM NAY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-purple-600" />
              Lịch Học Thử &amp; Test Năng Lực ({initialTasks.todayTrials.length})
            </h2>
            <Link
              href="/sale/admissions"
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              Xem tất cả ca
            </Link>
          </div>

          {initialTasks.todayTrials.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed text-center text-xs text-muted-foreground bg-card space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <div className="font-semibold text-foreground">Không có ca học thử nào đang chờ!</div>
              <p>Hãy vào phễu Tuyển sinh để xếp ca học thử cho các Lead mới.</p>
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
                      <div className="text-[11px] text-muted-foreground">
                        SĐT: {trial.phone} • {trial.slotSubject}
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-bold">
                      {trial.slotDay} ({trial.slotTime})
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>GV: {trial.teacherName || "Chưa xếp"}</span>
                    <span>Phòng: {trial.room || "P.201"}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2.5 font-semibold text-purple-600 border-purple-200 hover:bg-purple-50"
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
                      className="h-7 text-[11px] px-2.5 font-bold gap-1 bg-gradient-to-r from-primary to-indigo-600 text-white"
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

      {/* KHỐI 3: LEAD MỚI TIẾP NHẬN (CẦN GỌI NGAY TRONG 15 PHÚT) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Khách Hàng Mới Tiếp Nhận — Cần Liên Hệ Ngay ({initialTasks.newLeads.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Lead đăng ký từ Web Form, Chiến dịch quảng cáo hoặc Hotline chưa được tư vấn.
            </p>
          </div>

          <Link href="/sale/admissions">
            <Button size="sm" variant="ghost" className="text-xs text-primary font-semibold">
              Xem bảng đầy đủ
            </Button>
          </Link>
        </div>

        {initialTasks.newLeads.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed text-center text-xs text-muted-foreground bg-card">
            Hiện không có Lead mới nào chưa xử lý. Mọi khách hàng đều đã được tiếp cận!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      <div className="text-[11px] text-muted-foreground">
                        {lead.course_interest || "Chưa rõ môn"} • {lead.source}
                      </div>
                    </div>
                    <Badge className="bg-blue-500/15 text-blue-600 border-blue-200 text-[10px]">
                      Mới
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-foreground font-semibold">
                    <span>{lead.phone}</span>
                    <span className="text-[10px] text-muted-foreground font-sans">
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
                    <div className="flex items-center gap-2 text-[11px]">
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
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 font-semibold"
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

      {/* MODALS */}
      <CallbackResolutionDialog
        task={selectedCallback}
        open={callbackOpen}
        onOpenChange={setCallbackOpen}
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
