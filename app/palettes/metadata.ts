import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palettes | ColorOne - Canvas Creative",
  description:
    "Browse and explore professionally designed color palettes for your creative projects. Find harmonious color schemes for web design, graphic design, and UI/UX projects.",
  keywords:
    "color palettes, color schemes, design palettes, web design colors, UI color schemes, harmonious colors, ColorOne",
  openGraph: {
    title: "Color Palettes | ColorOne - Canvas Creative",
    description:
      "Browse and explore professionally designed color palettes for your creative projects.",
    images: [
      {
        url: "/hero-advance-harmony.png",
        width: 1200,
        height: 630,
        alt: "ColorOne Color Palettes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Palettes | ColorOne - Canvas Creative",
    description:
      "Browse and explore professionally designed color palettes for your creative projects.",
    images: ["/hero-advance-harmony.png"],
  },
};
