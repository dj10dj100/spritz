# spritzulator

A closed-group Aperol-spritz leaderboard for a real Italy trip.
Mobile-first PWA. Live realtime feed. Lives on a phone for two weeks.

See `PRODUCT.md`, `DESIGN.md`, and the plan in `nimbalyst-local/plans/`.

## Stack

Next.js 15 (App Router, Server Actions, Middleware) · React 19 · TypeScript ·
Tailwind 4 · framer-motion · canvas-confetti · Supabase (Postgres + Realtime).

No Supabase Auth. Each participant gets a unique invite URL — `/?u=TOKEN`
sets a long-lived cookie that identifies them. Friends-aren't-your-threat-model.

## Setup

1. **Supabase project**
   - Create a new project at <https://supabase.com>.
   - SQL editor → run `supabase/migrations/0001_init.sql`.
   - Project Settings → API → copy the `URL`, `anon` key, and `service_role` key.

2. **Environment** — copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (browser + server reads).
   - `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000` or your Vercel URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, used by Server
     Actions to bypass RLS for writes). **Never** expose this client-side.
   - `ADMIN_PASSWORD` — shared password for the `/admin` page.

3. **Run**
   ```bash
   npm install
   npm run dev
   ```

4. **Add your friends**
   - Visit `/admin`, enter `ADMIN_PASSWORD`.
   - Add each person (name + emoji + color). Copy their personal URL.
   - DM each one their URL via WhatsApp. The first tap on that URL bakes the
     cookie; from then on they just open the app.

## Routes

- `/` — Hub: leaderboard + big +1 button + live feed (invite-only landing if no cookie).
- `/admin` — Add/remove participants and copy share URLs (password-gated).
- `/stats` — Group total, per-hour, spritz of the day, dry streaks.
- `/loser` — Last-place participant + tagline.

## Scripts

| | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run typecheck` | TS check |

## Trip config

Edit `lib/trip-config.ts` for trip name and dates. Timezone is Europe/Rome.

## Deferred (post-trip TODOs)

- Automated tests (Vitest for `lib/stats.ts`, Playwright smoke).
- Realtime "reconnecting…" indicator.
- Photo capture per spritz.
- End-of-trip recap page.
- Dark mode (tokens already in DESIGN.md).
- Milestone webhook.
