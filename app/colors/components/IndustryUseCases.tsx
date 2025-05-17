import React from "react";
import { ColorData } from "../utils/colorData";

interface IndustryUseCasesProps {
  colorData: ColorData;
}

const IndustryUseCases: React.FC<IndustryUseCasesProps> = ({ colorData }) => {
  // Filter out industries with empty arrays
  const industries = Object.entries(colorData.industry_use_cases).filter(
    ([_, useCases]) => useCases.length > 0
  );

  if (industries.length === 0) {
    return null;
  }

  // Function to format industry name
  const formatIndustryName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" & ");
  };

  // Icons for different industries (using emoji as placeholders)
  const industryIcons: Record<string, string> = {
    tech_UI: "💻",
    food_beverage: "🍽️",
    wellness: "🧘",
    fashion: "👗",
    automotive: "🚗",
    finance: "💰",
    education: "📚",
    healthcare: "⚕️",
    entertainment: "🎬",
    sports: "🏆",
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Industry Applications</h2>
        <p className="text-gray-600 mb-10">
          How {colorData.color_name} is used across different industries
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map(([industry, useCases]) => (
            <div
              key={industry}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" role="img" aria-label={industry}>
                  {industryIcons[industry] || "🎨"}
                </span>
                <h3 className="text-xl font-semibold">
                  {formatIndustryName(industry)}
                </h3>
              </div>

              <ul className="space-y-2">
                {useCases.map((useCase, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: colorData.hex_code }}
                    ></span>
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryUseCases;
