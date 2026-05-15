import Link from "next/link";
import { createSupabaseReadClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/participant";
import type { Participant, Spritz } from "@/lib/types";
import { loser } from "@/lib/stats";

export const dynamic = "force-dynamic";

const TAGLINES = [
  "you're doing your liver a favor",
  "someone has to drive home",
  "early peaker, late bloomer",
  "monastic discipline. respect.",
  "the trip's designated hydrator",
  "more spritz for everyone else",
  "leaderboard glow-up arc loading",
  "drinks slow, judges fast",
];

function taglineFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % TAGLINES.length;
  return TAGLINES[idx];
}

export default async function LoserPage() {
  const me = await getCurrentParticipant();
  if (!me) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <p className="display text-2xl italic text-[var(--color-ink-muted)]">
          Open your personal link first.
        </p>
        <Link href="/" className="ui-label text-[11px] text-[var(--color-ink-muted)] underline">
          ← Hub
        </Link>
      </main>
    );
  }

  const supabase = createSupabaseReadClient();
  const [{ data: participants }, { data: spritzes }] = await Promise.all([
    supabase.from("participants").select("*").returns<Participant[]>(),
    supabase.from("spritzes").select("*").is("deleted_at", null).returns<Spritz[]>(),
  ]);

  const ps = participants ?? [];
  const ss = spritzes ?? [];
  const row = loser(ss, ps);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 py-16 text-center">
      <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">in last place</p>

      {row ? (
        <>
          <div
            aria-hidden
            className="flex h-32 w-32 items-center justify-center rounded-full text-[64px]"
            style={{ backgroundColor: row.participant.color }}
          >
            {row.participant.emoji}
          </div>
          <h1 className="display text-[64px] leading-none text-[var(--color-bottle)] [font-weight:800]">
            {row.participant.display_name}
          </h1>
          <p className="display max-w-[440px] text-[24px] italic text-[var(--color-ink-muted)]">
            {taglineFor(row.participant.id)}
          </p>
          <div className="display tabular text-[88px] font-bold text-[var(--color-bottle)]">{row.count}</div>
          <p className="text-sm text-[var(--color-ink-muted)]">spritz{row.count === 1 ? "" : "es"}</p>
        </>
      ) : (
        <p className="display text-2xl italic text-[var(--color-ink-muted)]">No participants yet. No one to lose.</p>
      )}

      <Link
        href="/"
        className="ui-label inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-aperol)] px-6 text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
      >
        Back to the hub
      </Link>
    </main>
  );
}
