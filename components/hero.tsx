import React from 'react';
import { FaApple, FaDownload } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="text-white py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Color Picker</h2>
        <p className="text-xl mb-8">Effortlessly Extract and Manage Colors from Any Screen</p>
        <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full overflow-hidden shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl">
          <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
          <span className="relative flex items-center">
            <FaApple className="mr-2 text-2xl" />
            <span className="mr-2">Download for macOS</span>
            <FaDownload className="text-xl" />
          </span>
        </button>
        <p className="mt-4 text-sm text-gray-300">
          Compatible with macOS 10.12 and later
        </p>
      </div>
    </section>
  );
}