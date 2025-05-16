"use client";

import { useEffect } from "react";

type ColorScheme = {
  id: string;
  code: string;
  likes: number;
  created_at: string;
  colors: {
    id: string;
    hex_code: string;
    position: number;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
};

type PalettesStructuredDataProps = {
  colorSchemes: ColorScheme[];
};

export default function PalettesStructuredData({
  colorSchemes,
}: PalettesStructuredDataProps) {
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== "undefined") {
      const palettesPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Professional Color Palettes & Schemes",
        description:
          "Browse curated color palettes for design projects. Find perfect color combinations for web, UI/UX, and graphic design.",
        url: "https://colorone.site/palettes",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: colorSchemes.map((scheme, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "CreativeWork",
              name: `Color Palette ${scheme.id}`,
              description: `${scheme.categories
                .map((c) => c.name)
                .join(", ")} color scheme with ${scheme.colors.length} colors`,
              keywords: scheme.categories.map((c) => c.name).join(", "),
            },
          })),
        },
      };

      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.textContent = JSON.stringify(palettesPageSchema);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [colorSchemes]);

  return null;
}
