import React from "react";
import { ColorData } from "../utils/colorData";

interface ColorStructuredDataProps {
  colorData: ColorData;
  url: string;
}

const ColorStructuredData: React.FC<ColorStructuredDataProps> = ({
  colorData,
  url,
}) => {
  // Create structured data for the color
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${colorData.color_name} Color`,
    description: colorData.psychological_meaning,
    url: url,
    brand: {
      "@type": "Brand",
      name: "Color Picker",
    },
    color: colorData.hex_code,
    keywords: [
      colorData.color_name,
      "color meaning",
      "color psychology",
      "color palette",
      "design",
      ...colorData.emotional_associations,
    ].join(","),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
      url: url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default ColorStructuredData;
