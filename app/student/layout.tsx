import { requireRole } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentHeader } from "@/components/layout/student-header";
import { StudentBreadcrumb } from "@/components/layout/student-breadcrumb";

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

  const { supabase, user } = guard.context;

  // Lấy thông tin học sinh từ bảng students theo auth_user_id
  const { data: student } = await supabase
    .from("students")
    .select("full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const studentName =
    student?.full_name ||
    (user.user_metadata?.full_name as string) ||
    "Học viên";

  return (
    <div className="flex min-h-screen bg-[#F4F7FB] dark:bg-background antialiased">
      {/* Sidebar cố định bên trái nền trắng */}
      <StudentSidebar userFullName={studentName} userEmail={user.email} />

      {/* Vùng nội dung chính nền xám nhạt mát #F4F7FB */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7FB] dark:bg-background/95">
        {/* Header trên cùng có thanh tìm kiếm, ngày tháng & avatar */}
        <StudentHeader studentName={studentName} />

        {/* Vùng hiển thị {children} */}
        <main className="flex-1 px-8 pb-8 pt-0">
          <StudentBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
