import { getCurrentProfile } from "@/lib/actions/auth";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminProfileClient } from "./profile-client";

export default async function AdminProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <AdminHeader
        title="Hồ sơ Cá nhân"
        subtitle="Thông tin tài khoản và đổi mật khẩu"
      />
      <div className="p-6 max-w-4xl mx-auto">
        <AdminProfileClient profile={profile} />
      </div>
    </div>
  );
}
