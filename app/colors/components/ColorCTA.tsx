import React from "react";
import { ColorData } from "../utils/colorData";

interface ColorCTAProps {
  colorData: ColorData;
}

const ColorCTA: React.FC<ColorCTAProps> = ({ colorData }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div
          className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colorData.hex_code}33 0%, ${colorData.hex_code}66 100%)`,
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className="absolute top-10 left-10 h-32 w-32 rounded-full opacity-20"
              style={{ backgroundColor: colorData.hex_code }}
            ></div>
            <div
              className="absolute bottom-10 right-10 h-24 w-24 rounded-full opacity-20"
              style={{ backgroundColor: colorData.hex_code }}
            ></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: colorData.hex_code }}
            >
              {colorData.call_to_action}
            </h2>

            <p className="text-gray-700 mb-8 text-lg">
              Create beautiful, harmonious color combinations with our
              easy-to-use tools. Perfect for designers, developers, and color
              enthusiasts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/palettes"
                className="px-6 py-3 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: colorData.hex_code }}
              >
                Create a Palette
              </a>

              <a
                href="/"
                className="px-6 py-3 rounded-lg font-medium bg-white text-gray-800 shadow-md hover:shadow-lg transition-all"
              >
                Explore More Colors
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ColorCTA;
