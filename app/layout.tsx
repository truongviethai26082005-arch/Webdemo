import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduCenter Pro - Quản lý Trung tâm & Điểm danh Lớp học",
  description: "Phần mềm quản lý vận hành trung tâm dạy học, điểm danh 1 chạm, tự động trừ buổi, cảnh báo công nợ và sinh mã VietQR.",
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
