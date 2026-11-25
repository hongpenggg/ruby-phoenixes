import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { getSupabaseConfig } from './env';

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
