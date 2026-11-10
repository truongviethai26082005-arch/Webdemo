import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/actions/auth";
import { LandingPageContent } from "@/components/landing/landing-page-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Talk Class - Trung Tâm Tiếng Anh Giao Tiếp Giáo Viên Bản Ngữ Uy Tín",
  description:
    "Talk Class - Hệ thống đào tạo tiếng Anh giao tiếp chuyên sâu cùng 100% đội ngũ giáo viên bản ngữ CELTA, TESOL tại Hà Nội.",
};

export default async function HomePage() {
  const profile = await getCurrentProfile();

  const isLoggedIn = !!profile;
  const dashboardUrl =
    profile?.role === "admin"
      ? "/admin/dashboard"
      : profile?.role === "sale"
      ? "/sale/admissions"
      : profile?.role === "student"
      ? "/student/dashboard"
      : "/teacher/schedule";

  return (
    <LandingPageContent
      isLoggedIn={isLoggedIn}
      dashboardUrl={dashboardUrl}
    />
  );
}
