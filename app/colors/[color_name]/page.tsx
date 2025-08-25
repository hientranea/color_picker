import { notFound } from "next/navigation";
import { getColorBySlug, getAllColorSlugs } from "../utils/colorDataService";

import ColorHeader from "../components/ColorHeader";
import ColorPalettes from "../components/ColorPalettes";
import IndustryUseCases from "../components/IndustryUseCases";
import RealWorldExamples from "../components/RealWorldExamples";
import HowToPair from "../components/HowToPair";
import ColorCTA from "../components/ColorCTA";
import ColorStructuredData from "../components/ColorStructuredData";
import ColorNavigation from "../components/ColorNavigation";
import RelatedColors from "../components/RelatedColors";

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600;

// Don't pre-generate all color pages at build time to avoid build timeouts
// Pages will be generated on-demand and cached with ISR
export async function generateStaticParams() {
  return [];
}

interface ColorPageProps {
  params: {
    color_name: string;
  };
}

// This is now a server component with async data fetching
export default async function ColorPage({ params }: ColorPageProps) {
  const colorSlug = params.color_name;
  const colorInfo = await getColorBySlug(colorSlug);
  const allColors = await getAllColorSlugs();

  // If color not found, return 404
  if (!colorInfo) {
    notFound();
  }

  // Ensure allColors is always an array
  const safeAllColors = Array.isArray(allColors) ? allColors : [];

  const { data: colorData } = colorInfo;
  const pageUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://colorpicker.com"
  }/colors/${colorSlug}`;

  return (
    <main className="relative">
      {/* Add structured data for SEO */}
      <ColorStructuredData colorData={colorData} url={pageUrl} />

      {/* Sticky color navigation */}
      <ColorNavigation
        currentColor={colorData}
        currentSlug={colorSlug}
        allColorSlugs={safeAllColors}
      />

      {/* Color header section with enhanced animations */}
      <section className="animate-fade-in">
        <ColorHeader colorData={colorData} />
      </section>

      {/* Color palettes section with scroll animations */}
      <section className="scroll-animation">
        <ColorPalettes colorData={colorData} />
      </section>

      {/* Industry use cases section */}
      <section className="scroll-animation">
        <IndustryUseCases colorData={colorData} />
      </section>

      {/* How to pair section with interactive elements */}
      <section className="scroll-animation">
        <HowToPair colorData={colorData} />
      </section>

      {/* Real world section */}
      <section className="scroll-animation">
        <RealWorldExamples colorData={colorData} />
      </section>

      {/* Related colors section */}
      <section className="scroll-animation">
        <RelatedColors
          currentColor={colorData}
          currentSlug={colorSlug}
          allColorSlugs={safeAllColors}
        />
      </section>

      {/* Call-to-action section with enhanced visuals */}
      <section className="scroll-animation">
        <ColorCTA colorData={colorData} />
      </section>
    </main>
  );
}
