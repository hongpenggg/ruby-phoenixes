import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests only — pure helpers in src/lib. No jsdom, no network,
    // no Supabase. Component / integration tests are a follow-up, not
    // faked here with a mocked-out app.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
