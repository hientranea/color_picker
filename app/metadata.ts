import { Metadata } from "next";
import { siteConfig } from "./config";

export const metadata: Metadata = {
  metadataBase: siteConfig.metadataBase,
  title: "ColorOne - Canvas Creative",
  description:
    "Professional color picking and palette management for creative professionals. Extract colors from your screen, generate harmonious palettes, and organize your color collections with precision.",
  keywords:
    "color picker, color extraction, color palette generator, web design tool, UI design colors, graphic design tool, macOS color picker, professional design app, color harmony, color management",
  openGraph: {
    title: "ColorOne - Canvas Creative",
    description:
      "Professional color picking and palette management for creative professionals.",
    images: [
      {
        url: "/hero-tool.png",
        width: 1200,
        height: 630,
        alt: "ColorOne Professional Color Picker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ColorOne - Canvas Creative",
    description:
      "Professional color picking and palette management for creative professionals.",
    images: ["/hero-tool.png"],
  },
};
