export interface VietQRConfig {
  bankId: string;       // e.g. "TCB", "MB", "VCB"
  accountNo: string;    // e.g. "556826082005"
  accountName: string;  // e.g. "TRUONG VIET HAI"
  bankName?: string;    // e.g. "Techcombank (TCB)"
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export interface CenterBankSettings {
  bank_id: string;
  bank_account_no: string;
  bank_account_name: string;
  bank_name?: string;
}

export const DEFAULT_CENTER_BANK_SETTINGS: CenterBankSettings = {
  bank_id: "TCB",
  bank_account_no: "556826082005",
  bank_account_name: "TRUONG VIET HAI",
  bank_name: "Techcombank (TCB)",
};

export const DEFAULT_VIETQR_CONFIG: VietQRConfig = {
  bankId: process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'TCB',
  accountNo: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '556826082005',
  accountName: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRUONG VIET HAI',
  bankName: 'Techcombank (TCB)',
  template: 'compact2',
};

export const POPULAR_BANKS = [
  { id: 'TCB', name: 'Techcombank (TCB)' },
  { id: 'MB', name: 'MBBank (Ngân hàng Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank' },
  { id: 'ICB', name: 'VietinBank' },
  { id: 'BIDV', name: 'BIDV' },
  { id: 'ACB', name: 'ACB' },
  { id: 'VPB', name: 'VPBank' },
  { id: 'TPB', name: 'TPBank' },
  { id: 'STB', name: 'Sacombank' },
  { id: 'VIB', name: 'VIB' },
];

/**
 * Loại bỏ dấu tiếng Việt và ký tự đặc biệt, chuyển thành chữ hoa chuẩn ngân hàng
 * Ví dụ: "Nguyễn Văn A" -> "NGUYEN VAN A"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Generate VietQR QuickPay Image URL theo chuẩn img.vietqr.io
 * Cú pháp: https://img.vietqr.io/image/${settings.bank_id}-${settings.bank_account_no}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(settings.bank_account_name)}
 */
export function generateVietQRUrl(
  amount: number,
  memo: string,
  config: Partial<VietQRConfig> = {}
): string {
  const bankId = encodeURIComponent(config.bankId || DEFAULT_VIETQR_CONFIG.bankId);
  const accountNo = encodeURIComponent(config.accountNo || DEFAULT_VIETQR_CONFIG.accountNo);
  const accountName = encodeURIComponent(config.accountName || DEFAULT_VIETQR_CONFIG.accountName);
  const addInfo = encodeURIComponent(memo);

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${Math.round(amount)}&addInfo=${addInfo}&accountName=${accountName}`;
}

/**
 * Format currency VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
