import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are defined.",
    );
  }

  if (!supabaseUrl.startsWith("http")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL.");
  }

  if (supabaseAnonKey.length < 10) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY must be a non-empty Supabase anon key.");
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  } as const;
}

const { url, anonKey } = getSupabaseConfig();

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabaseAdmin = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
