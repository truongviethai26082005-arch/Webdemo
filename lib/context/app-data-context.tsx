"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
  Lead,
  LeadStatus,
  TrialClass,
  EnrollmentConversion,
} from "@/types/admissions";
import {
  INITIAL_LEADS,
  INITIAL_TRIALS,
  INITIAL_CONVERSIONS,
} from "@/lib/data/admissions-seed";
import { AppTeacher, INITIAL_APP_TEACHERS } from "@/lib/constants/teachers";
export { type AppTeacher, INITIAL_APP_TEACHERS };

/* ─── Cấu hình Mock Data chuẩn ban đầu của các lớp học chính thức ─── */
export interface AppClass {
  id: string;
  name: string;
  subject: string;
  room: string;
  schedule: string | Array<{ day: string; start_time: string; end_time: string }>;
  teacher_id?: string;
  teacherName?: string;
  teacher?: {
    id: string;
    full_name: string;
    phone?: string;
  };
  fee_per_session: number;
  feePerSession?: number;
  max_students: number;
  maxStudents?: number;
  maxCapacity?: number;
  enrollment_count: number;
  currentEnrolled?: number;
  currentStudents?: number;
  status?: "active" | "almost_full" | "full" | "completed";

  // Bổ sung quản lý thời hạn khóa học
  durationMonths?: number;
  duration_months?: number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  totalPlannedSessions?: number;
  total_planned_sessions?: number;
  completedSessions?: number;
  completed_sessions?: number;

  enrollments?: Array<{
    id: string;
    student_id: string;
    class_id: string;
    balance_sessions: number;
    joined_at?: string;
    status: string;
    student?: {
      id: string;
      full_name: string;
      parent_name?: string;
      parent_phone?: string;
    };
  }>;
}

import { generateSeedStudents, getEnrollmentsForClass } from "@/lib/data/students-seed";

export interface AppStudent {
  id: string;
  name?: string;
  studentName?: string;
  full_name: string;
  dob?: string;
  birth_date?: string;
  parentName?: string;
  parent_name?: string;
  phone?: string;
  parentPhone?: string;
  parent_phone?: string;
  classId?: string;
  className?: string;
  room?: string;
  schedule?: string;
  totalSessions?: number;
  remainingSessions?: number;
  tuitionStatus?: "paid" | "safe" | "warning" | "danger";
  enrolledAt?: string;
  status: "enrolled" | "active" | "paused" | "dropped";
  created_at?: string;
  enrollments: Array<{
    id: string;
    class_id: string;
    balance_sessions: number;
    joined_at?: string;
    status: string;
    class?: {
      id: string;
      name: string;
      fee_per_session?: number;
    };
  }>;
}

// GHI CHÚ: Các hằng số INITIAL_APP_* bên dưới KHÔNG còn được dùng làm state mặc định hay fallback.
// Toàn bộ store khởi tạo rỗng [] và đồng bộ trực tiếp từ Supabase. Giữ lại để tham khảo cấu trúc kiểu dữ liệu.
export const INITIAL_APP_STUDENTS: AppStudent[] = generateSeedStudents();

export const INITIAL_APP_CLASSES: AppClass[] = [
  {
    id: "class-toan-9a1",
    name: "Lớp Toán 9A1 (Chuyên sâu)",
    subject: "Toán 9",
    room: "P.201",
    schedule: "Thứ 4 & Thứ 7 (18:00 - 19:30)",
    teacher_id: "teacher-01",
    teacherName: "Thầy Nguyễn Tiến Dũng",
    teacher: {
      id: "teacher-01",
      full_name: "Thầy Nguyễn Tiến Dũng",
      phone: "0901234567",
    },
    fee_per_session: 200000,
    feePerSession: 200000,
    max_students: 25,
    maxStudents: 25,
    maxCapacity: 25,
    enrollment_count: 18,
    currentStudents: 18,
    currentEnrolled: 18,
    durationMonths: 5,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    totalPlannedSessions: 40,
    completedSessions: 12,
    status: "active",
    enrollments: getEnrollmentsForClass("class-toan-9a1", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-toan-9a2",
    name: "Lớp Toán 9A2 (Đại trà)",
    subject: "Toán 9",
    room: "P.102",
    schedule: "Thứ 3 & Thứ 6 (19:30 - 21:00)",
    teacher_id: "teacher-02",
    teacherName: "Cô Trần Thị Mai",
    teacher: {
      id: "teacher-02",
      full_name: "Cô Trần Thị Mai",
      phone: "0912345679",
    },
    fee_per_session: 180000,
    feePerSession: 180000,
    max_students: 25,
    maxStudents: 25,
    maxCapacity: 25,
    enrollment_count: 25, // FULL
    currentStudents: 25,
    currentEnrolled: 25,
    durationMonths: 3,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    totalPlannedSessions: 24,
    completedSessions: 8,
    status: "full",
    enrollments: getEnrollmentsForClass("class-toan-9a2", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-toan-7a1",
    name: "Lớp Toán 7A1 (Cơ bản)",
    subject: "Toán 7",
    room: "P.102",
    schedule: "Chủ Nhật (19:30 - 21:00)",
    teacher_id: "teacher-02",
    teacherName: "Cô Trần Thị Mai",
    teacher: {
      id: "teacher-02",
      full_name: "Cô Trần Thị Mai",
      phone: "0912345679",
    },
    fee_per_session: 160000,
    feePerSession: 160000,
    max_students: 30,
    maxStudents: 30,
    maxCapacity: 30,
    enrollment_count: 14,
    currentStudents: 14,
    currentEnrolled: 14,
    durationMonths: 3,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    totalPlannedSessions: 12,
    completedSessions: 3,
    status: "active",
    enrollments: getEnrollmentsForClass("class-toan-7a1", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-anh-6e1",
    name: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
    subject: "Tiếng Anh",
    room: "P.301",
    schedule: "Thứ 2 & Thứ 5 (17:30 - 19:00)",
    teacher_id: "teacher-03",
    teacherName: "Cô Emily Nguyễn",
    teacher: {
      id: "teacher-03",
      full_name: "Cô Emily Nguyễn",
      phone: "0987654321",
    },
    fee_per_session: 160000,
    feePerSession: 160000,
    max_students: 30,
    maxStudents: 30,
    maxCapacity: 30,
    enrollment_count: 15,
    currentStudents: 15,
    currentEnrolled: 15,
    durationMonths: 3,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    totalPlannedSessions: 24,
    completedSessions: 6,
    status: "active",
    enrollments: getEnrollmentsForClass("class-anh-6e1", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-anh-6e2",
    name: "Lớp Tiếng Anh 6-E2 (Chuyên sâu)",
    subject: "Tiếng Anh",
    room: "P.302",
    schedule: "Thứ 4 & Thứ 7 (09:00 - 10:30)",
    teacher_id: "teacher-04",
    teacherName: "Cô Nguyễn Thu Phương",
    teacher: {
      id: "teacher-04",
      full_name: "Cô Nguyễn Thu Phương",
      phone: "0934567890",
    },
    fee_per_session: 180000,
    feePerSession: 180000,
    max_students: 30,
    maxStudents: 30,
    maxCapacity: 30,
    enrollment_count: 30, // FULL
    currentStudents: 30,
    currentEnrolled: 30,
    durationMonths: 5,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    totalPlannedSessions: 40,
    completedSessions: 14,
    status: "full",
    enrollments: getEnrollmentsForClass("class-anh-6e2", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-ly-10l1",
    name: "Lớp Vật Lý 10-L1 (Ôn luyện Cấp 3)",
    subject: "Vật lý",
    room: "P.202",
    schedule: "Thứ 3 & Thứ 6 (18:00 - 19:30)",
    teacher_id: "teacher-05",
    teacherName: "Thầy Lê Văn Hùng",
    teacher: {
      id: "teacher-05",
      full_name: "Thầy Lê Văn Hùng",
      phone: "0978901234",
    },
    fee_per_session: 180000,
    feePerSession: 180000,
    max_students: 20,
    maxStudents: 20,
    maxCapacity: 20,
    enrollment_count: 14,
    currentStudents: 14,
    currentEnrolled: 14,
    durationMonths: 5,
    startDate: "2026-08-15",
    endDate: "2027-01-15",
    totalPlannedSessions: 40,
    completedSessions: 10,
    status: "active",
    enrollments: getEnrollmentsForClass("class-ly-10l1", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-van-9v1",
    name: "Lớp Ngữ Văn 9V1 (Luyện thi vào 10)",
    subject: "Ngữ Văn",
    room: "P.101",
    schedule: "Thứ 2 & Thứ 5 (19:30 - 21:00)",
    teacher_id: "teacher-02",
    teacherName: "Cô Trần Thị Mai",
    teacher: {
      id: "teacher-02",
      full_name: "Cô Trần Thị Mai",
      phone: "0912345679",
    },
    fee_per_session: 170000,
    feePerSession: 170000,
    max_students: 25,
    maxStudents: 25,
    maxCapacity: 25,
    enrollment_count: 12,
    currentStudents: 12,
    currentEnrolled: 12,
    durationMonths: 3,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    totalPlannedSessions: 24,
    completedSessions: 5,
    status: "active",
    enrollments: getEnrollmentsForClass("class-van-9v1", INITIAL_APP_STUDENTS),
  },
  {
    id: "class-on-he-toan-8",
    name: "Lớp Ôn Hè Toán 8 (Cấp tốc)",
    subject: "Toán 8",
    room: "P.101",
    schedule: "Thứ 2 & Thứ 5 (14:00 - 15:30)",
    teacher_id: "teacher-01",
    teacherName: "Thầy Nguyễn Tiến Dũng",
    teacher: {
      id: "teacher-01",
      full_name: "Thầy Nguyễn Tiến Dũng",
      phone: "0901234567",
    },
    fee_per_session: 180000,
    feePerSession: 180000,
    max_students: 20,
    maxStudents: 20,
    maxCapacity: 20,
    enrollment_count: 15,
    currentStudents: 15,
    currentEnrolled: 15,
    durationMonths: 1,
    startDate: "2026-07-01",
    endDate: "2026-08-01",
    totalPlannedSessions: 10,
    completedSessions: 10,
    status: "completed",
    enrollments: [],
  },
];

export interface AppInvoice {
  id: string;
  invoice_code: string;
  student_name: string;
  parent_phone?: string;
  amount: number;
  status: "paid" | "pending" | "cancelled";
  payment_method: string;
  created_at: string;
  paid_at?: string;
  class_name?: string;
  class_id?: string;
  sessions_added?: number;
  note?: string;
}

export const INITIAL_APP_INVOICES: AppInvoice[] = [
  {
    id: "inv-01",
    invoice_code: "HD-912001",
    student_name: "Trần Đức Anh",
    parent_phone: "0912111222",
    amount: 3600000,
    status: "paid",
    payment_method: "VietQR Napas 24/7",
    created_at: "2026-09-05T11:00:00",
    class_id: "class-anh-6e1",
    class_name: "Lớp Tiếng Anh 6-E1 (Giao tiếp & Luyện thi)",
    sessions_added: 24,
    note: "Đã thanh toán (VietQR) - Tiếng Anh Lớp 6 (Gói 24 buổi)",
  },
  {
    id: "inv-02",
    invoice_code: "HD-912002",
    student_name: "Nguyễn Minh Khang",
    parent_phone: "0912345678",
    amount: 2400000,
    status: "paid",
    payment_method: "VietQR Napas 24/7",
    created_at: "2026-09-06T14:30:00",
    class_id: "class-toan-9a1",
    class_name: "Lớp Toán 9A1 (Chuyên sâu)",
    sessions_added: 12,
    note: "Đã thanh toán (VietQR) - Toán 9 Nâng Cao (Gói 12 buổi)",
  },
  {
    id: "inv-03",
    invoice_code: "HD-912003",
    student_name: "Hoàng Gia Huy",
    parent_phone: "0905123987",
    amount: 4800000,
    status: "paid",
    payment_method: "VietQR Napas 24/7",
    created_at: "2026-09-07T10:15:00",
    class_id: "class-toan-9a1",
    class_name: "Lớp Toán 9A1 (Chuyên sâu)",
    sessions_added: 24,
    note: "Đã thanh toán (VietQR) - Toán 9A1 (Gói 24 buổi)",
  },
];

export interface CompleteEnrollmentParams {
  conversionId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  subjects: Array<{
    trialClassId?: string;
    className?: string;
    officialClassId: string;
    officialClassName: string;
    sessions: number;
    tuitionFee: number;
    teacherName?: string;
    feePerSession?: number;
  }>;
  totalAmount: number;
  note?: string;
}

export interface TopUpParams {
  studentId: string;
  studentName?: string;
  classId?: string;
  className?: string;
  sessionsAdded: number;
  amount: number;
  paymentMethod?: string;
  isPaid?: boolean;
  note?: string;
}

interface AppDataContextValue {
  // Classes
  classes: AppClass[];
  setClasses: React.Dispatch<React.SetStateAction<AppClass[]>>;
  
  // Students
  students: AppStudent[];
  setStudents: React.Dispatch<React.SetStateAction<AppStudent[]>>;

  // Invoices & Finance
  invoices: AppInvoice[];
  totalRevenue: number;

  // Admissions
  conversions: EnrollmentConversion[];
  setConversions: React.Dispatch<React.SetStateAction<EnrollmentConversion[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  trials: TrialClass[];
  setTrials: React.Dispatch<React.SetStateAction<TrialClass[]>>;
  teachers: AppTeacher[];
  setTeachers: React.Dispatch<React.SetStateAction<AppTeacher[]>>;

  // KPI Calculations
  totalActiveStudents: number;
  nearCapacityCount: number;

  // Core Global Actions
  addClass: (newClass: Partial<AppClass>) => AppClass;
  enrollStudentToClass: (classId: string, studentInfo?: any) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;
  addOrUpdateStudent: (payload: any) => void;
  addOrUpdateTeacher: (teacherPayload: Partial<AppTeacher>) => AppTeacher;
  completeEnrollment: (params: CompleteEnrollmentParams) => {
    studentId: string;
    invoiceId: string;
  };
  topUpStudentTuition: (params: TopUpParams) => {
    invoice: AppInvoice;
    student?: AppStudent;
  };
  markInvoicePaid: (invoiceId: string) => void;
  addInvoice: (newInvoice: AppInvoice) => void;
  moveToConversion: (leadId: string, payload?: Partial<Lead>) => void;
}

// Helper kiểm tra và loại bỏ các ID giả / mock (class-toan-, std-, teacher-0, non-UUID...)
function isMockOrInvalidId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return true;
  const lower = id.toLowerCase();
  if (
    lower.startsWith("class-toan-") ||
    lower.startsWith("class-anh-") ||
    lower.startsWith("class-ly-") ||
    lower.startsWith("class-van-") ||
    lower.startsWith("class-") ||
    lower.startsWith("cls-") ||
    lower.startsWith("std-") ||
    lower.startsWith("hoc-sinh-") ||
    lower.startsWith("teacher-") ||
    lower.startsWith("teacher_") ||
    lower.startsWith("inv-") ||
    lower.startsWith("demo-") ||
    lower.startsWith("mock-")
  ) {
    return true;
  }
  // Kiểm tra UUID chuẩn: 8-4-4-4-12 hex characters
  return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const STORAGE_KEY = "educenter_global_store_v4";

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Khởi tạo mặc định là mảng rỗng [], KHÔNG dùng mock seed làm state mặc định
  const [classes, setClasses] = useState<AppClass[]>([]);
  const [students, setStudents] = useState<AppStudent[]>([]);
  const [invoices, setInvoices] = useState<AppInvoice[]>([]);
  const [conversions, setConversions] = useState<EnrollmentConversion[]>(INITIAL_CONVERSIONS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [trials, setTrials] = useState<TrialClass[]>(INITIAL_TRIALS);
  const [teachers, setTeachers] = useState<AppTeacher[]>([]);

  // Khôi phục state từ localStorage khi mount và dọn sạch dữ liệu giả nếu có
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        // 1. Học sinh: Lọc bỏ hoàn toàn các ID mock/giả, KHÔNG bù thêm seed data
        const cleanStudents = (parsed.students && Array.isArray(parsed.students))
          ? parsed.students.filter((s: any) => !isMockOrInvalidId(s?.id))
          : [];

        const normalizedStudents = cleanStudents.map((st: any) => {
          const firstEnr = st.enrollments?.[0];
          const clsName = st.className || firstEnr?.class?.name || firstEnr?.className || "";
          const clsId = st.classId || firstEnr?.class_id || firstEnr?.class?.id || "";
          const rem = st.remainingSessions ?? firstEnr?.balance_sessions ?? 12;
          const sName = st.studentName || st.name || st.full_name;
          const sParent = st.parentName || st.parent_name;
          const sPhone = st.phone || st.parentPhone || st.parent_phone;
          return {
            ...st,
            id: st.id,
            name: sName,
            studentName: sName,
            full_name: sName,
            parentName: sParent,
            parent_name: sParent,
            phone: sPhone,
            parentPhone: sPhone,
            parent_phone: sPhone,
            classId: clsId,
            className: clsName,
            totalSessions: st.totalSessions ?? rem,
            remainingSessions: rem,
            status: st.status || "enrolled",
            tuitionStatus: st.tuitionStatus || "paid",
          };
        });
        setStudents(normalizedStudents);

        // 2. Lớp học: Lọc bỏ hoàn toàn các ID mock/giả, KHÔNG bù thêm seed data
        const cleanClasses = (parsed.classes && Array.isArray(parsed.classes))
          ? parsed.classes.filter((c: any) => !isMockOrInvalidId(c?.id))
          : [];

        const normalizedClasses = cleanClasses.map((c: any) => {
          const classStudents = normalizedStudents.filter(
            (s: any) => s.classId === c.id || s.className === c.name
          );
          const enrollments =
            c.enrollments && c.enrollments.length > 0
              ? c.enrollments.filter((e: any) => !isMockOrInvalidId(e?.student_id || e?.student?.id))
              : getEnrollmentsForClass(c.id, normalizedStudents);

          const count = classStudents.length > 0 ? classStudents.length : enrollments.length;
          const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 20;
          const ratio = count / max;

          const durationMonths = c.durationMonths ?? c.duration_months ?? 3;
          const startDate = c.startDate ?? c.start_date ?? "2026-09-01";
          const endDate = c.endDate ?? c.end_date ?? "2026-12-01";
          const totalPlannedSessions = c.totalPlannedSessions ?? c.total_planned_sessions ?? 24;
          const completedSessions = c.completedSessions ?? c.completed_sessions ?? 0;

          const todayStr = new Date().toISOString().split("T")[0];
          const isCompleted =
            c.status === "completed" ||
            (endDate && endDate < todayStr) ||
            (totalPlannedSessions > 0 && completedSessions >= totalPlannedSessions);

          const calculatedStatus = isCompleted
            ? "completed"
            : ratio >= 1
            ? "full"
            : ratio >= 0.8
            ? "almost_full"
            : "active";

          const fee = c.feePerSession ?? c.fee_per_session ?? 200000;
          let sched = c.schedule || "Thứ 2 & Thứ 4 (18:00 - 19:30)";
          if (Array.isArray(sched)) {
            const days = sched.map((s: any) => s.day).join(", ");
            const time = sched[0] ? ` (${sched[0].start_time} - ${sched[0].end_time})` : "";
            sched = `${days}${time}`;
          }
          return {
            ...c,
            max_students: max,
            maxStudents: max,
            maxCapacity: max,
            enrollment_count: count,
            currentStudents: count,
            currentEnrolled: count,
            fee_per_session: fee,
            feePerSession: fee,
            status: calculatedStatus,
            schedule: sched,
            durationMonths,
            duration_months: durationMonths,
            startDate,
            start_date: startDate,
            endDate,
            end_date: endDate,
            totalPlannedSessions,
            total_planned_sessions: totalPlannedSessions,
            completedSessions,
            completed_sessions: completedSessions,
            enrollments,
          };
        });
        setClasses(normalizedClasses);

        // 3. Hóa đơn: Lọc bỏ hoàn toàn các ID mock/giả, KHÔNG bù thêm seed data
        const cleanInvoices = (parsed.invoices && Array.isArray(parsed.invoices))
          ? parsed.invoices.filter((inv: any) => !isMockOrInvalidId(inv?.id))
          : [];
        setInvoices(cleanInvoices);

        // 4. Tuyển sinh (Conversions, Leads, Trials)
        let combinedConversions = INITIAL_CONVERSIONS;
        if (parsed.conversions && Array.isArray(parsed.conversions)) {
          combinedConversions = parsed.conversions;
        }
        setConversions(combinedConversions);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.trials) setTrials(parsed.trials);

        // 5. Giáo viên: Lọc bỏ hoàn toàn các ID mock/giả, KHÔNG bù thêm seed data
        const cleanTeachers = (parsed.teachers && Array.isArray(parsed.teachers))
          ? parsed.teachers.filter((t: any) => !isMockOrInvalidId(t?.id))
          : [];
        setTeachers(cleanTeachers);

        // 6. Dọn sạch 1 lần: lưu ngay state đã lọc sạch vào localStorage để thanh lọc trình duyệt
        try {
          const cleanedState = {
            classes: normalizedClasses,
            students: normalizedStudents,
            invoices: cleanInvoices,
            conversions: combinedConversions,
            leads: parsed.leads || INITIAL_LEADS,
            trials: parsed.trials || INITIAL_TRIALS,
            teachers: cleanTeachers,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedState));
        } catch (storageErr) {
          console.warn("Failed to sanitize localStorage:", storageErr);
        }
      }
    } catch (e) {
      console.warn("Failed to read from localStorage:", e);
    }
  }, []);

  // Tự động lưu persist vào localStorage khi state thay đổi
  useEffect(() => {
    try {
      const stateToSave = {
        classes,
        students,
        invoices,
        conversions,
        leads,
        trials,
        teachers,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to write to localStorage:", e);
    }
  }, [classes, students, invoices, conversions, leads, trials, teachers]);

  // KPI: Tổng học sinh đang học (tính theo số enrollment thực tế trong các lớp)
  const totalActiveStudents = useMemo(() => {
    return classes.reduce((acc, c) => acc + (c.enrollment_count || 0), 0);
  }, [classes]);

  // KPI: Số lớp gần đầy sĩ số (>= 80%)
  const nearCapacityCount = useMemo(() => {
    return classes.filter((c) => {
      const max = c.max_students || c.maxStudents || 15;
      const count = c.enrollment_count || c.currentStudents || 0;
      return count / max >= 0.8 && count / max < 1;
    }).length;
  }, [classes]);

  // Tổng doanh thu thực thu từ các hóa đơn đã thanh toán
  const totalRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [invoices]);

  // ─── ACTION: THÊM LỚP HỌC MỚI VÀO STORE DÙNG CHUNG ───
  function addClass(newClass: Partial<AppClass>): AppClass {
    const classId = newClass.id || `cls-${Date.now()}`;
    const max = newClass.maxCapacity || newClass.max_students || newClass.maxStudents || 20;
    const enrolled = newClass.currentEnrolled ?? newClass.enrollment_count ?? newClass.currentStudents ?? 0;
    const ratio = enrolled / max;
    const status: "active" | "almost_full" | "full" = ratio >= 1 ? "full" : ratio >= 0.8 ? "almost_full" : "active";

    let schedStr = "";
    if (typeof newClass.schedule === "string") {
      schedStr = newClass.schedule;
    } else if (Array.isArray(newClass.schedule)) {
      const days = newClass.schedule.map((s: any) => s.day).join(", ");
      const time = newClass.schedule[0] ? ` (${newClass.schedule[0].start_time} - ${newClass.schedule[0].end_time})` : "";
      schedStr = `${days}${time}`;
    }

    const fee = newClass.feePerSession ?? newClass.fee_per_session ?? 0;

    const classObj: AppClass = {
      id: classId,
      name: newClass.name || "Lớp học mới",
      subject: newClass.subject || (newClass.name?.includes("Toán") ? "Toán" : newClass.name?.includes("Anh") ? "Tiếng Anh" : newClass.name?.includes("Lý") ? "Vật lý" : newClass.name?.includes("Văn") ? "Ngữ Văn" : "Toán 9"),
      room: newClass.room || "Chưa xếp phòng",
      teacher_id: newClass.teacher_id,
      teacherName: newClass.teacherName || newClass.teacher?.full_name || "Chưa phân công",
      teacher: newClass.teacher || {
        id: newClass.teacher_id || "teacher-01",
        full_name: newClass.teacherName || "Giáo viên",
      },
      schedule: schedStr || "Thứ 2 & Thứ 4 (18:00 - 19:30)",
      fee_per_session: fee,
      feePerSession: fee,
      max_students: max,
      maxStudents: max,
      maxCapacity: max,
      enrollment_count: enrolled,
      currentStudents: enrolled,
      currentEnrolled: enrolled,
      status: newClass.status || status,
      enrollments: newClass.enrollments || [],
    };

    setClasses((prev) => {
      const exists = prev.some((c) => c.id === classId);
      if (exists) {
        return prev.map((c) => (c.id === classId ? { ...c, ...classObj } : c));
      }
      return [classObj, ...prev];
    });
    return classObj;
  }

  // ─── ACTION: GHI DANH HỌC SINH VÀO LỚP & TỰ ĐỘNG TÍNH LẠI SĨ SỐ ───
  function enrollStudentToClass(classId: string, studentInfo?: any) {
    const timestamp = new Date().toISOString().split("T")[0];
    const studentId = studentInfo?.id || `STU-${Date.now()}`;
    const studentName = studentInfo?.name || studentInfo?.full_name || "Học sinh";
    const parentName = studentInfo?.parentName || studentInfo?.parent_name || "Phụ huynh";
    const parentPhone = studentInfo?.phone || studentInfo?.parentPhone || studentInfo?.parent_phone || "";
    const remainingSessions = studentInfo?.remainingSessions ?? studentInfo?.totalSessions ?? studentInfo?.initialSessions ?? 0;

    setClasses((prevClasses) =>
      prevClasses.map((cls) => {
        if (
          cls.id === classId ||
          cls.name === classId ||
          (studentInfo?.classId && cls.id === studentInfo.classId) ||
          (studentInfo?.className && cls.name === studentInfo.className)
        ) {
          const newEnrollmentItem = {
            id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            student_id: studentId,
            class_id: cls.id,
            balance_sessions: remainingSessions,
            joined_at: timestamp,
            status: "active",
            student: {
              id: studentId,
              full_name: studentName,
              parent_name: parentName,
              parent_phone: parentPhone,
            },
          };

          const existingEnrollments = (cls.enrollments || []).filter(
            (e: any) => e.student_id !== studentId && e.student?.id !== studentId
          );
          const updatedEnrollments = [newEnrollmentItem, ...existingEnrollments];
          const newCount = updatedEnrollments.length;
          const max = cls.maxCapacity ?? cls.max_students ?? cls.maxStudents ?? 15;
          const ratio = newCount / max;
          const newStatus: "active" | "almost_full" | "full" =
            ratio >= 1 ? "full" : ratio >= 0.8 ? "almost_full" : "active";

          return {
            ...cls,
            currentEnrolled: newCount,
            enrollment_count: newCount,
            currentStudents: newCount,
            status: newStatus,
            enrollments: updatedEnrollments,
          };
        }
        return cls;
      })
    );

    // Đồng bộ tức thì sang state students
    setStudents((prev) => {
      const targetClass = classes.find((c) => c.id === classId || c.name === classId);
      const targetClassName = targetClass?.name || studentInfo?.className || "Lớp học";

      const updatedStudentItem: AppStudent = {
        id: studentId,
        name: studentName,
        studentName,
        full_name: studentName,
        parentName,
        parent_name: parentName,
        phone: parentPhone,
        parentPhone,
        parent_phone: parentPhone,
        classId: targetClass?.id || classId,
        className: targetClassName,
        room: targetClass?.room || "Chưa xếp phòng",
        schedule: typeof targetClass?.schedule === "string" ? targetClass.schedule : "Chưa có lịch học",
        totalSessions: remainingSessions,
        remainingSessions,
        tuitionStatus: "paid",
        status: "enrolled",
        created_at: timestamp,
        enrolledAt: timestamp,
        enrollments: [
          {
            id: `enr-${studentId}`,
            class_id: targetClass?.id || classId,
            balance_sessions: remainingSessions,
            joined_at: timestamp,
            status: "enrolled",
            class: {
              id: targetClass?.id || classId,
              name: targetClassName,
              fee_per_session: targetClass?.fee_per_session ?? 0,
            },
          },
        ],
      };

      const existingIdx = prev.findIndex((s) => s.id === studentId);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          ...updatedStudentItem,
          classId: targetClass?.id || classId,
          className: targetClassName,
        };
        return next;
      }
      return [updatedStudentItem, ...prev];
    });

    // Đồng bộ tức thì sang Conversions Tab (Completed Enrollments)
    setConversions((prev) => {
      const targetClass = classes.find((c) => c.id === classId || c.name === classId);
      const targetClassName = targetClass?.name || studentInfo?.className || "Lớp học";
      const fee = targetClass?.fee_per_session || targetClass?.feePerSession || 180000;
      const convId = `conv-${studentId}`;

      const newConv: EnrollmentConversion = {
        id: convId,
        leadId: `lead-${studentId}`,
        studentName,
        parentName,
        parentPhone,
        classId: targetClass?.id || classId,
        className: targetClassName,
        depositAmount: 0,
        tuitionPackageSessions: remainingSessions,
        tuitionFee: remainingSessions * fee,
        isDepositPaid: true,
        isTuitionPaid: true,
        status: "converted",
        convertedAt: `${timestamp}T10:00:00`,
        createdAt: `${timestamp}T08:00:00`,
        dueDate: `${timestamp}T10:00:00`,
        convertedToStudentId: studentId,
        subjects: [
          {
            trialClassId: targetClass?.id || classId,
            className: targetClassName,
            officialClassId: targetClass?.id || classId,
            officialClassName: targetClassName,
            testScore: 8.5,
            tuitionFee: remainingSessions * fee,
            isSelected: true,
            sessions: remainingSessions,
            packageLabel: `Gói ${remainingSessions} buổi`,
            feePerSession: fee,
          },
        ],
      };

      const existingIdx = prev.findIndex((c) => c.convertedToStudentId === studentId || c.id === convId);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], ...newConv };
        return next;
      }
      return [newConv, ...prev];
    });
  }

  // ─── ACTION: XÓA HỌC SINH KHỎI LỚP & ĐỒNG BỘ HAI CHIỀU ───
  function removeStudentFromClass(classId: string, studentId: string) {
    setClasses((prevClasses) =>
      prevClasses.map((cls) => {
        if (cls.id === classId || cls.name === classId) {
          const nextEnrollments = (cls.enrollments || []).filter(
            (e: any) => e.student_id !== studentId && e.student?.id !== studentId && e.id !== studentId
          );
          const newCount = nextEnrollments.length;
          const max = cls.maxCapacity ?? cls.max_students ?? cls.maxStudents ?? 15;
          const ratio = newCount / max;
          const newStatus: "active" | "almost_full" | "full" =
            ratio >= 1 ? "full" : ratio >= 0.8 ? "almost_full" : "active";

          return {
            ...cls,
            enrollments: nextEnrollments,
            currentEnrolled: newCount,
            enrollment_count: newCount,
            currentStudents: newCount,
            status: newStatus,
          };
        }
        return cls;
      })
    );

    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === studentId || st.full_name === studentId) {
          const nextEnrollments = (st.enrollments || []).filter(
            (e) => e.class_id !== classId && e.class?.id !== classId && e.class?.name !== classId
          );
          return {
            ...st,
            classId: undefined,
            className: "Chưa xếp lớp",
            enrollments: nextEnrollments,
          };
        }
        return st;
      })
    );
  }

  // ─── ACTION: THÊM HOẶC CẬP NHẬT HỌC SINH & ĐỒNG BỘ LỚP HỌC ───
  function addOrUpdateStudent(payload: any) {
    const timestamp = payload.enrolledAt || new Date().toISOString();
    const studentId = payload.id || `STU-${Date.now()}`;
    const name = payload.name || payload.full_name;
    const parentName = payload.parentName || payload.parent_name || "Phụ huynh";
    const phone = payload.phone || payload.parentPhone || payload.parent_phone || "";
    const classId = payload.classId;
    const className = payload.className;
    const totalSessions = payload.totalSessions ?? payload.remainingSessions ?? 0;
    const remainingSessions = payload.remainingSessions ?? payload.totalSessions ?? 0;
    const tuitionStatus =
      payload.tuitionStatus || (remainingSessions >= 3 ? "safe" : remainingSessions > 0 ? "warning" : "danger");

    const newStudentEnrollments = payload.enrollments || (classId ? [
      {
        id: `enr-${Date.now()}`,
        class_id: classId,
        balance_sessions: remainingSessions,
        joined_at: timestamp.split("T")[0],
        status: "active",
        class: {
          id: classId,
          name: className || "Lớp học chính thức",
        },
      }
    ] : []);

    const updatedStudent: AppStudent = {
      id: studentId,
      name,
      full_name: name,
      parentName,
      parent_name: parentName,
      phone,
      parentPhone: phone,
      parent_phone: phone,
      classId,
      className,
      room: payload.room || "Chưa xếp phòng",
      schedule: payload.schedule || "Chưa có lịch học",
      totalSessions,
      remainingSessions,
      tuitionStatus,
      status: payload.status || "active",
      enrolledAt: timestamp,
      created_at: timestamp.split("T")[0],
      enrollments: newStudentEnrollments,
    };

    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === studentId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updatedStudent };
        return next;
      }
      return [updatedStudent, ...prev];
    });

    // Đồng bộ ngược sang Quản lý lớp học: tìm lớp có classId === selectedClass.id
    if (classId) {
      setClasses((prevClasses) =>
        prevClasses.map((cls) => {
          if (cls.id === classId || cls.name === className) {
            const current = cls.currentEnrolled ?? cls.enrollment_count ?? cls.currentStudents ?? 0;
            const newCount = current + 1;
            const max = cls.maxCapacity ?? cls.max_students ?? cls.maxStudents ?? 15;
            const ratio = newCount / max;
            const newStatus: "active" | "almost_full" | "full" =
              ratio >= 1 ? "full" : ratio >= 0.8 ? "almost_full" : "active";

            const newEnrollmentItem = {
              id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              student_id: studentId,
              class_id: cls.id,
              balance_sessions: remainingSessions,
              joined_at: timestamp.split("T")[0],
              status: "active",
              student: {
                id: studentId,
                full_name: name,
                parent_name: parentName,
                parent_phone: phone,
              },
            };
            const existingEnrollments = cls.enrollments || [];
            return {
              ...cls,
              enrollment_count: newCount,
              currentStudents: newCount,
              currentEnrolled: newCount,
              status: newStatus,
              enrollments: [newEnrollmentItem, ...existingEnrollments],
            };
          }
          return cls;
        })
      );
    }
  }

  // ─── ACTION: THÊM HÓA ĐƠN VỚI CƠ CHẾ CHỐNG TRÙNG LẶP (DEDUPLICATION) ───
  function addInvoice(newInvoice: AppInvoice) {
    setInvoices((prev) => {
      const isExisted = prev.some(
        (inv) =>
          inv.id === newInvoice.id ||
          (inv.invoice_code && newInvoice.invoice_code && inv.invoice_code === newInvoice.invoice_code)
      );
      if (isExisted) return prev;
      return [newInvoice, ...prev];
    });
  }

  // ─── ACTION: CHUYỂN GIAI ĐOẠN LEAD SANG GHI DANH & CHUYỂN ĐỔI ───
  function moveToConversion(leadId: string, payload?: Partial<Lead>) {
    const timestamp = new Date().toISOString();

    // 1. Cập nhật Lead sang ready_to_enroll và stage conversion
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              ...payload,
              status: "ready_to_enroll" as LeadStatus,
              stage: "conversion",
              updatedAt: timestamp,
            }
          : l
      )
    );

    // 2. Cập nhật Trials: Đánh dấu đã tham gia học thử & kết quả tốt
    setTrials((prev) =>
      prev.map((t) => {
        if (t.leadId === leadId || t.id === leadId) {
          return {
            ...t,
            status: "attended" as const,
            trialResult: (payload as any)?.trialResult || t.trialResult || "good",
            nextStep: "convert",
            trialRegistrations: t.trialRegistrations?.map((r) => ({
              ...r,
              status: "attended" as const,
            })),
          };
        }
        return t;
      })
    );

    // 3. Tạo/Cập nhật bản ghi Conversion trong Store toàn cục
    setConversions((prev) => {
      const existing = prev.find((c) => c.leadId === leadId || c.id === leadId);
      if (existing) {
        return prev.map((c) =>
          c.leadId === leadId || c.id === leadId
            ? {
                ...c,
                status: (c.status === "converted" ? "converted" : "ready_to_enroll") as any,
                isTuitionPaid: c.status === "converted",
              }
            : c
        );
      }

      const targetLead = leads.find((l) => l.id === leadId);
      const targetTrial = trials.find((t) => t.leadId === leadId || t.id === leadId);
      const sName = targetLead?.studentName || targetTrial?.leadName || "Học sinh mới";
      const pName = targetLead?.parentName || "Phụ huynh";
      const pPhone = targetLead?.parentPhone || targetTrial?.parentPhone || "";
      const cName = targetLead?.targetClassName || targetTrial?.className || "Lớp Toán 9A1 (Chuyên sâu)";
      const cId = targetLead?.targetClassId || targetTrial?.classId || "class-toan-9a1";

      const newConv: EnrollmentConversion = {
        id: `conv-${leadId}-${Date.now()}`,
        leadId: leadId,
        studentName: sName,
        parentName: pName,
        parentPhone: pPhone,
        classId: cId,
        className: cName,
        subjects: [
          {
            trialClassId: cId,
            className: cName,
            testScore: targetLead?.testScore ?? targetTrial?.testScore ?? 8.5,
            tuitionFee: cName.includes("Toán") ? 2400000 : cName.includes("Anh") ? 1800000 : 2000000,
            isSelected: true,
            sessions: 12,
            packageLabel: "Gói 12 buổi",
          },
        ],
        depositAmount: 500000,
        tuitionPackageSessions: 12,
        tuitionFee: cName.includes("Toán") ? 2400000 : cName.includes("Anh") ? 1800000 : 2000000,
        isDepositPaid: false,
        isTuitionPaid: false,
        status: "ready_to_enroll" as any,
        createdAt: timestamp,
      };

      return [newConv, ...prev];
    });
  }

  // ─── CORE ACTION: XÁC NHẬN GHI DANH THÀNH CÔNG ───
  function completeEnrollment({
    conversionId,
    studentName,
    parentName,
    parentPhone,
    subjects,
    totalAmount,
    note,
  }: CompleteEnrollmentParams) {
    const timestamp = new Date().toISOString();
    const newStudentId = `STU-${Date.now()}`;
    const invoiceCode = `HD-${Date.now().toString().slice(-6)}`;
    const newInvoiceId = conversionId ? `inv-${conversionId}` : `inv-${Date.now()}`;

    // 1. Cập nhật Conversions Tab: Chuyển sang "converted"
    setConversions((prev) =>
      prev.map((c) => {
        if (c.id === conversionId) {
          return {
            ...c,
            status: "converted",
            isDepositPaid: true,
            isTuitionPaid: true,
            tuitionFee: totalAmount,
            convertedToStudentId: newStudentId,
            convertedAt: timestamp,
          };
        }
        return c;
      })
    );

    // 2. Cập nhật Leads Tab: Chuyển sang "converted" (Đã ghi danh)
    const targetConv = conversions.find((c) => c.id === conversionId);
    setLeads((prev) =>
      prev.map((l) => {
        const isTarget =
          (targetConv?.leadId && l.id === targetConv.leadId) ||
          (l.studentName && l.studentName.toLowerCase() === studentName.toLowerCase()) ||
          (parentPhone && l.parentPhone && l.parentPhone.replace(/\D/g, "") === parentPhone.replace(/\D/g, ""));
        if (isTarget) {
          return {
            ...l,
            status: "converted" as LeadStatus,
            updatedAt: timestamp,
            notes: l.notes ? `${l.notes} | Đã ghi danh chính thức` : "Đã ghi danh chính thức",
          };
        }
        return l;
      })
    );

    // 2b. Cập nhật Trials Tab: Chuyển sang "attended" (Đã tham gia) nếu có lịch thử
    setTrials((prev) =>
      prev.map((t) => {
        const isTarget =
          (targetConv?.leadId && t.leadId === targetConv.leadId) ||
          (t.leadName && t.leadName.toLowerCase() === studentName.toLowerCase()) ||
          (parentPhone && t.parentPhone && t.parentPhone.replace(/\D/g, "") === parentPhone.replace(/\D/g, ""));
        if (isTarget) {
          return {
            ...t,
            status: "attended" as const,
            trialRegistrations: t.trialRegistrations?.map((r) => ({
              ...r,
              status: "attended" as const,
            })),
          };
        }
        return t;
      })
    );

    // 3. Trích xuất môn & lớp học chính thức
    const primarySubject = subjects[0];
    const totalSessions = subjects.reduce((sum, s) => sum + (s.sessions || 12), 0);
    const targetClass = classes.find(
      (c) =>
        c.id === primarySubject?.officialClassId ||
        c.name === primarySubject?.officialClassName ||
        (c.name.includes("Toán 9") && primarySubject?.officialClassName?.includes("Toán 9"))
    );

    // 4. Tạo studentPayload đầy đủ lớp học, số buổi và đưa vào store học sinh
    const studentPayload = {
      id: newStudentId,
      name: studentName,
      full_name: studentName,
      parentName,
      parent_name: parentName,
      phone: parentPhone,
      parentPhone,
      parent_phone: parentPhone,
      classId: primarySubject?.officialClassId || targetClass?.id || "class-toan-9a1",
      className: primarySubject?.officialClassName || targetClass?.name || "Lớp Toán 9A1 (Chuyên sâu)",
      room: targetClass?.room || "P.201",
      schedule: typeof targetClass?.schedule === "string" ? targetClass.schedule : "Thứ 4 & Thứ 7 (18:00 - 19:30)",
      totalSessions: primarySubject?.sessions || totalSessions || 12,
      remainingSessions: primarySubject?.sessions || totalSessions || 12,
      tuitionStatus: (primarySubject?.sessions || 12) >= 3 ? "safe" : "warning",
      status: "active",
      enrolledAt: timestamp,
      created_at: timestamp.split("T")[0],
      enrollments: subjects.map((sub, idx) => ({
        id: `enr-${Date.now()}-${idx}`,
        class_id: sub.officialClassId,
        balance_sessions: sub.sessions || 12,
        joined_at: timestamp.split("T")[0],
        status: "active",
        class: {
          id: sub.officialClassId,
          name: sub.officialClassName,
          fee_per_session: sub.feePerSession,
        },
      })),
    };

    addOrUpdateStudent(studentPayload);

    // 5. Cập nhật Tài chính (Finance / Invoices): Thêm hóa đơn Đã thanh toán (VietQR) - CHỐNG TRÙNG LẶP HÓA ĐƠN
    const newInvoiceEntry: AppInvoice = {
      id: newInvoiceId,
      invoice_code: invoiceCode,
      student_name: studentName,
      parent_phone: parentPhone,
      amount: totalAmount,
      status: "paid",
      payment_method: "VietQR Napas 24/7",
      created_at: timestamp,
      paid_at: timestamp,
      class_id: primarySubject?.officialClassId || targetClass?.id,
      class_name: primarySubject?.officialClassName || targetClass?.name,
      sessions_added: primarySubject?.sessions || totalSessions || 12,
      note:
        note ||
        `Đã thanh toán (VietQR) - ${subjects
          .map((s) => `${s.officialClassName} (${s.sessions} buổi)`)
          .join(", ")}`,
    };

    setInvoices((prev) => {
      const isExisted = prev.some(
        (inv) =>
          inv.id === newInvoiceId ||
          (inv.invoice_code && inv.invoice_code === invoiceCode) ||
          (conversionId && inv.id.includes(conversionId)) ||
          (inv.student_name?.toLowerCase() === studentName.toLowerCase() &&
            inv.amount === totalAmount &&
            Math.abs(new Date(inv.created_at).getTime() - new Date(timestamp).getTime()) < 10000)
      );
      if (isExisted) return prev;
      return [newInvoiceEntry, ...prev];
    });

    return {
      studentId: newStudentId,
      invoiceId: newInvoiceId,
    };
  }

  function addOrUpdateTeacher(teacherPayload: Partial<AppTeacher>) {
    const id = teacherPayload.id || `teacher-${Date.now()}`;
    const teacherObj: AppTeacher = {
      id,
      name: teacherPayload.full_name || teacherPayload.name || "Giáo viên mới",
      full_name: teacherPayload.full_name || teacherPayload.name || "Giáo viên mới",
      email: teacherPayload.email || `${id}@educenter.vn`,
      phone: teacherPayload.phone || "",
      subject: teacherPayload.subject || "Toán",
      salary_per_session: teacherPayload.salary_per_session || 200000,
      bank_name: teacherPayload.bank_name || "Vietcombank",
      bank_account_no: teacherPayload.bank_account_no || "",
      role: "teacher",
      created_at: teacherPayload.created_at || new Date().toISOString(),
    };

    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === id || (t.full_name && t.full_name === teacherObj.full_name));
      if (exists) {
        return prev.map((t) => (t.id === id || t.full_name === teacherObj.full_name ? { ...t, ...teacherObj } : t));
      }
      return [...prev, teacherObj];
    });

    return teacherObj;
  }

  // ─── ACTION: NẠP HỌC PHÍ & TĂNG SỐ BUỔI CHO HỌC VIÊN DÙNG CHUNG ───
  function topUpStudentTuition(params: TopUpParams) {
    const timestamp = new Date().toISOString();
    const invoiceId = `inv-${Date.now()}`;
    const invoiceCode = `HD-${Date.now().toString().slice(-6)}`;
    const isPaid = params.isPaid ?? false;

    let targetStudent: AppStudent | undefined;

    setStudents((prev) =>
      prev.map((st) => {
        const sFullName = (st.full_name || st.name || "").toLowerCase();
        const pFullName = (params.studentName || "").toLowerCase();
        const match =
          st.id === params.studentId ||
          (pFullName && sFullName === pFullName) ||
          (pFullName && sFullName.includes(pFullName));

        if (match) {
          const sessionsChange = isPaid ? params.sessionsAdded : 0;
          const currentRem = st.remainingSessions ?? 12;
          const newRemaining = currentRem + sessionsChange;
          const newTotal = (st.totalSessions ?? currentRem) + sessionsChange;
          const newTuitionStatus = newRemaining >= 3 ? "safe" : newRemaining > 0 ? "warning" : "danger";

          let updatedEnrollments = st.enrollments || [];
          if (updatedEnrollments.length > 0) {
            const hasClassEnr = updatedEnrollments.some(
              (e: any) => e.class_id === params.classId || e.class?.id === params.classId
            );
            if (hasClassEnr) {
              updatedEnrollments = updatedEnrollments.map((e: any) => {
                if (e.class_id === params.classId || e.class?.id === params.classId) {
                  return {
                    ...e,
                    balance_sessions: (e.balance_sessions ?? 0) + sessionsChange,
                  };
                }
                return e;
              });
            } else {
              updatedEnrollments = updatedEnrollments.map((e: any, idx: number) =>
                idx === 0
                  ? { ...e, balance_sessions: (e.balance_sessions ?? 0) + sessionsChange }
                  : e
              );
            }
          }

          const updated: AppStudent = {
            ...st,
            totalSessions: newTotal,
            remainingSessions: newRemaining,
            tuitionStatus: newTuitionStatus,
            enrollments: updatedEnrollments,
          };
          targetStudent = updated;
          return updated;
        }
        return st;
      })
    );

    const sName = params.studentName || targetStudent?.full_name || targetStudent?.name || "Học sinh";
    const sPhone = targetStudent?.parent_phone || targetStudent?.phone || "";
    const newInvoice: AppInvoice = {
      id: invoiceId,
      invoice_code: invoiceCode,
      student_name: sName,
      parent_phone: sPhone,
      amount: params.amount,
      status: isPaid ? "paid" : "pending",
      payment_method: params.paymentMethod === "cash" ? "Tiền mặt" : "VietQR Napas 24/7",
      created_at: timestamp,
      paid_at: isPaid ? timestamp : undefined,
      class_id: params.classId,
      class_name: params.className,
      sessions_added: params.sessionsAdded,
      note: params.note || `Nạp +${params.sessionsAdded} buổi - ${params.className || "Lớp học"}`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    return { invoice: newInvoice, student: targetStudent };
  }

  // ─── ACTION: XÁC NHẬN THANH TOÁN HÓA ĐƠN & TỰ ĐỘNG CỘNG BUỔI VÀO HỌC VIÊN ───
  function markInvoicePaid(invoiceId: string) {
    const timestamp = new Date().toISOString();
    let targetInv: AppInvoice | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId || inv.invoice_code === invoiceId) {
          targetInv = { ...inv, status: "paid", paid_at: timestamp };
          return targetInv;
        }
        return inv;
      })
    );

    if (targetInv) {
      const invStudentName = (targetInv.student_name || "").toLowerCase();
      const sessionsToAdd = targetInv.sessions_added ?? 0;

      setStudents((prev) =>
        prev.map((st) => {
          const sName = (st.full_name || st.name || "").toLowerCase();
          const match =
            sName === invStudentName ||
            sName.includes(invStudentName) ||
            invStudentName.includes(sName) ||
            (targetInv?.parent_phone && (st.parent_phone === targetInv.parent_phone || st.phone === targetInv.parent_phone));

          if (match) {
            const newRemaining = (st.remainingSessions ?? 0) + sessionsToAdd;
            const newTotal = (st.totalSessions ?? 0) + sessionsToAdd;
            const newTuitionStatus = newRemaining >= 3 ? "safe" : newRemaining > 0 ? "warning" : "danger";

            let updatedEnrollments = st.enrollments || [];
            if (updatedEnrollments.length > 0) {
              updatedEnrollments = updatedEnrollments.map((e: any, idx: number) => {
                if (idx === 0 || e.class_id === targetInv?.class_id) {
                  return {
                    ...e,
                    balance_sessions: (e.balance_sessions ?? 0) + sessionsToAdd,
                  };
                }
                return e;
              });
            }

            return {
              ...st,
              totalSessions: newTotal,
              remainingSessions: newRemaining,
              tuitionStatus: newTuitionStatus,
              enrollments: updatedEnrollments,
            };
          }
          return st;
        })
      );
    }
  }

  const value: AppDataContextValue = {
    classes,
    setClasses,
    students,
    setStudents,
    invoices,
    totalRevenue,
    conversions,
    setConversions,
    leads,
    setLeads,
    trials,
    setTrials,
    teachers,
    setTeachers,
    totalActiveStudents,
    nearCapacityCount,
    addClass,
    enrollStudentToClass,
    removeStudentFromClass,
    addOrUpdateStudent,
    addOrUpdateTeacher,
    completeEnrollment,
    topUpStudentTuition,
    markInvoicePaid,
    addInvoice,
    moveToConversion,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
