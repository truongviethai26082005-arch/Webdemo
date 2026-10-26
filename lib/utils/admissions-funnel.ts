import { LeadStage, LeadStatus } from "@/types/database";

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

// Lựa chọn bộ lọc chi tiết ("Trạng thái") hiện đúng theo Giai đoạn lớn đang
// chọn — tránh chọn ra tổ hợp không tồn tại thật (VD Giai đoạn 1 + "Đã chốt
// học" luôn ra danh sách rỗng). Giá trị lọc dùng chung 1 trường (không tách
// riêng theo `status`/`stage`) vì 2 tập giá trị LeadStatus/LeadStage không hề
// trùng chữ nhau, nên so khớp với CẢ HAI cột là an toàn:
// - Giai đoạn 1 (raw/potential): lọc theo cột `status` — đây là giai đoạn Sale
//   cần phân biệt kỹ trạng thái chăm sóc (mới nhận/đã liên hệ/hẹn gọi
//   lại/không nhu cầu), vì bản thân `stage` chỉ có 2 giá trị, không đủ chi
//   tiết.
// - Giai đoạn 2 (trial): chỉ có đúng 1 giá trị `stage` khả dĩ, không cần lọc
//   thêm — vẫn để 1 lựa chọn duy nhất cho rõ ràng, dù về mặt lọc không có tác
//   dụng thu hẹp gì.
// - Giai đoạn 3 (conversion/enrolled/waiting_class): chỉ 1 lựa chọn "Đã chốt
//   học", lọc theo `status === "converted"` — đúng nghĩa "đã chuyển khoản
//   thành công tiền học", gộp chung cả 2 stage con enrolled/waiting_class
//   (createEnrollmentFromLead() luôn set status="converted" cho cả 2 trường
//   hợp, xem lib/actions/admissions.ts dòng ~977). Lead còn đang ở stage
//   "conversion" (đã học thử, chưa thanh toán xong) chỉ hiện khi chọn "Tất
//   cả trạng thái".
export interface GroupDetailFilterOption {
  value: LeadStatus | LeadStage;
  label: string;
}

export const GROUP_DETAIL_FILTER_OPTIONS: Record<FunnelGroup, GroupDetailFilterOption[]> = {
  1: [
    { value: "new", label: "Mới nhận" },
    { value: "callback", label: "Hẹn gọi lại" },
    { value: "contacted", label: "Đã liên hệ" },
    { value: "no_demand", label: "Không nhu cầu" },
  ],
  2: [{ value: "trial", label: "Đang học thử" }],
  3: [{ value: "converted", label: "Đã chốt học" }],
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
