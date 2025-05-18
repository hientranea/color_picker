import Link from "next/link";
import { getAllColors } from "./utils/colorDataService";
import Header from "@/components/header";

export default async function ColorsIndexPage() {
  const allColors = await getAllColors();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-8 py-20">
        {/* Header section */}
        <div className="text-center mb-16 animate-fade-in pt-12">
          <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            Color Meanings Library
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive collection of colors and discover their
            psychological meanings, emotional associations, and how to use them
            effectively in your designs.
          </p>
        </div>

        {/* Search and filter section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center mb-8">
            <input
              type="text"
              placeholder="Search colors..."
              className="w-full py-3 px-5 rounded-full bg-white dark:bg-gray-800 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            />
            <button className="absolute right-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              All Colors
            </button>
            <button className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Warm
            </button>
            <button className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Cool
            </button>
            <button className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Neutral
            </button>
          </div>
        </div>

        {/* Color grid with CSS animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {allColors.map((color, index) => (
            <div
              key={color.slug}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link href={`/colors/${color.slug}`} className="block h-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-2 hover:scale-[1.02]">
                  <div
                    className="h-48 w-full relative group"
                    style={{ backgroundColor: color.data.hex_code }}
                  >
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-mono shadow-md">
                      {color.data.hex_code}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                      {color.data.color_name}
                    </h2>

                    <div className="mb-4">
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Emotional Associations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {color.data.emotional_associations.map(
                          (emotion, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-transform hover:scale-105 ${
                                idx < 3 ? "inline-flex" : "hidden"
                              }`}
                              style={{
                                backgroundColor: `${color.data.hex_code}22`,
                                color: color.data.hex_code,
                              }}
                            >
                              {emotion}_{idx}
                            </span>
                          )
                        )}
                        {color.data.emotional_associations.length > 3 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                            +{color.data.emotional_associations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end items-center">
                      <span className="inline-flex items-center text-blue-500 hover:text-blue-600 text-sm font-medium group">
                        View details
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination section */}
        <div className="mt-16 flex justify-center">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-500 text-sm font-medium text-white"
            >
              1
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              2
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              3
            </a>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
              ...
            </span>
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              8
            </a>
            <a
              href="#"
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>

      {/* Footer section */}
      <footer className="mt-20 bg-white dark:bg-gray-800 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Color Meanings Library. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
