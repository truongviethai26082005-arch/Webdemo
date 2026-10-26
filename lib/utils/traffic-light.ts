// Ngưỡng Đèn giao thông Admin (đã chốt với chủ dự án 2026-09-28). Dùng chung
// cho trang Cảnh báo Vận hành (lib/actions/operation-alerts.ts) và các trang
// Admin tô màu theo đèn, để mọi nơi phân loại giống hệt nhau.

export type TrafficLight = "red" | "yellow" | "green";

export const BREAK_EVEN_MIN_STUDENTS = 8; // Ngưỡng hòa vốn nội bộ
export const STANDARD_MIN_STUDENTS = 12; // Chuẩn TalkClass 12–16 HS/lớp
export const OPENING_WINDOW_DAYS = 3; // Mốc T-3 ngày trước khai giảng

export function vietnamToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().split("T")[0];
}

/**
 * Đèn sĩ số của 1 lớp chưa bế giảng:
 * - Đỏ: < 8 HS khi còn ≤ 3 ngày tới khai giảng.
 * - Vàng: 8–11 HS.
 * - Xanh: ≥ 12 HS.
 * - null: < 8 HS nhưng không nằm trong mốc T-3 (bảng đèn không xếp màu).
 */
export function classSizeLight(
  count: number,
  startDate: string | null | undefined,
  today: string = vietnamToday()
): TrafficLight | null {
  if (count >= STANDARD_MIN_STUDENTS) return "green";
  if (count >= BREAK_EVEN_MIN_STUDENTS) return "yellow";
  const opensSoon =
    !!startDate && startDate >= today && startDate <= addDays(today, OPENING_WINDOW_DAYS);
  return opensSoon ? "red" : null;
}
