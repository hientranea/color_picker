"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ColorData } from "../utils/colorData";

interface RelatedColorsProps {
  currentColor: ColorData;
  currentSlug: string;
  allColorSlugs: string[];
}

const RelatedColors: React.FC<RelatedColorsProps> = ({
  currentColor,
  currentSlug,
  allColorSlugs,
}) => {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Format slug for display
  const formatSlug = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get a subset of colors to display as related
  // In a real app, this would be based on color similarity or categories
  const getRelatedColors = () => {
    if (!Array.isArray(allColorSlugs)) return [];
    const otherColors = allColorSlugs.filter((slug) => slug !== currentSlug);
    // Shuffle and take up to 6 colors
    return otherColors
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(6, otherColors.length));
  };

  const relatedColors = getRelatedColors();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Explore More Colors</h2>
        <p className="text-gray-600 mb-10">
          Discover other colors that might inspire your next design
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {relatedColors.map((slug) => (
            <Link
              href={`/colors/${slug}`}
              key={slug}
              className="group"
              onMouseEnter={() => setHoveredColor(slug)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              <div className="flex flex-col items-center transition-all duration-300 transform hover:scale-105">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 shadow-md transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    backgroundColor: `var(--color-${slug})`,
                    boxShadow:
                      hoveredColor === slug
                        ? `0 0 0 3px white, 0 0 0 6px var(--color-${slug})`
                        : "",
                  }}
                ></div>
                <span className="text-sm font-medium text-center transition-colors duration-300 group-hover:text-indigo-600">
                  {formatSlug(slug)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CSS variables for color swatches */}
        <style jsx global>{`
          ${Array.isArray(allColorSlugs) ? allColorSlugs
            .map(
              (slug) => `
            --color-emerald-green: #50C878;
            --color-royal-blue: #4169E1;
            --color-web-orange: #FFA500;
          `
            )
            .join("\n") : ''}
        `}</style>
      </div>
    </section>
  );
};

export default RelatedColors;
