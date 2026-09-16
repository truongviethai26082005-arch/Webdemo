"use client";

import { useAppData, AppTeacher, AppStudent, AppInvoice } from "@/lib/context/app-data-context";
import { Lead, TrialClass, EnrollmentConversion } from "@/types/admissions";

export interface ClassItem {
  id: string;
  name: string;
  room?: string;
  teacherName?: string;
  feePerSession?: number;
  schedule?: string;
  currentEnrolled: number;
  maxCapacity: number;
  status: "active" | "almost_full" | "full" | "completed";

  // BỔ SUNG TRƯỜNG THỜI HẠN KHÓA HỌC:
  durationMonths?: number;      // VD: 3 (tháng) hoặc 5 (tháng)
  startDate?: string;           // VD: "2026-09-01"
  endDate?: string;             // VD: "2026-12-01"
  totalPlannedSessions?: number;// Tổng số buổi của cả khóa (VD: 24 buổi hoặc 40 buổi)
  completedSessions?: number;   // Số buổi đã dạy thực tế

  subject?: string;
  teacher_id?: string;
  teacher?: {
    id: string;
    full_name: string;
    phone?: string;
  };
  fee_per_session?: number;
  enrollment_count?: number;
  currentStudents?: number;
  max_students?: number;
  maxStudents?: number;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  total_planned_sessions?: number;
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

export interface EduStore {
  leads: Lead[];
  trials: TrialClass[];
  conversions: EnrollmentConversion[];
  classes: ClassItem[];
  addClass: (newClass: Partial<ClassItem> | any) => any;
  enrollStudentToClass: (classId: string, studentInfo?: any) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;
  teachers: AppTeacher[];
  addOrUpdateTeacher: (teacherPayload: Partial<AppTeacher>) => AppTeacher;
  students: AppStudent[];
  invoices: AppInvoice[];
  topUpStudentTuition: (params: any) => any;
  markInvoicePaid: (invoiceId: string) => void;
  addInvoice: (newInvoice: AppInvoice) => void;
  moveToConversion: (leadId: string, payload?: Partial<Lead>) => void;
  completeEnrollment: (params: any) => any;
  totalRevenue: number;
  totalClasses: number;
  totalStudents: number;
  nearCapacityCount: number;
}

/**
 * useEduStore: Centralized store hook cung cấp Two-Way Data Binding
 * Giữa "Quản lý lớp học" (/admin/classes) và "Ghi danh & Chuyển đổi" (conversions-tab.tsx).
 * Hỗ trợ cả cách gọi trực tiếp useEduStore() và selector useEduStore(state => state.classes).
 */
export function useEduStore<T = EduStore>(selector?: (state: EduStore) => T): T {
  const appData = useAppData();

  const totalStudents = appData.classes.reduce((sum, c) => {
    const count = c.currentEnrolled ?? c.enrollment_count ?? c.currentStudents ?? 0;
    return sum + count;
  }, 0);

  const nearCapacityCount = appData.classes.filter((c) => {
    const max = c.maxCapacity ?? c.max_students ?? c.maxStudents ?? 15;
    const count = c.currentEnrolled ?? c.enrollment_count ?? c.currentStudents ?? 0;
    return count / max >= 0.8 && count / max < 1;
  }).length;

  const storeState: EduStore = {
    leads: appData.leads,
    trials: appData.trials,
    conversions: appData.conversions,
    classes: appData.classes as unknown as ClassItem[],
    addClass: appData.addClass,
    enrollStudentToClass: appData.enrollStudentToClass,
    removeStudentFromClass: appData.removeStudentFromClass,
    teachers: appData.teachers,
    addOrUpdateTeacher: appData.addOrUpdateTeacher,
    students: appData.students,
    invoices: appData.invoices,
    topUpStudentTuition: appData.topUpStudentTuition,
    markInvoicePaid: appData.markInvoicePaid,
    addInvoice: appData.addInvoice,
    moveToConversion: appData.moveToConversion,
    completeEnrollment: appData.completeEnrollment,
    totalRevenue: appData.totalRevenue,
    totalClasses: appData.classes.length,
    totalStudents,
    nearCapacityCount,
  };

  if (selector) {
    return selector(storeState);
  }

  return storeState as unknown as T;
}
