"use client";

import { useState } from "react";
import { TalkClassHeader } from "./talk-class-header";
import { HeroBanner } from "./hero-banner";
import { CredentialBar } from "./credential-bar";
import { AboutSection } from "./about-section";
import { StatsSection } from "./stats-section";
import { CoursesSection } from "./courses-section";
import { TeachersSection } from "./teachers-section";
import { ExtracurricularSection } from "./extracurricular-section";
import { RegisterFormSection } from "./register-form-section";
import { PressPartnersSection } from "./press-partners-section";
import { FloatingContact } from "./floating-contact";
import { TalkClassFooter } from "./talk-class-footer";
import { LoginModal } from "./login-modal";

interface LandingPageContentProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
}

export function LandingPageContent({
  isLoggedIn,
  dashboardUrl,
}: LandingPageContentProps) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#141b2c] antialiased selection:bg-[#0c2356] selection:text-white flex flex-col">
      {/* 1. TOP TICKER & STICKY HEADER */}
      <TalkClassHeader
        isLoggedIn={isLoggedIn}
        dashboardUrl={dashboardUrl}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* MAIN CONTENT SECTIONS */}
      <main className="flex-1">
        {/* 2. HERO BANNER WITH SLIDER CONTROLS */}
        <HeroBanner />

        {/* 3. TOP 3 CREDENTIAL HIGHLIGHT BAR */}
        <CredentialBar />

        {/* 4. ABOUT TALK CLASS & 6 REASONS WHY */}
        <AboutSection />

        {/* 5. ACHIEVEMENTS & STATS COUNTER */}
        <StatsSection />

        {/* 6. FEATURED COURSES (Mất gốc, Nâng cao, Doanh nghiệp) */}
        <CoursesSection />

        {/* 7. NATIVE FACULTY TEAM */}
        <TeachersSection />

        {/* 8. EXTRACURRICULAR "CAFE TÂY" & STUDENT FEEDBACK */}
        <ExtracurricularSection />

        {/* 9. TEST REGISTRATION FORM & LIVE COUNTDOWN */}
        <RegisterFormSection />

        {/* 10. PRESS & PARTNERS (VTV, Cafebiz, FPT, Ladipage...) */}
        <PressPartnersSection />
      </main>

      {/* 11. FLOATING QUICK CONTACT (Hotline, Zalo, Scroll-to-top) */}
      <FloatingContact />

      {/* 12. FULL FOOTER */}
      <TalkClassFooter />

      {/* 13. LMS LOGIN MODAL */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
    </div>
  );
}
