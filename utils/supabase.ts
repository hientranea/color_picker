import { createClient } from "@supabase/supabase-js";

export const createSupabaseServerClient = () => {
  const supabaseUrl = "https://vmxommtpkrtxgyqcpvam.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteG9tbXRwa3J0eGd5cWNwdmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4ODQ3NzMsImV4cCI6MjA1NjQ2MDc3M30.eLVuEZ2vcQowkxUp7dqES9gncqStrL0z3OGCDhDEJpQ";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase server credentials are missing!");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};
