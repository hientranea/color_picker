# SEO Audit & Sitemap Generation — Design Spec

**Date:** 2026-06-06
**Branch:** TBD (feature branch off `main`)
**Status:** Draft — pending user review

## Goal

Get the full color_picker site — including the 1000 static `/colors/<slug>` pages added in the May static-export work — discoverable and correctly indexed by Google. The committed `public/sitemap.xml` is hand-written and lists only `/`, `/palettes`, `/privacy-policy`, so Googlebot currently has no signal for the new `/colors` index or any of the 1000 color detail pages.

The scope is the whole app's SEO surface, not just `/colors`: sitemap, canonical URLs, robots.txt, and a documented Google Search Console operational workflow.

## Non-goals (out of scope for this spec)

- IndexNow / Bing Webmaster Tools submission.
- Performance / Core Web Vitals tuning (the 1000-card `/colors` index page is heavy; that's a separate ticket).
- Wiring up the non-functional search input and Warm/Cool/Neutral filter buttons on `/colors` — they are decorative placeholders today, but the static `<Link>` cards keep every detail page crawlable regardless, so SEO is not blocked on UX work.
- JSON-LD structured data on `/` and `/palettes` (the existing `ColorStructuredData` on detail pages stays as-is; adding more is a follow-up).
- Per-page metadata content review (titles/descriptions on `/`, `/palettes`, `/privacy-policy`) — assumed acceptable; this spec only adds canonical tags and the sitemap.
- URL structure changes (e.g., `/color/<slug>` vs `/colors/<slug>`). Current paths stay.

## Architecture

A single Node build-time script generates `public/sitemap.xml` from the existing color snapshot plus a small inline static-routes config. Next's static export then copies `public/` into `out/`, so the file lands at `out/sitemap.xml` at deploy time. A second Node script validates the generated sitemap after `next build` and fails the build (and therefore the GitHub Pages deploy) if the sitemap is missing, malformed, or references URLs that don't exist on disk.

Both scripts run via standard npm lifecycle hooks (`prebuild`, `postbuild`), so they fire automatically in the existing `.github/workflows/publish.yml` job without any workflow-file changes.

Canonical URL tags are added to every route's Next.js `Metadata` export, using the `alternates.canonical` field. Next resolves these against the existing `metadataBase` in `app/metadata.ts`. `/palettes` already declares its canonical (in `app/palettes/metadata.ts`) and is left as-is.

Operational guidance for Google Search Console — sitemap submission, indexing verification, and coverage-report monitoring — is documented in `docs/seo-checklist.md` for the human operator. Nothing in GSC is automated.

## File-level change set

### Create

- `scripts/generate-sitemap.mjs` — Node ESM script. Reads `app/colors/data/colors.snapshot.json` and an inline static-routes config. Emits `public/sitemap.xml`. Behavior:
  - Base URL from `process.env.NEXT_PUBLIC_APP_URL`, falling back to `https://colorone.site` (mirrors `app/config.ts`).
  - URL format: no trailing slash (matches the existing sitemap and Next's default export output).
  - Static routes config (in script):
    - `/` — `changefreq: weekly`, `priority: 1.0`, images: `/hero-tool.png`, `/hero-advance-harmony.png`.
    - `/palettes` — `changefreq: daily`, `priority: 0.8`, image: `/hero-advance-variations.png`.
    - `/colors` — `changefreq: weekly`, `priority: 0.7`.
    - `/privacy-policy` — `changefreq: monthly`, `priority: 0.5`.
  - For each entry in `snapshot.colors`: emit `<url>` for `/colors/<slug>`, `changefreq: monthly`, `priority: 0.6`.
  - `lastmod` = `YYYY-MM-DD` from the snapshot file's mtime for color URLs, and from the script's run time (build date) for static routes.
  - XML schema: `urlset` with `xmlns:image` declared, matching the existing sitemap shape so the image annotations from the static-routes config carry through.
- `scripts/validate-sitemap.mjs` — Node ESM script. Reads `out/sitemap.xml` and asserts:
  1. File exists and parses as well-formed XML.
  2. URL count equals `staticRoutes.length + snapshot.colors.length` (currently `4 + 1000 = 1004`).
  3. Every `<loc>` starts with the configured base URL.
  4. No duplicate `<loc>` values.
  5. For every URL, the corresponding `out/<path>/index.html` (or `out/index.html` for `/`) exists. This is the load-bearing assertion: it catches the silent-drift case where the sitemap promises a URL but the build didn't actually produce it.
  6. `out/robots.txt` exists and contains the absolute sitemap URL (`https://colorone.site/sitemap.xml`).
  - On failure: print the failing assertion + a one-line remediation hint, exit 1.
  - On success: print `✓ sitemap.xml: <N> URLs, all reachable` and exit 0.
- `docs/seo-checklist.md` — operator-facing GSC runbook. Sections:
  1. **One-time property setup** — confirm `colorone.site` is verified in GSC; confirm apex vs `www` matches `CNAME` and `app/config.ts` (currently apex).
  2. **Sitemap submission** — submit path `sitemap.xml` in GSC → Sitemaps; expected first-fetch result: Success, discovered URLs ≈ 1004; no manual re-submit needed on subsequent deploys.
  3. **Indexing verification (post-deploy)** — spot-check `/`, `/colors`, and one random `/colors/<slug>` via URL Inspection; "URL is on Google" or "Crawled - currently not indexed" are both acceptable initial states for new pages.
  4. **Coverage monitoring** — once per release cycle, check GSC → Pages for the four failure modes the build validator cannot catch: Soft 404 (empty snapshot data), Duplicate without user-selected canonical (canonical tag missing/wrong), Blocked by robots.txt (robots regression), Page with redirect (trailing-slash drift).
  5. **Out of scope** — IndexNow, Core Web Vitals, the placeholder search/filter UI on `/colors`.

### Modify

- `app/metadata.ts` — add `alternates: { canonical: "/" }` to the root `Metadata` export. Next resolves it against the existing `metadataBase: siteConfig.metadataBase` declared in the same file.
- `app/privacy-policy/page.tsx` — add `alternates: { canonical: "/privacy-policy" }` to its `Metadata` export.
- `app/colors/page.tsx` — add `alternates: { canonical: "/colors" }` to the existing `Metadata` export.
- `app/colors/[color_name]/page.tsx` — in `generateMetadata`, add `alternates: { canonical: \`/colors/${colorSlug}\` }` to the returned `Metadata`.
- `package.json` — modify scripts:
  - Replace the existing `"prebuild": "pnpm run snapshot:colors"` with `"prebuild": "pnpm run snapshot:colors && node scripts/generate-sitemap.mjs"`. Order matters: snapshot must regenerate first so the sitemap reads fresh data.
  - Add `"postbuild": "node scripts/validate-sitemap.mjs"`.
- `.gitignore` — add `public/sitemap.xml` so the generated file is not committed.

### Delete

- `public/sitemap.xml` — the hand-written file. After this lands, the file is regenerated on every build.

### Unchanged

- `public/robots.txt` — its `Sitemap: https://colorone.site/sitemap.xml` directive already points at the right URL.
- `.github/workflows/publish.yml` — npm lifecycle hooks fire automatically inside the existing `next build` step; no workflow change needed.
- `next.config.mjs` — no config changes; `output: 'export'` already copies `public/` into `out/`.

## Data flow

```
colors.snapshot.json ──┐
                       ├──► generate-sitemap.mjs ──► public/sitemap.xml
static-routes config ──┘
                                                            │
                                            next build (output: export)
                                                            │
                                                            ▼
                                                    out/sitemap.xml
                                                            │
                                                            ▼
                                              validate-sitemap.mjs
                                                            │
                                              ┌─────────────┴─────────────┐
                                              ▼                           ▼
                                     pass: deploy proceeds       fail: exit 1, deploy skipped
```

After deploy, the human operator follows `docs/seo-checklist.md` for GSC submission and monitoring.

## Validation

**Build-time (automated, in CI):**
- `prebuild` generates `public/sitemap.xml` from the snapshot.
- `next build` static-exports the site, copying `public/` into `out/`.
- `postbuild` runs `validate-sitemap.mjs`, which asserts the six checks above. Non-zero exit fails the build and the GitHub Pages deploy step is skipped (already gated on build success in the existing workflow).
- Local feedback: `pnpm build` reproduces the same flow end-to-end with no network calls.

**Post-deploy (manual, via GSC, per `docs/seo-checklist.md`):**
- First deploy: submit sitemap in GSC, expect ≈1004 discovered URLs.
- Each release: scan the Pages coverage report for the four failure modes (Soft 404, Duplicate without canonical, Blocked by robots, Page with redirect).

## Risks and mitigations

- **Snapshot drift from generated sitemap.** If the snapshot is regenerated but the sitemap script isn't re-run, the sitemap and the actual built pages can disagree. Mitigation: both run as part of `prebuild` (snapshot first, then sitemap), so any `next build` produces a self-consistent pair. The "URL → file on disk" assertion in `validate-sitemap.mjs` is the safety net.
- **`NEXT_PUBLIC_APP_URL` misconfiguration in CI.** A wrong base URL would produce a sitemap full of broken absolute links. Mitigation: the validator asserts every `<loc>` starts with the expected base URL; mismatch fails the build before deploy.
- **Trailing-slash drift between sitemap and emitted HTML.** Sitemap uses no-trailing-slash. Next static export emits `<path>/index.html`, which GH Pages serves at both `/<path>` and `/<path>/`. Either form works; we standardize on no-trailing-slash in sitemap and canonical tags to match the existing sitemap shape. Risk is low — flagged in the GSC checklist under "Page with redirect" as something to watch.
- **`out/` doesn't exist when validator runs.** Only possible if `next build` failed, in which case npm short-circuits and `postbuild` doesn't run. No special handling needed.

## Success criteria

- After this lands and is deployed, `https://colorone.site/sitemap.xml` returns a 200 with 1004 URLs covering `/`, `/palettes`, `/colors`, `/privacy-policy`, and every `/colors/<slug>`.
- Every page in the site emits a `<link rel="canonical">` tag matching its absolute URL (root, `/palettes`, `/privacy-policy`, `/colors`, and each `/colors/<slug>`).
- A subsequent `pnpm build` with a stale snapshot (e.g., a color removed from the data source) fails the postbuild validator instead of silently shipping a sitemap with a broken URL.
- GSC sitemap submission completes successfully, and the Pages coverage report after the first crawl shows no systemic indexing errors across the new `/colors/<slug>` URLs.
