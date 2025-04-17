"use client";

import React from "react";

export default function FounderNote() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-purple-600 to-blue-500 p-8 text-white flex justify-center items-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm mx-auto flex items-center justify-center mb-4">
                  {/* This would be an actual photo in production */}
                  <svg
                    className="w-20 h-20 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Ian Tran</h3>
                <p className="text-white/80">Author of ColorOne</p>
              </div>
            </div>
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold mb-4">
                A Note from the Founder
              </h2>
              <div className="prose text-gray-700">
                <p className="mb-4">
                  As a designer and developer, I've always been frustrated with
                  the limitations of existing color picker tools. I found myself
                  switching between multiple applications to accomplish what
                  should be a simple task.
                </p>
                <p className="mb-4">
                  That's why I created ColorOne – to combine precision color
                  picking, intelligent palette management, and advanced color
                  tools in one seamless application. Every feature has been
                  carefully designed with the creative professional's workflow
                  in mind.
                </p>
                <p className="mb-4">
                  Whether you're designing a website, creating digital art, or
                  developing a brand identity, I believe ColorOne will become an
                  essential part of your toolkit. Our team is constantly working
                  to improve the app based on user feedback, and we have an
                  exciting roadmap of new features planned.
                </p>
                <p>
                  I hope you find ColorOne as useful as I do in your creative
                  journey. Feel free to reach out with any feedback or
                  suggestions – we're building this for you!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
