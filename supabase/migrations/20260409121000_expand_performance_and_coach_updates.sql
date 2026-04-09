alter table public.performance_metrics
  add column if not exists match_rating numeric(3,1) check (match_rating >= 0 and match_rating <= 10),
  add column if not exists minutes_played integer check (minutes_played >= 0 and minutes_played <= 200),
  add column if not exists distance_ran_km numeric(5,2) check (distance_ran_km >= 0 and distance_ran_km <= 50),
  add column if not exists passes_completed integer check (passes_completed >= 0),
  add column if not exists goals integer check (goals >= 0),
  add column if not exists assists integer check (assists >= 0),
  add column if not exists chances_created integer check (chances_created >= 0),
  add column if not exists diving integer check (diving >= 0 and diving <= 10),
  add column if not exists positioning integer check (positioning >= 0 and positioning <= 10),
  add column if not exists penalties integer check (penalties >= 0 and penalties <= 10),
  add column if not exists long_pass integer check (long_pass >= 0 and long_pass <= 10),
  add column if not exists short_pass integer check (short_pass >= 0 and short_pass <= 10),
  add column if not exists leadership integer check (leadership >= 0 and leadership <= 10),
  add column if not exists dribbling integer check (dribbling >= 0 and dribbling <= 10),
  add column if not exists heading integer check (heading >= 0 and heading <= 10),
  add column if not exists interception integer check (interception >= 0 and interception <= 10),
  add column if not exists progressive_pass integer check (progressive_pass >= 0 and progressive_pass <= 10),
  add column if not exists safe_pass integer check (safe_pass >= 0 and safe_pass <= 10),
  add column if not exists shooting integer check (shooting >= 0 and shooting <= 10),
  add column if not exists defensive_actions integer check (defensive_actions >= 0 and defensive_actions <= 10);

drop policy if exists "Coaches can update any profile." on public.profiles;
create policy "Coaches can update any profile."
on public.profiles
for update
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'coach'))
);
