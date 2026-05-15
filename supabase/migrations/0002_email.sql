-- Add self-registration: participants now identified by email + token URL.
-- Email is nullable so admin-created (pre-email) participants still work.

alter table participants add column if not exists email text;

-- Case-insensitive uniqueness, only enforced when email is set.
create unique index if not exists idx_participants_email_unique
  on participants (lower(email))
  where email is not null;
