"use client";

import { useState } from "react";

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

type PalettesListProps = {
  colorSchemes: ColorScheme[];
};

export default function PalettesList({ colorSchemes }: PalettesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories for filter
  const allCategories = Array.from(
    new Set(
      colorSchemes.flatMap((scheme) =>
        scheme.categories.map((category) => category.name)
      )
    )
  ).sort();

  // Filter color schemes by selected category
  const filteredSchemes = selectedCategory
    ? colorSchemes.filter((scheme) =>
        scheme.categories.some((category) => category.name === selectedCategory)
      )
    : colorSchemes;

  return (
    <div>
      {/* Category filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === null
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>

          {allCategories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredSchemes.length === 0 ? (
        <p>No color palettes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">
                Palette: {scheme.code}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Likes: {scheme.likes}
              </p>

              <div className="flex mb-4 h-12 rounded-md overflow-hidden">
                {scheme.colors.map((color) => (
                  <div
                    key={color.id}
                    className="flex-1 h-full"
                    style={{ backgroundColor: color.hex_code }}
                    title={color.hex_code}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {scheme.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-2 py-1 bg-gray-100 text-sm rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center">
                <button
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      scheme.colors.map((c) => c.hex_code).join(", ")
                    );
                    alert("Color codes copied to clipboard!");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Colors
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
