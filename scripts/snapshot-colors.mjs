#!/usr/bin/env node
// scripts/snapshot-colors.mjs
//
// Fetches color_psychology_data rows from Supabase and writes:
//   - app/colors/data/colors.snapshot.json (full snapshot consumed at build)
//   - public/api/colors.json (list projection, static replacement for /api/colors)
//   - public/api/colors/<slug>.json (per-color, replacement for /api/colors/<slug>)
//
// Run as: node scripts/snapshot-colors.mjs
// Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
// Falls back to existing snapshot if env vars are missing and the snapshot file
// already exists (offline-friendly local builds).

import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const snapshotPath = path.join(rootDir, "app/colors/data/colors.snapshot.json");
const listPath = path.join(rootDir, "public/api/colors.json");
const perColorDir = path.join(rootDir, "public/api/colors");

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
      "[snapshot-colors] Missing Supabase env vars; reusing existing snapshot at",
      snapshotPath
    );
    process.exit(0);
  }
  console.error(
    "[snapshot-colors] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY, and no existing snapshot. Cannot proceed."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

function ensureObject(value) {
  if (value === null || value === undefined) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

function ensureArray(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

function colorNameToSlug(colorName) {
  return colorName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
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

  const colors = [];
  for (const row of data) {
    const slug = colorNameToSlug(row.color_name);
    if (!slug) {
      console.warn(
        `[snapshot-colors] Skipping row id=${row.id}: empty slug derived from color_name="${row.color_name}"`
      );
      continue;
    }
    colors.push({
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
  if (colors.length === 0) {
    console.error("[snapshot-colors] All rows had empty slugs. Aborting.");
    process.exit(1);
  }

  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(
    snapshotPath,
    JSON.stringify(
      { colors, generatedAt: new Date().toISOString() },
      null,
      2
    ) + "\n"
  );
  console.log(`[snapshot-colors] Wrote ${snapshotPath} (${colors.length} colors)`);

  await mkdir(path.dirname(listPath), { recursive: true });
  const listProjection = colors.map((c) => ({
    slug: c.slug,
    color_name: c.color_name,
    hex_code: c.hex_code,
    emotional_associations: c.emotional_associations,
  }));
  await writeFile(listPath, JSON.stringify(listProjection, null, 2) + "\n");
  console.log(`[snapshot-colors] Wrote ${listPath}`);

  await mkdir(perColorDir, { recursive: true });
  for (const color of colors) {
    const filePath = path.join(perColorDir, `${color.slug}.json`);
    await writeFile(filePath, JSON.stringify(color, null, 2) + "\n");
  }
  console.log(
    `[snapshot-colors] Wrote ${colors.length} per-color JSON files to ${perColorDir}/`
  );
}

main().catch((err) => {
  console.error("[snapshot-colors] Unhandled error:", err);
  process.exit(1);
});
