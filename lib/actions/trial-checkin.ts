"use server";

import { createClient } from "@/lib/supabase/server";

// Server Actions cho luồng QR check-in điểm danh học thử — CÔNG KHAI, không
// yêu cầu đăng nhập (học sinh học thử chưa có tài khoản, xem AGENTS.md mục
// 9). Toàn bộ logic thật nằm trong 2 hàm SECURITY DEFINER phía Supabase
// (checkin_trial_lead, get_trial_slot_public_info — xem migration
// 20260916_admissions_checkin_and_entrance_test.sql) để tránh phải mở RLS
// SELECT rộng cho vai trò anon trên các bảng chứa PII (leads, lead_trials).

export interface TrialSlotPublicInfoResult {
  success: boolean;
  message?: string;
  subject?: string;
  teacherName?: string | null;
  room?: string | null;
  dayOfWeek?: string;
  timeSlot?: string;
}

export async function getTrialSlotPublicInfo(checkinToken: string): Promise<TrialSlotPublicInfoResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_trial_slot_public_info", {
    p_checkin_token: checkinToken,
  });

  if (error) {
    return { success: false, message: "Không thể tải thông tin ca học thử. Vui lòng thử lại." };
  }

  return data as TrialSlotPublicInfoResult;
}

export interface CheckinTrialResult {
  success: boolean;
  already?: boolean;
  message: string;
  leadName?: string;
  subject?: string;
}

export async function checkinTrialLead(checkinToken: string, phone: string): Promise<CheckinTrialResult> {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    return { success: false, message: "Vui lòng nhập số điện thoại đã đăng ký" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkin_trial_lead", {
    p_checkin_token: checkinToken,
    p_phone: trimmedPhone,
  });

  if (error) {
    return { success: false, message: "Có lỗi khi điểm danh. Vui lòng thử lại hoặc báo nhân viên tư vấn." };
  }

  return data as CheckinTrialResult;
}
