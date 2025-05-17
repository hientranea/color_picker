import React from "react";
import { ColorData } from "../utils/colorData";

interface ColorHeaderProps {
  colorData: ColorData;
}

const ColorHeader: React.FC<ColorHeaderProps> = ({ colorData }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background with color gradient */}
      <div
        className="absolute inset-0 opacity-10 z-0"
        style={{
          background: `linear-gradient(135deg, ${colorData.hex_code} 0%, white 100%)`,
        }}
      />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Color swatch */}
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-xl flex-shrink-0"
            style={{ backgroundColor: colorData.hex_code }}
          >
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-mono shadow-sm mix-blend-difference">
                {colorData.hex_code}
              </span>
            </div>
          </div>

          {/* Color information */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">
                {colorData.color_name}
              </h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {colorData.wheel_position}
              </span>
            </div>

            <p className="text-lg md:text-xl text-gray-700 mb-6">
              {colorData.psychological_meaning}
            </p>

            <div className="flex flex-wrap gap-2">
              {colorData.emotional_associations.map((emotion, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${colorData.hex_code}22`,
                    color: colorData.hex_code,
                  }}
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorHeader;
