"use client";

import React, { useState } from "react";
import { ColorData } from "../utils/colorData";
import { Check, Info, ArrowRight } from "lucide-react";

interface ColorHeaderProps {
  colorData: ColorData;
}

const ColorHeader: React.FC<ColorHeaderProps> = ({ colorData }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [colorValues, setColorValues] = useState({
    hex: colorData.hex_code,
    rgb: hexToRgb(colorData.hex_code),
    hsl: hexToHsl(colorData.hex_code),
  });

  // Function to convert hex to RGB
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "rgb(0, 0, 0)";

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Function to convert hex to HSL
  function hexToHsl(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "hsl(0, 0%, 0%)";

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h = Math.round(h * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  // Copy color value to clipboard
  const copyToClipboard = (value: string, type: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Toggle information tooltip
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background with color gradient and animated pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${colorData.hex_code} 0%, white 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Color swatch with interactive elements */}
          <div className="relative group">
            <div
              className="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-xl flex-shrink-0 transition-all duration-500 transform group-hover:scale-105 group-hover:rotate-3"
              style={{
                backgroundColor: colorData.hex_code,
                boxShadow: `0 10px 30px -10px ${colorData.hex_code}80`,
              }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-mono shadow-sm mix-blend-difference">
                  {colorData.hex_code}
                </span>
              </div>
            </div>

            {/* Color value options */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={() => copyToClipboard(colorValues.hex, "hex")}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 ${
                  copied === "hex"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Copy HEX"
              >
                {copied === "hex" ? <Check size={18} /> : "HEX"}
              </button>

              <button
                onClick={() => copyToClipboard(colorValues.rgb, "rgb")}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 ${
                  copied === "rgb"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Copy RGB"
              >
                {copied === "rgb" ? <Check size={18} /> : "RGB"}
              </button>

              <button
                onClick={() => copyToClipboard(colorValues.hsl, "hsl")}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 ${
                  copied === "hsl"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Copy HSL"
              >
                {copied === "hsl" ? <Check size={18} /> : "HSL"}
              </button>
            </div>
          </div>

          {/* Color information */}
          <div className="flex-1 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <h1
                className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colorData.hex_code} 0%, #333333 100%)`,
                }}
              >
                {colorData.color_name}
              </h1>
              <div className="relative">
                <button
                  onClick={toggleTooltip}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors duration-300"
                >
                  {colorData.wheel_position}
                  <Info size={14} className="inline ml-1" />
                </button>

                {showTooltip && (
                  <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg text-sm w-64">
                    <p>
                      <strong>{colorData.wheel_position} color</strong> refers
                      to its position on the color wheel. Primary colors form
                      the foundation of color theory, while secondary and
                      tertiary colors are derived from mixing.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
              {colorData.psychological_meaning}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {colorData.emotional_associations.map((emotion, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: `${colorData.hex_code}22`,
                    color: colorData.hex_code,
                    border: `1px solid ${colorData.hex_code}33`,
                  }}
                >
                  {emotion}
                </span>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <a
                href="/palettes"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: colorData.hex_code }}
              >
                <span>Browse Palette</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorHeader;
