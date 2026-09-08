"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrollmentConversion } from "@/types/admissions";
import { formatVND } from "@/lib/utils/vietqr";

export interface SubjectPackageOption {
  sessions: number;
  label: string;
  price: number;
}

export function getSubjectPackageOptions(className: string): SubjectPackageOption[] {
  const nameLower = className.toLowerCase();
  if (nameLower.includes("toán 9") || nameLower.includes("toán nâng cao")) {
    return [
      { sessions: 8, price: 1600000, label: "Gói 8 buổi (1.600.000 đ)" },
      { sessions: 12, price: 2400000, label: "Gói 12 buổi (2.400.000 đ - Khuyên dùng)" },
      { sessions: 24, price: 4500000, label: "Gói 24 buổi (4.500.000 đ)" },
    ];
  }
  if (nameLower.includes("vật lý") || nameLower.includes("lý 10")) {
    return [
      { sessions: 8, price: 1440000, label: "Gói 8 buổi (1.440.000 đ)" },
      { sessions: 12, price: 2160000, label: "Gói 12 buổi (2.160.000 đ - Khuyên dùng)" },
      { sessions: 24, price: 4000000, label: "Gói 24 buổi (4.000.000 đ)" },
    ];
  }
  if (nameLower.includes("tiếng anh") || nameLower.includes("anh 6")) {
    return [
      { sessions: 8, price: 1280000, label: "Gói 8 buổi (1.280.000 đ)" },
      { sessions: 12, price: 1920000, label: "Gói 12 buổi (1.920.000 đ - Khuyên dùng)" },
      { sessions: 24, price: 3600000, label: "Gói 24 buổi (3.600.000 đ)" },
    ];
  }
  return [
    { sessions: 8, price: 1440000, label: "Gói 8 buổi (1.440.000 đ)" },
    { sessions: 12, price: 2160000, label: "Gói 12 buổi (2.160.000 đ - Khuyên dùng)" },
    { sessions: 24, price: 4000000, label: "Gói 24 buổi (4.000.000 đ)" },
  ];
}

interface SubjectState {
  trialClassId: string;
  className: string;
  testScore?: number;
  isSelected: boolean;
  sessions: number;
}

interface ConversionRowState {
  subjects: SubjectState[];
}

interface ConversionsTabProps {
  conversions: EnrollmentConversion[];
  onOpenConvertDialog: (conversion: EnrollmentConversion) => void;
  onOpenVietQR?: (data: {
    studentName: string;
    className: string;
    amount: number;
    sessionsAdded: number;
    note: string;
  }) => void;
  onToggleDepositPaid?: (conversionId: string) => void;
}

function parseRecordDate(c: EnrollmentConversion): Date {
  const dateStr = c.convertedAt || c.dueDate || c.createdAt || "2026-09-08T14:30:00";
  return new Date(dateStr);
}

function matchTimeFilter(c: EnrollmentConversion, filter: string): boolean {
  if (filter === "all") return true;

  const recDate = parseRecordDate(c);
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();

  if (filter === "future") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return c.status !== "converted" || recDate >= startOfToday;
  }

  if (filter === "this_week") {
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return recDate >= monday && recDate <= sunday;
  }

  if (filter === "this_month") {
    return recDate.getFullYear() === nowYear && recDate.getMonth() === nowMonth;
  }

  if (filter === "this_year") {
    return recDate.getFullYear() === nowYear;
  }

  return true;
}

function formatRecordDateTime(c: EnrollmentConversion): {
  label: string;
  dateFormatted: string;
  isPaid: boolean;
} {
  const dateStr = c.convertedAt || c.dueDate || c.createdAt || "2026-09-08T14:30:00";
  const dateObj = new Date(dateStr);

  if (isNaN(dateObj.getTime())) {
    return {
      label: c.status === "converted" ? "Đã thu:" : "Hạn thu:",
      dateFormatted: "08/09/2026 - 14:30",
      isPaid: c.status === "converted",
    };
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  const dateFormatted = `${day}/${month}/${year} - ${hours}:${minutes}`;

  return {
    label: c.status === "converted" ? "Đã thu:" : "Hạn thu:",
    dateFormatted,
    isPaid: c.status === "converted",
  };
}

export function ConversionsTab({
  conversions,
  onOpenConvertDialog,
}: ConversionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [rowStates, setRowStates] = useState<Record<string, ConversionRowState>>({});

  function getRowState(conv: EnrollmentConversion): ConversionRowState {
    if (rowStates[conv.id]) return rowStates[conv.id];

    const rawSubjects =
      conv.subjects && conv.subjects.length > 0
        ? conv.subjects
        : [
            {
              trialClassId: conv.classId || "class-toan-9",
              className: conv.className,
              testScore: undefined,
              tuitionFee: 2400000,
              isSelected: true,
            },
          ];

    const subjects: SubjectState[] = rawSubjects.map((s) => ({
      trialClassId: s.trialClassId,
      className: s.className,
      testScore: s.testScore,
      isSelected: s.isSelected !== false,
      sessions: s.sessions || 12,
    }));

    return { subjects };
  }

  function handleToggleSubject(convId: string, subjectIndex: number) {
    setRowStates((prev) => {
      const conv = conversions.find((c) => c.id === convId);
      if (!conv) return prev;
      const currentState = prev[convId] || getRowState(conv);
      const updatedSubjects = currentState.subjects.map((s, idx) =>
        idx === subjectIndex ? { ...s, isSelected: !s.isSelected } : s
      );
      return {
        ...prev,
        [convId]: {
          subjects: updatedSubjects,
        },
      };
    });
  }

  function handleSubjectSessionsChange(convId: string, subjectIndex: number, newSessions: number) {
    setRowStates((prev) => {
      const conv = conversions.find((c) => c.id === convId);
      if (!conv) return prev;
      const currentState = prev[convId] || getRowState(conv);
      const updatedSubjects = currentState.subjects.map((s, idx) =>
        idx === subjectIndex ? { ...s, sessions: newSessions } : s
      );
      return {
        ...prev,
        [convId]: {
          subjects: updatedSubjects,
        },
      };
    });
  }

  const filteredConversions = useMemo(() => {
    return conversions.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.parentPhone.includes(searchTerm) ||
        c.className.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTime = matchTimeFilter(c, timeFilter);
      return matchSearch && matchTime;
    });
  }, [conversions, searchTerm, timeFilter]);

  const totalConverted = useMemo(
    () => filteredConversions.filter((c) => c.status === "converted").length,
    [filteredConversions]
  );

  const totalTuitionSum = useMemo(
    () =>
      filteredConversions.reduce((sum, conv) => {
        const state = getRowState(conv);
        const convTuition = state.subjects.reduce((sSum, s) => {
          if (!s.isSelected) return sSum;
          const options = getSubjectPackageOptions(s.className);
          const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
          return sSum + pkg.price;
        }, 0);
        return sum + convTuition;
      }, 0),
    [filteredConversions, rowStates]
  );

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Hồ sơ trong mốc thời gian
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-foreground">
              {filteredConversions.length}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">hồ sơ</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Đã ghi danh chính thức
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {totalConverted}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">học viên</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tổng doanh thu / Dự kiến thu
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900">
              {formatVND(totalTuitionSum)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar - BỘ LỌC THỜI GIAN DOANH THU */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT phụ huynh, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs border-slate-200"
            />
          </div>

          {/* Bộ lọc thời gian doanh thu */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 h-8">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="this_week">📅 Tuần này</option>
              <option value="this_month">🗓️ Tháng này (Mặc định)</option>
              <option value="this_year">📆 Năm nay</option>
              <option value="future">🔮 Tương lai / Dự kiến thu</option>
              <option value="all">🌐 Tất cả mốc thời gian</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6-Column Conversions Table (KÈM CỘT THỜI GIAN) */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[140px]">
                Học sinh & SĐT
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[170px]">
                Môn đăng ký
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[240px]">
                Gói buổi từng môn
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[120px]">
                Tổng học phí
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[150px]">
                Thời gian
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 text-right min-w-[110px]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-slate-500 text-xs"
                >
                  Không có hồ sơ thu phí nào thuộc mốc thời gian đã chọn.
                </TableCell>
              </TableRow>
            ) : (
              filteredConversions.map((conv) => {
                const state = getRowState(conv);
                const rowTotalTuition = state.subjects.reduce((sum, s) => {
                  if (!s.isSelected) return sum;
                  const options = getSubjectPackageOptions(s.className);
                  const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
                  return sum + pkg.price;
                }, 0);

                const timeInfo = formatRecordDateTime(conv);

                return (
                  <TableRow
                    key={conv.id}
                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100"
                  >
                    {/* Col 1: Học sinh & SĐT */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-800">
                          {conv.studentName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">
                          {conv.parentPhone}
                        </span>
                      </div>
                    </TableCell>

                    {/* Col 2: Môn đăng ký */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-2 text-xs">
                        {state.subjects.map((sub, idx) => {
                          const isChecked = sub.isSelected;
                          return (
                            <label
                              key={idx}
                              className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors h-8"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSubject(conv.id, idx)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              />
                              <span
                                className={
                                  isChecked
                                    ? "font-semibold text-slate-800"
                                    : "text-slate-400 line-through font-normal"
                                }
                              >
                                {sub.className.split("(")[0].trim()}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Col 3: Gói buổi từng môn */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-2">
                        {state.subjects.map((sub, idx) => {
                          const options = getSubjectPackageOptions(sub.className);
                          const isChecked = sub.isSelected;

                          return (
                            <div key={idx} className="h-8 flex items-center">
                              <select
                                value={sub.sessions}
                                disabled={!isChecked}
                                onChange={(e) =>
                                  handleSubjectSessionsChange(conv.id, idx, Number(e.target.value))
                                }
                                className={`h-8 rounded-md border px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                  isChecked
                                    ? "border-slate-200 bg-white text-slate-800 cursor-pointer"
                                    : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                                }`}
                              >
                                {options.map((opt) => (
                                  <option key={opt.sessions} value={opt.sessions}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Col 4: Tổng học phí */}
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatVND(rowTotalTuition)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Col 5: Thời gian (Ngày thu / Hạn thu dự kiến) */}
                    <TableCell className="py-3">
                      <div className="flex flex-col text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeInfo.label}
                        </span>
                        <span
                          className={`font-mono text-xs font-semibold mt-0.5 ${
                            timeInfo.isPaid
                              ? "text-emerald-700 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {timeInfo.dateFormatted}
                        </span>
                      </div>
                    </TableCell>

                    {/* Col 6: Hành động */}
                    <TableCell className="py-3 text-right">
                      {conv.status === "converted" ? (
                        <span className="text-xs text-slate-400 italic font-medium">Đã ghi danh</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            const activeSubjects = state.subjects
                              .filter((s) => s.isSelected)
                              .map((s) => {
                                const options = getSubjectPackageOptions(s.className);
                                const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
                                return {
                                  trialClassId: s.trialClassId,
                                  className: s.className,
                                  testScore: s.testScore,
                                  tuitionFee: pkg.price,
                                  isSelected: true,
                                  sessions: pkg.sessions,
                                  packageLabel: `Gói ${pkg.sessions} buổi`,
                                };
                              });

                            const updatedConv: EnrollmentConversion = {
                              ...conv,
                              subjects: activeSubjects,
                              tuitionFee: rowTotalTuition,
                            };
                            onOpenConvertDialog(updatedConv);
                          }}
                          className="h-8 text-xs px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs cursor-pointer transition-all"
                          title="Thu phí & Chốt ghi danh"
                        >
                          Thu phí
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[11px] text-slate-500 px-1">
        Hiển thị <strong>{filteredConversions.length}</strong> / {conversions.length} hồ sơ ghi danh
      </p>
    </div>
  );
}
