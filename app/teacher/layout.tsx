import { getCurrentProfile } from "@/lib/actions/auth";
import { TeacherSidebar } from "@/components/layout/teacher-sidebar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background antialiased">
      <TeacherSidebar
        userFullName={profile.full_name}
        userEmail="Giáo viên"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
