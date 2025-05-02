"use client";

import { useEffect } from "react";

export default function StructuredData() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== "undefined") {
      // Software Application Schema
      const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "ColorOne",
        applicationCategory: "DesignApplication",
        operatingSystem: "macOS",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Professional color picking and palette management for creative professionals. Extract colors from your screen, generate harmonious palettes, and organize your color collections with precision.",
        screenshot: "https://colorone.site/hero-tool.png",
        softwareVersion: "1.0",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "120",
        },
      };

      // Organization Schema
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ColorOne",
        url: "https://colorone.site",
        logo: "https://colorone.site/128.png",
        sameAs: [
          "https://twitter.com/colorone_app",
          "https://instagram.com/colorone_app",
        ],
      };

      // Add schema to head
      const script1 = document.createElement("script");
      script1.setAttribute("type", "application/ld+json");
      script1.textContent = JSON.stringify(softwareAppSchema);
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.setAttribute("type", "application/ld+json");
      script2.textContent = JSON.stringify(organizationSchema);
      document.head.appendChild(script2);

      return () => {
        // Clean up
        document.head.removeChild(script1);
        document.head.removeChild(script2);
      };
    }
  }, []);

  return null;
}
