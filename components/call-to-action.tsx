"use client";

import React from "react";
import { FaApple, FaDownload, FaArrowRight } from "react-icons/fa";

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Experience the easiest way to pick, organize, and name colors
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Join thousands of designers and developers who use ColorOne to
          streamline their creative workflow
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <a
            href="https://apps.apple.com/vn/app/colorone-canvas-creative/id6670270632?mt=12"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-purple-600 bg-white rounded-full overflow-hidden shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
          >
            <span className="relative flex items-center">
              <FaApple className="mr-2 text-2xl" />
              <span className="mr-2">Download Free</span>
              <FaDownload className="text-xl" />
            </span>
          </a>
          <a
            href="https://apps.apple.com/vn/app/colorone-canvas-creative/id6670270632?mt=12"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border-2 border-white rounded-full overflow-hidden transition-all duration-300 ease-out hover:bg-white/10"
          >
            <span className="relative flex items-center">
              <span className="mr-2">Unlock Premium Features</span>
              <FaArrowRight className="text-xl" />
            </span>
          </a>
        </div>

        <p className="text-white/80">
          Compatible with macOS 10.15 and later • Always free to start
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">Free</div>
            <div className="text-lg">Essential Color Tools</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-lg">Customer Support</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-lg">Satisfaction Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
