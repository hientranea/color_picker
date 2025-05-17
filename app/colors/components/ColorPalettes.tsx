import React from "react";
import { ColorData } from "../utils/colorData";

interface ColorPalettesProps {
  colorData: ColorData;
}

const ColorPalettes: React.FC<ColorPalettesProps> = ({ colorData }) => {
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

          {/* Suggested palettes */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Suggested Palettes</h3>
            <div className="space-y-6">
              {colorData.suggested_palettes.map((palette, index) => (
                <div key={index}>
                  <h4 className="font-medium mb-2">{palette.name}</h4>
                  <div className="flex gap-2">
                    {palette.swatches.map((swatch, swatchIndex) => (
                      <div
                        key={swatchIndex}
                        className="h-12 flex-1 rounded-md shadow-sm"
                        style={{ backgroundColor: swatch }}
                      >
                        <div className="w-full h-full flex items-end justify-center p-1">
                          <span className="text-xs font-mono text-white mix-blend-difference">
                            {swatch}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ColorPalettes;
