import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials are missing!");
  }

  return createClient(supabaseUrl, supabaseKey);
};
