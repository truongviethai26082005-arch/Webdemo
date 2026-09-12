import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Cổng Học sinh | EduCenter",
};

export default function StudentDashboardPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-card/50 p-10 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Cổng Học sinh đang được xây dựng</h1>
        <p className="text-xs text-muted-foreground max-w-md">
          Trang này là placeholder tối thiểu để tài khoản Học sinh có nơi đăng nhập vào,
          tránh lỗi 404. Tính năng thật (lịch học, điểm danh, công nợ của chính học sinh)
          sẽ được xây dựng tại đây — xem AGENTS.md Mục 6.
        </p>
      </div>
    </div>
  );
}
