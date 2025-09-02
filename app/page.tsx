"use client";

import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import { ROICalculatorSection } from "@/components/ROICalculatorSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { PricingSection } from "@/components/PricingSection";
import { ContactSection } from "@/components/ContactSection";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { TermsDialog } from "@/components/TermsDialog";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";

export default function HomePage() {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <HeroSection onOpenContactDialog={() => setIsContactDialogOpen(true)} />
      <ProblemSection />
      <SolutionSection />
      <WhyUsSection onOpenContactDialog={() => setIsContactDialogOpen(true)} />
      <ROICalculatorSection />
      <SocialProofSection />
      <PricingSection />
      <ContactSection onOpenTermsDialog={() => setIsTermsDialogOpen(true)} />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton
        onOpenContactDialog={() => setIsContactDialogOpen(true)}
      />

      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
      />

      <TermsDialog
        open={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
      />
    </div>
  );
}
