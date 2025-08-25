import { createSupabaseServerClient } from "@/utils/supabase";
import { ColorPsychologyData } from "@/types/supabase";

export interface ColorInfo {
  slug: string;
  data: ColorPsychologyData;
}

// Convert color name to slug
export function colorNameToSlug(colorName: string): string {
  return colorName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
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

// Helper function to ensure array fields return empty arrays when null
function ensureArray(value: any): any[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing JSON string:", e);
      return [];
    }
  }

  return Array.isArray(value) ? value : [];
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
      emotional_associations: ensureArray(color.emotional_associations),
      complementary_colors: ensureArray(color.complementary_colors),
      suggested_palettes: ensureArray(color.suggested_palettes),
      industry_use_cases: ensureObject(color.industry_use_cases),
      real_world_examples: ensureArray(color.real_world_examples),
      how_to_pair: ensureArray(color.how_to_pair),
      seo_meta: ensureObject(color.seo_meta),
    },
  }));
}

// Get a specific color by slug
export async function getColorBySlug(slug: string): Promise<ColorInfo | null> {
  const supabase = createSupabaseServerClient();
  // Decode URL-encoded slug before converting to color name
  const decodedSlug = decodeURIComponent(slug);
  const colorName = slugToColorName(decodedSlug);

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
    emotional_associations: ensureArray(data.emotional_associations),
    complementary_colors: ensureArray(data.complementary_colors),
    suggested_palettes: ensureArray(data.suggested_palettes),
    industry_use_cases: ensureObject(data.industry_use_cases),
    real_world_examples: ensureArray(data.real_world_examples),
    how_to_pair: ensureArray(data.how_to_pair),
    seo_meta: ensureObject(data.seo_meta),
  };

  return {
    slug: decodedSlug,
    data: parsedData,
  };
}

// Get a list of all color slugs for static generation
export async function getAllColorSlugs(): Promise<string[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("color_psychology_data")
    .select("color_name");

  if (error) {
    console.error("Error fetching color names:", error);
    return [];
  }

  return data.map((color) => colorNameToSlug(color.color_name));
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
