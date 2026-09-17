import { TrialResult } from "@/types/database";

// Gợi ý khóa học sau khi chấm điểm học thử ("test đầu vào"), dựa trên đúng
// trường xếp loại (`TrialResult`) đã có sẵn từ trước — không thêm cột/bảng
// DB mới. Đây chỉ là GỢI Ý THAM KHẢO hiển thị cho Sale, KHÔNG được dùng để
// tự động chọn lớp thay Sale (đúng AGENTS.md Mục 11.1 — không tự bịa/tự
// chọn mặc định khi thiếu xác nhận thật của con người).
export interface CourseSuggestion {
  label: string;
  levelKeywords: string[];
}

const SUGGESTION_BY_RESULT: Record<TrialResult, CourseSuggestion> = {
  excellent: {
    label: "Năng lực Xuất sắc — gợi ý lớp Nâng cao / Chuyên sâu",
    levelKeywords: ["nâng cao", "chuyên sâu"],
  },
  good: {
    label: "Năng lực Khá/Tốt — gợi ý lớp Nâng cao hoặc Tiêu chuẩn",
    levelKeywords: ["nâng cao", "tiêu chuẩn"],
  },
  average: {
    label: "Năng lực Trung bình — gợi ý lớp Tiêu chuẩn / Cơ bản",
    levelKeywords: ["tiêu chuẩn", "cơ bản"],
  },
  weak: {
    label: "Năng lực còn Yếu — gợi ý lớp Củng cố nền tảng",
    levelKeywords: ["củng cố", "nền tảng", "cơ bản"],
  },
};

export function getCourseSuggestion(result?: TrialResult | null): CourseSuggestion | null {
  if (!result) return null;
  return SUGGESTION_BY_RESULT[result] || null;
}

// So khớp text đơn giản (không phân biệt hoa/thường) giữa tên lớp thật (chuỗi
// tự do, VD "Toán 7 Nâng cao") với môn Lead quan tâm + mức độ gợi ý — chỉ để
// làm nổi bật lựa chọn tham khảo trong dropdown, Sale vẫn phải tự bấm chọn.
export function isClassNameMatchingSuggestion(
  className: string,
  suggestion: CourseSuggestion | null,
  courseInterest?: string | null
): boolean {
  if (!suggestion || !courseInterest?.trim()) return false;
  const name = className.toLowerCase();
  const matchesInterest = name.includes(courseInterest.toLowerCase().trim());
  const matchesLevel = suggestion.levelKeywords.some((k) => name.includes(k));
  return matchesInterest && matchesLevel;
}
