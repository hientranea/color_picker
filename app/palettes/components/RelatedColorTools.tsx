"use client";

export default function RelatedColorTools() {
  return (
    <section className="mt-16 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-4">Explore More Color Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/"
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
        >
          <h3 className="font-medium text-lg mb-2">
            Professional Color Picker
          </h3>
          <p className="text-gray-600">
            Extract colors from any image or your screen with our precision
            color picker tool.
          </p>
        </a>
        <a
          href="/"
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
        >
          <h3 className="font-medium text-lg mb-2">Color Harmony Generator</h3>
          <p className="text-gray-600">
            Create harmonious color schemes using color theory principles like
            complementary and analogous.
          </p>
        </a>
        <a
          href="/"
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
        >
          <h3 className="font-medium text-lg mb-2">2025 Color Trends</h3>
          <p className="text-gray-600">
            Discover the trending color palettes and schemes for web and graphic
            design in 2025.
          </p>
        </a>
      </div>
    </section>
  );
}
