import { LeadStage } from "@/types/database";

// Gộp hiển thị 6 giá trị `stage` chi tiết (raw/potential/trial/conversion/
// enrolled/waiting_class) thành 3 giai đoạn lớn theo yêu cầu nghiệp vụ mới.
// KHÔNG đổi cột `stage` trong DB — giữ nguyên toàn bộ logic tự động đang chạy
// đúng (raw->potential khi liên hệ thành công, auto no_demand sau 3 lần gọi
// nhỡ, khóa cứng khi đã N4...). Đây chỉ là lớp trình bày (presentation layer).
export type FunnelGroup = 1 | 2 | 3;

export const FUNNEL_GROUP_LABEL: Record<FunnelGroup, string> = {
  1: "Khách hàng tiềm năng",
  2: "Xếp lịch học thử",
  3: "Ghi danh & chuyển đổi",
};

export const FUNNEL_GROUP_COLOR: Record<FunnelGroup, string> = {
  1: "text-amber-600 dark:text-amber-400",
  2: "text-purple-600 dark:text-purple-400",
  3: "text-emerald-600 dark:text-emerald-400",
};

export function getFunnelGroup(stage: LeadStage): FunnelGroup {
  switch (stage) {
    case "raw":
    case "potential":
      return 1;
    case "trial":
      return 2;
    case "conversion":
    case "enrolled":
    case "waiting_class":
      return 3;
    default:
      return 1;
  }
}

// Nhãn chi tiết (sub-label) hiển thị bên dưới nhãn giai đoạn lớn, giữ lại đủ
// thông tin nghiệp vụ chi tiết mà Sale vẫn cần (vd phân biệt "chưa liên hệ"
// và "đã liên hệ" trong cùng Giai đoạn 1).
export const STAGE_DETAIL_LABEL: Record<LeadStage, string> = {
  raw: "Lead thô — chưa liên hệ",
  potential: "Đã liên hệ — xác thực nhu cầu",
  trial: "Đang học thử",
  conversion: "Đã học thử — chờ chốt đơn",
  enrolled: "Đã chốt — vào lớp",
  waiting_class: "Đã chốt — chờ xếp lớp",
};

// Lead có thể "Chốt đơn" (ghi danh & chuyển đổi) ngay từ Giai đoạn 1 (bỏ qua
// học thử) hoặc từ Giai đoạn 2 (trial/conversion, sau khi đã học thử).
export function canStartConversion(stage: LeadStage): boolean {
  return stage === "potential" || stage === "trial" || stage === "conversion";
}

// Phòng vệ khi đọc STAGE_DETAIL_LABEL[stage] trực tiếp: `stage` được khai
// báo kiểu LeadStage nhưng dữ liệu THẬT trên Supabase có thể còn giá trị cũ
// "inquiry" (trước khi tách N1/N2, migration dọn dữ liệu chưa chạy) — index
// thẳng vào Record sẽ ra `undefined` (không crash, nhưng thiếu nhãn ngoài
// UI). Dùng hàm này thay vì index trực tiếp để luôn có nhãn hợp lý.
export function getStageDetailLabel(stage: LeadStage): string {
  return STAGE_DETAIL_LABEL[stage] || "Chưa xác định rõ giai đoạn";
}
