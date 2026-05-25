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
    expect(ensureObject('["a"]')).toEqual({});
  });
});
