# Design System — spritzulator

> Aperitivo Hour: a saturated Italian-summer leaderboard for friends drinking too many spritzes.
> Source of truth for typography, color, spacing, and motion. Update this file when decisions change; don't deviate without explicit approval.

## Product Context

- **What this is:** A mobile-first leaderboard where 4–12 friends on holiday tap a button each time they drink an Aperol spritz. Live feed, animated podium, ephemeral trip-scoped competition.
- **Who it's for:** A group of adult friends on a real upcoming trip. They are not Manual.co users. They are not strangers. They are not your threat model.
- **Space/industry:** Side-project / social drinking / holiday-tech. Adjacent neighbors: Untappd, BeReal, Strava clubs, group-chat games.
- **Project type:** Mobile-first PWA. Three pages (Hub, Stats, Loser). Real-time. Lives on a phone for two weeks, then dies a glorious death.
- **Memorable thing:** *It feels like a holiday.* Warm, golden-hour, slightly impractical, every decision serves the vibe. The screenshot from the trip should be the best thing in the group chat for a week.

## Aesthetic Direction

- **Direction:** **Aperitivo Hour** — Italian-summer poster energy meets modern indie app. Halfway between a 1970s Campari ad and a beautiful mobile-first PWA. Sun-faded, saturated, confident.
- **Decoration level:** **Intentional.** Subtle paper grain on canvas, soft glow on the leaderboard leader, hand-drawn `🍹` and `👑` marks. Never sterile, never flat, never busy.
- **Mood:** You can almost taste the spritz. Late-afternoon orange light. Confident type that takes up space. A little bit of swash, a little bit of swagger. Adult — never childish, never branded-corporate.
- **Reference cues (not slavish):** vintage Campari posters, Negroni-era Italian editorial typography, Linear's hierarchy discipline applied to a vacation app, Robinhood's tabular-nums leaderboards, Things 3's restraint with playful moments.

## Typography

Tight three-font system. Each font has one job.

- **Display / Hero:** **Fraunces** (variable, 400–900, optical sizing on) — `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&display=swap`
  - *Why:* The swashy serif. Reads as editorial / aperitivo / poster. Gives a drinking app the magazine vibe that makes screenshots shareable. Big sizes (48px+) lean into the swashes; small sizes (≥18px) flatten via opsz.
  - *Roles:* h1 hero ("ITALY 2026"), leaderboard rank numbers, podium names, the loser-screen taglines.
- **Body / UI:** **Geist** (variable, weights 400/500/600/700) — `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap`
  - *Why:* Modern neutral sans with proper `tabular-nums`. The leaderboard NEEDS tabular-nums or the counts jitter on update. Reads cleanly at every UI size. Not Inter.
  - *Roles:* Body copy, button labels, form inputs, secondary leaderboard numbers, navigation, feed text.
- **Mono:** **JetBrains Mono** (400/500) — `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap`
  - *Why:* Timestamps in the live feed ("2m ago", "11:42 PM"). One mono moment per screen, used sparingly, adds texture.
  - *Roles:* Relative timestamps, location strings, any debug/diagnostic UI.

**Loading strategy:** All three from Google Fonts via a single `<link rel="preconnect">` + one combined CSS URL. `font-display: swap`. No self-hosting for v1 — Vercel's free tier doesn't care.

**Scale (mobile-first; px values rounded to 4):**

| Token | Px | Use |
|---|---|---|
| `text-2xs` | 11 | Micro labels, mono timestamps |
| `text-xs` | 13 | Captions, helper text |
| `text-sm` | 15 | Body small, secondary UI |
| `text-base` | 17 | Body, inputs (iOS won't zoom on focus) |
| `text-lg` | 20 | Emphasized body, list items |
| `text-xl` | 24 | Section headers (Geist 600) |
| `text-2xl` | 32 | Page titles (Fraunces 600) |
| `text-3xl` | 44 | Big rank numbers (Fraunces 700) |
| `text-4xl` | 64 | Hero count-up (Fraunces 800) |
| `text-5xl` | 96 | "ITALY 2026" hero on hub (Fraunces 800, opsz auto) |

**Tracking:** Fraunces display: `-0.02em`. Geist body: `0`. Geist UI labels (caps): `0.04em`.

**Line-height:** Display: `1.05`. Body: `1.5`. UI labels: `1.2`.

## Color

- **Approach:** **Balanced.** One hero (orange), one grounding (green), one cool moment (ice), neutrals for canvas and ink. Color is not decoration — every hue has a structural role.

### Primary palette

| Token | Hex | Role |
|---|---|---|
| `--aperol` | `#FF6B1A` | The hero. Primary CTA, leaderboard leader, all moments of energy. |
| `--aperol-deep` | `#E04E00` | Pressed/hover state, dark-mode primary. |
| `--cream` | `#FBF1E4` | Canvas. The whole app sits on this in light mode. |
| `--cream-warm` | `#F3E4CC` | Card surface, slightly warmer than canvas. |
| `--bottle` | `#1F4A2E` | Bottle green. Grounding text alternative, secondary CTA, the "you're losing" green. |
| `--bottle-deep` | `#102818` | Dark-mode canvas. |
| `--ice` | `#9CC9D8` | Ice-cube blue. Used rarely — info states, link underlines, the cool moment. |
| `--ink` | `#1A1410` | Primary text on cream. Near-black, warm-biased. |
| `--ink-muted` | `#6E5F50` | Secondary text, helper copy, mono timestamps. |
| `--ink-faint` | `#B8A899` | Disabled states, dividers. |

### Semantic

| Token | Hex | Role |
|---|---|---|
| `--success` | `#3E7C47` | "Spritz logged" toast. |
| `--warning` | `#D69500` | Soft warning. Almost never used. |
| `--error` | `#C13A2E` | Destructive actions (undo confirmation). |
| `--info` | `#5A9BAE` | Info pills. Same family as `--ice`, deeper. |

### Dark mode

Not a CSS-filter invert. Surfaces are **redesigned**, not flipped:

- Canvas → `--bottle-deep` (`#102818`)
- Surface → `#1B3825`
- Primary text → `#F3E4CC` (cream-warm)
- Aperol stays `--aperol` but with `--aperol-deep` for pressed states; saturation reduced ~15% via OKLCH where supported.
- Grain texture stays but at 40% opacity.

### Contrast

All text on cream meets WCAG AA. `--ink` on `--cream`: 11.2:1. `--ink-muted` on `--cream`: 5.1:1. `--aperol` reserved for ≥18px text or icons — fails AA at 14px body, intentionally.

## Spacing

- **Base unit:** **4px**. Everything is a multiple of 4.
- **Density:** **Comfortable on the hub** (the hub is a poster), **compact-comfortable on stats** (data wants density).
- **Scale:**

| Token | Px | Common use |
|---|---|---|
| `space-2xs` | 2 | Hairline gaps |
| `space-xs` | 4 | Icon-to-label |
| `space-sm` | 8 | Inside chips, between adjacent labels |
| `space-md` | 16 | Default card padding, paragraph spacing |
| `space-lg` | 24 | Section padding mobile |
| `space-xl` | 32 | Between hub sections (leaderboard ↔ button ↔ feed) |
| `space-2xl` | 48 | Top/bottom of hero region |
| `space-3xl` | 64 | Page-level vertical rhythm on the loser screen |

**Thumb zones:** Primary CTA (`+1 SPRITZ`) bottom-anchored in a 96px safe zone above iOS home indicator. Min tap target 48×48.

## Layout

- **Approach:** **Hybrid.** Hub is poster-first (the leaderboard is the design); Stats is grid-disciplined (data deserves the grid); Loser is editorial (a single column with attitude).
- **Grid:** Single column ≤480px. 12-col fluid grid 480–960px. Max content width **560px** — this is a phone app first, last, and always. Desktop is a wide phone, not a dashboard.
- **Border radius:**

| Token | Px | Use |
|---|---|---|
| `radius-sm` | 6 | Chips, pills, small inputs |
| `radius-md` | 12 | Buttons, list items |
| `radius-lg` | 20 | Cards, leaderboard rows |
| `radius-xl` | 32 | The hero +1 button (a stadium pill) |
| `radius-full` | 9999 | Avatars, the 1st-place crown badge |

**No uniform bubble-radius across all elements.** Hierarchy matters.

### Texture

`--cream` canvas carries a subtle paper-grain SVG noise overlay at 6% opacity. Single shared SVG, fixed position. Costs <2KB.

## Motion

- **Approach:** **Expressive.** This is a drinking app on holiday. Motion is the point.
- **Library:** `framer-motion` (already in stack). Spring-physics-first, not duration-first.

| Token | Spec | Use |
|---|---|---|
| `motion-micro` | 80ms ease-out | Button press state |
| `motion-short` | spring `{ stiffness: 400, damping: 30 }` | Most state transitions |
| `motion-medium` | spring `{ stiffness: 260, damping: 22 }` | Leaderboard re-rank, list reorder |
| `motion-long` | spring `{ stiffness: 120, damping: 14 }` | Hero count-up, confetti decay |

### Signature moments (must-have)

1. **Tap +1:** Button squish (`scale: 0.94`) → count-up (`motion-long`) → single Aperol-orange confetti burst (20–30 particles, radial, gravity, 1.2s) → glass-clink sound (≤300ms WAV, ≤8KB).
2. **Leaderboard re-rank:** `framer-motion` `layout` prop with `motion-medium`. Rows physically swap with spring overshoot. New leader's row pulses once (cream → aperol glow → cream over 600ms).
3. **Live feed entry:** New entry slides in from the bottom +24px → settles → after 8s, gently dims `--ink` → `--ink-muted`.
4. **1st-place crown:** `👑` floats in a sine wave, 2s period, ±4px amplitude. Pause when document hidden.
5. **Background:** Slow gradient drift between two cream tones over 18s, ease-in-out, infinite. Disable when `prefers-reduced-motion: reduce`.

### Reduced motion

Respect `prefers-reduced-motion: reduce`. All spring physics collapse to 150ms linear cross-fades. Confetti becomes a single 200ms scale pulse. Background gradient freezes.

## Components — North Stars

These aren't a full library, just the components where the design system has to be unambiguous:

- **The +1 Button:** Aperol fill, cream text in Fraunces 700, `radius-xl` (stadium pill), 96px height, full-width within the 560px max. Pressed state: `--aperol-deep`, scale 0.96, 80ms.
- **Leaderboard row:** `radius-lg`, `--cream-warm` surface, 16px padding, rank number in Fraunces (3xl for top 3, 2xl for rest), name in Geist 600, count in Geist 600 tabular-nums. Leader row gets a 1px `--aperol` outline + subtle orange glow.
- **Live feed item:** `--ink` text Geist 400, mono timestamp `--ink-muted` JetBrains Mono `text-2xs`, no surface (sits on canvas), 12px vertical rhythm.
- **Empty state ("no spritzes yet"):** Fraunces italic, `--ink-muted`, centered, 32px. The ONE place a written joke lives.
- **Pick-name card:** Full-width tappable card per person, `radius-lg`, person's emoji at 48px on the left, name in Fraunces 600 24px, 96px tall. Subtle press-state scale.

## Sound

- One sound: `glass-clink.wav` on +1 tap. ≤300ms, ≤8KB, free-to-use clip.
- User-toggleable in Stats page header. Persisted to localStorage. Default ON for the first session, then respects choice.
- No other sounds. No ambient. No music.

## Anti-patterns (do not introduce)

- Purple/violet gradient anywhere
- Generic gradient CTA button (the +1 button is a solid orange pill, not a gradient)
- 3-column SaaS feature grid
- Centered everything with uniform spacing
- Uniform `border-radius` across all elements
- Inter as body or display
- system-ui as the display font
- Decorative blobs, mesh gradients, glassmorphism, neumorphism
- More than one font weight transition per element
- More than two accent colors visible in one viewport (aperol + bottle is the limit)
- Emoji used decoratively in body copy (reserved for: 🍹 the action mark, 👑 1st-place, person avatars)

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-15 | Initial design system created (Aperitivo Hour direction) | /design-consultation, ship-fast holiday side project. Memorable thing: "it feels like a holiday." |
| 2026-05-15 | Fraunces over a sans for display | Editorial/poster vibe; makes screenshots shareable; differentiates from every other indie SaaS. |
| 2026-05-15 | Bottle green as second structural color, not another orange shade | Gives the system a counterweight so the orange doesn't exhaust. Reads as Italian even before you know why. |
| 2026-05-15 | Paper-grain texture on canvas | Avoids the flat-Vercel-app default. Costs <2KB. |
| 2026-05-15 | Geist body with tabular-nums | The leaderboard count animates — without tabular-nums, digits jitter on each update. Hard requirement. |
