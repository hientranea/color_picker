import { notFound } from "next/navigation";
import { Metadata } from "next";
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

// Static export: pre-generate one HTML file per color from the build-time snapshot.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllColorSlugs().map((slug) => ({ color_name: slug }));
}

interface MetadataProps {
  params: {
    color_name: string;
  };
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const colorSlug = params.color_name;
  const colorInfo = await getColorBySlug(colorSlug);

  if (!colorInfo) {
    return {
      title: "Color Not Found",
      description: "The requested color information could not be found.",
    };
  }

  const { data } = colorInfo;

  // Generate keywords based on color data
  const keywords = [
    data.color_name,
    "color meaning",
    "color psychology",
    "color palette",
    "color hex code",
    "design",
    "web design",
    "color theory",
    ...data.emotional_associations,
  ];

  return {
    title: data.seo_meta.title,
    description: data.seo_meta.description,
    keywords: keywords.join(", "),
    openGraph: {
      title: data.seo_meta.title,
      description: data.seo_meta.description,
      images: [
        {
          url: "/hero-advance-harmony.png",
          width: 1200,
          height: 630,
          alt: `${data.color_name} color swatch`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.seo_meta.title,
      description: data.seo_meta.description,
      images: ["/hero-advance-harmony.png"],
    },
  };
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
    <main className="relative">
      {/* Add structured data for SEO */}
      <ColorStructuredData colorData={colorData} url={pageUrl} />

      {/* Sticky color navigation */}
      <ColorNavigation
        currentColor={colorData}
        currentSlug={colorSlug}
        prevSlug={colorData.prev_slug}
        nextSlug={colorData.next_slug}
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
          relatedSlugs={colorData.related}
          complementarySlugs={colorData.complementary_slugs}
        />
      </section>

      {/* Call-to-action section with enhanced visuals */}
      <section className="scroll-animation">
        <ColorCTA colorData={colorData} />
      </section>
    </main>
  );
}
