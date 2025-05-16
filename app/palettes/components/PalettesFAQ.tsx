"use client";

export default function PalettesFAQ() {
  return (
    <section className="mt-16 bg-gray-50 p-8 rounded-xl">
      <h2 className="text-2xl font-bold mb-6">
        Frequently Asked Questions About Color Palettes
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-2">
            What makes a good color palette for web design?
          </h3>
          <p className="text-gray-600">
            A good web design color palette typically includes 3-5 colors that
            work harmoniously together, with proper contrast for readability. It
            should include primary colors for branding, secondary colors for
            accents, and neutral colors for text and backgrounds.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">
            How do I choose colors that work well together?
          </h3>
          <p className="text-gray-600">
            Colors that work well together often follow color harmony principles
            like complementary (opposite on the color wheel), analogous
            (adjacent on the color wheel), or monochromatic (variations of one
            color). ColorOne&apos;s palette tools help you create harmonious
            combinations automatically.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">
            What are the trending color schemes in 2025?
          </h3>
          <p className="text-gray-600">
            Trending color schemes in 2025 include earth-toned palettes with
            sustainable greens and browns, digital pastels for tech interfaces,
            and nostalgic color combinations that evoke comfort and familiarity.
            Browse our &quot;Trending&quot; category to see the latest popular
            color schemes.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">
            How many colors should be in a UI design color palette?
          </h3>
          <p className="text-gray-600">
            A UI design color palette typically includes 4-6 core colors: 1-2
            primary brand colors, 1-2 secondary accent colors, and 2-3 neutral
            colors for backgrounds and text. Each core color may have several
            tints and shades for a complete design system.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">
            What&apos;s the difference between RGB, HEX, and HSL color codes?
          </h3>
          <p className="text-gray-600">
            RGB (Red, Green, Blue) uses values from 0-255 for each channel. HEX
            codes are the same values in hexadecimal format (#RRGGBB). HSL (Hue,
            Saturation, Lightness) is more intuitive for designers as it
            separates color (hue) from intensity (saturation) and brightness
            (lightness).
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">
            How can I create a color palette from an image?
          </h3>
          <p className="text-gray-600">
            To create a color palette from an image, you can use ColorOne&apos;s
            color extraction tool that analyzes the image and identifies
            dominant and accent colors. This is perfect for creating brand
            palettes from logos or inspiration photos for your design projects.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">
            What are color palette generators and how do they work?
          </h3>
          <p className="text-gray-600">
            Color palette generators are tools that create harmonious color
            combinations based on color theory principles. They typically start
            with a base color and generate complementary, analogous, triadic, or
            other color relationships to form balanced and visually appealing
            palettes.
          </p>
        </div>
      </div>
    </section>
  );
}
