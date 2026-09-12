"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Profile, UserRole } from "@/types/database";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ Email và Mật khẩu" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      error: error?.message === "Invalid login credentials"
        ? "Email hoặc mật khẩu không chính xác"
        : (error?.message || "Không thể xác thực người dùng")
    };
  }

  // 1. Kiểm tra bảng profiles (Nhân sự: admin, teacher, sale)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  let role: UserRole | null = null;
  let redirectUrl: string | null = null;

  if (profile?.role) {
    role = profile.role as UserRole;
    if (role === "admin") redirectUrl = "/admin/dashboard";
    else if (role === "sale") redirectUrl = "/sale/admissions";
    else if (role === "teacher") redirectUrl = "/teacher/schedule";
  } else {
    // 2. Nếu không có trong profiles, kiểm tra bảng students theo auth_user_id
    try {
      // NOTE: Bảng `students` hiện có thể CHƯA có cột auth_user_id (chờ migration).
      // Fallback an toàn: nếu cột chưa tồn tại hoặc truy vấn lỗi, coi như không tìm thấy (null) thay vì crash.
      // Cần bật lại logic đầy đủ sau khi migration DB:
      // ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
      // CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();

      if (!studentError && student) {
        role = "student";
        redirectUrl = "/student/dashboard";
      }
    } catch {
      // Fallback an toàn nếu có lỗi schema hoặc truy vấn
      role = null;
    }
  }

  // 3. Nếu không có ở cả 2 bước trên -> KHÔNG gán role nào, từ chối truy cập và đăng xuất session
  if (!role || !redirectUrl) {
    await supabase.auth.signOut();
    return {
      error: "Tài khoản chưa được phân quyền trong hệ thống. Vui lòng liên hệ quản trị viên.",
      redirectUrl: "/login?error=unauthorized",
    };
  }

  return {
    success: true,
    role,
    redirectUrl
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (profile as Profile) || null;
  } catch (err) {
    console.error("Lỗi xác thực người dùng:", err);
    return null;
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Chưa đăng nhập" };

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    return { error: "Mật khẩu mới phải có ít nhất 6 ký tự" };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) return { error: error.message };

  return { success: true };
}

interface CreateUserParams {
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  studentId?: string; // Nếu tạo account cho học sinh đã có sẵn trong bảng students
}

export async function createAccountByAdmin({
  email,
  password = "password123", // Mật khẩu mặc định nếu không truyền
  fullName,
  role,
  phone,
  studentId,
}: CreateUserParams) {
  // Chỉ admin mới được gọi hành động này
  const current = await getCurrentProfile();
  if (!current || current.role !== "admin") {
    return { error: "Bạn không có quyền thực hiện thao tác này" };
  }

  const adminClient = createAdminClient();

  // 1. Tạo user trong hệ thống auth.users qua Admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Tự động xác thực email không cần gửi mail kích hoạt
    user_metadata: { full_name: fullName, role },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Không thể tạo tài khoản" };
  }

  const newUserId = authData.user.id;

  // 2. Gán dữ liệu tương ứng theo vai trò
  if (role === "student") {
    if (studentId) {
      // Gắn auth_user_id vào bản ghi Student đã có
      const { error: linkErr } = await adminClient
        .from("students")
        .update({ auth_user_id: newUserId })
        .eq("id", studentId);

      if (linkErr) return { error: linkErr.message };
    } else {
      // Tạo mới học sinh trong bảng students
      const { error: studentErr } = await adminClient
        .from("students")
        .insert({
          full_name: fullName,
          parent_phone: phone || "Chưa cập nhật",
          status: "active",
          auth_user_id: newUserId,
        });

      if (studentErr) return { error: studentErr.message };
    }
  } else {
    // Admin, Teacher, Sale: Thêm/cập nhật bản ghi vào bảng profiles.
    // Dùng upsert (không phải insert) vì trigger handle_new_user() trên auth.users
    // đã tự tạo sẵn 1 dòng profiles cơ bản ngay khi createUser() ở trên chạy xong -
    // insert thẳng sẽ lỗi trùng khóa chính (id).
    const { error: profileErr } = await adminClient
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name: fullName,
        phone: phone || null,
        role: role,
        salary_per_session: 0,
      });

    if (profileErr) return { error: profileErr.message };
  }

  revalidatePath("/admin/accounts");
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");

  return { success: true, userId: newUserId };
}