"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "";

  useEffect(() => {
    const initialScrollPosition = window.scrollY > 10;
    setScrolled(initialScrollPosition);

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
        scrolled || !isHomePage ? "bg-gray-900" : "bg-transparent"
      }`}
    >
      {/* Rest of your component remains the same */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" aria-label="ColorOne Home">
            <Image
              src="/64.png"
              alt="ColorOne Logo"
              width={48}
              height={48}
              className="mr-3 rounded-lg"
              priority
            />
          </Link>
          <Link href="/" className="text-xl font-bold" aria-label="ColorOne Home">
            <span itemProp="name">ColorOne</span>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link
                href={isHomePage ? "#features" : "/#features"}
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href={isHomePage ? "#palettes" : "/#palettes"}
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Palettes
              </Link>
            </li>
            <li>
              <Link
                href={isHomePage ? "#pricing" : "/#pricing"}
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href={isHomePage ? "#download" : "/#download"}
                className={`${
                  scrolled ? "hover:text-white-900" : "hover:text-gray-900"
                }`}
              >
                Download
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
