"use client";

import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

interface Feature {
  included: boolean;
  text: string;
}

const PricingFeature = ({ included, text }: Feature) => {
  return (
    <div className="flex items-center mb-3">
      {included ? (
        <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <FaTimes className="text-gray-400 mr-2 flex-shrink-0" />
      )}
      <span className={included ? "text-gray-800" : "text-gray-500"}>
        {text}
      </span>
    </div>
  );
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Start free and upgrade when you need more power
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-transform duration-300 hover:transform hover:scale-105 z-10">
            <div className="p-8 bg-gray-50 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-center">Free</h3>
              <div className="mt-4 text-center">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-600 ml-1">/forever</span>
              </div>
              <p className="mt-4 text-center text-gray-600">
                Essential color picking tools for everyday use
              </p>
            </div>
            <div className="p-8">
              <PricingFeature included={true} text="Basic color picker tool" />
              <PricingFeature
                included={true}
                text="HEX, RGB, and HSL formats"
              />
              <PricingFeature
                included={true}
                text="Save up to 5 color palettes"
              />
              <PricingFeature
                included={true}
                text="Basic color harmony generation"
              />
              <PricingFeature included={true} text="Recent colors history" />
              {/* <PricingFeature
                included={false}
                text="AI-assisted palette generation"
              /> */}
              <PricingFeature included={false} text="Cloud synchronization" />
              <PricingFeature included={false} text="Advanced color tools" />
              <PricingFeature included={false} text="Image color extraction" />
              <PricingFeature included={false} text="Priority support" />

              <button className="mt-8 w-full py-3 px-6 text-white font-bold bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-300">
                Download Now - Free
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-purple-500 transform scale-105 z-10">
            <div className="p-8 bg-purple-50 border-b border-purple-100 relative">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-[1.5rem] pt-[2.7rem] pb-2 transform translate-y-2 rotate-45 origin-bottom-right">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-center">Premium</h3>
              <div className="mt-4 text-center">
                <span className="text-5xl font-bold">$2.99</span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
              <p className="mt-4 text-center text-gray-600">
                Professional color tools for serious designers
              </p>
            </div>
            <div className="p-8">
              <PricingFeature included={true} text="Everything in Free plan" />
              <PricingFeature included={true} text="Unlimited color palettes" />
              <PricingFeature
                included={true}
                text="Cloud synchronization across devices"
              />
              <PricingFeature
                included={true}
                text="Advanced color harmony tools"
              />
              <PricingFeature included={true} text="Image color extraction" />
              <PricingFeature
                included={true}
                text="Accessibility contrast checking"
              />
              <PricingFeature included={true} text="Color name suggestions" />
              <PricingFeature
                included={true}
                text="Export in multiple formats"
              />
              <PricingFeature included={true} text="Priority support" />
              {/* <PricingFeature
                included={true}
                text="AI-assisted palette generation"
              /> */}
              <button className="mt-8 w-full py-3 px-6 text-white font-bold bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-colors duration-300 shadow-md">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-8">
          Start with the free version and upgrade anytime.
        </p>
      </div>
    </section>
  );
}
