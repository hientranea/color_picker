"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);
  return (
    <header
      className={`fixed top-0 left-0 right-0 text-white shadow-md z-30 transition-all duration-300 ${
        scrolled ? "bg-gray-900" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/64.png"
            alt="ColorOne"
            width={48}
            height={48}
            className="mr-3 rounded-lg"
            unoptimized
          />
          <span className="text-xl font-bold">ColorOne</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a
                href="#features"
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="privacy-policy"
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
