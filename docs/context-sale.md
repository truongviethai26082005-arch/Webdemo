Nhật ký làm việc — Phân hệ Tuyển sinh (Sale)
> File này CHỈ dành cho người phụ trách phân hệ Sale ghi lại tiến độ, quyết
> định, và vấn đề phát sinh của RIÊNG phân hệ này. Không phân hệ khác sửa
> file này — mỗi người chỉ đụng đúng 1 file log của mình, để nhánh của ai
> merge về `develop` cũng không xung đột với nhau ở file ghi chú.
>
> Đọc 2 file này TRƯỚC (áp dụng chung toàn dự án, không đổi theo phân hệ):
> - `AGENTS.md` — quy tắc kiến trúc/bảo mật/convention cố định.
> - `docs/context-handoff.md` — bối cảnh chung toàn dự án.
>
> **File này đã được tổng hợp lại lần 3 ngày 2026-09-16** (lần 2 ngày
> 2026-09-15, lần 1 cũng ngày đó khi file dài 721 dòng) — mục "Trạng thái
> hiện tại" ngay dưới đây đủ để nắm toàn bộ tình hình mà không cần đọc hết
> "Nhật ký" chi tiết bên dưới. Chỉ đọc "Nhật ký" khi cần tra lại lý do/chi
> tiết kỹ thuật của 1 quyết định hoặc 1 lần vá lỗi cụ thể (4 mục
> "2026-09-16 (tiếp 1-4)" ở đầu Nhật ký ghi chi tiết mọi thay đổi của hôm nay).

## Trạng thái hiện tại — Tổng hợp (cập nhật 2026-09-16, lần 3)

### Đã xây xong, đang hoạt động thật (đã kiểm chứng qua dữ liệu thật trên Supabase)

| Trang/Tính năng | Route | Ghi chú |
|---|---|---|
| Lịch làm việc hôm nay | `/sale/daily-tasks` | Hẹn gọi lại, ca học thử, Lead mới, học sinh chờ xếp lớp. (Khối "Nhắc Lịch Tự Động" đã bị **XÓA HẲN** theo yêu cầu chủ dự án ngày 2026-09-16 — không còn tồn tại) |
| Phễu Tuyển sinh (CRM **5 tab**) | `/sale/admissions` | Leads, Học thử, Ghi danh & VietQR, Slot Lớp Trống, **Test Đầu Vào** (mới) |
| Học sinh chờ xếp lớp | `/sale/admissions/waiting-list` | Đã đóng tiền, chưa có lớp phù hợp |
| Tài khoản Học sinh | `/sale/accounts` | Sale toàn quyền tạo/đặt lại mật khẩu học sinh |
| Phản ánh & Góp ý | `/sale/feedback` | DB đã chạy migration, hoạt động thật |
| Báo cáo Tuyển sinh | `/sale/reports` | Theo nguồn, theo thời gian, theo học thử, theo nhân viên Sale + doanh thu |
| Thêm nhanh Lead | Nút nổi (FAB), mọi trang Sale | `quickCreateLead()` |
| **Điểm danh học thử qua QR** (mới) | `/checkin/[token]` (công khai) | Học sinh tự quét QR dán tại phòng, nhập SĐT để điểm danh |
| **Test đầu vào tự làm** (mới) | `/test/[token]` (công khai) | Học sinh tự làm bài trắc nghiệm qua link/QR Sale gửi, tự chấm điểm |

**9 bảng DB riêng của Sale** — 5 bảng gốc đã chạy migration, có dữ liệu thật
(`leads`, `lead_interactions`, `trial_slots`, `lead_trials`,
`feedback_tickets`); **4 bảng mới ngày 2026-09-16 CHƯA CHẠY migration**
(`entrance_test_questions`, `lead_test_attempts`, `lead_test_answers`,
`course_recommendation_rules`) — xem mục "Việc cần làm tiếp".

### Mô hình Phễu hiện tại — hiển thị 3 giai đoạn, nội bộ vẫn giữ 6 `stage` chi tiết

**Thay đổi lớn ngày 2026-09-16:** phễu đổi cách HIỂN THỊ từ 4 tầng (N1-N4) UI
cũ sang **3 giai đoạn nghiệp vụ**: *1. Khách hàng tiềm năng → 2. Xếp lịch học
thử → 3. Ghi danh & chuyển đổi* (`lib/utils/admissions-funnel.ts`). Đây CHỈ
là lớp trình bày — cột `stage` trong DB **không đổi schema**, vẫn giữ nguyên
6 giá trị cũ với toàn bộ logic tự động đã kiểm chứng đúng:

```
LeadStage (DB, không đổi): raw → potential → trial → conversion → enrolled/waiting_class
Hiển thị UI (mới):         [1. Khách hàng tiềm năng] [2. Xếp lịch học thử] [3. Ghi danh & chuyển đổi]
                             raw + potential            trial                conversion + enrolled + waiting_class
```

- **Giai đoạn 1** gồm `raw` (Lead thô, chưa liên hệ) và `potential` (đã liên
  hệ, xác thực nhu cầu — tự động thăng khi Sale liên hệ thành công, cả qua
  form ghi nhật ký lẫn nút "Chuyển nhanh trạng thái").
- **MỚI 2026-09-16: có thể "Chốt đơn" ngay từ Giai đoạn 1** (`potential`) để
  **bỏ qua học thử** — `canStartConversion()` trong `admissions-funnel.ts`.
  Trước đây nút "Chốt đơn" chỉ hiện ở `trial`/`conversion`.
- **Giai đoạn 2** = `trial` (đang học thử) — nút "Học thử" chỉ hiện từ
  Giai đoạn 1 trở đi, ép đúng thứ tự, không nhảy cóc.
  - **MỚI:** mỗi ca học thử (`trial_slots`) có 1 mã **QR điểm danh cố định**
    (nút "Mã QR" trong tab Ca Học thử) — dán tại phòng học, học sinh tự quét
    + nhập SĐT để tự điểm danh tại `/checkin/[token]` (không cần tài khoản).
  - **MỚI:** nút "Gửi test" gửi link/QR bài test đầu vào tự làm cho từng học
    sinh học thử, tự động chấm điểm khi nộp bài.
- **Giai đoạn 3** = `conversion` (chờ chốt sau học thử) + `enrolled`/
  `waiting_class` (Chính thức, đã thanh toán). N4 khóa cứng như cũ (không lùi
  được các trạng thái chăm sóc trước đó).
- Khi Lead đạt `enrolled` với **đủ 3 điều kiện (chốt học + thanh toán + đã
  xếp lớp)** → tự động cấp tài khoản đăng nhập cho học sinh (nếu có email
  thật) — không đổi so với trước.
- **MỚI (song song, không thuộc mô hình stage):** bấm biểu tượng "Gọi" ở bảng
  Lead/Drawer quá 3 lần sẽ **tự động chuyển `status` sang "Không có nhu cầu"**
  — tái dùng đúng cơ chế `missed_calls_count` đã có (không phải luồng
  `stage`, đây là `status` — 2 khái niệm vẫn tách biệt như thiết kế gốc).

### Việc chủ dự án cần làm tiếp (ưu tiên từ trên xuống)

1. **Chạy 3 migration đang treo trên Supabase** (Claude không có quyền ghi
   DB trực tiếp):
   - `20260915_split_lead_stage_raw_potential.sql` — còn treo từ trước, vẫn
     còn Lead cũ kẹt ở `stage = 'inquiry'`.
   - `20260916_admissions_checkin_and_entrance_test.sql` — **BẮT BUỘC** để
     QR điểm danh + Test đầu vào hoạt động (tạo 4 bảng mới + 4 hàm
     `SECURITY DEFINER` xử lý luồng công khai).
   - `20260916b_add_leads_facebook_url.sql` — **BẮT BUỘC** để nút liên hệ
     Facebook hoạt động (nếu chưa chạy, bấm "+ Facebook" sẽ báo lỗi).
2. **Cung cấp ngân hàng câu hỏi Test đầu vào thật** — tab "Test Đầu Vào" ở
   `/sale/admissions` đang HOÀN TOÀN TRỐNG (đúng AGENTS.md 11.1, không tự
   bịa câu hỏi). Cần: môn học, nội dung câu hỏi, 4 đáp án, đáp án đúng.
3. **Cấu hình bảng quy đổi điểm → gợi ý khóa học** (cùng tab "Test Đầu Vào")
   — cũng đang trống, cần nhập khoảng % điểm thật ứng với lớp/lộ trình nào.
4. Nối `getRecommendationForScore()` (đã viết, chưa gắn UI) vào màn hình xem
   kết quả test của 1 Lead để Sale thấy gợi ý khóa học ngay khi chốt đơn.
5. Thêm UI hiển thị danh sách `lead_test_attempts` (đã gửi/đã nộp bài chưa)
   cho từng Lead — `getTestAttemptsForLead()` đã viết, chưa gắn UI.
6. Cân nhắc: mỗi lần bấm "Gọi" hiện tự ghi 1 dòng vào nhật ký chăm sóc
   (`lead_interactions`) — nếu thấy nhật ký bị "rác" theo thời gian, cần bàn
   lại cách tách bạch "số lần bấm nút Gọi" khỏi "nhật ký chăm sóc thật".
7. Quyết định có muốn đầu tư 1 dịch vụ đọc biến động số dư ngân hàng
   (Casso/SePay...) để tự động hóa xác nhận thanh toán hay không — hiện vẫn
   xác nhận thủ công (đã hoạt động đúng, có chống double-submit).
8. Cân nhắc thu thập **email thật** của Lead khi tiếp nhận (form "Thêm nhanh
   Lead" hiện không có trường email) — nếu không, tính năng tự động cấp tài
   khoản học sinh sẽ hiếm khi tự chạy được (không tự bịa email).
9. Xác nhận có muốn xóa hẳn `app/admin/admissions` (giao diện mock cũ) hay
   giữ lại tham khảo — có dấu hiệu đã bị xóa ở 1 phiên trước nhưng chưa xác
   nhận chắc chắn, cần tự kiểm tra lại thư mục `app/admin/` khi rảnh.
10. Toàn bộ thay đổi vẫn đang **uncommitted trên git** (233 file mới/thay đổi
    tính tới 2026-09-16) — tự xem diff và commit khi sẵn sàng (Claude không
    tự commit/push).

### Quyết định kiến trúc đã chốt (áp dụng khi viết code Sale mới)

- **Tách `stage`** (giai đoạn N1-N4 trong phễu) **khỏi `status`** (kết quả
  chăm sóc: new/contacted/callback/no_demand/converted) — 2 khái niệm độc
  lập, không lẫn vào nhau.
- **Chốt đơn luôn tách 2 bước:** Bước 1 ghi nhận thanh toán ngay (tạo học
  sinh + hóa đơn `paid`) bất kể đã có lớp hay chưa; Bước 2 xếp lớp CHỈ khi có
  lớp phù hợp và còn chỗ, nếu không thì vào "chờ xếp lớp".
- **Không dùng cron/job nền** — mọi trạng thái tự động đều tính TẠI THỜI
  ĐIỂM ĐỌC dữ liệu.
- **"1 tính năng 1 chủ sở hữu"** — khi Sale cần tạo/sửa dữ liệu thuộc lãnh
  địa Admin, luôn tái dùng đúng Server Action đã có sẵn (`createStudent`,
  `createInvoice`, `enrollStudentInClass`, `createAccountByAdmin`,
  `resetStudentPassword`) — KHÔNG tự viết luồng lưu trữ song song.
- **Không tự bịa giá trị mặc định khi thiếu dữ liệu thật** (AGENTS.md Mục
  11.1) — áp dụng cho: nguồn tiếp nhận Lead, lớp học khi chốt đơn/xếp lớp
  (không mặc định "lớp đầu tiên trong danh sách"), và email khi cấp tài
  khoản tự động.
- **Mọi Server Action đổi trạng thái quan trọng phải tự kiểm tra ở server,
  không dựa vào UI đã ẩn/khóa nút hay chưa** — áp dụng cho: chặn chốt đơn 2
  lần, khóa trạng thái Lead đã N4, chặn xếp ca học thử vượt sĩ số.
- **Hiển thị "người phụ trách" chỉ mang tính thông tin, KHÔNG giới hạn quyền
  thao tác** — mọi Sale/Admin vẫn xem/xử lý được mọi Lead, tránh 1 Lead bị
  "kẹt" chờ đúng người phụ trách rảnh (ưu tiên tối ưu nguồn lực hơn phân
  quyền cứng).
- **Web-to-Lead API: đã xây rồi GỠ BỎ hoàn toàn** theo yêu cầu chủ dự án —
  hiện KHÔNG tồn tại trong hệ thống.
- **MỚI (2026-09-16) — Luồng công khai (chưa đăng nhập) dùng hàm Postgres
  `SECURITY DEFINER` hẹp, KHÔNG mở RLS rộng cho vai trò `anon`:** học sinh
  học thử/làm test chưa có tài khoản (chỉ được cấp khi `enrolled`), nên 2
  route công khai `/checkin/[token]` và `/test/[token]` không thể dùng RLS
  kiểu "authenticated full access" như 7 bảng lõi. Thay vào đó dùng 4 hàm
  `SECURITY DEFINER` (`checkin_trial_lead`, `get_trial_slot_public_info`,
  `get_entrance_test`, `submit_entrance_test` — xem migration
  `20260916_admissions_checkin_and_entrance_test.sql`) chỉ trả về đúng dữ
  liệu tối thiểu cần thiết, không có endpoint nào liệt kê toàn bộ bảng
  `leads`/`entrance_test_questions`. Áp dụng nguyên tắc này cho MỌI tính
  năng công khai tương lai của Sale — không mở RLS rộng cho `anon`.

### Liên kết với Admin/Teacher/Student

5 điểm nối duy nhất, đều qua Server Action dùng chung đã có sẵn (xác nhận
bằng grep toàn bộ repo nhiều lần trong ngày, không suy đoán):

| Sale gọi hàm | Ảnh hưởng |
|---|---|
| `createStudent()` | Admin thấy ngay ở `/admin/students` |
| `createInvoice()` | Cộng doanh thu `/admin/finance`, `/admin/invoices` |
| `enrollStudentInClass()` | Admin thấy sĩ số lớp; Teacher thấy học sinh trong lớp/điểm danh |
| `createAccountByAdmin()` / `resetStudentPassword()` | Mở/đổi khả năng đăng nhập của Student |

9 bảng riêng của Sale (5 gốc + 4 mới ngày 2026-09-16) — **không phân hệ nào
khác đọc/ghi trực tiếp**, cô lập hoàn toàn trong `lib/actions/admissions.ts`,
`lib/actions/feedback.ts`, `lib/actions/entrance-test.ts`,
`lib/actions/trial-checkin.ts`. `trial_slots.teacher_name` **cố ý** chỉ là
text tự do, KHÔNG liên kết tới tài khoản Teacher thật — tránh tạo phụ thuộc
chéo phân hệ không cần thiết cho 1 ca học thử (khác hẳn lớp học chính thức).
Type `LeadStage`/`Lead` trong `types/database.ts` **chỉ các file thuộc
`app/sale/`/`components/sale/`/`app/checkin/`/`app/test/` dùng** — không ảnh
hưởng Admin/Teacher/Student.

**2 route công khai mới KHÔNG bị `proxy.ts` chặn** (middleware chỉ bảo vệ
`/admin`, `/teacher`, `/sale`, `/student` — đã xác nhận đọc code) nên không
cần sửa file dùng chung Nhóm 1 này.

⚠️ **Khoảng trống lớn nhất còn lại:** `app/sale/layout.tsx` chặn cứng chỉ
role `"sale"` mới vào được — Admin hiện KHÔNG có bất kỳ trang nào đọc được
báo cáo/dữ liệu tổng hợp từ Sale (dù Server Action đã cho phép cả `"admin"`
gọi). `students.note` (Sale ghi khi chốt đơn) có hiển thị ở `/admin/students`
nhưng KHÔNG hiển thị bên Teacher ở đâu cả.

### Vấn đề đã phát hiện & vá trong ngày 2026-09-15 (danh sách đầy đủ — chi tiết root-cause/fix ở Nhật ký)

1. Lỗ hổng sĩ số ca học thử (`registerLeadTrials` không kiểm tra server-side).
2. "Nguồn tiếp nhận" tự bịa giá trị mặc định khi Sale quên chọn.
3. Xung đột z-index: `SelectContent` bị `DialogOverlay` che khuất (8 vị trí).
4. Chọn nhầm lớp/môn khi Chốt đơn/Xếp lớp (mặc định "lớp đầu tiên trong danh
   sách" thay vì bắt buộc chọn thật).
5. Lead đã Chính thức (N4) vẫn hiện ở "Lịch Học Thử" + nguy cơ tạo trùng học
   sinh/hóa đơn nếu bấm "Chốt học" lần 2 (double-submit).
6. Lead kẹt vĩnh viễn ở N1 dù đã đánh dấu "Đã liên hệ" qua nút nhanh (không
   thăng tầng như khi dùng form đầy đủ).
7. Trạng thái Lead N4 vẫn đổi ngược được qua nút "Chuyển nhanh trạng thái".
8. Không tick chọn được ca học thử (double-toggle giữa `div` cha và
   `Checkbox` con).
9. Lead "Hẹn gọi lại" qua nút nhanh không xuất hiện ở "Lịch làm việc hôm nay"
   (2 nơi dùng 2 nguồn dữ liệu khác nhau cho cùng khái niệm).
10. Thử đồng bộ công thức KPI bar với biểu đồ phễu (cùng nhãn N1-N4 nhưng
    khác công thức) rồi **hoàn tác theo yêu cầu chủ dự án** — xác nhận đây là
    hành vi đúng thiết kế, không phải bug.

### Backlog — đã phân tích khả thi, CHƯA code (chỉ làm khi có nhu cầu thật)

*(Mục "Tra cứu Slot lớp học real-time" từng nằm ở đây đã XÂY XONG — nay là
tab "Slot Lớp Trống" trong `/sale/admissions`, xem bảng tính năng ở trên.)*

1. **Quản lý vòng đời học viên** (bảo lưu/chuyển lớp/thôi học) — effort cao
   nhất, đụng tài chính (lãnh địa Admin), nên chia 2 giai đoạn.
2. **Phản ánh & Góp ý Giai đoạn 2/3** — mức khẩn cấp, cảnh báo quá hạn, định
   tuyến sang Admin/Teacher (cần trang mới bên các phân hệ đó trước).
3. **Báo cáo Tuyển sinh Giai đoạn 2** — trang tóm tắt bên `/admin/` đọc lại
   `getAdmissionsReportData()` để Admin xem được mà không cần đăng nhập Sale.
4. RLS thật theo từng role cho các bảng Sale — hoãn có chủ đích, giống hiện
   trạng 7 bảng lõi (AGENTS.md Mục 5.4).
5. **Ngân hàng câu hỏi Test đầu vào + Bảng quy đổi điểm** — hạ tầng đã xây
   xong hoàn chỉnh (UI quản trị, chấm điểm tự động), chỉ đang chờ dữ liệu
   thật (câu hỏi + ngưỡng điểm) từ chủ dự án — xem mục "Việc cần làm tiếp".
6. Gắn `getRecommendationForScore()` + `getTestAttemptsForLead()` vào UI xem
   chi tiết Lead (đã viết hàm, chưa có chỗ hiển thị) — làm sau khi có dữ liệu
   thật ở mục 5 để test được đầu-cuối.

---

## Đặc tả luồng nghiệp vụ Phễu Tuyển sinh (chốt với chủ dự án ngày 2026-09-14)

**Luồng tổng quát:**
```
Học sinh điền form đăng ký (hoặc Sale nhập tay hộ) → dữ liệu vào ĐẦU phễu
  → đi qua các giai đoạn chăm sóc trong phễu
  → cuối phễu, học sinh đồng ý chốt học
  → tùy lớp/hình thức học (theo buổi hay theo khóa) → tạo mã QR chuyển khoản
    (số tiền + nội dung chuyển khoản cá nhân hóa riêng cho từng hóa đơn)
  → khi khách chuyển khoản thành công → Sale xác nhận (thủ công hiện tại)
  → đẩy dữ liệu sang Admin & Teacher (nếu đã có lớp phù hợp)
  → đủ 3 điều kiện (chốt + thanh toán + xếp lớp) → tự động cấp tài khoản học sinh
```

### Quyết định kiến trúc quan trọng: TÁCH "xác nhận đã thanh toán" khỏi "xếp vào lớp cụ thể"

**Bước 1 — Ghi nhận thanh toán (LUÔN LUÔN làm ngay, bất kể đã có lớp hay chưa):**
1. Gọi `createStudent()` để tạo bản ghi học sinh thật.
2. Gọi `createInvoice()` để ghi nhận hóa đơn đã thanh toán.
3. KHÔNG tự viết luồng lưu trữ riêng — tái sử dụng đúng 2 hàm có sẵn.

**Bước 2 — Xếp vào lớp cụ thể (CHỈ làm khi đã có lớp phù hợp VÀ còn chỗ trống):**
- Có lớp đúng môn/khung giờ và còn chỗ → gọi ngay `enrollStudentInClass()`
  (`stage = 'enrolled'`).
- Chưa có lớp phù hợp hoặc đã đầy → `stage = 'waiting_class'` — KHÔNG tạo
  `enrollments`/`class_id` giả để "cho có". Khi có lớp mới/còn chỗ, quay lại
  xếp lớp qua trang "Học sinh chờ xếp lớp".

**Báo cáo cho Admin (đọc tổng hợp, KHÔNG thao tác trực tiếp dữ liệu Sale):**
về lý thuyết Admin tự query ra được từ `students`/`invoices`, nhưng **thực tế
chưa có trang nào bên Admin làm việc này** (xem Backlog mục 4).

### Xử lý "lớp chưa đủ sĩ số để khai giảng" — không cần đổi schema

`lib/utils/session-generator.ts` chỉ tự sinh buổi học khi lớp đã có
`start_date`. Admin có thể tạo lớp và cho ghi danh (đếm sĩ số) TRƯỚC khi đặt
ngày khai giảng; khi đủ sĩ số mới đặt `start_date`, Teacher mới thấy lớp
trong "Lịch dạy học".

### Tích hợp xác nhận thanh toán tự động qua ngân hàng — CHƯA giải quyết

Cần 1 dịch vụ trung gian đọc biến động số dư ngân hàng thật (Casso/SePay/
VietQR Pro webhook...), đòi hỏi chủ dự án tự đăng ký + lấy API key (thường có
phí) trước khi Claude viết code nối vào. Về bản chất giống Web-to-Lead
webhook đã gỡ bỏ, nhưng gắn tiền thật nên rủi ro cao hơn — cần chủ dự án chủ
động quyết định trước.

**Phần ĐÃ CÓ SẴN:** mỗi hóa đơn khi chốt đơn đã có mã VietQR cá nhân hóa
riêng (`generateVietQRUrl()`, memo `"HP {SĐT} {tên học sinh}"` + đúng số
tiền gói học).

**Bài học khi xây cơ chế xác nhận thanh toán:** 1 thao tác xác nhận có thể
bị gọi 2 lần cho cùng 1 giao dịch — BẮT BUỘC kiểm tra trạng thái CHƯA hoàn
tất trước khi xử lý, không giả định "gọi 1 lần duy nhất" (áp dụng cho cả
`markInvoiceAsPaid()` lẫn `completeLeadConversion()` — đã vá cả 2).

---

## [Lịch sử — đã xử lý xong] Audit tính năng Tuyển sinh mock cũ (`app/admin/admissions`)

> Mục đích ban đầu (giúp AI code Sale không cần dò lại code mock cũ) đã hoàn
> thành, hệ thống thật đã xây xong và thay thế toàn bộ. Chi tiết đầy đủ (12
> bug B1-B12, data flow qua 3 key localStorage...) xem lịch sử git của file
> này nếu thực sự cần tra cứu.

Toàn bộ `app/admin/admissions` (UI cũ) **100% dữ liệu giả, không đụng bảng DB
thật nào** — chỉ dùng tham khảo giao diện/luồng nghiệp vụ. Hiện đã mồ côi
route, file vẫn còn trong repo chờ chủ dự án quyết định xóa hay giữ.

**Ý tưởng đã giữ lại và xây thật:** mô hình phễu nhiều giai đoạn có progress
bar; tách `stage` khỏi `status`; nhật ký chăm sóc CRM; quy tắc "gọi nhỡ 3 lần
liên tiếp → tự no_demand"; "ca học thử cố định" lặp theo tuần + cơ chế mở
đợt; 1 lead đăng ký nhiều ca/nhiều môn; deep-link Zalo/Messenger; giao diện
chốt đơn kèm VietQR.

**Bài học lớn nhất (đã áp dụng xuyên suốt code Sale thật):** kiến trúc "nhiều
nguồn dữ liệu cho cùng 1 thứ" là nguyên nhân gốc của phần lớn bug — dùng
thẳng Server Action + DB thật làm nguồn dữ liệu duy nhất. Và: Server Action
trả về `{error}` chứ không throw — component gọi nó PHẢI kiểm tra
`result?.error` trước khi coi là thành công (đã ghi chính thức vào AGENTS.md
Mục 3).

---

## Nhật ký

(Ghi theo thứ tự thời gian, mới nhất lên trên. Mỗi lần kết thúc 1 phiên làm
việc với AI, tóm tắt ngắn gọn: đã làm gì, quyết định gì, còn treo gì cho lần sau.)

### 2026-09-16 (tiếp 6) — Sửa xung đột Git khi đẩy code lên feature/sale (đồng bộ với develop)

**Vấn đề:** `feature/sale` bị tạo/khôi phục lịch sử (xem "tiếp 5") từ điểm
`master` cũ (25cc718), trong khi `develop` đã có thêm rất nhiều commit từ
Admin và toàn bộ phân hệ Student (`feature/student` đã merge vào `develop`)
— khi đẩy code lên GitHub bị báo xung đột.

**Đã điều tra bằng merge thử trên nhánh tạm (`test-merge-preview`, không
đụng `feature/sale`/`develop` thật) trước khi sửa thật:**
- `types/database.ts` (file Sale có sửa hôm nay) **tự động hợp nhất sạch,
  không mất field nào của Sale** (`checkin_token`, `checked_in_at`,
  `facebook_url`, `EntranceTestQuestion`...).
- Xung đột thật chỉ xảy ra ở **7 file, TẤT CẢ đều không thuộc lãnh địa
  Sale**: `app/admin/classes/[id]/class-detail-client.tsx`,
  `app/admin/dashboard/dashboard-client.tsx`,
  `app/admin/teachers/teachers-client.tsx`,
  `components/analytics/ai-advisor-header.tsx`,
  `components/finance/customer-ledger-table.tsx`,
  `components/finance/transaction-logs-table.tsx`, `docs/context-admin.md`.

**Cách xử lý (đúng nguyên tắc "1 tính năng 1 chủ sở hữu"):** lấy nguyên bản
`develop` (Admin) cho cả 7 file trên — Sale không tự sửa nội dung code của
phân hệ khác dù đang trong lúc merge. `npx tsc --noEmit` sạch sau merge. Đã
push `feature/sale` lên GitHub (fast-forward, không force).

**Bài học cho lần sau:** trước khi merge/push nhánh `feature/sale`, nên
`git fetch origin` rồi thử merge trên 1 nhánh tạm trước để biết chính xác
file nào xung đột và file đó có thuộc lãnh địa Sale hay không, tránh tự ý
sửa nhầm code phân hệ khác trong lúc vội giải xung đột.

### 2026-09-16 (tiếp 5) — Sửa cấu trúc Git sai thư mục gốc + đẩy code lên GitHub lần đầu

**Vấn đề:** repo Git được khởi tạo nhầm ở thư mục cha (`Webdemo-sale-ui-updated\`)
thay vì thư mục dự án thật (`Webdemo\`), và chưa từng gắn remote GitHub —
không thể push. Đã sửa: khởi tạo lại đúng vị trí, commit trạng thái hiện tại,
`merge --allow-unrelated-histories` với lịch sử thật của `feature/sale`
(merge sạch, không xung đột), push thành công lần đầu lên `origin/feature/sale`.
Chi tiết đầy đủ đã trao đổi trực tiếp với chủ dự án trong phiên, không lặp
lại ở đây.

### 2026-09-16 (tiếp 4) — Thêm liên hệ Facebook + auto "Không có nhu cầu" khi bấm Gọi 3 lần (MIGRATION MỚI CHƯA CHẠY)

**Yêu cầu chủ dự án:** tối ưu khối liên hệ trong bảng Lead — thêm kênh
Facebook bên cạnh Gọi/Zalo, và bấm biểu tượng Gọi quá 3 lần thì tự động
chuyển Lead sang "Không có nhu cầu".

**Đã làm:**
1. Migration MỚI (CHƯA CHẠY): `supabase/migrations/20260916b_add_leads_facebook_url.sql`
   — thêm `leads.facebook_url` (không có cách suy ra link Facebook từ SĐT như
   Zalo `zalo.me/{phone}`, phải lưu link thật do Sale tự nhập).
2. `types/database.ts`, `lib/actions/admissions.ts` (`CreateLeadPayload`,
   `createLead`, `updateLead`): thêm field `facebookUrl`/`facebook_url`.
3. `create-lead-dialog.tsx`: thêm input nhập link Facebook khi tạo Lead mới.
4. `components/sale/quick-call-link.tsx` (MỚI) — 2 component dùng chung:
   - `QuickCallLink`: bấm "Gọi" gọi ngầm `logInteraction({channel:'call',
     isMissedCall:true})` ở nền (không chặn hành vi mở `tel:`) — **tái dùng
     đúng cơ chế đã có** (`missed_calls_count` + auto no_demand ở lần thứ 3),
     không xây bộ đếm song song. Nếu cuộc gọi thực ra thành công, Sale vẫn
     ghi nhật ký đầy đủ qua Drawer (isMissedCall=false) để reset bộ đếm về 0.
   - `QuickFacebookLink`: hiện link Facebook thật nếu đã có, hoặc nút "+
     Facebook" dùng `window.prompt()` để nhập nhanh (khớp mức độ đơn giản
     hiện có của codebase, ví dụ `alert()` cho lỗi ở `trials-tab.tsx`).
5. Gắn 2 component trên vào `leads-tab.tsx` (cột "Liên hệ & Zalo") và
   `lead-detail-drawer.tsx` (thanh hành động đầu Drawer).
6. `npx tsc --noEmit` sạch (exit 0).

**Lưu ý cho phiên sau:** mỗi lần bấm "Gọi" sẽ tự ghi 1 dòng vào
`lead_interactions` (nội dung tự sinh "Bấm gọi nhanh...") — đây là hành vi
CHỦ Ý theo đúng yêu cầu tái dùng cơ chế cũ, không phải bug; nếu sau này chủ
dự án thấy nhật ký bị "rác" vì việc này, cần bàn lại cách tách biệt 2 khái
niệm "số lần bấm nút Gọi" và "nhật ký chăm sóc thật". Migration
`20260916b_add_leads_facebook_url.sql` CHƯA CHẠY — nút Facebook sẽ lỗi cho
tới khi chủ dự án tự chạy trên Supabase.

### 2026-09-16 (tiếp 3) — Gộp phễu 4→3 giai đoạn hiển thị + QR check-in học thử + Test đầu vào (MIGRATION CHƯA CHẠY)

**Yêu cầu chủ dự án:** đổi phễu hiển thị từ 4 giai đoạn (N1-N4) còn 3 giai
đoạn (Khách hàng tiềm năng / Xếp lịch học thử / Ghi danh & chuyển đổi), cho
phép bỏ qua học thử để chốt đơn thẳng, thêm QR check-in điểm danh học thử,
và thêm test đầu vào nhiều câu hỏi + gợi ý khóa học theo điểm.

**Quyết định đã chốt với chủ dự án (qua AskUserQuestion) trước khi code:**
- Gộp 3 giai đoạn CHỈ ở lớp hiển thị UI (`lib/utils/admissions-funnel.ts`),
  **giữ nguyên 6 giá trị `LeadStage` thật trong DB** (raw/potential/trial/
  conversion/enrolled/waiting_class) — không migrate cột `stage`, rủi ro thấp
  nhất, giữ nguyên toàn bộ logic tự động đã chạy đúng (raw→potential khi liên
  hệ thật, 3 cuộc gọi nhỡ→no_demand, khóa N4).
- QR check-in gắn với CA HỌC THỬ (trial_slots), dán tại phòng, học sinh tự
  quét rồi nhập SĐT đã đăng ký để xác thực danh tính (không cần tài khoản).
- Test đầu vào: học sinh TỰ làm trên thiết bị riêng qua link/QR công khai
  (suy ra từ câu trả lời của chủ dự án), ngân hàng câu hỏi xây UI quản trị
  bắt đầu TRỐNG (chưa có câu hỏi thật — **đang chờ chủ dự án cung cấp câu hỏi
  thật để nhập**, đã hứa cung cấp nhưng chưa gửi trong phiên này).
- Bảng quy đổi điểm → gợi ý khóa học: xây UI cấu hình, bắt đầu TRỐNG (đúng
  AGENTS.md 11.1 — không tự bịa ngưỡng điểm).

**Đã code xong (chưa test với dữ liệu thật vì migration chưa chạy):**
1. `lib/utils/admissions-funnel.ts` (MỚI) — gộp hiển thị, `canStartConversion()`
   cho phép "Chốt đơn" ngay từ giai đoạn 1 (potential) để bỏ qua học thử.
2. Cập nhật hiển thị: `leads-tab.tsx`, `lead-detail-drawer.tsx`,
   `admissions-funnel-chart.tsx` (phễu 3 tầng thay 4 tầng),
   `admissions-kpi-bar.tsx`, `conversions-tab.tsx` (nhận thêm lead ở giai
   đoạn `potential` vào danh sách sẵn sàng chốt).
3. Migration MỚI (CHƯA CHẠY):
   `supabase/migrations/20260916_admissions_checkin_and_entrance_test.sql` —
   thêm `trial_slots.checkin_token`, `lead_trials.checked_in_at`, 3 bảng mới
   (`entrance_test_questions`, `lead_test_attempts`, `lead_test_answers`,
   `course_recommendation_rules`), và **3 hàm SECURITY DEFINER**
   (`checkin_trial_lead`, `get_trial_slot_public_info`, `get_entrance_test`,
   `submit_entrance_test`) để luồng công khai (chưa đăng nhập) không phải mở
   RLS SELECT rộng cho vai trò `anon` trên `leads`/`lead_trials` (chứa PII) —
   quyết định kiến trúc quan trọng, xem comment đầu file migration.
4. `types/database.ts` (file Nhóm 1 — đã thêm field mới, CHƯA báo cả nhóm vì
   phiên này làm trực tiếp theo yêu cầu chủ dự án): thêm `TrialSlot.checkin_token`
   (bắt buộc), `LeadTrial.checked_in_at` (optional), + 4 interface mới
   (`EntranceTestQuestion`, `LeadTestAttempt`, `LeadTestAnswer`,
   `CourseRecommendationRule`).
5. `lib/actions/trial-checkin.ts` (MỚI, public) + `lib/actions/entrance-test.ts`
   (MỚI — CRUD ngân hàng câu hỏi/ngưỡng điểm cho Sale/Admin, và 2 action công
   khai cho học sinh tự làm test).
6. Route công khai MỚI (KHÔNG bị `proxy.ts` chặn vì chỉ bảo vệ
   `/admin|/teacher|/sale|/student`): `app/checkin/[token]` (điểm danh),
   `app/test/[token]` (làm bài test).
7. UI Sale: tab thứ 5 "Test Đầu Vào" trong `admissions-client.tsx`
   (`components/sale/entrance-test-tab.tsx`), nút "Mã QR" trên thẻ ca học thử
   (`trial-slot-qr-dialog.tsx`), nút "Gửi test" trên từng học sinh học thử
   (`send-entrance-test-dialog.tsx`) ở `trials-tab.tsx`.
8. `npx tsc --noEmit` sạch (exit 0) sau khi xong toàn bộ.

**CÒN TREO cho phiên sau / chờ chủ dự án:**
- ⚠️ Chủ dự án PHẢI tự chạy migration
  `20260916_admissions_checkin_and_entrance_test.sql` trên Supabase trước khi
  QR check-in / test đầu vào hoạt động được (Claude không có quyền ghi DB).
- ⚠️ Ngân hàng câu hỏi test đầu vào đang RỖNG — chủ dự án đã đồng ý tự cung
  cấp câu hỏi thật nhưng chưa gửi trong phiên này.
- Chưa nối `getRecommendationForScore()` vào UI hiển thị gợi ý khóa học cụ
  thể cho Sale khi xem kết quả test của 1 Lead (hàm đã viết xong, chỉ chưa có
  chỗ gọi hiển thị) — làm khi có câu hỏi/ngưỡng điểm thật để test.
- Chưa có UI hiển thị danh sách `lead_test_attempts` (đã gửi test/đã nộp
  chưa) cho 1 Lead — `getTestAttemptsForLead()` đã viết, chưa gắn UI.

### 2026-09-16 (tiếp 2) — Xóa bỏ hoàn toàn tính năng Nhắc Lịch Tự Động theo yêu cầu

**Yêu cầu người dùng:** Xóa bỏ toàn bộ chức năng nhắc lịch tự động.

**Đã thực hiện:**
1. `app/sale/daily-tasks/daily-tasks-client.tsx`:
   - Xóa Card KPI thứ 5 ("Nhắc lịch hẹn"), chuyển lưới 4 thẻ KPI sang `grid-cols-2 lg:grid-cols-4 gap-4`.
   - Xóa toàn bộ Khối Section 4 (`#section-reminders`) và các prop/state liên quan.
2. `app/sale/daily-tasks/page.tsx`:
   - Xóa hàm gọi `getReminderQueue()` và prop `reminderQueue`.
   - Cập nhật subtitle tiêu đề trang, loại bỏ nhắc lịch tự động.
3. `components/sale/trials-tab.tsx`:
   - Xóa cột TableHead và TableCell "Nhắc lịch tự động", căn chỉnh lại độ rộng và `colSpan = 7`.
4. `components/sale/lead-detail-drawer.tsx`:
   - Xóa `callbackReminder` banner và nút gửi nhắc lịch Zalo.
5. `lib/actions/admissions.ts`:
   - Xóa `getReminderQueue()` và interface `ReminderQueueResult`.
6. **Xóa 5 file và thư mục mã nguồn liên quan đến reminder:**
   - `components/sale/reminder-queue-block.tsx`
   - `components/sale/reminder-center-panel.tsx`
   - `lib/actions/reminders.ts`
   - `lib/reminders/build-queue.ts` (và xóa folder rỗng `lib/reminders`)
   - `types/reminders.ts`
7. Đã kiểm tra `npx tsc --noEmit` hoàn tất không có bất kỳ lỗi nào (Exit code 0).

### 2026-09-16 (tiếp 1) — Tương tác hóa các ô Checklist công việc & Liên kết các màn hình Tuyển sinh

**Yêu cầu người dùng:** Các ô checklist công việc trên trang Lịch làm việc hôm nay cần có thể click vào để xem chi tiết / điều hướng nhanh chóng giữa các trang.

**Đã thực hiện:**
1. `app/sale/daily-tasks/daily-tasks-client.tsx`:
   - Thêm trạng thái hover/click, icon `ArrowRight`, hiệu ứng highlight nhấp nháy (`activeSection` + Ring gradient/pulse) khi click.
   - Thẻ 1 ("Hẹn gọi lại cần xử lý"): cuộn mượt xuống Section "Lịch Hẹn Gọi Lại Cần Xử Lý". Có thêm nút deep link sang Tuyển sinh tab Lead lọc trạng thái callback (`/sale/admissions?tab=leads&status=callback`).
   - Thẻ 2 ("Ca học thử / test năng lực"): cuộn mượt xuống Section "Ca Học Thử Hôm Nay", kèm nút deep link sang Tuyển sinh tab Học thử (`/sale/admissions?tab=trials`).
   - Thẻ 3 ("Lead mới tiếp nhận"): cuộn mượt xuống Section "Lead Mới Cần Xử Lý Nhanh", kèm nút deep link sang Tuyển sinh tab Lead lọc lead thô (`/sale/admissions?tab=leads&stage=raw`).
   - Thẻ 4 ("Học sinh chờ xếp lớp"): điều hướng trực tiếp sang trang Chờ xếp lớp (`/sale/admissions/waiting-list`).
2. `app/sale/admissions/page.tsx` & `admissions-client.tsx` & `leads-tab.tsx`:
   - Hỗ trợ URL `searchParams` (`tab`, `status`, `stage`, `leadId`) chuẩn Next.js 16 App Router (await `searchParams`), cho phép deep link chính xác tới tab con, tự động kích hoạt bộ lọc và tự động mở Drawer chi tiết Lead tương ứng.


### 2026-09-16 — Tích hợp Nhắc Lịch tự động vào "Lịch Làm Việc Hôm Nay"

**Vấn đề:** Sidebar có link `href: "/sale/reminders"` trỏ tới route chưa tồn tại → 404.

**Quyết định thiết kế:** tích hợp luôn vào `/sale/daily-tasks` thay vì tạo route riêng
(cùng trang, cùng ngữ cảnh công việc hằng ngày của Sale → UX hơn).

**Đã làm (chỉ file Sale, `tsc --noEmit` pass sạch):**
1. `components/layout/sale-sidebar.tsx`: xóa mục "Trung tâm Nhắc lịch" → `/sale/reminders` + import `BellRing` thừa.
2. `lib/actions/admissions.ts`: thêm `getReminderQueue()` + `ReminderQueueResult` vào cuối file — tái dùng `lead_interactions.callback_at` và `lead_trials.trial_date`, không cần bảng DB mới. Lọc: callback/trial trong vòng 48h, loại bỏ Lead đã N4.
3. `components/sale/reminder-queue-block.tsx` (file mới): UI phân nhóm overdue/today/upcoming, mỗi card có nút "Gửi Zalo"/"SMS", textarea chỉnh nội dung, optimistic "Đã gửi ✓". Tuân đúng pattern `result?.error` (AGENTS.md Mục 3).
4. `app/sale/daily-tasks/page.tsx`: thêm `getReminderQueue()` vào `Promise.all`.
5. `app/sale/daily-tasks/daily-tasks-client.tsx`: thêm prop `reminderQueue`, KPI card thứ 5 (đổi màu theo urgency), khối "NHẮC LỊCH TỰ ĐỘNG" ở cuối trang.

**Không đụng vào:** `app/admin/`, `app/teacher/`, `app/student/`, các action của role khác.

### 2026-09-15 (tiếp) — Vá lỗi Lead "Hẹn gọi lại" không xuất hiện ở Lịch làm việc hôm nay

**Nguyên nhân:** `getSaleDailyTasks()` (widget "Lịch hẹn gọi lại") chỉ đọc
`lead_interactions.callback_at IS NOT NULL` — không đọc `leads.status`. Nút
"Chuyển nhanh trạng thái > Hẹn gọi lại" chỉ đổi `status`, không tạo dòng
`lead_interactions` nào — 2 nơi dùng 2 nguồn dữ liệu khác nhau cho cùng 1
khái niệm.

**Đã vá (`updateLead()` trong `admissions.ts`):** khi chuyển `status` sang
`'callback'`, tự tạo 1 dòng `lead_interactions` với `callback_at = now()`
(nếu Lead chưa có lịch hẹn nào đang chờ xử lý, tránh trùng). Lead cũ đã bị
thiếu (VD "Nguyễn Thanh Tùng") tự khắc phục nếu bấm lại đúng nút 1 lần nữa —
không cần sửa DB tay.

### 2026-09-15 (tiếp) — Vá lỗi không tick chọn được ca học thử (double-toggle)

**Nguyên nhân:** `schedule-trial-dialog.tsx` có `<div onClick>` bao ngoài VÀ
`<Checkbox onCheckedChange>` bên trong CÙNG gọi 1 hàm toggle — bấm đúng ô
tick chạy cả 2 handler (bubble), bật rồi tắt ngay lập tức.

**Đã vá:** bỏ `onCheckedChange` khỏi `Checkbox`, thêm `pointer-events-none`
— chỉ còn `div` cha xử lý duy nhất. Đã rà 4 chỗ `Checkbox` khác trong Sale,
xác nhận không lặp lỗi này ở đâu khác.

### 2026-09-15 (tiếp) — Khóa trạng thái Lead đã Chính thức (N4)

**Nguyên nhân:** ở Lead đã N4, khối "Chuyển nhanh trạng thái" vẫn hiện đủ 3
nút và bấm lùi lại được các trạng thái chăm sóc trước đó.

**Đã vá 2 lớp:** (1) UI ẩn khối 3 nút khi N4, thay bằng thông báo cố định;
(2) Server (`updateLead()`) tự chặn — Lead đã N4 mà đổi status khác
`converted` sẽ bị từ chối, không dựa vào UI.

**Xác nhận thêm (hỏi lại lần 2 về N2→N3):** `schedule-trial-dialog.tsx` đã
xử lý đúng trường hợp chưa có ca học thử nào (thông báo rõ ràng) — không có
lỗ hổng nào khác; nguyên nhân N2 không sang được N3 chính là bug "kẹt ở N1"
ở mục ngay dưới đây.

### 2026-09-15 (tiếp) — Vá lỗi Lead kẹt vĩnh viễn ở "N1 Lead thô" dù đã đánh dấu "Đã liên hệ"

**Điều tra bằng dữ liệu thật (query Supabase, chỉ đọc):** 2 nguyên nhân cộng
hưởng — (1) migration split N1/N2 chưa chạy (nhiều Lead cũ còn `stage =
'inquiry'`); (2) **bug thật:** `lead-detail-drawer.tsx` có 2 cách đánh dấu
"đã liên hệ" — form đầy đủ (đã tự thăng N1→N2 qua `logInteraction()`) và nút
nhanh (`updateLead()`, KHÔNG hề thăng tầng). Lead "Trịnh Trần Phương Tuấn"
trong dữ liệu thật là bằng chứng: `status = contacted`, 0 tương tác, vẫn kẹt
`stage = 'raw'`.

**Đã vá:** `updateLead()` giờ cũng tự thăng N1→N2 khi chuyển status sang
`contacted`/`callback`, đồng bộ đúng hành vi với `logInteraction()`.

### 2026-09-15 (tiếp) — Hiển thị "Phụ trách" xuyên suốt phễu + Báo cáo doanh thu theo Nhân viên Sale

Cột `leads.assigned_sale_id` đã có sẵn từ trước (gán tự động = `user.id` lúc
tạo Lead) nhưng chưa từng hiển thị ở đâu. Xác nhận qua Supabase: có 2 nhân
viên Sale thật, báo cáo theo nhân viên có ý nghĩa thật.

**Quyết định quan trọng:** chỉ hiển thị thông tin phụ trách, KHÔNG giới hạn
quyền — mọi Sale/Admin vẫn xem/xử lý mọi Lead như cũ (ưu tiên tối ưu nguồn
lực hơn phân quyền cứng).

**Đã thêm:** cột/dòng "Phụ trách" ở `leads-tab`, `lead-detail-drawer`,
`trials-tab`, `conversions-tab`, danh sách chờ xếp lớp (+ bộ lọc theo nhân
viên ở `leads-tab`). `getAdmissionsReportData()` thêm `bySalesperson` (số
Lead, đã chốt, tỷ lệ, doanh thu mỗi nhân viên) hiển thị dạng bảng xếp hạng ở
`/sale/reports`.

### 2026-09-15 (tiếp) — Tự động cấp tài khoản đăng nhập khi đủ 3 điều kiện: chốt học + thanh toán + xếp lớp

Đây là việc AGENTS.md Mục 9 điểm 5 từng nói "cố ý chưa làm sẵn, để người code
Sale tự quyết" — nay đã quyết và triển khai. Chỉ gọi `createAccountByAdmin()`
đã có sẵn (không sửa `auth.ts`), không DB/migration mới.

**Trigger:** `completeLeadConversion()` (khi xếp lớp ngay) và
`assignWaitingStudentToClass()` (khi xếp lớp cho học sinh đang chờ) — đúng
lúc `stage` đạt `'enrolled'`. Cố tình KHÔNG kích hoạt ở `'waiting_class'`.

**Quyết định thiết kế:**
- Không tự bịa email — nếu Lead chưa có email thật, bỏ qua bước này (phần
  lớn Lead qua "Thêm nhanh Lead" không có email nên hiện ít khi tự chạy).
- Chống trùng: kiểm tra `students.auth_user_id IS NULL` trước khi tạo.
- Best-effort: lỗi ở bước này không làm hỏng việc chốt đơn/xếp lớp đã thành công.
- Mật khẩu ngẫu nhiên hiện ra ĐÚNG 1 LẦN ở màn hình xác nhận riêng (có nút
  sao chép) trước khi đóng dialog/tải lại trang — không lưu lại được sau đó.

**Lưu ý:** RLS thật theo từng role vẫn "bật nhưng rỗng ruột" (AGENTS.md Mục
5.4) — cấp tài khoản tự động cho khách hàng thật trước khi RLS xong có rủi
ro cao hơn tạo tay có kiểm soát; có thể tắt nhanh nếu chủ dự án muốn chờ.

### 2026-09-16 — Nâng cấp Checklist Lịch Làm Việc & Liên kết chéo giữa các trang Sale (Deep-linking)

- **Vấn đề:** 5 ô thẻ KPI ở đầu trang `/sale/daily-tasks` trước đây là thẻ tĩnh (`div`), không thể bấm vào để xem chi tiết. Các trang trong phân hệ Sale (`/sale/daily-tasks`, `/sale/admissions`, `/sale/admissions/waiting-list`) chưa có sự liên kết nhanh qua lại.
- **Giải pháp triển khai (100% thuộc Nhóm 3 - thư mục riêng của Sale, không đụng phân hệ khác):**
  1. `daily-tasks-client.tsx`: Chuyển đổi 5 ô KPI thành clickable button cards (hover scale, ring glow, cursor pointer, ARIA role).
     - Ô 1 (Hẹn gọi lại), Ô 2 (Ca học thử hôm nay), Ô 3 (Lead mới), Ô 5 (Nhắc lịch Zalo/SMS): Khi bấm sẽ `smooth-scroll` cuộn trang xuống đúng khối bên dưới, kèm hiệu ứng highlight chớp viền nổi bật (ring animation trong 2.5s).
     - Ô 4 (Học sinh chờ xếp lớp): Bấm sẽ điều hướng ngay sang trang `/sale/admissions/waiting-list`.
     - Bổ sung nút liên kết trực tiếp tại mỗi khối công việc ("Tất cả hẹn CRM", "Tất cả ca CRM", "Xem bảng CRM đầy đủ") để chuyển thẳng sang Phễu CRM tương ứng.
  2. `app/sale/admissions/page.tsx` & `admissions-client.tsx`: Nhận và giải mã URL Search Parameters (`tab`, `status`, `stage`, `leadId`). Tự động chọn đúng tab (Leads, Trials, Conversions, Slots) khi người dùng truy cập qua liên kết.
  3. `components/sale/leads-tab.tsx`: Nhận `initialStatusFilter`, `initialStageFilter`, `initialLeadId` để tự động kích hoạt bộ lọc trạng thái (VD: `status=new`, `status=callback`) hoặc mở trực tiếp `LeadDetailDrawer` nếu có `leadId` trong URL.
- **Kiểm tra:** `npx tsc --noEmit` exit code 0, không có lỗi TypeScript, không thay đổi Database/schema, không ảnh hưởng bất kỳ phân hệ nào khác.

### 2026-09-15 (tiếp) — Thử đồng bộ KPI bar với Biểu đồ phễu rồi hoàn tác

Phát hiện KPI bar (snapshot theo đúng stage hiện tại) và biểu đồ phễu (lũy
kế) dùng 2 công thức khác nhau cho cùng nhãn "N1/N2/N3" → nhìn như lệch số
liệu. Đã thử đổi KPI bar sang lũy kế cho khớp, nhưng **chủ dự án xác nhận đó
là hiểu nhầm, không phải lỗi, yêu cầu giữ nguyên bản gốc** → đã khôi phục
100% code cũ của `admissions-kpi-bar.tsx`. Kết luận chính thức: 2 công thức
khác nhau là ĐÚNG THIẾT KẾ, không sửa lại nữa nếu không có yêu cầu mới.

### 2026-09-15 (tiếp) — Lead N4 vẫn hiện ở "Lịch Học Thử" + lỗ hổng double-submit khi chốt đơn

**Nguyên nhân:** Lead chốt đơn thẳng từ `trial` (không qua bước chấm điểm)
khiến `lead_trials` liên quan kẹt vĩnh viễn ở `status = 'scheduled'`; 2 nơi
hiển thị chỉ lọc theo trạng thái đó, không đối chiếu lại `stage` Lead.

**🔴 Phát hiện nghiêm trọng hơn:** `trials-tab.tsx` hiện nút "Chốt học" cho
MỌI Lead từng có ca học thử, không kiểm tra `stage` — Lead đã N4 vẫn bấm
"Chốt học" được, và `completeLeadConversion()` (trước khi vá) không chặn gì
— có thể tạo THÊM 1 học sinh + hóa đơn trùng lặp.

**Đã vá:** (1) `completeLeadConversion()` chặn cứng ở server nếu Lead đã N4;
(2) `getSaleDailyTasks()` loại `lead_trials` của Lead đã N4 khỏi "cần chấm
điểm"; (3) `trials-tab.tsx` ẩn hẳn dòng Lead đã N4. Không cần dọn dữ liệu
`lead_trials` mồ côi trên Supabase — đã vô hại vì bị lọc ở mọi nơi hiển thị.

### 2026-09-15 (tiếp) — Thêm theo dõi Doanh thu vào Báo cáo Tuyển sinh

Đọc trực tiếp `invoices` (`status = 'paid'`), gắn ngược về Lead qua
`converted_student_id`, tính theo **ngày tạo Lead** (nhất quán với cách
"Tổng Lead"/"Theo nguồn" đã tính — tránh lặp lại lỗi "2 cách tính thời gian
khác nhau" như vụ Hà Ngọc Sơn). Thêm `totalRevenue`, `avgRevenuePerConverted`,
`revenue` trong `SourcePerformance`/`TrendPoint`; UI thêm thẻ tổng quan +
biểu đồ doanh thu **riêng trục** (VNĐ khác đơn vị số đếm) + cột doanh thu
trong bảng theo nguồn.

### 2026-09-15 (tiếp) — Xây "Báo cáo Tuyển sinh" Giai đoạn 1

Không cần bảng DB mới — tổng hợp từ `leads` đã có. Thêm
`getAdmissionsReportData(dateFrom, dateTo)`: tổng quan, hiệu suất theo
nguồn, xu hướng theo ngày/tháng (luôn sinh đủ period kể cả 0 Lead), tỷ lệ
chuyển đổi sau Học thử. Trang mới `/sale/reports` với bộ lọc khoảng thời
gian (7 ngày/30 ngày/3 tháng/6 tháng).

### 2026-09-15 (tiếp) — Tái cấu trúc Phễu thành đúng 4 tầng N1-N4

Theo yêu cầu chủ dự án dựa trên mô tả nghiệp vụ 4 tầng chuẩn CRM giáo dục.
Tách `LeadStage` cũ (`inquiry` gộp 2 khái niệm) thành `raw`(N1)/`potential`(N2),
giữ nguyên `trial`(N3)/`conversion`(bước phụ)/`enrolled`+`waiting_class`(N4).
`potential` tự thăng khi có tương tác thật từ `raw`; nút "Học thử" chỉ hiện
từ `potential` trở đi. Đã cập nhật đồng bộ toàn bộ nơi dùng `stage` (grep
xác nhận): `types/database.ts`, `admissions.ts` (create/quick/logInteraction,
`AdmissionsKpiStats` đổi `inquiryCount` → `rawCount`/`potentialCount`),
`leads-tab.tsx`, `lead-detail-drawer.tsx`, `admissions-kpi-bar.tsx`,
`admissions-funnel-chart.tsx`. Migration mới
`20260915_split_lead_stage_raw_potential.sql` để chuyển dữ liệu cũ — **CHƯA
CHẠY** (xác nhận lại 2026-09-15 muộn hơn: vẫn còn 3 Lead ở `inquiry`).

### 2026-09-15 (tiếp) — Vá lỗi nghiêm trọng: chọn nhầm lớp/môn khi Chốt đơn & Xếp lớp

**Nguyên nhân:** `conversion-checkout-modal.tsx` và `assign-class-dialog.tsx`
đều mặc định `classes[0].id` (lớp đầu tiên trong danh sách, ngẫu nhiên) khi
Lead chưa có `target_class_id` — nếu Sale không đổi dropdown, học sinh bị
gán nhầm lớp/môn khác hẳn (case thật: "Hà Ngọc Sơn" quan tâm Toán nhưng bị
gán Văn 7).

**Đã vá:** bỏ mặc định `classes[0]`, dropdown trống bắt buộc chọn thật; QR/số
tiền chỉ hiện sau khi đã chọn lớp; thêm hiển thị môn Lead từng quan tâm để
Sale đối chiếu trước khi chọn. Không cần sửa dữ liệu Hà Ngọc Sơn trên DB — chỉ
cần "Xếp vào lớp" lại đúng lớp Toán, hệ thống tự ghi đè. Đã rà soát rộng hơn,
xác nhận đây là 2 nơi DUY NHẤT có mẫu lỗi "mặc định phần tử đầu mảng" trong
toàn bộ `components/sale`.

### 2026-09-15 — Xây tính năng "Phản ánh & Góp ý" (Giai đoạn 1 — MVP)

Sale tự ghi nhận + tự đánh dấu xử lý, CHƯA có định tuyến/SLA tự động. Bảng
mới `feedback_tickets` (migration riêng, đã chạy xong); `lib/actions/feedback.ts`;
trang `/sale/feedback` + 2 dialog; khối "Lịch sử phản ánh/góp ý" trong
`lead-detail-drawer.tsx` (chỉ hiện khi Lead có `converted_student_id`). Kênh
phản ánh (`FeedbackChannel`) tách riêng khỏi `InteractionChannel` theo góp ý
thực tế của chủ dự án: `in_person`, `hotline`, `zalo`, `facebook`, `system`,
`email`.

### 2026-09-15 — Vá xung đột z-index: danh sách Select bị ẩn sau Dialog

**Nguyên nhân:** `DialogOverlay` ở `z-[60]`, `SelectContent` chỉ `z-50` —
Select trong Dialog bị lớp phủ tối đè lên, tồn tại thật trong DOM nhưng gần
như vô hình. **Đã vá** bằng cách ghi đè `className="z-[70]"` tại 8 vị trí
Sale dùng (không sửa `components/ui/*` dùng chung). Cũng bổ sung thiếu tùy
chọn "Nguồn khác" trong "Thêm nhanh Lead".

### 2026-09-15 — Vá lỗi "nguồn tiếp nhận" tự bịa mặc định

`create-lead-dialog.tsx`/`fast-lead-intake-modal.tsx` trước đây pre-select
sẵn `source` — Sale quên đổi là lưu sai nguồn thật, sai lệch số liệu "kênh
nào hiệu quả". Đã sửa: bỏ mặc định, bắt buộc chọn, validate cả UI lẫn Server
Action.

### 2026-09-15 — Gỡ bỏ hoàn toàn Web-to-Lead API + thiết kế lại biểu đồ phễu

Web-to-Lead API đã xây (2026-09-14), tích hợp UI + xác thực (sáng
2026-09-15), rồi **GỠ BỎ HOÀN TOÀN** (chiều 2026-09-15) theo yêu cầu chủ dự
án — không nắm rõ vận hành nên quyết định không dùng. Đã xác nhận grep toàn
repo trước khi xóa: không file nào phụ thuộc. **Kết quả ròng: tính năng này
KHÔNG tồn tại trong hệ thống.**

Thiết kế lại `admissions-funnel-chart.tsx` theo dạng phễu hình thang thu hẹp
dần (SVG), tham khảo giao diện CRM Kstudy chủ dự án gửi ảnh. Rà soát liên kết
chéo phân hệ: 4 bảng Sale (lúc đó) chỉ được đọc/ghi bởi `admissions.ts`,
điểm nối duy nhất sang Admin/Teacher/Student qua các hàm dùng chung.

### 2026-09-14 — Vá lỗ hổng sĩ số ca học thử + đính chính 1 nhận định sai của chính phiên trước

`registerLeadTrials()` trước đây không kiểm tra sĩ số ở server — đã thêm
kiểm tra thật + tự cập nhật `trial_slots.status = 'full'`. `recordTrialAssessment()`
khi hủy đăng ký, tự mở lại `status = 'active'` nếu còn chỗ.

**Đính chính:** nghi vấn "bậc Chờ chốt đơn đếm thiếu" ở phiên trước là SAI —
công thức lũy kế đã cộng gộp đúng. **Bài học:** trước khi báo 1 nghi vấn là
lỗ hổng, nên tự chạy thử công thức với số cụ thể.

### 2026-09-14 — Điều tra lỗi "tạo Lead báo lỗi liên tục" — nguyên nhân: migration DB chưa chạy

Migration `20260914_create_sale_admissions_schema.sql` viết vào repo nhưng
chưa chạy lên Supabase thật (xác nhận qua `list_tables`). Đã đưa SQL cho chủ
dự án tự chạy — ✅ xác nhận xong cùng phiên (verify lại qua `list_tables`).

### 2026-09-14 — Bổ sung Thêm nhanh Lead (FAB) & Lịch làm việc hôm nay (Daily Tasks)

`fast-lead-intake-modal.tsx` + `FastLeadIntakeFab`; trang
`app/sale/daily-tasks/` tự động tổng hợp hẹn gọi lại/ca học thử/Lead
mới/học sinh chờ xếp lớp. *(Web-to-Lead API cũng được nhắc ở phiên gốc này
nhưng đã bị gỡ bỏ hoàn toàn sau đó — xem mục 2026-09-15 phía trên.)*

### 2026-09-14 — Triển khai hoàn chỉnh Phân hệ Sale (DB, Server Actions, Phễu CRM 3 Tab, Chờ xếp lớp, Quản trị tài khoản)

Migration 4 bảng thật đầu tiên; `lib/actions/admissions.ts` hoàn chỉnh (CRUD
Lead, CRM, ca học thử, chốt đơn 2 bước); giao diện Sale đầy đủ; Admin Root
chuyển hướng khỏi admissions mock cũ.

### 2026-09-14 — Rà soát tính năng Tuyển sinh mock + vá 2 lỗi hạ tầng dùng chung trước bàn giao

Rà soát 16 file mock cũ (kết quả rút gọn ở mục "[Lịch sử]" phía trên). Vá 2
bug ở hạ tầng dùng chung Sale kế thừa: `createStudent()` (bịa số buổi + nuốt
lỗi ghi danh) và `submitLead()` (trùng tên bảng `leads`, đã đổi sang
`landing_page_leads`).
