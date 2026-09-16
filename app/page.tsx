import { getCurrentProfile } from "@/lib/actions/auth";
import { LandingPageContent } from "@/components/landing/landing-page-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  const isLoggedIn = !!profile;
  const dashboardUrl =
    profile?.role === "admin" ? "/admin/dashboard" : "/teacher/schedule";

  return (
    <LandingPageContent
      isLoggedIn={isLoggedIn}
      dashboardUrl={dashboardUrl}
    />
  );
}
