import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ColorOne - Professional Color Picker",
  description:
    "Professional color picking and palette management for creative professionals. Extract colors from your screen, generate harmonious palettes, and organize your color collections with precision.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
