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

    // Cố gắng ghi vào bảng landing_page_leads trong Supabase nếu bảng tồn tại.
    // LƯU Ý: KHÔNG dùng tên bảng "leads" — đó là tên dành cho bảng lead của
    // phễu Tuyển sinh phụ huynh (phân hệ Sale, xem docs/context-sale.md), có
    // schema hoàn toàn khác (form này là lead B2B "trung tâm muốn mua phần
    // mềm", không phải phụ huynh/học sinh). Dùng chung tên sẽ khiến form
    // landing page này âm thầm ghi dữ liệu sai định dạng vào bảng lead thật
    // của Sale ngay khi bảng đó được tạo.
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("landing_page_leads").insert({
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
        console.warn("[EduCenter Lead Supabase Note]: Table 'landing_page_leads' might not exist yet, lead logged safely to console/server.", error.message);
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
