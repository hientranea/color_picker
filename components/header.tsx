"use client";

import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/color_picker/64.png"
            alt="ColorOne"
            width={48}
            height={48}
            className="mr-3 rounded-xl"
            unoptimized
          />
          <span className="text-xl font-bold">ColorOne</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#features" className="hover:text-gray-900">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-gray-900">
                Pricing
              </a>
            </li>
            <li>
              <a href="privacy-policy" className="hover:text-gray-900">
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://github.com/hientranea/colorpicker"
                className="hover:text-gray-900 flex"
              >
                <Image
                  src="/color_picker/icGithub.svg"
                  alt="Github"
                  width={25}
                  height={25}
                  unoptimized
                />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
