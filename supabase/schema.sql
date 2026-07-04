-- NeuroDev Therapy — core auth schema
-- Run this once in your Supabase project's SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.

-- user_profiles: one row per signed-up user, created during the
-- "complete your profile" step (src/app/complete-profile/page.tsx) and
-- read by src/app/auth/callback/route.ts and src/app/dashboard/page.tsx
-- to decide whether onboarding is finished.
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age int not null check (age between 1 and 120),
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_profiles enable row level security;

drop policy if exists "Users can read own profile" on user_profiles;
create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on user_profiles;
create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on user_profiles;
create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can delete own profile" on user_profiles;
create policy "Users can delete own profile"
  on user_profiles for delete
  using (auth.uid() = id);

-- Keep updated_at current on every edit (used by the dashboard's profile editor).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_profiles_updated_at on user_profiles;
create trigger set_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function set_updated_at();
