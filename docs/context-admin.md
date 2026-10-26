Nhật ký làm việc — Phân hệ Quản trị (Admin)
> File này CHỈ dành cho người phụ trách phân hệ Admin ghi lại tiến độ, quyết
> định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác sửa
> file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án: sự cố bảo mật đã
>   xử lý, quyết định kiến trúc lớn, trạng thái Git — áp dụng cho cả 4
>   phân hệ, không chỉ riêng Admin.

## Việc còn treo dành riêng cho Admin (Cập nhật 2026-09-28)

- Dialog còn lại cần kiểm tra `result.error` từ Server Action để không ghi dữ liệu giả khi thất bại: `student-dialog.tsx`. (`teacher-dialog.tsx` đã được fix ngày 2026-09-28; `class-dialog.tsx` đã xử lý ngày 2026-09-25.)
- Công thức lương "Thưởng − Phạt" chưa persist vào Database — `payroll-tab.tsx` chỉ lưu tạm ở state, mất khi F5.
- `payroll-tab.tsx`: Đổi tháng/năm trên bộ lọc chưa gọi lại dữ liệu động từ server.
- `getCenterBankSettings()` trả tài khoản ngân hàng giả khi query bị lỗi.
- Chuẩn bị sẵn dữ liệu/báo cáo Admin để hiển thị dữ liệu tổng hợp từ Sale (Tuyển sinh) và Student khi 2 phân hệ này đi vào hoạt động.
- (2026-09-28) Nhập học sinh bằng file CSV ở `/admin/students` là giả: `handleProcessImport()` (`students-client.tsx`) chỉ hiện "Đã tải tệp lên thành công!" rồi đóng, không ghi gì vào DB. File mẫu CSV vẫn là ví dụ Toán/Văn cũ. Tạm thời nhập học sinh bằng tay qua nút "Thêm học sinh". Chủ dự án chọn bỏ qua, chưa sửa.
- (2026-09-28) DB có nhiều bản ghi `class_sessions` trùng (cùng lớp, cùng ngày, cùng giờ bắt đầu). Cảnh báo vận hành và "Ca học hôm nay" đang tự gộp trùng khi hiển thị, nhưng dữ liệu trùng vẫn còn và có thể làm sai các số liệu khác (lương GV, số buổi đã dạy...). Nguyên nhân CHƯA điều tra — nghi ở luồng sinh buổi học `lib/utils/session-generator.ts` (file dùng chung Nhóm 2).
- (2026-09-28) Đèn giao thông — đợt 2 chưa làm: trang Học sinh thêm cột "Ví buổi học" có màu (≤ 0 đỏ, 1–2 vàng, ≥ 3 xanh) + đổi badge "Đang học/Đã nghỉ" sang màu trung tính; trang Chấm công thêm badge đỏ "Trễ điểm danh". Trang Tài chính (sổ công nợ) đã khớp sẵn, không cần sửa.
- (2026-09-28) Trang Học sinh hiện nhãn "Khóa {n} tháng" với mặc định bịa **3 tháng** (`students-client.tsx`, dòng ~479) — cột thời lượng không tồn tại trong DB nên hầu như lớp nào cũng hiện "3 tháng". Nên sửa khi làm đèn giao thông đợt 2.
- (2026-09-28) Chờ TalkClass trả lời: học phí từng khóa; mỗi lớp "Level 1/2/3" ứng với phần nào của lộ trình (45/38/36 buổi); mã lớp H51 bị trùng trên web. Dialog Tạo lớp chưa có lựa chọn riêng cho lộ trình "Người đi làm" (tạm dùng "Tự nhập số buổi").
- (2026-09-28) Hoãn theo quyết định chủ dự án: mô hình "3 kèm 1" (GV bản ngữ + trợ giảng — `classes` chỉ có 1 `teacher_id`, muốn làm phải thêm cột, đụng file Nhóm 1); dọn hằng số mock cũ `INITIAL_APP_*` trong `lib/context/app-data-context.tsx` và `lib/constants/teachers.ts` (không còn hiện trên giao diện, file dùng chung); tính năng chọn cơ sở Thái Hà / Hoàng Quốc Việt (cần bảng `branches` + `classes.branch_id`, xem nhật ký bên dưới).

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-29 — Tinh gọn Phễu Tuyển sinh trong "Báo cáo & AI Insights" (`/admin/analytics`)

- **1. Xóa bỏ khối thẻ tóm tắt và 2 bảng chi tiết tuyển sinh 30 ngày (`components/analytics/admissions-report-section.tsx`):**
  - Xóa bỏ hoàn toàn khối thẻ tóm tắt 4 chỉ số "Hiệu suất Tuyển sinh — 30 ngày gần nhất" (`Lead mới`, `Đã chuyển đổi`, `Tổng doanh thu`, `TB / Lead chốt`, badge `30 ngày qua`).
  - Xóa bỏ 2 bảng thống kê bên dưới: Bảng `Theo nguồn khách hàng` và Bảng `Theo nhân viên Tuyển sinh`.
- **2. Giữ nguyên vẹn các khối trọng tâm:**
  - Giữ lại phần Biểu đồ Phễu chuyển đổi Tuyển sinh (`AdmissionsFunnelCard` - Funnel Chart 3 tầng Cam, Tím, Xanh lá với dữ liệu thật).
  - Giữ lại khối `Học sinh đã đóng tiền, đang chờ xếp lớp` (kèm danh sách học sinh, phụ huynh, số buổi, số tiền).
  - Giữ lại khối `Phản ánh & Góp ý (Sale tiếp nhận)` (kèm 3 chỉ số: Mới, Đang xử lý, Đã xử lý).
- **3. Dọn dẹp code, props và Server Actions thừa:**
  - Loại bỏ các import và prop không còn sử dụng (`reportData`, `AdmissionsReportData`, `getAdmissionsReportData`, `SOURCE_LABELS`, v.v.).
  - Tinh gọn `app/admin/analytics/analytics-client.tsx` và `app/admin/analytics/page.tsx`: không còn truy vấn `getAdmissionsReportData(...)` thừa thải trong `Promise.all`.
- **4. Kiểm thử TypeScript:**
  - `tsc --noEmit` hoàn tất với exit code 0, không có cảnh báo/lỗi kiểu dữ liệu.

### 2026-09-28 (Lần 2) — Hợp nhất Báo cáo Tuyển sinh & Triển khai Phễu chuyển đổi 3 tầng trực quan vào "Báo cáo & AI Insights" (`/admin/analytics`)

- **1. Tinh gọn Sidebar Admin (`components/layout/admin-sidebar.tsx`):**
  - Xóa bỏ mục menu "Báo cáo Tuyển sinh" (`/admin/admissions-report`), chuyển trọng tâm phân tích dữ liệu và tuyển sinh vào trang "Báo cáo & AI Insights" (`/admin/analytics`).
- **2. Thiết kế Component Phễu chuyển đổi Tuyển sinh 3 tầng (`components/analytics/admissions-funnel-card.tsx`):**
  - **Header:** "Phễu chuyển đổi Tuyển sinh" — `[Tổng số] hồ sơ Lead — số trên mỗi bậc là số hồ sơ đã từng đạt tới bậc đó`.
  - **Bố cục 3 phần ngang trực quan:**
    - **Cột trái:** Đồ họa hình khối phễu cắt làm 3 tầng màu:
      - Tầng 1: Khối phễu hình thang ngược màu Cam (`#f97316`).
      - Tầng 2: Khối hình chữ nhật/hình thang nhỏ màu Tím (`#a855f7`).
      - Tầng 3: Khối đáy phễu màu Xanh lá (`#10b981`).
    - **Cột giữa (Nhãn từng bậc & Tỷ lệ chuyển tiếp):**
      - `1 👤 Khách hàng tiềm năng`
      - `↓ [X]% chuyển tiếp`
      - `2 🎓 Xếp lịch học thử`
      - `↓ [Y]% chuyển tiếp`
      - `3 🎓 Ghi danh & chuyển đổi`
    - **Cột phải (Chỉ số chi tiết căn phải):**
      - Số lượng tầng 1 kèm `[100]% tổng số` (hoặc `0%` nếu chưa có dữ liệu).
      - Số lượng tầng 2 kèm `[X]% tổng số`.
      - Số lượng tầng 3 kèm `[Y]% tổng số`.
    - Chân card hiển thị 2 chỉ số phụ: "Đang chăm sóc" và "Đã mất (không nhu cầu)".
- **3. Chuyển toàn bộ nội dung dữ liệu sang Section 2 (`id="section-funnel"`) trong Analytics:**
  - Gỡ bỏ hoàn toàn khối placeholder tạm thời ("Phễu Tuyển Sinh đang chờ kết nối dữ liệu / Sắp ra mắt — cần phân hệ Sale").
  - Xây dựng component mới `components/analytics/admissions-report-section.tsx` tích hợp `AdmissionsFunnelCard` đặt ngay phía trên các khối thống kê:
    - Phễu chuyển đổi 3 tầng trực quan.
    - Khối 4 chỉ số KPI toàn thời gian: Tổng Lead, Đã ghi danh, Chờ xếp lớp, Tỷ lệ chuyển đổi.
    - Khối tổng quan 4 chỉ số 30 ngày gần nhất: Lead mới, Đã chuyển đổi, Tổng doanh thu, TB / Lead chốt.
    - Bảng 1: Thống kê hiệu suất theo nguồn khách hàng (Facebook Ads, Fanpage, Zalo, Giới thiệu...).
    - Bảng 2: Thống kê hiệu suất theo nhân viên Tuyển sinh (mck, Tuyết Mai, Thùy Linh...).
    - Khối Học sinh đã đóng tiền, đang chờ xếp lớp (kèm bảng chi tiết học sinh, SĐT, lớp quan tâm, số buổi đã đóng, số tiền).
    - Khối Phản ánh & Góp ý (Sale tiếp nhận: Mới, Đang xử lý, Đã xử lý).
  - **Tuân thủ AGENTS.md Mục 11.1 (NO MOCK/FALLBACK DATA):** Giữ nguyên 100% nguồn dữ liệu thật từ các Server Actions `getAdmissionsKpiStats()`, `getAdmissionsReportData()`, `getWaitingListStudents()`, `getFeedbackKpiStats()`. Nạp sẵn từ Server Component `app/admin/analytics/page.tsx` và tự động đồng bộ khi bấm nút "Quét lại".
- **4. Xử lý các Route cũ:**
  - `app/admin/admissions-report/page.tsx` và `app/admin/admissions/page.tsx`: Cấu hình tự động `redirect("/admin/analytics#section-funnel")` để tránh lỗi 404 cho bookmark cũ.
- **5. Kiểm tra kỹ thuật:** Chạy `node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit` đạt **Exit code 0** (0 lỗi).

### 2026-09-28 — Triển khai tính năng Xóa Giáo Viên (Role Admin) và khắc phục lỗi nuốt lỗi ở TeacherDialog

- **1. Server Action `deleteTeacher(teacherId: string)` tại `lib/actions/teachers.ts`:**
  - Áp dụng `requireRole(["admin"])`, fail-closed khi không có quyền.
  - Kiểm tra tính hợp lệ: đảm bảo giáo viên tồn tại và đúng `role = 'teacher'`.
  - **Chống lỗi dữ liệu & ràng buộc toàn vẹn:**
    - Kiểm tra `classes` xem giáo viên có đang phụ trách lớp học nào không. Nếu có, chặn thao tác và thông báo danh sách lớp cụ thể.
    - Kiểm tra `class_sessions` xem giáo viên có buổi dạy nào trong hệ thống không. Nếu có, chặn xóa để bảo toàn lịch sử giảng dạy và bảng lương.
  - Xóa hồ sơ trong `profiles` và dọn dẹp tài khoản trong `auth.users` qua `createAdminClient()`.
  - Revalidate cache các đường dẫn quản trị liên quan (`/admin/teachers`, `/admin/classes`, `/admin/dashboard`, `/admin/finance`).
- **2. UI Danh sách Giáo viên (`app/admin/teachers/teachers-client.tsx`):**
  - Bổ sung nút Thùng rác (Xóa) tại cột Thao tác bên cạnh nút Chỉnh sửa.
  - Modal xác nhận xóa chuẩn shadcn/ui: hiển thị thông tin giáo viên, cảnh báo không thể hoàn tác, spinner khi đang xử lý.
  - **Tuân thủ nguyên tắc AGENTS.md (Không nuốt lỗi / Không xóa ảo):** Kiểm tra `if (res?.error)` — nếu có lỗi từ server, hiển thị thông báo lỗi trực tiếp trên modal và KHÔNG xóa bản ghi khỏi state giao diện. Chỉ cập nhật state và hiện toast khi server phản hồi thành công.
- **3. Khắc phục lỗi nuốt lỗi tại `components/teachers/teacher-dialog.tsx`:**
  - Sửa lỗi bỏ qua `result.error` khi tạo/sửa giáo viên — nay đã chặn dừng và hiển thị lỗi trên dialog, không tự động lưu dữ liệu giả vào store cục bộ khi Server Action thất bại.
- **4. Kiểm tra kỹ thuật:** Chạy `npx tsc --noEmit` đạt 0 lỗi type/syntax.

### 2026-09-28 — Cá nhân hóa cho khách hàng TalkClass: dialog Tạo lớp theo lộ trình, ngưỡng hòa vốn 8 HS, Cảnh báo vận hành kiểu Đèn giao thông

**Tóm tắt file thay đổi (đã rà `git status` cuối phiên):** chỉ file của Admin + 3 file mới. KHÔNG sửa file Nhóm 1, KHÔNG sửa file của Teacher/Sale/Student, KHÔNG có migration/đổi schema.
- Sửa: `components/classes/class-dialog.tsx` (chỉ `classes-client.tsx` của Admin dùng), `app/admin/classes/classes-client.tsx`, `app/admin/analytics/analytics-client.tsx`, `app/admin/dashboard/page.tsx`, `app/admin/dashboard/dashboard-client.tsx`, `app/admin/layout.tsx`, file này.
- Mới: `lib/actions/operation-alerts.ts` (chỉ đọc, `requireRole(["admin"])`), `lib/utils/traffic-light.ts` (thư mục dùng chung nhưng là file thêm mới, hiện chỉ Admin import), `components/alerts/late-attendance-popup.tsx`.
- Chỉ gọi, không sửa: `requireRole()` (`lib/auth/guards.ts`), `getAnalyticsReportData()` (`lib/actions/analytics.ts`), `createClass()` (`lib/actions/classes.ts`).
- `lib/actions/ai-analytics.ts` (thêm xử lý lỗi 429 cho Gemini) đã có thay đổi TỪ TRƯỚC phiên này, không do AI phiên này sửa — nên commit tách riêng.
- `tsc --noEmit` exit 0 sau lần sửa cuối.

**1. Dữ liệu khách hàng TalkClass (ghi nhận, dùng làm căn cứ cho các thay đổi bên dưới)**

Nguồn: website TalkClass, cập nhật lần cuối 22/07/2025 (có thể đã cũ). Web **không công bố học phí** và **không có ngày khai giảng** (phụ thuộc sĩ số, hỏi hotline 0984 022 247) → theo AGENTS.md 11.1, KHÔNG tự bịa `fee_per_session`/`start_date` khi nhập dữ liệu; phải hỏi TalkClass.

**Lộ trình khóa học** (2 buổi/tuần, sĩ số 12–16/lớp; ngưỡng hòa vốn 8 là quy tắc nội bộ của nhóm, web không nói):
- Cơ bản: 45 buổi (~6 tháng) = GĐ1 27 buổi GV Việt + GĐ2 18 buổi GV nước ngoài.
- Nâng cao: 38 buổi (~5 tháng) = 18 buổi giao tiếp công việc + 20 buổi Business English, 100% GV nước ngoài.
- Chuyên sâu: 36 buổi = 20 buổi Business English + 16 buổi case study, 100% GV nước ngoài.
- Người đi làm: 3–12 tháng, 2–4 buổi/tuần, chọn 1 trong 3 lộ trình trên.
- Người lớn tuổi (45–80): 61 buổi (~7,5 tháng) = 34 + 27 buổi.
- Online 1 kèm 1: theo lộ trình 45/38/36 buổi.
- ⚠️ 45/38/36 buổi là số buổi của CẢ lộ trình, không phải của riêng "Level 1/2/3". Chưa rõ mỗi lớp "Level x" ứng với phần nào của lộ trình — cần hỏi TalkClass.

**Lớp đang mở — Cơ sở Thái Hà** (số 18, ngõ 11, phố Thái Hà):
Level 1: CS107 (T3,6 08:30–10:00), CS109 (T2,5 08:30–10:00), C321 (T4,7 19:40–21:10), C323 (T2,5 18:00–19:30), C325 (T3,6 19:40–21:10).
Level 2: C332 (T2,5 18:00–19:30), C334 (T3,6 19:40–21:10), C336 (T3,6 18:00–19:30), C338 (T2,5 19:40–21:10).
Level 3: CL118 (T3,6 18:00–19:30).

**Lớp đang mở — Cơ sở Hoàng Quốc Việt:**
Level 1: H49 (T3,6 18:00–19:30), H51 (T2,5 10:00–11:30), H51 dòng 2 (T3,6 19:40–21:10 — trùng mã, nghi lỗi nhập liệu trên web).
Level 2: H38 (T2,5 18:00–19:30), H40 (T2,5 19:40–21:10).
Level 3: I40 (T2,5 18:00–19:30), I42 (T2,5 19:40–21:10).

**Nhập vào hệ thống thế nào:** Admin tạo qua `/admin/classes` (dialog Tạo lớp) — schema `classes` hiện có đủ tên, lịch, sĩ số tối đa, phòng; KHÔNG cần sửa file dùng chung. Schema chưa có cột riêng cho *cơ sở*, *level/lộ trình*, *tổng số buổi lộ trình*, *sĩ số tối thiểu* — nếu cần lọc/báo cáo theo các trường này thì phải thêm cột/bảng mới → đụng `types/database.ts` (Nhóm 1) + `lib/actions/classes.ts` (Nhóm 2) + migration → phải báo nhóm trước (AGENTS.md Mục 8).

**Tính năng chọn cơ sở khi đăng nhập Admin (chỉ phân tích, CHƯA làm):** khả thi nhưng lớn — cần bảng `branches` + `classes.branch_id` (Nhóm 1), thêm tham số lọc tùy chọn cho ~10 file action Nhóm 2 mà Teacher/Sale cũng gọi, sửa ~13 trang Admin. Cần nhóm chốt trước: GV/HS có học/dạy ở cả 2 cơ sở không, Sale có chia theo cơ sở không, có cần xem "Tất cả cơ sở" không, dữ liệu cũ gán về cơ sở nào.

**2. Dialog Tạo lớp theo lộ trình TalkClass** — `components/classes/class-dialog.tsx`: thay lựa chọn "1/3/5 tháng" (tự tính số buổi theo tháng, sĩ số 20/30/10) bằng "Lộ trình khóa học" theo số buổi TalkClass — trọn lộ trình hoặc từng giai đoạn của Cơ bản / Nâng cao / Chuyên sâu / Người lớn tuổi, cộng lựa chọn "Tự nhập số buổi". Sĩ số tối đa mặc định 16. Ca học tự tính 1h30 (trước là 2h), lịch mặc định T2/T5 18:00–19:30. Bỏ học phí mặc định 150.000đ (số bịa) — Admin bắt buộc tự nhập. Bỏ trường `duration_months` gửi lên server (server vốn không đọc). Lý do cho chọn cả "trọn lộ trình" lẫn "từng giai đoạn": chưa biết lớp Level x ứng với phần nào của lộ trình — khi TalkClass trả lời có thể bỏ bớt lựa chọn thừa. Dialog Sửa lớp không đổi.

**3. Ngưỡng hòa vốn ở trang Báo cáo** — `app/admin/analytics/analytics-client.tsx`: cảnh báo "Sĩ số thấp" đổi tiêu chí từ "< 30% sĩ số tối đa" sang "< 8 HS" (hằng `BREAK_EVEN_MIN_STUDENTS`); nội dung bỏ "6-8 HS" và "≥ 60% công suất", thay bằng ngưỡng 8 và chuẩn 12–16 HS/lớp. Lưu ý: số lớp bị cảnh báo tăng lên, kể cả lớp mới tạo chưa có HS.

**4. Cảnh báo Vận hành kiểu Đèn giao thông** — trạng thái CUỐI CÙNG:
- Nguồn tính duy nhất: `getOperationAlerts()` + `getLateAttendanceSessions()` trong `lib/actions/operation-alerts.ts`. Mỗi cảnh báo có `href` trỏ thẳng về trang xử lý: mọi cảnh báo gắn với lớp/học sinh → `/admin/classes/[id]` (trang chi tiết lớp có danh sách HS + số buổi còn lại); hóa đơn chờ → `/admin/finance`; dòng tiền → `/admin/analytics`.
- Hiển thị DUY NHẤT ở Dashboard (theo yêu cầu chủ dự án — không có trang/mục menu riêng): khối "Cảnh báo vận hành" liệt kê Đỏ trước rồi Vàng, 3 mục/trang, điều hướng "Trang x / y ◀ ▶" ở đầu khối, y hệt khối "Ca học hôm nay" bên cạnh để 2 cột cân nhau. Mục Xanh được tính nhưng KHÔNG hiển thị ở đâu (chủ dự án bỏ 3 ô đếm Đỏ/Vàng/Xanh vì thấy xấu).
- Khối này thay hẳn khối "Cảnh báo vận hành cần xử lý" cũ tự tính trong `dashboard-client.tsx` (từng gắn đỏ cho HS còn 1–2 buổi, chỉ báo "Chưa điểm danh" sau khi ca kết thúc). Mục "Chưa xếp phòng" cũ được giữ lại, chuyển vào đèn Vàng.
- Thông báo nổi `LateAttendancePopup` gắn ở `app/admin/layout.tsx`: hiện ở mọi trang Admin khi mở/tải lại trang nếu có ca hôm nay trễ > 10 phút chưa lưu điểm danh; bấm tên lớp → trang lớp, link cuối → Dashboard. Không cập nhật theo thời gian thực.
- Dashboard giờ gọi thêm `getAnalyticsReportData()` (để lấy dòng tiền) → tải chậm hơn một chút.
- Ngưỡng đã chốt với chủ dự án:
  - Đỏ: đang học mà ví ≤ 0 buổi; vắng không phép ở 2 buổi gần nhất; lớp < 8 HS khi còn ≤ 3 ngày khai giảng; ca hôm nay quá 10 phút mà GV chưa lưu bảng điểm danh (ca còn `scheduled`); dòng tiền ròng lũy kế từ tháng 1 âm.
  - Vàng: ví 1–2 buổi (giữ ngưỡng ≤ 2 của AGENTS.md, không đổi quy tắc chung); lớp 8–11 HS; hóa đơn `pending`; lớp chưa xếp phòng.
  - Xanh: lớp ≥ 12 HS; chuyên cần 30 ngày ≥ 90%; 100% ca 30 ngày được lưu điểm danh lần đầu trong 30 phút sau khi kết thúc; dòng tiền lũy kế dương.
- Cố ý bỏ theo quyết định chủ dự án: "Chờ xếp lớp > 3 ngày" (bảng `leads` của Sale chưa lưu thời điểm bắt đầu chờ), Ticket/giao việc CSKH.
- Chỉ số chuyên cần / điểm danh đúng hạn chỉ vào nhóm Xanh khi đạt mục tiêu; không đạt thì không xếp màu (bảng đèn gốc không định nghĩa).
- Ca trễ gộp trùng theo lớp + giờ bắt đầu (xem việc còn treo về `class_sessions` trùng — lần hiển thị đầu tiên từng ra 572 mục đỏ, phần lớn là 1 ca lặp lại).

**5. Đèn giao thông ở các trang khác — đợt 1 (Lớp học + Dashboard):** chủ dự án yêu cầu rà các trạng thái có sẵn trước khi áp màu. Kết luận rà soát: chỉ tô màu đèn cho thứ là *mức độ rủi ro*, không tô cho trạng thái thuần (Đang học/Đã nghỉ, Hoàn thành/Đã hủy).
- Ngưỡng sĩ số tách ra `lib/utils/traffic-light.ts` (`classSizeLight()`, hằng 8 / 12 / 3 ngày) để trang Lớp học và `operation-alerts.ts` phân loại giống hệt nhau — muốn đổi ngưỡng chỉ sửa 1 chỗ.
- `classes-client.tsx`: badge + thanh sĩ số (dạng thẻ lẫn bảng) từng NGƯỢC nghĩa đèn (đỏ = đầy lớp, xanh = "đang hoạt động" kể cả 1 HS) → nay đỏ = < 8 HS khi còn ≤ 3 ngày khai giảng, vàng = 8–11, xanh = ≥ 12 ("Sĩ số chuẩn · Đã đầy lớp" nếu đầy); lớp < 8 HS ngoài mốc T-3 hiện màu trung tính. Thẻ KPI "Lớp gần đầy sĩ số (≥80%)" và bộ lọc theo % sĩ số giữ nguyên (chỉ số lập kế hoạch mở lớp, không phải đèn).
- Trang Tài chính (sổ công nợ) đã khớp đèn sẵn — không sửa. Trang Học sinh và Chấm công: xem việc còn treo (đợt 2).

**6. Sự cố "không mở được localhost":** không phải lỗi code — lúc đó không có dev server nào chạy. Sau đó trình duyệt từng kẹt ở bản cũ (log ghi ~129 lượt tải lại `/admin/dashboard` trong lúc sửa file liên tục); khởi động lại `npm run dev` + Ctrl+Shift+R là hết.

**7. Không làm theo quyết định chủ dự án:** nhập dữ liệu TalkClass (lớp TC-Basic 21 / TC-Advance 09 / TC-Business 03, 5 GV/trợ giảng) — chủ dự án tự nhập qua giao diện; các lớp/GV "toán 10", "Văn 7", "Thầy Long MCK"... là dữ liệu THẬT trong DB, không phải mock trong code. File mẫu CSV nhập học sinh (bước 3 kế hoạch ban đầu) — bỏ qua.

### 2026-09-25 — Vá lỗi Cody AI Advisor (model Gemini bị khai tử), viết lại phần nhận định AI theo từng mục, và tái cấu trúc triệt để luồng Tạo/Sửa Lớp Học

- **1. Cody AI Advisor báo lỗi 404 rồi 503 — nguyên nhân do Google, không phải cấu hình sai (`lib/actions/ai-analytics.ts`):**
  - Xác minh trực tiếp bằng cách gọi thật Gemini REST API với `GEMINI_API_KEY` trong `.env.local`: model `gemini-1.5-flash` (đang dùng từ phiên 2026-09-23) đã bị Google khai tử hoàn toàn, trả `404 NOT_FOUND`. Đã đổi sang `gemini-3.6-flash` (model Google khuyến nghị thay thế, đã test gọi thành công).
  - Lỗi `503` tiếp theo là do Google tạm quá tải, không phải lỗi cấu hình — đã thêm `fetchGeminiWithRetry()`: tự thử lại 1 lần sau 1.5s nếu gặp 503, kèm thông báo rõ ràng hơn nếu vẫn quá tải.
- **2. Sửa lỗi hiện nguyên dấu `**`/`###` Markdown thô trên UI (cả khung chat lẫn trang in báo cáo):**
  - File mới `components/analytics/ai-markdown.tsx`: hàm `renderFormattedContent()` (bóc tách Markdown cơ bản thành JSX đậm/tiêu đề/bullet) dùng chung cho `analytics-chat-mascot.tsx` và `analytics-print-report.tsx`; hàm `splitAiReportSections()` tách báo cáo AI theo đúng 4 mục I/II/III/IV.
- **3. Viết lại phần nhận định AI trong trang in báo cáo theo yêu cầu chủ dự án — mỗi mục dữ liệu phải có Nhận xét/Nguyên nhân/Giải pháp riêng, không liệt kê lại số liệu đã hiện ở thẻ KPI phía trên:**
  - `analytics-print-report.tsx`: chèn khối "Nhận định & Giải pháp từ Cody" ngay dưới từng mục (1. Tài chính, 2. Công nợ, 3. Vận hành lớp) thay vì dồn hết vào 1 khối cuối trang (đổi tên thành "4. Kế Hoạch Hành Động Tổng Thể", không lặp lại nội dung 3 mục trên).
  - `lib/actions/ai-analytics.ts`: cập nhật prompt gửi Gemini bắt buộc mỗi mục I/II/III phải có đủ 3 phần, và **cấm liệt kê lại số liệu thô** trong phần Nhận xét — phải là nhận định định tính (VD: phát hiện biên lợi nhuận 100% do thiếu dữ liệu lương giáo viên là bất thường, không phải "hiệu quả tốt"). Bản mẫu dự phòng khi thiếu `GEMINI_API_KEY` cũng cập nhật tương tự.
- **4. Tái cấu trúc luồng Tạo/Sửa Lớp Học sau khi phát hiện hàng loạt lỗi liên hoàn từ 1 báo cáo "Chưa cấu hình" của chủ dự án:**
  - **Lỗi gốc phát hiện được:** `createClass()`/`updateClass()` (`lib/actions/classes.ts`) trước giờ **không hề đọc/ghi `end_date`** xuống Supabase dù dialog đã gửi lên — bị âm thầm vứt bỏ. `duration_months`/`total_planned_sessions` chưa từng là cột thật trong DB (chỉ là biến tạm trên UI để tính `end_date`), nên thẻ lớp học đọc mãi mãi ra rỗng, và mỗi lần mở lại lớp để sửa các trường này luôn trống trơn.
  - **Quyết định kiến trúc quan trọng (đã thống nhất với chủ dự án):** Tạo lớp mới phải đủ thông tin (đã thêm validate bắt buộc ở `createClass()`: tên, giáo viên, phòng, học phí > 0, ngày khai giảng, lịch học, thời lượng khóa học). Ngược lại, dialog **Sửa Lớp Học chỉ còn cho sửa 5 thứ thực sự cần đổi khi vận hành: Tên, Phòng, Giáo viên, Học phí, Lịch học hàng tuần** — bỏ hẳn khỏi form Sửa: Ngày khai giảng, Thời lượng khóa học, Tổng số buổi cả khóa, Ngày bế giảng, Sĩ số tối đa (những giá trị hoạch định 1 lần lúc tạo, không phải thứ cần sửa lại). `updateClass()` giờ chỉ đọc/ghi đúng 5 trường đó, không còn động tới `start_date`/`end_date`/`max_students` nên không thể vô tình ghi đè mất dữ liệu hoạch định ban đầu.
  - **Đồng bộ `class_sessions` khi đổi giáo viên/lịch học (mục "Việc còn treo" đã tồn đọng từ lâu, nay xử lý xong):** thêm `cleanupStaleScheduledSessions()` (`lib/utils/session-generator.ts`, chỉ thêm hàm mới) — khi Admin đổi giáo viên, cập nhật `teacher_id` cho mọi buổi `status = 'scheduled'` sang giáo viên mới; khi đổi lịch học, xóa buổi `scheduled` không còn khớp lịch mới rồi để `ensureSessionsGenerated()` (không đổi) tự sinh buổi còn thiếu. Buổi đã `completed`/`cancelled` không bị đụng — giữ nguyên lịch sử lương/điểm danh.
  - **Bug phát sinh giữa chừng đã tự phát hiện và sửa:** 1 effect tự tính `endDate` chạy vô điều kiện trong `class-dialog.tsx` từng âm thầm xóa mất giá trị `endDate` vừa prefill đúng khi mở dialog Sửa (do lúc Sửa cố tình để `totalPlannedSessions` trống) — đã giới hạn effect này chỉ chạy khi Tạo Mới.
  - **Kiểm tra phạm vi ảnh hưởng:** đã grep xác nhận `createClass()`/`updateClass()` chỉ được gọi từ `components/classes/class-dialog.tsx` (riêng Admin) — Teacher/Sale không gọi trực tiếp, chỉ đọc qua `getClassesByTeacher()`/`getClasses()` (không đổi). `lib/actions/classes.ts` và `lib/utils/session-generator.ts` là file Nhóm 2 dùng chung — cần báo team theo mục 8 AGENTS.md trước khi merge `feature/admin` → `develop`, dù rủi ro thấp.
  - **Kiểm tra kỹ thuật:** `npx tsc --noEmit` đạt 0 lỗi sau toàn bộ các thay đổi trên.

### 2026-09-23 — Triển khai Widget Chatbot AI Vận Hành (Cody AI Mascot) & Trang Báo Cáo Phân Tích Chi Tiết Theo Tuần/Tháng (`/admin/analytics`)

- **Bối cảnh & Mục tiêu:**
  - Nâng cấp tính năng Analytics cho Admin với Trợ lý AI Cody đóng vai Cố vấn Quản trị & Vận hành cấp cao.
  - Nút "Tổng hợp báo cáo" trên thanh điều khiển cho phép mở ra ngay **Trang Báo Cáo Phân Tích Chi Tiết Toàn Diện** do AI tổng hợp theo từng **Tuần** hoặc từng **Tháng** được chọn.
  - Nút "In Báo Cáo / Xuất PDF" thuần túy thực hiện lệnh in trực tiếp (`window.print()`) chuẩn khổ A4 dọc.
- **Các thành phần triển khai:**
  1. **Backend Server Actions (`lib/actions/ai-analytics.ts`):**
     - `getOperationalAnalyticsSnapshot(month, year, week)`:
       - Phân quyền fail-closed `requireRole(["admin"])`.
       - Lọc theo khoảng ngày chính xác của Tuần (Cả tháng, Tuần 1..5) theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7).
       - Bóc tách doanh thu thực thu (`invoices.status = 'paid'`), thù lao giáo viên (`class_sessions.status = 'completed'` × `profiles.salary_per_session`), lợi nhuận gộp dạy học.
       - Danh sách học viên âm buổi (`balance_sessions < 0`) và học viên sắp hết buổi (`0 <= balance_sessions <= 2`).
       - Thống kê vận hành từng lớp học (sĩ số đang học, ca dạy xong, ca hủy, số lượt vắng không phép).
       - 100% truy vấn đọc (Read-only), tuyệt đối không chỉnh sửa cơ sở dữ liệu.
     - `generateAIExecutiveReport({ snapshot })`:
       - Lập Báo cáo Phân tích Tổng hợp Chi tiết 4 phần (Bức tranh tài chính, Điểm nghẽn học viên & Công nợ, Hiệu suất từng lớp học, Kế hoạch hành động 4-5 bước cho tuần/tháng tới) qua Google Gemini REST API (`gemini-1.5-flash`). Có cơ chế sinh báo cáo tự động từ số liệu thực tế khi chưa cấu hình `GEMINI_API_KEY`.
     - `askAIAnalyticsChatbot({ messages, snapshot })`:
       - Chatbot đối thoại chuyên sâu qua Google Gemini REST API đóng vai Cố vấn Vận hành.
  2. **Linh vật Chatbot nổi (`components/analytics/analytics-chat-mascot.tsx`):**
     - Nút Mascot nổi góc phải dưới (`fixed bottom-6 right-6 z-50`), badge online xanh ngọc, tooltip gợi ý câu hỏi theo tháng.
     - Khung chat `w-[420px] h-[580px]`, tin nhắn mở đầu tóm tắt số liệu thật của tháng, 3 quick chips bấm nhanh, input bar hỗ trợ Enter và loading state. Có nút chuyển nhanh sang in báo cáo.
  3. **Trang Báo Cáo Phân Tích Chi Tiết & In Ấn A4 (`components/analytics/analytics-print-report.tsx`):**
     - Layout A4 chuẩn văn phòng, `@media print` tự động ẩn thanh điều hướng, nút bấm.
     - 5 khối nội dung: Chỉ số tài chính, Bảng công nợ, Bảng hiệu suất từng lớp học, Khối đánh giá & kế hoạch hành động từ Cody AI, Chữ ký phê duyệt 2 bên (Người lập báo cáo & Giám đốc trung tâm).
     - Bộ lọc Tuần/Tháng/Năm trực tiếp trên trang báo cáo và nút "Cập nhật AI".
     - Nút "In Báo Cáo / Xuất PDF" gọi `window.print()` trực tiếp.
  4. **Tích hợp Dashboard Analytics (`app/admin/analytics/analytics-client.tsx`):**
     - Nút bấm nổi bật "Tổng hợp báo cáo" mở trang báo cáo chi tiết AI.
     - Bộ chọn thời gian: Tuần (Cả tháng, Tuần 1..5), Tháng (1..12), Năm (2024..2027).
     - Nút "In Báo Cáo / Xuất PDF" in trực tiếp.
     - Dọn dẹp mock data tĩnh `DEFAULT_AI_ADVISOR`.
     - Nhúng Mascot Cody AI.
  5. **Mẫu biến môi trường (`.env.example`):** Thêm dòng gợi ý `GEMINI_API_KEY=`.
- **Thẩm định an toàn & Kiểm tra kỹ thuật:**
  - Toàn bộ thay đổi nằm trong phân hệ Admin, hoàn toàn không ảnh hưởng đến `teacher`, `sale`, `student` hay shared core logic.
  - `npx tsc --noEmit` đạt exit code **0**.

### 2026-09-22 — Rà soát tác động của thay đổi `classes.ts`/`students.ts` tới Teacher/Sale trước khi merge (chưa sửa code, chỉ audit)

- Bối cảnh: các thay đổi ở phiên 2026-09-17 bên dưới (đồng bộ enrollments active-only, auto-backfill trong `getStudents()`) vẫn đang ở trạng thái **uncommitted** trên nhánh `feature/admin`, chưa merge về `develop`. `lib/actions/classes.ts` và `lib/actions/students.ts` thuộc Nhóm 2 (dùng chung nhiều phân hệ — mục 8 AGENTS.md), nên trước khi merge đã grep lại codebase thật để xác minh phạm vi ảnh hưởng (không chỉ tin vào nhật ký cũ, đúng tinh thần mục 11.8).
- Xác minh được:
  - **`getClassesByTeacher()`** được gọi trực tiếp ở 4 trang phân hệ Teacher: `app/teacher/classes/page.tsx`, `assignments/page.tsx`, `resources/page.tsx`, `grading/page.tsx`. Sau khi lọc chỉ giữ enrollment `status === 'active'`, giáo viên sẽ không còn thấy học sinh `paused`/`dropped` trong danh sách lớp mình dạy, và `enrollment_count` đổi nghĩa (trước: tổng số bản ghi enrollment; nay: chỉ active).
  - **`getStudents()`** được Sale gọi trực tiếp ở `app/sale/feedback/page.tsx` và `app/sale/accounts/page.tsx`. Cơ chế auto-backfill enrollments mới thêm (hardcode `balance_sessions: 12`) sẽ tự chạy như side-effect ghi DB ẩn mỗi khi Sale chỉ đơn thuần tải trang xem danh sách học sinh — vi phạm mục 11.1 (không tự bịa số liệu mặc định) và biến 1 hàm đọc thành hàm có ghi ẩn.
  - `getClassById()`, `getClasses()` chỉ dùng trong Admin — an toàn. `createStudent()`, `deleteStudent()` thay đổi nhỏ, rủi ro thấp. `enrollStudentInClass()` (thêm `status: "active"`) cần lưu ý vì đây là hàm mục 9 AGENTS.md quy định Sale **bắt buộc** phải tái sử dụng khi chuyển đổi Lead → Học sinh.
- **Việc còn treo — bắt buộc trước khi merge `feature/admin` → `develop`:**
  1. Báo trong nhóm theo đúng mẫu mục 8 AGENTS.md cho 2 file `classes.ts`/`students.ts`, nhắc rõ người phụ trách Teacher và Sale kiểm tra lại sau khi pull `develop` mới (Teacher: học sinh `dropped` có còn hiển thị đúng chỗ cần không; Sale: `getStudents()` có âm thầm tạo enrollment sai số buổi không).
  2. Cân nhắc bỏ đoạn auto-backfill hardcode `balance_sessions: 12` ra khỏi `getStudents()` (nên tách thành 1 action riêng có xác nhận thủ công, thay vì tự chạy ẩn trong hàm đọc), hoặc ít nhất đổi thành cảnh báo rõ ràng thay vì bịa số, đúng mục 11.1.

### 2026-09-23 (Claude) — PR #10 đã merge trước khi hoàn tất 2 việc còn treo ở trên; đã vá 1 trong 2 sau khi merge

Bối cảnh: PR #10 (`feature/admin` → `develop`) đã được merge trước khi 2 việc còn treo ở mục audit 2026-09-22 phía trên được xử lý xong. Đã đọc lại trực tiếp code thật trên `develop` sau merge để đánh giá thiệt hại thực tế (không suy đoán từ báo cáo cũ):

- **`getStudents()` auto-backfill `balance_sessions: 12` — XÁC NHẬN KHÔNG PHẢI MỐI NGUY ĐANG HOẠT ĐỘNG.** Đoạn code này kiểm tra `st.class_id` — nhưng bảng `students` thật **không có cột `class_id`** (đã tra `information_schema.columns` để xác nhận), nên điều kiện kích hoạt luôn sai, đoạn backfill không bao giờ tự chạy với dữ liệu thật hiện tại. Vẫn là code chết nên dọn (nếu sau này ai lỡ thêm cột `class_id` sẽ tự kích hoạt lại), nhưng KHÔNG khẩn cấp — để dành đợt dọn dữ liệu giả tiếp theo, chưa xử lý ngay.
- **`updateStudent()` cascade status xuống mọi enrollments — ĐÃ VÁ.** Xác nhận đây là lỗi thật, sai chiều: dự án đã có sẵn cơ chế đúng (`syncStudentStatusFromEnrollments()`, `lib/utils/enrollment-status.ts` — tính status TỔNG QUÁT của học sinh TỪ các enrollments), trong khi đoạn code mới lại ép NGƯỢC LẠI (status học sinh → xuống mọi enrollments), có thể vô tình "hồi sinh" 1 lượt ghi danh đã nghỉ thật khi Admin chỉ sửa thông tin không liên quan (VD: sửa SĐT). Đã xóa hẳn đoạn cascade sai chiều này khỏi `updateStudent()` — không cần thay thế bằng gì, vì hướng đồng bộ đúng đã có sẵn ở nơi khác rồi.
- `getClassesByTeacher()` (lọc active-only) và `enrollStudentInClass()` (thêm `status: "active"`) — xác nhận AN TOÀN, không cần sửa: khớp đúng quy ước đã dùng khi xây tính năng Bài tập của Teacher (2026-09-22), và là cải thiện thật (trước đây có thể tạo enrollment thiếu status).

**Kết luận sau vá:** Teacher/Sale không bị ảnh hưởng tiêu cực nào còn sót lại từ PR #10. Bài học quy trình: lần này may mắn vì các thay đổi khác đều an toàn — nhưng đây là ví dụ thực tế về lý do phải đợi xác nhận xong trước khi bấm "Merge", không tự ý merge khi còn mục "bắt buộc trước khi merge" chưa xử lý xong (xem mục audit 2026-09-22 phía trên).

### 2026-09-17 — Sửa triệt để lỗi bất đồng bộ sĩ số lớp học & Đồng bộ dữ liệu liên kết Học sinh - Lớp học (Single Source of Truth)

- **Đồng bộ dữ liệu liên kết & Tự động Backfill (`lib/actions/students.ts`):**
  - **`getStudents()`**: Bổ sung `status` vào câu select `enrollments`. Thêm cơ chế tự động kiểm tra & tạo mới/upsert bản ghi `enrollments` (`status = 'active'`) cho bất kỳ học sinh nào có gán lớp nhưng thiếu bản ghi trong bảng `enrollments`.
  - **`createStudent()` & `enrollStudentInClass()`**: Đảm bảo các bản ghi `enrollments` luôn được khởi tạo kèm `status: 'active'`.
  - **`updateStudent()`**: Tự động đồng bộ trạng thái `status` ('active' hoặc 'dropped') sang toàn bộ bản ghi `enrollments` của học sinh tương ứng khi Admin đổi trạng thái học sinh.
- **Đồng nhất nguồn tính sĩ số từ Database Supabase (`lib/actions/classes.ts`):**
  - **`getClasses()` / `getClassById()` / `getClassesByTeacher()`**: Query động bảng `enrollments` liên kết `(id, student_id, status)` và lọc chỉ đếm các bản ghi `status === 'active'` (bỏ qua học sinh đã nghỉ / dropped).
  - Trả về thuộc tính `enrollment_count = activeEnrollments.length` và mảng `enrollments` chuẩn.
- **Chuẩn hóa Giao diện hiển thị (`classes-client.tsx`, `class-detail-client.tsx`, `students-client.tsx`):**
  - **`/admin/classes`**: Thẻ danh sách lớp đọc trực tiếp `actualCount` từ `enrollments` active. Khi sĩ số bằng 0, hiển thị chính xác `0 / 15 HS (0%)` với progress bar 0% và badge `"⚪ Chưa có học sinh"`.
  - **`/admin/classes/[id]`**: Thẻ "SĨ SỐ LỚP" và bảng danh sách học sinh dùng chung `actualCount` thực tế.
  - **`/admin/students`**: Cột "Lớp đang theo học" ưu tiên lọc và hiển thị lớp theo bản ghi `enrollments` đang hoạt động (`status === 'active'`).
- **Kiểm tra kỹ thuật:** `npx tsc --noEmit` đạt 0 lỗi type/import.

### 2026-09-16 — Tổng hợp hoàn thiện Phân hệ Admin: Tái cấu trúc Dashboard, Tinh giản Trạng thái Học sinh & Dọn dẹp Luồng thủ công

- **1. Tinh giản Luồng Ghi danh & Dọn dẹp Trang Chi tiết Lớp học (`/admin/classes/[id]`):**
  - **Gỡ bỏ nút thủ công:** Đã xóa bỏ hoàn toàn nút `+ Thêm Học Sinh Vào Lớp` và nút `Tạo Buổi học Lớp này` tại header trang chi tiết lớp học (`class-detail-client.tsx`). Quy trình đưa học sinh vào lớp sẽ đi qua luồng Ghi danh & Chuyển đổi chuẩn hóa của phân hệ Tuyển sinh (Sale / Admissions).
  - **Dọn dẹp Dead Code & Modal:** Loại bỏ state `isAddStudentOpen`, `isSessionOpen`, biến `alreadyEnrolledStudentIds`, modal `<AddStudentDialog />`, modal `<CreateSessionDialog />` và các import thừa (`AddStudentDialog`, `CreateSessionDialog`, `UserPlus`, `Plus`, `CalendarCheck`). Loại bỏ triệt để lỗi ghi đè state rác được ghi nhận tại Mục 15.2 (`context-handoff.md`).
  - **Cập nhật Empty State:** Khi lớp chưa có học sinh (`actualCount === 0`), render thông báo chuẩn: `"Lớp học hiện chưa có học sinh nào. Học sinh sẽ được tự động thêm vào đây khi hoàn tất Ghi danh tại phân hệ Tuyển sinh."`

- **2. Tinh giản Hệ thống Trạng thái Học sinh (`/admin/students`):**
  - **Loại bỏ trạng thái "Tạm dừng" (`paused`):** Quy chuẩn toàn bộ phân hệ chỉ dùng 2 trạng thái: `🟢 Đang học` (`active` / `enrolled`) và `🔴 Đã nghỉ` (`dropped` / non-active).
  - **Cập nhật UI & Dialog:** Loại bỏ tùy chọn `paused` ở dropdown bộ lọc trạng thái toolbar, menu đổi trạng thái nhanh tại bảng học sinh (`students-client.tsx`), và dropdown trạng thái trong form sửa học sinh (`student-dialog.tsx`).
  - **Chuẩn hóa Badge:** `active`/`enrolled` hiển thị badge xanh `bg-emerald-50 text-emerald-700 border-emerald-200` ("Đang học"); tất cả trạng thái khác hiển thị badge đỏ `bg-rose-50 text-rose-700 border-rose-200` ("Đã nghỉ").

- **3. Tái cấu trúc Bố cục Dashboard Admin & Khắc phục lỗi Nhân bản Ca học:**
  - **Quick Nav & Layout:** Thu gọn Quick Nav header bar (gap-1.5, px-2.5 py-1.5, text-xs font-medium, w-4 h-4 icons) vừa khít 1 hàng ngang không bị tràn viền màn hình laptop ở 100% zoom.
  - **Zero-Mock Data (Điều 4):**
    - Hàng 4 thẻ KPI chính (`Tổng số học sinh`, `Lớp học đang mở`, `Công nợ chưa thu`, `Doanh thu tháng này`) chuẩn hóa `text-2xl font-bold text-slate-900 tracking-tight`, lấy dữ liệu DB thật.
    - Flat Metric Strip 3 thẻ (`Doanh thu đã thu`, `Dự tính lương GV`, `Lợi nhuận gộp`) đặt phẳng ngay dưới KPI.
    - Cột Trái Cảnh báo Vận hành (Grid 6/12): Quét dữ liệu thật (lớp thiếu phòng, học sinh nợ/sắp hết buổi, ca đã kết thúc chưa điểm danh). Nếu 0 sự vụ, render Empty State trung thực: `"Hiện tại không có sự vụ vận hành nào cần xử lý. Hệ thống hoạt động bình thường."`
  - **Sửa lỗi Nhân bản Ca học (207 ca / 69 trang):**
    - Tính ngày hôm nay theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh` -> `YYYY-MM-DD`).
    - Lọc truy vấn `class_sessions` đúng `session_date = today` và `status !== 'cancelled'`.
    - Chống trùng lặp theo Key `${class_id}_${session_date}_${start_time}` ở cả `lib/actions/dashboard.ts` và `dashboard-client.tsx`.
    - Tích hợp phân trang 3 ca/trang với bộ điều hướng `◀ Trang X / Y ▶` (vô hiệu hóa nút khi <= 3 ca, ẩn thanh khi 0 ca).

- **4. Áp dụng Hệ thống Design Tokens & Kiểm tra Kỹ thuật:**
  - Áp dụng bộ Design Tokens chuẩn toàn phân hệ Admin (Card Title `text-xs font-semibold uppercase`, Metric Value `text-2xl font-bold text-slate-900`, Table Header `bg-slate-50/80 text-slate-600 uppercase`).
  - Kiểm tra biên dịch TypeScript `npx tsc --noEmit` đạt mã **0 (sạch lỗi type/import)**.

### 2026-09-14 — Hoàn thiện "Học sinh đã có tài khoản đăng nhập" ở trang Quản lý Tài khoản

Chủ dự án test trang `/admin/accounts` phát hiện phần "Học sinh đã có tài
khoản đăng nhập" chỉ hiện tên dạng badge tĩnh, không xem được email đăng
nhập, không thao tác gì được (không đổi được mật khẩu khi học sinh quên).
Đã hoàn thiện:
- Thêm `getStudentAccountsOverview()` (`lib/actions/accounts.ts`) — trả về
  danh sách học sinh đã có tài khoản kèm email thật (cross-reference qua
  `adminClient.auth.admin.listUsers()`, giống cách `getAllAccounts()` đã làm).
- Thêm `resetStudentPassword()` (`lib/actions/students.ts`) — đổi mật khẩu
  1 học sinh theo `studentId`, bắt buộc mật khẩu mới ≥ 8 ký tự.
- Cập nhật `accounts-client.tsx`: thay badge tĩnh bằng bảng có cột Email +
  SĐT phụ huynh + nút "Đổi mật khẩu" (dialog mới
  `components/accounts/reset-student-password-dialog.tsx`, có check
  `result.error` đúng chuẩn Mục 3 AGENTS.md).

**Quyết định kiến trúc quan trọng đi kèm (đã xác nhận với chủ dự án):** Sale
cũng được cấp quyền **quản lý đầy đủ** tài khoản học sinh (xem, tạo, đổi mật
khẩu) — không chỉ Admin — vì Sale là người trực tiếp làm việc/hỗ trợ học
sinh hằng ngày. Đã nới quyền `createAccountByAdmin()` (`lib/actions/auth.ts`)
để Sale gọi được, nhưng CHỈ khi tạo tài khoản role="student" (chặn cứng ở
tầng server, Sale không bao giờ tạo được tài khoản Admin/Teacher/Sale qua
hàm này). `getStudentAccountsOverview()` và `resetStudentPassword()` cũng
đã guard `["admin","sale"]` sẵn. Chi tiết đầy đủ cho Sale ở
`docs/context-sale.md`. **Việc còn lại (không chặn ai):** Sale hiện CHƯA có
UI riêng để dùng 3 hàm này (chưa build trang Sale) — đây là việc của người
code Sale khi họ xây màn hình quản lý học sinh của họ, không phải việc của
Admin.

## Phiên 2026-09-16: Cập nhật thẻ Công Nợ & Khối Cảnh Báo Vận Hành trên Dashboard Tổng Quan

- **Thẻ KPI "CÔNG NỢ CHƯA THU" trên Dashboard (`app/admin/dashboard/dashboard-client.tsx`):**
  - Chuyển thành `<Link href="/admin/finance?tab=students&filter=debt">`.
  - Tiêu đề: `CÔNG NỢ CHƯA THU`.
  - Dòng phụ: `[X khoản nợ • Bấm để xem danh sách]` (xóa cụm "xử lý / xóa nợ").
  - Giá trị tổng nợ: `stats.unpaidDebt` tính toán từ dữ liệu thực tế.

- **Tự động lọc công nợ tại trang Tài chính (`app/admin/finance/`):**
  - Cập nhật `app/admin/finance/page.tsx` và `finance-client.tsx`: hỗ trợ query params `tab=students` và `filter=debt`. Khi có `tab=students`, tự động mở Tab "Tài chính Học viên" (`ledger`).
  - Cập nhật `components/finance/customer-ledger-table.tsx`: khi nhận `filter=debt`, tự động kích hoạt bộ lọc `[ Nợ / Âm buổi ]`, chỉ hiển thị học sinh có nợ (`st.currentDebt > 0 || st.totalBalanceSessions <= 0`). Bấm `[ Tất cả ]` sẽ xóa `filter` khỏi URL và hiển thị lại toàn bộ học viên.

- **Thay thế "Cảnh báo học phí" thành "CẢNH BÁO VẬN HÀNH":**
  - Xóa bỏ khối "Cảnh báo học phí" cũ (chăm sóc học phí thuộc nghiệp vụ Sale).
  - Thêm khối `CẢNH BÁO VẬN HÀNH` quét từ dữ liệu thật:
    1. Lớp chưa có giáo viên (`!cls.teacher_id && !cls.teacherId && !cls.teacher?.id && ...`).
    2. Lớp chưa xếp phòng (`!cls.room || cls.room === 'Chưa xếp' || cls.room === 'Chưa xếp phòng'`).
    3. Ca học hôm nay kết thúc mà chưa điểm danh (`todaySessions` đã kết thúc dựa theo giờ kết thúc/bắt đầu nhưng chưa hoàn tất điểm danh).
  - Có link điều hướng nhanh đến chi tiết từng lớp học (`/admin/classes/[id]`).
  - Nếu không có cảnh báo nào, hiển thị trạng thái an toàn chuẩn:
    `<div className="p-4 text-center text-sm text-slate-500">Hệ thống vận hành ổn định. Các lớp học đều đã đủ giáo viên, phòng học và hoàn tất điểm danh.</div>`.
  - Tuân thủ Điều 4: Không mock/fallback data ảo.

## Phiên 2026-09-16: Thiết Lập & Áp Dụng Hệ Thống Design Tokens Đồng Bộ Toàn Diện Cho Toàn Bộ Phân Hệ Admin

- **Quy chuẩn Typography & Token áp dụng:**
  - Tiêu đề khối / Card: `text-xs font-semibold uppercase tracking-wider text-slate-500`
  - Số liệu lớn (Metric Values): `text-2xl font-bold text-slate-900 tracking-tight my-1` (**BẮT BUỘC** `text-slate-900`, tuyệt đối không dùng font chữ xanh/đỏ/vàng cho metric lớn).
  - Subtext chân thẻ: `text-xs text-slate-400 truncate`
  - Nội dung bảng: `text-sm text-slate-700 font-medium`
  - Table Header `<thead>`: `bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider`
  - Table Body `<tbody>`: `hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0`
  - Padding ô bảng: `py-3 px-4`
  - Màu icon nhận diện góc phải `w-10 h-10 rounded-xl`:
    - Đào tạo / Học sinh / Lớp học: `bg-blue-50 text-blue-600`
    - Doanh thu / Dòng tiền vào: `bg-emerald-50 text-emerald-600`
    - Chi phí / Công nợ / Cảnh báo: `bg-rose-50 text-rose-600`
    - Tiến độ / Chuyên cần: `bg-amber-50 text-amber-600`

- **Các trang & component đã rà soát và chuẩn hóa:**
  1. `/admin` (Tổng quan Dashboard): `app/admin/dashboard/dashboard-client.tsx`
  2. `/admin/classes`: `app/admin/classes/classes-client.tsx`
  3. `/admin/classes/[id]`: `app/admin/classes/[id]/class-detail-client.tsx`
  4. `/admin/students`: `app/admin/students/students-client.tsx`
  5. `/admin/teachers`: `app/admin/teachers/teachers-client.tsx`
  6. `/admin/finance`: `components/finance/customer-ledger-table.tsx`, `components/finance/transaction-logs-table.tsx`, `components/finance/payroll-tab.tsx`
  7. `/admin/analytics`: `app/admin/analytics/analytics-client.tsx`, `components/analytics/ai-advisor-header.tsx`, `components/analytics/gross-profit-card.tsx`, `components/analytics/cashflow-chart-card.tsx`
- **Kiểm tra biên dịch:** `npx tsc --noEmit` đạt code 0 (sạch lỗi type/syntax).

## Phiên 2026-09-22 (Claude): Nối luồng dữ liệu Sale→Admin, vá 3 bug tầng tiền/số liệu

Bối cảnh: chủ dự án yêu cầu rà soát toàn bộ 4 phân hệ + nối các luồng dữ liệu
còn thiếu giữa chúng. Phần liên quan Admin:

- **Trang mới `/admin/admissions-report`** ("Báo cáo Tuyển sinh", menu sidebar
  mới) — Admin lần đầu xem được báo cáo tổng hợp từ Sale: KPI phễu, doanh thu
  theo nguồn/nhân viên Sale (30 ngày), danh sách học sinh chờ xếp lớp, tổng
  quan Phản ánh & Góp ý. **Chỉ xem, không thao tác** (đúng nguyên tắc "1 tính
  năng 1 chủ sở hữu" — file mới `app/admin/admissions-report/*`, tái dùng
  100% Server Action Sale đã có sẵn (`getAdmissionsKpiStats`,
  `getAdmissionsReportData`, `getWaitingListStudents`, `getFeedbackKpiStats`),
  không viết logic đọc dữ liệu Sale mới.
- **`components/invoices/create-invoice-dialog.tsx`**: sửa lỗi ghi "đã thu
  tiền" vào UI/store TRƯỚC khi gọi Server Action, lỗi thật bị nuốt bằng
  try/catch rỗng — Admin có thể tưởng đã thu tiền dù `createInvoice()` thất
  bại thật. Đã đảo thứ tự: gọi server trước, chỉ cập nhật UI khi có
  `success` thật, hiện `result.error` nếu thất bại.
- **`app/admin/finance/finance-client.tsx`**: dialog "Tạo Phiếu Thu" từng ưu
  tiên `globalStudents` (state cũ trong trình duyệt/localStorage) hơn
  `studentsRaw` (dữ liệu thật mới nhất từ server) khi chọn học sinh — ngược
  với cách `students-client.tsx`/`classes-client.tsx` đã làm đúng. Đã sửa lại
  đúng thứ tự ưu tiên.
- **`getCenterBankSettings()` (`lib/actions/settings.ts`, Nhóm 2)**: trước
  đây khi lỗi/thiếu dữ liệu sẽ fallback về 1 tài khoản ngân hàng hardcode
  (`DEFAULT_CENTER_BANK_SETTINGS`) — nay trả `null` thật sự, không còn bịa.
  **Nếu Admin tự viết thêm màn hình nào dùng `getCenterBankSettings()`, bắt
  buộc tự kiểm tra `null` và hiện "Chưa cấu hình tài khoản ngân hàng"** —
  không được giả định luôn có dữ liệu (xem cách `components/sale/conversion-checkout-modal.tsx`
  đã làm để tham khảo pattern).
- **"Chi phí cố định" ở `/admin/analytics`**: hết bịa cứng 6.500.000đ/tháng.
  Thêm cột `center_settings.fixed_cost` (nullable — `null` = chưa cấu hình).
  Khi chưa cấu hình, trang hiện banner vàng "Chưa cấu hình" kèm ô nhập trực
  tiếp ngay trên trang (gọi `updateCenterFixedCost()` mới trong
  `lib/actions/settings.ts`, admin-only) — **cần Admin tự vào `/admin/analytics`
  nhập số chi phí cố định thật 1 lần** để "Lợi nhuận gộp" tính đúng.
- **`lib/actions/teachers.ts` (Nhóm 2) — thống nhất lại công thức thu nhập
  giáo viên:** `getTeacherPersonalEarnings()` (Teacher tự xem) trước đây cộng
  cả những buổi thuộc lớp mình phụ trách dù người khác dạy thay hôm đó, khiến
  Teacher thấy số cao hơn số Admin thực trả qua `getTeacherPayroll()`
  (`/admin/finance` tab Lương). Đã sửa `getTeacherPersonalEarnings()` chỉ
  tính đúng buổi `class_sessions.teacher_id = chính mình` — khớp 100% với
  công thức Admin dùng để trả lương.
- `npx tsc --noEmit`: exit code 0.

