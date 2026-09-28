"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { CenterBankSettings } from "@/lib/utils/vietqr";

// Trả về `null` khi CHƯA cấu hình / lỗi truy vấn — KHÔNG còn tự động thay
// bằng 1 tài khoản ngân hàng "mặc định" khác (dù trùng dữ liệu thật hiện tại,
// vẫn là hành vi nguy hiểm: nếu sau này trung tâm đổi tài khoản ngân hàng mà
// đúng lúc query lỗi, khách hàng có thể bị hiện nhầm mã QR tài khoản CŨ mà
// không có cảnh báo gì — vi phạm AGENTS.md Mục 11.1). Nơi gọi hàm này BẮT
// BUỘC tự xử lý trường hợp `null` (hiện "Chưa cấu hình tài khoản ngân hàng"),
// không được giả định luôn có dữ liệu.
export async function getCenterBankSettings(): Promise<CenterBankSettings | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("center_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.bank_account_no) {
      return null;
    }

    return {
      bank_id: data.bank_id,
      bank_account_no: data.bank_account_no,
      bank_account_name: data.bank_account_name,
      bank_name: data.bank_name || (data.bank_id === "TCB" ? "Techcombank (TCB)" : data.bank_id),
    };
  } catch (err) {
    console.error("Error in getCenterBankSettings:", err);
    return null;
  }
}

// Chi phí cố định hàng tháng (thuê mặt bằng, điện nước...) dùng để tính "Lợi
// nhuận gộp" ở /admin/analytics. `null` nghĩa là CHƯA CẤU HÌNH — không tự
// bịa số (AGENTS.md Mục 11.1), UI phải tự hiện rõ "Chưa cấu hình".
export async function getCenterFixedCost(): Promise<number | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("center_settings")
      .select("fixed_cost")
      .limit(1)
      .maybeSingle();

    return typeof data?.fixed_cost === "number" ? data.fixed_cost : null;
  } catch (err) {
    console.error("Error in getCenterFixedCost:", err);
    return null;
  }
}

export async function updateCenterFixedCost(amount: number) {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return { error: guard.error };
  const { supabase } = guard.context;

  if (amount === null || amount === undefined || isNaN(amount) || amount < 0) {
    return { error: "Vui lòng nhập số tiền hợp lệ" };
  }

  const { data: existing } = await supabase.from("center_settings").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("center_settings").update({ fixed_cost: amount }).eq("id", existing.id)
    : await supabase.from("center_settings").insert({ fixed_cost: amount });

  if (error) return { error: `Không thể lưu chi phí cố định: ${error.message}` };

  revalidatePath("/admin/analytics");
  return { success: true };
}
