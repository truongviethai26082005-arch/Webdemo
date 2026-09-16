export type LeadStatus = "new" | "contacted" | "callback" | "no_demand" | "converted" | "ready_to_enroll";

export function normalizeLeadStatus(status: string): LeadStatus {
  if (status === "converted") return "converted";
  if (status === "ready_to_enroll") return "ready_to_enroll";
  if (status === "new") return "new";
  if (status === "callback") return "callback";
  if (status === "no_demand") return "no_demand";
  return "contacted";
}


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

export type TrialStatus = "scheduled" | "attended" | "no_demand";

export function normalizeTrialStatus(status: string): TrialStatus {
  if (status === "attended") return "attended";
  if (status === "no_demand" || status === "absent" || status === "cancelled") return "no_demand";
  return "scheduled";
}

export type TrialResult = "excellent" | "good" | "average" | "weak";

export interface Lead {
  id: string;
  studentName: string;
  studentDob?: string;
  studentGrade?: string; // Lớp 6, Lớp 9, v.v.
  parentName: string;
  parentPhone: string;
  parentZalo?: string;
  parentMessenger?: string;
  source: LeadSource;
  referrerName?: string;
  targetSubject: string; // Môn học quan tâm: "Toán 9", "Tiếng Anh", v.v.
  targetGoal: string; // Mục tiêu: "Lấy lại gốc", "Luyện thi vào 10", v.v.
  status: LeadStatus;
  stage?: "inquiry" | "trial" | "conversion" | "enrolled" | string;
  trialResult?: string;
  testScore?: number;
  targetClassId?: string;
  targetClassName?: string;
  missedCallsCount?: number; // Số lần gọi nhỡ
  failedReason?: string;
  assignedStaff: string; // Sale/Tư vấn viên phụ trách
  createdAt: string;
  updatedAt: string;
  notes?: string;
  callbackTime?: string;
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

export interface TrialRegistration {
  trialClassId: string;
  className: string;
  schedule: string;
  teacherName?: string;
  room?: string;
  testScore?: number;
  teacherFeedback?: string;
  parentFeedback?: string;
  status: TrialStatus;
  batchNumber?: number;
}

export interface TrialClass {
  id: string;
  trialClassId?: string; // ID trỏ tới FixedTrialSlot duy nhất (nếu chỉ chọn 1 ca)
  trialRegistrations?: TrialRegistration[]; // Danh sách các ca học thử đăng ký (1 - N)
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
  batchNumber?: number;
}

export interface EnrollmentSubjectChoice {
  trialClassId: string;
  className: string;
  officialClassId?: string;
  officialClassName?: string;
  testScore?: number;
  teacherName?: string;
  tuitionFee: number;
  isSelected: boolean;
  sessions?: number;
  packageLabel?: string;
  feePerSession?: number;
}

export interface EnrollmentConversion {
  id: string;
  leadId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  classId: string;
  className: string;
  subjects?: EnrollmentSubjectChoice[]; // Danh sách môn học thử & tùy chọn ghi danh chính thức
  depositAmount: number; // Tiền đặt cọc giữ chỗ (VD: 500,000 đ)
  tuitionPackageSessions: number; // Gói số buổi (VD: 12 buổi)
  tuitionFee: number; // Tổng học phí
  isDepositPaid: boolean;
  isTuitionPaid: boolean;
  convertedToStudentId?: string;
  convertedAt?: string;
  createdAt?: string; // YYYY-MM-DD THH:mm:ss
  dueDate?: string;   // YYYY-MM-DD THH:mm:ss - Hạn nộp / Ngày thu dự kiến
  status: "pending_deposit" | "deposited" | "converted" | "cancelled" | "ready_to_enroll";
}

export interface FixedTrialSlot {
  id: string;
  className: string;
  subject: string;
  dayTime: string; // VD: "Thứ 5 (18:00 - 19:30)"
  trialDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teacherName: string;
  room: string;
  maxCapacity: number; // Định mức sĩ số tối đa (20 hoặc 30)
  level?: "basic" | "advanced"; // Cơ bản (Đại trà) / Nâng cao (Chuyên sâu)
  currentBatch?: number; // Mặc định Đợt 1, Đợt 2...
}

export const DEFAULT_FIXED_TRIAL_SLOTS: FixedTrialSlot[] = [
  {
    id: "class-toan-9",
    className: "Toán 9 Nâng Cao (Thầy Dũng)",
    subject: "Toán 9 (Chuyên sâu)",
    dayTime: "Thứ 5 (18:00 - 19:30)",
    trialDate: "2026-03-12",
    startTime: "18:00",
    endTime: "19:30",
    teacherName: "Thầy Nguyễn Tiến Dũng",
    room: "P.201",
    maxCapacity: 20,
    level: "advanced",
    currentBatch: 1,
  },
  {
    id: "class-toan-7",
    className: "Toán 7 Cơ Bản (Cô Mai)",
    subject: "Toán 7 (Đại trà)",
    dayTime: "Chủ Nhật (19:30 - 21:00)",
    trialDate: "2026-03-15",
    startTime: "19:30",
    endTime: "21:00",
    teacherName: "Cô Trần Thị Mai",
    room: "P.102",
    maxCapacity: 30,
    level: "basic",
    currentBatch: 1,
  },
  {
    id: "class-anh-6",
    className: "Tiếng Anh Lớp 6 (Cô Emily)",
    subject: "Tiếng Anh 6 (Đại trà)",
    dayTime: "Thứ 7 (09:00 - 10:30)",
    trialDate: "2026-03-14",
    startTime: "09:00",
    endTime: "10:30",
    teacherName: "Cô Emily Nguyễn",
    room: "P.302",
    maxCapacity: 30,
    level: "basic",
    currentBatch: 1,
  },
  {
    id: "class-ly-10",
    className: "Vật Lý 10 Ôn Luyện (Thầy Hùng)",
    subject: "Vật lý 10 (Chuyên sâu)",
    dayTime: "Thứ 2 (18:00 - 19:30)",
    trialDate: "2026-03-09",
    startTime: "18:00",
    endTime: "19:30",
    teacherName: "Thầy Lê Văn Hùng",
    room: "P.203",
    maxCapacity: 20,
    level: "advanced",
    currentBatch: 1,
  },
];

export function isStudentInTrialSlot(
  trial: TrialClass,
  slot: FixedTrialSlot,
  currentBatchOnly: boolean = true
): boolean {
  if (trial.status === "no_demand") return false;

  const slotBatch = slot.currentBatch || 1;

  if (trial.trialRegistrations && trial.trialRegistrations.length > 0) {
    return trial.trialRegistrations.some((r) => {
      const matchSlot = r.trialClassId === slot.id || r.className === slot.className;
      if (!matchSlot) return false;
      if (currentBatchOnly) {
        const regBatch = r.batchNumber || trial.batchNumber || 1;
        return regBatch === slotBatch;
      }
      return true;
    });
  }

  const regBatch = trial.batchNumber || 1;
  if (currentBatchOnly && regBatch !== slotBatch) return false;

  if (trial.trialClassId) {
    return trial.trialClassId === slot.id;
  }
  // Fallback matching by className
  if (trial.className === slot.className) return true;
  if (slot.id === "class-toan-9" && trial.className.includes("Toán 9")) return true;
  if (slot.id === "class-toan-7" && trial.className.includes("Toán 7")) return true;
  if (slot.id === "class-anh-6" && (trial.className.includes("Tiếng Anh") || trial.className.includes("Anh 6"))) return true;
  if (slot.id === "class-ly-10" && trial.className.includes("Vật Lý 10")) return true;
  return false;
}

