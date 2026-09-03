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

  // 1. Chưa đăng nhập
  if (!user) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/teacher")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 2. Đã đăng nhập -> Lấy vai trò (Role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "teacher";

  // Đang ở /login hoặc / mà đã đăng nhập -> Chuyển hướng theo vai trò
  if (pathname === "/login" || pathname === "/") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = userRole === "admin" ? "/admin/dashboard" : "/teacher/schedule";
    return NextResponse.redirect(targetUrl);
  }

  // Giáo viên cố truy cập phân khu /admin/* -> Chặn & chuyển về /teacher/schedule
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    const teacherUrl = request.nextUrl.clone();
    teacherUrl.pathname = "/teacher/schedule";
    return NextResponse.redirect(teacherUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
