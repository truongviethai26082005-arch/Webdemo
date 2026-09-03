"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/types/database";

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

  if (error) {
    return { error: error.message === "Invalid login credentials" 
      ? "Email hoặc mật khẩu không chính xác" 
      : error.message 
    };
  }

  if (!data.user) {
    return { error: "Không thể xác thực người dùng" };
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role || "teacher";
  
  return { 
    success: true, 
    role,
    redirectUrl: role === "admin" ? "/admin/dashboard" : "/teacher/schedule" 
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
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
