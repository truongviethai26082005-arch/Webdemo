import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface GuardContext {
  supabase: SupabaseServerClient;
  user: User;
  role: UserRole;
}

export type GuardResult =
  | {
      authorized: true;
      context: GuardContext;
      error?: never;
    }
  | {
      authorized: false;
      error: string;
      context?: never;
    };

/**
 * Xác định vai trò của user theo đúng thứ tự ưu tiên (Fail-closed - AGENTS.md mục 5.2):
 * 1. Tra bảng `profiles` theo userId -> nếu có role, trả về role đó (admin | teacher | sale).
 * 2. Nếu không có ở bước 1, tra bảng `students` theo cột auth_user_id = userId -> nếu có, trả về "student".
 * 3. Nếu không có ở cả 2 bước -> trả về null. Tuyệt đối không gán bất kỳ role mặc định nào.
 */
async function resolveRole(
  supabase: SupabaseServerClient,
  userId: string
): Promise<UserRole | null> {
  // Bước 1: Tra bảng profiles (admin | teacher | sale)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role) {
    return profile.role as UserRole;
  }

  // Bước 2: Tra bảng students theo auth_user_id (student)
  try {
    // NOTE: Bảng `students` hiện có thể CHƯA có cột auth_user_id (chờ migration DB).
    // Fallback an toàn: nếu cột chưa tồn tại hoặc truy vấn lỗi, coi như không tìm thấy (null) thay vì crash.
    // Cần bật lại logic đầy đủ sau khi migration DB:
    // ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    // CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (!studentError && student) {
      return "student";
    }
  } catch {
    // Fallback an toàn nếu schema chưa có cột auth_user_id
    return null;
  }

  // Bước 3: Không tìm thấy ở cả 2 bảng -> từ chối, trả về null
  return null;
}

/**
 * Kiểm tra xác thực và phân quyền theo danh sách role được phép.
 * Trả về discriminated union (GuardResult):
 * - authorized: true -> context chứa { supabase, user, role }
 * - authorized: false -> error thông báo lý do từ chối ("Chưa đăng nhập" hoặc "Không có quyền truy cập")
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<GuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      error: "Chưa đăng nhập",
    };
  }

  const role = await resolveRole(supabase, user.id);

  if (!role || !allowedRoles.includes(role)) {
    return {
      authorized: false,
      error: "Không có quyền truy cập",
    };
  }

  return {
    authorized: true,
    context: {
      supabase,
      user,
      role,
    },
  };
}
