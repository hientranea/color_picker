# Narrow `getAllColors` Select Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop Next.js from logging "Failed to set Next.js data cache, items over 2MB can not be cached (2940788 bytes)" on `/colors` by narrowing the Supabase `select` in `getAllColors` to only the columns the listing page renders.

**Architecture:** `getAllColors` currently fetches every column (including large JSONB fields like `industry_use_cases`, `seo_meta`, `real_world_examples`, `how_to_pair`, `suggested_palettes`) for every row, producing a ~2.94 MB payload. The `/colors` index page only reads `color_name`, `hex_code`, and `emotional_associations`. We narrow the select to those three columns and introduce a lighter return type so the cache stays under Next.js's 2 MB ceiling. The detail page (`/colors/[color_name]`) uses a different function (`getColorBySlug`) and is unaffected.

**Tech Stack:** Next.js 14.2.5 (App Router, RSC), TypeScript, Supabase JS, pnpm.

---

### Task 1: Narrow `getAllColors` to list-page columns and introduce `ColorListItem`

**Goal:** Reduce the `getAllColors` payload below the Next.js 2 MB fetch-cache limit so the warning stops, while keeping the `/colors` page rendering exactly as before.

**Files:**
- Modify: `app/colors/utils/colorDataService.ts` (export new `ColorListItem` type; change `getAllColors` signature, select, and mapping)
- Modify: `app/colors/page.tsx` (import the new `ColorListItem` type — only if a local annotation references the old `ColorInfo` shape; otherwise no change beyond the implicit type update flowing through)

**Acceptance Criteria:**
- [ ] `app/colors/utils/colorDataService.ts` exports a `ColorListItem` interface with exactly: `slug: string`, `color_name: string`, `hex_code: string`, `emotional_associations: string[]`.
- [ ] `getAllColors` returns `Promise<ColorListItem[]>` and its Supabase call is `select("color_name, hex_code, emotional_associations")`.
- [ ] `getAllColors` still applies `ensureArray` to `emotional_associations` (defensive against JSONB string rows).
- [ ] `getColorBySlug`, `getAllColorSlugs`, `getAllColorNames`, `colorNameToSlug`, `slugToColorName`, and the existing `ColorInfo` interface remain untouched in behavior and exported shape.
- [ ] `app/colors/page.tsx` still renders the listing grid using `color.slug`, `color.data.color_name`, `color.data.hex_code`, and `color.data.emotional_associations` (the only fields it reads today).
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `pnpm lint` passes (no new warnings introduced by this change).
- [ ] After restarting/hot-reloading the dev server and visiting `/colors`, `/tmp/nextdev.log` contains no new occurrences of `Failed to set fetch cache` for the `color_psychology_data` request.

**Verify:**
1. `npx tsc --noEmit` → exits 0.
2. `pnpm lint` → exits 0, no new warnings about this file.
3. With `pnpm dev` running and logging to `/tmp/nextdev.log`: truncate the log (`: > /tmp/nextdev.log`), hit `http://localhost:3000/colors`, then `grep -c "Failed to set fetch cache" /tmp/nextdev.log` → output `0`.
4. Visual check at `http://localhost:3000/colors`: grid renders all swatches with hex code badge and up to 3 emotional-association pills per card, identical to before the change.

**Steps:**

- [ ] **Step 1: Add `ColorListItem` interface above `ColorInfo` in `app/colors/utils/colorDataService.ts`**

After the existing imports and before `export interface ColorInfo`, insert:

```ts
export interface ColorListItem {
  slug: string;
  color_name: string;
  hex_code: string;
  emotional_associations: string[];
}
```

Keep the existing `ColorInfo` interface as-is — `getColorBySlug` still returns the full `ColorPsychologyData`.

- [ ] **Step 2: Rewrite `getAllColors` to use the narrowed select and new return type**

Replace the existing `getAllColors` function (currently lines 64–90) with:

```ts
// Get all colors (list-page projection) from Supabase
export async function getAllColors(): Promise<ColorListItem[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("color_psychology_data")
    .select("color_name, hex_code, emotional_associations");

  if (error) {
    console.error("Error fetching colors:", error);
    return [];
  }

  return data.map((color) => ({
    slug: colorNameToSlug(color.color_name),
    color_name: color.color_name,
    hex_code: color.hex_code,
    emotional_associations: ensureArray(color.emotional_associations),
  }));
}
```

Note: this flattens the previous `{ slug, data: { ... } }` shape into `{ slug, color_name, hex_code, emotional_associations }`. The page template will be updated to match in Step 3.

- [ ] **Step 3: Update `app/colors/page.tsx` to read from the flat shape**

In `app/colors/page.tsx`, replace every `color.data.color_name`, `color.data.hex_code`, and `color.data.emotional_associations` with `color.color_name`, `color.hex_code`, and `color.emotional_associations` respectively. Specifically:

- Line 78 (`style={{ backgroundColor: color.data.hex_code }}`) → `color.hex_code`
- Line 82 (`{color.data.hex_code}`) → `{color.hex_code}`
- Line 87 (`{color.data.color_name}`) → `{color.color_name}`
- Lines 95, 103, 104, 111, 113 (`color.data.emotional_associations` × 3 reads) → `color.emotional_associations`

No other lines in `page.tsx` need to change. `color.slug` references stay as-is.

- [ ] **Step 4: Type-check**

Run:

```bash
npx tsc --noEmit
```

Expected: exits 0 with no output. If errors mention `data` being missing on a color object, you missed a `color.data.X` → `color.X` rewrite in Step 3; fix and re-run.

- [ ] **Step 5: Lint**

Run:

```bash
pnpm lint
```

Expected: exits 0. No new warnings about `colorDataService.ts` or `app/colors/page.tsx`.

- [ ] **Step 6: Empirically verify the warning is gone**

With `pnpm dev` already running (and writing to `/tmp/nextdev.log`):

```bash
: > /tmp/nextdev.log
curl -s -o /dev/null http://localhost:3000/colors
grep -c "Failed to set fetch cache" /tmp/nextdev.log
```

Expected final output: `0`.

Then open `http://localhost:3000/colors` in a browser and confirm the grid renders identically to before: every card has its hex-code badge, color name, and up to 3 emotional-association pills.

- [ ] **Step 7: Commit**

```bash
git add app/colors/utils/colorDataService.ts app/colors/page.tsx
git commit -m "$(cat <<'EOF'
perf(colors): narrow getAllColors select to listing-page columns

The /colors index page only renders color_name, hex_code, and
emotional_associations, but getAllColors was selecting every column
including large JSONB fields. The ~2.94 MB response exceeded Next.js's
2 MB fetch-cache limit, causing "Failed to set fetch cache" warnings
on every request and forcing a re-fetch of the full table.

Narrowing the select to the three rendered columns drops the payload
well under the cache ceiling and removes the warning.
EOF
)"
```
