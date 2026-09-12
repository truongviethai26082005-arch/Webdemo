import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseKey = rawKey.trim();

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const protectedRoutes = ["/admin", "/teacher", "/sale", "/student"];
  const isAccessingProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. Chưa đăng nhập mà truy cập route được bảo vệ
  if (!user) {
    if (isAccessingProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 2. Xác định vai trò theo thứ tự ưu tiên (Fail-closed - AGENTS.md mục 5.2)
  // Bước 1: Tìm trong profiles (admin | teacher | sale)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let userRole = profile?.role;

  // Bước 2: Nếu không có ở bước 1, tìm trong students theo auth_user_id
  if (!userRole) {
    try {
      // NOTE: Bảng `students` hiện có thể CHƯA có cột auth_user_id (chờ migration DB).
      // Fallback an toàn: nếu cột chưa tồn tại hoặc truy vấn lỗi, coi như không tìm thấy (null) thay vì crash.
      // Cần bật lại logic đầy đủ sau khi migration DB:
      // ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
      // CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!studentError && student) {
        userRole = "student";
      }
    } catch {
      // Fallback an toàn nếu cột auth_user_id chưa tồn tại trong schema DB
      userRole = undefined;
    }
  }

  const roleHomeMap: Record<string, string> = {
    admin: "/admin/dashboard",
    teacher: "/teacher/schedule",
    sale: "/sale/admissions",
    student: "/student/dashboard",
  };

  // Bước 3: Nếu không có ở cả 2 bước trên (hoặc role không hợp lệ) -> KHÔNG gán role nào, redirect về /login?error=unauthorized
  if (!userRole || !roleHomeMap[userRole]) {
    // Tránh vòng lặp redirect nếu user đang ở trang /login
    if (pathname === "/login") {
      return response;
    }
    const unauthorizedUrl = request.nextUrl.clone();
    unauthorizedUrl.pathname = "/login";
    unauthorizedUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Nếu đã đăng nhập mà truy cập trang /login -> đưa về trang chủ của role
  if (pathname === "/login") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = roleHomeMap[userRole];
    return NextResponse.redirect(targetUrl);
  }

  // 3. Route Guard theo phân vùng (chặn truy cập chéo phân hệ)
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = roleHomeMap[userRole];
    return NextResponse.redirect(targetUrl);
  }

  if (pathname.startsWith("/teacher") && userRole !== "teacher") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = roleHomeMap[userRole];
    return NextResponse.redirect(targetUrl);
  }

  if (pathname.startsWith("/sale") && userRole !== "sale") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = roleHomeMap[userRole];
    return NextResponse.redirect(targetUrl);
  }

  if (pathname.startsWith("/student") && userRole !== "student") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = roleHomeMap[userRole];
    return NextResponse.redirect(targetUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};