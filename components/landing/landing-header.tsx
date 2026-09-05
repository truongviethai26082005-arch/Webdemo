"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FeaturesMegaMenu } from "./features-mega-menu";

interface LandingHeaderProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  onOpenLeadModal: () => void;
  onOpenLoginModal?: () => void;
}

export function LandingHeader({
  isLoggedIn,
  dashboardUrl,
  onOpenLeadModal,
  onOpenLoginModal,
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFeaturesExpanded, setMobileFeaturesExpanded] = useState(false);

  const otherNavLinks = [
    { label: "Mô hình áp dụng", href: "#solutions" },
    { label: "Hệ sinh thái AI-Hub", href: "#ai-hub" },
    { label: "Bảng giá & Đăng ký", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary to-blue-500 text-white flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                EduCenter
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 tracking-wider">
                EMS
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:block -mt-1">
              Smart Education Platform & AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Interactive 2-Column Hover Mega Menu */}
          <FeaturesMegaMenu />

          {/* Regular Section Links */}
          {otherNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <ThemeSwitcher />

          {isLoggedIn ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 rounded-xl font-semibold border-border/80 hover:bg-muted text-xs flex items-center gap-1.5"
            >
              <Link href={dashboardUrl}>
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                <span>Vào Bảng Điều Khiển</span>
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenLoginModal}
              className="h-9 rounded-xl font-semibold text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Button>
          )}

          <Button
            onClick={onOpenLeadModal}
            size="sm"
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-primary text-white hover:opacity-95 font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dùng thử Miễn phí</span>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 h-9 w-9 rounded-xl"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {/* Expandable Features Accordion for Mobile */}
            <div>
              <button
                type="button"
                onClick={() => setMobileFeaturesExpanded(!mobileFeaturesExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 rounded-xl transition-colors"
              >
                <span>Tính năng cốt lõi</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileFeaturesExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>

              {mobileFeaturesExpanded && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-muted/30 rounded-xl my-1 text-xs">
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-muted-foreground hover:text-primary font-medium"
                  >
                    • Quản lý: Học sinh, Xếp lớp & Đội ngũ giáo viên
                  </a>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-muted-foreground hover:text-primary font-medium"
                  >
                    • Giảng dạy: Điểm danh trừ ví & Kho bài tập
                  </a>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-muted-foreground hover:text-primary font-medium"
                  >
                    • Vận hành & Tài chính: Thu VietQR & Tính lương GV
                  </a>
                  <a
                    href="#ai-hub"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-muted-foreground hover:text-primary font-medium"
                  >
                    • AI-Hub: Chấm điểm đa môn, tạo đề & cố vấn tuyển sinh
                  </a>
                </div>
              )}
            </div>

            {otherNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            {isLoggedIn ? (
              <Button
                asChild
                variant="outline"
                className="w-full h-10 rounded-xl justify-center font-semibold text-xs gap-2"
              >
                <Link href={dashboardUrl}>
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  Vào Bảng Điều Khiển
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal?.();
                }}
                className="w-full h-10 rounded-xl justify-center font-semibold text-xs gap-2"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập hệ thống
              </Button>
            )}

            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLeadModal();
              }}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground justify-center font-bold text-xs gap-2 shadow-md shadow-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              Đăng ký Dùng thử Miễn phí
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
