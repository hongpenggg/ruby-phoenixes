-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('admin', 'coach', 'player', 'assistant_coach');
create type event_type as enum ('training', 'friendly', 'competitive', 'social');
create type rsvp_status as enum ('yes', 'no', 'maybe');

-- 1. Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role default 'player'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Players Table (football specific data)
create table public.players (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  position text,
  skill_level integer check (skill_level >= 1 and skill_level <= 5),
  disability_status text, -- Optional, respectful description
  strengths text[],
  weaknesses text[],
  is_assistant_coach_candidate boolean default false,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Events Table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  venue text not null,
  type event_type not null,
  max_players integer,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RSVPs Table
create table public.rsvps (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  status rsvp_status not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, player_id)
);

-- 5. Performance Metrics Table
create table public.performance_metrics (
  id uuid default uuid_generate_v4() primary key,
  player_id uuid references public.profiles(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete set null,
  recorded_by uuid references public.profiles(id) on delete set null,
  passing_accuracy integer check (passing_accuracy >= 0 and passing_accuracy <= 100),
  tackling_success integer check (tackling_success >= 0 and tackling_success <= 100),
  endurance integer check (endurance >= 1 and endurance <= 10),
  leadership_score integer check (leadership_score >= 1 and leadership_score <= 10),
  notes text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.performance_metrics enable row level security;

-- Profiles: Anyone can read profiles (needed for team lists), users can update their own
create policy "Profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Players: Anyone can read player data, users can update their own, coaches can update any
create policy "Players are viewable by everyone." on public.players for select using (true);
create policy "Users can update own player data." on public.players for update using (auth.uid() = id);
create policy "Coaches can update any player data." on public.players for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);
create policy "Users can insert own player data." on public.players for insert with check (auth.uid() = id);

-- Events: Anyone can read events, only coaches/admins can create/update/delete
create policy "Events are viewable by everyone." on public.events for select using (true);
create policy "Coaches and admins can insert events." on public.events for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);
create policy "Coaches and admins can update events." on public.events for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);
create policy "Coaches and admins can delete events." on public.events for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);

-- RSVPs: Anyone can read RSVPs, users can manage their own RSVPs
create policy "RSVPs are viewable by everyone." on public.rsvps for select using (true);
create policy "Users can insert own RSVPs." on public.rsvps for insert with check (auth.uid() = player_id);
create policy "Users can update own RSVPs." on public.rsvps for update using (auth.uid() = player_id);
create policy "Users can delete own RSVPs." on public.rsvps for delete using (auth.uid() = player_id);

-- Performance Metrics: Users can read their own, coaches can read/write all
create policy "Users can view own metrics." on public.performance_metrics for select using (auth.uid() = player_id);
create policy "Coaches can view all metrics." on public.performance_metrics for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);
create policy "Coaches can insert metrics." on public.performance_metrics for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);
create policy "Coaches can update metrics." on public.performance_metrics for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);

-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_players_updated
  before update on public.players
  for each row execute procedure public.handle_updated_at();

create trigger on_events_updated
  before update on public.events
  for each row execute procedure public.handle_updated_at();

create trigger on_rsvps_updated
  before update on public.rsvps
  for each row execute procedure public.handle_updated_at();

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.players (id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
