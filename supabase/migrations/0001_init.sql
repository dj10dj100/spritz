-- spritzulator v1 — initial schema (token-per-person, no Supabase Auth).
--
-- ⚠ DESTRUCTIVE: drops any existing spritzulator tables before recreating.
-- Safe to re-run; nukes participants + spritzes data each time.

create extension if not exists pgcrypto;

-- ─── 0) Reset ────────────────────────────────────────────────────────────
-- Drop in FK-dependency order. CASCADE clears indexes, policies, triggers,
-- and any leftover publication membership tied to the table.
drop table if exists spritzes     cascade;
drop table if exists participants cascade;

-- ─── 1) Participants ────────────────────────────────────────────────────
-- One row per friend; identified by a shared-secret token in their URL.
create table participants (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  display_name text not null,
  emoji text not null default '🍹',
  color text not null default '#FF6B1A',
  joined_at timestamptz not null default now()
);

-- ─── 2) Spritzes ────────────────────────────────────────────────────────
-- One row per tap; soft-deletable for 10s undo.
create table spritzes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  consumed_at timestamptz not null default now(),
  location text,
  note text,
  deleted_at timestamptz
);

create index idx_spritzes_participant_consumed
  on spritzes(participant_id, consumed_at desc);

create index idx_spritzes_consumed_active
  on spritzes(consumed_at desc) where deleted_at is null;

-- ─── 3) RLS ─────────────────────────────────────────────────────────────
-- anon + authenticated can READ everything (so the leaderboard + realtime
-- work directly from the browser); all mutations go through Server Actions
-- using the service-role key.
alter table participants enable row level security;
alter table spritzes     enable row level security;

create policy "read participants" on participants
  for select to anon, authenticated using (true);

create policy "read spritzes" on spritzes
  for select to anon, authenticated using (deleted_at is null);

-- ─── 4) Realtime ────────────────────────────────────────────────────────
-- Publish both tables so clients get INSERT/UPDATE/DELETE events.
-- The `drop table … cascade` above already removed any prior membership,
-- so these adds are safe and won't conflict.
alter publication supabase_realtime add table spritzes;
alter publication supabase_realtime add table participants;
