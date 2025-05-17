import Link from "next/link";
import { getAllColors } from "./utils/colorData";

export default function ColorsIndexPage() {
  const allColors = getAllColors();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Color Meanings Library
      </h1>
      <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center mb-12">
        Explore our comprehensive collection of colors and discover their
        psychological meanings, emotional associations, and how to use them
        effectively in your designs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allColors.map((color) => (
          <Link
            key={color.slug}
            href={`/colors/${color.slug}`}
            className="group"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div
                className="h-40 w-full group-hover:opacity-90 transition-opacity"
                style={{ backgroundColor: color.data.hex_code }}
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-1">
                  {color.data.color_name}
                </h2>
                <p className="text-gray-500 text-sm mb-3">
                  {color.data.hex_code}
                </p>
                <div className="flex flex-wrap gap-2">
                  {color.data.emotional_associations
                    .slice(0, 2)
                    .map((emotion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${color.data.hex_code}22`,
                          color: color.data.hex_code,
                        }}
                      >
                        {emotion}
                      </span>
                    ))}
                  {color.data.emotional_associations.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{color.data.emotional_associations.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
