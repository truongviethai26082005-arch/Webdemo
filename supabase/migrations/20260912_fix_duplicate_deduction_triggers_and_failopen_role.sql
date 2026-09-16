-- Phát hiện 3 trigger ở tầng DB không được ghi lại ở bất kỳ đâu trong repo, gây lỗi nghiêm trọng:
--
-- 1. on_attendance_balance_change (attendance) -> handle_attendance_balance(): trùng lặp 100%
--    với logic thủ công trong lib/actions/attendance.ts (saveAttendanceSheet) -> mỗi lần điểm
--    danh, balance_sessions bị trừ 2 lần (1 lần do trigger, 1 lần do code).
DROP TRIGGER IF EXISTS on_attendance_balance_change ON public.attendance;

-- 2. on_invoice_paid_trigger (invoices) -> handle_invoice_paid(): trùng lặp 100% với logic thủ
--    công trong lib/actions/invoices.ts (createInvoice/markInvoiceAsPaid) -> mỗi lần xác nhận
--    thanh toán, balance_sessions được cộng 2 lần (thất thoát doanh thu thật).
DROP TRIGGER IF EXISTS on_invoice_paid_trigger ON public.invoices;

-- 3. on_auth_user_created (auth.users) -> handle_new_user(): mặc định gán role='teacher' khi
--    tạo tài khoản không kèm role trong metadata (fail-open, đúng lỗi Mục 5.1 AGENTS.md nhưng
--    còn sót ở tầng DB). Đồng thời khiến việc tạo tài khoản học sinh (role='student') luôn lỗi,
--    vì insert vào profiles vi phạm CHECK constraint (chỉ cho phép admin/teacher/sale).
-- Sửa: chỉ insert profiles khi role hợp lệ; role='student' hoặc thiếu role -> không tạo dòng
-- profiles nào (học sinh liên kết qua students.auth_user_id, không qua bảng profiles).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.raw_user_meta_data->>'role' IN ('admin', 'teacher', 'sale') THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Người dùng mới'),
      NEW.raw_user_meta_data->>'role'
    );
  END IF;
  RETURN NEW;
END;
$function$;
