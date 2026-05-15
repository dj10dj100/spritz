# spritzulator

A closed-group Aperol-spritz leaderboard for a real Italy trip.
Mobile-first PWA. Live realtime feed. Lives on a phone for two weeks.

See `PRODUCT.md`, `DESIGN.md`, and the plan in `nimbalyst-local/plans/`.

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind 4 ·
framer-motion · canvas-confetti · Supabase (Auth + Postgres + Realtime).

## Setup

1. **Supabase project**
   - Create a new project at <https://supabase.com>.
   - SQL editor → run `supabase/migrations/0001_init.sql`.
   - Authentication → Providers → enable **Google** (open sign-in, no allowlist).
     Add `http://localhost:3000/auth/callback` and your production callback URL
     to "Redirect URLs".

2. **Environment**
   ```bash
   cp .env.local.example .env.local
   # fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL
   ```

3. **Run**
   ```bash
   npm install
   npm run dev
   ```

## Scripts

| | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run typecheck` | TS check |

## Routes

- `/` — Hub: leaderboard + big +1 button + live feed (sign-in if no session).
- `/onboard` — First-time emoji + color picker.
- `/stats` — Group total, per-hour, spritz of the day, dry streaks.
- `/loser` — Last-place participant + tagline.
- `/auth/callback` — Supabase OAuth handshake.
- `/auth/error` — Recoverable OAuth error page.

## Trip config

Edit `lib/trip-config.ts` for trip name and dates. Timezone is Europe/Rome.

## Deferred (post-trip TODOs)

- Automated tests (Vitest for `lib/stats.ts`, Playwright smoke).
- Realtime "reconnecting…" indicator.
- Photo capture per spritz.
- End-of-trip recap page.
- Dark mode (tokens already in DESIGN.md).
- Milestone webhook.
