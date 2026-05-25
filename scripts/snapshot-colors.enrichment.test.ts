import { describe, expect, it } from "vitest";
import {
  enrichColors,
  computeRelated,
  resolveComplementarySlugs,
  computeAlphabeticalNeighbors,
} from "./snapshot-colors";

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
    const enriched = enrichColors(FIXTURE);
    const coral = enriched.find((c) => c.color_name === "Coral Red")!;
    expect(coral.related).toHaveLength(3);
    expect(coral.related[0]).toBe("tomato");
  });

  it("resolveComplementarySlugs matches by RGB distance with threshold", () => {
    const enriched = enrichColors(FIXTURE);
    const coral = enriched.find((c) => c.color_name === "Coral Red")!;
    expect(coral.complementary_slugs).toContain("sky-blue");
  });

  it("computes alphabetical prev/next with null only at the boundaries", () => {
    const enriched = enrichColors(FIXTURE);
    // Alphabetical order: Black, Coral Red, Emerald, Forest, Lemon, Royal Blue, Sky Blue, Tomato
    const black = enriched.find((c) => c.color_name === "Black")!;
    const tomato = enriched.find((c) => c.color_name === "Tomato")!;
    expect(black.prev_slug).toBeNull();
    expect(black.next_slug).toBe("coral-red");
    expect(tomato.prev_slug).toBe("sky-blue");
    expect(tomato.next_slug).toBeNull();
    for (const c of enriched) {
      if (c !== black && c !== tomato) {
        expect(c.prev_slug).not.toBeNull();
        expect(c.next_slug).not.toBeNull();
      }
    }
  });
});
