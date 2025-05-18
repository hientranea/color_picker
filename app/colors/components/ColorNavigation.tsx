"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ColorData } from "../utils/colorData";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";

interface ColorNavigationProps {
  currentColor: ColorData;
  currentSlug: string;
  allColorSlugs: string[];
}

const ColorNavigation: React.FC<ColorNavigationProps> = ({
  currentColor,
  currentSlug,
  allColorSlugs,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find previous and next colors
  const currentIndex = allColorSlugs.indexOf(currentSlug);
  const prevSlug = currentIndex > 0 ? allColorSlugs[currentIndex - 1] : null;
  const nextSlug =
    currentIndex < allColorSlugs.length - 1
      ? allColorSlugs[currentIndex + 1]
      : null;

  // Format slug for display
  const formatSlug = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Copy hex code to clipboard
  const copyHexCode = () => {
    navigator.clipboard.writeText(currentColor.hex_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle scroll events to make the navigation sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full z-10 transition-all duration-300 ${
        isSticky
          ? "fixed top-0 bg-white shadow-md py-3"
          : "relative bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Color name and hex */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full transition-transform duration-300 hover:scale-110"
              style={{ backgroundColor: currentColor.hex_code }}
            ></div>
            <h2
              className={`font-semibold transition-all duration-300 ${
                isSticky ? "text-lg" : "text-xl"
              }`}
            >
              {currentColor.color_name}
            </h2>
            <button
              onClick={copyHexCode}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                copied
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>{currentColor.hex_code}</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {prevSlug ? (
              <Link
                href={`/colors/${prevSlug}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-all duration-300"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">{formatSlug(prevSlug)}</span>
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-sm cursor-not-allowed opacity-50"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}

            {nextSlug ? (
              <Link
                href={`/colors/${nextSlug}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-all duration-300"
              >
                <span className="hidden sm:inline">{formatSlug(nextSlug)}</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-sm cursor-not-allowed opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorNavigation;
