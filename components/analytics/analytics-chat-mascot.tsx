"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Printer,
  ChevronDown,
  Loader2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  OperationalSnapshot,
  ChatMessage,
  askAIAnalyticsChatbot,
} from "@/lib/actions/ai-analytics";
import { formatVND } from "@/lib/utils/vietqr";
import { renderFormattedContent } from "@/components/analytics/ai-markdown";

interface AnalyticsChatMascotProps {
  snapshot: OperationalSnapshot | null;
  onOpenPrint?: (latestAiReply?: string) => void;
}

const QUICK_PROMPTS = [
  "Phân tích lớp có nguy cơ lỗ",
  "Danh sách học viên cần nhắc phí",
  "Đề xuất 3 việc tuần tới",
];


export function AnalyticsChatMascot({
  snapshot,
  onOpenPrint,
}: AnalyticsChatMascotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestAiReply, setLatestAiReply] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sinh tin nhắn chào mừng tự động từ số liệu thật của tháng
  const initialWelcomeText = useMemo(() => {
    if (!snapshot) {
      return "Xin chào Admin! Tôi là **Cody - Cố vấn AI Vận hành & Quản trị**. Đang kết nối dữ liệu của tháng...";
    }

    const marginPercent =
      snapshot.paidRevenue > 0
        ? Math.round((snapshot.grossProfit / snapshot.paidRevenue) * 100)
        : 0;

    const debtCount = snapshot.negativeDebtStudents.length;

    return `Xin chào Admin! Tôi là **Cody - Cố vấn AI Vận hành & Quản trị**.

Dữ liệu thống kê thực tế **Tháng ${snapshot.month}/${snapshot.year}** đã sẵn sàng:
- **Doanh thu thực thu**: ${formatVND(snapshot.paidRevenue)}
- **Thù lao giáo viên**: ${formatVND(snapshot.teacherCosts)}
- **Lợi nhuận gộp**: ${formatVND(snapshot.grossProfit)} (Biên: ${marginPercent}%)
- **Học viên âm buổi**: ${
      debtCount > 0
        ? `⚠️ Có **${debtCount}** bạn nợ học phí khẩn cấp`
        : "✅ Không có học viên âm buổi"
    }

Admin muốn tôi phân tích chuyên sâu về vấn đề gì trong tháng này?`;
  }, [snapshot]);

  // Khởi tạo tin nhắn chào mừng khi có snapshot hoặc khi đổi tháng
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: initialWelcomeText,
        },
      ]);
    }
  }, [initialWelcomeText, messages.length]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus ô nhập khi mở khung chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (!snapshot) {
      setErrorMessage("Chưa có dữ liệu thống kê tháng để phân tích.");
      return;
    }

    setErrorMessage(null);
    setInputMessage("");

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const result = await askAIAnalyticsChatbot({
        messages: newMessages,
        snapshot,
      });

      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.reply) {
        setLatestAiReply(result.reply);
        setMessages([
          ...newMessages,
          { role: "assistant", content: result.reply },
        ]);
      }
    } catch (err: any) {
      console.error("Lỗi khi trò chuyện với AI:", err);
      setErrorMessage(err?.message || "Lỗi kết nối đến Trợ lý AI.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handlePrintClick() {
    if (onOpenPrint) {
      onOpenPrint(latestAiReply);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* ─── KHI THU GỌN: NÚT LINH VẬT MASCOT NỔI ─── */}
      {!isOpen && (
        <div className="relative group">
          {/* Tooltip / Mini Speech Bubble */}
          <div
            onClick={() => setIsOpen(true)}
            className="absolute right-0 bottom-full mb-3 cursor-pointer whitespace-nowrap bg-white dark:bg-card text-slate-800 dark:text-slate-100 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 transform transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>
              Hỏi Cody phân tích tháng {snapshot ? `${snapshot.month}/${snapshot.year}` : "này"}?
            </span>
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-white dark:bg-card border-r border-b border-slate-200 dark:border-slate-800 transform rotate-45" />
          </div>

          {/* Nút Mascot chính */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white shadow-xl shadow-primary/30 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-primary/20"
            aria-label="Mở Trợ lý AI Cody"
          >
            <div className="relative">
              <Bot className="w-7 h-7 text-white" />
              {/* Badge online xanh nhấp nháy */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* ─── KHI MỞ: KHUNG CHATBOT TOÀN DIỆN ─── */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-card rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 text-primary-foreground flex items-center justify-center relative">
                <Bot className="w-5 h-5 text-indigo-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Cody AI Advisor
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-1.5 py-0"
                  >
                    GEMINI
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-300">
                  {snapshot ? `Dữ liệu Tháng ${snapshot.month}/${snapshot.year}` : "Đang đồng bộ..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenPrint && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePrintClick}
                  className="h-8 px-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-lg gap-1.5"
                  title="Chuyển sang Chế độ In Báo Cáo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">In Báo Cáo</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                title="Thu nhỏ khung chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Lịch sử tin nhắn (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-muted/10 text-xs">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isAssistant
                        ? "bg-white dark:bg-card border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs"
                        : "bg-primary text-primary-foreground font-medium rounded-br-none shadow-xs"
                    }`}
                  >
                    {isAssistant ? renderFormattedContent(msg.content) : msg.content}
                  </div>
                </div>
              );
            })}

            {/* Trạng thái đang tải */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="rounded-2xl p-3 bg-white dark:bg-card border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-[11px] font-medium">Cody đang phân tích số liệu...</span>
                </div>
              </div>
            )}

            {/* Thông báo lỗi */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Thông báo từ Cody:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt chips */}
          <div className="px-3.5 py-2 bg-white dark:bg-card border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-all text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-card border-t border-slate-200 dark:border-slate-800">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Hỏi Cody về lớp học, doanh thu, công nợ..."
                className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-transparent focus:border-primary focus:bg-white dark:focus:bg-card focus:outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button
                size="sm"
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1.5 h-7 w-7 p-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
