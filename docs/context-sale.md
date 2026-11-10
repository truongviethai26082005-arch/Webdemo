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
> **File này đã được tổng hợp lại lần 6 ngày 2026-09-17** (lần 5 cũng ngày
> đó, lần 4 ngày 2026-09-16, lần 3 cũng ngày đó, lần 2 ngày 2026-09-15, lần 1
> cũng 2026-09-15 khi file dài 721 dòng) — mục "Trạng thái hiện tại" ngay
> dưới đây đủ để nắm toàn bộ tình hình mà không cần đọc hết "Nhật ký" chi
> tiết bên dưới. Chỉ đọc "Nhật ký" khi cần tra lại lý do/chi tiết kỹ thuật
> của 1 quyết định hoặc 1 lần vá lỗi cụ thể.
>
> **Bối cảnh quan trọng cần biết trước khi đọc file này:** ngày 2026-09-16 có
> **2 phiên Claude Code làm việc song song, độc lập** trên cùng 1 yêu cầu gốc
> (gộp phễu 3 giai đoạn + QR check-in + test đầu vào), dẫn tới 2 cách hiện
> thực khác nhau và xung đột Git khi gộp lại. Đã hỏi lại chủ dự án và xử lý
> xong (xem mục "Gộp merge conflict 2 phiên song song" trong Nhật ký) — bản
> hiện tại trong repo là kết quả ĐÃ GỘP của cả 2 phiên, ưu tiên kiến trúc của
> phiên xây đầy đủ hơn (test trực tuyến thật, liên hệ Facebook) + giữ lại các
> fix bug/quyết định UX của phiên còn lại khi có xung đột trực tiếp.

## Trạng thái hiện tại — Tổng hợp (cập nhật 2026-09-17, lần 6)

### Đã xây xong, đang hoạt động thật (đã kiểm chứng qua dữ liệu thật trên Supabase)

| Trang/Tính năng | Route | Ghi chú |
|---|---|---|
| Lịch làm việc hôm nay | `/sale/daily-tasks` | Bố cục mới (2026-09-17): **Lead mới → Hẹn gọi lại → Học thử**, xếp dọc tuần tự (trước là lưới 2 cột). Cả 3 khối liên hệ (Gọi/Zalo/**Facebook**) đầy đủ. (Khối "Nhắc Lịch Tự Động" đã bị XÓA HẲN theo yêu cầu chủ dự án 2026-09-16) |
| Phễu Tuyển sinh (CRM **5 tab**) | `/sale/admissions` | Thứ tự đúng quy trình: Leads → Ca Học thử → **Test Đầu Vào** → Ghi danh & VietQR → Slot Lớp Trống |
| Học sinh chờ xếp lớp | `/sale/admissions/waiting-list` | Đã đóng tiền, chưa có lớp phù hợp |
| **Học sinh Đã Chuyển đổi** | `/sale/students` (mới, 2026-09-19) | Tra cứu học sinh đã có sẵn, đăng ký thêm 1 lớp mới độc lập với Lead nào |
| Tài khoản Học sinh | `/sale/accounts` | Sale toàn quyền tạo/đặt lại mật khẩu học sinh |
| Phản ánh & Góp ý | `/sale/feedback` | DB đã chạy migration, hoạt động thật |
| Báo cáo Tuyển sinh | `/sale/reports` | Theo nguồn, thời gian, học thử, nhân viên Sale + doanh thu, **Thời gian phản hồi TB**, **Xuất báo cáo CSV** (2026-09-19). ("Lý do không chốt" đã xây rồi gỡ bỏ lại cùng ngày theo yêu cầu chủ dự án — xem Nhật ký) |
| Thêm nhanh Lead | Nút nổi (FAB), mọi trang Sale | `quickCreateLead()` |
| **Điểm danh học thử qua QR** | `/checkin/[token]` (công khai) | Học sinh tự quét QR dán tại phòng, nhập SĐT để điểm danh |
| **Test đầu vào tự làm** | `/test/[token]` (công khai) | Học sinh tự làm bài trắc nghiệm qua link/QR Sale gửi, tự chấm điểm |
| **Đồng bộ Lead từ Google Form** | `app/api/leads/webhook/route.ts` (công khai, có secret token) | Google Apps Script gắn vào Form thật gọi vào khi khách gửi form → tự tạo Lead N1. Đã deploy xong lên Vercel (`webdemo-sale.vercel.app`) + gắn trigger Apps Script — **CHƯA có xác nhận từ chủ dự án là đã test gửi form thật thành công**, xem Nhật ký 2026-09-22/23 |

**3 route công khai** (không bị `proxy.ts` chặn — middleware chỉ bảo vệ
`/admin`, `/teacher`, `/sale`, `/student`): `/checkin/[token]`, `/test/[token]`,
`/api/leads/webhook`.

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
- **MỚI (song song, không thuộc mô hình stage):** bấm "Gọi"/"Gọi ngay" ở bảng
  Lead/Drawer/Lịch làm việc hôm nay **luôn mở 1 hộp thoại xác nhận nhanh**
  ("Đã liên hệ được" / "Không nhấc máy" — `QuickCallConfirmDialog`) trước khi
  ghi nhận, KHÔNG tự tính là gọi nhỡ ngay khi bấm (quyết định chốt lại qua
  `AskUserQuestion` với chủ dự án — 1 phiên song song từng làm thẳng không
  hỏi lại, đã bị yêu cầu sửa về đúng có xác nhận). Chọn "Không nhấc máy" đủ 3
  lần liên tiếp → tự động chuyển `status` sang "Không có nhu cầu" — tái dùng
  đúng cơ chế `missed_calls_count`/`logInteraction()` đã có (không phải luồng
  `stage`, đây là `status` — 2 khái niệm vẫn tách biệt như thiết kế gốc). Lead
  gọi nhỡ 1-2/3 lần (chưa đủ để tự đóng) tự hiện nhắc nhở "Gọi nhỡ N/3" ở
  "Lịch gọi lại cho khách hàng" — tính TẠI THỜI ĐIỂM ĐỌC từ
  `missed_calls_count`, không phụ thuộc có dòng `lead_interactions` nào.

### Việc chủ dự án cần làm tiếp (ưu tiên từ trên xuống)

1. ✅ **Cả 3 migration hôm 15-16/9 đã được chủ dự án chạy xong** (xác nhận
   2026-09-17 — dữ liệu "inquiry" đã hết, 5 tab CRM hoạt động bình thường).
   **Còn treo 1 câu SQL sửa dữ liệu 1 lần** phát sinh từ tác dụng phụ của
   migration inquiry (xem chi tiết ở Nhật ký 2026-09-17): những Lead cũ đã
   liên hệ thành công thật nhưng bị hạ nhầm về `stage='raw'` cần nâng lại
   `'potential'`:
   ```sql
   UPDATE public.leads
   SET stage = 'potential', updated_at = now()
   WHERE stage = 'raw' AND status IN ('contacted', 'converted');
   ```
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
10. ✅ **Merge Git đã hoàn tất** — đợt gộp 2 phiên song song đã được commit
    và merge thành công qua **Pull Request #5 trên GitHub**
    (`Đồng bộ quy trình trong phễu tuyển sinh`), xác nhận 2026-09-17.
11. **Xác nhận webhook Google Form đã hoạt động đúng thật chưa** (xem Nhật ký
    2026-09-22) — cần tự điền 1 form thật, kiểm tra Lead có xuất hiện đúng ở
    `/sale/admissions`/`/sale/daily-tasks` không, báo lại kết quả.
12. Cho biết **`full_name` thật trong `profiles`** của Sale có biệt danh
    "mck" (dropdown "Người phụ trách" trên Google Form) để điền vào
    `SALE_NAME_ALIASES` (`lib/actions/admissions.ts`) — hiện chưa khớp được
    tên này, Lead từ form sẽ tạm để trống người phụ trách + ghi chú lại tên
    gốc.

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
- **MỚI (2026-09-17) — Lead đã "Không có nhu cầu" bị khóa giống hệt N3:**
  không đổi được `status` qua 3 nút "Chuyển nhanh trạng thái" nữa (server
  `updateLead()` chặn cứng), và không hiện icon tiến giai đoạn (Học
  thử/Chốt đơn/Chốt học) ở `leads-tab.tsx`/`lead-detail-drawer.tsx`/
  `trials-tab.tsx` — 1 Lead đã chết không nên còn hành động tiến phễu đang
  hoạt động. Cách DUY NHẤT hợp lệ để "mở lại" 1 Lead `no_demand` là ghi 1
  tương tác thật qua `logInteraction()` (form "Ghi nhận nhật ký trao đổi"),
  hàm này không bị khóa vì nó luôn tự suy ra đúng trạng thái theo kết quả
  liên hệ thật, không phải đường tắt thủ công.
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

**3 route công khai (xem bảng tính năng ở trên) đều KHÔNG bị `proxy.ts`
chặn** (middleware chỉ bảo vệ `/admin`, `/teacher`, `/sale`, `/student` — đã
xác nhận đọc code) nên không cần sửa file dùng chung Nhóm 1 này.

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

### 2026-09-23 — Sửa lỗi thật ở Phễu Tuyển sinh + thêm chức năng "Xóa Lead"

**Bug thật do chủ dự án phát hiện:** ô "2. Xếp lịch học thử" trong Phễu
Tuyển sinh (`/sale/admissions`, `/sale/reports`) đếm nhầm cả Lead **bỏ qua
học thử, chốt đơn thẳng từ Giai đoạn 1** — công thức cũ cộng dồn
`trialCount + conversionCount + enrolledCount + waitingClassCount`, ngầm giả
định mọi Lead ở 3 stage sau `trial` đều từng phải qua học thử, nhưng
`canStartConversion()` cho phép chốt thẳng từ `potential`, nên giả định đó
sai. Tương tự ở thẻ "Chuyển đổi sau Học thử" (`/sale/reports`, dùng
`isTrialOrBeyondStage()`).

**Đã sửa (2 lần — lần 1 tự gây lỗi mới, lần 2 mới đúng):**
- Lần 1: định dùng cột `trial_date` để biết Lead nào ĐÃ TỪNG học thử thật
  (không phụ thuộc stage hiện tại) — nhưng nhầm lẫn `trial_date` là cột của
  bảng `lead_trials` (types/database.ts, interface `LeadTrial`) chứ KHÔNG
  phải cột của `leads`, gây lỗi runtime thật `"column leads.trial_date does
  not exist"`.
- Lần 2 (đúng): sửa lại query riêng bảng `lead_trials` lấy tập `lead_id` đã
  từng có ít nhất 1 lượt đăng ký ca học thử, đối chiếu với danh sách Lead —
  không cần migration gì thêm vì `lead_trials` vốn đã có sẵn.
- Thêm field mới `everTrialCount` vào `AdmissionsKpiStats`
  (`getAdmissionsKpiStats()`), dùng thay cho công thức cộng dồn cũ ở
  `admissions-funnel-chart.tsx`. Sửa tương tự `reachedTrialLeads` ở
  `getAdmissionsReportData()`, xóa hàm `isTrialOrBeyondStage()` không còn
  dùng tới.

**Thêm chức năng "Xóa Lead"** (`lib/actions/admissions.ts` đã có sẵn hàm
`deleteLead()` từ trước nhưng CHƯA từng gắn UI nào) — gắn nút "Xóa Lead này"
(màu đỏ hồng, tách khu "Vùng nguy hiểm" cuối cùng) vào `lead-detail-drawer.tsx`,
dùng để chủ dự án tự dọn Lead test/ảo. Có hộp xác nhận trước khi xóa; xóa Lead
tự cascade xóa theo lịch sử tương tác (`lead_interactions`) + đăng ký học thử
(`lead_trials`) — đã xác nhận qua `ON DELETE CASCADE` trong migration gốc.
**CỐ Ý KHÔNG xóa theo** học sinh (`students`)/hóa đơn (`invoices`) dù Lead đã
"Đã chuyển đổi" (`converted_student_id`) — 2 bảng đó dùng chung với
Admin/Teacher, hộp xác nhận có cảnh báo riêng cho trường hợp này. Chủ dự án
đã chốt rõ (qua `AskUserQuestion`): chỉ cần xóa Lead, không cần dọn cả
học sinh/hóa đơn liên quan.

Cả 2 việc trên 100% trong phân hệ Sale (`lib/actions/admissions.ts`,
`components/sale/admissions-funnel-chart.tsx`,
`components/sale/lead-detail-drawer.tsx`). `npx tsc --noEmit` sạch.

### 2026-09-22/23 — Thiết kế lại bộ lọc Leads + nút nhanh "Không nhu cầu" + tự ghi nhận liên hệ

**1. Đổi tên cột + tự động ghi nhận "Đã liên hệ" khi bấm Zalo/Facebook**
(`leads-tab.tsx`, `quick-call-link.tsx`): cột "Liên hệ & Zalo" đổi thành
"Liên hệ". Bấm link Zalo hoặc Facebook khi Lead đang `status` "Mới nhận" HOẶC
"Hẹn gọi lại" tự động gọi `updateLead(..., {status:"contacted"})` (không chặn
việc mở link, chạy song song) — không đụng tới "Không có nhu cầu"/"Đã chốt
học" (giữ đúng khóa trạng thái đã có). Thêm prop `onLinkClick` (tùy chọn) cho
`QuickFacebookLink` để chỉ bật hành vi này ở `leads-tab.tsx`, không ảnh hưởng
chỗ khác đang dùng chung component (`daily-tasks-client.tsx`).

**2. Thiết kế lại bộ lọc "Giai đoạn"/"Trạng thái"** (`leads-tab.tsx`,
`lib/utils/admissions-funnel.ts` — thêm `GROUP_DETAIL_FILTER_OPTIONS`):
"Giai đoạn" giờ chỉ còn 3 lựa chọn (đúng 3 giai đoạn lớn của Phễu, không còn
liệt kê riêng 6 `stage` chi tiết); "Trạng thái" tự đổi lựa chọn theo Giai
đoạn đang chọn — Giai đoạn 1 lọc theo cột `status` (Mới nhận/Đã liên hệ/Hẹn
gọi lại/Không nhu cầu, đúng yêu cầu ban đầu), Giai đoạn 2 chỉ 1 lựa chọn
"Đang học thử" (lọc theo `stage`, vì group 2 vốn chỉ có 1 giá trị stage khả
dĩ), Giai đoạn 3 chỉ 1 lựa chọn "Đã chốt học" (lọc theo `status ===
"converted"`, gộp chung cả `enrolled`/`waiting_class` — chủ dự án tự chốt lại
sau khi tôi đề xuất ban đầu tách 2 lựa chọn theo `stage`, đơn giản hóa còn 1).
Tự reset về "Tất cả trạng thái" nếu đổi Giai đoạn mà lựa chọn cũ không còn
hợp lệ, tránh tổ hợp lọc ra danh sách rỗng khó hiểu. `statusFilter` giờ chứa
lẫn giá trị `LeadStatus`/`LeadStage` (2 tập giá trị không trùng chữ nhau nên
so khớp cả 2 cột là an toàn).

**3. Thêm nút nhanh "Không nhu cầu"** ở cột Thao tác bảng Leads
(`leads-tab.tsx`), cạnh "Học thử"/"Chốt đơn" — viền đỏ hồng, icon `Ban`, chỉ
hiện ở Giai đoạn 1 & 2 (ẩn ở Giai đoạn 3 vì đã chốt học). Có hộp xác nhận
trước khi đổi (thao tác khóa trạng thái, khó hoàn tác).

100% trong phân hệ Sale. `npx tsc --noEmit` sạch sau mỗi bước.

### 2026-09-22 — Google Form → Webhook đồng bộ Lead tự động (đã deploy, CHƯA xác nhận test thật)

**Yêu cầu chủ dự án:** khách nhắn tin qua FB/Zalo muốn tìm hiểu sâu hơn, Sale
gửi Google Form cho họ điền — cần tự động đồng bộ kết quả vào Phễu Tuyển
sinh, không cần Sale nhập tay lại.

**Đã xây (đúng tiền lệ Web-to-Lead API cũ đã bị gỡ trước đây — có cân nhắc kỹ
và xác nhận lại với chủ dự án trước khi hồi sinh kiến trúc này):**
1. `lib/actions/admissions.ts` — hàm mới `createLeadFromWebhook()`: nhận
   payload từ webhook, validate họ tên/SĐT/nguồn, chống trùng theo SĐT
   (idempotent — form gửi lặp không tạo Lead đôi), tạo Lead N1
   (`stage:"raw", status:"new"`), **CỐ Ý không gọi `requireRole()`** (nguồn
   gọi là Google Apps Script, không có phiên đăng nhập nào) — bảo mật hoàn
   toàn nằm ở tầng route (kiểm tra secret token) trước khi giao việc xuống
   hàm này. Dùng `createAdminClient()` (service role) đúng tiền lệ
   `/checkin`, `/test`.
2. `app/api/leads/webhook/route.ts` (route API — bắt buộc ở đây vì Google
   Apps Script chỉ gọi được HTTP thường, không gọi được Server Action nội bộ
   Next.js): xác thực header `Authorization: Bearer <LEADS_WEBHOOK_SECRET>`
   (biến môi trường mới, fail-closed nếu thiếu cấu hình) rồi chuyển tiếp.
3. **"Người phụ trách"** — form có thêm 1 dropdown chọn tên Sale phụ trách
   (nhãn ngắn: "mck"/"Tuyết Mai"/"Thùy Linh", không hẳn khớp `full_name`
   thật trong `profiles`) — thêm `assignedSaleName` vào payload,
   `resolveAssignedSaleId()` so khớp (không phân biệt hoa/thường, đã trim)
   với `profiles.full_name` (role sale), có bảng `SALE_NAME_ALIASES` để map
   nhãn/biệt danh khác `full_name` thật (hiện còn để trống chờ chủ dự án xác
   nhận "mck" là ai). **Không khớp được thì để trống người phụ trách + ghi
   rõ tên gốc vào `note`** (không tự bịa gán nhầm người — AGENTS.md 11.1),
   để Sale tự gán tay qua khối "Khách Hàng Mới Tiếp Nhận".
4. **"Nguồn tiếp nhận"** — xử lý hoàn toàn ở Apps Script (`SOURCE_MAP`, map
   nhãn tiếng Việt trên form sang đúng `LeadSource` enum), không cần đổi code
   web vì `createLeadFromWebhook()` đã validate `source` tổng quát sẵn.

**Đã hướng dẫn chủ dự án tự triển khai (không code trực tiếp DB/`.env.local`,
tự làm theo đúng quy trình dự án):**
- Thêm biến `LEADS_WEBHOOK_SECRET` vào `.env.local` (local) + Environment
  Variables trên Vercel (production, đánh dấu đúng Type "Secret").
- Deploy web lên Vercel (`vercel` CLI, không qua Git/GitHub — tránh ảnh hưởng
  nhánh chung của team) → domain chính thức `webdemo-sale.vercel.app`. Gặp và
  xử lý xong: lỗi `spawn EPERM` (tắt bằng `vercel telemetry disable`), lỗi
  form nhập biến môi trường sai chỗ trên Vercel Dashboard.
- Viết + gắn Google Apps Script (`onFormSubmit` trigger, "Từ biểu mẫu - Đang
  gửi biểu mẫu") vào chính Google Form, map đúng tiêu đề 9 câu hỏi thật
  (lấy qua đọc trực tiếp form thật, không suy đoán) sang `WebhookLeadPayload`.

**Còn treo cho lần sau:** (a) chưa có xác nhận chủ dự án đã điền form thật và
thấy Lead xuất hiện đúng ở `/sale/admissions`/`/sale/daily-tasks` — cần verify
lại khi quay lại tính năng này; (b) `SALE_NAME_ALIASES["mck"]` còn để trống,
cần chủ dự án cho biết `full_name` thật trong `profiles` của "mck"; (c) domain
Vercel hiện tại (`webdemo-sale.vercel.app`) là bản deploy riêng KHÔNG qua Git
— sẽ không tự cập nhật khi code Sale thay đổi tiếp, cần `vercel --prod` thủ
công lại mỗi lần muốn đồng bộ code mới lên bản deploy này (chủ dự án đã được
báo rõ, cố ý chọn cách này để tránh đụng nhánh Git chung của team).

### 2026-09-19 — Báo cáo Tuyển sinh: thêm "Thời gian phản hồi TB"; xây rồi GỠ BỎ lại "Lý do không chốt" theo yêu cầu chủ dự án (mở rộng dần, không dựng lại 5-tab)

Yêu cầu gốc là 1 bản đặc tả dashboard kinh doanh 5-tab rất chi tiết (nhiều cơ
sở, chi phí marketing, doanh thu kế hoạch...) dùng để tham khảo ý tưởng, đã
thống nhất với chủ dự án trước khi code: **KHÔNG dựng dashboard demo với mock
data 12 tháng** (trái AGENTS.md Mục 11.1 — dự án này chạy Supabase thật), mà
mở rộng dần trang `/sale/reports` thật đang chạy. 4 quyết định phạm vi đã
chốt ban đầu: (1) trung tâm chỉ 1 cơ sở → bỏ hẳn chiều "theo cơ sở"; (2) chưa
track chi phí marketing → bỏ qua CPL/CAC; (3) có thêm cột `lost_reason` cho
Lead; (4) mở rộng dần trang hiện có, không viết dashboard 5-tab riêng.

Đã cài đặt xong "Lý do không chốt" (cột DB mới `leads.lost_reason`, picker
trong `lead-detail-drawer.tsx`/`callback-resolution-dialog.tsx`, biểu đồ
`byLostReason` trong `getAdmissionsReportData()`), nhưng **ngay sau đó chủ dự
án quyết định bỏ tính năng này** — đã revert đầy đủ, không còn dấu vết trong
code:
- Xóa hẳn `supabase/migrations/20260919_add_leads_lost_reason.sql` (migration
  này CHƯA từng chạy trên Supabase — an toàn 100%, không có dữ liệu thật nào
  từng ghi vào cột `lost_reason`).
- `types/database.ts`: đã revert về nguyên trạng ban đầu (bỏ type
  `LeadLostReason` và field `Lead.lost_reason`) — xác nhận qua `git diff`
  không còn khác biệt gì so với bản gốc.
- `lib/actions/admissions.ts`: bỏ tham số `lostReason` khỏi `updateLead()` và
  `completeCallbackTask()`, bỏ auto-gán `lost_reason` trong `logInteraction()`,
  bỏ `LostReasonBreakdown`/`byLostReason`/`LOST_REASON_LABELS` khỏi
  `getAdmissionsReportData()`.
- `components/sale/lead-detail-drawer.tsx` và
  `components/sale/callback-resolution-dialog.tsx`: bỏ picker chọn lý do, về
  lại hành vi gốc (đóng Lead "Không có nhu cầu" không cần chọn lý do).
- `app/sale/reports/reports-client.tsx`: bỏ khối bar chart "Lý do không chốt".

**Phần DUY NHẤT giữ lại** (không liên quan tới `lost_reason`, suy ra được
ngay từ dữ liệu sẵn có, không cần cột DB mới): `avgFirstResponseHours` trong
`getAdmissionsReportData()` — số giờ trung bình từ lúc tạo Lead tới lần tương
tác đầu tiên trong `lead_interactions` (`null` nếu chưa Lead nào trong
khoảng được liên hệ, không tính là 0 giờ) — hiển thị ở thẻ "Thời gian phản
hồi trung bình" trong `reports-client.tsx`.

Toàn bộ thay đổi (cả lúc xây và lúc gỡ) 100% nằm trong lãnh địa Sale (bảng
`leads`, `lib/actions/admissions.ts`, `components/sale/*`,
`app/sale/reports/*`) — không đụng file Nhóm 1/2 dùng chung nào khác sau khi
gỡ. `npx tsc --noEmit`: sạch, exit code 0 (đã chạy lại sau khi gỡ để xác
nhận không sót tham chiếu nào tới `lost_reason`/`LeadLostReason`).

**Còn treo cho lần sau (nếu chủ dự án muốn mở rộng tiếp theo đúng hướng đã
bàn — KHÔNG phải việc bắt buộc, chỉ ghi lại để không quên):** doanh thu theo
lớp/khóa, tỷ lệ lấp đầy lớp theo `classes.max_students` (dữ liệu đã đủ, chưa
làm UI), công nợ theo tuổi nợ 0-30/31-60/>60 ngày từ `invoices.status=
'pending'` (dữ liệu đã đủ, chưa làm), tab "Hành động" (Vấn đề/Đề xuất/Người
phụ trách) — cái này cần 1 bảng DB mới vì là dữ liệu người dùng tự nhập, chưa
làm vì chưa được yêu cầu cụ thể.

### 2026-09-19 (tiếp) — Thêm chức năng "Xuất báo cáo" (CSV) ở trang Báo cáo Tuyển sinh

Thêm nút "Xuất báo cáo (CSV)" vào thanh bộ lọc của `/sale/reports`
(`app/sale/reports/reports-client.tsx`), tái sử dụng đúng pattern CSV đã có
sẵn trong dự án (`components/finance/transaction-logs-table.tsx` — nút "Xuất
Excel"): dựng chuỗi CSV có BOM UTF-8 (`﻿`, để Excel tiếng Việt không lỗi
font khi mở), gói vào `Blob`, tải xuống qua thẻ `<a download>` tạo tạm thời —
không thêm thư viện mới, không gọi Server Action (toàn bộ dữ liệu đã có sẵn ở
client trong state `data`).

File CSV xuất ra gồm nhiều khối nối tiếp nhau (CSV không hỗ trợ nhiều "sheet"
như Excel thật): Tổng quan (7 chỉ số KPI đang hiển thị, kể cả "Thời gian phản
hồi TB" — in "Chưa có dữ liệu" nếu `null`, không bịa số), Hiệu suất theo
nguồn Lead, Hiệu suất & doanh thu theo Nhân viên Sale, Xu hướng theo
ngày/tháng — đúng khớp với dữ liệu đang hiển thị trên màn hình tại thời điểm
bấm xuất (tôn trọng bộ lọc khoảng thời gian đang chọn, không xuất toàn bộ dữ
liệu không lọc). Tên file: `Bao_Cao_Tuyen_Sinh_{dateFrom}_{dateTo}.csv`.

Chỉ sửa 1 file (`app/sale/reports/reports-client.tsx`), 100% trong lãnh địa
Sale, không đụng `lib/actions/admissions.ts` hay bất kỳ file dùng chung nào.
`npx tsc --noEmit`: sạch, exit code 0.

### 2026-09-19 (tiếp) — Tính năng mới: "Xếp nhiều lớp cho học sinh đã chuyển đổi" (`/sale/students`)

Trước khi code đã trình bày phương án và hỏi lại chủ dự án 3 điểm, chốt như
sau: (1) kịch bản đúng là **(B)** — học sinh đã tồn tại/đã có ≥1 lớp từ
trước, sau đó đăng ký thêm 1 lớp khác, độc lập với Lead nào (không phải chọn
nhiều lớp ngay lúc chốt Lead lần đầu); (2) màn hình mới đặt ở **route riêng**
`/sale/students`, không nhét vào `admissions-client.tsx` (file đó đã khá
lớn); (3) sửa luôn 1 lỗi phát hiện độc lập trong lúc khảo sát.

**Phát hiện quan trọng trước khi code:** bảng `enrollments` vốn đã là quan hệ
nhiều-nhiều (`student_id`, `class_id`) — 1 học sinh vốn dĩ đã có thể có nhiều
lớp ở tầng dữ liệu, **không cần đổi schema** cho tính năng này.
`enrollStudentInClass()` (`lib/actions/students.ts`) và `createInvoice()`
(`lib/actions/invoices.ts`) đã có sẵn, đã phân quyền `admin`+`sale` — tái
dùng đúng 2 hàm này (AGENTS.md Mục 11.7), không viết luồng ghi danh/thanh
toán song song riêng.

**Lỗi có sẵn đã sửa (phát hiện độc lập, không liên quan yêu cầu gốc, nhưng
ảnh hưởng trực tiếp cách ghép 2 hàm trên):** `completeLeadConversion()` —
khi chốt Lead lần đầu VÀ xếp lớp ngay (`enrollImmediately=true`),
`createStudent()` được gọi với `initial_sessions = số buổi mua` (tạo
enrollment với `balance_sessions = 12` ví dụ), sau đó `createInvoice()` LẠI
cộng thêm `sessions_added = 12` vào đúng enrollment đó → học sinh nhận **24
buổi thay vì 12** dù chỉ trả tiền 12 buổi. Đã sửa: `initial_sessions` truyền
vào `createStudent()` đổi thành `"0"`, để `createInvoice()` là nơi DUY NHẤT
cộng buổi thật (đúng 1 lần). Chỉ ảnh hưởng các học sinh MỚI chuyển đổi lần
đầu có chọn "Ghi danh vào lớp ngay" — học sinh đưa vào "Danh sách chờ xếp
lớp" không bị ảnh hưởng (luồng đó vốn đã đúng, không tạo enrollment tại bước
này).

**Đã xây (tất cả 100% trong lãnh địa Sale, không đụng file Nhóm 1/2 dùng
chung nào):**
1. `lib/actions/admissions.ts` — thêm `enrollStudentInAdditionalClass()`:
   validate đầu vào, **chặn cứng đăng ký trùng lớp đã có** (quan trọng: nếu
   không chặn, `enrollStudentInClass()` dùng upsert sẽ GHI ĐÈ
   `balance_sessions` hiện có về 0, xóa mất buổi còn lại thật của học sinh —
   không chỉ là trùng lặp vô hại), gọi `enrollStudentInClass(studentId,
   classId, 0)` rồi `createInvoice(..., is_paid=true)` để cộng buổi đúng 1
   lần, tự hoàn tác (xóa) enrollment vừa tạo nếu tạo hóa đơn thất bại (không
   để lại "lớp ma" chưa từng thanh toán).
2. `app/sale/students/page.tsx` (mới) + `app/sale/students/students-client.tsx`
   (mới) — danh sách học sinh (tái dùng `getStudents()` đã có sẵn, phân
   quyền `admin`+`sale` từ trước, chỉ IMPORT không sửa file `students.ts`),
   tìm kiếm theo tên/SĐT/phụ huynh, hiện badge các lớp đang học kèm số buổi
   còn lại, nút "Thêm lớp mới" mở dialog.
3. `components/sale/add-class-to-student-dialog.tsx` (mới) — dialog chọn lớp
   (chỉ hiện lớp học sinh CHƯA có) + gói số buổi + mã VietQR động, cùng UX
   với `conversion-checkout-modal.tsx` đã có (nhất quán trải nghiệm thu học
   phí toàn phân hệ) nhưng bỏ phần gợi ý theo kết quả học thử (không áp dụng
   — `Student` không có `trial_result`, trường đó chỉ có ở `Lead`) và bỏ toggle
   "chờ xếp lớp" (tính năng này luôn ghi danh ngay, không có khái niệm
   "chờ" cho lớp thứ 2 trở đi).
4. `components/layout/sale-sidebar.tsx` — thêm mục nav "Học sinh Đã Chuyển
   đổi" trỏ `/sale/students`.

`proxy.ts` (Nhóm 1) không cần sửa — middleware chặn theo tiền tố `/sale`
chung, không liệt kê route con, `/sale/students` tự động được bảo vệ.
`npx tsc --noEmit`: sạch, exit code 0.

**Còn treo/chưa làm (nói rõ để không quên):** chưa có bước xác nhận "học
sinh này có đúng là người đang tìm không" ngoài tìm theo tên/SĐT (không có
trùng tên thì không vấn đề gì, nhưng nếu 2 học sinh trùng tên+SĐT thật thì
UI hiện tại không phân biệt được — trường hợp hiếm, chưa xử lý). Chưa hỗ trợ
"thanh toán trước, xếp lớp sau" cho lớp thứ 2 trở đi (khác với lớp đầu tiên
có "Danh sách chờ xếp lớp") — nếu sau này cần, phải bàn thêm vì sẽ phải mở
rộng khái niệm "waiting_class" vốn đang gắn chặt với `Lead`, không gắn với
`Student` trực tiếp.

### 2026-09-18 — Thêm popover "xem nhanh" khi bấm vào từng thẻ KPI ở Phễu Tuyển sinh

**Yêu cầu chủ dự án:** không xem được nhanh học sinh nào đã chốt/thanh toán
mà không cuộn xuống dùng bộ lọc — muốn bấm vào từng thẻ KPI (Tổng Lead, N1,
N2, Chờ chốt đơn, Đã chuyển đổi) để hiện ngay danh sách tên + môn học +
(riêng "Đã chuyển đổi") học phí đã nộp.

**Đã làm:**
1. `lib/actions/admissions.ts` — thêm `getLeadPaymentsMap()`: trả về map
   `leadId -> tổng học phí đã nộp` (cộng dồn mọi hóa đơn `paid`, tái dùng
   đúng cách join `invoices` đã có ở `getWaitingListStudents()`/báo cáo,
   không viết luồng đọc `invoices` mới).
2. `admissions-kpi-bar.tsx` — viết lại thành component tương tác: mỗi thẻ
   (trừ "Tỷ lệ chuyển đổi" — là 1 tỷ lệ tính toán, không đại diện 1 nhóm Lead
   cụ thể nên không có gì để xem nhanh) giờ là 1 `Popover` (shadcn/Radix có
   sẵn, không phải component tự viết) — bấm vào hiện ngay danh sách Lead
   khớp đúng công thức của thẻ đó (tối đa 8 dòng + ghi chú "+N khác"), có
   tên, môn quan tâm, SĐT, và học phí đã nộp (chỉ ở thẻ "Đã chuyển đổi").
   **Điều kiện lọc từng thẻ COPY CHÍNH XÁC** công thức trong
   `getAdmissionsKpiStats()` (loại `no_demand`, quy `inquiry` cũ về N1) để
   số trên thẻ và số trong popover luôn khớp nhau tuyệt đối.
3. Bấm vào 1 Lead trong popover → nhảy thẳng sang tab Leads + tự mở Drawer
   chi tiết đúng Lead đó — tái dùng nguyên cơ chế deep-link `initialLeadId`
   đã có sẵn ở `LeadsTab` (trước đây chỉ nhận từ URL lúc tải trang), nay
   `admissions-client.tsx` giữ nó ở 1 state riêng (`deepLinkLeadId`) để có
   thể cập nhật lại bất cứ lúc nào từ popover, không viết cơ chế mở Drawer
   song song mới.
4. `page.tsx` gọi thêm `getLeadPaymentsMap()` song song các fetch có sẵn,
   truyền xuống qua đúng 1 prop mới.

100% trong 4 file Sale, không đụng phân hệ khác hay file chung (chỉ IMPORT
component `Popover` có sẵn ở `components/ui/`, không sửa file đó).
`npx tsc --noEmit` sạch.

### 2026-09-17 (tiếp) — Xác nhận: đợt gộp merge 2 phiên song song đã lên GitHub qua PR #5

Kiểm tra lại `git log`/`git fetch` theo yêu cầu chủ dự án: 7 file Sale sửa
trong đợt gộp merge trước đó đã được commit (`3c4a3aa Đồng bộ quy trình
trong phễu tuyển sinh`) và merge thành công qua **Pull Request #5** trên
GitHub — không mất gì. Nhánh `feature/sale` cục bộ sau đó còn được đồng bộ
thêm các commit mới nhất từ `feature/admin`/`feature/student` (hoạt động
bình thường của team, không phải do phiên này gây ra). Không có xung đột
nào phát sinh vì các nhánh đó không đụng file nào của Sale.

### 2026-09-17 (tiếp) — 4 việc chỉnh sửa UI/bố cục nhỏ theo yêu cầu chủ dự án (đều 100% trong Sale, `npx tsc --noEmit` sạch từng lần)

Gộp 4 yêu cầu nhỏ liên tiếp trong ngày, mỗi việc chỉ đổi UI/bố cục, không
đụng logic/dữ liệu, không viết component mới (đều tái dùng cái có sẵn):

1. **Đổi thứ tự tab "Test Đầu Vào"** trong `admissions-client.tsx` sang ngay
   sau "Ca Học thử" (đúng quy trình: học thử xong → test đầu vào → ghi danh
   — trước đó tab này nằm cuối cùng, sai thứ tự nghiệp vụ dù không sai kỹ
   thuật). Thứ tự mới: Leads → Ca Học thử → **Test Đầu Vào** → Ghi danh &
   VietQR → Slot Lớp Trống.
2. **Sắp xếp lại bố cục "Lịch làm việc hôm nay"**
   (`daily-tasks-client.tsx`): đổi thứ tự 3 khối công việc thành **Lead mới
   → Hẹn gọi lại → Học thử** (trước đó Lead mới nằm cuối, còn Hẹn gọi
   lại/Học thử xếp ngang hàng trong 1 lưới 2 cột) — chuyển sang xếp dọc tuần
   tự cả 3 khối full-width để đúng nghĩa "1, rồi đến, cuối cùng". Đồng bộ
   luôn thứ tự 4 ô KPI checklist ở đầu trang cho khớp.
3. **Thêm icon liên hệ Facebook** (tái dùng `QuickFacebookLink` có sẵn) vào
   2 khối còn thiếu trên cùng trang: "Khách Hàng Mới Tiếp Nhận" và "Lịch gọi
   lại cho khách hàng". Riêng khối callback cần tra lại `Lead` đầy đủ từ
   `allLeads` (props có sẵn) vì `CallbackTaskItem` chỉ là view rút gọn,
   không có field `facebook_url` — không thêm field mới vào interface đó.
4. **Thêm lại Biểu đồ Phễu Tuyển sinh vào `/sale/reports`** — tái dùng đúng
   `AdmissionsFunnelChart`/`getAdmissionsKpiStats()` đang chạy ở
   `/sale/admissions`. Lưu ý đã ghi rõ trong UI: đây là ảnh chụp TRỰC TIẾP
   hiện tại của toàn bộ Lead, KHÔNG đổi theo bộ lọc khoảng thời gian của
   trang Báo cáo (khác các khối còn lại) — chỉ fetch 1 lần ở server.

### 2026-09-17 (tiếp) — Vá tiếp 2 lỗi đồng bộ dữ liệu sau khi chạy migration "inquiry", khóa icon tiến giai đoạn cho Lead đã đóng

**Phát hiện qua ảnh chụp bảng Leads thật sau khi chủ dự án đã chạy cả 3
migration:** (1) 1 vài Lead có `status = "Đã liên hệ"` nhưng KHÔNG hiện icon
"Học thử"/"Chốt đơn" (VD: Trần Nhật Tân, Vũ Thị Hà) — icon 2 nút này chỉ hiện
khi `stage = 'potential'`, nhưng 2 Lead này vẫn ở `stage = 'raw'` dù status
đã "Đã liên hệ" — **dữ liệu 2 trục lệch nhau**. (2) 1 số Lead đã tự đóng
"Không có nhu cầu" (VD: Nguyễn Thanh Tùng) vẫn hiện icon "Học thử"/"Chốt đơn"
đang hoạt động — không hợp lý cho 1 Lead đã chết.

**Nguyên nhân (1):** bản migration dọn "inquiry" ĐÃ đơn giản hóa theo đúng
yêu cầu chủ dự án hôm trước (quy thẳng mọi `stage='inquiry'` về `'raw'`,
không phân biệt theo status nữa) — nhưng việc này vô tình **demote** những
Lead cũ đã từng liên hệ thành công thật (status đã "contacted" từ trước khi
tách N1/N2) xuống `stage='raw'`, tạo ra tổ hợp dữ liệu (`raw` + `contacted`)
mà ứng dụng KHÔNG BAO GIỜ tự tạo ra qua luồng bình thường (mọi liên hệ thành
công qua `logInteraction()` luôn tự thăng `raw`→`potential` cùng lúc) — do
đó UI (vốn chỉ tin tưởng cặp dữ liệu luôn đồng bộ) hiện sai icon.

**Đã sửa (2) — khóa icon tiến giai đoạn khi Lead đã "Không có nhu cầu"**
(giống hệt cách đã khóa 3 nút "Chuyển nhanh trạng thái" hôm qua): thêm điều
kiện `status !== 'no_demand'` cho nút "Học thử" và "Chốt đơn"/"Chốt học" ở cả
3 nơi hiển thị (`leads-tab.tsx`, `lead-detail-drawer.tsx`, `trials-tab.tsx`).

**Cần chủ dự án tự chạy thêm 1 câu SQL nữa (data fix 1 lần, không phải
migration lặp lại về sau) để sửa dứt điểm (1):**
```sql
UPDATE public.leads
SET stage = 'potential', updated_at = now()
WHERE stage = 'raw' AND status IN ('contacted', 'converted');
```
Cố tình KHÔNG gộp `status = 'callback'` vào điều kiện trên — sau thay đổi
hôm qua, `callback` giờ có thể xảy ra THUẦN TÚY từ gọi nhỡ 1-2 lần (chưa hề
liên hệ thành công lần nào), nên không còn suy luận chắc chắn "callback = đã
từng liên hệ được" như migration gốc ban đầu.

Xác nhận qua rà lại toàn bộ mô hình theo yêu cầu chủ dự án: "gọi 1-2 lần
không bắt máy → status callback + hiện nhắc lịch ở Lịch làm việc hôm nay",
"gọi đủ 3 lần → status no_demand + loại khỏi số N1 đang chăm sóc", và "sau
khi Đã liên hệ thành công (stage potential) → hiện SONG SONG cả icon Học thử
VÀ Chốt đơn để có thể bỏ qua học thử, sang thẳng giai đoạn 3" — cả 3 điều
này **đã được xây đúng từ trước** (`canStartConversion()` trong
`admissions-funnel.ts` đã cho phép chốt đơn thẳng từ `potential`) — chỉ bị
che khuất bởi 2 lỗi trên, không phải tính năng còn thiếu.

**Trường hợp riêng "Trương Việt Hải" ở `no_demand` dù chủ dự án không bấm
gọi:** chủ dự án tự xác nhận đây là do tự bấm nhầm vào dropdown/nút trạng
thái, không phải bug code. Sau khi khóa `no_demand` hôm qua, muốn mở lại
Lead này phải dùng form "Ghi nhận nhật ký trao đổi" đầy đủ ở Drawer (đường
duy nhất còn được phép đổi trạng thái ra khỏi `no_demand`).

### 2026-09-16 (phiên song song #2, tiếp) — Khóa trạng thái "Không có nhu cầu" khỏi bị ghi đè ngầm

**Phát hiện qua báo cáo chủ dự án:** Lead "Trần Nhật Tân" sau khi gọi nhỡ đủ
3 lần (đã tự động chuyển "Không có nhu cầu") lại đang hiện "Hẹn gọi lại".

**Nguyên nhân (suy ra từ đọc code, không truy vấn được dữ liệu thật do công
cụ Supabase đang mất kết nối phiên này):** khối "Chuyển nhanh trạng thái" (3
nút Đã liên hệ/Hẹn gọi lại/Không nhu cầu) trong Drawer chỉ ẩn khi Lead đã
chốt học (N3) — KHÔNG ẩn khi Lead đã "Không có nhu cầu". `updateLead()`
(hàm 3 nút này gọi) cũng không chặn gì cho trường hợp này. Bấm nhầm/bấm thử
1 trong 3 nút sẽ âm thầm ghi đè ngược lại quyết định tự động, không cảnh báo.

**Đã vá 2 lớp (giống hệt cách N3 đang được khóa):** (1) UI — Drawer ẩn khối 3
nút khi `status === 'no_demand'`, thay bằng thông báo cố định hướng dẫn dùng
form "Ghi nhận nhật ký trao đổi" nếu khách hàng thật sự liên hệ lại; (2)
Server — `updateLead()` chặn cứng: Lead đã `no_demand` mà đổi sang status
khác sẽ bị từ chối, không dựa vào UI. Cố tình KHÔNG khóa đường
`logInteraction()` (form đầy đủ/nút "Gọi") — đây vẫn là cách ĐÚNG để ghi
nhận khách hàng liên hệ lại thật, tự chuyển đúng trạng thái theo kết quả.

### 2026-09-16 (phiên song song #2, tiếp) — Khôi phục bước xác nhận khi bấm "Gọi"

Sau khi gộp xong, chủ dự án phát hiện bản của phiên kia (`QuickCallLink`)
bấm "Gọi" là tự tính luôn 1 lượt gọi nhỡ, KHÔNG hỏi lại xác nhận — khác với
lựa chọn chủ dự án đã chốt qua `AskUserQuestion` ngay trong phiên này
("Thêm bước xác nhận nhanh sau khi bấm gọi"). Đã thay `QuickCallLink` bằng
lại `QuickCallConfirmDialog` (đã có sẵn từ trước) ở 2 nơi còn dùng
(`leads-tab.tsx`, `lead-detail-drawer.tsx`) — giữ nguyên `QuickFacebookLink`
(không liên quan). `QuickCallLink` (component) vẫn còn trong
`quick-call-link.tsx` nhưng không còn nơi nào import — để nguyên không xóa,
chỉ là export không dùng, không ảnh hưởng build.

### 2026-09-16 (phiên song song #2) — Gộp merge conflict với phiên #1 + 4 fix bug live từ chủ dự án

**Bối cảnh:** phiên làm việc NÀY (khác cửa sổ/máy với phiên đã ghi ở các mục
"tiếp 1-6" bên dưới) làm ĐÚNG cùng 1 yêu cầu gốc ("gộp phễu 3 giai đoạn + QR
check-in + test đầu vào") song song, độc lập, không biết về nhau — dẫn tới 2
implementation khác nhau cho cùng khái niệm (VD: phiên kia xây hẳn hệ thống
test trực tuyến thật ở `/test/[token]` + 4 bảng DB mới; phiên này chỉ mở
rộng chấm điểm tay có sẵn + gợi ý lớp). Khi `git pull` xảy ra xung đột thật ở
10 file. Đã hỏi lại chủ dự án xác nhận đúng là 2 phiên song song, và chọn
chiến lược: **ưu tiên bản của phiên kia làm nền** (đầy đủ hơn, đã tự merge
với `develop` trước), rồi rà lại xem 4 lỗi chủ dự án báo trực tiếp trong
phiên này còn thiếu ở bản kia không.

**Cách xử lý 10 file xung đột:** `git checkout --theirs` cho 9 file UI +
`docs/context-sale.md` (giữ nguyên nội dung phiên kia, phiên này chỉ nối
thêm đúng mục bạn đang đọc). Riêng `lib/actions/admissions.ts` KHÔNG cần
`--theirs` — Git đã tự 3-way-merge sạch (2 phiên sửa 2 vùng hàm khác nhau
trong cùng file), giữ được **cả 2 bên**: field `facebook_url`/`checkin_token`
của phiên kia LẪN 4 fix bug của phiên này bên dưới.

**Phát hiện + vá 1 lỗi runtime thật do ghép 2 bản không khớp nhau:**
`getSaleDailyTasks()` (đã giữ được fix của phiên này) vẫn sinh thẻ nhắc nhở
tổng hợp `id: "auto-missed-<leadId>"` cho Lead gọi nhỡ 1-2/3 lần — nhưng bản
`daily-tasks-client.tsx` của phiên kia (vừa lấy làm nền) không biết khái
niệm này, sẽ đẩy thẳng id giả đó vào `completeCallbackTask()` (đòi hỏi UUID
thật) khi bấm "Đã gọi lại" → lỗi kiểu dữ liệu ở Postgres. Đã ghép lại: thêm
nhánh hiển thị riêng (badge "Gọi nhỡ N/3", nút "Gọi lại ngay" mở
`QuickCallConfirmDialog`) cho đúng loại thẻ này trên nền giao diện mới của
phiên kia, không đụng các phần khác của file.

**4 fix bug chủ dự án báo trực tiếp trong phiên này — xác nhận đã giữ được
sau merge (đọc lại `lib/actions/admissions.ts` sau khi ghép):**
1. `logInteraction()`: gọi nhỡ 1-2 lần tự chuyển status "Hẹn gọi lại", liên
   hệ được tự chuyển "Đã liên hệ" (trước đó gọi nhỡ chưa đủ 3 lần không đổi
   status gì cả).
2. `getSaleDailyTasks()`: tự tính thẻ "cần gọi lại" TẠI THỜI ĐIỂM ĐỌC từ
   `missed_calls_count` (không phụ thuộc có dòng `lead_interactions.callback_at`
   nào hay không) — sửa đúng lỗi "gọi nhỡ 2 lần vẫn không thấy nhắc" chủ dự
   án báo qua ảnh chụp màn hình thật.
3. `getAdmissionsKpiStats()`: loại Lead `status = 'no_demand'` khỏi mọi bậc
   N đang hoạt động (trước đó N1/N2 vẫn cộng nhầm Lead đã đóng).
4. Phòng vệ giá trị `stage = 'inquiry'` cũ (migration tách N1/N2 hồi 15/9
   vẫn chưa chạy) ở mọi nơi đọc `stage` — không hiện enum thô ra UI, không
   "biến mất" khỏi thống kê. Cũng thêm `getStageDetailLabel()` (helper mới,
   `lib/utils/admissions-funnel.ts`) để làm tương tự cho `STAGE_DETAIL_LABEL`
   của phiên kia (index thẳng có thể ra `undefined` với `stage` lạ).

**Đã đơn giản hóa lại** `supabase/migrations/20260915_split_lead_stage_raw_potential.sql`
theo phản hồi trực tiếp của chủ dự án (bản tách raw/potential theo status là
thừa vì N1 đã gộp 2 giá trị này) — chỉ còn đúng 1 câu UPDATE quy `inquiry`
về `raw`. **Vẫn CHƯA CHẠY** — xem mục "Việc cần làm tiếp" ở trên.

`npx tsc --noEmit` exit code 0 sau khi ghép xong toàn bộ. **Merge vẫn đang ở
trạng thái "unmerged" trên Git** (đã `git add` các file đã ghép nhưng CHƯA
`git commit` — theo đúng quy tắc không tự ý commit, chủ dự án tự xem lại
`git status`/`git diff --cached` rồi `git commit` để hoàn tất merge).

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

### 2026-09-16 — Checklist tương tác + deep-link chéo trang, và "Nhắc Lịch Tự Động": xây rồi xóa hẳn trong cùng ngày

**Nhắc Lịch Tự Động** (gửi Zalo/SMS nhắc phụ huynh theo `callback_at`/`trial_date`
sắp tới): xây xong đầy đủ (KPI card thứ 5, khối UI riêng, `getReminderQueue()`,
5 file mới) để thay thế 1 link sidebar cũ trỏ 404 (`/sale/reminders`) — nhưng
**sau đó chủ dự án yêu cầu xóa bỏ hoàn toàn**. Đã dọn sạch: xóa card/khối UI ở
`daily-tasks-client.tsx`/`page.tsx`, cột "Nhắc lịch tự động" ở `trials-tab.tsx`,
banner nhắc lịch ở `lead-detail-drawer.tsx`, `getReminderQueue()` trong
`admissions.ts`, và xóa hẳn 5 file/thư mục liên quan (`reminder-queue-block.tsx`,
`reminder-center-panel.tsx`, `lib/actions/reminders.ts`, `lib/reminders/`,
`types/reminders.ts`). **Kết quả ròng: tính năng này KHÔNG tồn tại trong hệ
thống** (cùng kiểu kết cục như Web-to-Lead API trước đó).

**Checklist tương tác + Deep-linking (vẫn giữ, đang hoạt động):** 4 ô KPI đầu
trang `/sale/daily-tasks` giờ bấm được — cuộn mượt xuống đúng khối tương ứng
(hiệu ứng highlight viền), hoặc điều hướng thẳng sang trang liên quan. Mỗi
khối công việc có thêm nút deep-link sang đúng tab/bộ lọc ở Phễu Tuyển sinh
(`/sale/admissions?tab=leads&status=callback`, `?tab=trials`,
`?tab=leads&stage=raw`...). `app/sale/admissions/page.tsx`/`admissions-client.tsx`/
`leads-tab.tsx` đọc `searchParams` (`tab`, `status`, `stage`, `leadId`) để tự
chọn đúng tab, kích hoạt bộ lọc, và tự mở Drawer chi tiết Lead tương ứng.

`npx tsc --noEmit` sạch sau cả 2 việc trên. 100% file Sale, không đụng phân hệ khác.

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

### 2026-09-22 (Claude) — `getCenterBankSettings()` hết bịa dữ liệu + thêm tính năng trả lời phản hồi học sinh

Chủ dự án yêu cầu rà soát + nối luồng dữ liệu 4 phân hệ. Phần ảnh hưởng Sale:

- **`getCenterBankSettings()` (`lib/actions/settings.ts`, Nhóm 2) đổi kiểu trả
  về sang `CenterBankSettings | null`** — không còn tự bịa 1 tài khoản ngân
  hàng khác khi lỗi/thiếu dữ liệu (AGENTS.md Mục 11.1). **Ảnh hưởng trực tiếp
  tới luồng chốt đơn VietQR của Sale:** `components/sale/conversion-checkout-modal.tsx`
  và `components/sale/add-class-to-student-dialog.tsx` (2 nơi tạo mã QR thu
  tiền) đã được cập nhật — nếu `bankSettings.bank_account_no` rỗng, KHÔNG còn
  tạo mã QR nữa, thay vào đó hiện rõ "Chưa cấu hình tài khoản ngân hàng nhận
  học phí — liên hệ Admin để thiết lập trước khi thu tiền" và ẩn luôn nút
  "Xác nhận đã nhận tiền". **Nếu viết thêm màn hình mới nào tạo mã QR, PHẢI
  tự kiểm tra `bankSettings.bank_account_no` rỗng trước khi gọi
  `generateVietQRUrl()`**, theo đúng pattern 2 file trên. 3 trang
  `app/sale/{students,admissions,daily-tasks}/page.tsx` dùng
  `bankSettings ?? EMPTY_CENTER_BANK_SETTINGS` (`lib/utils/vietqr.ts`, object
  rỗng thật) khi `getCenterBankSettings()` trả `null`, để không phải sửa kiểu
  dữ liệu của toàn bộ chuỗi component con.
- **Khép kín vòng phản hồi học sinh:** thêm `getStudentFeedbackList()` +
  `respondToStudentFeedback()` vào `lib/actions/feedback.ts` (đọc/ghi bảng
  `student_feedbacks` — bảng của Student, Sale đọc/xử lý cùng logic "1 tính
  năng 1 chủ sở hữu" ở khâu Phản ánh & Góp ý). Trang `/sale/feedback` giờ có
  thêm khối "Phản hồi trực tiếp từ Học sinh" (dialog mới
  `components/sale/respond-student-feedback-dialog.tsx`) — Sale xem + trả lời
  trực tiếp, học sinh thấy `admin_response` ngay ở `/student/feedback`. Trước
  đây học sinh gửi phản hồi xong không ai đọc (bảng `student_feedbacks` còn
  chưa từng tồn tại trên DB thật — xem `docs/context-student.md`).

`npx tsc --noEmit`: exit code 0. Không có migration mới riêng cho Sale đợt
này (bảng/cột liên quan do Admin/Student ghi log).
