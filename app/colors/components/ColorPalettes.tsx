"use client";

import React, { useState } from "react";
import { ColorData } from "../utils/colorData";
import { Heart, Copy, Check, Twitter } from "lucide-react";

interface ColorPalettesProps {
  colorData: ColorData;
}

const ColorPalettes: React.FC<ColorPalettesProps> = ({ colorData }) => {
  const [copiedPalette, setCopiedPalette] = useState<number | null>(null);
  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);
  const [likedPalettes, setLikedPalettes] = useState<Set<number>>(new Set());

  const handleCopyColors = (palette: { swatches: string[] }, index: number) => {
    const colorCodes = palette.swatches.join(", ");
    navigator.clipboard.writeText(colorCodes);
    setCopiedPalette(index);
    setTimeout(() => setCopiedPalette(null), 2000);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">
          Color Palettes with {colorData.color_name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Complementary colors */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Complementary Colors</h3>
            <div className="flex gap-3 mb-4">
              <div
                className="h-16 w-16 rounded-lg shadow-sm"
                style={{ backgroundColor: colorData.hex_code }}
              >
                <div className="w-full h-full flex items-end justify-center p-1">
                  <span className="text-xs font-mono text-white mix-blend-difference">
                    {colorData.hex_code}
                  </span>
                </div>
              </div>

              {colorData.complementary_colors.map((color, index) => (
                <div
                  key={index}
                  className="h-16 w-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <div className="w-full h-full flex items-end justify-center p-1">
                    <span className="text-xs font-mono text-white mix-blend-difference">
                      {color}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-600">
              Complementary colors sit opposite on the color wheel and create a
              vibrant contrast when used together.
            </p>
          </div>

          {/* Suggested palettes - Updated to match PalettesList.tsx style */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Suggested Palettes</h3>
            <div className="space-y-6">
              {colorData.suggested_palettes.map((palette, index) => (
                <article
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
                >
                  {/* Color Preview with expand/shrink on hover */}
                  <div className="flex h-24 w-full">
                    {palette.swatches.map((swatch, swatchIndex) => {
                      const colorId = `palette-${index}-color-${swatchIndex}`;
                      const isHovered = hoveredColorId === colorId;

                      return (
                        <div
                          key={colorId}
                          onMouseEnter={() => setHoveredColorId(colorId)}
                          onMouseLeave={() => setHoveredColorId(null)}
                          className="relative transition-all duration-300 group"
                          style={{
                            backgroundColor: swatch,
                            flexGrow: isHovered ? 2 : 1,
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
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium mb-3">{palette.name}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          className={`flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 transition-all duration-300 ${
                            copiedPalette === index
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                          onClick={() => handleCopyColors(palette, index)}
                        >
                          {copiedPalette === index ? (
                            <>
                              <Check size={16} className="animate-bounce" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy
                                size={16}
                                className="transform transition-transform duration-300 group-hover:scale-110"
                              />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ColorPalettes;
