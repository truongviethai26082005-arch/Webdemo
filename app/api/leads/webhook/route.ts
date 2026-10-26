import { createLeadFromWebhook } from "@/lib/actions/admissions";
import { LeadSource } from "@/types/database";

// Webhook công khai nhận Lead từ nguồn bên ngoài (Google Apps Script gắn với
// Google Form) — KHÔNG có phiên đăng nhập Sale, nên toàn bộ logic nghiệp vụ
// (validate, tạo Lead) nằm ở createLeadFromWebhook() (lib/actions/admissions.ts,
// Sale sở hữu), route này CHỈ làm 2 việc: xác thực secret token + chuyển
// tiếp request. Route API (không phải Server Action) là lựa chọn BẮT BUỘC ở
// đây vì Google Apps Script chỉ gọi được HTTP thường (UrlFetchApp), không
// gọi được giao thức Server Action nội bộ của Next.js.
export async function POST(request: Request) {
  const secret = process.env.LEADS_WEBHOOK_SECRET;

  // Fail-closed: chưa cấu hình secret trong .env.local -> luôn từ chối,
  // KHÔNG bao giờ coi "thiếu cấu hình" là "cho phép mọi request" (đúng
  // AGENTS.md Mục 5.1).
  if (!secret) {
    return Response.json(
      { error: "Webhook chưa được cấu hình (thiếu biến môi trường LEADS_WEBHOOK_SECRET)" },
      { status: 500 }
    );
  }

  const provided = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!provided || provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const result = await createLeadFromWebhook({
    fullName: String(body.fullName || ""),
    phone: String(body.phone || ""),
    zalo: body.zalo ? String(body.zalo) : undefined,
    facebookUrl: body.facebookUrl ? String(body.facebookUrl) : undefined,
    parentName: body.parentName ? String(body.parentName) : undefined,
    email: body.email ? String(body.email) : undefined,
    courseInterest: body.courseInterest ? String(body.courseInterest) : undefined,
    targetGoal: body.targetGoal ? String(body.targetGoal) : undefined,
    source: body.source as LeadSource,
    assignedSaleName: body.assignedSaleName ? String(body.assignedSaleName) : undefined,
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json(result, { status: 200 });
}
