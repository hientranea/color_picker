# Static `/colors` Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/colors` color-meaning pages — currently dynamic (Supabase + ISR + API routes + edge OG) on the `meaning` branch — deployable to GitHub Pages as fully static HTML alongside the existing landing and `/palettes` pages. All work lands on `feature/colors-static-export`; nothing is merged to `main`.

**Architecture:** A Node build script snapshots the Supabase `color_psychology_data` table into a committed JSON file at build time. `app/colors/[color_name]/page.tsx` becomes a Server Component that statically generates one HTML file per slug via `generateStaticParams`. Legacy `/api/colors*` endpoints are replaced with static JSON files served from `public/api/`. Per-color dynamic OG images are replaced with a single existing static asset. The whole site exports via `output: 'export'` and deploys through the existing GH Pages Actions workflow.

**Tech Stack:** Next.js 14.2.5 (App Router) · TypeScript · TailwindCSS · `@supabase/supabase-js` · pnpm · GitHub Pages · GitHub Actions

**Spec:** `docs/superpowers/specs/2026-05-24-static-colors-deploy-design.md`

---

## Working Setup (Important — Read Before First Task)

- Current branch is `feature/colors-static-export`, already created off the latest `main`. **Never push or merge to `main`** in this plan. The branch is committed and pushed by the implementer; the human user does the merge manually after their own review.
- Tasks must be executed in numerical order. Where two tasks could overlap, the dependency relationships in `.tasks.json` are explicit.
- Each task ends with a verification command. The next task does not start until verification passes.
- The repository uses `pnpm`. Never substitute `npm` or `yarn`.
- A local `.env.local` file exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Do not commit it. Do not echo its contents. CI gets these values from GitHub repo secrets (which the user adds manually as a prerequisite — flagged in Task 6).

---

## File Structure Overview

Files this plan creates, modifies, deletes, or ports — at a glance, so the boundaries between tasks are clear.

**Create (new files):**
- `scripts/snapshot-colors.mjs` — Task 2
- `app/colors/data/colors.snapshot.json` — Task 2 (generated; committed)
- `public/api/colors.json` — Task 2 (generated; committed)
- `public/api/colors/<slug>.json` — Task 2 (generated; one per color; committed)

**Modify (existing files on `main`):**
- `utils/supabase.ts` — Task 1 (env-driven credentials)
- `types/supabase.ts` — Task 2 (append `ColorPsychologyData` interface)
- `next.config.mjs` — Task 5 (`output: 'export'`, `images.unoptimized`)
- `package.json` — Task 5 (`snapshot:colors` + `prebuild` scripts)
- `.github/workflows/publish.yml` — Task 6 (env vars from secrets, optional feature-branch trigger)

**Port from `origin/meaning` (mechanical copy, then modify):**
- `app/colors/[color_name]/page.tsx` — Task 3 (ported), Task 4 (modified)
- `app/colors/[color_name]/metadata.ts` — Task 3 (ported), Task 4 (modified)
- `app/colors/page.tsx` — Task 3 (ported, no further modification)
- `app/colors/layout.tsx` — Task 3 (ported)
- `app/colors/metadata.ts` — Task 3 (ported)
- `app/colors/components/*.tsx` (9 files) — Task 3 (ported, no further modification)
- `app/colors/utils/colorData.ts` — Task 3 (ported), Task 4 (rewritten to type alias)
- `app/colors/utils/colorDataService.ts` — Task 3 (ported), Task 4 (rewritten to read snapshot)

**Deliberately NOT ported from `meaning`:**
- `app/api/colors/route.ts`, `app/api/colors/[slug]/route.ts`, `app/api/og/route.tsx` — incompatible with static export; replaced functionally by `public/api/*.json` files.
- `app/fonts/README.md` — fonts directory was for OG image generation; the dynamic OG route is dropped, so the directory is unneeded.
- `package.json` dependency changes (`@supabase/ssr`, `lru-cache`) — the dropped API routes were the only consumers; main's `@supabase/supabase-js` is sufficient.

**Delete (existing files brought in by Task 3 that become redundant):**
- `app/colors/fixtures/emerald-green.json` — Task 4
- `app/colors/fixtures/royal-blue.json` — Task 4
- `app/colors/fixtures/web-orange.json` — Task 4
- `app/colors/fixtures/` directory — Task 4 (if empty after JSON deletions)

---

## Task 1: Env-driven Supabase server client

**Goal:** Replace the hardcoded Supabase URL+key in `utils/supabase.ts` with reads from environment variables so the snapshot script (Task 2) and any future runtime caller use credentials provided by `.env.local` or CI secrets, not source-committed values.

**Files:**
- Modify: `utils/supabase.ts`

**Acceptance Criteria:**
- [ ] `utils/supabase.ts` contains no string literal that looks like a Supabase URL (`*.supabase.co`) or a JWT (`eyJ...`).
- [ ] `createSupabaseServerClient` reads `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` at call time (not module top level).
- [ ] If either env var is missing, the function throws an `Error` with a message naming the missing variable.
- [ ] `pnpm next build` exits 0 from the project root.

**Verify:** `cd /Users/hientran/code/color_picker && pnpm next build 2>&1 | tail -20 && grep -E '(supabase\.co|eyJ[A-Za-z0-9_-]+)' utils/supabase.ts && echo "FAIL: hardcoded values still present" || echo "OK: no hardcoded values"`

Expected: Last two lines show successful build summary, then `OK: no hardcoded values`.

**Steps:**

- [ ] **Step 1: Replace the file content**

Overwrite `utils/supabase.ts` with:

```ts
import { createClient } from "@supabase/supabase-js";

export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
        "Set it in .env.local (local) or repo secrets (CI)."
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. " +
        "Set it in .env.local (local) or repo secrets (CI)."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};
```

- [ ] **Step 2: Run the build to confirm no regressions**

```bash
cd /Users/hientran/code/color_picker
pnpm next build
```

Expected: Exits 0. Build summary shows `/palettes` and `/` routes (no `/colors` yet — that comes in later tasks).

- [ ] **Step 3: Confirm no hardcoded credentials remain**

```bash
grep -E '(supabase\.co|eyJ[A-Za-z0-9_-]+)' utils/supabase.ts && echo "FAIL" || echo "OK"
```

Expected: `OK` (grep returns nothing; the `||` branch runs).

- [ ] **Step 4: Commit**

```bash
git add utils/supabase.ts
git commit -m "refactor(supabase): read credentials from env vars instead of hardcoding"
```

---

## Task 2: Snapshot script + initial committed snapshot

**Goal:** Author a Node script that fetches all rows from Supabase `color_psychology_data`, sanitizes JSONB fields, and writes three artifacts: the full snapshot consumed by build-time page generation, a list-projection JSON for legacy `/api/colors` URL compatibility, and one per-color JSON for legacy `/api/colors/<slug>` URL compatibility. Run it once and commit the output. Also append the `ColorPsychologyData` TypeScript interface to `types/supabase.ts` so downstream code can type-import it.

**Files:**
- Create: `scripts/snapshot-colors.mjs`
- Create: `app/colors/data/colors.snapshot.json` (generated by the script)
- Create: `public/api/colors.json` (generated)
- Create: `public/api/colors/<slug>.json` (generated; one file per color)
- Modify: `types/supabase.ts` (append interface)

**Acceptance Criteria:**
- [ ] `scripts/snapshot-colors.mjs` is an ES module that uses only `node:` built-ins and `@supabase/supabase-js`.
- [ ] Running `node scripts/snapshot-colors.mjs` from the project root completes in under 30 seconds against a reachable Supabase, exits 0, and writes the three artifact groups above.
- [ ] `app/colors/data/colors.snapshot.json` parses as valid JSON with the shape `{ colors: ColorPsychologyData[], generatedAt: string }` and `colors.length > 0`.
- [ ] `public/api/colors.json` parses as a JSON array; each element has at least the keys `slug`, `color_name`, `hex_code`, `emotional_associations`.
- [ ] At least one `public/api/colors/<slug>.json` file exists; each parses as a single JSON object.
- [ ] When `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset AND `app/colors/data/colors.snapshot.json` already exists, the script exits 0 with a warning ("offline build" path).
- [ ] When env vars are unset AND no snapshot exists, the script exits non-zero with a clear error.
- [ ] `types/supabase.ts` contains an exported `ColorPsychologyData` interface matching the meaning-branch shape.

**Verify:**
```bash
cd /Users/hientran/code/color_picker
node scripts/snapshot-colors.mjs && \
  jq '.colors | length' app/colors/data/colors.snapshot.json && \
  jq '. | length' public/api/colors.json && \
  ls public/api/colors/*.json | head -5
```

Expected: Snapshot writes complete. Both `jq` calls print the same positive integer. The `ls` shows at least one per-color file.

**Steps:**

- [ ] **Step 1: Append the type to `types/supabase.ts`**

The current file contains only the `Json` type. Append the `ColorPsychologyData` interface so the snapshot script and the data service share a single source of truth.

Add to the end of `types/supabase.ts`:

```ts

export interface ColorPsychologyData {
  id: string;
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
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Create `scripts/snapshot-colors.mjs`**

Write the file with this exact content:

```js
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
import { writeFile, mkdir, readFile } from "node:fs/promises";
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
      process.env[m[1]] = m[2].trim();
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

  const colors = data.map((row) => ({
    ...row,
    slug: colorNameToSlug(row.color_name),
    emotional_associations: ensureArray(row.emotional_associations),
    complementary_colors: ensureArray(row.complementary_colors),
    suggested_palettes: ensureArray(row.suggested_palettes),
    industry_use_cases: ensureObject(row.industry_use_cases),
    real_world_examples: ensureArray(row.real_world_examples),
    how_to_pair: ensureArray(row.how_to_pair),
    seo_meta: ensureObject(row.seo_meta),
  }));

  // 1. Full snapshot
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

  // 2. List-page projection
  await mkdir(path.dirname(listPath), { recursive: true });
  const listProjection = colors.map((c) => ({
    slug: c.slug,
    color_name: c.color_name,
    hex_code: c.hex_code,
    emotional_associations: c.emotional_associations,
  }));
  await writeFile(listPath, JSON.stringify(listProjection, null, 2) + "\n");
  console.log(`[snapshot-colors] Wrote ${listPath}`);

  // 3. Per-color JSON
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
```

- [ ] **Step 3: Run the script**

```bash
cd /Users/hientran/code/color_picker
node scripts/snapshot-colors.mjs
```

Expected output (numbers will vary):

```
[snapshot-colors] Fetching color_psychology_data from Supabase...
[snapshot-colors] Wrote /Users/.../app/colors/data/colors.snapshot.json (N colors)
[snapshot-colors] Wrote /Users/.../public/api/colors.json
[snapshot-colors] Wrote N per-color JSON files to /Users/.../public/api/colors/
```

- [ ] **Step 4: Inspect output for shape correctness**

```bash
jq '.colors | length' app/colors/data/colors.snapshot.json
jq '.colors[0] | keys' app/colors/data/colors.snapshot.json
jq '. | length' public/api/colors.json
jq '.[0]' public/api/colors.json
ls public/api/colors/ | head -5
```

Expected: snapshot has N > 0 colors; the first color has `color_name`, `hex_code`, `emotional_associations`, `slug`, and the other ColorPsychologyData fields; `public/api/colors.json` has N entries each with `slug`/`color_name`/`hex_code`/`emotional_associations`; per-color files exist.

- [ ] **Step 5: Test the offline-fallback branch**

```bash
env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY node scripts/snapshot-colors.mjs
```

Expected: Exits 0 with the message `Missing Supabase env vars; reusing existing snapshot at .../colors.snapshot.json`. (Note: `env -u VAR` unsets just for that invocation; .env.local is still loaded by the script, so this only works if `.env.local` is also moved aside. Skip this step if testing this branch is awkward — the logic is exercised in CI when secrets aren't yet wired.)

- [ ] **Step 6: Commit**

```bash
git add scripts/snapshot-colors.mjs types/supabase.ts \
        app/colors/data/colors.snapshot.json \
        public/api/colors.json public/api/colors/
git commit -m "feat(colors): snapshot Supabase data to JSON at build time

scripts/snapshot-colors.mjs pulls color_psychology_data from Supabase,
sanitizes JSONB fields, and writes a committed snapshot consumed by
build-time static generation. Also writes static JSON files under
public/api/ that mirror the (now-dropped) /api/colors REST shape so
external consumers can still fetch flat URLs.

ColorPsychologyData interface added to types/supabase.ts as the
shared shape between the script and downstream code."
```

---

## Task 3: Port `/colors` files from `meaning` (mechanical)

**Goal:** Bring the `meaning` branch's `app/colors/*` tree onto `feature/colors-static-export` unchanged. After this task, the files exist on disk but are wired to call Supabase at request time (broken for static export). Task 4 makes them static-friendly. This task is intentionally mechanical so the diff stays reviewable.

**Files:**
- Port (from `origin/meaning`): everything under `app/colors/`. Specifically:
  - `app/colors/[color_name]/page.tsx`
  - `app/colors/[color_name]/metadata.ts`
  - `app/colors/page.tsx`
  - `app/colors/layout.tsx`
  - `app/colors/metadata.ts`
  - `app/colors/components/{ColorCTA,ColorHeader,ColorNavigation,ColorPalettes,ColorStructuredData,HowToPair,IndustryUseCases,RealWorldExamples,RelatedColors}.tsx`
  - `app/colors/fixtures/{emerald-green,royal-blue,web-orange}.json` (these are temporary; will be removed in Task 4)
  - `app/colors/utils/colorData.ts`
  - `app/colors/utils/colorDataService.ts`

**Acceptance Criteria:**
- [ ] All listed files exist on the working tree at the paths above.
- [ ] `app/api/` does not exist on the working tree (API routes were deliberately NOT ported).
- [ ] `npx tsc --noEmit` completes with no type errors. (Build may still fail at runtime if Supabase is unreachable; typecheck is sufficient at this stage.)

**Verify:**
```bash
cd /Users/hientran/code/color_picker
ls -la app/colors/[color_name]/page.tsx \
       app/colors/utils/colorDataService.ts \
       app/colors/components/ColorHeader.tsx && \
  test ! -d app/api && \
  npx tsc --noEmit
```

Expected: Files listed exist (3 lines of `ls -la` output); `app/api/` does not exist (no error from `test ! -d`); `tsc --noEmit` exits 0 with no output.

**Steps:**

- [ ] **Step 1: Port the `app/colors/` tree from `meaning`**

```bash
cd /Users/hientran/code/color_picker
git checkout origin/meaning -- app/colors/
```

This brings in every file under `app/colors/` from `meaning`, including the partial fixtures and both data-utility files. It does NOT touch `app/api/` (because the path filter only mentions `app/colors/`).

- [ ] **Step 2: Confirm `app/api/` is absent**

```bash
test ! -d app/api && echo "OK: no app/api directory" || echo "FAIL: app/api exists"
```

Expected: `OK: no app/api directory`. If the directory does exist (someone ran a wider checkout), delete it: `rm -rf app/api`.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: Exits 0 with no output. If type errors appear, they are most likely missing imports (e.g., `ColorPsychologyData` from `@/types/supabase`). Task 2's append-to-types step should have added that. If errors persist, fix root causes before continuing (do not silence with `any`).

- [ ] **Step 4: Commit**

```bash
git add app/colors/
git commit -m "feat(colors): port /colors page tree from meaning branch (unchanged)

Mechanical port of every file under app/colors/ from origin/meaning.
Files are not yet wired to read from the build-time snapshot — they
still call Supabase at request time, which is the next task. /api/*
and /og/* dynamic routes are deliberately NOT ported."
```

---

## Task 4: Make `/colors` statically renderable

**Goal:** Rewrite `colorDataService.ts` to read from the build-time snapshot synchronously; collapse `colorData.ts` into a type-only re-export; configure `[color_name]/page.tsx` to statically generate one HTML file per color via `generateStaticParams`; switch `[color_name]/metadata.ts` to the static OG image; delete the partial-fixture JSON files. After this task, the `/colors` subtree has no runtime Supabase dependency and is ready for static export.

**Files:**
- Modify: `app/colors/utils/colorDataService.ts`
- Modify: `app/colors/utils/colorData.ts`
- Modify: `app/colors/[color_name]/page.tsx`
- Modify: `app/colors/[color_name]/metadata.ts`
- Delete: `app/colors/fixtures/emerald-green.json`
- Delete: `app/colors/fixtures/royal-blue.json`
- Delete: `app/colors/fixtures/web-orange.json`
- Delete: `app/colors/fixtures/` (directory, after files removed)

**Acceptance Criteria:**
- [ ] `app/colors/utils/colorDataService.ts` contains no import from `@/utils/supabase` and no call to `createSupabaseServerClient` or `supabase.from(...)`.
- [ ] `getAllColors`, `getColorBySlug`, `getAllColorSlugs`, `getAllColorNames`, `colorNameToSlug`, `slugToColorName` are all exported and return data sourced from `app/colors/data/colors.snapshot.json`.
- [ ] `app/colors/[color_name]/page.tsx` contains `export const dynamicParams = false;` and `generateStaticParams` returns the full list of slugs from the snapshot (not `return []`).
- [ ] `app/colors/[color_name]/page.tsx` does NOT contain `export const revalidate = ...`.
- [ ] `app/colors/[color_name]/metadata.ts` references `/hero-advance-harmony.png` in both `openGraph.images` and `twitter.images` — and does not reference `/api/og`.
- [ ] `app/colors/fixtures/` does not exist.
- [ ] `npx tsc --noEmit` succeeds.

**Verify:**
```bash
cd /Users/hientran/code/color_picker
grep -E "(createSupabaseServerClient|supabase\.from|@/utils/supabase)" app/colors/utils/colorDataService.ts && echo "FAIL" || echo "OK: no supabase refs in colorDataService"
grep -E "/api/og" app/colors/[color_name]/metadata.ts && echo "FAIL" || echo "OK: no /api/og ref in metadata"
grep -E "export const revalidate" app/colors/[color_name]/page.tsx && echo "FAIL" || echo "OK: no revalidate"
grep -E "export const dynamicParams = false" app/colors/[color_name]/page.tsx && echo "OK: dynamicParams set" || echo "FAIL"
test ! -d app/colors/fixtures && echo "OK: fixtures gone" || echo "FAIL: fixtures dir remains"
npx tsc --noEmit
```

Expected: All `OK:` messages, no `FAIL:`, and `tsc --noEmit` exits 0.

**Steps:**

- [ ] **Step 1: Rewrite `app/colors/utils/colorDataService.ts`**

Overwrite the file content with:

```ts
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
  colors: (ColorPsychologyData & { slug: string })[];
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
    slug: color.slug ?? colorNameToSlug(color.color_name),
    color_name: color.color_name,
    hex_code: color.hex_code,
    emotional_associations: color.emotional_associations,
  }));
}

export function getColorBySlug(slug: string): ColorInfo | null {
  const decodedSlug = decodeURIComponent(slug);
  const match = SNAPSHOT.colors.find(
    (c) => (c.slug ?? colorNameToSlug(c.color_name)) === decodedSlug
  );
  if (!match) return null;
  // Strip the slug field before returning the ColorPsychologyData payload
  const { slug: _slug, ...data } = match;
  return { slug: decodedSlug, data: data as ColorPsychologyData };
}

export function getAllColorSlugs(): string[] {
  return SNAPSHOT.colors.map(
    (c) => c.slug ?? colorNameToSlug(c.color_name)
  );
}

export function getAllColorNames(): string[] {
  return SNAPSHOT.colors.map((c) => c.color_name);
}
```

All exports are now synchronous. Existing callers — `app/colors/page.tsx` and `app/colors/[color_name]/page.tsx` — await these functions; an awaited synchronous value is still the value, so the callers do not need to change.

- [ ] **Step 2: Collapse `app/colors/utils/colorData.ts` to a type alias**

The ported version imports three fixture JSON files and exports a `ColorData` interface that overlaps `ColorPsychologyData`. Replace the entire file content with:

```ts
// Type alias maintained for components that import ColorData from this path.
// The runtime data layer lives in colorDataService.ts (sourced from the snapshot).
import type { ColorPsychologyData } from "@/types/supabase";

export type ColorData = ColorPsychologyData;

export interface ColorInfo {
  slug: string;
  data: ColorData;
}
```

Components like `RelatedColors.tsx` that `import { ColorData } from "../utils/colorData"` continue to compile; the type now resolves to `ColorPsychologyData`, which is what the parent page actually passes.

- [ ] **Step 3: Configure `[color_name]/page.tsx` for static export**

Open `app/colors/[color_name]/page.tsx`. Replace the top of the file (everything before the `interface ColorPageProps` declaration). The original has:

```ts
import { notFound } from "next/navigation";
import { getColorBySlug, getAllColorSlugs } from "../utils/colorDataService";

import ColorHeader from "../components/ColorHeader";
// ... other imports ...

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600;

// Don't pre-generate all color pages at build time to avoid build timeouts
// Pages will be generated on-demand and cached with ISR
export async function generateStaticParams() {
  return [];
}
```

Replace with:

```ts
import { notFound } from "next/navigation";
import { getColorBySlug, getAllColorSlugs } from "../utils/colorDataService";

import ColorHeader from "../components/ColorHeader";
// ... other imports ... (keep the rest of the imports exactly as ported)

// Static export: pre-generate one HTML file per color from the build-time snapshot.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllColorSlugs().map((slug) => ({ color_name: slug }));
}
```

Important details:
- The other imports below `ColorHeader` (ColorPalettes, IndustryUseCases, HowToPair, RealWorldExamples, ColorCTA, ColorStructuredData, ColorNavigation, RelatedColors) MUST be preserved exactly as they came from `meaning`.
- The body of `ColorPage` (everything after `interface ColorPageProps`) stays unchanged.
- The route param name is `color_name` (matching the directory `[color_name]`).

- [ ] **Step 4: Switch the OG image in `[color_name]/metadata.ts`**

The ported file (from `meaning`) ends each metadata field with dynamic `/api/og?color=...&name=...` URLs. Replace both `openGraph.images` and `twitter.images` to point at the existing static asset `/hero-advance-harmony.png`.

In `app/colors/[color_name]/metadata.ts`, find:

```ts
    openGraph: {
      title: data.seo_meta.title,
      description: data.seo_meta.description,
      images: [
        {
          url: `/api/og?color=${encodeURIComponent(
            data.hex_code
          )}&name=${encodeURIComponent(data.color_name)}`,
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
      images: [
        `/api/og?color=${encodeURIComponent(
          data.hex_code
        )}&name=${encodeURIComponent(data.color_name)}`,
      ],
    },
```

Replace with:

```ts
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
```

- [ ] **Step 5: Delete the partial-fixture JSON files**

```bash
cd /Users/hientran/code/color_picker
rm app/colors/fixtures/emerald-green.json \
   app/colors/fixtures/royal-blue.json \
   app/colors/fixtures/web-orange.json
rmdir app/colors/fixtures
```

These were temporary local fixtures used by the now-rewritten `colorData.ts`. The full snapshot at `app/colors/data/colors.snapshot.json` supersedes them.

- [ ] **Step 6: Typecheck and run all the grep guardrails from the Verify command**

```bash
npx tsc --noEmit
grep -E "(createSupabaseServerClient|supabase\.from|@/utils/supabase)" app/colors/utils/colorDataService.ts && echo "FAIL" || echo "OK"
grep -E "/api/og" app/colors/[color_name]/metadata.ts && echo "FAIL" || echo "OK"
grep -E "export const revalidate" app/colors/[color_name]/page.tsx && echo "FAIL" || echo "OK"
grep -E "export const dynamicParams = false" app/colors/[color_name]/page.tsx && echo "OK" || echo "FAIL"
test ! -d app/colors/fixtures && echo "OK" || echo "FAIL"
```

Expected: `tsc --noEmit` exits 0. All grep checks print `OK`.

- [ ] **Step 7: Commit**

```bash
git add app/colors/
git commit -m "feat(colors): wire /colors pages to build-time snapshot

- colorDataService.ts reads from app/colors/data/colors.snapshot.json
  synchronously; no Supabase calls at request time.
- colorData.ts collapses to a type-only re-export of
  ColorPsychologyData; existing component imports keep working.
- [color_name]/page.tsx pre-generates every color slug at build
  time via generateStaticParams; dropped ISR (revalidate) and
  set dynamicParams = false.
- [color_name]/metadata.ts switches OG/Twitter image from the
  dynamic /api/og route to the existing static
  /hero-advance-harmony.png.
- Delete app/colors/fixtures/{emerald-green,royal-blue,web-orange}.json
  (superseded by the full snapshot)."
```

---

## Task 5: Enable Next.js static export + wire build scripts

**Goal:** Flip `next.config.mjs` to static export mode and add the `snapshot:colors` and `prebuild` scripts in `package.json` so `pnpm build` runs the snapshot before compiling. After this task, `pnpm build` produces `out/` with one HTML file per color route, fully static.

**Files:**
- Modify: `next.config.mjs`
- Modify: `package.json`

**Acceptance Criteria:**
- [ ] `next.config.mjs` exports a config with `output: "export"` and `images: { unoptimized: true }`.
- [ ] `next.config.mjs` no longer contains `distDir: "out"` (default `.next` is correct; `output: 'export'` writes to `out/` by itself).
- [ ] `package.json` `scripts` contains `"snapshot:colors": "node scripts/snapshot-colors.mjs"` and `"prebuild": "pnpm run snapshot:colors"`.
- [ ] `pnpm build` from a clean state exits 0 and produces `out/` containing at least one `index.html` and an `out/colors/<slug>/index.html` for every slug in the snapshot.
- [ ] `out/api/colors.json` exists (copied from `public/api/`).
- [ ] `out/api/colors/<slug>.json` exists for at least one known slug.

**Verify:**
```bash
cd /Users/hientran/code/color_picker
rm -rf out .next
pnpm build && \
  test -f out/index.html && \
  test -d out/colors && \
  test -f out/api/colors.json && \
  ls out/colors/ | head -10 && \
  EXPECTED=$(jq '.colors | length' app/colors/data/colors.snapshot.json) && \
  ACTUAL=$(ls out/colors/ | grep -v index.html | wc -l | tr -d ' ') && \
  echo "Expected $EXPECTED slug dirs, found $ACTUAL" && \
  test "$EXPECTED" = "$ACTUAL"
```

Expected: Build completes with no errors. `out/index.html` exists. `out/colors/` is a directory. `out/api/colors.json` exists. The number of subdirectories under `out/colors/` (excluding `index.html`) equals the count of colors in the snapshot.

**Steps:**

- [ ] **Step 1: Update `next.config.mjs`**

Overwrite the file with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "",
  output: "export",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
```

Why the changes:
- `output: "export"` tells Next to write a static export to `out/`.
- `images: { unoptimized: true }` is required for `output: 'export'` because the default `next/image` optimizer needs a running server, which a static deploy can't provide. With `unoptimized: true`, images are passed through unchanged.
- The previous `distDir: "out"` line was misconfigured — it sets the intermediate build directory, not the export target. With `output: 'export'`, Next uses `.next` for intermediate output and `out/` for the exported site. Reverting to defaults is correct.

- [ ] **Step 2: Add scripts to `package.json`**

Find the `"scripts"` block in `package.json`. It currently reads:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
```

Replace it with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "snapshot:colors": "node scripts/snapshot-colors.mjs",
    "prebuild": "pnpm run snapshot:colors"
  },
```

The `prebuild` hook is auto-invoked by `pnpm build`; the snapshot script runs before `next build` every time.

- [ ] **Step 3: Clean and rebuild from scratch**

```bash
cd /Users/hientran/code/color_picker
rm -rf out .next
pnpm build
```

Expected during `pnpm build`:
1. `pnpm run snapshot:colors` runs first (the prebuild hook). Snapshot script writes the three artifact groups. If Supabase data hasn't changed, the diff against the committed snapshot is empty — that's fine.
2. `next build` runs. Static export writes `out/`.
3. Build summary at the end lists `/`, `/palettes`, `/colors`, and many `/colors/[color_name]` rows marked with `(static)`.

If `next build` fails with errors like `Page "/colors/[color_name]" cannot use "revalidate" with "output: export"` — Task 4 wasn't fully applied. Re-check that `export const revalidate` was removed from the page.

If `next build` fails with `Page "/colors/[color_name]" is missing param "color_name" in generateStaticParams`, that means `generateStaticParams` returned an empty array. Check that `getAllColorSlugs()` is returning the slugs from the snapshot (Task 4, Step 1).

- [ ] **Step 4: Inspect the `out/` tree**

```bash
test -f out/index.html && echo "OK: out/index.html"
test -d out/colors && echo "OK: out/colors/"
test -f out/colors/index.html && echo "OK: out/colors/index.html"
test -f out/api/colors.json && echo "OK: out/api/colors.json"

EXPECTED=$(jq '.colors | length' app/colors/data/colors.snapshot.json)
ACTUAL=$(find out/colors -mindepth 2 -name index.html | wc -l | tr -d ' ')
echo "Slugs in snapshot: $EXPECTED. HTML files in out/colors/<slug>/: $ACTUAL"
test "$EXPECTED" = "$ACTUAL" && echo "OK: counts match" || echo "FAIL: counts differ"
```

Expected: All four `OK:` from the `test` lines, and `OK: counts match`.

- [ ] **Step 5: Spot-check a generated color page**

```bash
SAMPLE_SLUG=$(jq -r '.colors[0].slug // (.colors[0].color_name | ascii_downcase | gsub(" "; "-"))' app/colors/data/colors.snapshot.json)
echo "Inspecting out/colors/$SAMPLE_SLUG/index.html"
test -f "out/colors/$SAMPLE_SLUG/index.html" && \
  grep -c "hero-advance-harmony.png" "out/colors/$SAMPLE_SLUG/index.html" && \
  grep -o '<title>[^<]*</title>' "out/colors/$SAMPLE_SLUG/index.html"
```

Expected: file exists; `grep -c "hero-advance-harmony.png"` returns a positive integer (the OG image is referenced in the HTML head); a `<title>` containing the color name is printed.

- [ ] **Step 6: Commit**

```bash
git add next.config.mjs package.json
git commit -m "build(colors): enable static export and wire snapshot prebuild

next.config.mjs: output: 'export', images.unoptimized: true.
Dropped distDir: 'out' (misconfigured; default is correct with export).

package.json: snapshot:colors script + prebuild hook. pnpm build
now snapshots Supabase before compiling so the committed
colors.snapshot.json stays current with database state."
```

---

## Task 6: Update GitHub Actions workflow for env vars + temporary feature-branch trigger

**Goal:** Pass `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from GitHub Actions repo secrets into the `Build with Next.js` step so the snapshot prebuild can connect to Supabase. Add a temporary trigger to run the workflow against `feature/colors-static-export` so the user can verify the deployed output before merging.

**Files:**
- Modify: `.github/workflows/publish.yml`

**Acceptance Criteria:**
- [ ] The `Build with Next.js` step in `publish.yml` has an `env:` block exposing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `secrets.*`.
- [ ] The workflow's `on.push.branches` includes `feature/colors-static-export` (alongside the existing `main`). This is a temporary entry — it will be removed before final merge by a follow-up commit on `main`.
- [ ] `workflow_dispatch` remains available.
- [ ] The workflow YAML is syntactically valid.

**Verify:**
```bash
cd /Users/hientran/code/color_picker
grep -E "NEXT_PUBLIC_SUPABASE_URL:" .github/workflows/publish.yml && echo "OK: URL exposed" || echo "FAIL"
grep -E "NEXT_PUBLIC_SUPABASE_ANON_KEY:" .github/workflows/publish.yml && echo "OK: KEY exposed" || echo "FAIL"
grep -E "feature/colors-static-export" .github/workflows/publish.yml && echo "OK: feature branch in trigger" || echo "FAIL"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/publish.yml'))" && echo "OK: valid YAML"
```

Expected: Four `OK:` lines, no `FAIL:`.

**Steps:**

- [ ] **Step 1: Edit `.github/workflows/publish.yml`**

The current file has:

```yaml
on:
  push:
    branches: ["main"]
  workflow_dispatch:
```

Replace the `on:` block with:

```yaml
on:
  push:
    branches: ["main", "feature/colors-static-export"]
  workflow_dispatch:
```

Find the `Build with Next.js` step:

```yaml
      - name: Build with Next.js
        run: pnpm next build
```

Replace it with:

```yaml
      - name: Build with Next.js
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: pnpm build
```

Two changes there:
- `env:` block exposes the secrets to the build process.
- `pnpm next build` becomes `pnpm build` so the `prebuild` hook (added in Task 5) is honored.

- [ ] **Step 2: Validate the workflow YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/publish.yml'))" && echo "VALID YAML"
```

Expected: `VALID YAML`. If `python3` is unavailable, install `yq` or skip and rely on GitHub's parser when pushed.

- [ ] **Step 3: Document the manual GitHub Settings step the user must do**

The implementer cannot add repo secrets — only the human user with admin access can. Print this exact message to the implementer's stdout (and into the task hand-off conversation) so the user sees it:

```bash
cat <<'EOF'

  >>> USER ACTION REQUIRED before CI can build successfully <<<

  Add these repository secrets in GitHub:
    Settings → Secrets and variables → Actions → New repository secret

    Name:  NEXT_PUBLIC_SUPABASE_URL
    Value: (copy from .env.local — the supabase.co URL)

    Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
    Value: (copy from .env.local — the eyJ... JWT)

  Without these secrets, CI builds will fail at the snapshot step.
  Local builds keep working because .env.local already has them.

EOF
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "ci(colors): pass Supabase env to build; trigger on feature branch

- Build with Next.js step exposes NEXT_PUBLIC_SUPABASE_URL and
  NEXT_PUBLIC_SUPABASE_ANON_KEY from repo secrets so the snapshot
  prebuild script can connect to Supabase in CI.
- Switch the run command from \`pnpm next build\` to \`pnpm build\` so
  the prebuild hook runs.
- Temporarily add feature/colors-static-export to push triggers so
  the user can preview the deployed output before merging. To be
  removed in a follow-up commit on main."
```

---

## Task 7: Local end-to-end smoke test

**Goal:** Build the site from a clean state, serve `out/` locally, and visit every key route to confirm the static export renders correctly. This task does not change any source files — it is a deliberate inspection step so the implementer (and reviewer) catch regressions before pushing.

**Files:**
- None modified.

**Acceptance Criteria:**
- [ ] `rm -rf out .next && pnpm build` completes with exit 0.
- [ ] `out/index.html`, `out/palettes/index.html`, `out/colors/index.html` all exist.
- [ ] At least one `out/colors/<slug>/index.html` is present and contains the corresponding color name in plain text (i.e., the content is in the HTML, not just hydrated by JS).
- [ ] `out/api/colors.json` parses as JSON with `length > 0`.
- [ ] `npx serve out -l 4321` (or any local static server) serves the site at `http://localhost:4321`; the landing page, `/palettes`, `/colors`, and a sample `/colors/<slug>` page all return HTTP 200 with non-empty bodies.
- [ ] The implementer captures the HTTP status and a short content excerpt for each tested URL and records them in the task close-out (i.e., they paste the curl output as evidence).

**Verify:**
```bash
cd /Users/hientran/code/color_picker
rm -rf out .next
pnpm build

test -f out/index.html && \
  test -f out/palettes/index.html && \
  test -f out/colors/index.html && \
  test -f out/api/colors.json && \
  echo "OK: artifact files present"

SAMPLE_SLUG=$(jq -r '.colors[0].slug // (.colors[0].color_name | ascii_downcase | gsub(" "; "-"))' app/colors/data/colors.snapshot.json)
SAMPLE_NAME=$(jq -r '.colors[0].color_name' app/colors/data/colors.snapshot.json)
test -f "out/colors/$SAMPLE_SLUG/index.html" && \
  grep -q "$SAMPLE_NAME" "out/colors/$SAMPLE_SLUG/index.html" && \
  echo "OK: $SAMPLE_NAME found in static HTML for /colors/$SAMPLE_SLUG"

# Local serve in background, smoke test with curl, then kill
npx --yes serve out -l 4321 > /tmp/serve.log 2>&1 &
SERVE_PID=$!
sleep 2
for path in / /palettes /colors "/colors/$SAMPLE_SLUG" /api/colors.json; do
  STATUS=$(curl -s -o /tmp/body.html -w "%{http_code}" "http://localhost:4321$path")
  SIZE=$(wc -c < /tmp/body.html | tr -d ' ')
  echo "GET $path -> HTTP $STATUS, $SIZE bytes"
done
kill $SERVE_PID
wait $SERVE_PID 2>/dev/null
```

Expected: Each `GET ... -> HTTP 200` with a body size in the kilobytes (not zero, not a small error page).

**Steps:**

- [ ] **Step 1: Clean and build**

```bash
cd /Users/hientran/code/color_picker
rm -rf out .next
pnpm build
```

Expected: Snapshot prebuild runs, then `next build`, then a route-summary table. Look for `/colors/[color_name]` listed with type `○` (static) and the number of statically-generated paths matching the snapshot's `colors.length`.

- [ ] **Step 2: Static file sanity check**

```bash
test -f out/index.html && echo "OK: out/index.html"
test -f out/palettes/index.html && echo "OK: out/palettes/index.html"
test -f out/colors/index.html && echo "OK: out/colors/index.html"
test -f out/api/colors.json && jq '. | length' out/api/colors.json
ls out/colors/ | wc -l
```

Expected: All `OK:` lines; `jq` prints a positive integer; `ls | wc -l` matches snapshot count + 1 (for the `index.html` file itself).

- [ ] **Step 3: Confirm rendered HTML contains color content**

```bash
SAMPLE_SLUG=$(jq -r '.colors[0].slug // (.colors[0].color_name | ascii_downcase | gsub(" "; "-"))' app/colors/data/colors.snapshot.json)
SAMPLE_NAME=$(jq -r '.colors[0].color_name' app/colors/data/colors.snapshot.json)
echo "Spot-checking $SAMPLE_NAME at out/colors/$SAMPLE_SLUG/index.html"
grep -c "$SAMPLE_NAME" "out/colors/$SAMPLE_SLUG/index.html"
grep -c "hero-advance-harmony.png" "out/colors/$SAMPLE_SLUG/index.html"
grep -o '<script type="application/ld\+json">' "out/colors/$SAMPLE_SLUG/index.html" | head -1
```

Expected: `grep -c "$SAMPLE_NAME"` returns ≥1 (the color name is in the HTML body, proving SSG worked). `grep -c "hero-advance-harmony.png"` returns ≥1 (the OG image is in the head). JSON-LD script tag is present.

- [ ] **Step 4: Serve locally and smoke-test via curl**

```bash
npx --yes serve out -l 4321 > /tmp/serve.log 2>&1 &
SERVE_PID=$!
sleep 2
SAMPLE_SLUG=$(jq -r '.colors[0].slug // (.colors[0].color_name | ascii_downcase | gsub(" "; "-"))' app/colors/data/colors.snapshot.json)
for path in / /palettes /colors "/colors/$SAMPLE_SLUG" /api/colors.json; do
  STATUS=$(curl -s -o /tmp/body.html -w "%{http_code}" "http://localhost:4321$path")
  SIZE=$(wc -c < /tmp/body.html | tr -d ' ')
  echo "GET $path -> HTTP $STATUS, $SIZE bytes"
done
kill $SERVE_PID 2>/dev/null
wait $SERVE_PID 2>/dev/null
```

Expected: 5 lines, each `HTTP 200` with size > 1000 bytes (except `/api/colors.json` which may be smaller but still > 100 bytes).

- [ ] **Step 5: Push the feature branch**

```bash
git push -u origin feature/colors-static-export
```

Expected: Push succeeds. The CI workflow triggers (because Task 6 added the feature branch to the push filter). The user will use the CI output to verify the deployed preview.

Note: this task makes no code changes, so there is nothing to commit beyond what previous tasks committed. The smoke-test is verification of the cumulative result.

---

## Task 8: Hand off to user for manual review and merge

**Goal:** Pause the plan in a state where the feature branch is pushed, all checks pass locally, and the human user has been notified to perform their own review and the final merge into `main`. This task does NOT close automatically — only the user can mark it complete by stating their approval in conversation.

> **USER-ORDERED GATE — NON-SKIPPABLE.** This task was requested by the user in the current conversation. It MUST NOT be closed by walking around it, by declaring it "verified inline", or by substituting a cheaper check. Close only after every item in `acceptanceCriteria` has been re-validated independently, with output captured.

**Files:**
- None modified.

**Acceptance Criteria:**
- [ ] The feature branch `feature/colors-static-export` is pushed to `origin`.
- [ ] Task 7's smoke test passed (the implementer has the curl output and file checks as evidence in the conversation log).
- [ ] The implementer has posted in the conversation a summary that includes: branch name, link/path to the deployed preview if available from CI, a short list of what was changed (one bullet per task), and the user-action required for CI secrets (the message from Task 6 Step 3).
- [ ] The user has explicitly stated in this conversation that they have reviewed either the local build (`out/`) or the deployed preview AND approve the branch for merge. Acceptable phrasings include "looks good, merge it", "approved", "go ahead and merge", "ship it", or "good, I'll merge it myself".
- [ ] Until the explicit approval, the task remains open.

**Verify:** No automated command. Verification is the user's natural-language approval in the conversation transcript.

**Steps:**

- [ ] **Step 1: Confirm the branch is pushed**

```bash
cd /Users/hientran/code/color_picker
git status -sb
git log -1 --pretty=oneline origin/feature/colors-static-export 2>/dev/null || echo "Branch not yet pushed — push it now: git push -u origin feature/colors-static-export"
```

Expected: working tree clean; the second command prints the latest commit hash + message from the remote tracking branch.

- [ ] **Step 2: Compose the hand-off summary in the conversation**

Post a message containing exactly the following structure (filling in concrete values from the work):

```
The /colors static deployment work is ready for your review on branch `feature/colors-static-export`.

Summary of changes (one bullet per task):
- Task 1: Replaced hardcoded Supabase credentials in utils/supabase.ts with env reads.
- Task 2: Added scripts/snapshot-colors.mjs and the build-time JSON snapshot at app/colors/data/colors.snapshot.json. Static replacements for /api/colors* live under public/api/.
- Task 3: Ported app/colors/* from the meaning branch (mechanical, unchanged).
- Task 4: Rewrote colorDataService.ts to read the snapshot; switched /colors/[color_name]/page.tsx to static generation; pointed metadata at the existing /hero-advance-harmony.png OG image; removed the partial-fixture JSON files.
- Task 5: Set next.config.mjs to output: 'export' and wired prebuild → snapshot:colors.
- Task 6: GitHub Actions workflow now passes Supabase env from secrets; temporarily triggers on the feature branch as well as main.
- Task 7: Local smoke test passed — every route renders, the static HTML contains the rendered color content, /api/colors.json serves as static JSON.

USER ACTION REQUIRED before CI can complete:
Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
GitHub repo Settings → Secrets and variables → Actions.
(Copy values from local .env.local.)

When you're ready to merge, also remove `feature/colors-static-export` from
the push triggers in .github/workflows/publish.yml (added in Task 6) as a
follow-up commit on main.

Awaiting your explicit approval before closing this task.
```

- [ ] **Step 3: Wait for user approval**

Do not close this task on agent assertion. The task closes only when the user posts approval in the conversation. If the user requests changes instead, re-open earlier tasks as needed.

---

## Self-Review

This section is the implementation plan author's own checklist run after writing every task. Performed inline; issues fixed in place.

**1. Spec coverage:** Every requirement in `docs/superpowers/specs/2026-05-24-static-colors-deploy-design.md` maps to a task.

| Spec section | Task(s) |
|---|---|
| Goal | All tasks |
| Non-goals (no /palettes refactor, no real API, no dynamic OG, no main merge) | Honored by omission; Task 8 enforces no auto-merge |
| Architecture: build-time snapshot script | Task 2 |
| Architecture: static export | Task 5 |
| Architecture: same domain GH Pages | Task 6 (no new host) |
| File: `scripts/snapshot-colors.mjs` | Task 2 |
| File: `colors.snapshot.json` | Task 2 |
| File: `public/api/*` static JSON | Task 2 |
| File: no new OG image needed | Task 4 (uses existing `/hero-advance-harmony.png`) |
| Modify: `next.config.mjs` (`output: 'export'`, `images.unoptimized`, drop `distDir`) | Task 5 |
| Modify: `colorDataService.ts` (snapshot reads) | Task 4 |
| Modify: `[color_name]/page.tsx` (generateStaticParams, drop revalidate, dynamicParams=false) | Task 4 |
| Modify: `[color_name]/metadata.ts` (static OG) | Task 4 |
| Modify: `utils/supabase.ts` (env reads) | Task 1 |
| Modify: `package.json` (snapshot:colors + prebuild) | Task 5 |
| Modify: `.github/workflows/publish.yml` (env from secrets) | Task 6 |
| Delete: `app/api/*` routes | Handled by NOT porting in Task 3 (explicitly documented) |
| Delete: legacy partial fixtures | Task 4 |
| Port from meaning: `app/colors/*` files | Task 3 |
| Build pipeline | Task 6 |
| SEO considerations (real HTML at first byte, JSON-LD, OG, canonical) | Tasks 4 + 5; verified in Task 7 |
| Risks: build time, stale data, snapshot drift, RLS failures, hardcoded creds | All addressed in the relevant task body |
| Migration plan order | Followed by task numbering |
| Testing strategy | Task 7 |
| Open questions: repo secrets + branch trigger | Tasks 6 + 7 + 8 |

No gaps.

**2. Placeholder scan:** No "TBD", "TODO", "implement later", "handle edge cases", "similar to Task N", or "see the plan doc" placeholders. Every code block contains real code; every command has real arguments; every Verify has a concrete expected output.

**3. Type consistency:** `ColorPsychologyData` is the single shared interface defined in `types/supabase.ts` (Task 2). `ColorListItem` and `ColorInfo` are defined in `colorDataService.ts` (Task 4) and re-used wherever needed. `ColorData` in `colorData.ts` (Task 4) is a type alias for `ColorPsychologyData`, preserving existing component imports. Function names (`getAllColors`, `getColorBySlug`, `getAllColorSlugs`, `getAllColorNames`, `colorNameToSlug`, `slugToColorName`) are spelled identically across the snapshot script and the data service. Route param name is `color_name` everywhere.

---
