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
  const cases: Array<[string, Hue]> = [
    ["#FF0000", "red"],
    ["#FF5733", "red"],
    ["#FFA500", "orange"],
    ["#FFFF00", "yellow"],
    ["#00FF00", "green"],
    ["#50C878", "green"],
    ["#008080", "teal"],
    ["#0000FF", "blue"],
    ["#4169E1", "blue"],
    ["#800080", "purple"],
    ["#FFC0CB", "pink"],
    ["#A52A2A", "brown"],
    ["#808080", "gray"],
    ["#FFFFFF", "gray"],
    ["#000000", "gray"],
    ["#1A1A1A", "gray"],
  ];
  it.each(cases)("classifies %s as %s", (hex, expected) => {
    expect(hexToHue(hex)).toBe(expected);
  });

  it("handles hue wraparound at 360°", () => {
    expect(hexToHue("#FF0001")).toBe("red");
  });

  it("respects the brown override before orange", () => {
    expect(hexToHue("#5C2E0B")).toBe("brown");
  });

  it("treats low-saturation colors as gray regardless of hue", () => {
    expect(hexToHue("#888899")).toBe("gray");
  });

  it("throws on malformed hex input", () => {
    expect(() => hexToHue("not-a-hex")).toThrow(/invalid hex/);
    expect(() => hexToHue("#FF")).toThrow(/invalid hex/);
    expect(() => hexToHue("")).toThrow(/invalid hex/);
  });
});

describe("hexToTemperature", () => {
  const cases: Array<[string, Temperature]> = [
    ["#FF0000", "warm"],
    ["#FF5733", "warm"],
    ["#FFA500", "warm"],
    ["#FFFF00", "warm"],
    ["#00FF00", "neutral"],
    ["#008080", "cool"],
    ["#0000FF", "cool"],
    ["#800080", "neutral"],
    ["#FF00FF", "neutral"],
    ["#FFC0CB", "warm"],
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
    expect(paramToSegment("warm-red", slugs)).toBeNull();
  });

  it("recognizes color slugs not shadowed by combos", () => {
    expect(paramToSegment("coral-red", slugs)).toEqual({ kind: "slug", slug: "coral-red" });
    expect(paramToSegment("royal-blue", slugs)).toEqual({ kind: "slug", slug: "royal-blue" });
  });

  it("combo wins precedence over slug if both could match", () => {
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
