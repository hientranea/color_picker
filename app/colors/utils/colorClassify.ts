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
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error(`hexToHSL: invalid hex string "${hex}"`);
  }
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
  if (l < 0.08) return "gray";
  if (s < 0.12) return "gray";
  // Brown carve-out: dark, desaturated reds/oranges in [0,30] ∪ [330,360]
  const inWarmRedOrange = (h >= 0 && h <= 30) || (h >= 330 && h <= 360);
  if (inWarmRedOrange && l <= 0.41 && s < 0.80) return "brown";
  if (h >= 355 || h < 15) return "red";
  if (h < 45) return "orange";
  if (h < 65) return "yellow";
  if (h < 165) return "green";
  if (h < 195) return "teal";
  if (h < 250) return "blue";
  if (h < 310) return "purple";
  if (h < 355) return "pink";
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
  if (TEMP_SET.has(segment)) {
    return { kind: "temp", value: segment as Temperature };
  }
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
  if (knownSlugs.has(segment)) {
    return { kind: "slug", slug: segment };
  }
  return null;
}
