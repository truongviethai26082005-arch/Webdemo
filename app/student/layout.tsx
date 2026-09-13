import { requireRole } from "@/lib/auth/guards";
import { signOut } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { LogOut, School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Học sinh không có bản ghi trong `profiles` — dùng requireRole() (kiểm tra qua
  // students.auth_user_id) thay vì getCurrentProfile() (chỉ đọc `profiles`).
  const guard = await requireRole(["student"]);

  if (!guard.authorized) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background antialiased">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header tối thiểu - placeholder chưa có sidebar riêng, nhưng BẮT BUỘC phải có
            nút đăng xuất: proxy.ts chặn Student không cho sang /admin, /teacher, /sale
            và tự đá về lại đây nếu vào /login - không có nút này, tài khoản Student sẽ
            bị kẹt cứng ở đây không thoát ra được. */}
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-foreground">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <span>EduCenter — Cổng Học sinh</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </form>
        </header>
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
