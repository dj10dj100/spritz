import type { DailyCount } from "@/lib/stats";

type Props = { days: DailyCount[] };

export default function DailySpritzChart({ days }: Props) {
  if (days.length === 0) {
    return (
      <p className="display text-lg italic text-[var(--color-ink-muted)]">
        No spritz yet — graph awaits.
      </p>
    );
  }
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-4">
      <div className="flex h-40 items-end gap-1.5">
        {days.map((d) => {
          const pct = (d.count / max) * 100;
          const isZero = d.count === 0;
          return (
            <div key={d.key} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className="relative flex h-full flex-col justify-end">
                {!isZero && (
                  <span className="display tabular mb-1 text-center text-[11px] font-semibold text-[var(--color-ink)]">
                    {d.count}
                  </span>
                )}
                <div
                  aria-label={`${d.label}: ${d.count} spritz${d.count === 1 ? "" : "es"}`}
                  className={`rounded-t-[var(--radius-sm)] ${
                    isZero ? "bg-[var(--color-ink-faint)]/40" : "bg-[var(--color-aperol)]"
                  }`}
                  style={{ height: `${isZero ? 4 : Math.max(pct, 6)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {days.map((d) => (
          <div
            key={d.key}
            className="ui-label min-w-0 flex-1 truncate text-center text-[10px] text-[var(--color-ink-muted)]"
            title={d.label}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
