// scripts/snapshot-colors.ts
//
// Fetches color_psychology_data rows from Supabase and writes:
//   - app/colors/data/colors.snapshot.json (full snapshot consumed at build)
//   - app/colors/data/hub-index.json (hub discovery index)
//   - app/colors/data/categories.json (temp + combo counts)
//   - public/api/colors.json (list projection, static replacement for /api/colors)
//   - public/api/colors/<slug>.json (per-color, replacement for /api/colors/<slug>)
//   - public/sitemap.xml (regenerated with color detail + hub combo URLs)
//
// Run as: tsx scripts/snapshot-colors.ts
// Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
// Falls back to existing snapshot if env vars are missing and the snapshot file
// already exists (offline-friendly local builds).

import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { hexToHue, hexToTemperature, hexToHSL } from "../app/colors/utils/colorClassify";
import type { Hue, Temperature } from "../app/colors/utils/colorClassify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const snapshotPath = path.join(rootDir, "app/colors/data/colors.snapshot.json");
const listPath = path.join(rootDir, "public/api/colors.json");
const perColorDir = path.join(rootDir, "public/api/colors");
const hubIndexPath = path.join(rootDir, "app/colors/data/hub-index.json");
const categoriesPath = path.join(rootDir, "app/colors/data/categories.json");
const sitemapPath = path.join(rootDir, "public/sitemap.xml");

export function colorNameToSlug(colorName: string): string {
  return colorName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureObject(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function ensureArray<T = unknown>(value: unknown): T[] {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? (value as T[]) : [];
}

// ---------------------------------------------------------------------------
// Enrichment types
// ---------------------------------------------------------------------------

interface RawColor {
  id: string;
  color_name: string;
  hex_code: string;
  complementary_colors: string[];
  emotional_associations?: string[];
  slug?: string;
  suggested_palettes?: { name: string; swatches: string[] }[];
  industry_use_cases?: { [key: string]: string[] };
  real_world_examples?: { title: string; description: string; image_url: string }[];
  how_to_pair?: string[];
  seo_meta?: { title: string; description: string };
  [k: string]: unknown;
}

interface EnrichedColor extends RawColor {
  slug: string;
  hue: Hue;
  temperature: Temperature;
  related: string[];
  complementary_slugs: string[];
  prev_slug: string | null;
  next_slug: string | null;
}

// ---------------------------------------------------------------------------
// Enrichment helpers
// ---------------------------------------------------------------------------

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace(/^#/, "");
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16),
  };
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

function rgbDistance(a: string, b: string): number {
  const ra = hexToRGB(a);
  const rb = hexToRGB(b);
  return Math.sqrt(
    Math.pow(ra.r - rb.r, 2) + Math.pow(ra.g - rb.g, 2) + Math.pow(ra.b - rb.b, 2)
  );
}

const RGB_THRESHOLD = 100;
const MAX_COMPLEMENTARY = 3;
const RELATED_COUNT = 3;

export function resolveComplementarySlugs(
  hexValues: string[],
  allColors: { slug: string; hex_code: string }[]
): string[] {
  const out: string[] = [];
  for (const hex of hexValues) {
    let bestSlug: string | null = null;
    let bestDistance = Infinity;
    for (const c of allColors) {
      const d = rgbDistance(hex, c.hex_code);
      if (d < bestDistance) {
        bestDistance = d;
        bestSlug = c.slug;
      }
    }
    if (bestSlug !== null && bestDistance <= RGB_THRESHOLD && !out.includes(bestSlug)) {
      out.push(bestSlug);
      if (out.length >= MAX_COMPLEMENTARY) break;
    }
  }
  return out;
}

export function computeRelated(
  current: { slug: string; hex_code: string },
  allColors: { slug: string; hex_code: string }[],
  excludeSlugs: ReadonlySet<string>
): string[] {
  const currentHue = hexToHSL(current.hex_code).h;
  const candidates = allColors
    .filter((c) => c.slug !== current.slug && !excludeSlugs.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      distance: hueDistance(currentHue, hexToHSL(c.hex_code).h),
    }))
    .sort((a, b) => a.distance - b.distance || a.slug.localeCompare(b.slug));
  return candidates.slice(0, RELATED_COUNT).map((c) => c.slug);
}

export function computeAlphabeticalNeighbors(
  colors: { slug: string; color_name: string }[]
): Map<string, { prev_slug: string | null; next_slug: string | null }> {
  const collator = new Intl.Collator("en", { sensitivity: "base" });
  const sorted = [...colors].sort((a, b) => collator.compare(a.color_name, b.color_name));
  const out = new Map<string, { prev_slug: string | null; next_slug: string | null }>();
  for (let i = 0; i < sorted.length; i++) {
    out.set(sorted[i].slug, {
      prev_slug: i > 0 ? sorted[i - 1].slug : null,
      next_slug: i < sorted.length - 1 ? sorted[i + 1].slug : null,
    });
  }
  return out;
}

export function enrichColors(rawColors: RawColor[]): EnrichedColor[] {
  const withBasics = rawColors.map((row) => ({
    ...row,
    slug: row.slug ?? colorNameToSlug(row.color_name),
    hue: hexToHue(row.hex_code),
    temperature: hexToTemperature(row.hex_code),
  }));

  const lookup = withBasics.map((c) => ({ slug: c.slug, hex_code: c.hex_code }));
  const withComplementary = withBasics.map((c) => ({
    ...c,
    complementary_slugs: resolveComplementarySlugs(c.complementary_colors, lookup),
  }));

  const withRelated = withComplementary.map((c) => ({
    ...c,
    related: computeRelated(
      c,
      lookup,
      new Set([c.slug, ...c.complementary_slugs])
    ),
  }));

  const neighbors = computeAlphabeticalNeighbors(withRelated);
  const enriched: EnrichedColor[] = withRelated.map((c) => ({
    ...c,
    prev_slug: neighbors.get(c.slug)!.prev_slug,
    next_slug: neighbors.get(c.slug)!.next_slug,
  }));

  let nullPrev = 0;
  let nullNext = 0;
  for (const c of enriched) {
    if (c.related.length < RELATED_COUNT) {
      throw new Error(`[snapshot] ${c.slug}: related.length=${c.related.length} < ${RELATED_COUNT}`);
    }
    if (c.prev_slug === null) nullPrev++;
    if (c.next_slug === null) nullNext++;
  }
  if (nullPrev !== 1 || nullNext !== 1) {
    throw new Error(
      `[snapshot] expected exactly 1 null prev_slug and 1 null next_slug; got prev=${nullPrev}, next=${nullNext}`
    );
  }

  return enriched;
}

// ---------------------------------------------------------------------------
// Core processing pipeline
// ---------------------------------------------------------------------------

async function processColors(rawColors: RawColor[]): Promise<void> {
  console.log(`[snapshot-colors] Enriching ${rawColors.length} colors...`);
  const colors = enrichColors(rawColors);

  // Snapshot
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, JSON.stringify({ colors }, null, 2) + "\n");
  console.log(`[snapshot-colors] Wrote ${snapshotPath} (${colors.length} colors)`);

  // List projection
  await mkdir(path.dirname(listPath), { recursive: true });
  const listProjection = colors.map((c) => ({
    slug: c.slug,
    color_name: c.color_name,
    hex_code: c.hex_code,
    emotional_associations: c.emotional_associations,
  }));
  await writeFile(listPath, JSON.stringify(listProjection, null, 2) + "\n");
  console.log(`[snapshot-colors] Wrote ${listPath}`);

  // Per-color JSON files
  await mkdir(perColorDir, { recursive: true });
  for (const color of colors) {
    const filePath = path.join(perColorDir, `${color.slug}.json`);
    await writeFile(filePath, JSON.stringify(color, null, 2) + "\n");
  }
  console.log(
    `[snapshot-colors] Wrote ${colors.length} per-color JSON files to ${perColorDir}/`
  );

  // hub-index.json
  const hubIndex = {
    rows: colors.map((c) => ({
      slug: c.slug,
      name: c.color_name,
      hex: c.hex_code,
      hue: c.hue,
      temp: c.temperature,
      emotions: c.emotional_associations,
    })),
  };
  await writeFile(hubIndexPath, JSON.stringify(hubIndex, null, 2) + "\n");
  console.log(`[snapshot-colors] Wrote ${hubIndexPath} (${hubIndex.rows.length} rows)`);

  // categories.json
  const tempCounts = new Map<string, number>();
  const comboCounts = new Map<string, number>();
  for (const c of colors) {
    tempCounts.set(c.temperature, (tempCounts.get(c.temperature) ?? 0) + 1);
    const comboKey = `${c.hue}-${c.temperature}`;
    comboCounts.set(comboKey, (comboCounts.get(comboKey) ?? 0) + 1);
  }
  const categories = {
    temps: Array.from(tempCounts.entries()).map(([value, count]) => ({ value, count })),
    combos: Array.from(comboCounts.entries()).map(([key, count]) => {
      const [hue, temp] = key.split("-");
      return { hue, temp, count };
    }),
  };
  if (categories.temps.some((t) => t.count === 0) || categories.combos.some((c) => c.count === 0)) {
    throw new Error("[snapshot-colors] categories.json contains a zero-count entry");
  }
  await writeFile(categoriesPath, JSON.stringify(categories, null, 2) + "\n");
  console.log(
    `[snapshot-colors] Wrote ${categoriesPath} (${categories.temps.length} temps, ${categories.combos.length} combos)`
  );

  // sitemap.xml
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://colorone.site";
  const sitemapEntries: string[] = [
    `  <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${siteUrl}/palettes</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    `  <url><loc>${siteUrl}/colors</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  ];
  for (const t of categories.temps) {
    sitemapEntries.push(
      `  <url><loc>${siteUrl}/colors/${t.value}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    );
  }
  for (const c of categories.combos) {
    sitemapEntries.push(
      `  <url><loc>${siteUrl}/colors/${c.hue}-${c.temp}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    );
  }
  for (const c of colors) {
    sitemapEntries.push(
      `  <url><loc>${siteUrl}/colors/${c.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`
    );
  }
  sitemapEntries.push(
    `  <url><loc>${siteUrl}/privacy-policy</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`
  );
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`;
  await writeFile(sitemapPath, sitemapXml);
  console.log(`[snapshot-colors] Wrote ${sitemapPath} (${sitemapEntries.length} URLs)`);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  // Load .env.local for local runs (CI passes env directly via secrets).
  const envPath = path.join(rootDir, ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
      }
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (existsSync(snapshotPath)) {
      console.warn(
        "[snapshot-colors] Missing Supabase env vars; enriching existing snapshot at",
        snapshotPath
      );
      const existing = JSON.parse(readFileSync(snapshotPath, "utf-8")) as { colors: RawColor[] };
      await processColors(existing.colors);
      return;
    }
    console.error(
      "[snapshot-colors] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY, and no existing snapshot. Cannot proceed."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  console.log("[snapshot-colors] Fetching color_psychology_data from Supabase...");
  const { data, error } = await supabase
    .from("color_psychology_data")
    .select("*");

  if (error) {
    console.error("[snapshot-colors] Supabase fetch error:", error);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.error("[snapshot-colors] No rows returned. Aborting.");
    process.exit(1);
  }

  const rawColors: RawColor[] = [];
  for (const row of data) {
    const slug = colorNameToSlug(row.color_name);
    if (!slug) {
      console.warn(
        `[snapshot-colors] Skipping row id=${row.id}: empty slug derived from color_name="${row.color_name}"`
      );
      continue;
    }
    rawColors.push({
      ...row,
      slug,
      emotional_associations: ensureArray(row.emotional_associations),
      complementary_colors: ensureArray(row.complementary_colors),
      suggested_palettes: ensureArray(row.suggested_palettes),
      industry_use_cases: ensureObject(row.industry_use_cases),
      real_world_examples: ensureArray(row.real_world_examples),
      how_to_pair: ensureArray(row.how_to_pair),
      seo_meta: ensureObject(row.seo_meta),
    });
  }
  if (rawColors.length === 0) {
    console.error("[snapshot-colors] All rows had empty slugs. Aborting.");
    process.exit(1);
  }

  await processColors(rawColors);
}

const isMain =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === realpathSync(path.resolve(process.argv[1]));
if (isMain) {
  main().catch((err) => {
    console.error("[snapshot-colors] Unhandled error:", err);
    process.exit(1);
  });
}
