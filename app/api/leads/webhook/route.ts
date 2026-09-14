import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// CORS Headers cho phép gửi request từ Landing Page hoặc form quảng cáo ngoài
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, any> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } else {
      // Fallback parse text
      try {
        body = JSON.parse(await request.text());
      } catch {
        return NextResponse.json(
          { error: "Định dạng dữ liệu không hợp lệ. Vui lòng gửi JSON hoặc Form data." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Trích xuất các trường thông tin (hỗ trợ cả camelCase và snake_case)
    const fullName = (
      body.fullName ||
      body.full_name ||
      body.studentName ||
      body.student_name ||
      body.name
    )?.trim();

    const phone = (
      body.phone ||
      body.phoneNumber ||
      body.phone_number ||
      body.parentPhone ||
      body.parent_phone
    )?.trim();

    const parentName = (body.parentName || body.parent_name)?.trim() || null;
    const email = (body.email)?.trim() || null;
    const zalo = (body.zalo)?.trim() || null;
    const grade = (body.grade || body.classLevel || body.class_level)?.trim() || null;
    const courseInterest = (
      body.courseInterest ||
      body.course_interest ||
      body.subject ||
      body.targetSubject ||
      body.target_subject
    )?.trim() || null;
    const targetGoal = (body.targetGoal || body.target_goal || body.goal)?.trim() || null;
    const source = (body.source || "facebook_ads").trim();
    const referrerName = (body.referrerName || body.referrer_name || body.campaign)?.trim() || null;
    const note = (body.note || body.message || body.comments)?.trim() || null;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc: fullName (họ tên) và phone (số điện thoại)" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Dùng Admin Client để ghi vào bảng leads mà không yêu cầu session login (Web-to-Lead công khai)
    const adminClient = createAdminClient();

    const insertLeadPayload = {
      full_name: fullName,
      parent_name: parentName,
      phone: phone,
      email: email,
      zalo: zalo,
      grade: grade,
      course_interest: courseInterest,
      target_goal: targetGoal,
      source: source,
      referrer_name: referrerName,
      note: note ? `[Web-to-Lead]: ${note}` : "[Đăng ký từ Web Form / Chiến dịch Marketing]",
      stage: "inquiry",
      status: "new",
      missed_calls_count: 0,
    };

    const { data: lead, error: leadError } = await adminClient
      .from("leads")
      .insert(insertLeadPayload)
      .select()
      .single();

    if (leadError || !lead) {
      console.error("Lỗi insert lead từ webhook:", leadError?.message);
      return NextResponse.json(
        { error: `Không thể lưu Lead: ${leadError?.message || "Lỗi cơ sở dữ liệu"}` },
        { status: 500, headers: corsHeaders }
      );
    }

    // Tự động ghi 1 dòng nhật ký tương tác đầu tiên
    await adminClient.from("lead_interactions").insert({
      lead_id: lead.id,
      channel: "call",
      content: `Tiếp nhận Lead tự động từ Web-to-Lead API (Nguồn: ${source}${referrerName ? ` - Chiến dịch: ${referrerName}` : ""}).`,
      is_missed_call: false,
    });

    // Làm mới cache cho phân hệ Sale
    revalidatePath("/sale/admissions");
    revalidatePath("/sale/daily-tasks");

    return NextResponse.json(
      {
        success: true,
        message: "Tiếp nhận Lead thành công! Đã đưa vào phễu tư vấn Tuyển sinh.",
        leadId: lead.id,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error("Lỗi ngoại lệ trong Web-to-Lead webhook:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lỗi server nội bộ" },
      { status: 500, headers: corsHeaders }
    );
  }
}
