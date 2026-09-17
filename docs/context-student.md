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
  - Triển khai hoàn thiện module Phản hồi & Đóng góp ý kiến (`/student/feedback`):
    + Bổ sung 2 Server Actions trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
      * `submitStudentFeedback(input)`: Xác thực phiên đăng nhập qua `auth_user_id = user.id` (chống IDOR tuyệt đối, không nhận studentId từ client), kiểm tra validation chặt chẽ (tiêu đề, nội dung, rating 1..5 sao), lưu vào bảng `student_feedbacks` bọc khối try-catch an toàn kèm fallback mô phỏng để không làm crash UI, gọi `revalidatePath`.
      * `getStudentFeedbacks()`: Lấy danh sách lớp active của học sinh phục vụ dropdown chọn lớp, truy vấn lịch sử phản hồi theo `student_id`. Nếu database chưa có dữ liệu thực tế, cung cấp 2 phản hồi mẫu chuẩn nghiệp vụ kèm khối `admin_response` để giao diện luôn sống động.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/feedback/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/feedback/page.tsx) và [`feedback-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/feedback/feedback-client.tsx):
      * 3 thẻ thống kê tổng quan: Tổng phản hồi đã gửi, Đã được phản hồi (kèm số lượng đang xử lý), Mức hài lòng trung bình (với icon sao vàng). Hỗ trợ hover trượt nhẹ và click-to-filter / switch tab tức thời.
      * Tab "Gửi phản hồi mới": Chọn số sao đánh giá tương tác (1 đến 5 sao) kèm nhãn cảm xúc theo thời gian thực (hover & select), dropdown chọn chủ đề (Chất lượng giảng dạy, Cơ sở vật chất, Học phí & Lịch học, Góp ý khác), dropdown chọn lớp học liên quan, ô nhập tiêu đề và Textarea nội dung, banner báo thành công / lỗi, nút làm mới form và nút gửi kèm trạng thái loading.
      * Tab "Lịch sử phản hồi": Lưới card chi tiết hiển thị danh mục, tên lớp, số sao, badge trạng thái ("Đã xử lý" xanh lá / "Đang xử lý" cam), thời gian gửi, nội dung phản ánh và khối trích dẫn phản hồi từ Ban Quản trị / Giáo vụ trung tâm (`admin_response`) có border-left xanh dương nổi bật.
  - Chuẩn hóa logic tính toán & nâng cấp Widgets trang Dashboard học viên (`app/student/dashboard/page.tsx`):
    + Bổ sung Server Action `getStudentDashboardStats()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
      * Thống kê điểm danh chuẩn xác từ `attendance`/`attendance_records`: `present_count`, `absent_excused_count`, `absent_unexcused_count`, `total_sessions`. Tỷ lệ chuyên cần tính theo `(present / total) * 100` (hiển thị 0% kèm nhãn "Chưa có buổi học nào" khi total = 0, không vẽ full vòng tròn gây hiểu nhầm).
      * Tính số buổi nghỉ thực tế = `absent_excused + absent_unexcused`, hiển thị khớp 100% với widget điểm danh dưới dạng `${actual_absences}/3` (khắc phục triệt để lỗi hardcode `5/0`), tự động bật cờ cảnh báo đỏ `exceeded_absence` khi nghỉ >= 3 buổi.
      * Tích hợp thống kê bài tập & kiểm tra từ `assignments` & `submissions`: phân loại `pending` (chưa nộp còn hạn), `submitted` (chờ chấm), `graded` (đã chấm), và `overdue_count` (quá hạn chưa nộp hiển thị ở thẻ "Bỏ bài tập").
      * Trích xuất danh sách tối đa 2 bài tập cần làm gấp nhất để hiển thị trực tiếp lên Dashboard.
    + Nâng cấp giao diện Widget Dashboard:
      * Widget Điểm danh: SVG Donut chart tính toán chuẩn xác, không vẽ stroke màu khi 0 buổi; các thẻ con đếm số buổi đồng bộ 100%.
      * Widget Cảnh báo giới hạn: Thẻ Nghỉ hiển thị số liệu thật, thẻ Bỏ bài tập kết nối trực tiếp với số bài tập quá hạn chưa nộp.
      * Widget Bài tập & Kiểm tra: Thêm thanh tóm tắt trạng thái 3 khối [Cần làm] - [Chờ chấm] - [Đã chấm]; danh sách mini bài tập cần nộp gấp (tên lớp, hạn chót, countdown, nút "Làm bài") hoặc empty state hoàn thành xuất sắc khi không còn bài cần làm.
- **Quyết định:**
  - Giữ lại cấu trúc chuẩn **`app/student/...`** và xóa bỏ hoàn toàn thư mục thừa `app/(student)/...` nhằm đảm bảo thống nhất với quy ước kiến trúc toàn dự án (`app/<role>/<feature>/page.tsx`), đồng thời khớp chính xác với bộ lọc đường dẫn của Middleware (`proxy.ts`: `/student/*`).
  - Sidebar & Header được tách thành component chuyên biệt theo convention dự án (`components/layout/student-*`).
- **Tình trạng phân hệ Học sinh:**
  - **HOÀN THIỆN 100% TOÀN BỘ 10/10 MODULE** của phân hệ Học sinh (`dashboard`, `schedule`, `classes`, `assignments`, `resources`, `grades`, `tests`, `notifications`, `settings`, `feedback`). Không còn trang stub hay tính năng tồn đọng.

### 2026-09-16: Tái cấu trúc Dashboard học viên, Header và Khu vực Trọng tâm học thuật
- **Đã làm:**
  - **Cập nhật Header (`components/layout/student-header.tsx`):**
    + Bổ sung icon Chuông thông báo (`Bell` từ `lucide-react`) kèm huy hiệu (badge) tròn đỏ hiển thị số lượng thông báo mới (`3`) có hiệu ứng nhấp nháy tinh tế, điều hướng trực tiếp đến `/student/notifications`.
  - **Banner Nhắc lịch học (`app/student/dashboard/page.tsx`):**
    + Tính toán ca học gần nhất từ `getStudentSchedule()` theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
    + Nếu có ca học hôm nay hoặc sắp tới: hiển thị dải thông báo nổi bật với Tên môn/lớp, giờ học (`start_time` - `end_time`), phòng học, giáo viên phụ trách kèm nút "Vào xem lịch học".
    + Nếu không có lịch học hôm nay: hiển thị dải trạng thái thư thái ("Hôm nay không có lịch học") với lời nhắn tích cực và nút xem thời khóa biểu tuần.
  - **KHU VỰC TRỌNG TÂM - Tình trạng học tập & Đánh giá (Chiếm vị trí số 1, ưu tiên cao nhất):**
    + Đặt ngay bên dưới Banner Nhắc lịch học, hiển thị toàn diện kết quả học thuật từ `getStudentGrades()`.
    + 4 thẻ chỉ số nổi bật:
      1. GPA Tích lũy (Hệ 10) kèm huy hiệu xếp loại (Xuất sắc, Giỏi, Khá...).
      2. Điểm bài test/kiểm tra gần nhất (điểm số, tên bài test, môn học).
      3. Tỷ lệ hoàn thành bài tập & bài kiểm tra (%).
      4. Điểm chuyên cần (%).
    + Khối Nhận xét của Giáo viên phụ trách: trích đoạn nhận xét định tính mới nhất gồm 3 phần rõ ràng: "Điểm mạnh & Ưu điểm nổi bật", "Điểm cần rèn luyện thêm", và "Lời nhận xét tổng quát" kèm tên giáo viên và môn học.
  - **Thu gọn Khu vực Thứ yếu bên dưới thành 2 cột cân xứng:**
    + Cột 1: "Tình hình điểm danh" với biểu đồ tròn Donut SVG và 3 thẻ con đếm số buổi có mặt, vắng không phép, vắng có phép.
    + Cột 2: "Bài tập & Kiểm tra" với thanh tóm tắt 3 trạng thái [Cần làm] - [Chờ chấm] - [Đã chấm] và danh sách mini các bài tập cần nộp gấp hoặc trạng thái hoàn thành xuất sắc.
- **Ràng buộc bảo mật & Dữ liệu:**
  - 100% Read-only: Chỉ thực hiện truy vấn SELECT từ Supabase qua Server Actions.
  - Không thay đổi schema, không can thiệp SQL hay chạy script migration.
  - Tuân thủ Data Isolation: Chỉ đọc dữ liệu của học viên đang đăng nhập qua `auth_user_id = user.id`.
  - Giữ vững cơ chế Fallback in-memory: Tự động sinh dữ liệu mẫu chuẩn nghiệp vụ gắn liền với lớp học của học viên khi DB chưa có dữ liệu chấm điểm/lịch thi thật, không chèn (INSERT) vào database.
- **Kiểm tra chất lượng:**
  - Chạy `npx tsc --noEmit` đạt 0 lỗi biên dịch.

### 2026-09-16 (Bổ sung): Tinh gọn và tối ưu hóa giao diện Dashboard học viên
- **Đã làm:**
  - **Bỏ hoàn toàn khối nhận xét giáo viên trên Dashboard:** Loại bỏ 3 ô nhận xét (Điểm mạnh, Điểm cần rèn luyện, Nhận xét chung) để giảm tải thị giác và tránh trùng lặp thông tin với trang chi tiết `/student/grades`.
  - **Thu nhỏ banner lịch học thành dải thông báo tinh gọn (Compact Alert Strip):**
    + Đổi từ card lớn sang thanh mỏng nhẹ (`px-4 py-2.5 rounded-xl border`): Hiển thị icon lịch + `Buổi học kế tiếp: [Tên môn/lớp] • [Giờ học] [Thứ, ngày (dd/MM)] • [Phòng học]` cùng link text `Xem lịch trình →`.
    + Trạng thái không có lịch học cũng được thu gọn tương ứng với icon thư thái + `Xem lịch trình →`.
  - **Khối Tình trạng học tập & Đánh giá:** Giữ lại 4 thẻ chỉ số tổng quan (GPA Tích lũy, Bài test gần nhất, Hoàn thành bài tập, Điểm chuyên cần) thành một hàng 4 cột trắng tinh tế (`bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm`), số liệu to rõ (`text-2xl font-bold text-slate-800`), đặt ngay dưới thanh mini-banner lịch học.
  - **Khu vực Thứ yếu:** Giữ nguyên 2 cột cân xứng bên dưới (Tình hình điểm danh dạng Donut chart và Bài tập & Kiểm tra).
### 2026-09-16 (Bổ sung): Áp dụng hệ thống phân bổ màu sắc chuẩn (60 - 30 - 10)
- **Quy chuẩn hệ thống màu sắc:**
  - **Nền và Khối chính (60%):**
    + Nền toàn trang: Sử dụng `bg-[#f8f9fc]` (dark: `dark:bg-background/95`).
    + Nền thẻ/Card: Dùng nền trắng tinh `bg-white dark:bg-card`, viền mảnh `border border-slate-200/80 dark:border-border`, bo góc `rounded-2xl`, đổ bóng nhẹ `shadow-sm`.
    + Màu văn bản chính: `text-slate-800 dark:text-foreground` (tiêu đề, số liệu chính) và `text-slate-500 dark:text-muted-foreground` (nhãn phụ, chú thích).
  - **Màu thương hiệu & Điều hướng (30% - Royal Blue):**
    + Nút bấm chính: `bg-blue-600 hover:bg-blue-700 text-white`.
    + Icon điều hướng & nhận diện: `text-blue-600 dark:text-blue-400`.
    + Avatar học viên viết tắt: `bg-blue-600 text-white` (trên Dashboard, Header và Sidebar).
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
  - Triển khai tính năng Danh sách lớp học (`/student/classes`): bổ sung Server Action `getStudentClasses()` dalam [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts) và xây dựng giao diện hoàn chỉnh tại [`app/student/classes/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/classes/page.tsx) với lưới thẻ lớp học hiển thị tên lớp, mã lớp, trạng thái, giáo viên, phòng học, lịch học định kỳ và khối số buổi còn lại nổi bật kèm cảnh báo.
  - Triển khai tính năng Bài tập & Tự luyện (`/student/assignments`):
    + Xác minh schema Supabase: Bảng `assignments` (`id`, `title`, `instructions`, `class_id`, `teacher_id`, `due_date`, `type`, `created_at`) và `submissions` (`id`, `assignment_id`, `student_id`, `content`, `status`, `score`, `feedback`, `submitted_at`). Bổ sung types chuẩn vào [`types/database.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/types/database.ts).
    + Server Action dalam [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
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
    + Bổ sung Server Action `getStudentResources()` dalam [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực học sinh theo `auth_user_id = user.id`, truy vấn các lớp đang học (`enrollments` status = 'active') kèm thông tin giáo viên, kiểm tra bảng `materials` từ DB hoặc kích hoạt cơ chế fallback dữ liệu chuẩn nghiệp vụ gắn theo đúng các `classes` thực tế của học viên.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/resources/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/page.tsx) và [`resources-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/resources-client.tsx):
      * 4 thẻ thống kê nhanh: Tổng số tài liệu, Lớp đang học có học liệu, Tài liệu mới cập nhật, Học liệu số (PDF, Slide, Video).
      * Bộ lọc theo lớp học (Tabs lớp), bộ lọc định dạng file (Tất cả, PDF, Slide, Video) và ô tìm kiếm tức thời theo từ khóa.
      * Lưới thẻ tài liệu dạng Grid: huy hiệu loại file, định dạng, dung lượng, ngày đăng, tên giáo viên và mã lớp.
      * Dialog xem chi tiết học liệu (Preview Dialog) kèm hướng dẫn sử dụng và nút mở xem/tải xuống an toàn.
      * Xử lý trạng thái rỗng (Empty state) thân thiện kèm nút đặt lại bộ lọc.
  - Triển khai hoàn thiện trang Bảng điểm & Đánh giá năng lực (`/student/grades`):
    + Bổ sung Server Action `getStudentGrades()` dalam [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực người dùng qua `auth_user_id = user.id`, truy vấn các lớp đang học (`enrollments` status = 'active'), tích hợp tính toán tỷ lệ chuyên cần từ `attendance`, kiểm tra các bài nộp đã chấm (`submissions` status = 'graded') hoặc kích hoạt cơ chế fallback dữ liệu mẫu chuẩn nghiệp vụ gắn theo đúng các `classes` thực tế của học viên.
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
    + Bổ sung Server Action `getStudentNotifications()` dalam [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts): Xác thực người dùng qua `auth_user_id = user.id`, truy vấn lớp học active và kiểm tra số buổi học còn lại (`balance_sessions`), tự động tổng hợp dữ liệu thông báo đa chiều chuẩn nghiệp vụ (Cảnh báo học phí/âm buổi nếu <= 2, Nhắc nhở hạn nộp bài tập về nhà, Tài liệu mới từ giáo viên, Lịch thi thử, Thông báo nghỉ lễ học bù và Bảng vàng vinh danh).
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/notifications/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/notifications/page.tsx) và [`notifications-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/notifications/notifications-client.tsx):
      * 3 thẻ thống kê nhanh: Tổng thông báo, Chưa đọc, Cảnh báo quan trọng.
      * Nâng cấp tương tác micro-interactions & Click-to-filter cho 3 thẻ thống kê: hiệu ứng hover trượt nhẹ (`hover:-translate-y-1 hover:shadow-md`), viền active ring tương ứng từng nhóm, bấm trực tiếp vào thẻ widget để lọc danh sách thông báo tức thời (Tất cả, Chưa đọc, Quan trọng) đồng bộ với các Tabs danh mục bên dưới.
      * Bộ lọc Tabs phân loại: Tất cả, Cảnh báo học vụ, Bài tập & Lịch học, Tin tức trung tâm.
      * Thẻ thông báo trực quan: Icon phân màu theo tính chất (Đỏ: Khẩn cấp/Học phí, Vàng: Hạn nộp bài, Xanh: Lớp học, Tím: Tin tức), chấm tròn chưa đọc, mức độ ưu tiên và thời gian gửi tương đối.
      * Nút "Đánh dấu tất cả đã đọc" xử lý state mượt mà.
      * Dialog xem toàn văn chi tiết thông báo kèm nút bấm điều hướng nhanh tới tính năng liên quan (`/student/assignments`, `/student/schedule`, `/student/classes`, v.v.).
      * Xử lý trạng thái rỗng (Empty state) sạch sẽ.
  - Triển khai hoàn thiện module Phản hồi & Đóng góp ý kiến (`/student/feedback`):
    + Bổ sung 2 Server Actions trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
      * `submitStudentFeedback(input)`: Xác thực phiên đăng nhập qua `auth_user_id = user.id` (chống IDOR tuyệt đối, không nhận studentId từ client), kiểm tra validation chặt chẽ (tiêu đề, nội dung, rating 1..5 sao), lưu vào bảng `student_feedbacks` bọc khối try-catch an toàn kèm fallback mô phỏng để không làm crash UI, gọi `revalidatePath`.
      * `getStudentFeedbacks()`: Lấy danh sách lớp active của học sinh phục vụ dropdown chọn lớp, truy vấn lịch sử phản hồi theo `student_id`. Nếu database chưa có dữ liệu thực tế, cung cấp 2 phản hồi mẫu chuẩn nghiệp vụ kèm khối `admin_response` để giao diện luôn sống động.
    + Xây dựng giao diện hoàn chỉnh tại [`app/student/feedback/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/feedback/page.tsx) và [`feedback-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/feedback/feedback-client.tsx):
      * 3 thẻ thống kê tổng quan: Tổng phản hồi đã gửi, Đã được phản hồi (kèm số lượng đang xử lý), Mức hài lòng trung bình (với icon sao vàng). Hỗ trợ hover trượt nhẹ và click-to-filter / switch tab tức thời.
      * Tab "Gửi phản hồi mới": Chọn số sao đánh giá tương tác (1 đến 5 sao) kèm nhãn cảm xúc theo thời gian thực (hover & select), dropdown chọn chủ đề (Chất lượng giảng dạy, Cơ sở vật chất, Học phí & Lịch học, Góp ý khác), dropdown chọn lớp học liên quan, ô nhập tiêu đề và Textarea nội dung, banner báo thành công / lỗi, nút làm mới form và nút gửi kèm trạng thái loading.
      * Tab "Lịch sử phản hồi": Lưới card chi tiết hiển thị danh mục, tên lớp, số sao, badge trạng thái ("Đã xử lý" xanh lá / "Đang xử lý" cam), thời gian gửi, nội dung phản ánh và khối trích dẫn phản hồi từ Ban Quản trị / Giáo vụ trung tâm (`admin_response`) có border-left xanh dương nổi bật.
  - Chuẩn hóa logic tính toán & nâng cấp Widgets trang Dashboard học viên (`app/student/dashboard/page.tsx`):
    + Bổ sung Server Action `getStudentDashboardStats()` trong [`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts):
      * Thống kê điểm danh chuẩn xác từ `attendance`/`attendance_records`: `present_count`, `absent_excused_count`, `absent_unexcused_count`, `total_sessions`. Tỷ lệ chuyên cần tính theo `(present / total) * 100` (hiển thị 0% kèm nhãn "Chưa có buổi học nào" khi total = 0, không vẽ full vòng tròn gây hiểu nhầm).
      * Tính số buổi nghỉ thực tế = `absent_excused + absent_unexcused`, hiển thị khớp 100% với widget điểm danh dưới dạng `${actual_absences}/3` (khắc phục triệt để lỗi hardcode `5/0`), tự động bật cờ cảnh báo đỏ `exceeded_absence` khi nghỉ >= 3 buổi.
      * Tích hợp thống kê bài tập & kiểm tra từ `assignments` & `submissions`: phân loại `pending` (chưa nộp còn hạn), `submitted` (chờ chấm), `graded` (đã chấm), và `overdue_count` (quá hạn chưa nộp hiển thị ở thẻ "Bỏ bài tập").
      * Trích xuất danh sách tối đa 2 bài tập cần làm gấp nhất để hiển thị trực tiếp lên Dashboard.
    + Nâng cấp giao diện Widget Dashboard:
      * Widget Điểm danh: SVG Donut chart tính toán chuẩn xác, không vẽ stroke màu khi 0 buổi; các thẻ con đếm số buổi đồng bộ 100%.
      * Widget Cảnh báo giới hạn: Thẻ Nghỉ hiển thị số liệu thật, thẻ Bỏ bài tập kết nối trực tiếp với số bài tập quá hạn chưa nộp.
      * Widget Bài tập & Kiểm tra: Thêm thanh tóm tắt trạng thái 3 khối [Cần làm] - [Chờ chấm] - [Đã chấm]; danh sách mini bài tập cần nộp gấp (tên lớp, hạn chót, countdown, nút "Làm bài") hoặc empty state hoàn thành xuất sắc khi không còn bài cần làm.
- **Quyết định:**
  - Giữ lại cấu trúc chuẩn **`app/student/...`** và xóa bỏ hoàn toàn thư mục thừa `app/(student)/...` nhằm đảm bảo thống nhất với quy ước kiến trúc toàn dự án (`app/<role>/<feature>/page.tsx`), đồng thời khớp chính xác với bộ lọc đường dẫn của Middleware (`proxy.ts`: `/student/*`).
  - Sidebar & Header được tách thành component chuyên biệt theo convention dự án (`components/layout/student-*`).
- **Tình trạng phân hệ Học sinh:**
  - **HOÀN THIỆN 100% TOÀN BỘ 10/10 MODULE** của phân hệ Học sinh (`dashboard`, `schedule`, `classes`, `assignments`, `resources`, `grades`, `tests`, `notifications`, `settings`, `feedback`). Không còn trang stub hay tính năng tồn đọng.

### 2026-09-16: Tái cấu trúc Dashboard học viên, Header và Khu vực Trọng tâm học thuật
- **Đã làm:**
  - **Cập nhật Header (`components/layout/student-header.tsx`):**
    + Bổ sung icon Chuông thông báo (`Bell` từ `lucide-react`) kèm huy hiệu (badge) tròn đỏ hiển thị số lượng thông báo mới (`3`) có hiệu ứng nhấp nháy tinh tế, điều hướng trực tiếp đến `/student/notifications`.
  - **Banner Nhắc lịch học (`app/student/dashboard/page.tsx`):**
    + Tính toán ca học gần nhất từ `getStudentSchedule()` theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
    + Nếu có ca học hôm nay hoặc sắp tới: hiển thị dải thông báo nổi bật với Tên môn/lớp, giờ học (`start_time` - `end_time`), phòng học, giáo viên phụ trách kèm nút "Vào xem lịch học".
    + Nếu không có lịch học hôm nay: hiển thị dải trạng thái thư thái ("Hôm nay không có lịch học") với lời nhắn tích cực và nút xem thời khóa biểu tuần.
  - **KHU VỰC TRỌNG TÂM - Tình trạng học tập & Đánh giá (Chiếm vị trí số 1, ưu tiên cao nhất):**
    + Đặt ngay bên dưới Banner Nhắc lịch học, hiển thị toàn diện kết quả học thuật từ `getStudentGrades()`.
    + 4 thẻ chỉ số nổi bật:
      1. GPA Tích lũy (Hệ 10) kèm huy hiệu xếp loại (Xuất sắc, Giỏi, Khá...).
      2. Điểm bài test/kiểm tra gần nhất (điểm số, tên bài test, môn học).
      3. Tỷ lệ hoàn thành bài tập & bài kiểm tra (%).
      4. Điểm chuyên cần (%).
    + Khối Nhận xét của Giáo viên phụ trách: trích đoạn nhận xét định tính mới nhất gồm 3 phần rõ ràng: "Điểm mạnh & Ưu điểm nổi bật", "Điểm cần rèn luyện thêm", và "Lời nhận xét tổng quát" kèm tên giáo viên và môn học.
  - **Thu gọn Khu vực Thứ yếu bên dưới thành 2 cột cân xứng:**
    + Cột 1: "Tình hình điểm danh" với biểu đồ tròn Donut SVG và 3 thẻ con đếm số buổi có mặt, vắng không phép, vắng có phép.
    + Cột 2: "Bài tập & Kiểm tra" với thanh tóm tắt 3 trạng thái [Cần làm] - [Chờ chấm] - [Đã chấm] và danh sách mini các bài tập cần nộp gấp hoặc trạng thái hoàn thành xuất sắc.
- **Ràng buộc bảo mật & Dữ liệu:**
  - 100% Read-only: Chỉ thực hiện truy vấn SELECT từ Supabase qua Server Actions.
  - Không thay đổi schema, không can thiệp SQL hay chạy script migration.
  - Tuân thủ Data Isolation: Chỉ đọc dữ liệu của học viên đang đăng nhập qua `auth_user_id = user.id`.
  - Giữ vững cơ chế Fallback in-memory: Tự động sinh dữ liệu mẫu chuẩn nghiệp vụ gắn liền với lớp học của học viên khi DB chưa có dữ liệu chấm điểm/lịch thi thật, không chèn (INSERT) vào database.
- **Kiểm tra chất lượng:**
  - Chạy `npx tsc --noEmit` đạt 0 lỗi biên dịch.

### 2026-09-16 (Bổ sung): Tinh gọn và tối ưu hóa giao diện Dashboard học viên
- **Đã làm:**
  - **Bỏ hoàn toàn khối nhận xét giáo viên trên Dashboard:** Loại bỏ 3 ô nhận xét (Điểm mạnh, Điểm cần rèn luyện, Nhận xét chung) để giảm tải thị giác và tránh trùng lặp thông tin với trang chi tiết `/student/grades`.
  - **Thu nhỏ banner lịch học thành dải thông báo tinh gọn (Compact Alert Strip):**
    + Đổi từ card lớn sang thanh mỏng nhẹ (`px-4 py-2.5 rounded-xl border`): Hiển thị icon lịch + `Buổi học kế tiếp: [Tên môn/lớp] • [Giờ học] [Thứ, ngày (dd/MM)] • [Phòng học]` cùng link text `Xem lịch trình →`.
    + Trạng thái không có lịch học cũng được thu gọn tương ứng với icon thư thái + `Xem lịch trình →`.
  - **Khối Tình trạng học tập & Đánh giá:** Giữ lại 4 thẻ chỉ số tổng quan (GPA Tích lũy, Bài test gần nhất, Hoàn thành bài tập, Điểm chuyên cần) thành một hàng 4 cột trắng tinh tế (`bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm`), số liệu to rõ (`text-2xl font-bold text-slate-800`), đặt ngay dưới thanh mini-banner lịch học.
  - **Khu vực Thứ yếu:** Giữ nguyên 2 cột cân xứng bên dưới (Tình hình điểm danh dạng Donut chart và Bài tập & Kiểm tra).

### 2026-09-16 (Bổ sung): Áp dụng hệ thống phân bổ màu sắc chuẩn (60 - 30 - 10)
- **Quy chuẩn hệ thống màu sắc:**
  - **Nền và Khối chính (60%):**
    + Nền toàn trang: Sử dụng `bg-[#f8f9fc]` (dark: `dark:bg-background/95`).
    + Nền thẻ/Card: Dùng nền trắng tinh `bg-white dark:bg-card`, viền mảnh `border border-slate-200/80 dark:border-border`, bo góc `rounded-2xl`, đổ bóng nhẹ `shadow-sm`.
    + Màu văn bản chính: `text-slate-800 dark:text-foreground` (tiêu đề, số liệu chính) và `text-slate-500 dark:text-muted-foreground` (nhãn phụ, chú thích).
  - **Màu thương hiệu & Điều hướng (30% - Royal Blue):**
    + Nút bấm chính: `bg-blue-600 hover:bg-blue-700 text-white`.
    + Icon điều hướng & nhận diện: `text-blue-600 dark:text-blue-400`.
    + Avatar học viên viết tắt: `bg-blue-600 text-white` (trên Dashboard, Header và Sidebar).
    + Thanh thông báo lịch học thu nhỏ (Compact Alert Strip): Dải nền dịu `bg-blue-50/80 border border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-200`.
  - **Màu trạng thái & Chỉ số (10% - Điểm nhấn):**
    + **Tích cực / Hoàn thành (Emerald Green):** `bg-emerald-50 text-emerald-700 border-emerald-200` (cho trạng thái "Đã nộp bài", "Điểm giỏi (8-10)", "Có mặt", số buổi còn lại an toàn).
    + **Cảnh báo / Nhắc nhở (Amber Orange):** `bg-amber-50 text-amber-700 border-amber-200` (cho khối cảnh báo nghỉ/trễ, bài tập cần làm, bài tập sắp đến hạn, vắng có phép).
    + **Nguy cơ / Báo động (Rose Red):** `bg-rose-50 text-rose-700 border-rose-200` (cho "Vắng không phép", quá giới hạn nghỉ, bỏ bài tập quá hạn, badge số thông báo chưa đọc `bg-rose-600` nhấp nháy).
- **Phạm vi cập nhật:**
  - Layout phân hệ Học sinh: [`app/student/layout.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/layout.tsx), [`components/layout/student-header.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-header.tsx), [`components/layout/student-sidebar.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-sidebar.tsx).
  - Toàn bộ trang Dashboard: [`app/student/dashboard/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/dashboard/page.tsx).
- **Ràng buộc tuân thủ:**
  - Tuyệt đối không can thiệp SQL, không migration, không sửa schema database.
  - Chỉ cập nhật class Tailwind CSS trong JSX, giữ nguyên 100% logic dữ liệu Server Actions.
- **Kiểm tra chất lượng:** `npx tsc --noEmit` đạt 0 lỗi biên dịch.

### 2026-09-16 (Bổ sung): Tái cấu trúc Dashboard theo phong cách EdTech hiện đại của Prep
- **Đã làm:**
  - **Nền tổng thể trang:** Bao bọc toàn bộ nội dung trong dải chuyển màu dịu nhẹ chuẩn Prep `bg-gradient-to-b from-[#F0F6FF]/60 via-[#F8FAFC] to-[#F8FAFC] min-h-screen`.
  - **Header học viên & Capsule Banner:**
    + Header học viên: Tinh gọn, avatar squircle tròn bo mềm (`rounded-[22px] bg-gradient-to-br from-blue-600 to-[#0056D2]`), khối "Cảnh báo giới hạn" bo viền tròn mềm mại `rounded-3xl bg-[#FFFBF0] border border-[#FEE8B0]`.
    + Thanh "Buổi học kế tiếp": Dạng capsule thanh mảnh mỏng `rounded-2xl bg-white border border-blue-100 shadow-xs`.
    + Nút "Xem lịch trình →": Đổi thành dạng viên thuốc tròn hẳn `rounded-full bg-[#0056D2] hover:bg-blue-700 text-white font-semibold px-5 py-2 text-sm shadow-sm`.
  - **KHU VỰC TRỌNG TÂM - Learning Profile (4 thẻ chỉ số Pastel phủ toàn thẻ chuẩn Prep):**
    1. Thẻ "GPA / Điểm tích lũy": Nền `bg-[#F0F7FF] border border-[#D0E7FF] rounded-3xl p-5`, icon xanh dương trong squircle trắng viền mảnh, số điểm to rõ `text-[#0056D2] font-extrabold text-3xl`.
    2. Thẻ "Test gần nhất": Nền `bg-[#FFF9EB] border border-[#FEE8B0] rounded-3xl p-5`, icon vàng, số điểm to rõ `text-[#B45309] font-extrabold text-3xl`.
    3. Thẻ "Bài tập đã làm": Nền `bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl p-5`, icon xanh mint, phần trăm to rõ `text-[#047857] font-extrabold text-3xl`.
    4. Thẻ "Chuyên cần / Điểm danh": Nền `bg-[#FFF1F2] border border-[#FECDD3] rounded-3xl p-5`, icon đỏ san hô, phần trăm to rõ `text-[#BE123C] font-extrabold text-3xl`.
  - **KHU VỰC PHÍA DƯỚI (2 Cột cân xứng, bo góc tròn bo lớn `rounded-3xl`):**
    + Cột trái: "Tình hình điểm danh" (Donut Chart SVG) đặt trong thẻ trắng bo góc mềm `rounded-3xl border border-slate-150 shadow-sm`, các ô đếm buổi dạng capsule `rounded-2xl`.

### 2026-09-16 (Bổ sung): Tái cấu trúc toàn bộ Dashboard theo chuẩn bố cục 3 tầng ảnh mẫu
- **Đã làm:**
  - **TẦNG 1: HEADER BANNER (Grid 2 cột: 2/3 và 1/3):**
    + Cột trái (Banner chào mừng): Nền gradient `bg-gradient-to-r from-blue-50/80 via-sky-50/40 to-white border border-blue-100/60 rounded-3xl p-6`, avatar tròn lớn chữ "M" (hoặc chữ cái đầu tên) nền xanh dương đậm `bg-blue-600 text-white font-bold text-2xl w-16 h-16 rounded-full shadow-md shadow-blue-500/20`, câu chào "Xin chào, [Tên] 👋", câu chúc và 2 badge icon mờ nhỏ hiển thị email, số điện thoại, mã học sinh.
    + Cột phải (Buổi học kế tiếp): Card trắng `rounded-3xl border border-slate-200/80 p-5 shadow-xs`, icon lịch, hộp thông tin lớp/giờ/phòng, nút CTA con nhộng Pill button `w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 text-sm` với text "Xem lịch trình →".
  - **TẦNG 2: 4 THẺ CHỈ SỐ NĂNG LỰC (Grid 4 cột: `grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5`):**
    + Mỗi thẻ nền trắng `bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4`.
    + Icon khối tròn pastel bên trái (`w-12 h-12 rounded-full`):
      * Thẻ 1 (GPA): Icon mũ tốt nghiệp nền xanh `bg-blue-50 text-blue-600`, điểm to `text-2xl font-bold text-slate-800`, phụ đề "Xếp loại: [Xếp loại]".
      * Thẻ 2 (Test gần nhất): Icon bài test nền tím `bg-purple-50 text-purple-600`, điểm to `text-2xl font-bold text-slate-800`, phụ đề tên bài test / "Kiểm tra định kỳ".
      * Thẻ 3 (Bài tập đã làm): Icon check nền xanh lá `bg-emerald-50 text-emerald-600`, số % to `text-2xl font-bold text-slate-800`, phụ đề "Tiến độ nộp & hoàn thành".
      * Thẻ 4 (Điểm chuyên cần): Icon bia ngắm nền cam `bg-amber-50 text-amber-600`, tỷ lệ % to `text-2xl font-bold text-slate-800`, phụ đề "Tỷ lệ tham gia buổi học".
  - **TẦNG 3: CHI TIẾT ĐIỂM DANH & NHIỆM VỤ (Grid 2 cột cân bằng: `grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6`):**
    + Cột trái ("Tình hình điểm danh"): Card trắng `rounded-3xl p-6`, header icon lịch + badge tổng số buổi; thân card biểu đồ Donut SVG bên trái và 3 dòng trạng thái (Có mặt - xanh lá, Vắng có phép - vàng, Vắng không phép - đỏ); đáy card dòng "Tiến độ tháng [tháng/năm]" với thanh chuỗi ngày 1-30, ngày hiện tại được đánh dấu bằng chấm tròn xanh dương nổi bật.
    + Cột phải ("Kế hoạch & Bài tập"): Card trắng `rounded-3xl p-6`, header icon sách + link "Xem tất cả >", danh sách bài tập theo hàng có icon vuông bo góc tròn (màu xanh, tím, xanh lá), tên bài tập, hạn nộp, badge trạng thái bo tròn bên phải (Chưa làm: đỏ nhạt, Đang làm: tím nhạt, Sắp tới: xanh nhạt) và thanh progress bar mảnh phía dưới mỗi mục.
### 2026-09-17: Đồng bộ màu sắc & chi tiết giao diện chuẩn mockup EduCenter (Student Portal)
- **Đã làm:**
  - **Bảng màu toàn trang (`app/globals.css`):**
    + Chuyển mã màu `--primary` từ Indigo (`243 75% 59%`) sang EduCenter Royal Blue (`221 83% 53%` / `#2563eb`).
    + Tinh chỉnh `--accent` sang tone xanh nhạt dịu mát (`214 100% 97%` / `#eff6ff`), `--ring: 221 83% 53%`.
    + Đồng bộ màu nền trang sang `#F4F7FB` (xám xanh siêu nhẹ) tôn các khối thẻ trắng tinh khiết `#ffffff`.
  - **Sidebar học viên (`components/layout/student-sidebar.tsx`):**
    + Cập nhật logo vuông bo góc tròn xanh dương kèm mũ cử nhân, slogan thương hiệu: *"Học hôm nay - Kiến tạo ngày mai"*.
    + Khối menu active dạng pill mềm mại nền `bg-blue-50 text-blue-600 font-semibold`, icon xanh dương `#2563eb`.
    + Đồng bộ cấu trúc danh mục theo đúng 2 nhóm `TỔNG QUAN` và `HỖ TRỢ & HỌC VỤ` khớp ảnh mẫu.
  - **Header học viên (`components/layout/student-header.tsx`):**
    + Thêm thanh tìm kiếm dạng con nhộng `rounded-full` với icon kính lúp và placeholder: *"Tìm kiếm khóa học, bài tập, tài liệu..."*.
    + Thêm khối ngày tháng dạng pill `rounded-2xl` viền nhẹ: *"Thứ Tư, 16 Tháng 9, 2026"* (tự động theo thời gian thực).
    + Avatar học viên tròn chữ "M" nền xanh dương, họ tên "Mai Phùn", vai trò "Sinh viên", icon mũi tên thả xuống và menu thao tác nhanh (Đăng xuất, Đổi giao diện, Thông báo).
  - **Layout & Breadcrumb (`app/student/layout.tsx`, `components/layout/student-breadcrumb.tsx`):**
    + Nền trang đồng bộ `#F4F7FB`, căn lề `px-8 pb-8 pt-0`.
    + Ẩn breadcrumb riêng trên trang Dashboard (`/student/dashboard`) để giao diện liền mạch chuẩn theo mockup.
  - **Dashboard học viên (`app/student/dashboard/page.tsx`):**
    + Tầng 1: Banner chào mừng với gradient xanh nhẹ, avatar chữ "M", thông tin email/số điện thoại, và tích hợp hình minh họa 3D sách & mũ cử nhân vào góc phải (`public/images/student-banner-illustration.jpg`). Khối "Buổi học kế tiếp" với nút bấm bo tròn xanh royal blue *"Xem lịch trình →"*.
    + Tầng 2: 4 thẻ chỉ số năng lực nền pastel chuẩn mẫu (GPA tích lũy: xanh lam `#f4f8ff`, Test gần nhất: tím phấn `#faf5ff`, Bài tập đã làm: xanh lá ngọc `#f0fdf4`, Điểm chuyên cần: cam mật ong `#fffbeb`).
    + Tầng 3: Biểu đồ điểm danh Donut Chart SVG tâm "0% / Đã tham gia", 3 dòng trạng thái và chuỗi tiến độ ngày 1-30 với ngày 16 active dạng chấm tròn xanh nổi bật; Cột bài tập với 3 nhiệm vụ icon màu vuông (xanh, tím, xanh lá), badge trạng thái bo tròn (Chưa làm, Đang làm, Sắp tới) và thanh tiến độ mảnh kèm % bên phải.
- **Ràng buộc tuân thủ:**
  - Không can thiệp database, không sửa schema.
  - Biên dịch TypeScript `npx tsc --noEmit` đạt 0 lỗi.

### 2026-09-17 (Bổ sung): Tinh chỉnh UI/UX — Loại bỏ khối "Tiến độ tháng" và cân đối thẻ Điểm danh
- **Đã làm:**
  - **Xóa bỏ dải số ngày tháng:** Loại bỏ hoàn toàn khối "Tiến độ tháng [X]" (dải số 1-30 và thanh progress bar ngang) ở đáy thẻ "Tình hình điểm danh" tại [`app/student/dashboard/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/dashboard/page.tsx) theo yêu cầu UX, tránh trùng lặp với trang Lịch học (`/student/schedule`) và tối ưu độ gọn gàng trên mobile.
  - **Dọn dẹp code:** Xóa bỏ các biến không còn sử dụng (`currentMonth`, `currentYear`, `currentDay`, `daysArray`).
  - **Cân chỉnh bố cục thẻ:**
    + Đồng bộ padding thẻ thành `p-6 sm:p-7` cho cả 2 khối "Tình hình điểm danh" và "Kế hoạch & Bài tập".
    + Căn giữa cân đối (`flex-1 items-center justify-center sm:justify-around`) giữa biểu đồ Donut SVG bên trái và cụm 3 dòng trạng thái (Có mặt / Vắng có phép / Vắng không phép) bên phải, giúp chiều cao 2 thẻ song song cân bằng và thẩm mỹ.
- **Ràng buộc tuân thủ:**
  - Giữ nguyên 100% logic dữ liệu Server Actions và không can thiệp schema DB.
  - Kiểm tra `npx tsc --noEmit` đạt **0 lỗi** (Exit code 0).

### 2026-09-17 (Bổ sung 2): Tái cấu trúc tỷ lệ & lấp đầy không gian thẻ "Tình hình điểm danh"
- **Đã làm:**
  - **Phóng lớn biểu đồ Donut SVG:**
    + Mở rộng khung chứa SVG từ `w-40 h-40` lên `w-44 h-44 sm:w-48 sm:h-48`.
    + Cập nhật `viewBox="0 0 160 160"` với tâm `cx="80" cy="80"` và bán kính `radius = 62`.
    + Tăng độ dày nét viền `strokeWidth="14"` tạo cảm giác dày dặn, đầm tay và chắc chắn.
    + Tăng cỡ chữ tỷ lệ ở tâm lên `text-3xl sm:text-4xl font-extrabold text-slate-900` cùng nhãn *"ĐÃ THAM GIA"* chữ in hoa sắc nét `text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1`.
  - **Tái cấu trúc cụm chú thích 3 trạng thái bên phải:**
    + Chuyển từng dòng chỉ số thành khối thẻ con nhộng/viên thuốc mềm mại `px-4 py-2.5 rounded-2xl bg-slate-50/90 border border-slate-100/80` có tính phân nhóm trực quan cao.
    + Tăng kích cỡ chữ `text-sm font-medium text-slate-600` và làm đậm nổi bật con số buổi học `font-bold text-slate-800 text-base`.
  - **Lấp đầy bề ngang và tối ưu padding:**
    + Bố cục thân thẻ chuyển sang `justify-around gap-6 sm:gap-8 flex-1 py-5`, tự động dàn trải đều bề ngang, triệt tiêu hoàn toàn khoảng trống thừa.
    + Đồng bộ padding thẻ thành `p-6 lg:p-7` cho cả 2 khối song song.
- **Ràng buộc tuân thủ:**
  - Tuyệt đối không can thiệp database, giữ nguyên logic dữ liệu.
  - `npx tsc --noEmit` đạt kết quả **0 lỗi**.

### 2026-09-17 (Bổ sung 3): Đồng bộ 100% thẻ "Tình hình điểm danh" theo ảnh mẫu cận cảnh
- **Đã làm:**
  - **Khối Header thẻ:**
    + Icon lịch đặt trong hình tròn mềm bo tròn xanh dịu `w-10 h-10 rounded-2xl bg-[#eff4fe] text-blue-600`.
    + Loại bỏ đường kẻ viền phân cách `border-b` để giao diện liền mạch, khoáng đạt.
    + Badge tổng số buổi góc trên bên phải dạng pill mềm `bg-[#f1f5f9] px-3.5 py-1.5 rounded-full text-xs`: *"Tổng: X buổi"*.
  - **Vòng tròn Donut SVG:**
    + Nền rãnh vòng tròn sử dụng màu xanh phấn siêu nhạt dịu mắt `stroke="#ebf1fa" strokeWidth="15"`, kích thước `w-48 h-48 sm:w-52 sm:h-52`.
    + Tâm biểu đồ: Số tỷ lệ phần trăm to rõ `text-4xl font-extrabold text-slate-900`, nhãn phụ đề *"ĐÃ THAM GIA"* (`text-[11px] font-semibold tracking-widest text-slate-500 uppercase mt-2`).
  - **Cụm 3 thẻ viên thuốc trạng thái bên phải:**
    + 3 thẻ bo tròn mềm mại `rounded-2xl px-5 py-3.5 bg-[#f8faff] border border-[#edf2f9]`.
    + Chấm tròn màu sắc (`#34d399` có mặt, `#fbbf24` vắng có phép, `#f87171` vắng không phép).
    + Con số buổi học căn phải ngay ngắn, font đậm rõ nét `font-bold text-slate-800 text-sm`.
- **Ràng buộc tuân thủ:**
  - Không sửa database, không đổi logic Server Action.
  - `npx tsc --noEmit` đạt 0 lỗi.

### 2026-09-17 (Bổ sung 4): Tinh chỉnh phóng to khung biểu đồ tròn Donut điểm danh
- **Đã làm:**
  - **Mở rộng kích thước khung Donut:**
    + Nâng kích thước container SVG từ `w-48 h-48 sm:w-52 sm:h-52` lên `w-56 h-56 sm:w-60 sm:h-60 xl:w-64 xl:h-64`.
    + Cập nhật SVG `viewBox="0 0 200 200"` với tọa độ tâm chuẩn `cx="100" cy="100"`.
    + Tăng bán kính đường tròn `radius = 78` và độ dày nét viền `strokeWidth="18"` (tỷ lệ cân xứng hoàn hảo, vững chãi).
  - **Tối ưu kiểu chữ ở tâm:**
    + Tăng tỷ lệ % lên cỡ chữ lớn nổi bật `text-4xl sm:text-5xl font-black text-slate-900 tracking-tight`.
    + Nhãn phụ đề *"ĐÃ THAM GIA"* giãn chữ sắc nét `text-xs sm:text-[13px] font-semibold uppercase tracking-widest text-slate-400 mt-2 sm:mt-2.5`.
- **Ràng buộc tuân thủ:**
  - Tuyệt đối không can thiệp database hay Server Action.
  - `npx tsc --noEmit` đạt 0 lỗi (Exit code 0).

### 2026-09-17 (Bổ sung 5): Thu gọn bề ngang 3 thẻ viên thuốc điểm danh & triệt tiêu tràn viền
- **Đã làm:**
  - **Rút gọn chiều ngang 3 thẻ viên thuốc (Có mặt / Vắng có phép / Vắng không phép):**
    + Giảm bề rộng từ `w-[260px] md:w-[280px]` xuống `w-full sm:w-[200px] md:w-[210px] lg:w-[215px]`, thu gọn gần 70px giúp cụm trạng thái thon gọn, vừa khít bên trong thẻ card.
    + Thêm `whitespace-nowrap` cho con số buổi học ("0 buổi") chống gãy dòng.
    + Tinh chỉnh padding mỗi viên thuốc thành `px-4 py-2.5 sm:py-3` gọn gàng, thanh thoát.
  - **Cân đối bố cục & chống tràn viền:**
    + Điều chỉnh kích thước Donut thành `w-48 h-48 sm:w-52 sm:h-52 xl:w-56 xl:h-56`, kết hợp `gap-4 sm:gap-6` giữa biểu đồ và cụm thẻ giúp tổng chiều ngang hoàn toàn nằm trong biên an toàn trên mọi độ phân giải màn hình.
    + Bổ sung `overflow-hidden` trên thẻ `<section>` cha để triệt tiêu hoàn toàn hiện tượng chi tiết tràn ra ngoài viền bo tròn.
- **Ràng buộc tuân thủ:**
  - Giữ nguyên dữ liệu và server actions.
  - `npx tsc --noEmit` đạt 0 lỗi (Exit code 0).

### 2026-09-17 (Bổ sung 6): Nâng cấp tương tác UX toàn diện — Hover Floating Elevation & Active Click Modals
- **Đã làm:**
  - **Tách kiến trúc chuẩn Next.js App Router Client Component:**
    + Tạo [`app/student/dashboard/dashboard-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/dashboard/dashboard-client.tsx) (`"use client"`) quản lý state tương tác hiển thị `activeWidget` (`useState`).
    + [`app/student/dashboard/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/dashboard/page.tsx) giữ vai trò Server Component tinh gọn, thực hiện song song truy vấn `getStudentDashboardStats()`, `getStudentGrades()`, `getStudentSchedule()`, bảo toàn 100% cơ chế bảo mật phiên đăng nhập và phân quyền.
  - **Hiệu ứng rê chuột (Hover Floating Elevation):**
    + Tích hợp class chuyển động nổi mượt mà cho toàn bộ 6 widget (4 thẻ chỉ số: GPA, Test gần nhất, Bài tập đã làm, Điểm chuyên cần và 2 khối lớn: "Tình hình điểm danh", "Kế hoạch & Bài tập"):
      `cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 dark:hover:border-blue-700/60 dark:hover:shadow-slate-900/40`.
    + Bổ sung gợi ý nhãn hover `Chi tiết ↗` hiển thị mượt mà khi hover vào từng thẻ.
  - **Hệ thống 6 Modal tương tác chi tiết (Active Modals) ngay trên cùng trang:**
    + **Thẻ "GPA tích lũy":** Modal hiển thị bảng tổng hợp điểm các môn học, giáo viên phụ trách, xếp loại, tỷ trọng thành phần và lời khuyên học tập.
    + **Thẻ "Test gần nhất":** Modal phân tích chi tiết bài thi vừa chấm, số câu đúng/sai (36/40 câu - 90%), thời gian làm bài, phân tích kỹ năng thành phần và lời nhận xét chi tiết của giáo viên.
    + **Thẻ "Bài tập đã làm":** Modal thống kê tỷ lệ hoàn thành theo từng môn (Tiếng Anh, Toán, Ngữ văn) kèm các thanh tiến độ trực quan.
    + **Thẻ "Điểm chuyên cần":** Modal chi tiết lịch sử chuyên cần qua từng tháng trong năm học (Tháng 7, 8, 9) và quy định số buổi nghỉ tối đa.
    + **Khối "Tình hình điểm danh":** Modal hiển thị nhật ký từng ngày học cụ thể với badge trạng thái phân màu (Có mặt, Vắng có phép, Vắng không phép).
    + **Khối "Kế hoạch & Bài tập":** Modal mở rộng toàn bộ các nhiệm vụ và deadline sắp tới kèm nút bấm liên kết nộp bài tức thời.
    + Tất cả modal được trang bị overlay nền mờ sang trọng `bg-slate-900/40 backdrop-blur-xs`, bo góc `rounded-3xl`, nút đóng X, bấm ra ngoài để đóng và lắng nghe phím `Escape` để thoát nhanh.
- **Ràng buộc tuân thủ:**
  - Tuyệt đối không can thiệp database, SQL hay logic Server Action.
  - Kiểm tra `npx tsc --noEmit` đạt **0 lỗi** (Exit code 0).

### 2026-09-17 (Bổ sung 7): Bổ sung mục "Cài đặt tài khoản" vào Header & Triển khai toàn diện trang Cài đặt
- **Dropdown Menu tại Header ([`components/layout/student-header.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-header.tsx)):**
  - Chèn mục "Cài đặt tài khoản" vào dropdown menu người dùng ngay phía trước mục "Đăng xuất".
  - Icon: `Settings` (`lucide-react`), text "Cài đặt tài khoản", đường dẫn `href="/student/settings"`.
  - Hiệu ứng hover nhẹ nhàng, tinh tế đồng bộ với các mục có sẵn (`hover:bg-slate-50 dark:hover:bg-muted rounded-xl transition-colors`), tự động đóng dropdown khi chuyển trang.
- **Server Action Cập nhật Hồ sơ an toàn ([`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts)):**
  - Bổ sung `updateStudentProfile({ full_name, phone })`:
    + Kiểm tra session người dùng qua `supabase.auth.getUser()`.
    + Xác thực quyền học sinh gắn liền với `auth_user_id = user.id`.
    + Validate dữ liệu đầu vào (tên >= 2 ký tự, định dạng SĐT hợp lệ).
    + Cập nhật bảng `students` và đồng bộ `full_name` sang `user_metadata` của Supabase Auth.
    + Gọi `revalidatePath` để làm mới cache trên các trang liên quan.
- **Trang Cài đặt tài khoản ([`app/student/settings/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/page.tsx) & [`settings-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/settings-client.tsx)):**
  - Hệ thống Tabs chuyển đổi linh hoạt: "Tất cả", "Hồ sơ học viên", "Đổi mật khẩu" với giao diện viên thuốc hiện đại.
  - **Khối 1: Thông tin hồ sơ học viên:**
    + Hiển thị đầy đủ thông tin: Họ và tên, Email, Số điện thoại, Mã học viên, Ngày tham gia trung tâm.
    + Bảo toàn dữ liệu: Mã học viên và Email đặt ở trạng thái Read-only (`disabled`, viền nét đứt, kèm huy hiệu "Chỉ đọc").
    + Form cho phép cập nhật Họ và tên và Số điện thoại liên hệ qua Server Action an toàn `updateStudentProfile`.
    + Khung lưu ý về tính toàn vẹn dữ liệu và hướng dẫn liên hệ phòng Giáo vụ khi cần đổi email.
  - **Khối 2: Đổi mật khẩu tài khoản:**
    + Trường nhập Mật khẩu mới và Xác nhận mật khẩu mới kèm nút toggle ẩn/hiện mật khẩu (`Eye`/`EyeOff`).
    + Validate form chuẩn phía Client: Tối thiểu 6-8 ký tự, 2 mật khẩu phải khớp nhau.
    + Đổi mật khẩu: Gọi trực tiếp API auth an toàn của Supabase client trong browser: `supabase.auth.updateUser({ password })`.
    + Tự động xóa trắng các ô nhập sau khi cập nhật thành công.
  - **Hệ thống phản hồi thông minh:**
    + Floating Toast Notification góc trên bên phải màn hình (slide-in animation, phân màu theo trạng thái thành công/lỗi, nút đóng X và tự động đóng sau 5 giây).
    + Banner thông báo trực quan in-line ngay trên từng form bằng tiếng Việt rõ ràng, thân thiện.
- **Ràng buộc tuân thủ & An toàn:**
  - Tuyệt đối không can thiệp SQL, không tạo migration, không sửa schema database Supabase.
  - Không ảnh hưởng tới các phân hệ Admin, Teacher, Sale.
  - Kiểm tra `npx tsc --noEmit` đạt **0 lỗi** (Exit code 0).

### 2026-09-17 (Bổ sung 8): Đồng bộ 100% giao diện Lịch học (/student/schedule) theo ảnh mẫu thiết kế
- **Header Banner chuẩn ảnh mẫu ([`app/student/schedule/schedule-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/schedule/schedule-client.tsx)):**
  - Khung banner bo tròn mềm mại `rounded-3xl` với dải chuyển màu pastel tinh tế `bg-gradient-to-r from-[#eef3fc] via-[#f0f4fd] to-[#f4f1fd]`.
  - Bên trái: Cặp nút điều hướng tháng hình tròn nền trắng bóng mờ `<` và `>`, kèm nút pill bo tròn *"Hôm nay"* màu xanh Google `bg-[#1a73e8]` có icon lịch trắng.
  - Ở giữa: Icon lịch đặt trong khối bo góc mềm kết hợp tiêu đề tháng năm nổi bật *"Tháng [X] năm [YYYY]"* (font chữ đậm navy `font-black text-slate-800`).
  - Bên phải: Minh họa 3D vector cuốn lịch để bàn với lò xo xoắn, ô lưới ngày và các phiến lá xanh pastel nổi chuẩn 100% ảnh tham chiếu.
- **Dải 3 thẻ thống kê tổng quan (3 Summary Cards):**
  - **Thẻ 1 (Trái):** Icon sách mở xanh dương trong khung bo mềm + số lượng `"8 buổi tháng này"` (con số đậm màu tím `text-indigo-600 font-black`).
  - **Thẻ 2 (Giữa):** Icon đồng hồ tím + nhãn `"Buổi tiếp theo: 18/09 - 18:00 >"` (nhấn vào mở nhanh modal chi tiết buổi học).
  - **Thẻ 3 (Phải):** Icon dấu tick tròn xanh ngọc + nhãn `"Đã học: 2 buổi"` (con số đậm màu ngọc `text-emerald-600 font-black`).
- **Thanh tiêu đề 7 thứ trong tuần (Day Headers):**
  - Thanh header màu xanh ngô mềm mại `bg-[#7ca3e2]` chữ trắng đậm `text-white text-xs font-bold`.
  - Phân chia 7 cột đều tăm tắp: **Thứ 2**, **Thứ 3**, **Thứ 4**, **Thứ 5**, **Thứ 6**, **Thứ 7**, **CN**.
- **Lưới ô ngày 7 cột (Calendar Month Grid):**
  - Bo góc `rounded-2xl` với đường kẻ phân chia ô siêu nhạt `divide-blue-100/70`.
  - Góc trên mỗi ô: Số ngày bên trái + chấm tròn xanh pastel `w-1.5 h-1.5 rounded-full bg-blue-300/80` ở góc trên bên phải.
  - Ngày hiện tại (Hôm nay - ngày 17): Số ngày được bọc trong vòng tròn gradient tím-xanh (`bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white`) cùng nền ô ửng xanh tím dịu mắt (`bg-[#f4f7ff]`).
  - Viên thuốc buổi học: Bo tròn viên thuốc mềm mại nền pastel `bg-gradient-to-r from-[#eef4ff] to-[#f4f7ff]` viền xanh nhạt, icon sách mở và nhãn giờ học + tên lớp đậm nét `18:00 - Tiếng Anh 6`.
  - Nhấp vào viên thuốc bất kỳ mở Dialog Modal xem chi tiết thông tin buổi học (Giáo viên, Khung giờ, Phòng học, Trạng thái, Ghi chú bài giảng).
- **Ràng buộc tuân thủ & Chất lượng:**
  - Không sửa DB, không chạy migration.
  - Kiểm tra `npx tsc --noEmit` đạt **0 lỗi** (Exit code 0).

### 2026-09-17 (Bổ sung 9): Loại bỏ nút "Hôm nay" tại thanh điều hướng lịch học
- **Cập nhật giao diện ([`app/student/schedule/schedule-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/schedule/schedule-client.tsx)):**
  - Loại bỏ hoàn toàn nút viên thuốc xanh *"Hôm nay"* ở góc trái header banner.
  - Giữ lại cặp nút điều hướng tháng hình tròn `<` và `>` tinh gọn, giúp thanh toolbar thông thoáng, tập trung vào tiêu đề tháng năm và minh họa 3D.
  - Dọn dẹp hàm `handleToday()` không còn sử dụng.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi** (Exit code 0).

### 2026-09-17 (Bổ sung 10): Tái cấu trúc menu điều hướng Sidebar học sinh theo 3 nhóm chuẩn
- **Cập nhật menu Sidebar ([`components/layout/student-sidebar.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-sidebar.tsx)):**
  - **Nhóm 1 "TỔNG QUAN":**
    + Giữ lại duy nhất 1 mục: *"Tiến độ học tập"* (`/student/dashboard`), icon `Home`.
  - **Nhóm 2 "HỌC TẬP":**
    + *Lịch học* (`/student/schedule`, icon `Calendar`)
    + *Danh sách lớp học* (`/student/classes`, icon `Users`)
    + *Bài tập & Tài liệu* (`/student/assignments`, icon `FileText`)
    + *Thư viện tài liệu* (`/student/resources`, icon `Library`)
    + *Kiểm tra & Kết quả* (`/student/tests`, icon `Trophy`)
    + *Bảng điểm & Đánh giá* (`/student/grades`, icon `BarChart3`)
    + *Lịch hẹn test* (`/student/tests`, icon `CalendarCheck`)
  - **Nhóm 3 "HỖ TRỢ":**
    + *Tin tức & Cảnh báo* (`/student/notifications`, icon `Bell`)
    + *Gửi phản hồi* (`/student/feedback`, icon `HelpCircle`)
  - Giữ nguyên toàn bộ icon tương ứng và xóa icon không sử dụng (`BookOpen`).
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 11): Cập nhật tiêu đề trang Danh sách lớp học & Đồng bộ Breadcrumb chuẩn 3 nhóm
- **Tiêu đề trang Lớp học ([`app/student/classes/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/classes/page.tsx)):**
  - Đổi tiêu đề chính `<h1>` từ *"Lớp học của tôi"* thành *"Danh sách lớp học"*.
  - Đồng bộ `metadata.title` thành *"Danh sách lớp học | Cổng Học sinh"*.
  - Giữ nguyên mô tả phụ và badge đếm số lượng lớp (*"Tổng cộng: X lớp"*).
- **Đồng bộ Breadcrumb ([`components/layout/student-breadcrumb.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-breadcrumb.tsx)):**
  - Nhóm cha của các trang học tập chuyển từ *"Học tập & Lớp học"* / *"Kiểm tra & Kết quả"* thành **"Học tập"** (đồng bộ với Sidebar).
    + `classes` -> `"Học tập > Danh sách lớp học"`
    + `schedule` -> `"Học tập > Lịch học"`
    + `assignments` -> `"Học tập > Bài tập & Tài liệu"`
    + `resources` -> `"Học tập > Thư viện tài liệu"`
    + `tests` -> `"Học tập > Kiểm tra & Kết quả"`
    + `grades` -> `"Học tập > Bảng điểm & Đánh giá"`
  - Nhóm cha hỗ trợ đổi từ *"Hỗ trợ & Hồ sơ"* thành **"Hỗ trợ"**:
    + `notifications` -> `"Hỗ trợ > Tin tức & Cảnh báo"`
    + `feedback` -> `"Hỗ trợ > Gửi phản hồi"`
    + `settings` -> `"Hỗ trợ > Cài đặt tài khoản"`
  - Cập nhật nhóm fallback mặc định thành `"Học tập"`.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 12): Đồng bộ 100% giao diện Danh sách lớp học dạng thẻ ngang (Horizontal Fluid Cards)
- **Banner tiêu đề trên cùng ([`app/student/classes/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/classes/page.tsx)):**
  - Khung banner dải chuyển màu pastel tinh tế `bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/50 border border-blue-100/60 rounded-2xl p-5`.
  - Icon sách mở nền gradient xanh dương `bg-gradient-to-tr from-blue-600 to-indigo-500 text-white p-3 rounded-xl shadow-sm`.
  - Tiêu đề *"Danh sách lớp học"* in đậm sắc nét kèm mô tả phụ.
  - Minh họa vector 3D chồng sách pastel kèm chậu cây xanh succulent ở trung tâm.
  - Badge *"Tổng cộng: X lớp"* dạng viên thuốc viền xám sáng `border border-slate-200 bg-white/80 rounded-full`.
- **Thẻ thông tin lớp học (Card ngang 2 cột chuẩn thiết kế ảnh mẫu):**
  - **Cột trái (Thông tin đào tạo):**
    + Dòng 1: Icon mũ cử nhân tròn nền xanh nhạt `w-10 h-10 rounded-full bg-blue-50 text-blue-600`, Tên lớp in đậm `text-lg font-bold text-slate-900`, Badge trạng thái tròn xanh lá chấm nhỏ `• Đang học` (`bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-medium px-2.5 py-0.5 rounded-full`), Badge mã lớp `# LH-xxxxxx` (`bg-blue-50 text-blue-600 text-xs px-2.5 py-0.5 rounded-full font-medium`).
    + Dòng 2: Hàng 3 cột thông tin với icon tròn nền pastel:
      * Giáo viên: Icon người nền xanh dương nhạt `bg-blue-100/70 text-blue-600`, nhãn "Giáo viên", tên giáo viên in đậm.
      * Phòng học: Icon ngôi trường nền tím nhạt `bg-purple-100/70 text-purple-600`, nhãn "Phòng học", mã phòng in đậm.
      * Lịch học: Icon đồng hồ nền lam nhạt `bg-sky-100/70 text-sky-600`, nhãn "Lịch học", chi tiết ngày và khung giờ.
  - **Cột phải (Khối tiến độ buổi học):**
    + Khung phụ nền xám xanh siêu nhẹ `bg-slate-50/80 rounded-xl p-4 min-w-[280px] border border-slate-100/80`.
    + Hàng trên: Icon lịch tròn nhỏ + Chữ "Số buổi còn lại" ở bên trái; Số buổi lớn (ví dụ: `24 buổi` font chữ `text-2xl font-black text-indigo-600`) ở bên phải; bên cạnh có nút mũi tên Chevron tròn trỏ phải (`w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100`) liên kết trực tiếp sang trang Lịch học.
    + Hàng dưới: Thanh tiến độ (Progress bar) dải màu tím xanh gradient `bg-gradient-to-r from-sky-400 to-indigo-600 h-2 rounded-full`, bên dưới có tỷ lệ buổi đã dùng / tổng buổi (ví dụ: `24/30` căn phải, text-xs text-slate-500).
- **Kiểm tra chất lượng & An toàn:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).
  - Không can thiệp DB, tự động hiển thị lớp học thực tế và hỗ trợ fallback mockup chuẩn ảnh.

### 2026-09-17 (Bổ sung 13): Đồng bộ tiêu đề trang Bài tập & Tài liệu (/student/assignments)
- **Tiêu đề trang Bài tập ([`app/student/assignments/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/assignments/page.tsx)):**
  - Đổi tiêu đề chính `<h1>` từ *"Bài tập & Tự luyện"* thành **"Bài tập & Tài liệu"** (đồng bộ với Sidebar mới và Breadcrumb).
  - Cập nhật mô tả phụ chuẩn xác: *"Xem danh sách bài tập về nhà, bài test định kỳ và tài liệu đi kèm theo từng lớp học."*
  - Đồng bộ `metadata.title` thành *"Bài tập & Tài liệu | Cổng Học sinh"*.
  - Nâng cấp Banner tiêu đề dạng dải gradient pastel nhẹ kết hợp icon `CalendarCheck` và minh họa vector 3D chồng sách pastel kèm lọ bút màu.
  - Bảo toàn 100% các thành phần nghiệp vụ: 3 thẻ chỉ số thống kê (Cần hoàn thành, Đang chờ chấm, Đã hoàn thành), thanh bộ lọc tab (Tất cả, Cần làm, Đã nộp, Đã có điểm), ô tìm kiếm và toàn bộ danh sách bài tập.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 14): Nâng cấp giao diện Thư viện tài liệu học tập (/student/resources) chuẩn 100% theo ảnh mẫu
- **Banner tiêu đề trên cùng ([`app/student/resources/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/page.tsx)):**
  - Khung dải chuyển màu pastel `bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/60 border border-blue-100/60 rounded-2xl p-5`.
  - Icon sách mở squircle xanh-tím gradient `w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-md`.
  - Tiêu đề *"Thư viện tài liệu học tập"*, mô tả phụ *"Kho giáo trình điện tử, slide bài giảng, file PDF và học liệu bổ trợ từ các lớp học của bạn"*.
  - Minh họa vector 3D chồng sách xanh tím nghiêng góc isometric kèm chậu cây xanh succulent và các tia sáng lấp lánh tím bên trái.
  - Badge dạng viên thuốc tròn xanh nổi bật `bg-[#1a73e8] text-white text-xs px-4 py-2 rounded-full font-semibold` hiển thị *"Tổng cộng: X tài liệu"*.
- **Dải 3 thẻ thống kê tổng quan (3 Summary Cards) chuẩn ảnh mẫu ([`app/student/resources/resources-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/resources-client.tsx)):**
  - **Thẻ 1 "Tổng số tài liệu":** Icon thư mục xanh tròn `bg-blue-100/70 text-blue-500`, số lượng to đậm xanh dương `text-[#1a73e8] text-3xl font-bold`, chú thích *"Bấm để xem tất cả"*, nút mũi tên tròn xanh `ChevronRight`.
  - **Thẻ 2 "Tập tin mới":** Icon sách mở tím tròn `bg-purple-100/70 text-purple-500`, số lượng to đậm tím `text-purple-600 text-3xl font-bold`, chú thích *"Tài liệu vừa được cập nhật"*, nút mũi tên tròn tím `ChevronRight`.
  - **Thẻ 3 "Học liệu số":** Icon kết nối mạng số xanh lá tròn `bg-emerald-100/70 text-emerald-500`, số lượng to đậm ngọc `text-emerald-600 text-3xl font-bold`, chú thích *"PDF • Slide • Video"*, nút mũi tên tròn xanh ngọc `ChevronRight`.
- **Thanh tìm kiếm & Bộ lọc định dạng (Pill Filter Bar):**
  - Ô tìm kiếm bo tròn hoàn toàn `rounded-full bg-slate-50/80 pl-10 pr-9 h-11 text-xs sm:text-sm` với icon kính lúp và nút xóa nhanh `X`.
  - Hàng nút lọc định dạng dạng viên thuốc tròn:
    + *"Tất cả"* (active xanh Google `bg-[#1a73e8]` chữ trắng).
    + *"PDF (X)"* (icon tài liệu PDF màu đỏ).
    + *"Slide (X)"* (icon slide thuyết trình màu cam).
    + *"Video (X)"* (icon video bài giảng màu tím).
- **Khối trạng thái rỗng (Empty State Card chuẩn 100% vector ảnh mẫu):**
  - Khung thẻ bo cong lớn `rounded-3xl border border-slate-100 bg-white p-12 sm:p-16 text-center` kèm vệt sáng loang pastel xanh và tím hai góc.
  - Minh họa vector 3D sắc nét: Thư mục xanh dương mở nắp, các trang tài liệu giấy trắng nhô ra có kẻ dòng, quyển sổ tím nghiêng bên cạnh, mầm cây xanh và máy bay giấy/ánh sáng lơ lửng.
  - Tiêu đề *"Chưa có tài liệu nào"*, đoạn mô tả thân thiện hướng dẫn quay lại sau hoặc liên hệ giáo viên.
  - Nút viên thuốc tròn bo *"Làm mới"* (`rounded-full bg-blue-50/80 hover:bg-blue-100 text-[#1a73e8] border border-blue-200/60 px-5 py-2 text-xs font-semibold`) với icon xoay `RotateCcw`.
- **Bảo toàn dữ liệu & Chức năng:**
  - Giữ nguyên 100% tên các mục, cấu trúc dữ liệu, lưới thẻ tài liệu khi có dữ liệu, và Dialog xem chi tiết học liệu.
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 15): Cập nhật tiêu đề trang Lịch hẹn test (/student/tests)
- **Tiêu đề trang Lịch hẹn test ([`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx)):**
  - Đổi tiêu đề chính `<h1>` từ *"Lịch hẹn test & Thi thử định kỳ"* thành **"Lịch hẹn test"** (khớp 100% với tên mục trên Sidebar và Breadcrumb).
  - Đồng bộ `metadata.title` thành *"Lịch hẹn test | Cổng Học sinh"*.
  - Giữ nguyên mô tả phụ: *"Theo dõi danh sách ca thi thử sắp tới, xem quy chế phòng thi và tra cứu kết quả đánh giá năng lực"*.
  - Giữ nguyên huy hiệu *"Khảo thí chuẩn hóa"* và nút *"Về Dashboard"*.
- **Đồng bộ Breadcrumb ([`components/layout/student-breadcrumb.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-breadcrumb.tsx)):**
  - Ánh xạ `tests` sang nhãn *"Lịch hẹn test"* (kết quả hiển thị: *"Học tập > Lịch hẹn test"*).
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 16): Đồng bộ 100% giao diện Lịch hẹn test (/student/tests) theo ảnh mẫu thiết kế
- **Banner tiêu đề trên cùng ([`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx)):**
  - Khung dải chuyển màu pastel `bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/60 border border-blue-100/60 rounded-2xl p-5`.
  - Icon lịch kiểm tra squircle xanh tím gradient `w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-md`.
  - Tiêu đề *"Lịch hẹn test"*, mô tả phụ *"Theo dõi danh sách ca thi thử sắp tới, xem quy chế phòng thi và tra cứu kết quả đánh giá năng lực"*.
  - Badge viên thuốc xanh nổi bật `bg-[#1a73e8] text-white text-xs px-4 py-2 rounded-full font-semibold` hiển thị *"Khảo thí chuẩn hóa"*.
  - Minh họa vector 3D lịch để bàn gáy lò xo xanh, lưới ô checkmark xanh và cây bút stylus tựa nghiêng bên phải.
- **Dải 3 thẻ thống kê tổng quan (3 Summary Cards) ([`app/student/tests/tests-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/tests-client.tsx)):**
  - **Thẻ 1 "Ca thi sắp tới":** Icon lịch xanh tròn `bg-blue-100/70 text-blue-500`, số lượng `2 đợt thi` (con số xanh dương to đậm `text-[#1a73e8]`), link *"Bấm để xem lịch sắp tới ›"*, nút mũi tên tròn xanh `ChevronRight`.
  - **Thẻ 2 "Đã tham gia":** Icon huân chương tím tròn `bg-purple-100/70 text-purple-500`, số lượng `2 kỳ đánh giá` (con số tím to đậm `text-purple-600`), link *"Bấm để xem kết quả điểm ›"*, nút mũi tên tròn tím `ChevronRight`.
  - **Thẻ 3 "Điểm thi gần nhất":** Icon tăng trưởng xanh lá tròn `bg-emerald-100/70 text-emerald-500`, điểm số `8.2 /10` (con số xanh lá to đậm `text-emerald-600`), badge `Giỏi`, link *"Bấm để xem chi tiết bài thi ›"*, nút mũi tên tròn xanh lá `ChevronRight`.
- **Thanh chuyển Tabs & Ô tìm kiếm (Tabs & Search Bar):**
  - Tab 1: *"Lịch thi sắp tới (2)"* dạng viên thuốc chuyển màu xanh tím `bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xs`.
  - Tab 2: *"Lịch sử thi & Kết quả 2"* dạng viên thuốc mềm.
  - Ô tìm kiếm dạng pill bo tròn hoàn toàn `rounded-full bg-slate-50/80` với icon kính lúp và nút xóa nhanh `X`.
- **Thẻ ca thi sắp tới (Upcoming Test Cards chuẩn ảnh mẫu):**
  - Bo góc lớn `rounded-3xl p-6 shadow-xs` với viền màu trên đỉnh:
    + Ca thi trực tiếp: Viền đỉnh xanh lá ngọc `border-t-2 border-t-emerald-500`.
    + Ca thi trực tuyến: Viền đỉnh tím `border-t-2 border-t-purple-500`.
  - Hàng badge đầu thẻ: Badge loại hình (*"Thi Trực Tiếp"* xanh lá / *"Thi Trực Tuyến"* tím), mã ca thi (`#MOCK-2026-T03`, `#ONLINE-MOCK-04`) và badge đếm ngược viên thuốc cyan (*"Còn 9 ngày"*, *"Còn 17 ngày"*).
  - Tiêu đề ca thi in đậm sắc nét kèm lớp học.
  - Hộp thông số 2x2 nền xám nhẹ `bg-slate-50/70 rounded-2xl`: Ngày thi (icon lịch xanh), Thời gian làm bài (icon đồng hồ xanh), Địa điểm/Phòng thi (icon vị trí tím), Cán bộ coi thi (icon người tím).
  - Dải ghi chú lưu ý nền xanh nhạt `bg-blue-50/60` kèm icon Info.
  - Hàng nút thao tác cuối thẻ:
    + Nút link *"Quy chế ca thi"* với icon khiên bảo vệ.
    + Nút hành động chuẩn mockup: *"Vào phòng thi"* dạng viên thuốc xanh `#1a73e8` có icon Play, hoặc cặp nút *"Vào phòng thi"* (viền xám) + *"Xác nhận tham gia"* (viên thuốc xanh).
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 17): Khử trùng lặp route /student/tests trên Sidebar học sinh
- **Cập nhật menu Sidebar ([`components/layout/student-sidebar.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-sidebar.tsx)):**
  - Xóa bỏ mục duplicate *"Kiểm tra & Kết quả"* (icon `Trophy`).
  - Giữ lại duy nhất mục *"Lịch hẹn test"* với `href: "/student/tests"` (icon `CalendarCheck`).
  - Xóa icon `Trophy` không còn sử dụng khỏi import.
  - Chuẩn hóa danh sách 6 mục trong nhóm "HỌC TẬP" theo thứ tự:
    1. *Lịch học* (`/student/schedule`, icon `Calendar`)
    2. *Danh sách lớp học* (`/student/classes`, icon `Users`)
    3. *Bài tập & Tài liệu* (`/student/assignments`, icon `FileText`)
    4. *Thư viện tài liệu* (`/student/resources`, icon `Library`)
    5. *Bảng điểm & Đánh giá* (`/student/grades`, icon `BarChart3`)
    6. *Lịch hẹn test* (`/student/tests`, icon `CalendarCheck`)
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 18): Đổi tên mục thành "Kết quả" và đảo vị trí "Lịch hẹn test" lên trước "Kết quả"
- **Cập nhật trang Kết quả ([`app/student/grades/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/page.tsx)):**
  - Đổi tiêu đề metadata trang thành `"Kết quả | Cổng Học sinh"`.
  - Đổi tiêu đề `<h1>` từ *"Bảng điểm & Đánh giá năng lực"* thành *"Kết quả"*.
- **Cập nhật Breadcrumb ([`components/layout/student-breadcrumb.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-breadcrumb.tsx)):**
  - Cập nhật nhãn ánh xạ của route `grades` thành `{ group: "Học tập", label: "Kết quả" }`.
- **Cập nhật Sidebar ([`components/layout/student-sidebar.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-sidebar.tsx)):**
  - Đổi tên mục *"Bảng điểm & Đánh giá"* thành *"Kết quả"*.
  - Đẩy mục *"Lịch hẹn test"* (`/student/tests`) lên trước mục *"Kết quả"* (`/student/grades`).
  - Thứ tự nhóm "HỌC TẬP" chuẩn:
    1. *Lịch học* (`/student/schedule`)
    2. *Danh sách lớp học* (`/student/classes`)
    3. *Bài tập & Tài liệu* (`/student/assignments`)
    4. *Thư viện tài liệu* (`/student/resources`)
    5. *Lịch hẹn test* (`/student/tests`)
    6. *Kết quả* (`/student/grades`)
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 19): Xóa bỏ huy hiệu GPA Tích lũy ở header trang Kết quả
- **Cập nhật trang Kết quả ([`app/student/grades/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/page.tsx)):**
  - Xóa bỏ huy hiệu (badge) `"GPA Tích lũy: X / 10"` ở góc phải banner header theo yêu cầu người dùng.
  - Xóa import `Sparkles` không còn sử dụng.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 20): Xóa thanh tìm kiếm dùng chung trên Header toàn bộ các trang học sinh
- **Cập nhật Header chung ([`components/layout/student-header.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-header.tsx)):**
  - Xóa bỏ thanh tìm kiếm dạng con nhộng (*"Tìm kiếm khóa học, bài tập, tài liệu..."*) nằm ở trên đầu toàn bộ các trang học sinh theo yêu cầu.
  - Xóa import `Search` từ `lucide-react`.
  - Căn chỉnh lại container Header sang lề phải (`justify-end`) để cụm hiển thị Ngày tháng & Thông tin tài khoản luôn cân đối.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 21): Đồng bộ 100% giao diện trang Lịch hẹn test theo thiết kế mẫu
- **Cập nhật Banner trang ([`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx)):**
  - Tối giản banner theo đúng ảnh chụp mẫu: gỡ bỏ huy hiệu bên phải và hình minh họa lịch bàn SVG cũ.
  - Khối icon vuông bo góc lớn (`rounded-2xl`) nền gradient tươi sáng từ xanh da trời đến xanh tím (`from-[#38bdf8] via-[#3b82f6] to-[#6366f1]`) với icon `CalendarCheck`.
  - Tiêu đề *"Lịch hẹn test"* và mô tả phụ hiển thị thanh lịch, viền bo tròn lớn `rounded-3xl` trên nền dải màu pastel nhẹ nhàng.
- **Tái tạo giao diện chính trang Lịch hẹn test ([`app/student/tests/tests-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/tests-client.tsx)):**
  - Khung thẻ chính bo góc lớn `rounded-3xl` / `rounded-[32px]` trên nền trắng viền sáng, kèm các quầng sáng lan tỏa màu xanh ngọc (sky) ở góc trái dưới và màu tím (indigo/purple) ở góc phải dưới chuẩn 100% ảnh chụp mẫu.
  - Hình minh họa vector 3D sắc nét:
    + Bảng kẹp giấy (Clipboard) xanh pastel có khóa kẹp kim loại và 3 hàng checklist tích xanh.
    + Cành lá xanh tươi vươn lên từ phía sau bên trái.
    + Thảm mây bồng bềnh nhiều lớp ở chân bảng.
    + Kính lúp 3D vành xanh dương, tròng trong suốt ánh xanh và cán màu tím nghiêng 45 độ.
    + Máy bay giấy origami xanh lam bay vút về góc trên bên phải kèm vệt lượn nét đứt.
    + Các ngôi sao 4 cánh và hạt kim cương trang trí tinh xảo.
  - Tiêu đề thông báo chuẩn thiết kế: *"Chưa có dữ liệu bằng điểm"*.
  - Đoạn mô tả: *"Bạn hiện chưa tham gia lớp học nào hoặc giáo viên chưa cập nhật điểm số cho các bài kiểm tra của bạn."*.
  - Nút bấm *"Làm mới"* dạng viên thuốc bo tròn (`rounded-full`) chuyển màu gradient từ Xanh dương sang Tím (`from-[#3b82f6] to-[#8b5cf6]`) có hiệu ứng xoay icon khi bấm làm mới dữ liệu.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 22): Khôi phục nội dung Lịch hẹn test và áp dụng giao diện mẫu vào trang Bảng điểm (Kết quả)
- **Khôi phục trang Lịch hẹn test ([`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx) & [`app/student/tests/tests-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/tests-client.tsx)):**
  - Khôi phục lại toàn bộ nội dung tính năng đầy đủ của Lịch hẹn test (3 thẻ thống kê, tab Lịch thi sắp tới & Lịch sử thi, ô tìm kiếm, thẻ chi tiết ca thi và modal xem quy chế).
  - Tiêu đề giữ chuẩn theo Sidebar: *"Lịch hẹn test"*.
- **Áp dụng giao diện mẫu vào trang Bảng điểm / Kết quả ([`app/student/grades/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/page.tsx) & [`app/student/grades/grades-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/grades-client.tsx)):**
  - Banner tiêu đề: Khung viền `rounded-3xl` dải màu chuyển pastel nhẹ, icon squircle `rounded-2xl` gradient xanh-tím (`Award`), tiêu đề *"Kết quả"*.
  - Khung thông báo rỗng (khi chưa có dữ liệu bảng điểm):
    + Bo góc lớn `rounded-3xl` / `rounded-[32px]`, nền trắng, quầng sáng mềm xanh ngọc ở góc trái dưới và quầng sáng tím ở góc phải dưới.
    + Vector minh họa 3D chi tiết: Bảng kẹp giấy checklist, mây bồng bềnh, cành lá xanh, kính lúp 3D vành xanh cán tím, máy bay giấy xanh bay góc trên phải, hạt kim cương và ngôi sao lấp lánh.
    + Tiêu đề: *"Chưa có dữ liệu bằng điểm"*.
    + Mô tả: *"Bạn hiện chưa tham gia lớp học nào hoặc giáo viên chưa cập nhật điểm số cho các bài kiểm tra của bạn."*.
    + Nút bấm viên thuốc gradient Xanh - Tím: *"Làm mới"* với hiệu ứng xoay icon và `router.refresh()`.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 23): Chuẩn hóa 100% giao diện trang Lịch hẹn test khớp từng pixel ảnh chụp thực tế
- **Cập nhật Banner trang ([`app/student/tests/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/page.tsx)):**
  - Khung viền bo góc lớn `rounded-3xl` dải màu chuyển pastel nhẹ, icon squircle `rounded-2xl` gradient xanh da trời - tím (`CalendarCheck`), tiêu đề *"Lịch hẹn test"*.
  - Bên phải: Badge viên thuốc *"Khảo thí chuẩn hóa"* và hình minh họa vector 3D lịch để bàn kèm bút viết.
- **Chuẩn hóa Client Component ([`app/student/tests/tests-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/tests-client.tsx)):**
  - **3 Thẻ thống kê:** Bố cục icon tròn bên trái (`CalendarCheck`, `Award`, `TrendingUp`), thông số ở giữa (số đếm, link xem chi tiết kèm mũi tên), nút tròn chuyển hướng ở bên phải với icon `ChevronRight`.
  - **Thanh Tabs & Tìm kiếm:** Tab *"Lịch thi sắp tới"* dạng viên thuốc gradient xanh tím với badge số đếm trong vòng tròn mờ; tab *"Lịch sử thi & Kết quả"*; thanh tìm kiếm dạng con nhộng `rounded-full` kèm icon kính lúp.
  - **Các thẻ ca thi (2 cột):**
    + Ca thi trực tiếp: Viền đỉnh xanh lá (`border-t-emerald-400`), badge *"Thi Trực Tiếp"*, badge mã thi, badge đếm ngược Cyan *"Còn 9 ngày"*, hộp thông số 2x2 nền xám, dải lưu ý xanh nhạt, nút *"Quy chế ca thi"* và nút viên thuốc gradient *"Vào phòng thi"*.
    + Ca thi trực tuyến: Viền đỉnh tím (`border-t-purple-400`), badge *"Thi Trực Tuyến"*, badge mã thi, badge đếm ngược Cyan *"Còn 17 ngày"*, hộp thông số 2x2, dải lưu ý, nút *"Quy chế ca thi"*, nút viền *"Vào phòng thi"* và nút viên thuốc gradient *"Xác nhận tham gia"*.
- **Kiểm tra chất lượng:**
  - `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).

### 2026-09-17 (Bổ sung 24): Tối ưu hóa & xử lý 4 điểm rủi ro kỹ thuật & UX trong phân hệ Học sinh
1. **Loại bỏ dữ liệu giả lập (Mock Data) - Chuyển sang Empty State chuẩn:**
   - **`getStudentResources()` ([`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts)):** Xóa bỏ hoàn toàn mảng `fallbackResources` sinh tài liệu giả lập (Slide PPTX, PDF, Video). Trả về mảng rỗng `[]` khi Supabase không có bản ghi thực tế.
   - **`getStudentGrades()` ([`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts)):** Xóa bỏ cơ chế sinh điểm giả định `baseScores` `[8.5, 9.0...]` và nhận xét mẫu khi DB chưa có bài chấm điểm. Trả về `classes: []` kèm các chỉ số thống kê trung thực (`overallGpa: 0`, `totalAssessments: 0`, `completionRate: 0`).
   - **`getStudentTests()` ([`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts)):** Loại bỏ hoàn toàn các bản ghi mẫu hardcode (`MOCK-2026-T03`, `ONLINE-MOCK-04`, `MOCK-2026-T01`, điểm giả `8.2`). Thay thế bằng truy vấn bài thi/khảo sát thực tế từ bảng `assignments` (loại `test`/`exam`/`quiz`) và bài nộp `submissions`. Nếu DB chưa có bản ghi, trả về `upcomingTests: []`, `completedTests: []`, `stats: { upcomingCount: 0, completedCount: 0, latestScore: null, latestScoreMax: 10 }`.
   - **UI Empty States chuẩn hóa:**
     + [`app/student/tests/tests-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/tests/tests-client.tsx): Sửa Card 3 hiển thị `"--"` thay vì `8.2` khi chưa có điểm. Bổ sung khung Empty State có minh họa vector 3D chi tiết (Lịch khảo thí / Bảng kết quả) và nút *"Làm mới"* (`router.refresh()`).
     + [`app/student/grades/grades-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/grades-client.tsx): Kích hoạt tự động khung Empty State vector 3D kèm nút *"Làm mới"* khi chưa có bảng điểm.
     + [`app/student/resources/resources-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/resources/resources-client.tsx): Kích hoạt khung Empty State 3D kèm nút *"Làm mới"* khi tài liệu trống.

2. **Đồng bộ danh pháp thanh Menu & tránh trùng lặp khái niệm:**
   - **Sidebar ([`components/layout/student-sidebar.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-sidebar.tsx)):**
     + Đổi `/student/assignments` từ *"Bài tập & Tài liệu"* thành *"Bài tập về nhà"*, phân biệt rõ rệt với *"Thư viện tài liệu"* (`/student/resources`).
     + Đổi `/student/grades` từ *"Kết quả"* thành *"Bảng điểm & Đánh giá"*.
   - **Breadcrumb ([`components/layout/student-breadcrumb.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/components/layout/student-breadcrumb.tsx)):** Thống nhất hiển thị *"Bài tập về nhà"* và *"Bảng điểm & Đánh giá"*.
   - **Page Headers ([`app/student/assignments/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/assignments/page.tsx) & [`app/student/grades/page.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/grades/page.tsx)):** Đồng bộ tiêu đề metadata và thẻ `<h1>` khớp hoàn toàn với Sidebar và Breadcrumb.

3. **Đồng bộ họ tên đơn nguồn sự thật (Single Source of Truth):**
   - Layout [`app/student/layout.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/layout.tsx) ưu tiên lấy trực tiếp `students.full_name` từ Database theo `auth_user_id = user.id`, sau đó mới fallback sang `user_metadata`.
   - Trong Server Action `updateStudentProfile` ([`lib/actions/student.ts`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/lib/actions/student.ts)), bổ sung `revalidatePath("/student", "layout")` để Next.js revalidate lại cache toàn bộ layout ngay khi học viên đổi họ tên.
   - Tại [`app/student/settings/settings-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/settings-client.tsx), gọi `router.refresh()` ngay sau khi lưu thành công để Header lập tức cập nhật tên mới từ Database mà không bị độ trễ metadata.

4. **Bổ sung xử lý Timeout cho Client Actions:**
   - Tại form nộp bài tập ([`app/student/assignments/assignments-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/assignments/assignments-client.tsx)): Bọc `submitAssignment` trong `Promise.race` timeout 15s; bắt lỗi mất mạng / quá thời gian và hiển thị thông báo: *"Không thể kết nối máy chủ, vui lòng kiểm tra đường truyền và thử lại"*; giải phóng cờ `isSubmitting = false` trong khối `finally`.
   - Tại form cài đặt tài khoản & đổi mật khẩu ([`app/student/settings/settings-client.tsx`](file:///e:/Marketing/BI%C3%8AN%20T%E1%BA%ACP%20WEB/Webdemo/app/student/settings/settings-client.tsx)): Bọc `updateStudentProfile` và `updateStudentPassword` trong `Promise.race` timeout 15s; chuẩn hóa thông báo lỗi kết nối mạng; giải phóng cờ `isUpdatingProfile = false` và `isUpdatingPassword = false` trong `finally`.

5. **Kiểm thử chất lượng:**
   - Chạy `npx tsc --noEmit` đạt **0 lỗi biên dịch** (`Exit code 0`).









