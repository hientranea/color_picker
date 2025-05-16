import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Color Palettes & Schemes | ColorOne - Find Perfect Color Combinations",
  description:
    "Discover thousands of curated color palettes and schemes for web design, UI/UX, and graphic design projects. Browse by category, save favorites, and copy color codes instantly with ColorOne.",
  keywords:
    "color palettes, color schemes, design palettes, web design colors, UI color schemes, harmonious colors, color combinations, color palette generator, professional color schemes, UI/UX color palettes, branding colors, graphic design palettes, trending color schemes, color harmony, color inspiration, monochromatic palettes, analogous color schemes, complementary colors, triadic color palettes, ColorOne",
  openGraph: {
    title: "Professional Color Palettes & Schemes | ColorOne",
    description: "Browse thousands of curated color palettes for your design projects. Find perfect color combinations instantly.",
    images: [
      {
        url: "/hero-advance-harmony.png",
        width: 1200,
        height: 630,
        alt: "ColorOne Color Palettes Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Color Palettes & Schemes | ColorOne",
    description: "Browse thousands of curated color palettes for your design projects. Find perfect color combinations instantly.",
    images: ["/hero-advance-harmony.png"],
  },
  alternates: {
    canonical: "https://colorone.site/palettes",
  },
};