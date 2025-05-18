import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase";
import { LRUCache } from "lru-cache";

// Create a cache with a max of 100 items that expires after 5 minutes
const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 30, // 5 minutes
});

// Rate limiting setup
const rateLimit = {
  tokenCache: new Map(),
  tokensPerInterval: 10, // Requests per interval
  interval: 60 * 1000, // 1 minute in milliseconds
};

export async function GET(request: NextRequest) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Get client IP for rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // Rate limiting logic
  const tokenKey = `${ip}:${Math.floor(now / rateLimit.interval)}`;
  const tokenCount = rateLimit.tokenCache.get(tokenKey) || 0;

  // Check if rate limit exceeded
  if (tokenCount >= rateLimit.tokensPerInterval) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429, headers }
    );
  }

  // Update rate limit counter
  rateLimit.tokenCache.set(tokenKey, tokenCount + 1);

  // Clean up old entries
  rateLimit.tokenCache.forEach((_, key) => {
    if (
      now - parseInt(key.split(":")[1]) * rateLimit.interval >
      rateLimit.interval
    ) {
      rateLimit.tokenCache.delete(key);
    }
  });

  // Parse query parameters
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  // Check cache first
  const cacheKey = slug ? `color:${slug}` : `colors:${limit}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { headers });
  }

  try {
    const supabase = createSupabaseServerClient();

    // If slug is provided, get a specific color
    if (slug) {
      const { data, error } = await supabase
        .from("color_psychology_data")
        .select("*")
        .eq(
          "color_name",
          slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        )
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Color not found" },
          { status: 404, headers }
        );
      }

      // Parse JSONB fields
      const parsedData = {
        ...data,
        suggested_palettes: ensureObject(data.suggested_palettes),
        industry_use_cases: ensureObject(data.industry_use_cases),
        real_world_examples: ensureObject(data.real_world_examples),
        downloadable_assets: ensureObject(data.downloadable_assets),
        seo_meta: ensureObject(data.seo_meta),
      };

      // Cache the result
      cache.set(cacheKey, parsedData);
      return NextResponse.json(parsedData, { headers });
    }

    // Otherwise, get a list of colors with pagination
    const { data, error } = await supabase
      .from("color_psychology_data")
      .select("id, color_name, hex_code, emotional_associations")
      .order("color_name")
      .limit(Math.min(limit, 50)); // Cap at 50 to prevent abuse

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch colors" },
        { status: 500, headers }
      );
    }

    // Transform data to include slugs and parse JSONB fields
    const colorsWithSlugs = data.map((color) => ({
      ...color,
      slug: color.color_name.toLowerCase().replace(/\s+/g, "-"),
    }));

    // Cache the result
    cache.set(cacheKey, colorsWithSlugs);
    return NextResponse.json(colorsWithSlugs, { headers });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

// Helper function to ensure JSONB fields are properly parsed
function ensureObject(value: any): any {
  if (value === null || value === undefined) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("Error parsing JSON string:", e);
      return {};
    }
  }

  return value;
}
