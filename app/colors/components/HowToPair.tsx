"use client";

import React, { useState } from "react";
import { ColorData } from "../utils/colorData";
import { ArrowRight, Palette, Lightbulb, Copy, Check } from "lucide-react";

interface HowToPairProps {
  colorData: ColorData;
}

const HowToPair: React.FC<HowToPairProps> = ({ colorData }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Sample color combinations for each pairing tip
  const sampleCombinations = [
    ["#F5F5DC", "#8A795D"], // For "Pair with earthy browns"
    ["#FFFDD0", "#FFFFF0"], // For "Use with cream or beige"
    ["#00A4CC", "#6CB2EB"], // For "Combine with blues"
  ];

  // Copy color to clipboard
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  if (colorData.how_to_pair.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">
          How to Pair {colorData.color_name}
        </h2>
        <p className="text-gray-600 mb-10">
          Expert tips for creating harmonious color combinations
        </p>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/2">
            <ul className="space-y-6">
              {(colorData.how_to_pair || []).map((tip, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                    activeIndex === index
                      ? "bg-white shadow-md transform -translate-y-1"
                      : "hover:bg-white/50 hover:shadow-sm cursor-pointer"
                  }`}
                  onClick={() =>
                    setActiveIndex(index === activeIndex ? null : index)
                  }
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      activeIndex === index ? "scale-110" : ""
                    }`}
                    style={{
                      backgroundColor: colorData.hex_code,
                      boxShadow:
                        activeIndex === index
                          ? `0 0 0 3px white, 0 0 0 6px ${colorData.hex_code}40`
                          : "none",
                    }}
                  >
                    <span className="text-white text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-gray-700 font-medium transition-all duration-300 ${
                        activeIndex === index ? "text-lg" : "text-base"
                      }`}
                    >
                      {tip}
                    </p>

                    {activeIndex === index && (
                      <div className="mt-4 animate-fade-in">
                        <p className="text-sm text-gray-600 mb-3">
                          Try this color combination:
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div
                            className="h-10 w-10 rounded-full shadow-sm cursor-pointer transition-all duration-300 hover:scale-110"
                            style={{ backgroundColor: colorData.hex_code }}
                            onClick={() => copyToClipboard(colorData.hex_code)}
                            title={`Copy ${colorData.hex_code}`}
                          >
                            {copiedColor === colorData.hex_code && (
                              <div className="w-full h-full rounded-full flex items-center justify-center bg-white/30">
                                <Check size={16} className="text-white" />
                              </div>
                            )}
                          </div>

                          <ArrowRight size={16} className="text-gray-400" />

                          {sampleCombinations[
                            index % sampleCombinations.length
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="h-10 w-10 rounded-full shadow-sm cursor-pointer transition-all duration-300 hover:scale-110"
                              style={{ backgroundColor: color }}
                              onClick={() => copyToClipboard(color)}
                              title={`Copy ${color}`}
                            >
                              {copiedColor === color && (
                                <div className="w-full h-full rounded-full flex items-center justify-center bg-white/30">
                                  <Check size={16} className="text-gray-700" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2">
            <div
              className="h-full rounded-xl p-8 flex flex-col items-center justify-center text-center"
              style={{
                background: `linear-gradient(135deg, ${colorData.hex_code}22 0%, ${colorData.hex_code}66 100%)`,
                border: `1px solid ${colorData.hex_code}33`,
                boxShadow: `0 10px 30px -10px ${colorData.hex_code}40`,
              }}
            >
              <div className="mb-6">
                <Palette
                  size={60}
                  className="mx-auto mb-2"
                  style={{ color: colorData.hex_code }}
                />
                <h3 className="text-2xl font-semibold mb-3">
                  Ready to experiment?
                </h3>
              </div>

              <div className="space-y-4 mb-8 max-w-md">
                <div className="bg-white/70 rounded-lg p-4 flex items-start gap-3 backdrop-blur-sm">
                  <Lightbulb
                    className="flex-shrink-0 mt-1"
                    style={{ color: colorData.hex_code }}
                  />
                  <p className="text-gray-700 text-sm">
                    Use these pairing tips to create harmonious color schemes
                    for your designs. The right color combinations can evoke
                    specific emotions and enhance visual appeal.
                  </p>
                </div>
              </div>

              <a
                href="/palettes"
                className="inline-block px-6 py-3 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: colorData.hex_code }}
              >
                Find Your Own Palette
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToPair;
