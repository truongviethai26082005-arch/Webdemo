"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, School, AlertCircle, CheckCircle, CheckCircle2, Filter, Users } from "lucide-react";
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
import { useAppData } from "@/lib/context/app-data-context";

export interface OfficialMainClass {
  id: string;
  name: string;
  subject: string;
  schedule: string | any;
  room: string;
  teacherName?: string;
  currentEnrolled?: number;
  maxCapacity?: number;
  currentStudents?: number;
  maxStudents?: number;
  feePerSession?: number;
  enrollment_count?: number;
  max_students?: number;
  fee_per_session?: number;
  teacher?: any;
}

export const DEFAULT_OFFICIAL_CLASSES: OfficialMainClass[] = [
  {
    id: "class-toan-9a1",
    name: "Lớp Toán 9A1 (Chuyên sâu)",
    subject: "Toán 9",
    schedule: "Thứ 4 & Thứ 7 (18:00 - 19:30)",
    room: "P.201",
    teacherName: "Thầy Nguyễn Tiến Dũng",
    currentStudents: 18,
    maxStudents: 25,
    feePerSession: 200000,
  },
  {
    id: "class-toan-9a2",
    name: "Lớp Toán 9A2 (Đại trà)",
    subject: "Toán 9",
    schedule: "Thứ 3 & Thứ 6 (19:30 - 21:00)",
    room: "P.102",
    teacherName: "Cô Trần Thị Mai",
    currentStudents: 25,
    maxStudents: 25, // FULL
    feePerSession: 180000,
  },
  {
    id: "class-toan-7a1",
    name: "Lớp Toán 7A1 (Cơ bản)",
    subject: "Toán 7",
    schedule: "Chủ Nhật (19:30 - 21:00)",
    room: "P.102",
    teacherName: "Cô Trần Thị Mai",
    currentStudents: 14,
    maxStudents: 30,
    feePerSession: 160000,
  },
  {
    id: "class-anh-6e1",
    name: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
    subject: "Tiếng Anh",
    schedule: "Thứ 2 & Thứ 5 (17:30 - 19:00)",
    room: "P.301",
    teacherName: "Cô Emily Nguyễn",
    currentStudents: 15,
    maxStudents: 30,
    feePerSession: 160000,
  },
  {
    id: "class-anh-6e2",
    name: "Lớp Tiếng Anh 6-E2 (Chuyên sâu)",
    subject: "Tiếng Anh",
    schedule: "Thứ 4 & Thứ 7 (09:00 - 10:30)",
    room: "P.302",
    teacherName: "Cô Nguyễn Thu Phương",
    currentStudents: 30,
    maxStudents: 30, // FULL
    feePerSession: 180000,
  },
  {
    id: "class-ly-10l1",
    name: "Lớp Vật Lý 10-L1 (Ôn luyện Cấp 3)",
    subject: "Vật lý",
    schedule: "Thứ 3 & Thứ 6 (18:00 - 19:30)",
    room: "P.202",
    teacherName: "Thầy Lê Văn Hùng",
    currentStudents: 14,
    maxStudents: 20,
    feePerSession: 180000,
  },
  {
    id: "class-van-9v1",
    name: "Lớp Ngữ Văn 9V1 (Luyện thi vào 10)",
    subject: "Ngữ Văn",
    schedule: "Thứ 2 & Thứ 5 (19:30 - 21:00)",
    room: "P.101",
    teacherName: "Cô Phạm Thu Hà",
    currentStudents: 12,
    maxStudents: 25,
    feePerSession: 170000,
  },
];

export function getMatchingOfficialClasses(
  subjectOrClassName: string,
  officialClassesList: any[] = []
): any[] {
  const list = officialClassesList && officialClassesList.length > 0 ? officialClassesList : [];
  if (list.length === 0) return [];
  const text = (subjectOrClassName || "").toLowerCase();

  const matched: any[] = [];
  const others: any[] = [];

  list.forEach((cls) => {
    const clsName = (cls.name || cls.className || "").toLowerCase();
    const clsSub = (cls.subject || "").toLowerCase();

    let isMatch = false;
    if (text.includes("toán 9") && (clsName.includes("toán 9") || clsSub.includes("toán 9"))) isMatch = true;
    else if (text.includes("toán 7") && (clsName.includes("toán 7") || clsSub.includes("toán 7"))) isMatch = true;
    else if (text.includes("toán") && (clsName.includes("toán") || clsSub.includes("toán"))) isMatch = true;
    else if ((text.includes("tiếng anh") || text.includes("anh 6")) && (clsName.includes("anh") || clsSub.includes("anh"))) isMatch = true;
    else if ((text.includes("vật lý") || text.includes("lý 10")) && (clsName.includes("lý") || clsSub.includes("lý"))) isMatch = true;
    else if ((text.includes("ngữ văn") || text.includes("văn")) && (clsName.includes("văn") || clsSub.includes("văn"))) isMatch = true;

    if (isMatch) {
      matched.push(cls);
    } else {
      others.push(cls);
    }
  });

  return [...matched, ...others];
}

export interface SubjectPackageOption {
  sessions: number;
  label: string;
  price: number;
}

export function getSubjectPackageOptions(feePerSession: number = 200000): SubjectPackageOption[] {
  const f = feePerSession > 0 ? feePerSession : 200000;
  return [
    { sessions: 8, price: f * 8, label: `Gói 8 buổi (${formatVND(f * 8)})` },
    { sessions: 12, price: f * 12, label: `Gói 12 buổi (${formatVND(f * 12)} - Mặc định)` },
    { sessions: 24, price: f * 24, label: `Gói 24 buổi (${formatVND(f * 24)})` },
    { sessions: 36, price: f * 36, label: `Gói 36 buổi (${formatVND(f * 36)})` },
  ];
}

interface SubjectState {
  trialClassId: string;
  className: string;
  officialClassId: string;
  officialClassName: string;
  testScore?: number;
  teacherName?: string;
  isSelected: boolean;
  sessions: number;
  feePerSession: number;
}

interface ConversionRowState {
  subjects: SubjectState[];
}

interface ConversionsTabProps {
  conversions: EnrollmentConversion[];
  officialClasses?: any[];
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
  conversions: propConversions,
  officialClasses: propOfficialClasses,
  onOpenConvertDialog,
}: ConversionsTabProps) {
  const { classes: globalClasses, conversions: globalConversions, leads: globalLeads } = useAppData();
  const rawConversions = globalConversions && globalConversions.length > 0 ? globalConversions : (propConversions || []);

  // Hợp nhất danh sách conversions và tất cả các Lead có status === 'ready_to_enroll' hoặc stage === 'conversion'
  const conversions = useMemo(() => {
    const leadsInConversion = (globalLeads || []).filter(
      (l) => l.status === "ready_to_enroll" || (l as any).stage === "conversion"
    );

    const synthesizedFromLeads: EnrollmentConversion[] = leadsInConversion
      .filter((l) => !rawConversions.some((c) => c.leadId === l.id || c.id === l.id))
      .map((l) => {
        const cName = l.targetClassName || "Lớp Toán 9A1 (Chuyên sâu)";
        const cId = l.targetClassId || "class-toan-9a1";
        const fee = cName.includes("Toán") ? 2400000 : cName.includes("Anh") ? 1800000 : 2000000;
        return {
          id: `conv-lead-${l.id}`,
          leadId: l.id,
          studentName: l.studentName,
          parentName: l.parentName || "Phụ huynh",
          parentPhone: l.parentPhone,
          classId: cId,
          className: cName,
          subjects: [
            {
              trialClassId: cId,
              className: cName,
              testScore: l.testScore ?? 8.5,
              tuitionFee: fee,
              isSelected: true,
              sessions: 12,
              packageLabel: "Gói 12 buổi",
            },
          ],
          depositAmount: 500000,
          tuitionPackageSessions: 12,
          tuitionFee: fee,
          isDepositPaid: false,
          isTuitionPaid: false,
          status: "ready_to_enroll" as any,
          createdAt: l.createdAt || new Date().toISOString(),
        };
      });

    return [...synthesizedFromLeads, ...rawConversions];
  }, [globalLeads, rawConversions]);

  const officialClasses = globalClasses && globalClasses.length > 0 ? (globalClasses as unknown as OfficialMainClass[]) : (propOfficialClasses || DEFAULT_OFFICIAL_CLASSES);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "converted" | "pending">("all");
  const [classFilter, setClassFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [rowStates, setRowStates] = useState<Record<string, ConversionRowState>>({});

  const activeOfficialClasses = officialClasses && officialClasses.length > 0 ? officialClasses : DEFAULT_OFFICIAL_CLASSES;

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

    const subjects: SubjectState[] = rawSubjects.map((s) => {
      const matches = getMatchingOfficialClasses(s.className, activeOfficialClasses);
      const defaultMatchedClass = matches.find((m) => {
        const count = m.currentEnrolled ?? m.currentStudents ?? m.enrollment_count ?? 0;
        const max = m.maxCapacity ?? m.maxStudents ?? m.max_students ?? 15;
        return count < max;
      }) || matches[0] || activeOfficialClasses[0];

      return {
        trialClassId: s.trialClassId,
        className: s.className,
        officialClassId: s.officialClassId || defaultMatchedClass?.id || "class-toan-9a1",
        officialClassName: s.officialClassName || defaultMatchedClass?.name || defaultMatchedClass?.className || "Lớp Toán 9A1 (Chuyên sâu)",
        testScore: s.testScore ?? 8.5,
        teacherName: s.teacherName || defaultMatchedClass?.teacherName || "Thầy Nguyễn Tiến Dũng",
        isSelected: s.isSelected !== false,
        sessions: s.sessions || 12,
        feePerSession: s.feePerSession || defaultMatchedClass?.feePerSession || 200000,
      };
    });

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

  function handleOfficialClassChange(convId: string, subjectIndex: number, newClassId: string) {
    setRowStates((prev) => {
      const conv = conversions.find((c) => c.id === convId);
      if (!conv) return prev;
      const currentState = prev[convId] || getRowState(conv);

      const targetClass = activeOfficialClasses.find((cls) => cls.id === newClassId);

      const updatedSubjects = currentState.subjects.map((s, idx) => {
        if (idx === subjectIndex) {
          return {
            ...s,
            officialClassId: newClassId,
            officialClassName: targetClass?.name || targetClass?.className || s.officialClassName,
            teacherName: targetClass?.teacherName || targetClass?.teacher?.full_name || s.teacherName,
            feePerSession: targetClass?.feePerSession || targetClass?.fee_per_session || s.feePerSession,
          };
        }
        return s;
      });

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

      const isConverted = c.status === "converted";
      const isPending =
        c.status !== "converted" ||
        (c as any).status === "ready_to_enroll" ||
        (c as any).status === "pending_deposit" ||
        (c as any).stage === "conversion";

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "converted" && isConverted) ||
        (statusFilter === "pending" && isPending);

      const matchClass =
        classFilter === "all" ||
        c.classId === classFilter ||
        c.className === classFilter ||
        c.subjects?.some((s) => s.officialClassId === classFilter || s.trialClassId === classFilter);

      const matchTime = matchTimeFilter(c, timeFilter);
      return matchSearch && matchStatus && matchClass && matchTime;
    });
  }, [conversions, searchTerm, statusFilter, classFilter, timeFilter]);

  const totalConverted = useMemo(
    () => conversions.filter((c) => c.status === "converted").length,
    [conversions]
  );

  const totalPending = useMemo(
    () => conversions.filter((c) => c.status !== "converted" && c.status !== "cancelled").length,
    [conversions]
  );

  const actualRevenue = useMemo(() => {
    return filteredConversions
      .filter((c) => c.status === "converted")
      .reduce((sum, conv) => {
        const state = getRowState(conv);
        const convTuition = state.subjects.reduce((sSum, s) => {
          if (!s.isSelected) return sSum;
          const options = getSubjectPackageOptions(s.feePerSession);
          const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
          return sSum + pkg.price;
        }, 0);
        return sum + (convTuition || conv.tuitionFee || 0);
      }, 0);
  }, [filteredConversions, rowStates]);

  const pendingRevenue = useMemo(() => {
    return filteredConversions
      .filter((c) => c.status !== "converted")
      .reduce((sum, conv) => {
        const state = getRowState(conv);
        const convTuition = state.subjects.reduce((sSum, s) => {
          if (!s.isSelected) return sSum;
          const options = getSubjectPackageOptions(s.feePerSession);
          const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
          return sSum + pkg.price;
        }, 0);
        return sum + (convTuition || conv.tuitionFee || 0);
      }, 0);
  }, [filteredConversions, rowStates]);

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-slate-200 rounded-xl bg-white shadow-xs p-3.5 flex flex-col justify-between">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Tổng hồ sơ ghi danh
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-900">
              {filteredConversions.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/ {conversions.length} hồ sơ</span>
          </div>
        </div>

        <div className="border border-emerald-200 rounded-xl bg-emerald-50/40 shadow-xs p-3.5 flex flex-col justify-between">
          <span className="font-semibold text-emerald-800 text-xs uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã ghi danh chính thức
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-emerald-700">
              {totalConverted}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">học viên</span>
          </div>
        </div>

        <div className="border border-amber-200 rounded-xl bg-amber-50/40 shadow-xs p-3.5 flex flex-col justify-between">
          <span className="font-semibold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ chốt / Chờ thu phí
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-amber-700">
              {totalPending}
            </span>
            <span className="text-xs text-amber-600 font-semibold">hồ sơ</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl bg-white shadow-xs p-3.5 flex flex-col justify-between">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Doanh thu thực thu
          </span>
          <div className="mt-1">
            <span className="text-2xl font-extrabold text-emerald-600">
              {formatVND(actualRevenue)}
            </span>
            <div className="text-xs text-slate-500 font-medium pt-0.5 flex items-center gap-1">
              <span>Dự kiến thu:</span>
              <strong className="text-slate-700 font-bold">{formatVND(pendingRevenue)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar - BỘ LỌC TRẠNG THÁI, LỚP HỌC & THỜI GIAN */}
      <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả hồ sơ ({conversions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("converted")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "converted"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã ghi danh thành công ({totalConverted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ chốt / Chờ thu phí ({totalPending})
          </button>
        </div>

        {/* Search, Class Filter & Time Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên học sinh, SĐT phụ huynh, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs border-slate-200"
            />
          </div>

          {/* Lọc theo Lớp Học */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 h-8">
            <School className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-[220px]"
            >
              <option value="all">Tất cả lớp học ({activeOfficialClasses.length})</option>
              {activeOfficialClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bộ lọc thời gian doanh thu */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 h-8">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">🌐 Tất cả mốc thời gian</option>
              <option value="this_month">🗓️ Tháng này (09/2026)</option>
              <option value="this_week">📅 Tuần này</option>
              <option value="this_year">📆 Năm nay (2026)</option>
              <option value="future">🔮 Tương lai / Dự kiến thu</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6-Column Conversions Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[130px]">
                Học sinh & SĐT
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[310px]">
                Môn & Lớp học đăng ký chính thức
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[210px]">
                Gói buổi từng môn
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[120px]">
                Tổng học phí
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-600 py-3 min-w-[140px]">
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
                  Không có hồ sơ thu phí nào thuộc mốc thời gian hoặc điều kiện lọc đã chọn.
                </TableCell>
              </TableRow>
            ) : (
              filteredConversions.map((conv) => {
                const state = getRowState(conv);
                const activeCount = state.subjects.filter((s) => s.isSelected).length;

                const rowTotalTuition = state.subjects.reduce((sum, s) => {
                  if (!s.isSelected) return sum;
                  const options = getSubjectPackageOptions(s.feePerSession);
                  const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
                  return sum + pkg.price;
                }, 0);

                const timeInfo = formatRecordDateTime(conv);
                const isConverted = conv.status === "converted";
                const targetClass = activeOfficialClasses.find((c) => c.id === conv.classId || c.name === conv.className);

                return (
                  <TableRow
                    key={conv.id}
                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100"
                  >
                    {/* Col 1: Học sinh & SĐT */}
                    <TableCell className="py-3.5 align-top">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">
                            {conv.studentName}
                          </span>
                          {isConverted ? (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded shrink-0">
                              ✓ Chính thức
                            </span>
                          ) : (conv as any).status === "ready_to_enroll" ? (
                            <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/80 px-1.5 py-0.2 rounded shrink-0 border border-purple-200">
                              ⭐ Chờ ghi danh
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">
                          {conv.parentPhone}
                        </span>
                        {conv.parentName && (
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            PH: {conv.parentName}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Col 2: Môn & Lớp học đăng ký */}
                    <TableCell className="py-3.5 align-top">
                      <div className="flex flex-col gap-2 text-xs">
                        {isConverted ? (
                          <div className="p-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/50 text-xs space-y-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-extrabold text-slate-900">
                                {conv.className}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                ✓ Đã xếp lớp
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                              <span>📍 Phòng: {targetClass?.room || "P.201"}</span>
                              <span>•</span>
                              <span className="text-slate-500">
                                🗓️ {typeof targetClass?.schedule === "string" ? targetClass.schedule : "Thứ 4 & Thứ 7"}
                              </span>
                              {targetClass?.teacherName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-600 font-medium">GV: {targetClass.teacherName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          state.subjects.map((sub, idx) => {
                            const isChecked = sub.isSelected;
                            const matchingClasses = getMatchingOfficialClasses(sub.className, activeOfficialClasses);
                            const currentSelectedClass = matchingClasses.find((c) => c.id === sub.officialClassId) || matchingClasses[0];

                            const count = currentSelectedClass?.currentEnrolled ?? currentSelectedClass?.currentStudents ?? currentSelectedClass?.enrollment_count ?? 0;
                            const max = currentSelectedClass?.maxCapacity ?? currentSelectedClass?.maxStudents ?? currentSelectedClass?.max_students ?? 15;
                            const isSelectedClassFull = count >= max;

                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg border transition-all ${
                                  isChecked
                                    ? "bg-slate-50/90 border-slate-200"
                                    : "bg-slate-50/40 border-slate-100 opacity-60"
                                }`}
                              >
                                {/* Header: Checkbox + Tên môn + Badge Điểm test */}
                                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-900">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleSubject(conv.id, idx)}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <span className={isChecked ? "text-slate-900 font-extrabold" : "text-slate-400 line-through"}>
                                      {sub.className.split("(")[0].trim()}
                                    </span>
                                  </label>

                                  {sub.testScore !== undefined && (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                      ✨ Điểm test: {sub.testScore}/10
                                    </span>
                                  )}
                                </div>

                                {/* Dropdown Select Lớp Học Chính Thức */}
                                {isChecked && (
                                  <div className="space-y-1 pt-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                      Chọn lớp học chính thức:
                                    </label>
                                    <select
                                      value={sub.officialClassId}
                                      onChange={(e) => handleOfficialClassChange(conv.id, idx, e.target.value)}
                                      className="w-full h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                    >
                                      {matchingClasses.map((cls) => {
                                        const cCount = cls.currentEnrolled ?? cls.currentStudents ?? cls.enrollment_count ?? 0;
                                        const cMax = cls.maxCapacity ?? cls.maxStudents ?? cls.max_students ?? 15;
                                        const clsFull = cCount >= cMax;
                                        const sched = cls.schedule || `${cls.dayTime || "Thứ 2 & Thứ 5"}`;
                                        const room = cls.room ? ` • ${cls.room}` : "";

                                        return (
                                          <option
                                            key={cls.id}
                                            value={cls.id}
                                            disabled={clsFull}
                                            className={clsFull ? "text-rose-600 bg-rose-50 font-bold" : ""}
                                          >
                                            {cls.name} - [{sched}{room}] - [{clsFull ? `🔴 ĐÃ ĐỦ CHỖ (${cCount}/${cMax})` : `Còn ${cMax - cCount}/${cMax} chỗ`}]
                                          </option>
                                        );
                                      })}
                                    </select>

                                    {/* Cảnh báo sĩ số lớp chính */}
                                    {isSelectedClassFull && (
                                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 block mt-1">
                                        ⚠️ Lớp học chính thức này đã đủ số lượng ({count}/{max} chỗ)! Vui lòng chọn ca khác.
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </TableCell>

                    {/* Col 3: Gói buổi từng môn */}
                    <TableCell className="py-3.5 align-top">
                      {isConverted ? (
                        <div className="min-h-[56px] flex flex-col justify-center">
                          <span className="text-xs font-bold text-slate-800">
                            Gói {conv.tuitionPackageSessions || 12} buổi
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            ({formatVND(targetClass?.feePerSession || targetClass?.fee_per_session || 180000)} / buổi)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {state.subjects.map((sub, idx) => {
                            const options = getSubjectPackageOptions(sub.feePerSession);
                            const isChecked = sub.isSelected;

                            return (
                              <div key={idx} className="min-h-[72px] flex items-center">
                                <select
                                  value={sub.sessions}
                                  disabled={!isChecked}
                                  onChange={(e) =>
                                    handleSubjectSessionsChange(conv.id, idx, Number(e.target.value))
                                  }
                                  className={`h-8 w-full rounded-md border px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                    isChecked
                                      ? "border-slate-300 bg-white text-slate-900 cursor-pointer"
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
                      )}
                    </TableCell>

                    {/* Col 4: Tổng học phí */}
                    <TableCell className="py-3.5 align-top">
                      <div className="flex flex-col pt-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatVND(isConverted ? (conv.tuitionFee || 2160000) : rowTotalTuition)}
                        </span>
                        <span className={`text-[10.5px] font-bold pt-0.5 ${isConverted ? "text-emerald-600" : "text-slate-500"}`}>
                          {isConverted ? "✓ Đã thu đủ (VietQR)" : activeCount > 0 ? `${activeCount} môn đăng ký` : "Chưa chọn môn"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Col 5: Thời gian */}
                    <TableCell className="py-3.5 align-top">
                      <div className="flex flex-col text-xs pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {isConverted ? "Đã thu:" : timeInfo.label}
                        </span>
                        <span
                          className={`font-mono text-xs font-semibold mt-0.5 ${
                            isConverted
                              ? "text-emerald-700 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {timeInfo.dateFormatted}
                        </span>
                      </div>
                    </TableCell>

                    {/* Col 6: Hành động */}
                    <TableCell className="py-3.5 align-top text-right">
                      <div className="pt-1.5">
                        {isConverted ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã ghi danh
                            </span>
                            {conv.classId && (
                              <Link
                                href={`/admin/classes/${conv.classId}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                title="Xem danh sách học sinh của lớp học này"
                              >
                                <School className="w-3 h-3" /> Xem lớp
                              </Link>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={activeCount === 0}
                            onClick={() => {
                              const activeSubjects = state.subjects
                                .filter((s) => s.isSelected)
                                .map((s) => {
                                  const options = getSubjectPackageOptions(s.feePerSession);
                                  const pkg = options.find((p) => p.sessions === s.sessions) || options[1];
                                  return {
                                    trialClassId: s.trialClassId,
                                    className: s.className,
                                    officialClassId: s.officialClassId,
                                    officialClassName: s.officialClassName,
                                    testScore: s.testScore,
                                    teacherName: s.teacherName,
                                    tuitionFee: pkg.price,
                                    isSelected: true,
                                    sessions: pkg.sessions,
                                    packageLabel: `Gói ${pkg.sessions} buổi`,
                                    feePerSession: s.feePerSession,
                                  };
                                });

                              const updatedConv: EnrollmentConversion = {
                                ...conv,
                                classId: activeSubjects[0]?.officialClassId || conv.classId,
                                className: activeSubjects[0]?.officialClassName || conv.className,
                                subjects: activeSubjects,
                                tuitionFee: rowTotalTuition,
                              };
                              onOpenConvertDialog(updatedConv);
                            }}
                            className="h-8 text-xs px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                            title="Thu phí & Chốt ghi danh vào Lớp chính thức"
                          >
                            Thu phí
                          </Button>
                        )}
                      </div>
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
