"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ColorCard, { ColorCardData } from "./ColorCard";
import {
  HUES,
  TEMPERATURES,
  Hue,
  Temperature,
  comboToParam,
} from "../utils/colorClassify";

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
  // The JSON module's default export contains the file's contents.
  const shape = (mod as unknown as { default: { rows: HubRow[] }; rows?: HubRow[] });
  cachedIndex = shape.default?.rows ?? shape.rows ?? [];
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

  const pushUrl = (nextHue: Hue | undefined, nextTemp: Temperature | undefined) => {
    const param = comboToParam({ hue: nextHue, temp: nextTemp });
    if (param) {
      startTransition(() => router.push(`/colors/${param}`));
    } else {
      // Empty (no filters) OR hue-only — no canonical URL for hue-only.
      // Stay where we are if hue-only; push to /colors only when truly cleared.
      if (!nextHue && !nextTemp) {
        startTransition(() => router.push("/colors"));
      }
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
    startTransition(() => router.push("/colors"));
  };

  const cards: ColorCardData[] = useMemo(() => {
    if (!hasInteracted || hubIndex === null) {
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
