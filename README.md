# Ruby Phoenixes Platform

[![CI](https://github.com/hongpenggg/ruby-phoenixes/actions/workflows/ci.yml/badge.svg)](https://github.com/hongpenggg/ruby-phoenixes/actions/workflows/ci.yml)

An inclusive social football platform for Ruby Phoenixes, supporting player development and event coordination. Built for working adults and persons with intellectual disabilities (PWDs).

## Tech Stack

- **Frontend**: React 19 + Vite 6 (TypeScript)
- **Styling**: Tailwind CSS + Radix UI Primitives
- **Backend / Database / Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: TanStack Query v5 + Zustand
- **Charts**: Recharts
- **Tests**: Vitest
- **Deployment**: Vercel

## Local Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Supabase**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to the SQL Editor and run the migration scripts in order:
     - `supabase/migrations/20240101000000_initial_schema.sql`
     - `supabase/migrations/20260409121000_expand_performance_and_coach_updates.sql`
   - Get your Project URL and anon key from the API settings.
   - Enable Google OAuth in **Auth → Providers** and configure your Google client ID/secret.
   - Add redirect URLs in **Auth → URL Configuration**:
     - `http://localhost:3000`
     - Your production URL (e.g. `https://your-vercel-app.vercel.app`)
4. **Environment Variables**:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Update the variables with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Both variables are required. The app fails fast at startup with a clear error if either is missing, instead of falling back to placeholder credentials.
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Checks, Tests and CI

Run these before opening a pull request:

```bash
npm run lint   # tsc --noEmit
npm test       # Vitest, unit tests in src/lib/*.test.ts
npm run build  # vite build
```

GitHub Actions runs the same three steps on every push to `main` and every pull request to `main` — see `.github/workflows/ci.yml`. It uses dummy Supabase values (`https://placeholder-project.supabase.co` / `placeholder-anon-key`), so CI needs no real Supabase project and no secrets.

What the tests cover:

- `src/lib/env.ts` — the app throws a clear error when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing.
- `src/lib/eventForm.ts` — event form mapping and payload building, including `datetime-local` formatting, empty description / max-players handling, and base-10 parsing.
- `src/lib/rsvp.ts` — RSVPs are an atomic upsert on `unique(event_id, player_id)`, not a select-then-insert, so a player cannot end up with a duplicate RSVP.
- `src/lib/performance.ts` — role-group inference from a player's position and the six performance axes shown for each role.
- `src/lib/utils.ts` — the `cn()` class-name helper.

The tests are unit tests for pure helpers only. There are no component or integration tests yet, and no test hits Supabase or the network.

## Deployment to Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. In the Environment Variables section, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically detect the Vite project and build it.

## Seeding Initial Data

After running the SQL migrations, you can seed initial data by:
1. Creating user accounts via the Auth UI or Supabase dashboard.
2. Manually inserting records into the `events` and `performance_metrics` tables via the Supabase Table Editor.
3. Or, creating a seed script using the Supabase JS client.

## Features

- **Auth & Roles**: Secure login with Supabase Auth (email/password and Google OAuth). Roles for Admin, Coach, Player, and Assistant Coach.
- **Player Development**: Track performance metrics, view historical charts, and manage player profiles. Coaches see role-specific performance axes (goalkeeper, defender, midfielder, attacker) on the Coach Dashboard.
- **Events & Games**: Create and edit events, manage RSVPs, and view upcoming/past games. RSVPs are stored with one row per player per event.
- **Inclusive Design**: High-contrast, accessible UI with large touch targets and clear typography.

## License

Private - Ruby Phoenixes
