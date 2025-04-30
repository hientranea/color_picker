"use client";
import PalettesList from "./components/PalettesList";
import { useColorSchemes } from "./hooks/useColorSchemes";
import Header from "@/components/header";
import { Filter } from "lucide-react";

export default function PalettesPage() {
  const { data: colorSchemes, isLoading, error } = useColorSchemes();

  if (isLoading) {
    return (
      <div className="p-8">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 mt-[80px]">
          {/* Skeleton for header controls */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Skeleton palette grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, index) => (
              <SkeletonPaletteCard key={index} delay={index * 150} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-8">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 mt-[80px]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-red-800 mb-2">
              Error Loading Palettes
            </h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    );

  if (!colorSchemes)
    return (
      <div className="p-8">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 mt-[80px]">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Filter size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No palettes found
            </h3>
            <p className="text-gray-500">
              Try again later or create a new palette
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <Header />
      <PalettesList colorSchemes={colorSchemes} />
    </div>
  );
}

// Skeleton component for loading state that matches the actual palette card design
function SkeletonPaletteCard({ delay = 0 }) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Color Preview skeleton */}
      <div className="flex h-24 w-full">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse transition-all duration-300"
            style={{
              backgroundColor: `hsl(${(index * 60) % 360}, 70%, 85%)`,
              flexGrow: 1,
            }}
          />
        ))}
      </div>

      <div className="p-5">
        {/* Categories skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="px-2 py-0.5 bg-gray-100 rounded-full h-5 w-16 animate-pulse"
              style={{ animationDelay: `${delay + index * 100}ms` }}
            />
          ))}
        </div>

        {/* Metadata and Actions skeleton */}
        <div className="flex justify-between items-center">
          <div
            className="h-8 w-20 bg-gray-100 rounded-full animate-pulse"
            style={{ animationDelay: `${delay + 300}ms` }}
          ></div>
          <div
            className="h-8 w-24 bg-gray-100 rounded-full animate-pulse"
            style={{ animationDelay: `${delay + 400}ms` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
