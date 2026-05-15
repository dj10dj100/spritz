-- spritzulator v1 — initial schema.
-- Run via Supabase SQL editor or `supabase db push`.

-- 1) Participants (one row per signed-in human)
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade unique,
  display_name text not null,
  emoji text not null default '🍹',
  color text not null default '#FF6B1A',
  joined_at timestamptz not null default now()
);

-- 2) Spritzes (one row per tap, soft-deletable for 10s undo)
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

-- 3) RLS
alter table participants enable row level security;
alter table spritzes     enable row level security;

drop policy if exists "read participants" on participants;
drop policy if exists "insert self"       on participants;
drop policy if exists "update self"       on participants;

create policy "read participants" on participants
  for select to authenticated using (true);

create policy "insert self" on participants
  for insert to authenticated
  with check (auth_user_id = auth.uid());

create policy "update self" on participants
  for update to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists "read spritzes"      on spritzes;
drop policy if exists "insert own spritz"  on spritzes;
drop policy if exists "update own spritz"  on spritzes;

create policy "read spritzes" on spritzes
  for select to authenticated using (true);

create policy "insert own spritz" on spritzes
  for insert to authenticated
  with check (
    participant_id in (select id from participants where auth_user_id = auth.uid())
  );

create policy "update own spritz" on spritzes
  for update to authenticated
  using (
    participant_id in (select id from participants where auth_user_id = auth.uid())
  );

-- 4) Realtime: publish spritzes table so all clients get INSERT/UPDATE events.
alter publication supabase_realtime add table spritzes;
