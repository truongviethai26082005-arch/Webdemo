import { UserPlus } from "lucide-react";

export const metadata = {
  title: "Tuyển sinh | EduCenter",
};

export default function SaleAdmissionsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-card/50 p-10 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Phân hệ Sale đang được xây dựng</h1>
        <p className="text-xs text-muted-foreground max-w-md">
          Trang này là placeholder tối thiểu để tài khoản Sale có nơi đăng nhập vào,
          tránh lỗi 404. Tính năng Tuyển sinh thật (leads, trials, ghi danh &amp; chuyển
          đổi) sẽ được xây dựng tại đây theo đúng kiến trúc đã định — xem AGENTS.md Mục 6/9.
        </p>
      </div>
    </div>
  );
}
