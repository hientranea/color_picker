import { Metadata } from "next";
import Header from "@/components/header";
import ColorsHub from "./components/ColorsHub";
import { ColorCardData } from "./components/ColorCard";
import hubIndex from "./data/hub-index.json";

export const metadata: Metadata = {
  title: "Color Meanings and Psychology | Color Picker",
  description:
    "Explore the psychology and meaning behind colors. Learn how different colors affect emotions and discover perfect color combinations for your designs.",
  keywords:
    "color meanings, color psychology, color theory, web design colors, emotional impact of colors, color palette generator",
};

interface HubIndexShape {
  rows: { slug: string; name: string; hex: string; emotions: string[] }[];
}

export default function ColorsIndexPage() {
  const rows = (hubIndex as unknown as HubIndexShape).rows;
  const cards: ColorCardData[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    hex: r.hex,
    emotions: r.emotions,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <ColorsHub serverRenderedCards={cards} />
      <footer className="mt-20 bg-white dark:bg-gray-800 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Color Meanings Library. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
