import { getClasses, getTeacherOptions } from "@/lib/actions/classes";
import { AdminHeader } from "@/components/layout/admin-header";
import { ClassesClient } from "./classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const classes = await getClasses();
  const teachers = await getTeacherOptions();
  const params = searchParams ? await searchParams : {};
  const initialTab = params.tab || "schedule";

  return (
    <div>
      <AdminHeader
        title="Lịch học & Cơ sở vật chất"
        subtitle="Lịch học, chuẩn bị trang thiết bị phòng học & đồng bộ dữ liệu lớp học"
      />
      <div className="p-6 max-w-7xl mx-auto">
        <ClassesClient initialClasses={classes} teachers={teachers} initialTab={initialTab} />
      </div>
    </div>
  );
}
