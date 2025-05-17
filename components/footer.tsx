"use client";

import React from "react";
import Image from "next/image";
import { FaTwitter, FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Image
                  src="/64.png"
                  alt="ColorOne Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  loading="lazy"
                />
              </div>
              <span className="text-xl font-bold">ColorOne</span>
            </div>
            <p className="text-gray-400 mb-4">
              Professional color picking and palette management for creative
              professionals.
            </p>
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="ColorOne Features"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/colors"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Color Meanings and Psychology"
                >
                  Color Meanings
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="ColorOne Pricing Plans"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#download"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Download ColorOne App"
                >
                  Download
                </a>
              </li>
            </ul>
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0 m-auto">
            © {new Date().getFullYear()} ColorOne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
