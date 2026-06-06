#!/usr/bin/env node
// Validates out/sitemap.xml after `next build`. Runs as postbuild.
// Asserts:
//   1. File exists and parses (minimal XML check).
//   2. URL count == staticRoutes + snapshot.colors.length.
//   3. Every <loc> starts with the configured base URL.
//   4. No duplicate <loc> values.
//   5. Every URL has a corresponding out/<path>.html.
//   6. out/robots.txt exists and references the sitemap URL.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://colorone.site").replace(/\/$/, "");
const SITEMAP_PATH = resolve(repoRoot, "out/sitemap.xml");
const ROBOTS_PATH = resolve(repoRoot, "out/robots.txt");
const OUT_DIR = resolve(repoRoot, "out");
const SNAPSHOT_PATH = resolve(repoRoot, "app/colors/data/colors.snapshot.json");

function fail(msg, hint) {
  console.error(`✗ validate-sitemap: ${msg}`);
  if (hint) console.error(`  hint: ${hint}`);
  process.exit(1);
}

// 1. File exists
if (!existsSync(SITEMAP_PATH)) {
  fail("out/sitemap.xml not found", "did the prebuild generator run? check pnpm run prebuild output");
}
const xml = readFileSync(SITEMAP_PATH, "utf8");
if (!xml.includes("<urlset") || !xml.includes("</urlset>")) {
  fail("out/sitemap.xml is malformed (no <urlset> root)");
}

// 2. URL count
const expectedColorCount = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")).colors.length;
const expectedStaticCount = 4;
const expected = expectedStaticCount + expectedColorCount;
// Parse at the <url> block level so we count each entry exactly once,
// regardless of whether image:loc children appear in the same block.
const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
const urlLocs = urlBlocks.map((m) => {
  const inner = m[1];
  const locMatch = inner.match(/<loc>([^<]+)<\/loc>/);
  return locMatch ? locMatch[1] : null;
});
if (urlLocs.includes(null)) fail("a <url> block is missing its <loc>");
if (urlLocs.length !== expected) {
  fail(
    `URL count mismatch: expected ${expected} (${expectedStaticCount} static + ${expectedColorCount} colors), got ${urlLocs.length}`,
    "did the snapshot or static-routes config change without regenerating the sitemap?"
  );
}

// 3. Base URL check
const badBase = urlLocs.find((u) => !u.startsWith(`${BASE_URL}/`) && u !== BASE_URL && u !== `${BASE_URL}/`);
if (badBase) {
  fail(`URL does not start with ${BASE_URL}: ${badBase}`, "check NEXT_PUBLIC_APP_URL in CI env");
}

// 4. Duplicates
const seen = new Set();
for (const u of urlLocs) {
  if (seen.has(u)) fail(`duplicate URL in sitemap: ${u}`);
  seen.add(u);
}

// 5. URL → file on disk
// This project uses Next.js static export WITHOUT trailingSlash:true, so pages
// are emitted as flat .html files: /colors/coral-red → out/colors/coral-red.html
// (not out/colors/coral-red/index.html).
const missing = [];
for (const u of urlLocs) {
  const path = u.slice(BASE_URL.length); // "/colors/coral-red" or "/"
  const filePath =
    path === "/" || path === ""
      ? resolve(OUT_DIR, "index.html")
      : resolve(OUT_DIR, `.${path}.html`);
  if (!existsSync(filePath)) missing.push(u);
}
if (missing.length) {
  fail(
    `${missing.length} URL(s) in sitemap have no corresponding HTML file:\n  ${missing.slice(0, 5).join("\n  ")}${
      missing.length > 5 ? `\n  ... and ${missing.length - 5} more` : ""
    }`,
    "the sitemap promised pages the static export did not produce — check generateStaticParams"
  );
}

// 6. robots.txt
if (!existsSync(ROBOTS_PATH)) fail("out/robots.txt not found");
const robots = readFileSync(ROBOTS_PATH, "utf8");
if (!/^Sitemap:\s+\S*sitemap\.xml\s*$/m.test(robots)) {
  fail('out/robots.txt missing a "Sitemap: ...sitemap.xml" directive');
}

console.log(`✓ sitemap.xml: ${urlLocs.length} URLs, all reachable`);
