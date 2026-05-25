# /colors Hub Discovery + Cross-Color Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire functional search, filter, and pagination on the `/colors` hub via pre-rendered combination URLs, and replace random RelatedColors + snapshot-order prev/next with precomputed alphabetical neighbors and hue-distance / complementary-slug related lists.

**Architecture:** One unified Next.js dynamic route `app/colors/[segment]/page.tsx` handles three URL shapes (combo hub, temperature hub, color detail) via a precedence resolver. The `/colors` root mounts the same `<ColorsHub>` client component used by every hub-style route. Build-time enrichment in `scripts/snapshot-colors.ts` (converted from `.mjs`) precomputes hue, temperature, related neighbors, complementary slug resolution, and alphabetical prev/next. Pure classification logic lives in `app/colors/utils/colorClassify.ts` and is shared between Node script (via `tsx`) and runtime TS without duplication. Tests use Vitest scoped to pure utilities and enrichment fixtures only.

**Tech Stack:** Next.js 14 (App Router, static export), React 18, TypeScript, Tailwind, Vitest, tsx, Supabase (build-time snapshot only). Reference spec: `docs/superpowers/specs/2026-05-25-colors-hub-discovery-design.md`.

---

## Task 1: Add Vitest + tsx, convert snapshot script to TypeScript

**Goal:** Install test infrastructure (Vitest) and TypeScript runner (`tsx`), then convert `scripts/snapshot-colors.mjs` → `scripts/snapshot-colors.ts` with no behavior change. This establishes the single-source-of-truth path so `colorClassify.ts` can be imported by both the build script and the runtime.

**Files:**
- Modify: `package.json` — add devDependencies `vitest`, `@vitest/coverage-v8`, `tsx`. Add scripts `test`, `test:watch`. Update `snapshot:colors` to `tsx scripts/snapshot-colors.ts`.
- Create: `vitest.config.ts` — minimal config; root-relative test discovery.
- Modify (rename): `scripts/snapshot-colors.mjs` → `scripts/snapshot-colors.ts`. Behavior-preserving rewrite (add type annotations where required by strict TS; keep all I/O, env handling, fallback logic identical).
- Create: `scripts/snapshot-colors.smoke.test.ts` — single sanity test that imports the script's helper functions (extract `colorNameToSlug`, `ensureObject`, `ensureArray` into the script's export surface for testability) and asserts they behave as before.

**Acceptance Criteria:**
- [ ] `pnpm install` succeeds with the new devDeps present.
- [ ] `pnpm test` exits 0 with the smoke test passing.
- [ ] `pnpm snapshot:colors` (run locally with existing `.env.local` OR by relying on the offline-fallback branch) produces a non-empty `app/colors/data/colors.snapshot.json` identical in content (byte-for-byte or row-count-equivalent) to the version committed on `main`.
- [ ] `pnpm build` still exits 0 — no regression in the existing static export.

**Verify:** `pnpm install && pnpm test && pnpm build` → all exit 0; `colors.snapshot.json` row count matches the pre-conversion version.

**Steps:**

- [ ] **Step 1: Install new devDependencies**

```bash
pnpm add -D vitest @vitest/coverage-v8 tsx
```

Expected: `package.json` shows the three packages under `devDependencies`; `pnpm-lock.yaml` updated.

- [ ] **Step 2: Add `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "out", "dist"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3: Update `package.json` scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "snapshot:colors": "tsx scripts/snapshot-colors.ts",
    "prebuild": "pnpm run snapshot:colors"
  }
}
```

- [ ] **Step 4: Rename and convert the snapshot script**

```bash
git mv scripts/snapshot-colors.mjs scripts/snapshot-colors.ts
```

Edit `scripts/snapshot-colors.ts` to be a behavior-preserving TypeScript port. Add `// @ts-nocheck` for v1 if the script's row shapes resist quick typing — we'll tighten types in Task 3 when we enrich them. Export the helper functions for testing:

```ts
// At the top of the file, after imports:
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
```

Wrap the `main()` invocation so it only runs when the script is executed directly, not when imported by tests:

```ts
import { fileURLToPath as _fileURLToPath } from "node:url";
const isMain =
  process.argv[1] && _fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    console.error("[snapshot-colors] Unhandled error:", err);
    process.exit(1);
  });
}
```

- [ ] **Step 5: Write the smoke test**

```ts
// scripts/snapshot-colors.smoke.test.ts
import { describe, expect, it } from "vitest";
import { colorNameToSlug, ensureArray, ensureObject } from "./snapshot-colors";

describe("snapshot-colors helpers", () => {
  it("colorNameToSlug lowercases, hyphenates, strips punctuation", () => {
    expect(colorNameToSlug("Coral Red")).toBe("coral-red");
    expect(colorNameToSlug("  Spaces  ")).toBe("spaces");
    expect(colorNameToSlug("Royal/Blue!")).toBe("royalblue");
  });

  it("ensureArray accepts arrays, JSON strings, and falls back to []", () => {
    expect(ensureArray<string>(["a"])).toEqual(["a"]);
    expect(ensureArray<string>('["a","b"]')).toEqual(["a", "b"]);
    expect(ensureArray<string>(null)).toEqual([]);
    expect(ensureArray<string>("not-json")).toEqual([]);
  });

  it("ensureObject accepts objects, JSON strings, and falls back to {}", () => {
    expect(ensureObject({ a: 1 })).toEqual({ a: 1 });
    expect(ensureObject('{"a":1}')).toEqual({ a: 1 });
    expect(ensureObject(null)).toEqual({});
    expect(ensureObject('["a"]')).toEqual({}); // array is not an object
  });
});
```

- [ ] **Step 6: Verify the test runs**

```bash
pnpm test
```

Expected: 3 tests pass; exit 0.

- [ ] **Step 7: Verify the build still works**

```bash
pnpm build
```

Expected: exit 0; `out/colors/<some-slug>/index.html` exists.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts scripts/snapshot-colors.ts scripts/snapshot-colors.smoke.test.ts
git commit -m "chore(colors): add vitest + tsx; port snapshot script to TS"
```

---

## Task 2: Implement `colorClassify.ts` with full test coverage

**Goal:** Pure functions for hue band, temperature, combo segment encode/decode. This is the foundational unit consumed by both the snapshot script (Task 3) and the runtime hub (Tasks 6–8).

**Files:**
- Create: `app/colors/utils/colorClassify.ts`
- Create: `app/colors/utils/colorClassify.test.ts`

**Acceptance Criteria:**
- [ ] All four functions exported: `hexToHue`, `hexToTemperature`, `comboToParam`, `paramToSegment`.
- [ ] `hexToHue` returns exactly one of the 10 hue strings (`red | orange | yellow | green | teal | blue | purple | pink | brown | gray`) for any valid hex input.
- [ ] `hexToTemperature` returns exactly one of (`warm | cool | neutral`) for any valid hex input.
- [ ] `paramToSegment` precedence: temp → combo → slug → null, with strict hue-first combo ordering (`red-warm` parses; `warm-red` does not).
- [ ] Vitest test suite covers ≥ 30 hex inputs spread across every hue band, every temperature bucket, plus boundary cases (saturation right at 12%, lightness right at 8%, hue at 0/360 wraparound).
- [ ] `pnpm test` exits 0.

**Verify:** `pnpm test app/colors/utils/colorClassify.test.ts` → all tests pass.

**Steps:**

- [ ] **Step 1: Write the failing tests first**

```ts
// app/colors/utils/colorClassify.test.ts
import { describe, expect, it } from "vitest";
import {
  hexToHue,
  hexToTemperature,
  comboToParam,
  paramToSegment,
  Hue,
  Temperature,
} from "./colorClassify";

describe("hexToHue", () => {
  // One sample per hue band; add boundary cases below.
  const cases: Array<[string, Hue]> = [
    ["#FF0000", "red"],
    ["#FF5733", "red"], // Coral Red — at hue ~11
    ["#FFA500", "orange"],
    ["#FFFF00", "yellow"],
    ["#00FF00", "green"],
    ["#50C878", "green"], // Emerald
    ["#008080", "teal"],
    ["#0000FF", "blue"],
    ["#4169E1", "blue"], // Royal Blue
    ["#800080", "purple"],
    ["#FFC0CB", "pink"],
    ["#A52A2A", "brown"], // sat ~59, light ~40, hue 0 — qualifies via brown rule
    ["#808080", "gray"], // pure gray
    ["#FFFFFF", "gray"], // sat 0
    ["#000000", "gray"], // light 0
    ["#1A1A1A", "gray"], // light < 8%
  ];
  it.each(cases)("classifies %s as %s", (hex, expected) => {
    expect(hexToHue(hex)).toBe(expected);
  });

  it("handles hue wraparound at 360°", () => {
    // hue exactly 360 should land in red (0–15)
    expect(hexToHue("#FF0001")).toBe("red");
  });

  it("respects the brown override before orange", () => {
    // dark, low-saturation orange-ish red → brown
    expect(hexToHue("#5C2E0B")).toBe("brown");
  });

  it("treats low-saturation colors as gray regardless of hue", () => {
    expect(hexToHue("#888899")).toBe("gray"); // ~10% sat
  });
});

describe("hexToTemperature", () => {
  const cases: Array<[string, Temperature]> = [
    ["#FF0000", "warm"],
    ["#FF5733", "warm"],
    ["#FFA500", "warm"],
    ["#FFFF00", "warm"],
    ["#00FF00", "neutral"], // green is neutral by our rule
    ["#008080", "cool"],
    ["#0000FF", "cool"],
    ["#800080", "neutral"], // purple at 300 → neutral band
    ["#FF00FF", "neutral"], // magenta at 300 → neutral
    ["#FFC0CB", "warm"], // pink at hue 350 → warm
    ["#808080", "neutral"],
    ["#FFFFFF", "neutral"],
    ["#000000", "neutral"],
  ];
  it.each(cases)("classifies %s as %s", (hex, expected) => {
    expect(hexToTemperature(hex)).toBe(expected);
  });
});

describe("comboToParam", () => {
  it("emits canonical hue-temp combo", () => {
    expect(comboToParam({ hue: "red", temp: "warm" })).toBe("red-warm");
  });
  it("emits temp only when hue is undefined", () => {
    expect(comboToParam({ temp: "warm" })).toBe("warm");
  });
  it("returns empty string when both undefined (caller decides)", () => {
    expect(comboToParam({})).toBe("");
  });
});

describe("paramToSegment", () => {
  const slugs = new Set(["coral-red", "blue", "royal-blue", "teal"]);

  it("recognizes temperature-only segments", () => {
    expect(paramToSegment("warm", slugs)).toEqual({ kind: "temp", value: "warm" });
    expect(paramToSegment("cool", slugs)).toEqual({ kind: "temp", value: "cool" });
    expect(paramToSegment("neutral", slugs)).toEqual({ kind: "temp", value: "neutral" });
  });

  it("recognizes combo segments in canonical order", () => {
    expect(paramToSegment("red-warm", slugs)).toEqual({
      kind: "combo",
      hue: "red",
      temp: "warm",
    });
  });

  it("does NOT recognize reversed combos", () => {
    // 'warm-red' is not a combo (hue must come first); fall through to slug, then null
    expect(paramToSegment("warm-red", slugs)).toBeNull();
  });

  it("recognizes color slugs not shadowed by combos", () => {
    expect(paramToSegment("coral-red", slugs)).toEqual({ kind: "slug", slug: "coral-red" });
    expect(paramToSegment("royal-blue", slugs)).toEqual({ kind: "slug", slug: "royal-blue" });
  });

  it("combo wins precedence over slug if both could match", () => {
    // Hypothetical: a slug "red-warm" would be shadowed by the combo URL.
    const collidingSlugs = new Set(["red-warm"]);
    expect(paramToSegment("red-warm", collidingSlugs)).toEqual({
      kind: "combo",
      hue: "red",
      temp: "warm",
    });
  });

  it("returns null for unknown segments", () => {
    expect(paramToSegment("nonsense", slugs)).toBeNull();
    expect(paramToSegment("", slugs)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails because the module doesn't exist**

```bash
pnpm test app/colors/utils/colorClassify.test.ts
```

Expected: FAIL with import resolution error.

- [ ] **Step 3: Implement `colorClassify.ts`**

```ts
// app/colors/utils/colorClassify.ts

export type Hue =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"
  | "brown"
  | "gray";

export type Temperature = "warm" | "cool" | "neutral";

export const HUES: readonly Hue[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
  "brown",
  "gray",
] as const;

export const TEMPERATURES: readonly Temperature[] = ["warm", "cool", "neutral"] as const;

const HUE_SET: ReadonlySet<string> = new Set(HUES);
const TEMP_SET: ReadonlySet<string> = new Set(TEMPERATURES);

interface HSL {
  h: number; // 0..360
  s: number; // 0..1
  l: number; // 0..1
}

export function hexToHSL(hex: string): HSL {
  const cleaned = hex.replace(/^#/, "");
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return { h, s, l };
}

export function hexToHue(hex: string): Hue {
  const { h, s, l } = hexToHSL(hex);

  // Rule 1: very dark → gray (covers black-adjacent colors).
  if (l < 0.08) return "gray";
  // Rule 2: low saturation → gray (covers grays, whites, beiges).
  if (s < 0.12) return "gray";
  // Rule 3: brown carve-out for warm dark low-chroma.
  const inWarmRedOrange = (h >= 0 && h <= 30) || (h >= 330 && h <= 360);
  if (inWarmRedOrange && l < 0.4 && s < 0.6) return "brown";

  // Rule 4: hue band assignment.
  if (h >= 345 || h < 15) return "red";
  if (h < 45) return "orange";
  if (h < 65) return "yellow";
  if (h < 165) return "green";
  if (h < 195) return "teal";
  if (h < 250) return "blue";
  if (h < 290) return "purple";
  if (h < 345) return "pink";
  // Unreachable, but satisfies the compiler.
  return "red";
}

export function hexToTemperature(hex: string): Temperature {
  const { h, s } = hexToHSL(hex);
  if (s < 0.12) return "neutral";
  if ((h >= 0 && h <= 80) || (h >= 310 && h <= 360)) return "warm";
  if (h >= 170 && h <= 270) return "cool";
  return "neutral";
}

export function comboToParam(opts: { hue?: Hue; temp?: Temperature }): string {
  if (opts.hue && opts.temp) return `${opts.hue}-${opts.temp}`;
  if (opts.temp) return opts.temp;
  return "";
}

export type ParsedSegment =
  | { kind: "temp"; value: Temperature }
  | { kind: "combo"; hue: Hue; temp: Temperature }
  | { kind: "slug"; slug: string };

export function paramToSegment(
  segment: string,
  knownSlugs: ReadonlySet<string>
): ParsedSegment | null {
  if (!segment) return null;

  // 1. Temperature-only segment.
  if (TEMP_SET.has(segment)) {
    return { kind: "temp", value: segment as Temperature };
  }

  // 2. Combo segment (strict hue-first).
  if (segment.includes("-")) {
    const dashIndex = segment.indexOf("-");
    const firstToken = segment.substring(0, dashIndex);
    const secondToken = segment.substring(dashIndex + 1);
    if (HUE_SET.has(firstToken) && TEMP_SET.has(secondToken)) {
      return {
        kind: "combo",
        hue: firstToken as Hue,
        temp: secondToken as Temperature,
      };
    }
  }

  // 3. Color slug.
  if (knownSlugs.has(segment)) {
    return { kind: "slug", slug: segment };
  }

  // 4. Unknown.
  return null;
}
```

- [ ] **Step 4: Run the test — confirm it passes**

```bash
pnpm test app/colors/utils/colorClassify.test.ts
```

Expected: all `describe` blocks pass; exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/colors/utils/colorClassify.ts app/colors/utils/colorClassify.test.ts
git commit -m "feat(colors): add colorClassify pure utils + tests"
```

---

## Task 3: Extend snapshot script with enrichment + new outputs

**Goal:** Augment every snapshot row with `hue`, `temperature`, `related[]`, `complementary_slugs[]`, `prev_slug`, `next_slug`. Write the two new build outputs (`hub-index.json`, `categories.json`). Regenerate `public/sitemap.xml` to include color detail URLs and hub combo URLs. Update the TypeScript type definition. Drop the per-color `public/api/colors/<slug>.json` writes? No — keep them, they're still used by the legacy URL shape (per the prior spec). Just append enrichment fields to each.

**Files:**
- Modify: `types/supabase.ts` — extend `ColorPsychologyData` with the six new fields.
- Modify: `scripts/snapshot-colors.ts` — perform enrichment; write `hub-index.json` and `categories.json` next to the snapshot; regenerate `public/sitemap.xml`.
- Create: `scripts/snapshot-colors.enrichment.test.ts` — fixture of 8 hand-picked colors → expected enrichment output.

**Acceptance Criteria:**
- [ ] `pnpm snapshot:colors` writes `app/colors/data/colors.snapshot.json` where every row has `hue`, `temperature`, `related` (length ≥ 3), `complementary_slugs` (length 0–3), `prev_slug`, `next_slug`.
- [ ] `app/colors/data/hub-index.json` exists and contains `{ rows: [{slug, name, hex, hue, temp, emotions}, ...] }`.
- [ ] `app/colors/data/categories.json` exists and contains `{ temps: [{value, count}, ...], combos: [{hue, temp, count}, ...] }` with no zero-count entries.
- [ ] Build asserts exactly one row has `prev_slug === null` and exactly one has `next_slug === null` (the alphabetical first and last).
- [ ] `public/sitemap.xml` includes one `<url>` entry per color slug under `/colors/<slug>` and one per hub combo URL.
- [ ] Enrichment test passes with hand-checked expectations.
- [ ] `pnpm test` exits 0; `pnpm build` exits 0.

**Verify:** `pnpm snapshot:colors && pnpm test && pnpm build` → all exit 0; spot-check that `hub-index.json` row count matches snapshot row count.

**Steps:**

- [ ] **Step 1: Extend the type**

```ts
// types/supabase.ts (add to the existing ColorPsychologyData interface)
import type { Hue, Temperature } from "@/app/colors/utils/colorClassify";

export interface ColorPsychologyData {
  // ... existing fields unchanged ...

  // Enrichment fields (computed at build time).
  hue: Hue;
  temperature: Temperature;
  related: string[]; // slugs, length >= 3
  complementary_slugs: string[]; // slugs, length 0..3
  prev_slug: string | null;
  next_slug: string | null;
}
```

(If keeping `ColorPsychologyData` aligned with the raw Supabase shape feels uncomfortable, instead create `EnrichedColor extends ColorPsychologyData` with the six new fields and use it in the snapshot type.)

- [ ] **Step 2: Write the enrichment test against a fixture**

```ts
// scripts/snapshot-colors.enrichment.test.ts
import { describe, expect, it } from "vitest";
import { enrichColors, computeRelated, resolveComplementarySlugs, computeAlphabeticalNeighbors } from "./snapshot-colors";

const FIXTURE = [
  { id: "1", color_name: "Coral Red",  hex_code: "#FF5733", complementary_colors: ["#33BBFF"] },
  { id: "2", color_name: "Tomato",     hex_code: "#FF6347", complementary_colors: ["#47B5FF"] },
  { id: "3", color_name: "Sky Blue",   hex_code: "#87CEEB", complementary_colors: ["#FF5733"] },
  { id: "4", color_name: "Royal Blue", hex_code: "#4169E1", complementary_colors: ["#E14169"] },
  { id: "5", color_name: "Emerald",    hex_code: "#50C878", complementary_colors: ["#C85050"] },
  { id: "6", color_name: "Forest",     hex_code: "#228B22", complementary_colors: ["#8B228B"] },
  { id: "7", color_name: "Lemon",      hex_code: "#FFF44F", complementary_colors: ["#4F8AFF"] },
  { id: "8", color_name: "Black",      hex_code: "#000000", complementary_colors: ["#FFFFFF"] },
];

describe("enrichColors", () => {
  it("attaches hue and temperature to every row", () => {
    const enriched = enrichColors(FIXTURE);
    expect(enriched.find((c) => c.color_name === "Coral Red")?.hue).toBe("red");
    expect(enriched.find((c) => c.color_name === "Sky Blue")?.hue).toBe("blue");
    expect(enriched.find((c) => c.color_name === "Emerald")?.hue).toBe("green");
    expect(enriched.find((c) => c.color_name === "Black")?.hue).toBe("gray");
    expect(enriched.find((c) => c.color_name === "Coral Red")?.temperature).toBe("warm");
    expect(enriched.find((c) => c.color_name === "Sky Blue")?.temperature).toBe("cool");
  });

  it("computeRelated returns the 3 hue-nearest slugs, excluding self and complementary", () => {
    // Coral Red (hue ~11) — nearest among the fixture are Tomato (hue ~9) and Lemon (hue ~57).
    const enriched = enrichColors(FIXTURE);
    const coral = enriched.find((c) => c.color_name === "Coral Red")!;
    expect(coral.related).toHaveLength(3);
    expect(coral.related[0]).toBe("tomato"); // closest
  });

  it("resolveComplementarySlugs matches by RGB distance with threshold", () => {
    // Coral Red's complementary is #33BBFF — Sky Blue (#87CEEB) is the closest fixture color.
    const enriched = enrichColors(FIXTURE);
    const coral = enriched.find((c) => c.color_name === "Coral Red")!;
    expect(coral.complementary_slugs).toContain("sky-blue");
  });

  it("computes alphabetical prev/next with null only at the boundaries", () => {
    const enriched = enrichColors(FIXTURE);
    // Alphabetical: Black, Coral Red, Emerald, Forest, Lemon, Royal Blue, Sky Blue, Tomato
    const black = enriched.find((c) => c.color_name === "Black")!;
    const tomato = enriched.find((c) => c.color_name === "Tomato")!;
    expect(black.prev_slug).toBeNull();
    expect(black.next_slug).toBe("coral-red");
    expect(tomato.prev_slug).toBe("sky-blue");
    expect(tomato.next_slug).toBeNull();
    // Every other row has both set.
    for (const c of enriched) {
      if (c !== black && c !== tomato) {
        expect(c.prev_slug).not.toBeNull();
        expect(c.next_slug).not.toBeNull();
      }
    }
  });
});
```

- [ ] **Step 3: Run the failing test**

```bash
pnpm test scripts/snapshot-colors.enrichment.test.ts
```

Expected: FAIL — functions don't exist yet.

- [ ] **Step 4: Implement the enrichment functions in `scripts/snapshot-colors.ts`**

Add the following exports above `main()`:

```ts
import { hexToHue, hexToTemperature, hexToHSL, Hue, Temperature } from "../app/colors/utils/colorClassify";

interface RawColor {
  id: string;
  color_name: string;
  hex_code: string;
  complementary_colors: string[];
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

const RGB_THRESHOLD = 60;
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
  // First pass: derive slug + hue + temperature.
  const withBasics = rawColors.map((row) => ({
    ...row,
    slug: colorNameToSlug(row.color_name),
    hue: hexToHue(row.hex_code),
    temperature: hexToTemperature(row.hex_code),
  }));

  // Second pass: complementary first (so related can exclude them).
  const lookup = withBasics.map((c) => ({ slug: c.slug, hex_code: c.hex_code }));
  const withComplementary = withBasics.map((c) => ({
    ...c,
    complementary_slugs: resolveComplementarySlugs(c.complementary_colors, lookup),
  }));

  // Third pass: related (excluding complementary).
  const withRelated = withComplementary.map((c) => ({
    ...c,
    related: computeRelated(
      c,
      lookup,
      new Set([c.slug, ...c.complementary_slugs])
    ),
  }));

  // Fourth pass: alphabetical neighbors.
  const neighbors = computeAlphabeticalNeighbors(withRelated);
  const enriched: EnrichedColor[] = withRelated.map((c) => ({
    ...c,
    prev_slug: neighbors.get(c.slug)!.prev_slug,
    next_slug: neighbors.get(c.slug)!.next_slug,
  }));

  // Assertions.
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
```

- [ ] **Step 5: Wire enrichment into `main()` and write the new outputs**

Replace the existing `colors.push(...)` loop with a call to `enrichColors`, then add the new writes:

```ts
// After fetching `data` from Supabase, before the existing write:
const rawColors: RawColor[] = [];
for (const row of data) {
  const slug = colorNameToSlug(row.color_name);
  if (!slug) {
    console.warn(`[snapshot-colors] Skipping row id=${row.id}: empty slug`);
    continue;
  }
  rawColors.push({
    ...row,
    slug,
    emotional_associations: ensureArray<string>(row.emotional_associations),
    complementary_colors: ensureArray<string>(row.complementary_colors),
    suggested_palettes: ensureArray(row.suggested_palettes),
    industry_use_cases: ensureObject(row.industry_use_cases),
    real_world_examples: ensureArray(row.real_world_examples),
    how_to_pair: ensureArray<string>(row.how_to_pair),
    seo_meta: ensureObject(row.seo_meta),
  });
}

const colors = enrichColors(rawColors);

// Existing writes (snapshot, list, per-color JSON) unchanged.

// New: hub-index.json
const hubIndexPath = path.join(rootDir, "app/colors/data/hub-index.json");
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

// New: categories.json
const tempCounts = new Map<string, number>();
const comboCounts = new Map<string, number>();
for (const c of colors) {
  tempCounts.set(c.temperature, (tempCounts.get(c.temperature) ?? 0) + 1);
  const comboKey = `${c.hue}-${c.temperature}`;
  comboCounts.set(comboKey, (comboCounts.get(comboKey) ?? 0) + 1);
}
const categoriesPath = path.join(rootDir, "app/colors/data/categories.json");
const categories = {
  temps: Array.from(tempCounts.entries()).map(([value, count]) => ({ value, count })),
  combos: Array.from(comboCounts.entries()).map(([key, count]) => {
    const [hue, temp] = key.split("-");
    return { hue, temp, count };
  }),
};
// Assertion: no zero counts.
if (categories.temps.some((t) => t.count === 0) || categories.combos.some((c) => c.count === 0)) {
  throw new Error("[snapshot-colors] categories.json contains a zero-count entry");
}
await writeFile(categoriesPath, JSON.stringify(categories, null, 2) + "\n");
console.log(
  `[snapshot-colors] Wrote ${categoriesPath} (${categories.temps.length} temps, ${categories.combos.length} combos)`
);

// New: sitemap regeneration.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://colorone.site";
const today = new Date().toISOString().slice(0, 10);
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
const sitemapPath = path.join(rootDir, "public/sitemap.xml");
await writeFile(sitemapPath, sitemapXml);
console.log(`[snapshot-colors] Wrote ${sitemapPath} (${sitemapEntries.length} URLs)`);
```

- [ ] **Step 6: Run the test — confirm it passes**

```bash
pnpm test scripts/snapshot-colors.enrichment.test.ts
```

Expected: all 4 `it` blocks pass.

- [ ] **Step 7: Regenerate the snapshot end-to-end**

```bash
pnpm snapshot:colors
```

Expected: 1000 colors written; hub-index.json and categories.json appear under `app/colors/data/`; sitemap.xml replaced.

- [ ] **Step 8: Spot-check the outputs**

```bash
# Confirm enrichment present
grep -m 1 '"hue":' app/colors/data/colors.snapshot.json
grep -m 1 '"prev_slug":' app/colors/data/colors.snapshot.json

# Confirm hub-index shape
head -c 500 app/colors/data/hub-index.json

# Confirm categories shape
head -c 500 app/colors/data/categories.json
```

Expected: all greps succeed; JSON files parse.

- [ ] **Step 9: Commit**

```bash
git add types/supabase.ts scripts/snapshot-colors.ts scripts/snapshot-colors.enrichment.test.ts app/colors/data/colors.snapshot.json app/colors/data/hub-index.json app/colors/data/categories.json public/sitemap.xml
git commit -m "feat(colors): enrich snapshot with hue/temp/related/neighbors + new build outputs"
```

---

## Task 4: Modify `RelatedColors.tsx` to use precomputed fields

**Goal:** Replace the random shuffle and broken global-CSS-vars block with rendering directly from the color's `related[]` and `complementary_slugs[]` arrays. Each swatch's background uses its actual hex looked up from the snapshot.

**Files:**
- Modify: `app/colors/components/RelatedColors.tsx`
- Modify: `app/colors/utils/colorDataService.ts` — add `getColorSummariesBySlugs(slugs)` helper.

**Acceptance Criteria:**
- [ ] `RelatedColors` accepts `relatedSlugs: string[]` and `complementarySlugs: string[]` props instead of `allColorSlugs`.
- [ ] Renders up to 3 related + up to 3 complementary swatches with real hex backgrounds (no `var(--color-...)`).
- [ ] No reference to `Math.random()`, no `<style jsx global>` block.
- [ ] If `complementarySlugs.length === 0`, only the 3 related swatches show with no empty placeholder.
- [ ] Manual check in `pnpm dev` on `/colors/coral-red`: 3 swatches under "Similar" + up to 3 under "Complementary", every swatch visibly colored.

**Verify:** `pnpm build && grep -L 'Math.random' app/colors/components/RelatedColors.tsx` succeeds (i.e., file does not contain `Math.random`).

**Steps:**

- [ ] **Step 1: Add the lookup helper**

```ts
// app/colors/utils/colorDataService.ts (append)

export interface ColorSummary {
  slug: string;
  color_name: string;
  hex_code: string;
}

export function getColorSummariesBySlugs(slugs: string[]): ColorSummary[] {
  const out: ColorSummary[] = [];
  for (const slug of slugs) {
    const match = SNAPSHOT.colors.find((c) => c.slug === slug);
    if (match) {
      out.push({
        slug: match.slug,
        color_name: match.color_name,
        hex_code: match.hex_code,
      });
    }
  }
  return out;
}
```

- [ ] **Step 2: Rewrite `RelatedColors.tsx`**

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { getColorSummariesBySlugs, ColorSummary } from "../utils/colorDataService";

interface RelatedColorsProps {
  relatedSlugs: string[];
  complementarySlugs: string[];
}

function Swatch({ summary }: { summary: ColorSummary }) {
  return (
    <Link href={`/colors/${summary.slug}`} className="group">
      <div className="flex flex-col items-center transition-all duration-300 transform hover:scale-105">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 shadow-md transition-all duration-300 group-hover:shadow-lg"
          style={{ backgroundColor: summary.hex_code }}
        />
        <span className="text-sm font-medium text-center transition-colors duration-300 group-hover:text-indigo-600">
          {summary.color_name}
        </span>
      </div>
    </Link>
  );
}

const RelatedColors: React.FC<RelatedColorsProps> = ({ relatedSlugs, complementarySlugs }) => {
  const related = getColorSummariesBySlugs(relatedSlugs);
  const complementary = getColorSummariesBySlugs(complementarySlugs);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Explore More Colors</h2>
        <p className="text-gray-600 mb-10">
          Discover other colors that might inspire your next design
        </p>

        {related.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Similar</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((s) => (
                <Swatch key={s.slug} summary={s} />
              ))}
            </div>
          </div>
        )}

        {complementary.length > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Complementary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {complementary.map((s) => (
                <Swatch key={s.slug} summary={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedColors;
```

- [ ] **Step 3: Verify the build**

```bash
pnpm build
```

Expected: exit 0; no TypeScript errors.

- [ ] **Step 4: Manual dev check (do not skip)**

```bash
pnpm dev
```

Navigate to `http://localhost:3000/colors/coral-red`. Confirm:
- "Similar" section shows 3 swatches with real colors.
- "Complementary" section either shows up to 3 swatches OR is entirely absent (no empty placeholder).
- No console errors about `var(--color-...)` undefined.

- [ ] **Step 5: Commit**

```bash
git add app/colors/components/RelatedColors.tsx app/colors/utils/colorDataService.ts
git commit -m "feat(colors): RelatedColors uses precomputed slugs + drops random/broken CSS-vars"
```

---

## Task 5: Modify `ColorNavigation.tsx` to use precomputed prev/next

**Goal:** Replace the `Array.indexOf` walking logic with direct `prev_slug` / `next_slug` props. Disable buttons cleanly when either is null.

**Files:**
- Modify: `app/colors/components/ColorNavigation.tsx`

**Acceptance Criteria:**
- [ ] Component prop signature changes from `{currentColor, currentSlug, allColorSlugs}` to `{currentColor, currentSlug, prevSlug, nextSlug}`.
- [ ] Prev/next buttons disable when their corresponding slug prop is null.
- [ ] No internal `useState`/`useEffect` recomputation of neighbors — neighbors arrive as props.
- [ ] Sticky-on-scroll behavior unchanged.
- [ ] Manual check in `pnpm dev`: navigating to the alphabetically-first color shows Prev disabled; navigating to a middle color shows both buttons enabled.

**Verify:** `pnpm build` exits 0; `grep -L 'indexOf' app/colors/components/ColorNavigation.tsx` succeeds.

**Steps:**

- [ ] **Step 1: Rewrite the component**

```tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ColorData } from "../utils/colorData";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";

interface ColorNavigationProps {
  currentColor: ColorData;
  currentSlug: string;
  prevSlug: string | null;
  nextSlug: string | null;
}

const ColorNavigation: React.FC<ColorNavigationProps> = ({
  currentColor,
  currentSlug,
  prevSlug,
  nextSlug,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatSlug = (slug: string) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const copyHexCode = () => {
    navigator.clipboard.writeText(currentColor.hex_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full z-10 transition-all duration-300 ${
        isSticky ? "fixed top-0 bg-white shadow-md py-3" : "relative bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full transition-transform duration-300 hover:scale-110"
              style={{ backgroundColor: currentColor.hex_code }}
            />
            <h2
              className={`font-semibold transition-all duration-300 ${
                isSticky ? "text-lg" : "text-xl"
              }`}
            >
              {currentColor.color_name}
            </h2>
            <button
              onClick={copyHexCode}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                copied
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>{currentColor.hex_code}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {prevSlug ? (
              <Link
                href={`/colors/${prevSlug}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-all duration-300"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">{formatSlug(prevSlug)}</span>
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-sm cursor-not-allowed opacity-50"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}

            {nextSlug ? (
              <Link
                href={`/colors/${nextSlug}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-all duration-300"
              >
                <span className="hidden sm:inline">{formatSlug(nextSlug)}</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-sm cursor-not-allowed opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorNavigation;
```

- [ ] **Step 2: Verify build still passes (route component update in Task 7 will fix the prop wiring)**

The detail-page route currently passes `allColorSlugs` — TypeScript will now error. That's expected; Task 7 fixes the call site. To keep the build green after this task in isolation, **also patch the existing detail page** to pass the new props from the snapshot row:

```tsx
// app/colors/[color_name]/page.tsx — within ColorPage:
<ColorNavigation
  currentColor={colorData}
  currentSlug={colorSlug}
  prevSlug={colorData.prev_slug}
  nextSlug={colorData.next_slug}
/>
```

Also update the `<RelatedColors>` call:

```tsx
<RelatedColors
  relatedSlugs={colorData.related}
  complementarySlugs={colorData.complementary_slugs}
/>
```

Remove the now-unused `allColors` / `safeAllColors` variable.

- [ ] **Step 3: Verify**

```bash
pnpm build
```

Expected: exit 0; no TypeScript errors.

- [ ] **Step 4: Manual dev check**

```bash
pnpm dev
```

Navigate to `/colors/black` (alphabetically first if "Black" is in the snapshot — adjust to whatever shows first via `head -c 200 app/colors/data/hub-index.json`). Confirm Prev is disabled. Then navigate to `/colors/coral-red`. Confirm both Prev and Next are enabled and clicking either navigates correctly.

- [ ] **Step 5: Commit**

```bash
git add app/colors/components/ColorNavigation.tsx app/colors/[color_name]/page.tsx
git commit -m "feat(colors): ColorNavigation reads prev/next from precomputed snapshot fields"
```

---

## Task 6: Implement `ColorsHub.tsx` client component

**Goal:** The unified hub component that owns search input, chip filters, grid render, and URL sync. Used by `/colors`, `/colors/<temp>`, and `/colors/<hue>-<temp>` routes.

**Files:**
- Create: `app/colors/components/ColorsHub.tsx`
- Create: `app/colors/components/ColorCard.tsx` — extract the card rendering used today inside the `/colors/page.tsx` map into a reusable component (shared between server-render and client-render paths).

**Acceptance Criteria:**
- [ ] Component accepts `{initialHue?, initialTemp?, serverRenderedSlugs}` props.
- [ ] First render shows the server-rendered slugs (no JS-driven layout shift on first paint).
- [ ] After first interaction (chip toggle or keystroke), dynamic-imports `hub-index.json` and renders from the full filtered set.
- [ ] Filter chips for hue (10 chips) and temperature (3 chips). Active chips visually distinct.
- [ ] Chip clicks update URL via `router.push` to the canonical combo URL (or `/colors` when chips clear to empty).
- [ ] Hue-only state stays on the current URL (per spec — no canonical URL).
- [ ] Search box debounced at 120 ms; OR-matches name (case-insensitive substring), emotions (case-insensitive substring), and hex prefix (when query strips to 1–6 hex chars).
- [ ] Empty results: shows "No colors match" with a "Clear search" action. When filters are active and count < 5, also shows "Search across all colors" link that clears chips.
- [ ] Manual check: typing "ff5" with no filters → Coral Red appears. Clicking `warm` chip on `/colors` → URL changes to `/colors/warm`, grid narrows. Clicking `red` chip → URL changes to `/colors/red-warm`. Clicking `red` again → URL becomes `/colors/warm`. Clicking `warm` again → URL becomes `/colors`.

**Verify:** `pnpm build` exits 0; manual walk above succeeds in `pnpm dev`.

**Steps:**

- [ ] **Step 1: Extract `ColorCard.tsx` from the existing `/colors/page.tsx`**

```tsx
// app/colors/components/ColorCard.tsx
import Link from "next/link";

export interface ColorCardData {
  slug: string;
  name: string;
  hex: string;
  emotions: string[];
}

interface ColorCardProps {
  color: ColorCardData;
  index?: number;
}

export default function ColorCard({ color, index = 0 }: ColorCardProps) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <Link href={`/colors/${color.slug}`} className="block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-2 hover:scale-[1.02]">
          <div className="h-48 w-full relative group" style={{ backgroundColor: color.hex }}>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-mono shadow-md">
              {color.hex}
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">{color.name}</h2>
            <div className="mb-4">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Emotional Associations
              </h3>
              <div className="flex flex-wrap gap-2">
                {color.emotions.slice(0, 3).map((emotion, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm font-medium transition-transform hover:scale-105 inline-flex"
                    style={{ backgroundColor: `${color.hex}22`, color: color.hex }}
                  >
                    {emotion}
                  </span>
                ))}
                {color.emotions.length > 3 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                    +{color.emotions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Implement `ColorsHub.tsx`**

```tsx
// app/colors/components/ColorsHub.tsx
"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ColorCard, { ColorCardData } from "./ColorCard";
import { HUES, TEMPERATURES, Hue, Temperature, comboToParam } from "../utils/colorClassify";

interface ColorsHubProps {
  initialHue?: Hue;
  initialTemp?: Temperature;
  serverRenderedCards: ColorCardData[];
}

interface HubRow {
  slug: string;
  name: string;
  hex: string;
  hue: Hue;
  temp: Temperature;
  emotions: string[];
}

let cachedIndex: HubRow[] | null = null;
async function loadHubIndex(): Promise<HubRow[]> {
  if (cachedIndex) return cachedIndex;
  const mod = await import("@/app/colors/data/hub-index.json");
  cachedIndex = (mod as unknown as { rows: HubRow[] }).rows ?? [];
  return cachedIndex;
}

const HEX_RE = /^[0-9a-f]{1,6}$/i;

function matchesQuery(row: HubRow, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (row.name.toLowerCase().includes(q)) return true;
  for (const e of row.emotions) {
    if (e.toLowerCase().includes(q)) return true;
  }
  const stripped = query.replace(/^#/, "");
  if (HEX_RE.test(stripped)) {
    if (row.hex.toLowerCase().startsWith("#" + stripped.toLowerCase())) return true;
  }
  return false;
}

export default function ColorsHub({
  initialHue,
  initialTemp,
  serverRenderedCards,
}: ColorsHubProps) {
  const router = useRouter();
  const [hue, setHue] = useState<Hue | undefined>(initialHue);
  const [temp, setTemp] = useState<Temperature | undefined>(initialTemp);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hubIndex, setHubIndex] = useState<HubRow[] | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [, startTransition] = useTransition();

  // Debounce the search query.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 120);
    return () => clearTimeout(id);
  }, [query]);

  // Lazy-load hub-index.json on first interaction.
  useEffect(() => {
    if (!hasInteracted) return;
    if (hubIndex !== null) return;
    let cancelled = false;
    loadHubIndex().then((rows) => {
      if (!cancelled) setHubIndex(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [hasInteracted, hubIndex]);

  // Sync URL when hue+temp changes (only when temp is set; hue-only stays on current URL).
  const pushUrl = (nextHue: Hue | undefined, nextTemp: Temperature | undefined) => {
    const param = comboToParam({ hue: nextHue, temp: nextTemp });
    if (param) {
      startTransition(() => router.push(`/colors/${param}`));
    } else {
      startTransition(() => router.push("/colors"));
    }
  };

  const onToggleHue = (h: Hue) => {
    setHasInteracted(true);
    const next = hue === h ? undefined : h;
    setHue(next);
    pushUrl(next, temp);
  };

  const onToggleTemp = (t: Temperature) => {
    setHasInteracted(true);
    const next = temp === t ? undefined : t;
    setTemp(next);
    pushUrl(hue, next);
  };

  const onClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  const onSearchAcrossAll = () => {
    setHasInteracted(true);
    setHue(undefined);
    setTemp(undefined);
    pushUrl(undefined, undefined);
  };

  // Compute the displayed cards.
  const cards: ColorCardData[] = useMemo(() => {
    if (!hasInteracted || hubIndex === null) {
      // First paint — use server-rendered slice. Search before interaction is rare; skip the cost.
      return serverRenderedCards;
    }
    let rows = hubIndex;
    if (hue) rows = rows.filter((r) => r.hue === hue);
    if (temp) rows = rows.filter((r) => r.temp === temp);
    if (debouncedQuery) rows = rows.filter((r) => matchesQuery(r, debouncedQuery));
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      hex: r.hex,
      emotions: r.emotions,
    }));
  }, [hasInteracted, hubIndex, hue, temp, debouncedQuery, serverRenderedCards]);

  const filtersActive = Boolean(hue || temp);
  const showSearchAcrossAll = filtersActive && cards.length < 5;

  return (
    <div className="container mx-auto px-8 py-20">
      <div className="text-center mb-16 animate-fade-in pt-12">
        <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Color Meanings Library
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Explore our comprehensive collection of colors and discover their psychological meanings,
          emotional associations, and how to use them effectively in your designs.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative flex items-center mb-8">
          <input
            type="text"
            placeholder="Search colors, emotions, or hex (e.g. ff5)..."
            value={query}
            onChange={(e) => {
              setHasInteracted(true);
              setQuery(e.target.value);
            }}
            className="w-full py-3 px-5 rounded-full bg-white dark:bg-gray-800 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {HUES.map((h) => (
            <button
              key={h}
              onClick={() => onToggleHue(h)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
                hue === h
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {TEMPERATURES.map((t) => (
            <button
              key={t}
              onClick={() => onToggleTemp(t)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
                temp === t
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">No colors match your search.</p>
          {debouncedQuery && (
            <button
              onClick={onClearSearch}
              className="px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors mr-3"
            >
              Clear search
            </button>
          )}
          {showSearchAcrossAll && (
            <button
              onClick={onSearchAcrossAll}
              className="px-5 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Clear filters and search across all colors
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {cards.map((c, i) => (
              <ColorCard key={c.slug} color={c} index={i} />
            ))}
          </div>
          {showSearchAcrossAll && (
            <div className="text-center mt-10">
              <button
                onClick={onSearchAcrossAll}
                className="text-blue-500 hover:text-blue-600 text-sm underline"
              >
                Clear filters and search across all colors
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify the build**

```bash
pnpm build
```

Expected: exit 0; no TS errors.

- [ ] **Step 4: Commit (manual dev walk follows after Task 7/8 wire it in)**

```bash
git add app/colors/components/ColorsHub.tsx app/colors/components/ColorCard.tsx
git commit -m "feat(colors): add ColorsHub client component + extract ColorCard"
```

---

## Task 7: Rename `[color_name]` → `[segment]`, add resolver, branch render

**Goal:** Consolidate the dynamic route. `app/colors/[segment]/page.tsx` handles temperature hub pages, combo hub pages, and color detail pages. `generateStaticParams` enumerates all three from `categories.json` + the snapshot slug list. The page component branches via `paramToSegment`.

**Files:**
- Modify (rename): `app/colors/[color_name]/page.tsx` → `app/colors/[segment]/page.tsx`

**Acceptance Criteria:**
- [ ] Folder renamed to `[segment]`; page reads `params.segment`.
- [ ] `generateStaticParams` returns the union of temp segments + combo segments + slug segments from `categories.json` and the snapshot.
- [ ] `dynamicParams = false`.
- [ ] `paramToSegment` precedence applied; detail renders for `{kind: "slug"}`, hub renders for `{kind: "temp"}` / `{kind: "combo"}`, `notFound()` for `null`.
- [ ] `generateMetadata` branches on the parsed segment kind.
- [ ] `out/colors/warm/index.html`, `out/colors/red-warm/index.html`, `out/colors/coral-red/index.html` all exist after `pnpm build`.

**Verify:** `pnpm build && ls out/colors/warm out/colors/red-warm out/colors/coral-red` succeeds.

**Steps:**

- [ ] **Step 1: Move the route folder**

```bash
git mv app/colors/[color_name] app/colors/[segment]
```

- [ ] **Step 2: Rewrite `app/colors/[segment]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getColorBySlug,
  getAllColorSlugs,
} from "../utils/colorDataService";
import {
  paramToSegment,
  HUES,
  TEMPERATURES,
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
  const cats = categories as CategoriesShape;
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
    return <ColorsHub initialTemp={parsed.value} serverRenderedCards={sliceForHub(undefined, parsed.value)} />;
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
```

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: exit 0. Then:

```bash
ls out/colors/warm out/colors/red-warm out/colors/coral-red 2>&1 | head -20
```

Expected: all three directories exist (or their `index.html` files).

- [ ] **Step 4: Spot-check that empty combos are absent**

```bash
# Pick a combo that the categorization predicts will be empty, e.g. blue-warm
ls out/colors/blue-warm 2>&1 || echo "absent (expected for empty combos)"
```

Note: if blue-warm has any colors, pick a different empty combo from `cat app/colors/data/categories.json | head -50`.

- [ ] **Step 5: Manual dev walk**

```bash
pnpm dev
```

Test these:
- Hard-load `/colors/red-warm` → above-fold cards present in static HTML (view source).
- Click `warm` chip on `/colors` → URL becomes `/colors/warm`.
- Click `red` chip → URL becomes `/colors/red-warm`.
- Click `red` chip again → URL becomes `/colors/warm`.
- Click `warm` chip again → URL becomes `/colors`.
- Navigate to `/colors/coral-red` → detail page renders with sticky nav prev/next + related/complementary swatches.
- Type "ff5" in search → coral-red appears in result grid.

- [ ] **Step 6: Commit**

```bash
git add app/colors/[segment]/page.tsx
git commit -m "feat(colors): unify [segment] route handling combo, temp, and detail URLs"
```

(Note: the rename via `git mv` is tracked automatically; the new file is at `[segment]/page.tsx` and the old directory is gone.)

---

## Task 8: Replace placeholder UI in `app/colors/page.tsx`

**Goal:** The `/colors` root page becomes a thin wrapper that mounts `<ColorsHub>` with no initial filter and the full server-rendered slice. The placeholder search/filter/pagination UI is removed.

**Files:**
- Modify: `app/colors/page.tsx`

**Acceptance Criteria:**
- [ ] `/colors` renders `<ColorsHub>` with empty initial filter state.
- [ ] No `<input type="text">` or `<button>` for filters/pagination remains in `page.tsx` (these all live in `<ColorsHub>` now).
- [ ] First paint above the fold shows real color cards (server-rendered).
- [ ] Header and intro copy preserved.

**Verify:** `pnpm build && grep -L 'Search colors' app/colors/page.tsx` succeeds; `out/colors/index.html` contains color names from the snapshot.

**Steps:**

- [ ] **Step 1: Rewrite `app/colors/page.tsx`**

```tsx
import { Metadata } from "next";
import Header from "@/components/header";
import ColorsHub from "./components/ColorsHub";
import { ColorCardData } from "./components/ColorCard";
import hubIndex from "./data/hub-index.json";

export const metadata: Metadata = {
  title: "Color Meanings and Psychology | Color Picker",
  description:
    "Explore the psychology and meaning behind colors. Learn how different colors affect emotions and discover perfect color combinations for your designs.",
  keywords:
    "color meanings, color psychology, color theory, web design colors, emotional impact of colors, color palette generator",
};

interface HubIndexShape {
  rows: ColorCardData[] & { hue?: string; temp?: string }[];
}

export default function ColorsIndexPage() {
  const rows = (hubIndex as unknown as { rows: { slug: string; name: string; hex: string; emotions: string[] }[] }).rows;
  const cards: ColorCardData[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    hex: r.hex,
    emotions: r.emotions,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <ColorsHub serverRenderedCards={cards} />
      <footer className="mt-20 bg-white dark:bg-gray-800 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Color Meanings Library. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: exit 0; `out/colors/index.html` exists.

- [ ] **Step 3: Spot-check the static HTML**

```bash
grep -c "color_name" out/colors/index.html || true
# OR pick a known color name
grep "Coral Red" out/colors/index.html | head -1
```

Expected: above-fold color names appear in the rendered HTML.

- [ ] **Step 4: Commit**

```bash
git add app/colors/page.tsx
git commit -m "feat(colors): /colors mounts unified ColorsHub component"
```

---

## Task 9: End-to-end manual verification + sanity sweep

**Goal:** Run the full build, validate the file tree, walk the application in `pnpm dev`, and confirm every spec acceptance criterion holds together.

**Files:** None (verification only).

**Acceptance Criteria:**
- [ ] `pnpm test` exits 0 (all classification + enrichment tests pass).
- [ ] `pnpm build` exits 0 with no warnings about dynamic features.
- [ ] `out/colors/index.html` exists and contains the hub UI + above-fold cards.
- [ ] `out/colors/warm/index.html` exists (representative temp-only page).
- [ ] `out/colors/red-warm/index.html` exists (representative combo page).
- [ ] `out/colors/coral-red/index.html` exists (representative detail page).
- [ ] `out/colors/red/index.html` does **not** exist (single-axis hue URLs are not generated).
- [ ] Empty combos absent from `out/colors/`.
- [ ] `out/sitemap.xml` lists `/colors`, every detail URL, every temp URL, every combo URL.
- [ ] Dev-server walk passes (see steps below).

**Verify:** `pnpm test && pnpm build && bash scripts/verify-colors-hub.sh` (the script is created inline below for repeatability).

**Steps:**

- [ ] **Step 1: Run tests**

```bash
pnpm test
```

Expected: all tests pass; exit 0.

- [ ] **Step 2: Run a clean build**

```bash
rm -rf .next out && pnpm build
```

Expected: exit 0; no warnings about API routes or dynamic features.

- [ ] **Step 3: Validate the file tree**

```bash
[ -f out/colors/index.html ] && echo "hub OK"
[ -f out/colors/warm/index.html ] && echo "warm OK"
[ -f out/colors/red-warm/index.html ] && echo "red-warm OK"
[ -f out/colors/coral-red/index.html ] && echo "coral-red OK"
[ ! -d out/colors/red ] && echo "no hue-only OK"
grep -c '<loc>' out/sitemap.xml
```

Expected: all four "OK" messages; sitemap loc count ≈ 3 + 3 + (≤30) + 1000.

- [ ] **Step 4: Spot-check an empty combo**

```bash
# Pick a known empty combo from categories.json by looking for a hue+temp pair that doesn't appear there
node -e "const cats = require('./app/colors/data/categories.json'); const combos = new Set(cats.combos.map(c => c.hue + '-' + c.temp)); const all = []; for (const h of ['red','orange','yellow','green','teal','blue','purple','pink','brown','gray']) for (const t of ['warm','cool','neutral']) if (!combos.has(h + '-' + t)) all.push(h + '-' + t); console.log('Empty combos:', all);"
```

Expected: a list of combos that should NOT exist as directories under `out/colors/`. Manually verify a couple are absent:

```bash
ls out/colors/<one-of-the-printed-combos> 2>&1 || echo "absent OK"
```

- [ ] **Step 5: Dev-server walkthrough**

```bash
pnpm dev
```

In a browser:
1. Open `http://localhost:3000/colors`. Confirm color cards visible above the fold immediately (view-source if unsure JS is disabled).
2. Type "ff5" in the search box. Confirm Coral Red appears (and other `#FF5...` colors).
3. Clear the search. Click the `warm` chip. Confirm URL changes to `/colors/warm`; grid narrows.
4. Click the `red` chip. Confirm URL changes to `/colors/red-warm`; grid narrows further.
5. Click the `red` chip again. Confirm URL changes back to `/colors/warm`.
6. Click the `warm` chip again. Confirm URL returns to `/colors`.
7. Hard-reload `/colors/red-warm`. Confirm view-source shows red+warm color cards in the static HTML.
8. Navigate to `/colors/coral-red`. Confirm:
   - Sticky nav shows the color name, hex chip, prev/next.
   - Prev/next walk alphabetically (clicking next takes you to whatever color comes alphabetically after Coral Red).
   - "Similar" section shows 3 swatches with actual hex backgrounds.
   - "Complementary" section shows 0–3 swatches (or is hidden entirely if zero).
   - No console errors.
9. Navigate to `/colors/<alphabetically-first-color-slug>`. Confirm Prev button is disabled.
10. Navigate to `/colors/<alphabetically-last-color-slug>`. Confirm Next button is disabled.
11. Navigate to `/colors/nonexistent`. Confirm Next.js 404 page.
12. Navigate to `/colors/warm-red` (reversed combo). Confirm Next.js 404 page.

- [ ] **Step 6: Commit a final docs touch-up if needed**

If you noticed any inaccuracies in the spec while verifying, update it in a small follow-up commit. Otherwise:

```bash
echo "End-to-end verification passed at $(date)" >> /tmp/colors-hub-verify.log
```

(No commit needed unless the verification surfaced a fix.)

- [ ] **Step 7: Open the PR**

```bash
git push -u origin colors-hub-discovery
gh pr create --title "feat(colors): hub discovery + cross-color navigation" --body "$(cat <<'EOF'
## Summary
- Pre-rendered hub combo URLs (`/colors/<temp>`, `/colors/<hue>-<temp>`) via a unified `[segment]` route
- Functional search (name + emotions + hex prefix) and 10 hue / 3 temperature chip filters
- Precomputed `related[]`, `complementary_slugs[]`, alphabetical `prev_slug`/`next_slug` baked into snapshot
- Vitest infrastructure for pure classification utilities and snapshot enrichment

## Test plan
- [ ] `pnpm test` exits 0
- [ ] `pnpm build` exits 0; `out/colors/{warm,red-warm,coral-red}/index.html` exist; `out/colors/red/index.html` does not
- [ ] Sitemap lists hub combos + detail URLs
- [ ] Dev-server walkthrough (see Task 9 of plan) passes

Spec: docs/superpowers/specs/2026-05-25-colors-hub-discovery-design.md
Plan: docs/superpowers/plans/2026-05-25-colors-hub-discovery.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
