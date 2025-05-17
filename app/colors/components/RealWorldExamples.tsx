import React from "react";
import Image from "next/image";
import { ColorData } from "../utils/colorData";

interface RealWorldExamplesProps {
  colorData: ColorData;
}

const RealWorldExamples: React.FC<RealWorldExamplesProps> = ({ colorData }) => {
  if (colorData.real_world_examples.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Real-World Examples</h2>
        <p className="text-gray-600 mb-10">
          See how {colorData.color_name} is used by brands and in design
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {colorData.real_world_examples.map((example, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 w-full bg-gray-200">
                {/* Fallback color swatch if image fails to load */}
                <div
                  className="absolute inset-0 z-0"
                  style={{ backgroundColor: colorData.hex_code }}
                />

                {/* Image with error handling */}
                <div className="relative z-10 h-full w-full">
                  {/* <Image
                    src={example.image_url}
                    alt={example.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      // Hide the image on error, showing the fallback color
                      const target = e.target as HTMLElement;
                      if (target) target.style.display = 'none';
                    }}
                  /> */}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{example.title}</h3>
                <p className="text-gray-600">{example.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RealWorldExamples;
