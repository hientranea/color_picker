"use client";

import React from "react";
import Link from "next/link";
import { getColorSummariesBySlugs, ColorSummary } from "../utils/colorDataService";

interface RelatedColorsProps {
  relatedSlugs: string[];
  complementarySlugs: string[];
}

function Swatch({ summary }: { summary: ColorSummary }) {
  return (
    <Link href={`/colors/${summary.slug}`} className="group">
      <div className="flex flex-col items-center transition-all duration-300 transform hover:scale-105">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 shadow-md transition-all duration-300 group-hover:shadow-lg"
          style={{ backgroundColor: summary.hex_code }}
        />
        <span className="text-sm font-medium text-center transition-colors duration-300 group-hover:text-indigo-600">
          {summary.color_name}
        </span>
      </div>
    </Link>
  );
}

const RelatedColors: React.FC<RelatedColorsProps> = ({ relatedSlugs, complementarySlugs }) => {
  const related = getColorSummariesBySlugs(relatedSlugs);
  const complementary = getColorSummariesBySlugs(complementarySlugs);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Explore More Colors</h2>
        <p className="text-gray-600 mb-10">
          Discover other colors that might inspire your next design
        </p>

        {related.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Similar</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((s) => (
                <Swatch key={s.slug} summary={s} />
              ))}
            </div>
          </div>
        )}

        {complementary.length > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Complementary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {complementary.map((s) => (
                <Swatch key={s.slug} summary={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedColors;
