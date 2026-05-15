import Link from "next/link";
import { createSupabaseReadClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/participant";
import type { Participant, Spritz } from "@/lib/types";
import { dryStreak, spritzOfTheDay, spritzesPerHour, totalGroup } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
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
    supabase
      .from("participants")
      .select("*")
      .order("joined_at", { ascending: true })
      .returns<Participant[]>(),
    supabase
      .from("spritzes")
      .select("*")
      .is("deleted_at", null)
      .returns<Spritz[]>(),
  ]);

  const ps = participants ?? [];
  const ss = spritzes ?? [];

  const total = totalGroup(ss);
  const perHour = spritzesPerHour(ss);
  const sotd = spritzOfTheDay(ss, ps);

  const streaks = ps
    .map((p) => ({ participant: p, hours: dryStreak(ss, p.id) }))
    .filter((row): row is { participant: Participant; hours: number } => row.hours !== null)
    .sort((a, b) => b.hours - a.hours);

  return (
    <main className="flex flex-1 flex-col gap-8 py-6">
      <header className="flex items-center justify-between">
        <h1 className="display text-[44px]">Stats</h1>
        <Link href="/" className="ui-label text-[11px] text-[var(--color-ink-muted)] underline">
          ← Hub
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Group total" value={String(total)} />
        <StatTile label="Per hour" value={perHour.toFixed(1)} />
      </div>

      <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-5">
        <h2 className="ui-label text-[11px] text-[var(--color-ink-muted)]">Spritz of the day</h2>
        {sotd ? (
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: sotd.participant.color }}
            >
              {sotd.participant.emoji}
            </div>
            <div className="flex flex-col">
              <span className="display text-2xl text-[var(--color-ink)]">{sotd.participant.display_name}</span>
              <span className="text-sm text-[var(--color-ink-muted)]">
                {sotd.count} spritz{sotd.count === 1 ? "" : "es"} today
              </span>
            </div>
          </div>
        ) : (
          <p className="display text-lg italic text-[var(--color-ink-muted)]">Day hasn&rsquo;t started</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="ui-label text-[11px] text-[var(--color-ink-muted)]">Longest dry streaks</h2>
        {streaks.length === 0 ? (
          <p className="display text-lg italic text-[var(--color-ink-muted)]">—</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {streaks.map(({ participant, hours }) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-cream-warm)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden>{participant.emoji}</span>
                  <span className="font-sans font-semibold text-[var(--color-ink)]">{participant.display_name}</span>
                </div>
                <span className="font-mono tabular text-sm text-[var(--color-ink-muted)]">{hours.toFixed(1)}h</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/loser"
        className="ui-label inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bottle)] px-6 text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
      >
        See the loser →
      </Link>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-5">
      <span className="ui-label text-[11px] text-[var(--color-ink-muted)]">{label}</span>
      <span className="display tabular text-[44px] font-bold text-[var(--color-aperol)]">{value}</span>
    </div>
  );
}
