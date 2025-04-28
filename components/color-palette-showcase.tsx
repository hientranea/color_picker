"use client";

import Image from "next/image";
import { useRef } from "react";

interface Color {
  name: string;
  hex: string;
  color: string;
}

interface Palette {
  id: string;
  name: string;
  description: string;
  colors: Color[];
}

const PaletteCard = ({ palette }: { palette: Palette }) => {
  return (
    <div className="min-w-[300px] bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 mx-3 flex flex-col">
      <h3 className="text-lg font-bold mb-1">{palette.name}</h3>
      <p className="text-gray-600 mb-4 text-sm">{palette.description}</p>

      {/* Color preview bar */}
      <div className="flex h-20 w-full rounded-md overflow-hidden mb-4">
        {palette.colors.map((color, idx) => (
          <div
            key={idx}
            className="flex-1 transition-all duration-300 hover:flex-[1.5]"
            style={{ backgroundColor: color.hex }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default function EndlessScrollingPalettes() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const palettes: Palette[] = [
    {
      id: "1",
      name: "Ocean Breeze",
      description: "Calming blues and teals inspired by the sea",
      colors: [
        { name: "Deep Sea", hex: "#003B4A", color: "blue" },
        { name: "Teal Wave", hex: "#2E8B98", color: "teal" },
        { name: "Seafoam", hex: "#A4D9D6", color: "light-teal" },
        { name: "Sandy Shore", hex: "#F2D0A7", color: "beige" },
        { name: "Sunset", hex: "#F28D8D", color: "coral" },
      ],
    },
    {
      id: "2",
      name: "Forest Hike",
      description: "Rich natural greens and earthy tones",
      colors: [
        { name: "Pine", hex: "#1E4D2B", color: "dark-green" },
        { name: "Moss", hex: "#6A994E", color: "green" },
        { name: "Sunlit Leaf", hex: "#A7C957", color: "light-green" },
        { name: "Bark", hex: "#BC6C25", color: "brown" },
        { name: "Earth", hex: "#DDA15E", color: "tan" },
      ],
    },
    {
      id: "3",
      name: "Berry Smoothie",
      description: "Vibrant purple and pink berry-inspired palette",
      colors: [
        { name: "Blackberry", hex: "#240046", color: "dark-purple" },
        { name: "Grape", hex: "#5A189A", color: "purple" },
        { name: "Raspberry", hex: "#9D4EDD", color: "light-purple" },
        { name: "Strawberry", hex: "#FF5D8F", color: "pink" },
        { name: "Cream", hex: "#FFC8DD", color: "light-pink" },
      ],
    },
    {
      id: "4",
      name: "Desert Sunset",
      description: "Warm oranges and reds of a desert evening",
      colors: [
        { name: "Terracotta", hex: "#A63A50", color: "terracotta" },
        { name: "Sandstone", hex: "#F0A868", color: "orange" },
        { name: "Sunset Gold", hex: "#F9C784", color: "gold" },
        { name: "Dusk", hex: "#FCF5C7", color: "cream" },
        { name: "Twilight", hex: "#6C91C2", color: "blue" },
      ],
    },
    {
      id: "5",
      name: "Urban Chic",
      description: "Modern grays with vibrant accent colors",
      colors: [
        { name: "Charcoal", hex: "#333F44", color: "dark-gray" },
        { name: "Slate", hex: "#707078", color: "gray" },
        { name: "Silver", hex: "#D3D0CB", color: "light-gray" },
        { name: "Electric Blue", hex: "#1985A1", color: "blue" },
        { name: "Neon", hex: "#C5D86D", color: "lime" },
      ],
    },
    {
      id: "6",
      name: "Autumn Walk",
      description: "Rich fall colors inspired by autumn leaves",
      colors: [
        { name: "Maple", hex: "#BF4342", color: "red" },
        { name: "Pumpkin", hex: "#E5A847", color: "orange" },
        { name: "Gold Leaf", hex: "#F2CD5D", color: "yellow" },
        { name: "Forest Floor", hex: "#583E23", color: "brown" },
        { name: "Evergreen", hex: "#3D5A45", color: "green" },
      ],
    },
    {
      id: "7",
      name: "Cosmic Dreams",
      description: "Deep space-inspired colors with ethereal accents",
      colors: [
        { name: "Deep Space", hex: "#0F111A", color: "black" },
        { name: "Nebula", hex: "#432371", color: "purple" },
        { name: "Stardust", hex: "#714674", color: "magenta" },
        { name: "Aurora", hex: "#4BBDAB", color: "teal" },
        { name: "Celestial", hex: "#EEEEEE", color: "white" },
      ],
    },
  ];

  return (
    <div
      id="palettes"
      className="py-12 bg-gradient-to-r from-gray-50 to-gray-100"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          Explore Beautiful Color Palettes
        </h2>
        <p className="text-xl text-center text-gray-600 mb-8">
          Find inspiration for your next design project
        </p>

        <div className="relative">
          {/* Left fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>

          {/* Right fade effect */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

          {/* Scrolling container */}
          <div className="relative overflow-hidden group">
            <div
              ref={scrollContainerRef}
              className="flex animate-marquee"
              style={{ width: "200%" }}
            >
              {[...palettes, ...palettes].map((p, i) => (
                <PaletteCard key={i} palette={p} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Extract Colors from Images
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Our tool can automatically generate palettes from your favorite
            images
          </p>

          <Image
            src="/image_extraction.png"
            alt="Image extraction"
            width={692}
            height={512}
            className="mx-auto rounded-lg"
          />
        </div>

        <div className="text-center relative">
          <a
            href="/palettes"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 z-10"
          >
            Browse More Palettes
          </a>
        </div>
      </div>
    </div>
  );
}
