"use client";

import React from "react";
import {
  FaEyeDropper,
  FaLayerGroup,
  FaSwatchbook,
  FaTools,
  FaSync,
  FaRobot,
  FaCloud,
  FaCog,
} from "react-icons/fa";

export default function Features() {
  const features = [
    {
      icon: <FaEyeDropper className="text-4xl text-purple-600 mb-4" />,
      title: "Advanced Color Picking",
      description:
        "Precision eyedropper tool that allows you to pick colors from anywhere on your screen with a magnifying glass for pixel-perfect selection.",
    },
    {
      icon: <FaLayerGroup className="text-4xl text-purple-600 mb-4" />,
      title: "Palette Management",
      description:
        "Create, save, and organize multiple color palettes for different projects. Keep your colors organized and easily accessible.",
    },
    {
      icon: <FaSwatchbook className="text-4xl text-purple-600 mb-4" />,
      title: "Multi-Format Display",
      description:
        "View colors in various formats (HEX, RGB, HSL) with easy copying functionality. Perfect for developers and designers alike.",
    },
    {
      icon: <FaTools className="text-4xl text-purple-600 mb-4" />,
      title: "Advanced Color Tools",
      description:
        "Generate color harmonies, variations, check contrast for accessibility, and extract colors from images with ease.",
    },
    {
      icon: <FaCloud className="text-4xl text-purple-600 mb-4" />,
      title: "Cloud Synchronization",
      description:
        "Sync your palettes across devices when signed in. Never lose your carefully crafted color schemes again.",
    },
    {
      icon: <FaCog className="text-4xl text-purple-600 mb-4" />,
      title: "System Integration",
      description:
        "Run in the background with system tray access for quick color picking whenever inspiration strikes.",
    },
    // {
    //   icon: <FaRobot className="text-4xl text-purple-600 mb-4" />,
    //   title: "AI-Assisted Generation",
    //   description:
    //     "Premium feature that uses AI to suggest complementary colors and generate complete palettes based on your preferences.",
    // },
    {
      icon: <FaSync className="text-4xl text-purple-600 mb-4" />,
      title: "Cross-Platform Support",
      description:
        "Available primarily on macOS with support for other platforms coming soon. Work seamlessly across your devices.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">
          Powerful Features
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Everything you need for professional color management
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
