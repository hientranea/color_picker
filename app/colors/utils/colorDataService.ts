import { createSupabaseServerClient } from "@/utils/supabase";
import { ColorPsychologyData } from "@/types/supabase";

export interface ColorInfo {
  slug: string;
  data: ColorPsychologyData;
}

// Convert color name to slug
export function colorNameToSlug(colorName: string): string {
  return colorName.toLowerCase().replace(/\s+/g, "-");
}

// Convert slug to color name
export function slugToColorName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to ensure JSONB fields are properly parsed
function ensureObject(value: any): any {
  if (value === null || value === undefined) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("Error parsing JSON string:", e);
      return {};
    }
  }

  return value;
}

// Get all colors from Supabase
export async function getAllColors(): Promise<ColorInfo[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("color_psychology_data")
    .select("*");

  if (error) {
    console.error("Error fetching colors:", error);
    return [];
  }

  return data.map((color) => ({
    slug: colorNameToSlug(color.color_name),
    data: {
      ...color,
      suggested_palettes: ensureObject(color.suggested_palettes),
      industry_use_cases: ensureObject(color.industry_use_cases),
      real_world_examples: ensureObject(color.real_world_examples),
      downloadable_assets: ensureObject(color.downloadable_assets),
      seo_meta: ensureObject(color.seo_meta),
    },
  }));
}

// Get a specific color by slug
export async function getColorBySlug(slug: string): Promise<ColorInfo | null> {
  const supabase = createSupabaseServerClient();
  const colorName = slugToColorName(slug);

  const { data, error } = await supabase
    .from("color_psychology_data")
    .select("*")
    .eq("color_name", colorName)
    .single();

  if (error || !data) {
    console.error(`Error fetching color ${colorName}:`, error);
    return null;
  }

  // Parse JSONB fields to ensure they're proper JavaScript objects
  const parsedData = {
    ...data,
    suggested_palettes: ensureObject(data.suggested_palettes),
    industry_use_cases: ensureObject(data.industry_use_cases),
    real_world_examples: ensureObject(data.real_world_examples),
    downloadable_assets: ensureObject(data.downloadable_assets),
    seo_meta: ensureObject(data.seo_meta),
  };

  return {
    slug,
    data: parsedData,
  };
}

// Get a list of all color slugs for static generation
export async function getAllColorSlugs(): Promise<string[]> {
  const colors = await getAllColors();
  return colors.map((color) => color.slug);
}

// Get a list of all color names
export async function getAllColorNames(): Promise<string[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("color_psychology_data")
    .select("color_name");

  if (error) {
    console.error("Error fetching color names:", error);
    return [];
  }

  return data.map((color) => color.color_name);
}
