import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient } from "@/utils/supabase";
import { SCHEME_FIXTURES } from "./fixture";

// Define types based on your database schema
export type ColorScheme = {
  id: string;
  code: string;
  likes: number;
  created_at: string;
  colors: {
    id: string;
    hex_code: string;
    position: number;
  }[];
  categories: {
    id: string;
    name: string;
    description: string;
  }[];
};

async function fetchColorSchemes() {
  var { data, error } = { data: SCHEME_FIXTURES, error: undefined };

  if (error) throw error;

  // Process the data to transform it into the expected format
  const processedSchemes = data.map((scheme) => {
    // Process colors
    const colors = scheme.colors
      .map((item) => ({
        id: item.color.id,
        hex_code: item.color.hex_code,
        position: item.position,
      }))
      .sort((a, b) => a.position - b.position);

    // Process categories
    const categories = scheme.categories.map((item) => ({
      id: item.category.id,
      name: item.category.name,
      description: item.category.description,
    }));

    return {
      id: scheme.id,
      code: scheme.code,
      likes: scheme.likes,
      created_at: scheme.created_at,
      colors,
      categories,
    };
  });

  return processedSchemes;
}

async function fetchPalettes() {
  const supabase = createSupabaseClient();

  // Single query with nested joins
  const { data, error } = await supabase
    .from("color_schemes")
    .select(
      `
      id,
      code,
      likes,
      created_at,
      colors:color_scheme_colors!color_scheme_id(
        position,
        color:color_id(
          id,
          hex_code
        )
      ),
      categories:color_scheme_categories!color_scheme_id(
        category:category_id(
          id,
          name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  return {
    data,
    error,
  };
}

export function useColorSchemes() {
  return useQuery<ColorScheme[], Error>({
    queryKey: ["colorSchemes"],
    queryFn: fetchColorSchemes,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
