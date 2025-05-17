import React from "react";
import { ColorData } from "../utils/colorData";

interface HowToPairProps {
  colorData: ColorData;
}

const HowToPair: React.FC<HowToPairProps> = ({ colorData }) => {
  if (colorData.how_to_pair.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">
              How to Pair {colorData.color_name}
            </h2>
            <ul className="space-y-4">
              {colorData.how_to_pair.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: colorData.hex_code }}
                  >
                    <span className="text-white text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:w-1/2">
            <div
              className="h-full rounded-xl p-8 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colorData.hex_code}22 0%, ${colorData.hex_code}66 100%)`,
                border: `1px solid ${colorData.hex_code}33`,
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-6">🎨</div>
                <h3 className="text-2xl font-semibold mb-3">
                  Ready to experiment?
                </h3>
                <p className="text-gray-700 mb-6">
                  Try these pairing tips in our interactive color palette
                  generator.
                </p>
                <a
                  href="/palettes"
                  className="inline-block px-6 py-3 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: colorData.hex_code }}
                >
                  Create Your Palette
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToPair;
