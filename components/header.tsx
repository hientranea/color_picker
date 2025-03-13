import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="w-12 h-12">
          <Image
            src="/color_picker/icApp.png"
            alt="Color Picker"
            width={60}
            height={60}
            unoptimized
          />
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#features" className="hover:text-gray-900">
                Features
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
