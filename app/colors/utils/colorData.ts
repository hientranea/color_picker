// app/colors/data.ts
import emeraldGreenData from "../fixtures/emerald-green.json";
import royalBlueData from "../fixtures/royal-blue.json";
import webOrangeData from "../fixtures/web-orange.json";

export interface ColorData {
  color_name: string;
  hex_code: string;
  wheel_position: string;
  psychological_meaning: string;
  emotional_associations: string[];
  complementary_colors: string[];
  suggested_palettes: {
    name: string;
    swatches: string[];
  }[];
  industry_use_cases: {
    [key: string]: string[];
  };
  real_world_examples: {
    title: string;
    description: string;
    image_url: string;
  }[];
  how_to_pair: string[];
  call_to_action: string;
  seo_meta: {
    title: string;
    description: string;
  };
}

export interface ColorInfo {
  slug: string;
  data: ColorData;
}

// Create a map of all colors
const colorMap: Record<string, ColorData> = {
  "emerald-green": emeraldGreenData as ColorData,
  "royal-blue": royalBlueData as ColorData,
  "web-orange": webOrangeData as ColorData,
};

// Get all available colors
export function getAllColors(): ColorInfo[] {
  return Object.entries(colorMap).map(([slug, data]) => ({
    slug,
    data,
  }));
}

// Get a specific color by slug
export function getColorBySlug(slug: string): ColorInfo | null {
  const data = colorMap[slug];
  return data ? { slug, data } : null;
}

// Get a list of all color slugs for static generation
export function getAllColorSlugs(): string[] {
  return Object.keys(colorMap);
}
