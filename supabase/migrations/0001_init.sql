-- spritzulator v1 — initial schema (token-per-person, no Supabase Auth).

create extension if not exists pgcrypto;

-- 1) Participants. One row per friend; identified by a shared-secret token in their URL.
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  display_name text not null,
  emoji text not null default '🍹',
  color text not null default '#FF6B1A',
  joined_at timestamptz not null default now()
);

-- 2) Spritzes (one row per tap, soft-deletable for 10s undo).
create table if not exists spritzes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  consumed_at timestamptz not null default now(),
  location text,
  note text,
  deleted_at timestamptz
);

create index if not exists idx_spritzes_participant_consumed
  on spritzes(participant_id, consumed_at desc);

create index if not exists idx_spritzes_consumed_active
  on spritzes(consumed_at desc) where deleted_at is null;

-- 3) RLS — anon can READ everything (so the leaderboard + realtime work directly
-- from the browser), but cannot mutate. All inserts/updates go through Next.js
-- Server Actions using the service-role key.
alter table participants enable row level security;
alter table spritzes     enable row level security;

drop policy if exists "read participants" on participants;
drop policy if exists "read spritzes"     on spritzes;

create policy "read participants" on participants
  for select to anon, authenticated using (true);

-- Active (non-soft-deleted) spritzes are readable. Soft-deleted rows are hidden
-- so realtime UPDATE events for undo carry a "row no longer matches" signal.
create policy "read spritzes" on spritzes
  for select to anon, authenticated using (deleted_at is null);

-- 4) Realtime: publish both tables so all clients get INSERT/UPDATE/DELETE events.
alter publication supabase_realtime add table spritzes;
alter publication supabase_realtime add table participants;
