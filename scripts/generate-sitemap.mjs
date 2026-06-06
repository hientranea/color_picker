#!/usr/bin/env node
// Generates public/sitemap.xml from the colors snapshot + an inline static-routes config.
// Runs as part of the `prebuild` npm lifecycle hook. Next static export copies
// public/ into out/, so this file lands at out/sitemap.xml at deploy time.

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://colorone.site").replace(/\/$/, "");
const SNAPSHOT_PATH = resolve(repoRoot, "app/colors/data/colors.snapshot.json");
const OUTPUT_PATH = resolve(repoRoot, "public/sitemap.xml");

const today = new Date().toISOString().slice(0, 10);
const snapshotMtime = statSync(SNAPSHOT_PATH).mtime.toISOString().slice(0, 10);

const staticRoutes = [
  {
    path: "/",
    changefreq: "weekly",
    priority: "1.0",
    images: [
      { loc: "/hero-tool.png", title: "ColorOne Professional Color Picker Tool Interface" },
      { loc: "/hero-advance-harmony.png", title: "ColorOne Color Harmony Generator" },
    ],
  },
  {
    path: "/palettes",
    changefreq: "daily",
    priority: "0.8",
    images: [{ loc: "/hero-advance-variations.png", title: "ColorOne Color Variation Tool" }],
  },
  { path: "/colors", changefreq: "weekly", priority: "0.7", images: [] },
  { path: "/privacy-policy", changefreq: "monthly", priority: "0.5", images: [] },
];

const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
const colorRoutes = snapshot.colors.map((c) => ({
  path: `/colors/${c.slug}`,
  changefreq: "monthly",
  priority: "0.6",
  images: [],
}));

function urlEntry(route, lastmod) {
  const loc = `${BASE_URL}${route.path === "/" ? "" : route.path}`;
  const imageBlocks = route.images
    .map(
      (img) =>
        `    <image:image>\n` +
        `      <image:loc>${BASE_URL}${img.loc}</image:loc>\n` +
        `      <image:title>${img.title}</image:title>\n` +
        `    </image:image>`
    )
    .join("\n");
  return (
    `  <url>\n` +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${route.changefreq}</changefreq>\n` +
    `    <priority>${route.priority}</priority>` +
    (imageBlocks ? `\n${imageBlocks}` : "") +
    `\n  </url>`
  );
}

const entries = [
  ...staticRoutes.map((r) => urlEntry(r, today)),
  ...colorRoutes.map((r) => urlEntry(r, snapshotMtime)),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  entries.join("\n") +
  `\n</urlset>\n`;

writeFileSync(OUTPUT_PATH, xml);
console.log(`✓ generate-sitemap: wrote ${entries.length} URLs to public/sitemap.xml`);
