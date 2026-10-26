"use server";

import { requireRole } from "@/lib/auth/guards";
import { getAnalyticsReportData } from "@/lib/actions/analytics";
import {
  BREAK_EVEN_MIN_STUDENTS,
  STANDARD_MIN_STUDENTS,
  OPENING_WINDOW_DAYS,
  addDays,
  classSizeLight,
  vietnamToday,
} from "@/lib/utils/traffic-light";

// Bảng cảnh báo Đèn giao thông cho Admin (hiển thị ở Dashboard) — CHỈ ĐỌC,
// không ghi gì vào DB. Mỗi cảnh báo có `href` trỏ thẳng tới trang xử lý.
// Ngưỡng đã chốt với chủ dự án (2026-09-28):
// - Sĩ số: < 8 HS khi còn ≤ 3 ngày khai giảng = đỏ; 8–11 = vàng; ≥ 12 = xanh.
// - Ví buổi học: ≤ 0 = đỏ; 1–2 = vàng (giữ đúng ngưỡng ≤ 2 của AGENTS.md Mục 6).
// - Ca "trễ điểm danh": quá 10 phút sau giờ bắt đầu mà GV chưa lưu bảng điểm
//   danh (saveAttendanceSheet() chuyển ca sang 'completed' → còn 'scheduled' = chưa lưu).
// - Điểm danh đúng giờ: GV lưu lần đầu trong 30 phút sau khi ca kết thúc.

const LOW_BALANCE_MAX = 2;
const LATE_START_MINUTES = 10;
const ON_TIME_AFTER_END_MINUTES = 30;
const ATTENDANCE_RATE_TARGET = 90;
const LOOKBACK_DAYS = 30;

export type AlertLight = "red" | "yellow" | "green";

export interface AlertItem {
  id: string;
  light: AlertLight;
  category: string;
  title: string;
  detail?: string;
  href: string;
}

export interface LateSession {
  id: string;
  classId: string;
  className: string;
  teacherName: string | null;
  startTime: string;
  minutesLate: number;
}

export interface OperationAlerts {
  red: AlertItem[];
  yellow: AlertItem[];
  green: AlertItem[];
}

// session_date + giờ (HH:MM hoặc HH:MM:SS) theo giờ Việt Nam → mốc thời gian (ms)
function vietnamTimestamp(dateStr: string, timeStr: string): number {
  return Date.parse(`${dateStr}T${timeStr.slice(0, 5)}:00+07:00`);
}

function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

/**
 * Các ca hôm nay đã quá 10 phút so với giờ bắt đầu mà GV chưa lưu điểm danh.
 * Dùng cho thông báo nổi lên khi Admin mở/tải lại trang.
 */
export async function getLateAttendanceSessions(): Promise<{ error: string } | { sessions: LateSession[] }> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const today = vietnamToday();
  const { data, error } = await supabase
    .from("class_sessions")
    .select("id, class_id, session_date, start_time, status, class:classes(name), teacher:profiles(full_name)")
    .eq("session_date", today)
    .eq("status", "scheduled");

  if (error) return { error: `Không thể tải ca học hôm nay: ${error.message}` };

  const now = Date.now();
  const sessions: LateSession[] = [];
  // DB có thể chứa nhiều bản ghi class_sessions trùng (cùng lớp, cùng ngày, cùng
  // giờ) — gộp lại theo đúng cách Dashboard vốn dedupe ca hôm nay.
  const seen = new Set<string>();
  for (const s of data || []) {
    if (!s.start_time) continue;
    const key = `${s.class_id}|${s.start_time}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const minutesLate = Math.floor((now - vietnamTimestamp(s.session_date, s.start_time)) / 60000);
    if (minutesLate <= LATE_START_MINUTES) continue;
    sessions.push({
      id: s.id,
      classId: s.class_id,
      className: one<any>(s.class)?.name || "Lớp không xác định",
      teacherName: one<any>(s.teacher)?.full_name || null,
      startTime: s.start_time.slice(0, 5),
      minutesLate,
    });
  }
  sessions.sort((a, b) => b.minutesLate - a.minutesLate);
  return { sessions };
}

export async function getOperationAlerts(): Promise<{ error: string } | OperationAlerts> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  const today = vietnamToday();
  const lookbackFrom = addDays(today, -LOOKBACK_DAYS);
  const red: AlertItem[] = [];
  const yellow: AlertItem[] = [];
  const green: AlertItem[] = [];

  const [enrollmentsRes, classesRes, attendanceRes, completedRes, pendingRes, lateRes, analytics] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id, student_id, class_id, balance_sessions, student:students(full_name), class:classes(name)")
        .eq("status", "active"),
      supabase.from("classes").select("id, name, room, start_date, end_date"),
      supabase
        .from("attendance")
        .select("student_id, status, session:class_sessions!inner(class_id, session_date)")
        .gte("session.session_date", addDays(today, -60)),
      supabase
        .from("class_sessions")
        .select("id, session_date, end_time, attendance(created_at)")
        .eq("status", "completed")
        .gte("session_date", lookbackFrom)
        .lte("session_date", today),
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "pending"),
      getLateAttendanceSessions(),
      getAnalyticsReportData(),
    ]);

  const firstError = [enrollmentsRes, classesRes, attendanceRes, completedRes, pendingRes].find((r) => r.error)?.error;
  if (firstError) return { error: `Không thể tải dữ liệu cảnh báo: ${firstError.message}` };
  if ("error" in lateRes) return { error: lateRes.error };

  const enrollments = enrollmentsRes.data || [];

  // ─── 1. Ví buổi học ───
  for (const e of enrollments) {
    const balance = Number(e.balance_sessions) || 0;
    if (balance > LOW_BALANCE_MAX) continue;
    const studentName = one<any>(e.student)?.full_name || "Học viên";
    const className = one<any>(e.class)?.name || "lớp không xác định";
    (balance <= 0 ? red : yellow).push({
      id: `balance-${e.id}`,
      light: balance <= 0 ? "red" : "yellow",
      category: "Ví buổi học",
      title: `${studentName} — ${className}`,
      detail: balance < 0 ? `Âm ${Math.abs(balance)} buổi` : `Còn ${balance} buổi`,
      href: `/admin/classes/${e.class_id}`,
    });
  }

  // ─── 2. Sĩ số lớp (chỉ lớp chưa bế giảng) ───
  const activeCount = new Map<string, number>();
  for (const e of enrollments) activeCount.set(e.class_id, (activeCount.get(e.class_id) || 0) + 1);

  for (const c of classesRes.data || []) {
    if (c.end_date && c.end_date < today) continue;

    // Giữ lại cảnh báo "Chưa xếp phòng" vốn có ở Dashboard, xếp vào đèn Vàng
    const room = (c.room || "").trim().toLowerCase();
    if (!room || room === "chưa xếp" || room === "chưa xếp phòng") {
      yellow.push({
        id: `room-${c.id}`,
        light: "yellow",
        category: "Phòng học",
        title: `${c.name}: chưa xếp phòng`,
        href: `/admin/classes/${c.id}`,
      });
    }

    const count = activeCount.get(c.id) || 0;
    const light = classSizeLight(count, c.start_date, today);
    if (!light) continue;
    if (light === "red") {
      red.push({
        id: `class-${c.id}`,
        light: "red",
        category: "Sĩ số lớp",
        title: `${c.name}: ${count} HS, khai giảng ${c.start_date}`,
        detail: `Dưới ngưỡng hòa vốn ${BREAK_EVEN_MIN_STUDENTS} HS khi còn ≤ ${OPENING_WINDOW_DAYS} ngày khai giảng`,
        href: `/admin/classes/${c.id}`,
      });
    } else if (light === "yellow") {
      yellow.push({
        id: `class-${c.id}`,
        light: "yellow",
        category: "Sĩ số lớp",
        title: `${c.name}: ${count} HS`,
        detail: `Đạt hòa vốn nhưng chưa đủ chuẩn ${STANDARD_MIN_STUDENTS}–16 HS`,
        href: `/admin/classes/${c.id}`,
      });
    } else {
      green.push({
        id: `class-${c.id}`,
        light: "green",
        category: "Sĩ số lớp",
        title: `${c.name}: ${count} HS`,
        href: `/admin/classes/${c.id}`,
      });
    }
  }

  // ─── 3. Vắng 2 buổi gần nhất liên tiếp không phép + tỷ lệ chuyên cần 30 ngày ───
  const activeEnrollmentKeys = new Map<string, any>();
  for (const e of enrollments) activeEnrollmentKeys.set(`${e.student_id}|${e.class_id}`, e);

  const history = new Map<string, { date: string; status: string }[]>();
  let presentCount = 0;
  let attendanceTotal = 0;
  for (const a of attendanceRes.data || []) {
    const session = one<any>(a.session);
    if (!session) continue;
    const key = `${a.student_id}|${session.class_id}`;
    if (!history.has(key)) history.set(key, []);
    history.get(key)!.push({ date: session.session_date, status: a.status });
    if (session.session_date >= lookbackFrom) {
      attendanceTotal++;
      if (a.status === "present") presentCount++;
    }
  }

  for (const [key, records] of history) {
    const enrollment = activeEnrollmentKeys.get(key);
    if (!enrollment) continue;
    records.sort((x, y) => (x.date < y.date ? 1 : -1));
    if (records.length >= 2 && records[0].status === "absent_unexcused" && records[1].status === "absent_unexcused") {
      red.push({
        id: `absent-${key}`,
        light: "red",
        category: "Chuyên cần",
        title: `${one<any>(enrollment.student)?.full_name || "Học viên"} — ${one<any>(enrollment.class)?.name || "lớp không xác định"}`,
        detail: `Vắng không phép 2 buổi liên tiếp (gần nhất ${records[0].date})`,
        href: `/admin/classes/${enrollment.class_id}`,
      });
    }
  }

  if (attendanceTotal > 0) {
    const rate = Math.round((presentCount / attendanceTotal) * 100);
    if (rate >= ATTENDANCE_RATE_TARGET) {
      green.push({
        id: "attendance-rate",
        light: "green",
        category: "Chuyên cần",
        title: `Tỷ lệ chuyên cần ${LOOKBACK_DAYS} ngày: ${rate}%`,
        detail: `${presentCount}/${attendanceTotal} lượt có mặt (mục tiêu ≥ ${ATTENDANCE_RATE_TARGET}%)`,
        href: "/admin/attendance",
      });
    }
  }

  // ─── 4. Điểm danh: ca trễ hôm nay + tỷ lệ lưu đúng hạn 30 ngày ───
  for (const s of lateRes.sessions) {
    red.push({
      id: `late-${s.id}`,
      light: "red",
      category: "Điểm danh",
      title: `${s.className} (${s.startTime}) — trễ ${s.minutesLate} phút chưa điểm danh`,
      detail: s.teacherName ? `GV: ${s.teacherName}` : "Chưa có GV phụ trách",
      href: `/admin/classes/${s.classId}`,
    });
  }

  let savedSessions = 0;
  let onTimeSessions = 0;
  for (const s of completedRes.data || []) {
    const rows = (s.attendance || []) as { created_at: string }[];
    if (!rows.length || !s.end_time) continue;
    savedSessions++;
    const firstSaved = Math.min(...rows.map((r) => Date.parse(r.created_at)));
    const deadline = vietnamTimestamp(s.session_date, s.end_time) + ON_TIME_AFTER_END_MINUTES * 60000;
    if (firstSaved <= deadline) onTimeSessions++;
  }
  if (savedSessions > 0 && onTimeSessions === savedSessions) {
    green.push({
      id: "attendance-on-time",
      light: "green",
      category: "Điểm danh",
      title: `100% ca được điểm danh đúng hạn (${LOOKBACK_DAYS} ngày)`,
      detail: `${savedSessions} ca, lưu trong ${ON_TIME_AFTER_END_MINUTES} phút sau khi kết thúc`,
      href: "/admin/attendance",
    });
  }

  // ─── 5. Hóa đơn VietQR chờ đối soát ───
  const pendingCount = pendingRes.count || 0;
  if (pendingCount > 0) {
    yellow.push({
      id: "invoices-pending",
      light: "yellow",
      category: "Tài chính",
      title: `${pendingCount} hóa đơn chờ xác nhận thanh toán`,
      detail: "Rà soát sao kê ngân hàng rồi xác nhận",
      href: "/admin/finance",
    });
  }

  // ─── 6. Dòng tiền ròng lũy kế từ đầu năm tới tháng hiện tại ───
  // Tái dùng đúng số liệu của trang Báo cáo (getAnalyticsReportData), không tính lại riêng.
  if (analytics) {
    const currentMonth = new Date().getMonth() + 1;
    const cumulative = analytics.cashFlow12Months
      .filter((m) => m.month <= currentMonth)
      .reduce((sum, m) => sum + m.netCashFlow, 0);
    const formatted = new Intl.NumberFormat("vi-VN").format(cumulative);
    if (cumulative < 0) {
      red.push({
        id: "cashflow",
        light: "red",
        category: "Tài chính",
        title: `Dòng tiền ròng lũy kế âm: ${formatted}đ`,
        detail: `Từ tháng 1 tới tháng ${currentMonth}`,
        href: "/admin/analytics",
      });
    } else if (cumulative > 0) {
      green.push({
        id: "cashflow",
        light: "green",
        category: "Tài chính",
        title: `Dòng tiền ròng lũy kế dương: ${formatted}đ`,
        detail: `Từ tháng 1 tới tháng ${currentMonth}`,
        href: "/admin/analytics",
      });
    }
  }

  return { red, yellow, green };
}
