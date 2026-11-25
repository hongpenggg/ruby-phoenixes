import { describe, expect, it } from 'vitest';
import { getSupabaseConfig } from './env';

describe('getSupabaseConfig', () => {
  it('returns the URL and anon key when both are set', () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      }),
    ).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });
  });

  it('throws when both variables are missing', () => {
    expect(() => getSupabaseConfig({})).toThrow(
      'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
    );
  });

  it('throws when only the URL is set', () => {
    expect(() =>
      getSupabaseConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co' }),
    ).toThrow(/VITE_SUPABASE_ANON_KEY/);
  });

  it('throws when only the anon key is set', () => {
    expect(() =>
      getSupabaseConfig({ VITE_SUPABASE_ANON_KEY: 'anon-key' }),
    ).toThrow(/VITE_SUPABASE_URL/);
  });

  it('treats empty strings as missing', () => {
    expect(() =>
      getSupabaseConfig({ VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' }),
    ).toThrow(/Missing Supabase environment variables/);
  });
});
