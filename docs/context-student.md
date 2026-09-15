Nhật ký làm việc — Phân hệ Học sinh (Student)
> File này CHỈ dành cho người phụ trách phân hệ Student ghi lại tiến độ,
> quyết định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác
> sửa file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án.

## Hiện trạng khi bắt đầu (2026-09-13)

- `app/student/layout.tsx` + `app/student/dashboard/page.tsx`: mới là
  **placeholder tối thiểu** (có nút đăng xuất, chặn quyền đúng) — CHƯA có
  tính năng thật nào.
- **Khác biệt quan trọng so với Admin/Teacher/Sale:** học sinh KHÔNG có bản
  ghi trong bảng `profiles` — không dùng `getCurrentProfile()` được. Việc xác
  định quyền/danh tính phải dùng `requireRole(["student"])`
  (`lib/auth/guards.ts`), hàm này tự kiểm tra qua `students.auth_user_id`.
  `app/student/layout.tsx` đã làm đúng mẫu này — copy theo, đừng đổi sang
  `getCurrentProfile()`.
- Muốn lấy đúng bản ghi `students` của người đang đăng nhập: lấy `user.id` từ
  session (`supabase.auth.getUser()`), rồi query
  `students` với điều kiện `auth_user_id = user.id` — KHÔNG dùng ID do client
  truyền lên để xác định "học sinh nào" (đúng nguyên tắc IDOR ở AGENTS.md
  Mục 5.3).
- Chỉ được xem dữ liệu gắn với chính bản ghi `students` của mình (lịch học,
  điểm danh, công nợ) — không xem được học sinh khác.
- RLS thật theo từng role (AGENTS.md Mục 5.4) **chưa xong** — mọi kiểm tra
  quyền hiện chỉ dựa vào tầng ứng dụng (Server Action), không dựa vào
  Database. Vẫn phải tự viết ownership check đầy đủ dù RLS có vẻ như đã bật.

## Nhật ký

### 2026-09-15: Khởi tạo Server Action tóm tắt và Layout chuẩn phân hệ Student
- **Đã làm:**
  - Xác nhận schema liên kết: bảng `students` liên kết với `auth.users(id)` qua cột `auth_user_id` (UUID).
  - Tạo Server Action [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts) với hàm `getStudentDashboardSummary()` lấy thông tin học sinh (`students.auth_user_id = user.id`) và đếm thống kê điểm danh (`attendance`/`attendance_records`).
  - Tạo component [`components/layout/student-sidebar.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-sidebar.tsx): Sidebar cố định nền trắng bên trái với 3 nhóm chức năng: "Thông tin chung" (active "Tiến độ học tập", Tin tức, Thống kê, Phản hồi), "Sự kiện" (Điểm danh nhận xu, Giải đấu, Lật thẻ bài, Vòng quay may mắn, Khuyến mãi), "Học tập" (Lịch học, Danh sách lớp học).
  - Tạo component [`components/layout/student-header.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-header.tsx): Header trên cùng hiển thị thông tin học viên, avatar, nút đăng xuất an toàn và chuyển đổi theme.
  - Tạo layout [`app/student/layout.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/layout.tsx) với vùng nội dung chính nền xám nhạt `#f8f9fc`.
  - Dựng giao diện trang Dashboard học sinh ([`app/student/dashboard/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/dashboard/page.tsx)) kết nối với `getStudentDashboardSummary()`.
  - Kéo dữ liệu `balance_sessions` (từ `enrollments`/`students`) và hiển thị huy hiệu "Số buổi còn lại" ngay cạnh Mã học viên trên Dashboard.
  - Triển khai tính năng Lịch học (`/student/schedule`): bổ sung Server Action `getStudentSchedule()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts) và xây dựng giao diện hoàn chỉnh tại [`app/student/schedule/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/schedule/page.tsx) với bộ chọn xem nhanh ("Tuần này", "Tất cả sắp tới", "Lịch sử đã học"), thẻ buổi học đa thông tin và huy hiệu trạng thái trực quan.
  - Tối ưu hóa & khử trùng lặp lịch học (`getStudentSchedule`): loại bỏ hoàn toàn `ensureSessionsGenerated`, lọc `class_id` duy nhất bằng `Set`, và khử trùng lặp `class_sessions` theo khóa tổng hợp `${class_id}_${session_date}_${start_time}` bằng `Map`.
  - Chuyển đổi toàn bộ giao diện lịch học sang dạng **Lưới ô 7 cột (Full Calendar)** tại [`app/student/schedule/schedule-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/schedule/schedule-client.tsx): Toolbar điều hướng tháng kèm nút Hôm nay, tiêu đề tháng năm ở giữa, bộ chuyển Tháng | Tuần, hàng tiêu đề thứ nền xám đậm `bg-slate-500` chữ trắng, ô ngày nền xanh nhạt khi là hôm nay, và các badge buổi học `[Giờ] - [Tên lớp]` hiển thị trực tiếp trong từng ô ngày.
  - Triển khai tính năng Danh sách lớp học (`/student/classes`): bổ sung Server Action `getStudentClasses()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts) và xây dựng giao diện hoàn chỉnh tại [`app/student/classes/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/classes/page.tsx) với lưới thẻ lớp học hiển thị tên lớp, mã lớp, trạng thái, giáo viên, phòng học, lịch học định kỳ và khối số buổi còn lại nổi bật kèm cảnh báo.
  - Triển khai tính năng Bài tập & Tự luyện (`/student/assignments`):
    + Xác minh schema Supabase: Bảng `assignments` (`id`, `title`, `instructions`, `class_id`, `teacher_id`, `due_date`, `type`, `created_at`) và `submissions` (`id`, `assignment_id`, `student_id`, `content`, `status`, `score`, `feedback`, `submitted_at`). Bổ sung types chuẩn vào [`types/database.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/types/database.ts).
    + Server Action trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
      * `getStudentAssignments()`: Xác thực người dùng, lấy danh sách `class_id` active, truy vấn bài tập kèm thông tin lớp và giáo viên, ghép dữ liệu nộp bài từ `submissions`, tính toán cờ `is_overdue`, `is_due_soon` (<24h), sắp xếp ưu tiên bài cần làm lên đầu.
      * `submitAssignment(assignmentId, content)`: Kiểm tra đăng nhập, xác thực học sinh có thuộc lớp của bài tập (Ownership check phòng IDOR), chặn sửa khi đã có điểm (`graded`), upsert bài nộp (`submitted`), gọi `revalidatePath`.
    + Giao diện tại [`app/student/assignments/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/assignments/page.tsx) và [`assignments-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/assignments/assignments-client.tsx):
      * 3 thẻ thống kê nhanh: Cần hoàn thành, Đang chờ chấm, Đã hoàn thành.
      * Bộ lọc theo tab ("Tất cả", "Cần làm", "Đã nộp", "Đã có điểm") và thanh tìm kiếm tức thời theo tên bài/lớp/giáo viên.
      * Thẻ bài tập trực quan: huy hiệu loại bài, thời hạn đổi màu đỏ khi quá hạn / cam khi sắp hết hạn, hiển thị đề bài, kết quả chấm điểm và lời nhận xét từ giáo viên.
      * Dialog nộp bài tập hỗ trợ nhập văn bản hoặc liên kết tài liệu (Google Drive, Docs, GitHub...), xử lý loading và hiển thị thông báo lỗi/thành công.
      * Dialog xem chi tiết bài nộp & nhận xét của giáo viên kèm liên kết mở nhanh bài làm.
  - Khởi tạo 6 trang giữ chỗ chuẩn UI (Stub pages) với huy hiệu "Đang phát triển", icon đồng bộ Sidebar, thẻ giới thiệu tính năng sắp ra mắt và nút điều hướng quay về Dashboard:
    + [`app/student/resources/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/page.tsx) (Thư viện tài liệu - icon `Library`)
    + [`app/student/grades/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/page.tsx) (Bảng điểm & Đánh giá - icon `Award`)
    + [`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx) (Lịch hẹn test - icon `CalendarCheck`)
    + [`app/student/notifications/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/notifications/page.tsx) (Tin tức & Cảnh báo - icon `Bell`)
    + [`app/student/feedback/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/feedback/page.tsx) (Gửi phản hồi - icon `MessageSquare`)
    + [`app/student/settings/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/page.tsx) (Cài đặt tài khoản - icon `Settings`)
- **Quyết định:**
  - Giữ lại cấu trúc chuẩn **`app/student/...`** và xóa bỏ hoàn toàn thư mục thừa `app/(student)/...` nhằm đảm bảo thống nhất với quy ước kiến trúc toàn dự án (`app/<role>/<feature>/page.tsx`), đồng thời khớp chính xác với bộ lọc đường dẫn của Middleware (`proxy.ts`: `/student/*`).
  - Sidebar & Header được tách thành component chuyên biệt theo convention dự án (`components/layout/student-*`).
- **Còn treo:**
  - Tiếp tục phát triển dữ liệu & logic nghiệp vụ chi tiết cho 6 trang chức năng: `/student/resources`, `/student/grades`, `/student/tests`, `/student/notifications`, `/student/feedback`, `/student/settings`.




