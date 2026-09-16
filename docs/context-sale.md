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
> 2026-09-15 khi file dài 807 dòng, lần 1 cũng 2026-09-15 khi dài 721 dòng)
> — mục "Trạng thái hiện tại" ngay dưới đây đủ để nắm toàn bộ tình hình mà
> không cần đọc hết "Nhật ký" chi tiết bên dưới. Chỉ đọc "Nhật ký" khi cần
> tra lại lý do/chi tiết kỹ thuật của 1 quyết định hoặc 1 lần vá lỗi cụ thể.

## Trạng thái hiện tại — Tổng hợp (cập nhật 2026-09-16, lần 3)

### Đã xây xong, đang hoạt động thật (đã kiểm chứng qua dữ liệu thật trên Supabase)

| Trang/Tính năng | Route | Ghi chú |
|---|---|---|
| Lịch làm việc hôm nay | `/sale/daily-tasks` | Hẹn gọi lại, ca học thử, Lead mới, học sinh chờ xếp lớp |
| Phễu Tuyển sinh (CRM 3 tab, mô hình N1-N4) | `/sale/admissions` | Leads, Học thử, Chốt đơn + biểu đồ phễu SVG + KPI bar |
| Học sinh chờ xếp lớp | `/sale/admissions/waiting-list` | Đã đóng tiền, chưa có lớp phù hợp |
| Tài khoản Học sinh | `/sale/accounts` | Sale toàn quyền tạo/đặt lại mật khẩu học sinh |
| Phản ánh & Góp ý | `/sale/feedback` | DB đã chạy migration, hoạt động thật (1 dòng dữ liệu) |
| Báo cáo Tuyển sinh | `/sale/reports` | Theo nguồn, theo thời gian, theo học thử, **theo nhân viên Sale + doanh thu** |
| Thêm nhanh Lead | Nút nổi (FAB), mọi trang Sale | `quickCreateLead()` |

6 bảng DB riêng của Sale, **tất cả đã chạy migration, có dữ liệu thật**:
`leads` (8 dòng), `lead_interactions` (4), `trial_slots` (1), `lead_trials`
(2), `feedback_tickets` (1).

### Mô hình Phễu hiện tại — 3 tầng hiển thị (N1-N3), đổi từ 4 tầng ngày 2026-09-16

**Quyết định kiến trúc quan trọng:** chỉ gộp lại CÁCH HIỂN THỊ, KHÔNG đổi cấu
trúc dữ liệu `LeadStage` trong DB — vẫn giữ nguyên 6 giá trị cũ
(`raw`/`potential`/`trial`/`conversion`/`enrolled`/`waiting_class`) để (a)
không phải chạy thêm 1 migration nữa (migration tách raw/potential lần trước
vẫn còn tồn đọng chưa chạy), (b) vẫn giữ được khả năng phân biệt chi tiết nội
bộ khi cần (VD: raw vs potential) dù không hiển thị tách riêng trên giao diện
nữa. Việc gộp nhóm nằm ở tầng UI (badge, filter, KPI bar, biểu đồ phễu), có
1 `STAGE_GROUP` map dùng chung ở `leads-tab.tsx`.

```
Hiển thị: N1 Khách hàng tiềm năng → N2 Xếp lịch học thử → N3 Ghi danh & chuyển đổi
DB thật:  raw + potential        → trial + conversion   → enrolled + waiting_class
```

- **N1 Khách hàng tiềm năng** (gộp `raw`+`potential`): mọi Lead mới đều vào
  đây. Nút "Đăng ký học thử" hiện xuyên suốt N1 (không phân biệt raw/potential
  ở UI nữa — trước đây chỉ hiện khi `potential`).
- **N2 Xếp lịch học thử** (gộp `trial`+`conversion`): đã đăng ký ca học thử,
  kể cả đang chờ chốt đơn sau khi học thử xong. Có thêm 2 việc mới trong tầng
  này: **check-in QR** (học sinh tự quét xác nhận có mặt) và **gợi ý khóa học
  sau "test đầu vào"** (xem 2 mục bên dưới).
- **N3 Ghi danh & chuyển đổi** (gộp `enrolled`+`waiting_class`): đã thanh
  toán, đã hoặc đang chờ xếp lớp. Trạng thái **khóa cứng** — không thể đổi
  ngược về các trạng thái chăm sóc trước đó (chặn cả UI lẫn server).
- Khi đạt N3 với **đủ 3 điều kiện (chốt học + thanh toán + đã xếp lớp)** →
  **tự động cấp tài khoản đăng nhập cho học sinh** (nếu Lead có email thật và
  học sinh chưa có tài khoản từ trước) — không đổi so với trước.

### Check-in buổi học thử bằng mã QR công khai (2026-09-16)

Học sinh/phụ huynh tự quét mã QR bằng camera điện thoại (không cần app
riêng) để tự xác nhận có mặt, không cần Sale đứng điểm danh tay từng người.

- Token = `lead_trials.id` (UUID có sẵn, không thêm cột/bảng DB mới). Route
  công khai: `/checkin/[trialId]` — **route mới NẰM NGOÀI `app/sale/`** vì
  khách vãng lai không có tài khoản đăng nhập. Đã xác nhận không cần sửa
  `proxy.ts` (file dùng chung — không tự ý đụng vào): middleware chỉ chặn
  đúng 4 tiền tố `/admin /teacher /sale /student`, các route khác mặc định
  cho qua.
- Vì RLS hiện tại chỉ cấp quyền cho `authenticated` (AGENTS.md Mục 5.4),
  route công khai bắt buộc dùng `createAdminClient()` (service role) —
  nhưng giới hạn CHẶT trong `getPublicTrialCheckinInfo()`/`confirmTrialCheckin()`
  (`lib/actions/admissions.ts`): chỉ đọc vài trường tối thiểu không nhạy cảm
  (không trả SĐT/tên phụ huynh/email), và chỉ cho phép đúng 1 chiều chuyển
  trạng thái `scheduled` → `attended`, không sửa được gì khác. 2 hàm này CỐ
  Ý không gọi `requireRole()` (khách chưa đăng nhập).
- Ảnh QR sinh qua dịch vụ ảnh công khai `api.qrserver.com` (cùng cách
  `lib/utils/vietqr.ts` đang dùng cho VietQR) — không thêm gói npm nào.
- Sale mở mã QR qua icon cạnh mỗi ca đăng ký ở tab "Xếp lịch học thử".

### Gợi ý khóa học sau "test đầu vào" (2026-09-16)

Sale/GV vẫn chấm điểm tay như cũ (tái dùng đúng `recordTrialAssessment()`
đã có sẵn) — chỉ thêm 1 lớp gợi ý hiển thị dựa trên `TrialResult` đã chọn:
`lib/utils/admissions-course-suggestion.ts` map điểm xếp loại → gợi ý mức độ
lớp (VD: `excellent`/`good` → "Nâng cao", `weak` → "Củng cố nền tảng"), rồi
so khớp text đơn giản với tên lớp thật + môn Lead quan tâm để đánh dấu ⭐
lớp phù hợp trong dropdown. Đây chỉ là **gợi ý tham khảo**, không tự động
chọn lớp thay Sale (đúng AGENTS.md Mục 11.1, tránh lặp lại lỗi "Hà Ngọc Sơn"
trước đây) — áp dụng đồng bộ ở cả `trial-assessment-dialog.tsx` (lúc chấm
điểm), `conversion-checkout-modal.tsx` (lúc chốt đơn) và
`assign-class-dialog.tsx` (lúc xếp lớp cho học sinh chờ), không cần thêm cột
DB nào (tái dùng `trial_result`/`course_interest` đã có).

### Xác nhận nhanh cuộc gọi + tự động hóa trạng thái theo đúng kết quả (2026-09-16, 2 lượt chỉnh)

Bấm nút "Gọi ngay"/"Gọi" ở bất kỳ đâu (drawer chi tiết, bảng Leads, thẻ nhắc
nhở ở Lịch làm việc hôm nay) đều tự mở 1 hộp thoại nhỏ hỏi "Đã liên hệ được"
hay "Không nhấc máy" (`quick-call-confirm-dialog.tsx`) — chọn xong gọi thẳng
`logInteraction()` đã có sẵn, không thêm Server Action hay cột DB mới. Logic
`status` bên trong `logInteraction()` (chốt lại theo đúng yêu cầu chủ dự án,
lượt 2): đủ 3 lần gọi nhỡ liên tiếp → `no_demand` (giữ nguyên) → gọi nhỡ 1-2
lần → **tự `callback`** (mới) → liên hệ được → **luôn `contacted`** (trước
đây chỉ đổi khi đang `new`, nay áp dụng cả khi đang gọi nhỡ trước đó, để
trạng thái luôn khớp đúng kết quả lần gọi gần nhất).

**Nhắc nhở "cần gọi lại" ở Lịch làm việc hôm nay** (đổi tên "Lịch Hẹn Gọi Lại
Cho Phụ Huynh" → "Lịch gọi lại cho khách hàng"): sau 2 lượt vá mới đúng —
`getSaleDailyTasks()` giờ **tự tính TẠI THỜI ĐIỂM ĐỌC** (đúng nguyên tắc dự
án, không dùng cron) mọi Lead có `0 < missed_calls_count < 3` và chưa
`converted`/`no_demand` thành 1 thẻ nhắc nhở riêng (`id` dạng
`auto-missed-<leadId>`, không gắn dòng `lead_interactions` nào) — không phụ
thuộc lịch sử/thời điểm sự kiện, tự đúng ngay cả với Lead đã kẹt sẵn từ
trước khi có tính năng này. Nút hành động trên thẻ này mở lại đúng
`QuickCallConfirmDialog` (không dùng `CallbackResolutionDialog` vì id không
phải UUID thật). Lịch hẹn tường minh (Sale tự chọn giờ) vẫn hoạt động song
song, không đổi.

### "inquiry" — giá trị `stage` cũ còn sót & cách xử lý (2026-09-16)

3 giai đoạn hiển thị hiện tại (N1/N2/N3) tương ứng đúng 6 giá trị DB đã liệt
kê ở trên — **`inquiry` KHÔNG còn là 1 giá trị hợp lệ** (bị thay bằng
`raw`/`potential` từ 2026-09-15) nhưng Lead tạo trước ngày đó vẫn còn giữ
giá trị cũ này cho tới khi chạy migration dọn dữ liệu. Đã thêm lớp phòng vệ
ở TẤT CẢ nơi đọc `stage` (badge, bộ lọc, tự thăng bậc khi liên hệ được,
`getAdmissionsKpiStats()`) để tự quy `inquiry` về nhóm N1 thay vì hiện enum
thô hoặc "biến mất" khỏi thống kê — nhưng đây chỉ là **band-aid tạm thời ở
tầng code**, xem mục "Việc chủ dự án cần làm tiếp" bên dưới để dọn dứt điểm.

### Việc chủ dự án cần làm tiếp

1. **Chạy migration còn treo (đã đơn giản hóa lại 2026-09-16):**
   `supabase/migrations/20260915_split_lead_stage_raw_potential.sql` giờ chỉ
   còn đúng 1 câu `UPDATE ... SET stage = 'raw' WHERE stage = 'inquiry'`
   (bản đầu tách raw/potential theo status bị chủ dự án phản hồi là thừa,
   đã bỏ — N1 đã gộp raw+potential thành 1 khối duy nhất trên toàn giao
   diện nên không cần phân biệt 2 giá trị đó nữa). Chưa chạy sẽ tiếp tục
   phải dựa vào lớp phòng vệ ở code (mục trên) thay vì dữ liệu gốc sạch.
2. Quyết định có muốn đầu tư 1 dịch vụ đọc biến động số dư ngân hàng
   (Casso/SePay...) để tự động hóa xác nhận thanh toán hay không — hiện vẫn
   xác nhận thủ công (đã hoạt động đúng, có chống double-submit).
3. Cân nhắc thu thập **email thật** của Lead khi tiếp nhận (form "Thêm nhanh
   Lead" hiện không có trường email) — nếu không, tính năng tự động cấp tài
   khoản học sinh sẽ hiếm khi tự chạy được (không tự bịa email theo AGENTS.md
   Mục 11.1).
4. Xác nhận có muốn xóa hẳn `app/admin/admissions` (giao diện mock cũ, đã mồ
   côi route) hay giữ lại tham khảo.
5. Toàn bộ thay đổi vẫn đang **uncommitted trên git** — tự xem diff và commit
   khi sẵn sàng (Claude không tự commit/push).

### Quyết định kiến trúc đã chốt (áp dụng khi viết code Sale mới)

- **Tách `stage`** (giai đoạn N1-N3 trong phễu) **khỏi `status`** (kết quả
  chăm sóc: new/contacted/callback/no_demand/converted) — 2 khái niệm độc
  lập, không lẫn vào nhau. Hệ quả cần nhớ: khi 1 Lead bị đóng `no_demand`,
  `stage` KHÔNG tự đổi — mọi chỗ TÍNH TOÁN theo `stage` (KPI, báo cáo) phải
  tự loại trừ `status = 'no_demand'` nếu muốn chỉ đếm Lead đang thực sự hoạt
  động (đã áp dụng ở `getAdmissionsKpiStats()` từ 2026-09-16).
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

### Liên kết với Admin/Teacher/Student

5 điểm nối duy nhất, đều qua Server Action dùng chung đã có sẵn (xác nhận
bằng grep toàn bộ repo nhiều lần trong ngày, không suy đoán):

| Sale gọi hàm | Ảnh hưởng |
|---|---|
| `createStudent()` | Admin thấy ngay ở `/admin/students` |
| `createInvoice()` | Cộng doanh thu `/admin/finance`, `/admin/invoices` |
| `enrollStudentInClass()` | Admin thấy sĩ số lớp; Teacher thấy học sinh trong lớp/điểm danh |
| `createAccountByAdmin()` / `resetStudentPassword()` | Mở/đổi khả năng đăng nhập của Student |

6 bảng riêng của Sale — **không phân hệ nào khác đọc/ghi trực tiếp**, cô lập
hoàn toàn trong `lib/actions/admissions.ts` và `lib/actions/feedback.ts`.
Type `LeadStage`/`Lead` trong `types/database.ts` cũng đã xác nhận (grep
chính xác `import ... from "@/types/database"`) **chỉ 7 file trong toàn dự
án dùng, tất cả đều thuộc `app/sale/`/`components/sale/`** — đổi enum
`LeadStage` (N1-N4) ngày 2026-09-15 không ảnh hưởng Admin/Teacher/Student.

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

1. **Tra cứu Slot lớp học real-time cho Sale** — khả thi cao, effort thấp:
   dữ liệu/logic tính sĩ số đã có sẵn ở Admin, chỉ cần "mở khóa" cho Sale
   đọc. Đi kèm: vá `enrollStudentInClass()` hiện KHÔNG kiểm tra `max_students`
   trước khi ghi danh (lỗ hổng cùng dạng đã vá cho sĩ số ca học thử).
2. **Quản lý vòng đời học viên** (bảo lưu/chuyển lớp/thôi học) — effort cao
   nhất, đụng tài chính (lãnh địa Admin), nên chia 2 giai đoạn.
3. **Phản ánh & Góp ý Giai đoạn 2/3** — mức khẩn cấp, cảnh báo quá hạn, định
   tuyến sang Admin/Teacher (cần trang mới bên các phân hệ đó trước).
4. **Báo cáo Tuyển sinh Giai đoạn 2** — trang tóm tắt bên `/admin/` đọc lại
   `getAdmissionsReportData()` để Admin xem được mà không cần đăng nhập Sale.
5. RLS thật theo từng role cho các bảng Sale — hoãn có chủ đích, giống hiện
   trạng 7 bảng lõi (AGENTS.md Mục 5.4).

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

### 2026-09-16 (tiếp) — 3 vòng vá liên tiếp quanh "nhắc gọi lại" + trạng thái + dữ liệu "inquiry" (chi tiết đầy đủ đã gộp lên mục Tổng hợp phía trên)

Chuỗi phản hồi qua lại thật với chủ dự án trong cùng 1 ngày, tóm tắt để tra
cứu nhanh khi cần biết "đã thử gì, vì sao đổi":

1. **Lỗi nhắc gọi lại không hiện ("Trần Nhật Tân" gọi nhỡ 2/3 lần vẫn báo
   0):** thử vá lần 1 bằng cách tự set `callback_at` ngay lúc ghi log gọi
   nhỡ trong `logInteraction()` — **bỏ đi vì vẫn còn kẽ hở**: không tự sửa
   được Lead đã kẹt từ TRƯỚC khi vá, và nếu Sale bấm thêm 1 lần để test thì
   đó lại là lần thứ 3 (tự đóng no_demand, không tạo nhắc nhở). Vá lần 2
   (đang dùng): chuyển hẳn sang tính nhắc nhở này TẠI THỜI ĐIỂM ĐỌC trực
   tiếp từ `missed_calls_count` trong `getSaleDailyTasks()` — tự đúng với
   mọi Lead bất kể lịch sử. Đổi tên "Lịch Hẹn Gọi Lại Cho Phụ Huynh" →
   "Lịch gọi lại cho khách hàng" theo yêu cầu.
2. **Yêu cầu tiếp theo:** gọi nhỡ 1-2 lần phải tự chuyển status "Hẹn gọi
   lại", liên hệ được tự chuyển "Đã liên hệ" — sửa lại thứ tự ưu tiên gán
   `status` trong `logInteraction()`.
3. **Phát hiện N1/N2 vẫn cộng cả Lead `no_demand`** vào số "đang chăm sóc"
   (do `stage` không tự đổi khi đóng Lead) — vá `getAdmissionsKpiStats()`
   loại hẳn `no_demand` khỏi mọi bậc N đang hoạt động.
4. **Phát hiện thêm khi đối chiếu số liệu (9 tổng, cộng N1+N2+N3 chỉ ra 6):**
   3 Lead cũ còn giá trị `stage = 'inquiry'` (do migration tách N1/N2 hồi
   15/9 chưa chạy) không khớp bucket nào — thêm lớp phòng vệ ở mọi nơi đọc
   `stage` để tự quy `inquiry` về N1, đồng thời **đơn giản hóa lại migration**
   (chủ dự án phản hồi bản tách raw/potential theo status là thừa, vì N1 đã
   gộp 2 giá trị này rồi) — giờ chỉ còn đúng 1 câu UPDATE.

### 2026-09-16 — Tái thiết kế Phễu Tuyển sinh từ 4 xuống 3 giai đoạn + 3 tính năng mới

Theo yêu cầu chi tiết của chủ dự án (mô tả đúng nghiệp vụ chuẩn 1 trung tâm
dạy thêm thật). Trước khi code đã dùng `AskUserQuestion` chốt 4 quyết định
kiến trúc lớn (đều theo phương án đề xuất/an toàn nhất):

1. **Gộp phễu 4→3 tầng chỉ ở tầng HIỂN THỊ**, không đổi `LeadStage` trong DB
   — xem chi tiết đầy đủ ở mục "Mô hình Phễu hiện tại" phía trên.
2. **Xác nhận nhanh cuộc gọi** thay vì tự động đếm ngay khi bấm — thêm 1 bước
   hỏi lại "Có kết nối được không?", tái dùng đúng cơ chế đếm gọi nhỡ cũ.
3. **Check-in học thử bằng mã QR**: học sinh tự quét bằng điện thoại (không
   phải Sale quét), route công khai `/checkin/[trialId]`.
4. **"Test đầu vào"**: mở rộng đúng chức năng chấm điểm học thử có sẵn, thêm
   lớp gợi ý mức độ lớp theo điểm — không xây hệ thống thi trực tuyến.

**File mới:** `app/checkin/[trialId]/page.tsx` + `checkin-confirm-client.tsx`
(route công khai, nằm ngoài `app/sale/` — đã xác nhận không cần sửa
`proxy.ts`), `components/sale/quick-call-confirm-dialog.tsx`,
`components/sale/trial-checkin-qr-dialog.tsx`,
`lib/utils/admissions-course-suggestion.ts`.

**File sửa (toàn bộ trong `app/sale/`, `components/sale/`,
`lib/actions/admissions.ts` — không đụng `types/database.ts` hay bất kỳ file
Nhóm 1/2 nào khác):** `admissions.ts` (thêm 2 hàm check-in công khai KHÔNG
qua `requireRole()`, mở rộng `WaitingListStudentItem`), `admissions-funnel-chart.tsx`,
`admissions-kpi-bar.tsx` (gộp thẻ 7→5, vẫn giữ nguyên bản chất snapshot —
KHÔNG đổi lại công thức đã chốt trước đó), `leads-tab.tsx`, `lead-detail-drawer.tsx`,
`trials-tab.tsx`, `conversions-tab.tsx`, `conversion-checkout-modal.tsx`,
`assign-class-dialog.tsx`, `trial-assessment-dialog.tsx`, `admissions-client.tsx`
(đổi nhãn 3 tab). `npx tsc --noEmit` exit code 0 sau khi hoàn tất.

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
