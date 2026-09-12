"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/guards";

export interface AccountListItem {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  phone: string | null;
  created_at: string;
}

// Danh sách toàn bộ tài khoản nhân sự nội bộ (Admin/Teacher/Sale) kèm email đăng nhập
// (email chỉ nằm ở auth.users, không có trong bảng profiles).
export async function getAllAccounts(): Promise<AccountListItem[]> {
  const guard = await requireRole(["admin"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (error || !profiles) return [];

  const adminClient = createAdminClient();
  const { data: userList } = await adminClient.auth.admin.listUsers();
  const emailMap = new Map((userList?.users || []).map((u) => [u.id, u.email || null]));

  return profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    phone: p.phone,
    role: p.role,
    created_at: p.created_at,
    email: emailMap.get(p.id) ?? null,
  }));
}
