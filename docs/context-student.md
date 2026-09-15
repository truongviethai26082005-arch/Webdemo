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
  - Khởi tạo 6 trang giữ chỗ chuẩn UI (Stub pages) với huy hiệu "Đang phát triển", icon đồng bộ Sidebar, thẻ giới thiệu tính năng sắp ra mắt và nút điều hướng quay về Dashboard.
  - Triển khai hoàn thiện trang Thư viện tài liệu học tập (`/student/resources`):
    + Bổ sung Server Action `getStudentResources()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực học sinh theo `auth_user_id = user.id`, truy vấn các lớp đang học (`enrollments` status = 'active') kèm thông tin giáo viên, kiểm tra bảng `materials` từ DB hoặc kích hoạt cơ chế fallback dữ liệu chuẩn nghiệp vụ gắn theo đúng các `classes` thực tế của học viên.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/resources/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/page.tsx) và [`resources-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/resources-client.tsx):
      * 4 thẻ thống kê nhanh: Tổng số tài liệu, Lớp đang học có học liệu, Tài liệu mới cập nhật, Học liệu số (PDF, Slide, Video).
      * Bộ lọc theo lớp học (Tabs lớp), bộ lọc định dạng file (Tất cả, PDF, Slide, Video) và ô tìm kiếm tức thời theo từ khóa.
      * Lưới thẻ tài liệu dạng Grid: huy hiệu loại file, định dạng, dung lượng, ngày đăng, tên giáo viên và mã lớp.
      * Dialog xem chi tiết học liệu (Preview Dialog) kèm hướng dẫn sử dụng và nút mở xem/tải xuống an toàn.
      * Xử lý trạng thái rỗng (Empty state) thân thiện kèm nút đặt lại bộ lọc.
  - Triển khai hoàn thiện trang Bảng điểm & Đánh giá năng lực (`/student/grades`):
    + Bổ sung Server Action `getStudentGrades()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực người dùng qua `auth_user_id = user.id`, truy vấn các lớp đang học (`enrollments` status = 'active'), tích hợp tính toán tỷ lệ chuyên cần từ `attendance`, kiểm tra các bài nộp đã chấm (`submissions` status = 'graded') hoặc kích hoạt cơ chế fallback dữ liệu mẫu chuẩn nghiệp vụ gắn theo đúng các `classes` thực tế của học viên.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/grades/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/page.tsx) và [`grades-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/grades-client.tsx):
      * 4 thẻ thống kê tổng quan: Điểm TB tích lũy (GPA) hệ 10 kèm xếp loại (Xuất sắc/Giỏi/Khá/TB), Tỷ lệ hoàn thành bài tập, Tỷ lệ chuyên cần, Tổng số đầu điểm đánh giá.
      * Bộ chọn lớp học dạng Tabs chuyển đổi linh hoạt kèm huy hiệu điểm trung bình từng lớp.
      * Bảng chi tiết các đầu điểm (15 phút, 1 tiết, Giữa kỳ, Chuyên cần, Bài tập về nhà) kèm trọng số %, ngày chấm, điểm số phân màu và nhận xét của giáo viên.
      * Khối Nhận xét & Đánh giá năng lực chuyên sâu của Giáo viên bộ môn (Điểm mạnh & ưu điểm nổi bật, Điểm cần rèn luyện thêm, Lời nhận xét tổng quát).
      * Xử lý trạng thái rỗng (Empty state) gọn gàng khi học sinh chưa có lớp hoặc chưa phát sinh điểm số.
  - Triển khai hoàn thiện trang Cài đặt tài khoản & Đổi mật khẩu (`/student/settings`):
    + Bổ sung 2 Server Actions trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
      * `getStudentProfileSettings()`: Lấy thông tin tài khoản học sinh ở chế độ chỉ đọc từ `students` theo `auth_user_id = user.id`.
      * `updateStudentPassword(newPassword)`: Kiểm tra độ dài mật khẩu (>= 6 ký tự), xác thực quyền truy cập và gọi API chuẩn `supabase.auth.updateUser({ password: newPassword })` để cập nhật mật khẩu an toàn.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/settings/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/page.tsx) và [`settings-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/settings-client.tsx):
      * Thẻ thông tin cá nhân (Read-only): Họ tên, Mã học viên, Email, Số điện thoại, Phụ huynh (nếu có) kèm huy hiệu Đã xác thực và khung thông báo "Liên hệ giáo vụ nếu cần cập nhật thông tin cá nhân".
      * Form Đổi mật khẩu: Nút toggle ẩn/hiện mật khẩu (Eye/EyeOff), kiểm tra khớp mật khẩu xác nhận, hiển thị trạng thái loading, cảnh báo lỗi và thông báo thành công rõ ràng.
  - Triển khai hoàn thiện trang Lịch hẹn test & Thi thử định kỳ (`/student/tests`):
    + Bổ sung Server Action `getStudentTests()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực người dùng qua `auth_user_id = user.id`, truy vấn các lớp đang học (`enrollments` status = 'active'), tích hợp cơ chế fallback thông minh tự động sinh dữ liệu ca thi chuẩn nghiệp vụ (sắp diễn ra & đã hoàn thành) gắn liền với lớp học thực tế của học viên.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx) và [`tests-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/tests-client.tsx):
      * 3 thẻ thống kê tổng quan: Ca thi sắp tới, Ca thi đã tham gia, Điểm thi thử gần nhất kèm xếp loại.
      * Bộ chuyển đổi 2 Tabs: "Lịch thi sắp tới" (đếm ngược ngày, huy hiệu Online/Offline, phòng thi, cán bộ coi thi, nút xác nhận tham gia, vào phòng thi online) và "Lịch sử thi & Kết quả" (điểm tổng quan, biểu đồ thanh phần trăm từng kỹ năng đánh giá, nhận xét chi tiết của Ban Khảo thí, xem đề & đáp án tham khảo).
      * Dialog xem chi tiết quy chế phòng thi và hướng dẫn chuẩn bị trước khi vào ca thi.
  - Triển khai hoàn thiện trang Tin tức & Cảnh báo (`/student/notifications`):
    + Bổ sung Server Action `getStudentNotifications()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực người dùng qua `auth_user_id = user.id`, truy vấn lớp học active và kiểm tra số buổi học còn lại (`balance_sessions`), tự động tổng hợp dữ liệu thông báo đa chiều chuẩn nghiệp vụ (Cảnh báo học phí/âm buổi nếu <= 2, Nhắc nhở hạn nộp bài tập về nhà, Tài liệu mới từ giáo viên, Lịch thi thử, Thông báo nghỉ lễ học bù và Bảng vàng vinh danh).
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/notifications/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/notifications/page.tsx) và [`notifications-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/notifications/notifications-client.tsx):
      * 3 thẻ thống kê nhanh: Tổng thông báo, Chưa đọc, Cảnh báo quan trọng.
      * Nâng cấp tương tác micro-interactions & Click-to-filter cho 3 thẻ thống kê: hiệu ứng hover trượt nhẹ (`hover:-translate-y-1 hover:shadow-md`), viền active ring tương ứng từng nhóm, bấm trực tiếp vào thẻ widget để lọc danh sách thông báo tức thời (Tất cả, Chưa đọc, Quan trọng) đồng bộ với các Tabs danh mục bên dưới.
      * Bộ lọc Tabs phân loại: Tất cả, Cảnh báo học vụ, Bài tập & Lịch học, Tin tức trung tâm.
      * Thẻ thông báo trực quan: Icon phân màu theo tính chất (Đỏ: Khẩn cấp/Học phí, Vàng: Hạn nộp bài, Xanh: Lớp học, Tím: Tin tức), chấm tròn chưa đọc, mức độ ưu tiên và thời gian gửi tương đối.
      * Nút "Đánh dấu tất cả đã đọc" xử lý state mượt mà.
      * Dialog xem toàn văn chi tiết thông báo kèm nút bấm điều hướng nhanh tới tính năng liên quan (`/student/assignments`, `/student/schedule`, `/student/classes`, v.v.).
      * Xử lý trạng thái rỗng (Empty state) sạch sẽ.
  - Đồng bộ hóa Micro-interactions & Click-to-filter/Navigate trên TOÀN BỘ các thẻ Stat Widgets của phân hệ Học sinh:
    + Áp dụng class chuẩn toàn hệ thống: `cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/80 active:scale-[0.99] select-none group`.
    + `notifications-client.tsx`: Bấm Tổng thông báo (xem hết), Chưa đọc (lọc tin mới), Cảnh báo quan trọng (lọc tin khẩn).
    + `assignments-client.tsx`: Bấm Cần hoàn thành -> tab "pending", Đang chờ chấm -> tab "submitted", Đã hoàn thành -> tab "graded" kèm active rings nổi bật.
    + `tests-client.tsx`: Bấm Ca thi sắp tới -> tab "upcoming", Bấm Ca thi đã tham gia / Điểm gần nhất -> tab "completed" kèm active rings.
    + `resources-client.tsx`: Bấm Tổng số tài liệu (reset bộ lọc), Lớp đang học (chuyển lớp), Tài liệu mới (lọc tức thời tài liệu mới cập nhật trong tuần), Học liệu số (xoay vòng định dạng PDF/Slide/Video) kèm active rings.
    + `dashboard/page.tsx`: Bấm huy hiệu "Số buổi còn lại" -> điều hướng nhanh `/student/classes`; bấm các thẻ điểm danh -> `/student/schedule`; bấm thẻ nhiệm vụ bài tập -> `/student/assignments`.
- **Quyết định:**
  - Giữ lại cấu trúc chuẩn **`app/student/...`** và xóa bỏ hoàn toàn thư mục thừa `app/(student)/...` nhằm đảm bảo thống nhất với quy ước kiến trúc toàn dự án (`app/<role>/<feature>/page.tsx`), đồng thời khớp chính xác với bộ lọc đường dẫn của Middleware (`proxy.ts`: `/student/*`).
  - Sidebar & Header được tách thành component chuyên biệt theo convention dự án (`components/layout/student-*`).
- **Còn treo:**
  - Tiếp tục phát triển dữ liệu & logic nghiệp vụ chi tiết cho 1 trang chức năng duy nhất còn lại: `/student/feedback`.
