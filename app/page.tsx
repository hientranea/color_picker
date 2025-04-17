import React from "react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import ColorPaletteShowcase from "@/components/color-palette-showcase";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import FAQ from "@/components/faq";
import FounderNote from "@/components/founder-note";
import CallToAction from "@/components/call-to-action";
import Footer from "@/components/footer";
import GradientBackground from "@/components/gradient_background";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <GradientBackground />
      <Header />
      <Hero />
      <Features />
      <ColorPaletteShowcase />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FounderNote />
      <CallToAction />
      <Footer />
    </div>
  );
}