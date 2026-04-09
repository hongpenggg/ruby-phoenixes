# Ruby Phoenixes Platform

An inclusive social football platform for Ruby Phoenixes, supporting player development and event coordination. Built for working adults and persons with intellectual disabilities (PWDs).

## Tech Stack

- **Frontend**: React 19 + Vite 6 (TypeScript)
- **Styling**: Tailwind CSS + Radix UI Primitives
- **Backend / Database / Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: TanStack Query v5 + Zustand
- **Charts**: Recharts
- **Deployment**: Vercel

## Local Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Supabase**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to the SQL Editor and run the migration script located at `supabase/migrations/20240101000000_initial_schema.sql`.
   - Get your Project URL and anon key from the API settings.
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
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. In the Environment Variables section, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically detect the Vite project and build it.

## Seeding Initial Data

After running the SQL migration, you can seed initial data by:
1. Creating user accounts via the Auth UI or Supabase dashboard.
2. Manually inserting records into the `events` and `performance_metrics` tables via the Supabase Table Editor.
3. Or, creating a seed script using the Supabase JS client.

## Features

- **Auth & Roles**: Secure login with Supabase Auth. Roles for Admin, Coach, Player, and Assistant Coach.
- **Player Development**: Track performance metrics, view historical charts, and manage player profiles.
- **Events & Games**: Create events, manage RSVPs, and view upcoming/past games.
- **Inclusive Design**: High-contrast, accessible UI with large touch targets and clear typography.

## License

Private - Ruby Phoenixes
