"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Copy, Check, Filter, LogIn } from "lucide-react";

type ColorScheme = {
  id: string;
  code: string;
  likes: number;
  created_at: string;
  colors: {
    id: string;
    hex_code: string;
    position: number;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
};

type PalettesListProps = {
  colorSchemes: ColorScheme[];
};

export default function PalettesList({ colorSchemes }: PalettesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [likedPalettes, setLikedPalettes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular");
  const [showLoginCTA, setShowLoginCTA] = useState(false);

  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Get unique categories for filter
  const allCategories = Array.from(
    new Set(
      colorSchemes.flatMap((scheme) =>
        scheme.categories.map((category) => category.name)
      )
    )
  ).sort();

  // Filter color schemes by selected category
  let filteredSchemes = selectedCategory
    ? colorSchemes.filter((scheme) =>
        scheme.categories.some((category) => category.name === selectedCategory)
      )
    : colorSchemes;

  // Sort color schemes
  filteredSchemes = filteredSchemes.sort((a, b) => {
    if (sortBy === "popular") {
      return b.likes - a.likes;
    } else {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  const handleCopyColors = (scheme: ColorScheme) => {
    const colorCodes = scheme.colors.map((c) => `#${c.hex_code}`).join(", ");
    navigator.clipboard.writeText(colorCodes);
    setCopiedId(scheme.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLike = (id: string) => {
    setLikedPalettes((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
      } else {
        newLiked.add(id);
      }
      return newLiked;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Scroll observer for CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShowLoginCTA(true);
        }
      },
      { threshold: 0.5 }
    );

    if (listEndRef.current) {
      observer.observe(listEndRef.current);
    }

    return () => {
      if (listEndRef.current) {
        observer.unobserve(listEndRef.current);
      }
    };
  }, [filteredSchemes]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header, sorting & filter controls */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Color Palette Explorer
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("popular")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                sortBy === "popular"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Most Popular
            </button>
            <button
              onClick={() => setSortBy("newest")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                sortBy === "newest"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-all duration-300"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Category filter */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-xl mb-6 transition-all duration-300">
            <h3 className="font-medium mb-3 text-gray-700">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === null
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All Palettes
              </button>

              {allCategories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* No results */}
      {filteredSchemes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Filter size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No palettes found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category or clearing your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              {/* Color Preview with expand/shrink on hover */}
              <div className="flex h-24 w-full">
                {scheme.colors.map((color) => {
                  const isHovered = hoveredColorId === color.id;

                  return (
                    <div
                      key={color.id}
                      onMouseEnter={() => setHoveredColorId(color.id)}
                      onMouseLeave={() => setHoveredColorId(null)}
                      className="relative transition-all duration-300 group"
                      style={{
                        backgroundColor: `#${color.hex_code}`,
                        flexGrow: isHovered ? 2 : 1,
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/20 transition-opacity duration-300">
                        <span className="bg-white/90 text-xs font-mono px-2 py-1 rounded shadow-sm transform scale-95 group-hover:scale-100 transition-transform duration-300">
                          #{color.hex_code}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5">
                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {scheme.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-2 py-0.5 bg-gray-100 text-xs font-medium text-gray-600 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>

                {/* Metadata and Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(scheme.id)}
                      className={`flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 transition-all duration-300 ${
                        likedPalettes.has(scheme.id)
                          ? "text-rose-600 bg-rose-50"
                          : "text-gray-500 hover:text-rose-500 bg-gray-50 hover:bg-rose-50"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={`transition-transform duration-300 ${
                          likedPalettes.has(scheme.id)
                            ? "fill-rose-500 scale-110"
                            : "scale-100 hover:scale-110"
                        }`}
                      />
                      <span>
                        {scheme.likes + (likedPalettes.has(scheme.id) ? 1 : 0)}
                      </span>
                    </button>

                    <span className="text-xs text-gray-400">
                      {formatDate(scheme.created_at)}
                    </span>
                  </div>

                  <button
                    className={`flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 transition-all duration-300 ${
                      copiedId === scheme.id
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                    onClick={() => handleCopyColors(scheme)}
                  >
                    {copiedId === scheme.id ? (
                      <>
                        <Check size={16} className="animate-bounce" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy
                          size={16}
                          className="transform transition-transform duration-300 group-hover:scale-110"
                        />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reference for intersection observer */}
      <div ref={listEndRef} className="h-4 mt-8"></div>

      {/* Login CTA */}
      {showLoginCTA && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn z-10">
          <div>
            <h3 className="font-bold text-lg">Want to see more palettes?</h3>
            <p className="text-indigo-100 text-sm">
              Sign in to access our full collection of color schemes
            </p>
          </div>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-50 transition-all duration-300 whitespace-nowrap">
            <LogIn size={18} />
            Sign in
          </button>
          <button
            className="absolute -top-2 -right-2 bg-indigo-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-indigo-900"
            onClick={() => setShowLoginCTA(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Pagination placeholder */}
      {/* {filteredSchemes.length > 0 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-400 transition-all duration-300">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium transition-all duration-300">
              1
            </button>
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:border-indigo-300 text-gray-600 transition-all duration-300">
              2
            </button>
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:border-indigo-300 text-gray-600 transition-all duration-300">
              3
            </button>
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:border-indigo-300 text-gray-600 transition-all duration-300">
              Next
            </button>
          </nav>
        </div>
      )} */}
    </div>
  );
}
