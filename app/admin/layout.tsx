import { getCurrentProfile } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/teacher/schedule");
  }

  return (
    <div className="flex min-h-screen bg-background antialiased">
      <AdminSidebar
        userFullName={profile.full_name}
        userEmail={profile.role === "admin" ? "Quản trị viên" : "Giáo viên"}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
