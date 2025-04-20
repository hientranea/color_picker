"use client";

import React from "react";
import { FaApple, FaDownload } from "react-icons/fa";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="text-white py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <div className="flex items-center mb-6">
            <Image
              src="/color_picker/128.png"
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
        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20 backdrop-blur-sm"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center p-6 bg-black/40 rounded-lg backdrop-blur-md">
              <Image
                src="/color_picker/256.png"
                alt="ColorOne App"
                width={120}
                height={120}
                className="mx-auto mb-4 rounded-3xl"
                unoptimized
              />
              <h3 className="text-2xl font-bold mb-4">App Interface Demo</h3>
              <p className="mb-4">
                See ColorOne in action with our precision eyedropper tool
              </p>
              <div className="inline-block border-2 border-white/50 rounded-lg p-2">
                <svg className="w-64 h-64" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient
                      id="colorWheel"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FF0000" />
                      <stop offset="16.67%" stopColor="#FF00FF" />
                      <stop offset="33.33%" stopColor="#0000FF" />
                      <stop offset="50%" stopColor="#00FFFF" />
                      <stop offset="66.67%" stopColor="#00FF00" />
                      <stop offset="83.33%" stopColor="#FFFF00" />
                      <stop offset="100%" stopColor="#FF0000" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="url(#colorWheel)" />
                  <circle
                    cx="100"
                    cy="100"
                    r="30"
                    fill="white"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2="150"
                    y2="150"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <circle cx="150" cy="150" r="10" fill="#333" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
