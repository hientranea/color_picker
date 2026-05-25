import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getColorBySlug, getAllColorSlugs } from "../utils/colorDataService";
import {
  paramToSegment,
  Hue,
  Temperature,
} from "../utils/colorClassify";

import ColorHeader from "../components/ColorHeader";
import ColorPalettes from "../components/ColorPalettes";
import IndustryUseCases from "../components/IndustryUseCases";
import RealWorldExamples from "../components/RealWorldExamples";
import HowToPair from "../components/HowToPair";
import ColorCTA from "../components/ColorCTA";
import ColorStructuredData from "../components/ColorStructuredData";
import ColorNavigation from "../components/ColorNavigation";
import RelatedColors from "../components/RelatedColors";
import ColorsHub from "../components/ColorsHub";
import { ColorCardData } from "../components/ColorCard";
import categories from "../data/categories.json";
import hubIndex from "../data/hub-index.json";

export const dynamicParams = false;

interface CategoriesShape {
  temps: { value: string; count: number }[];
  combos: { hue: string; temp: string; count: number }[];
}

interface HubIndexShape {
  rows: {
    slug: string;
    name: string;
    hex: string;
    hue: Hue;
    temp: Temperature;
    emotions: string[];
  }[];
}

export function generateStaticParams() {
  const cats = categories as unknown as CategoriesShape;
  const segments: { segment: string }[] = [];
  for (const t of cats.temps) segments.push({ segment: t.value });
  for (const c of cats.combos) segments.push({ segment: `${c.hue}-${c.temp}` });
  for (const slug of getAllColorSlugs()) segments.push({ segment: slug });
  return segments;
}

const knownSlugs = new Set(getAllColorSlugs());

function sliceForHub(
  hue: Hue | undefined,
  temp: Temperature | undefined
): ColorCardData[] {
  const rows = (hubIndex as unknown as HubIndexShape).rows;
  return rows
    .filter((r) => (hue ? r.hue === hue : true))
    .filter((r) => (temp ? r.temp === temp : true))
    .map((r) => ({ slug: r.slug, name: r.name, hex: r.hex, emotions: r.emotions }));
}

function formatHue(h: Hue): string {
  return h.charAt(0).toUpperCase() + h.slice(1);
}
function formatTemp(t: Temperature): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: { segment: string };
}): Promise<Metadata> {
  const parsed = paramToSegment(params.segment, knownSlugs);
  if (!parsed) {
    return { title: "Not Found", description: "" };
  }
  if (parsed.kind === "temp") {
    const t = formatTemp(parsed.value);
    return {
      title: `${t} Colors — Meaning & Use | ColorOne`,
      description: `Browse ${t.toLowerCase()} colors with psychology, palettes, and pairings.`,
    };
  }
  if (parsed.kind === "combo") {
    const h = formatHue(parsed.hue);
    const t = formatTemp(parsed.temp);
    return {
      title: `${t} ${h} Colors — Meaning & Use | ColorOne`,
      description: `Browse ${t.toLowerCase()} ${h.toLowerCase()} colors with psychology, palettes, and pairings.`,
    };
  }
  // Slug branch — preserve existing detail metadata.
  const colorInfo = getColorBySlug(parsed.slug);
  if (!colorInfo) return { title: "Color Not Found", description: "" };
  const { data } = colorInfo;
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

export default function SegmentPage({ params }: { params: { segment: string } }) {
  const parsed = paramToSegment(params.segment, knownSlugs);
  if (!parsed) notFound();

  if (parsed.kind === "temp") {
    return (
      <ColorsHub
        initialTemp={parsed.value}
        serverRenderedCards={sliceForHub(undefined, parsed.value)}
      />
    );
  }
  if (parsed.kind === "combo") {
    return (
      <ColorsHub
        initialHue={parsed.hue}
        initialTemp={parsed.temp}
        serverRenderedCards={sliceForHub(parsed.hue, parsed.temp)}
      />
    );
  }

  // Slug branch — existing detail-page tree.
  const colorInfo = getColorBySlug(parsed.slug);
  if (!colorInfo) notFound();
  const { data: colorData } = colorInfo;
  const pageUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://colorone.site"
  }/colors/${parsed.slug}`;

  return (
    <main className="relative">
      <ColorStructuredData colorData={colorData} url={pageUrl} />
      <ColorNavigation
        currentColor={colorData}
        currentSlug={parsed.slug}
        prevSlug={colorData.prev_slug}
        nextSlug={colorData.next_slug}
      />
      <section className="animate-fade-in">
        <ColorHeader colorData={colorData} />
      </section>
      <section className="scroll-animation">
        <ColorPalettes colorData={colorData} />
      </section>
      <section className="scroll-animation">
        <IndustryUseCases colorData={colorData} />
      </section>
      <section className="scroll-animation">
        <HowToPair colorData={colorData} />
      </section>
      <section className="scroll-animation">
        <RealWorldExamples colorData={colorData} />
      </section>
      <section className="scroll-animation">
        <RelatedColors
          relatedSlugs={colorData.related}
          complementarySlugs={colorData.complementary_slugs}
        />
      </section>
      <section className="scroll-animation">
        <ColorCTA colorData={colorData} />
      </section>
    </main>
  );
}
