export type UserRole = 'admin' | 'teacher' | 'sale' | 'student';
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
  auth_user_id?: string | null;
  full_name: string;
  parent_name?: string | null;
  parent_phone: string;
  status: StudentStatus;
  birth_date?: string | null;
  note?: string | null;
  created_at: string;
  updated_at?: string;
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
  end_date?: string | null;
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
  status: StudentStatus;
  paused_at?: string | null;
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

// ==========================================
// PHÂN HỆ TUYỂN SINH (SALE / ADMISSIONS)
// ==========================================

export type LeadStage = 'inquiry' | 'trial' | 'conversion' | 'enrolled' | 'waiting_class';
export type LeadStatus = 'new' | 'contacted' | 'callback' | 'no_demand' | 'converted';
export type LeadSource =
  | 'facebook_ads'
  | 'fanpage'
  | 'zalo'
  | 'referral'
  | 'walkin'
  | 'hotline'
  | 'other';
export type InteractionChannel = 'call' | 'zalo' | 'in_person' | 'email';
export type FeedbackSentiment =
  | 'high_interest'
  | 'price_concern'
  | 'schedule_conflict'
  | 'need_consult'
  | 'other';
export type TrialResult = 'excellent' | 'good' | 'average' | 'weak';
export type TrialSlotStatus = 'active' | 'full' | 'closed';
export type LeadTrialStatus = 'scheduled' | 'attended' | 'absent' | 'cancelled';

export interface Lead {
  id: string;
  full_name: string;
  parent_name?: string | null;
  phone: string;
  zalo?: string | null;
  email?: string | null;
  birth_date?: string | null;
  grade?: string | null;
  course_interest?: string | null;
  target_goal?: string | null;
  source: LeadSource;
  referrer_name?: string | null;
  stage: LeadStage;
  status: LeadStatus;
  assigned_sale_id?: string | null;
  converted_student_id?: string | null;
  missed_calls_count: number;
  trial_result?: TrialResult | null;
  test_score?: number | null;
  target_class_id?: string | null;
  target_class_name?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  assigned_sale?: Profile | null;
  converted_student?: Student | null;
  target_class?: Class | null;
  interactions?: LeadInteraction[];
  trials?: (LeadTrial & { slot?: TrialSlot })[];
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  sale_id?: string | null;
  channel: InteractionChannel;
  content: string;
  sentiment?: FeedbackSentiment | null;
  is_missed_call: boolean;
  callback_at?: string | null;
  created_at: string;
  sale?: Profile | null;
}

export interface TrialSlot {
  id: string;
  subject: string;
  teacher_name?: string | null;
  room?: string | null;
  day_of_week: string;
  time_slot: string;
  max_students: number;
  batch_number: number;
  status: TrialSlotStatus;
  note?: string | null;
  created_at: string;
  registered_count?: number;
}

export interface LeadTrial {
  id: string;
  lead_id: string;
  slot_id: string;
  trial_date?: string | null;
  status: LeadTrialStatus;
  score?: number | null;
  evaluation?: string | null;
  result?: TrialResult | null;
  created_at: string;
  lead?: Lead;
  slot?: TrialSlot;
}

// ==========================================
// PHẢN ÁNH & GÓP Ý (FEEDBACK / COMPLAINT TICKETS)
// ==========================================

export type FeedbackCategory =
  | 'teaching_quality'
  | 'schedule'
  | 'tuition'
  | 'facility'
  | 'other';
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved';
// Kênh phản ánh thực tế của trung tâm giáo dục — tách riêng khỏi InteractionChannel
// (vốn chỉ dùng để Sale ghi nhật ký chăm sóc Lead trong phễu tuyển sinh, ngữ cảnh
// khác hẳn khiếu nại/góp ý). Tách "zalo" và "facebook" thành 2 giá trị riêng để
// nhất quán với cách LeadSource đã tách 'zalo' / 'fanpage' / 'facebook_ads'.
export type FeedbackChannel =
  | 'in_person'  // Trực tiếp tại cơ sở (lễ tân, tư vấn viên, quản lý)
  | 'hotline'    // Điện thoại/Hotline (tổng đài hoặc SĐT cá nhân tư vấn viên)
  | 'zalo'       // Zalo (nhóm lớp hoặc nhắn riêng)
  | 'facebook'   // Fanpage/Messenger
  | 'system'     // Hệ thống nội bộ/LMS (đánh giá, chat hỗ trợ, ticket trên web/app)
  | 'email';     // Email chính thức (CSKH/ban quản lý)

export interface FeedbackTicket {
  id: string;
  student_id?: string | null;
  contact_name: string;
  contact_phone: string;
  category: FeedbackCategory;
  channel: FeedbackChannel;
  content: string;
  status: FeedbackStatus;
  resolution_note?: string | null;
  created_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  student?: Student | null;
  created_by_profile?: Profile | null;
}

