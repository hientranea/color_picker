# SEO Operational Checklist

A runbook for the human operator. Everything in here is manual — the build pipeline already covers sitemap generation, canonical tags, and structural validation. This document covers what only a human with Google Search Console (GSC) access can do.

Tied to spec: `docs/superpowers/specs/2026-06-06-seo-audit-design.md`.

## 1. One-time property setup

- Verify `colorone.site` is a registered property in GSC at https://search.google.com/search-console.
- The property MUST match the apex domain (no `www.`) — this matches `CNAME` and `app/config.ts` (`https://colorone.site`).
- Verification method: prefer DNS TXT record. Note which method is in use so you can re-verify after DNS changes.

## 2. Sitemap submission

- In GSC → Sitemaps, submit the path `sitemap.xml` (relative — GSC prepends the property URL).
- Expected first-fetch result: **Success**, **Discovered URLs ≈ 1004** (4 static + 1000 colors). The number tracks the snapshot, so it will grow as colors are added.
- Re-submission is automatic on each Google crawl. You only need to manually re-submit if the URL count drops unexpectedly or GSC reports a fetch error.

## 3. Indexing verification (post-deploy)

After each release deploy, spot-check via GSC → URL Inspection:
- `https://colorone.site/`
- `https://colorone.site/colors`
- One random `https://colorone.site/colors/<slug>` (pick from the snapshot)

Acceptable states:
- **URL is on Google** — fully indexed.
- **Crawled - currently not indexed** — normal for new low-traffic pages; resolves over weeks as authority builds. Do not try to force.

Action-required states:
- **Discovered - currently not indexed** for >2 weeks — quality/duplicate signal. Investigate; don't try to force re-indexing.
- **URL is not on Google** with a specific error reason — see Section 4.

## 4. Coverage monitoring

Once per release cycle, check GSC → Pages report. These four failure modes can only be detected post-crawl:

- **Soft 404** — Google fetched the page and decided it has no real content. In our codebase, this means a color page rendered with empty or placeholder snapshot data. Check `app/colors/data/colors.snapshot.json` for the offending slug.
- **Duplicate without user-selected canonical** — Google picked a different URL as canonical than we declared. Means the `<link rel="canonical">` tag is missing on that page, or points at a URL Google considers a duplicate of another. Check `app/colors/[color_name]/page.tsx` (or the relevant route's `Metadata` export).
- **Blocked by robots.txt** — `public/robots.txt` regressed. The current file allows everything except `/api/`; if you see this error on any non-`/api/` URL, the file was edited.
- **Page with redirect** — Google followed a redirect chain instead of indexing the URL directly. Most likely cause: trailing-slash drift between sitemap (no trailing slash) and emitted HTML (`<path>/index.html`). Confirm the sitemap and the canonical tags use the same form.

## 5. Out of scope

The following are intentionally NOT covered by this checklist or the build pipeline:

- **IndexNow / Bing Webmaster Tools** — separate workstream if/when Bing traffic becomes meaningful.
- **Core Web Vitals tuning** — the `/colors` index page renders 1000 cards in a single static grid; LCP and CLS may need work, tracked separately.
- **Functional search/filter on `/colors`** — the search input and Warm/Cool/Neutral buttons are decorative today. Static `<Link>` cards keep all detail pages crawlable, so indexing is not blocked on this.
- **JSON-LD structured data on `/` and `/palettes`** — only the color detail pages currently emit structured data (`ColorStructuredData`). Adding more is a follow-up SEO ticket.
