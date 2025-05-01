"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaApple,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Image from "next/image";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Images for the slider - add your actual images here
  const sliderImages = [
    { src: "/hero-tool.png", alt: "ColorOne Color Picker Feature" },
    { src: "/hero-advance-contrast.png", alt: "ColorOne Palette Management" },
    {
      src: "/hero-advance-harmony.png",
      alt: "ColorOne Screen Color Extraction",
    },
    { src: "/hero-advance-variations.png", alt: "ColorOne Color Organization" },
    { src: "/hero-settings-format.png", alt: "ColorOne Color Organization" },
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
  }, [sliderImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  }, [sliderImages.length]);

  return (
    <section className="text-white py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <div className="flex items-center mb-6">
            <Image
              src="/128.png"
              alt="ColorOne"
              width={80}
              height={80}
              className="mr-4 rounded-lg"
              unoptimized
            />
            <h1 className="text-5xl font-bold">ColorOne</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Professional Color Picking and Palette Management
          </h2>
          <p className="text-xl mb-8 font-light">
            Precision, speed, and organization for creative professionals.
            Extract colors from your screen, generate harmonious palettes, and
            organize your color collections with pixel-perfect accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://apps.apple.com/vn/app/colorone-canvas-creative/id6670270632?mt=12"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full overflow-hidden shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
              <span className="relative flex items-center">
                <FaApple className="mr-2 text-2xl" />
                <span className="mr-2">Download Free</span>
                <FaDownload className="text-xl" />
              </span>
            </a>
            <a
              href="https://apps.apple.com/vn/app/colorone-canvas-creative/id6670270632?mt=12"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border-2 border-white rounded-full overflow-hidden transition-all duration-300 ease-out hover:bg-white hover:text-purple-600"
            >
              <span className="relative flex items-center">
                Unlock Premium Features
              </span>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-300">
            Compatible with macOS 10.15 and later • Free to download
          </p>
        </div>

        {/* Image Slider */}
        <div className="relative overflow-hidden">
          <div className="relative w-full h-0 pb-[75%] overflow-hidden">
            {" "}
            {/* 4:3 aspect ratio */}
            {/* Slider container */}
            <div className="absolute inset-0 z-10">
              <div className="relative w-full h-full">
                {sliderImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain" // Changed to contain instead of cover
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide ? "true" : "false"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
