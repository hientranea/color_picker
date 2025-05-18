"use client";

import React, { useEffect, useRef, useState } from "react";
import { ColorData } from "../utils/colorData";
import { ArrowRight, Sparkles, Download } from "lucide-react";

interface ColorCTAProps {
  colorData: ColorData;
}

const ColorCTA: React.FC<ColorCTAProps> = ({ colorData }) => {
  const decorRef = useRef<HTMLDivElement>(null);
  // Add state to track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  // Store random rotations in state
  const [sparkleRotations, setSparkleRotations] = useState<number[]>([]);

  // Set mounted state and generate random rotations only on client
  useEffect(() => {
    setIsMounted(true);
    // Generate random rotations once on mount
    setSparkleRotations(
      Array(10)
        .fill(0)
        .map(() => Math.random() * 360)
    );
  }, []);

  // Add parallax effect to decorative elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!decorRef.current) return;

      const decorElements = decorRef.current.querySelectorAll(".decor-element");
      const rect = decorRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const moveX = (e.clientX - centerX) / 30;
      const moveY = (e.clientY - centerY) / 30;

      decorElements.forEach((el, index) => {
        const depth = (index % 3) + 1;
        const htmlEl = el as HTMLElement;
        htmlEl.style.transform = `translate(${moveX * depth}px, ${
          moveY * depth
        }px)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div
          ref={decorRef}
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colorData.hex_code}33 0%, ${colorData.hex_code}66 100%)`,
            boxShadow: `0 20px 40px -20px ${colorData.hex_code}50`,
          }}
        >
          {/* Decorative elements with parallax effect */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div
              className="decor-element absolute top-10 left-10 h-40 w-40 rounded-full opacity-20 transition-transform duration-200 ease-out"
              style={{ backgroundColor: colorData.hex_code }}
            ></div>
            <div
              className="decor-element absolute bottom-10 right-10 h-32 w-32 rounded-full opacity-20 transition-transform duration-200 ease-out"
              style={{ backgroundColor: colorData.hex_code }}
            ></div>
            <div
              className="decor-element absolute top-40 right-20 h-24 w-24 rounded-full opacity-10 transition-transform duration-200 ease-out"
              style={{ backgroundColor: colorData.hex_code }}
            ></div>
            <div
              className="decor-element absolute bottom-40 left-20 h-20 w-20 rounded-full opacity-10 transition-transform duration-200 ease-out"
              style={{ backgroundColor: colorData.hex_code }}
            ></div>

            {/* Animated sparkles */}
            <div className="absolute inset-0">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    top: `${isMounted ? Math.random() * 100 : 0}%`,
                    left: `${isMounted ? Math.random() * 100 : 0}%`,
                    animationDelay: `${isMounted ? Math.random() * 3 : 0}s`,
                    animationDuration: `${
                      isMounted ? 2 + Math.random() * 3 : 2
                    }s`,
                  }}
                >
                  <Sparkles
                    size={16}
                    className="text-white opacity-50"
                    style={
                      isMounted
                        ? { transform: `rotate(${sparkleRotations[i]}deg)` }
                        : {}
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: colorData.hex_code }}
            >
              {colorData.call_to_action}
            </h2>

            <p className="text-gray-700 mb-10 text-lg leading-relaxed">
              Create beautiful, harmonious color combinations with our
              easy-to-use tools. Perfect for designers, developers, and color
              enthusiasts. Take your designs to the next level with
              professional-grade color palettes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/palettes"
                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: colorData.hex_code }}
              >
                <span>Browse a Palette</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              <a
                href="/colors"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-white text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <span>Explore More Colors</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ColorCTA;
