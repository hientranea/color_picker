"use client";

import React, { useState } from "react";
import { ColorData } from "../utils/colorData";
import { Heart } from "lucide-react";

interface ColorPalettesProps {
  colorData: ColorData;
}

const ColorPalettes: React.FC<ColorPalettesProps> = ({ colorData }) => {
  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);
  const [likedPalettes, setLikedPalettes] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("complementary");

  // Toggle like status for a palette
  const toggleLike = (index: number) => {
    const newLiked = new Set(likedPalettes);
    if (newLiked.has(index)) {
      newLiked.delete(index);
    } else {
      newLiked.add(index);
    }
    setLikedPalettes(newLiked);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">
          Color Palettes with {colorData.color_name}
        </h2>

        {/* Tabs for different palette types */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("complementary")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-300 ${
              activeTab === "complementary"
                ? "bg-white border-t border-l border-r border-gray-200 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Complementary
          </button>
          <button
            onClick={() => setActiveTab("suggested")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-300 ${
              activeTab === "suggested"
                ? "bg-white border-t border-l border-r border-gray-200 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Suggested Palettes
          </button>
        </div>

        {/* Complementary colors panel */}
        {activeTab === "complementary" && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main color with description */}
              <div className="md:w-1/3">
                <div
                  className="h-32 w-full rounded-lg shadow-sm mb-4 transition-transform duration-300 hover:shadow-md transform hover:scale-105"
                  style={{ backgroundColor: colorData.hex_code }}
                >
                  <div className="w-full h-full flex items-end justify-end p-3">
                    <span className="text-sm font-mono text-white mix-blend-difference px-2 py-1 bg-black/10 rounded">
                      {colorData.hex_code}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {colorData.color_name}
                </h3>
                <p className="text-gray-600">
                  Complementary colors sit opposite on the color wheel and
                  create a vibrant contrast when used together with{" "}
                  {colorData.color_name}.
                </p>
              </div>

              {/* Complementary colors display */}
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {colorData.complementary_colors.map((color, index) => (
                    <div key={index} className="group">
                      <div
                        className="h-32 w-full rounded-lg shadow-sm mb-2 transition-all duration-300 group-hover:shadow-md transform group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      >
                        <div className="w-full h-full flex items-end justify-end p-3">
                          <span className="text-sm font-mono text-white mix-blend-difference px-2 py-1 bg-black/10 rounded">
                            {color}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Complementary {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested palettes panel */}
        {activeTab === "suggested" && (
          <div className="space-y-6 animate-fade-in">
            {colorData.suggested_palettes.map((palette, index) => (
              <article
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              >
                {/* Color Preview with expand/shrink on hover */}
                <div className="flex h-32 w-full">
                  {palette.swatches.map((swatch, swatchIndex) => {
                    const colorId = `palette-${index}-color-${swatchIndex}`;
                    const isHovered = hoveredColorId === colorId;

                    return (
                      <div
                        key={colorId}
                        onMouseEnter={() => setHoveredColorId(colorId)}
                        onMouseLeave={() => setHoveredColorId(null)}
                        className="relative transition-all duration-500 group"
                        style={{
                          backgroundColor: swatch,
                          flexGrow: isHovered ? 3 : 1,
                        }}
                        aria-label={`Color ${swatch}`}
                        title={swatch}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/20 transition-opacity duration-300">
                          <span className="bg-white/90 text-xs font-mono px-2 py-1 rounded shadow-sm transform scale-95 group-hover:scale-100 transition-transform duration-300">
                            {swatch}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-lg">{palette.name}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(index)}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          likedPalettes.has(index)
                            ? "text-red-500 bg-red-50"
                            : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                        }`}
                        title={likedPalettes.has(index) ? "Unlike" : "Like"}
                      >
                        <Heart
                          size={18}
                          className={
                            likedPalettes.has(index) ? "fill-current" : ""
                          }
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {palette.swatches.map((swatch, i) => (
                      <span
                        key={i}
                        className="inline-block w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: swatch }}
                        title={swatch}
                      ></span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ColorPalettes;
