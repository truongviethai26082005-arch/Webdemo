export type UserRole = 'admin' | 'teacher';
export type StudentStatus = 'active' | 'paused' | 'dropped';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused';
export type InvoiceStatus = 'pending' | 'paid';

export interface Profile {
  id: string; // auth.users.id
  full_name: string;
  phone?: string | null;
  role: UserRole;
  salary_per_session: number;
  bank_name?: string | null;
  bank_account_no?: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  parent_name?: string | null;
  parent_phone: string;
  status: StudentStatus;
  birth_date?: string | null;
  note?: string | null;
  created_at: string;
}

export interface ClassScheduleItem {
  day: string;
  start_time: string;
  end_time: string;
}

export interface Class {
  id: string;
  name: string;
  room?: string | null;
  teacher_id?: string | null;
  fee_per_session: number;
  max_students?: number | null;
  start_date?: string | null;
  schedule?: ClassScheduleItem[] | null;
  created_at: string;
  teacher?: Profile | null;
  enrollment_count?: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  balance_sessions: number;
  joined_at: string;
  student?: Student;
  class?: Class;
}

export interface ClassSession {
  id: string;
  class_id: string;
  teacher_id?: string | null;
  session_date: string;
  start_time?: string | null;
  end_time?: string | null;
  status: SessionStatus;
  note?: string | null;
  created_at: string;
  class?: Class;
  teacher?: Profile | null;
  attendance_count?: number;
}

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  note?: string | null;
  created_at: string;
  student?: Student;
}

export interface Invoice {
  id: string;
  student_id: string;
  class_id: string;
  sessions_added: number;
  amount: number;
  status: InvoiceStatus;
  paid_at?: string | null;
  created_at: string;
  student?: Student;
  class?: Class;
}

export interface DashboardStats {
  totalStudents: number;
  activeClasses: number;
  monthlySessions: number;
  monthlyRevenue: number;
  lowBalanceStudents: {
    student: Student;
    class: Class;
    balance_sessions: number;
  }[];
  todaySessions: (ClassSession & { class: Class; teacher?: Profile | null })[];
}

export interface TeacherSessionDetail {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  className: string;
  room?: string;
  attendanceCount: number;
}

export interface TeacherPayroll {
  teacher: Profile;
  completedSessions: number;
  salaryPerSession: number;
  bonus?: number;
  deduction?: number;
  adjustmentNote?: string;
  totalSalary: number;
  isPaid?: boolean;
  paidAt?: string | null;
  sessions?: TeacherSessionDetail[];
}
