/**
 * Supabase configuration, extracted from `src/lib/supabase.ts` so the
 * fail-fast check is unit-testable without importing the Supabase client.
 *
 * The app must not silently fall back to placeholder credentials: a missing
 * URL or anon key is a configuration error, and it should surface at
 * startup instead of failing later as an opaque Supabase error.
 */
export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getSupabaseConfig(env: {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}): SupabaseConfig {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
