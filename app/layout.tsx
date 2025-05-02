import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import StructuredData from "@/components/structured-data";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ColorOne - Canvas Creative",
  description:
    "Professional color picking and palette management for creative professionals. Extract colors from your screen, generate harmonious palettes, and organize your color collections with precision.",
  keywords:
    "color picker, color palette, color management, design tool, UI design, web design, graphic design, color extraction, color harmony, macOS app",
  icons: {
    icon: [
      { url: "/16.png", sizes: "16x16", type: "image/png" },
      { url: "/32.png", sizes: "32x32", type: "image/png" },
      { url: "/64.png", sizes: "64x64", type: "image/png" },
      { url: "/128.png", sizes: "128x128", type: "image/png" },
      { url: "/256.png", sizes: "256x256", type: "image/png" },
      { url: "/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/128.png", sizes: "128x128", type: "image/png" },
      { url: "/256.png", sizes: "256x256", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://colorone.site",
    siteName: "ColorOne",
    title: "ColorOne - Canvas Creative",
    description:
      "Professional color picking and palette management tool for creative professionals.",
    images: [
      {
        url: "/hero-tool.png",
        width: 1200,
        height: 630,
        alt: "ColorOne App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ColorOne - Canvas Creative",
    description:
      "Professional color picking and palette management tool for creative professionals.",
    images: ["/hero-tool.png"],
    creator: "@colorone_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://colorone.site",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <StructuredData />
      </body>
    </html>
  );
}
