export type LeadStatus =
  | "new"
  | "contacted"
  | "callback"
  | "no_answer"
  | "trial_scheduled"
  | "enrolled"
  | "failed";

export type LeadSource =
  | "facebook_ads"
  | "fanpage"
  | "zalo"
  | "referral"
  | "walkin"
  | "hotline"
  | "other";

export type InteractionChannel = "call" | "zalo" | "in_person" | "email";

export type FeedbackSentiment =
  | "high_interest"
  | "price_concern"
  | "schedule_conflict"
  | "need_consult"
  | "other";

export type TrialStatus = "scheduled" | "attended" | "absent" | "cancelled";

export type TrialResult = "excellent" | "good" | "average" | "weak";

export interface Lead {
  id: string;
  studentName: string;
  studentDob?: string;
  studentGrade?: string; // Lớp 6, Lớp 9, v.v.
  parentName: string;
  parentPhone: string;
  parentZalo?: string;
  source: LeadSource;
  referrerName?: string;
  targetSubject: string; // Môn học quan tâm: "Toán 9", "Tiếng Anh", v.v.
  targetGoal: string; // Mục tiêu: "Lấy lại gốc", "Luyện thi vào 10", v.v.
  status: LeadStatus;
  failedReason?: string;
  assignedStaff: string; // Sale/Tư vấn viên phụ trách
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface InteractionLog {
  id: string;
  leadId: string;
  leadName: string;
  parentPhone: string;
  channel: InteractionChannel;
  staffName: string;
  date: string; // YYYY-MM-DD HH:mm
  sentiment: FeedbackSentiment;
  content: string; // Nội dung trao đổi & ghi chú phụ huynh
  nextAction: string; // Việc cần làm tiếp theo
  reminderAt?: string; // Lịch nhắc hẹn
  isCompleted?: boolean;
}

export interface TrialClass {
  id: string;
  leadId: string;
  leadName: string;
  parentPhone: string;
  targetSubject: string;
  classId?: string;
  className: string;
  teacherId?: string;
  teacherName: string;
  trialDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  status: TrialStatus;
  testScore?: number; // Điểm test 0 - 10
  teacherFeedback?: string; // Nhận xét giáo viên
  parentFeedback?: string; // Phản hồi phụ huynh sau buổi học thử
  trialResult?: TrialResult;
  nextStep?: "convert" | "re_test" | "failed";
}

export interface EnrollmentConversion {
  id: string;
  leadId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  classId: string;
  className: string;
  depositAmount: number; // Tiền đặt cọc giữ chỗ (VD: 500,000 đ)
  tuitionPackageSessions: number; // Gói số buổi (VD: 12 buổi)
  tuitionFee: number; // Tổng học phí
  isDepositPaid: boolean;
  isTuitionPaid: boolean;
  convertedToStudentId?: string;
  convertedAt?: string;
  status: "pending_deposit" | "deposited" | "converted" | "cancelled";
}

export interface FunnelMetrics {
  totalLeads: number; // Lead thô
  contactedCount: number; // Đang tư vấn & chăm sóc
  trialCount: number; // Đã / đang học thử
  convertedCount: number; // Chốt cọc / Ghi danh
  conversionRate: number; // % Tỷ lệ chuyển đổi
}
