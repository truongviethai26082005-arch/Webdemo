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

export interface StudentAccountItem {
  id: string; // id trong bảng students (không phải auth_user_id)
  full_name: string;
  email: string | null;
  parent_phone: string | null;
}

// Danh sách học sinh ĐÃ có tài khoản đăng nhập, kèm email thật (email chỉ nằm
// ở auth.users, không có trong bảng students). Cho phép cả Admin và Sale gọi
// (khác `getAllAccounts()` — chỉ Admin, vì đó là roster nhân sự nội bộ) vì
// Sale là người trực tiếp làm việc/hỗ trợ học sinh, cần tra được email đăng
// nhập để thông báo/hỗ trợ (thống nhất với chủ dự án 2026-09-14).
export async function getStudentAccountsOverview(): Promise<StudentAccountItem[]> {
  const guard = await requireRole(["admin", "sale"]);
  if (!guard.authorized) return [];
  const { supabase } = guard.context;

  const { data: students, error } = await supabase
    .from("students")
    .select("id, full_name, parent_phone, auth_user_id")
    .not("auth_user_id", "is", null)
    .order("full_name", { ascending: true });

  if (error || !students) return [];

  const adminClient = createAdminClient();
  const { data: userList } = await adminClient.auth.admin.listUsers();
  const emailMap = new Map((userList?.users || []).map((u) => [u.id, u.email || null]));

  return students.map((s) => ({
    id: s.id,
    full_name: s.full_name,
    parent_phone: s.parent_phone,
    email: s.auth_user_id ? emailMap.get(s.auth_user_id) ?? null : null,
  }));
}
