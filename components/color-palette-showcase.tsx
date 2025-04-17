"use client";

import React from 'react';

const ColorSwatch = ({ color, name, hex }) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-16 h-16 rounded-full mb-2 shadow-md" 
        style={{ backgroundColor: hex }}
      ></div>
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-gray-500">{hex}</span>
    </div>
  );
};

const Palette = ({ name, description, colors }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        {colors.map((color, index) => (
          <ColorSwatch key={index} color={color.color} name={color.name} hex={color.hex} />
        ))}
      </div>
    </div>
  );
};

export default function ColorPaletteShowcase() {
  const palettes = [
    {
      name: "Ocean Breeze",
      description: "Calming blues and teals inspired by the sea",
      colors: [
        { name: "Deep Sea", hex: "#003B4A", color: "blue" },
        { name: "Teal Wave", hex: "#2E8B98", color: "teal" },
        { name: "Seafoam", hex: "#A4D9D6", color: "light-teal" },
        { name: "Sandy Shore", hex: "#F2D0A7", color: "beige" },
        { name: "Sunset", hex: "#F28D8D", color: "coral" }
      ]
    },
    {
      name: "Forest Hike",
      description: "Rich natural greens and earthy tones",
      colors: [
        { name: "Pine", hex: "#1E4D2B", color: "dark-green" },
        { name: "Moss", hex: "#6A994E", color: "green" },
        { name: "Sunlit Leaf", hex: "#A7C957", color: "light-green" },
        { name: "Bark", hex: "#BC6C25", color: "brown" },
        { name: "Earth", hex: "#DDA15E", color: "tan" }
      ]
    },
    {
      name: "Berry Smoothie",
      description: "Vibrant purple and pink berry-inspired palette",
      colors: [
        { name: "Blackberry", hex: "#240046", color: "dark-purple" },
        { name: "Grape", hex: "#5A189A", color: "purple" },
        { name: "Raspberry", hex: "#9D4EDD", color: "light-purple" },
        { name: "Strawberry", hex: "#FF5D8F", color: "pink" },
        { name: "Cream", hex: "#FFC8DD", color: "light-pink" }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Beautiful Color Palettes</h2>
        <p className="text-xl text-center text-gray-600 mb-12">Create and organize stunning color combinations with ColorOne</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {palettes.map((palette, index) => (
            <Palette 
              key={index}
              name={palette.name}
              description={palette.description}
              colors={palette.colors}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Extract Colors from Images</h3>
          <p className="text-lg text-gray-600 mb-8">ColorOne can automatically generate palettes from your favorite images</p>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
                {/* This would be an actual image in production */}
                <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg"></div>
              </div>
              <div className="flex justify-between px-4">
                <ColorSwatch name="Purple" hex="#8B5CF6" color="purple" />
                <ColorSwatch name="Pink" hex="#EC4899" color="pink" />
                <ColorSwatch name="Rose" hex="#F43F5E" color="rose" />
                <ColorSwatch name="Orange" hex="#F97316" color="orange" />
                <ColorSwatch name="Yellow" hex="#FBBF24" color="yellow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}