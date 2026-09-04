"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeadPayload {
  fullName: string;
  centerName: string;
  phone: string;
  email: string;
  scale: string;
  category?: string;
  note?: string;
}

export async function submitLead(payload: LeadPayload) {
  try {
    console.log("[EduCenter Lead Received]:", {
      ...payload,
      submittedAt: new Date().toISOString(),
    });

    // Cố gắng ghi vào bảng leads trong Supabase nếu bảng tồn tại
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("leads").insert({
        full_name: payload.fullName,
        center_name: payload.centerName,
        phone: payload.phone,
        email: payload.email,
        scale: payload.scale,
        category: payload.category || "general",
        note: payload.note || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.warn("[EduCenter Lead Supabase Note]: Table 'leads' might not exist yet, lead logged safely to console/server.", error.message);
      }
    } catch (dbErr) {
      console.warn("[EduCenter Lead DB Fallback]: Logged to console.", dbErr);
    }

    return {
      success: true,
      message: "Đăng ký thành công! Đội ngũ EduCenter EMS sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi gửi thông tin";
    return {
      success: false,
      message,
    };
  }
}
