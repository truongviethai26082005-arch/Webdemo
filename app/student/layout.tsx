import { requireRole } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

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
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
