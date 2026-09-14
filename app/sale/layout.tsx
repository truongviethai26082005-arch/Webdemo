import { getCurrentProfile } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { SaleSidebar } from "@/components/layout/sale-sidebar";
import { FastLeadIntakeFab } from "@/components/sale/fast-lead-intake-fab";

export const dynamic = "force-dynamic";

export default async function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "sale") {
    redirect("/login?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-background antialiased">
      <SaleSidebar
        userFullName={profile.full_name}
        userEmail={profile.phone || "sale@educenter.vn"}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 pb-16">{children}</main>
        <FastLeadIntakeFab />
      </div>
    </div>
  );
}

