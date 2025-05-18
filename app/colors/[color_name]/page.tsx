import { notFound } from "next/navigation";
import { getColorBySlug, getAllColorSlugs } from "../utils/colorDataService";

// Components
import ColorHeader from "../components/ColorHeader";
import ColorPalettes from "../components/ColorPalettes";
import IndustryUseCases from "../components/IndustryUseCases";
import RealWorldExamples from "../components/RealWorldExamples";
import HowToPair from "../components/HowToPair";
import ColorCTA from "../components/ColorCTA";
import ColorStructuredData from "../components/ColorStructuredData";

// Generate static paths for all colors at build time
export async function generateStaticParams() {
  const colorSlugs = await getAllColorSlugs();
  return colorSlugs.map((slug) => ({ color_name: slug }));
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

  // If color not found, return 404
  if (!colorInfo) {
    notFound();
  }

  const { data: colorData } = colorInfo;
  const pageUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://colorpicker.com"
  }/colors/${colorSlug}`;

  return (
    <main>
      {/* Add structured data for SEO */}
      <ColorStructuredData colorData={colorData} url={pageUrl} />

      {/* Color header section */}
      <ColorHeader colorData={colorData} />

      {/* Color palettes section */}
      <ColorPalettes colorData={colorData} />

      {/* Industry use cases section */}
      <IndustryUseCases colorData={colorData} />

      {/* Real-world examples section */}
      {/* <RealWorldExamples colorData={colorData} /> */}

      {/* How to pair section */}
      <HowToPair colorData={colorData} />

      {/* Call-to-action section */}
      <ColorCTA colorData={colorData} />

      {/* Related colors section - you can add this as an enhancement */}
    </main>
  );
}
