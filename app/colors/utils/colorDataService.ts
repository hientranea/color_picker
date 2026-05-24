import { ColorPsychologyData } from "@/types/supabase";
import snapshot from "@/app/colors/data/colors.snapshot.json";

export interface ColorListItem {
  slug: string;
  color_name: string;
  hex_code: string;
  emotional_associations: string[];
}

export interface ColorInfo {
  slug: string;
  data: ColorPsychologyData;
}

type SnapshotShape = {
  colors: ColorPsychologyData[];
  generatedAt: string;
};

const SNAPSHOT = snapshot as unknown as SnapshotShape;

export function colorNameToSlug(colorName: string): string {
  return colorName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToColorName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getAllColors(): ColorListItem[] {
  return SNAPSHOT.colors.map((color) => ({
    slug: color.slug,
    color_name: color.color_name,
    hex_code: color.hex_code,
    emotional_associations: color.emotional_associations,
  }));
}

export function getColorBySlug(slug: string): ColorInfo | null {
  const decodedSlug = decodeURIComponent(slug);
  const match = SNAPSHOT.colors.find((c) => c.slug === decodedSlug);
  if (!match) return null;
  return { slug: decodedSlug, data: match };
}

export function getAllColorSlugs(): string[] {
  return SNAPSHOT.colors.map((c) => c.slug);
}

export function getAllColorNames(): string[] {
  return SNAPSHOT.colors.map((c) => c.color_name);
}
