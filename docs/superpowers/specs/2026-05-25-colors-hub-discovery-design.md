# `/colors` Hub Discovery + Cross-Color Navigation — Design Spec

**Date:** 2026-05-25
**Branch:** `colors-hub-discovery`
**Status:** Draft — pending user review

## Goal

Make the `/colors` hub and per-color detail pages actually browsable. Today the hub renders 1000 color cards in a single grid with non-functional search, filter, and pagination placeholders; the detail pages walk colors in arbitrary snapshot order and surface random "related" colors via `Math.random()`. This spec makes search, filter, and pagination real, ships per-category static URLs for SEO, and replaces the random navigation with deterministic precomputed neighbor and related-color lists.

## Non-goals (out of scope for this spec)

- Changing the visual design of the existing color cards, detail-page sections, or sticky `ColorNavigation` bar. We replace the data they consume, not their look.
- Refactoring `/palettes` — separate page, separate concerns.
- Refactoring the landing page or any marketing component.
- Server-side anything. Static export (`output: 'export'`) is preserved end-to-end.
- Persisting search/filter state across sessions or across pages.
- Personalized recommendations or telemetry — `related[]` is deterministic from the snapshot.
- New visual assets (no new OG images, swatches, or icons).
- Merging to `main`. Work lands on `colors-hub-discovery`; the user merges after review.

## Architecture

One Next.js application, fully static-exported. The same `<ColorsHub>` client component drives every hub-style route. URLs reflect filter state; filter state reflects URLs; there is no other source of truth.

```
/colors                          → ColorsHub (no initial filter)
/colors/red                      → ColorsHub (hue=red)
/colors/warm                     → ColorsHub (temp=warm)
/colors/red-warm                 → ColorsHub (hue=red, temp=warm)
/colors/<slug>                   → detail page (unchanged structure)
```

Empty combinations are skipped at build time. `dynamicParams = false` ensures unknown combos 404 at build, not runtime.

Three new build-time outputs (produced by an extended `scripts/snapshot-colors.mjs`):

1. **`colors.snapshot.json`** — extended with `hue`, `temperature`, `related[]`, `complementary_slugs[]`, `prev_slug`, `next_slug`.
2. **`hub-index.json`** — lean per-color rows for client-side filter/search: `{slug, name, hex, hue, temp, emotions[]}`. ~1000 rows; estimated 120–180 KB gzipped.
3. **`categories.json`** — set of non-empty `{hue}`, `{temp}`, and `{hue, temp}` combos with counts. Used by `generateStaticParams` and to render filter-chip badges.

The hub component server-renders the route's initial filtered slice (so the first paint is real content with no JS). On hydration, the chips and search box become interactive. On the first user interaction, `hub-index.json` is dynamic-imported and the grid switches to client-driven rendering. URL changes from chip toggles use `router.push` so the back button works.

Detail pages keep their existing layout. `RelatedColors` and `ColorNavigation` swap their data sources to precomputed snapshot fields; no runtime computation, no `Math.random()`, no array-index walking.

## File-level change set

### Create

- `app/colors/utils/colorClassify.ts` — pure functions: `hexToHue(hex) → Hue`, `hexToTemperature(hex) → Temperature`, `comboToParam({hue?, temp?}) → string`, `paramToCombo(segment) → {hue?, temp?} | null`. No I/O, no React. Shared between the snapshot script and the runtime by reading the same logic — the `.mjs` snapshot script imports a peer `.mjs` mirror at `scripts/lib/colorClassify.mjs` that is hand-kept in sync, OR (preferred) the `.ts` file is consumed by both sides via `tsx` execution. Choice of mechanism is left to the implementation plan; the requirement is "one canonical implementation."
- `app/colors/components/ColorsHub.tsx` — client component. Props: `initialHue?`, `initialTemp?`, `serverRenderedSlugs: string[]`. Owns: search input, hue chips, temperature chips, grid render, URL sync, dynamic import of `hub-index.json`.
- `app/colors/[combo]/page.tsx` — handles `/colors/<hue>`, `/colors/<temp>`, `/colors/<hue>-<temp>`. `generateStaticParams` reads `categories.json`. Server-renders the matching slice. Mounts `<ColorsHub>` with the route's initial filter state.
- `app/colors/data/hub-index.json` — generated; committed for reproducible builds (consistent with how `colors.snapshot.json` is handled today).
- `app/colors/data/categories.json` — generated; committed.
- `app/colors/utils/colorClassify.test.ts` — Vitest tests for the four classification functions. Table-driven, ~30 hex inputs with expected hue/temp.
- `scripts/lib/snapshotEnrichment.test.mjs` (or `.test.ts`, location follows the implementation choice above) — fixture of 8 colors; verifies `related[]` ordering, `complementary_slugs[]` resolution, alphabetical `prev_slug` / `next_slug`.
- `vitest.config.ts` — minimal config; tests live next to source.

### Modify

- `scripts/snapshot-colors.mjs` — after fetching from Supabase (or reading existing cache), enrich each row:
  - `hue` and `temperature` from `hexToHue` / `hexToTemperature`.
  - `related[]` — 3 nearest by hue distance, excluding self and any slugs that will appear in `complementary_slugs[]`.
  - `complementary_slugs[]` — for each hex in the source `complementary_colors` array, find the named color with smallest RGB Euclidean distance, threshold ≤ 60 in 0–255 space, cap at 3 results.
  - `prev_slug` / `next_slug` — alphabetical neighbors of `color_name.toLowerCase()` using `Intl.Collator('en', { sensitivity: 'base' })`. First color has `prev_slug: null`; last has `next_slug: null`.
  - Build-time assertions: every enriched row has `hue`, `temperature`, `related.length >= 3`, and `(prev_slug === null) XOR (slug !== firstSlug)` (i.e., only the first/last get null). Throw loudly on violation — matches the existing "throw on missing env vars" pattern.
  - Write `hub-index.json` and `categories.json` alongside the snapshot.
- `app/colors/page.tsx` — replace the placeholder search/filter/pagination UI with `<ColorsHub serverRenderedSlugs={allSlugs} />`. Keep the page title and intro copy.
- `app/colors/[color_name]/page.tsx` — drop the `allColorSlugs` prop threading. `<RelatedColors>` and `<ColorNavigation>` now read directly from the color's own snapshot row.
- `app/colors/components/RelatedColors.tsx` — read `related[]` + `complementary_slugs[]` from props (or via a small lookup util that takes a slug and returns the snapshot row). Render the 3 + up-to-3 mix. Delete the broken `<style jsx global>` hardcoded-CSS-vars block. Each swatch's background uses the looked-up hex directly.
- `app/colors/components/ColorNavigation.tsx` — read `prev_slug` / `next_slug` from props (passed in from the page). Remove the `currentIndex` / `Array.indexOf` walking logic. Disabled state when either is `null`.
- `app/colors/utils/colorDataService.ts` — add `getColorSummaries(slugs: string[])` for components that need name+hex lookups by slug (used by `RelatedColors` to render swatches). Keep existing signatures intact.
- `package.json` — add devDependencies: `vitest`, `@vitest/coverage-v8` (optional). Add scripts:
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`
- `next.config.mjs` — no change required (already configured for static export).

### Delete

- The placeholder search input, filter buttons, and pagination block in `app/colors/page.tsx` (replaced by `<ColorsHub>`).
- The `<style jsx global>` block in `RelatedColors.tsx` (hardcoded broken CSS vars).

### Unchanged

- `ColorHeader`, `ColorPalettes`, `IndustryUseCases`, `HowToPair`, `RealWorldExamples`, `ColorCTA`, `ColorStructuredData` components.
- `app/colors/[color_name]/page.tsx` metadata / structured-data logic.
- `next.config.mjs`, GitHub Pages workflow, snapshot env-var handling.

## Algorithms

### Hue classification (`hexToHue`)

Convert hex → HSL. Apply rules in order; first match wins:

1. `lightness < 8%` → `gray` (essentially black; black is grouped into the gray chip to keep the chip set short and avoid a near-empty chip).
2. `saturation < 12%` → `gray` (covers grays, whites, beiges regardless of hue).
3. `(hue ∈ [0, 30] ∪ [330, 360]) AND lightness < 40% AND saturation < 60%` → `brown` (warm, dark, low-chroma).
4. Hue band assignment:
   - `red`: 345–360 ∪ 0–15
   - `orange`: 15–45
   - `yellow`: 45–65
   - `green`: 65–165
   - `teal`: 165–195
   - `blue`: 195–250
   - `purple`: 250–290
   - `pink`: 290–345

Result vocab: `red | orange | yellow | green | teal | blue | purple | pink | brown | gray`. Exactly 10 chips.

### Temperature classification (`hexToTemperature`)

1. `saturation < 12%` → `neutral` (matches the gray-chip carve-out from `hexToHue`).
2. Else if hue ∈ [0, 80] ∪ [310, 360] → `warm`.
3. Else if hue ∈ [170, 270] → `cool`.
4. Else → `neutral` (greens 80–170, magentas 270–310).

Result vocab: `warm | cool | neutral`. Exactly 3 chips.

Accepted edge: a green that subjectively reads as cool will be classified `neutral`. We never mis-classify a green as `warm`.

### Related colors (`related[]`)

For each color C:
1. Build the list of other colors with their HSL hue values.
2. Distance to each = `min(|hue_C − hue_other|, 360 − |hue_C − hue_other|)`.
3. Sort ascending by distance; stable tiebreak by slug.
4. Drop any slug that will appear in C's `complementary_slugs[]` (computed first).
5. Take the first 3.

If the set has fewer than 4 colors total (unreachable with 1000), `related[]` can be shorter; the build assertion `related.length >= 3` would fail loudly.

### Complementary slug resolution (`complementary_slugs[]`)

For each hex `H` in the source `complementary_colors` array:
1. For every named color in the set, compute RGB Euclidean distance `√((rH−r)² + (gH−g)² + (bH−b)²)` in 0–255 space.
2. Take the smallest distance.
3. If that distance ≤ 60, append the matching color's slug. Otherwise drop.
4. Cap at 3 results total per color.

Threshold 60 is a heuristic; the plan includes a verification pass with a spot-check sample to confirm the resolved matches look reasonable, with explicit permission to tune.

### Alphabetical neighbors (`prev_slug`, `next_slug`)

```
collator = new Intl.Collator('en', { sensitivity: 'base' })
sorted = [...colors].sort((a, b) => collator.compare(a.color_name, b.color_name))
for i, color of sorted:
  color.prev_slug = i > 0 ? sorted[i-1].slug : null
  color.next_slug = i < sorted.length - 1 ? sorted[i+1].slug : null
```

No wraparound. First/last entries see disabled prev/next buttons.

### Combo enumeration (`categories.json`)

After classifying every color:
- Group by `hue` → emit `{kind: "hue", value, count}` for each non-empty hue.
- Group by `temperature` → emit `{kind: "temp", value, count}` for each non-empty temperature.
- Group by `(hue, temperature)` → emit `{kind: "combo", hue, temp, count}` for each non-empty pair.

`generateStaticParams` in `app/colors/[combo]/page.tsx` reads this file and returns one entry per record, mapped to URL segments:

- `{kind: "hue", value: "red"}` → segment `red`
- `{kind: "temp", value: "warm"}` → segment `warm`
- `{kind: "combo", hue: "red", temp: "warm"}` → segment `red-warm`

The route parser (`paramToCombo`) splits the incoming segment on `-`:
- Two parts: treat as `<hue>-<temp>`.
- One part matching a known hue: hue-only.
- One part matching a known temp: temp-only.
- Anything else: `null` → 404 via `notFound()`.

### Search

Triggered on input in the hub search box. Apply to the current filtered set (i.e., respect active hue/temp).

For each row in the filtered set, compute a match boolean as the OR of:
- **Name match:** `row.name.toLowerCase().includes(query.toLowerCase())`.
- **Emotions match:** any `row.emotions[i].toLowerCase().includes(query.toLowerCase())`.
- **Hex match:** only if the (stripped of leading `#`) query is 1–6 hex chars. Then `row.hex.toLowerCase().startsWith('#' + strippedQuery.toLowerCase())`.

Debounce input by 120 ms. Synchronous filter on 1000 rows is sub-millisecond; debounce exists only to coalesce keystroke thrash.

When filters are active AND the result count is < 5, render a "Search across all colors" link that strips filters and re-runs the search globally. (Same URL change as clicking off all chips; preserves the query in component state.)

## Data flow at runtime

1. User hits `/colors/red-warm`. Static HTML includes red+warm color cards above the fold, the active chips highlighted, and the search box empty.
2. Hydration mounts `<ColorsHub>` with `initialHue="red"`, `initialTemp="warm"`, and the server-rendered slug list.
3. User types in the search box. On the first keystroke, `import('@/app/colors/data/hub-index.json')` runs (cached for subsequent interactions). Filter logic switches from "use server-rendered slugs" to "filter `hub-index.json` by current chip state, then by query".
4. User toggles the `warm` chip off. `router.push('/colors/red')`. Next serves the pre-rendered `/colors/red` HTML. The component re-mounts (or syncs state from URL params, depending on the router behavior); search query is preserved by reading from a sessionStorage key.
5. User clicks a color card. Navigate to `/colors/<slug>`. Detail page renders `RelatedColors` using `data.related` + `data.complementary_slugs`, and `ColorNavigation` using `data.prev_slug` / `data.next_slug`.

## Error handling

- **Build-time:** Snapshot script asserts each row has `hue`, `temperature`, `related.length >= 3`, and well-formed prev/next pointers. Failure throws and exits non-zero. CI catches it.
- **Build-time:** `categories.json` cannot contain a record with `count: 0`. Build assertion.
- **Runtime: unknown route segment** — `paramToCombo` returns `null` → `notFound()` → Next's 404 page.
- **Runtime: empty filtered set after search** — render a "No colors match" card with a "Clear search" button and reminders of the active chips.
- **Runtime: dynamic import failure for `hub-index.json`** — extremely unlikely with static export, but caught and rendered as a static error card with a "Reload" link.
- **Runtime: complementary hex with no resolvable slug** — already handled at build time (those hexes are dropped from `complementary_slugs[]`). `RelatedColors` falls through to showing only the 3 nearest-hue picks.

## SEO considerations

- Every pre-rendered hub combo (`/colors`, `/colors/red`, `/colors/warm`, `/colors/red-warm`) is a real static HTML file containing real color cards above the fold — crawlable without JS.
- Per-combo `<title>` and `<meta name="description">` reflect the filter (e.g., "Warm Red Colors — Meaning & Use"). Generated in `generateMetadata` from the combo parsed by `paramToCombo`.
- Canonical URLs point to the combo's own URL; `/colors/red-warm` does not declare itself canonical to `/colors/red`.
- `ColorStructuredData` on detail pages is unchanged.
- `public/sitemap.xml` should be regenerated by the snapshot script to include all hub combo URLs in addition to detail-page URLs. (Same hook as the existing build flow; one extra write.)

## Testing strategy

**Automated (Vitest):**

- `colorClassify.test.ts` — table-driven tests covering ≥ 30 hex inputs across all hue bands, all temperature buckets, plus boundary cases (saturation right at 12%, lightness right at 8%, hue right at 0/360 wraparound).
- Snapshot enrichment test — fixture of 8 hand-picked colors covering all hues; assert exact `related[]` orderings, `complementary_slugs[]` results given a known threshold, and alphabetical `prev_slug` / `next_slug` chain.

**Manual (in implementation plan):**

- `pnpm test` exits 0.
- `pnpm build` exits 0; no warnings about dynamic features.
- `out/colors/index.html` exists and contains hub UI.
- `out/colors/red/index.html`, `out/colors/warm/index.html`, `out/colors/red-warm/index.html` exist.
- Empty combos do **not** have output (spot-check by listing `out/colors/` for any combo that classification predicts empty).
- `pnpm dev` and walk:
  - Navigate `/colors`. Type "ff5". Coral Red appears in results.
  - Click `red` chip. URL becomes `/colors/red`. Grid shows only red colors.
  - Click `warm` chip. URL becomes `/colors/red-warm`. Grid narrows further.
  - Click a coral red card. Detail page loads.
  - `RelatedColors` shows 3 + up-to-3 colors; all swatches render with their actual hex (not the broken hardcoded vars).
  - Sticky prev/next walks alphabetically (e.g., from "Coral Red", next is the color whose name comes next alphabetically).
  - Hard reload at `/colors/red-warm`. First byte HTML contains red+warm color cards (verify via `view-source:`).

## Risks and mitigations

- **Heuristic thresholds (8%, 12%, 60%, 40%, distance ≤ 60) misclassify some colors.** Mitigation: spot-check pass during implementation with permission to tune. Tests pin the chosen thresholds so regressions are caught.
- **`hub-index.json` payload growth.** At 1000 rows × ~150 bytes per row ≈ 150 KB raw, ~50 KB gzipped. Acceptable. If it grows by 5–10×, revisit (route-scoped lazy loading or per-hue shards).
- **Combo explosion in URL surface.** With 10 hues × 3 temps = up to 30 combo URLs, plus 13 single-axis URLs. ~43 hub-style URLs total — comfortable for a sitemap and crawl budget.
- **Search "across all colors" link can confuse users about why their filters disappeared.** Mitigation: explicit copy ("Clear filters and search across all colors") rather than a single-word link.
- **Single source of `colorClassify` between Node script (.mjs) and TS runtime.** Two options exist (mirror file vs `tsx` execution); the implementation plan picks one. Risk is drift between the two if the mirror path is chosen and a future edit lands in only one file. Mitigation if mirror is chosen: a Vitest snapshot test that imports both and asserts equality on a fixed sample.

## Migration plan

All work on `colors-hub-discovery`. Detailed step ordering lives in the implementation plan; high-level shape:

1. Add `colorClassify.ts` + Vitest config + classification tests. Land green tests before touching any runtime code.
2. Extend `scripts/snapshot-colors.mjs` to compute `hue`, `temperature`, `related[]`, `complementary_slugs[]`, `prev_slug`, `next_slug` and write `hub-index.json` + `categories.json`.
3. Run the snapshot locally. Sanity-check `categories.json` chip distribution (no near-empty chips, no surprising combos).
4. Build `<ColorsHub>` with chips + search + grid. Test in isolation against the new JSON outputs.
5. Add `app/colors/[combo]/page.tsx` with `generateStaticParams` reading `categories.json`.
6. Replace placeholder UI in `app/colors/page.tsx` with `<ColorsHub>`.
7. Update `RelatedColors.tsx` and `ColorNavigation.tsx` to consume precomputed fields. Delete the broken CSS-vars block.
8. `pnpm build`. Verify combo URLs and empty-combo skipping.
9. Manual UX walkthrough in `pnpm dev`.
10. Commit on `colors-hub-discovery`. Open PR.
11. User reviews; merge to `main` when satisfied.

## Open questions

- **`colorClassify` sharing mechanism.** `.mjs` mirror with a parity test, vs. invoking the snapshot script via `tsx` so it can `import` the `.ts` file directly. Recommend `tsx` for single-source-of-truth; final call is in the implementation plan.
- **Search query persistence on chip toggle.** Reading from `sessionStorage` on every mount works but adds a small flash. Alternative: lift `<ColorsHub>` state to a context provider mounted in `app/colors/layout.tsx` so it survives route changes within `/colors/*`. Recommend the layout-context approach if the route transition between combo pages doesn't already preserve component state cleanly.

Both questions are implementation-level and don't block design approval.
