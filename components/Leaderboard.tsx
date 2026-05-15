"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import type { Participant, Spritz } from "@/lib/types";
import Crown from "./Crown";

type Props = {
  participants: Participant[];
  spritzes: Spritz[];
  meId: string;
};

type Row = {
  participant: Participant;
  count: number;
  lastTs: number;
  recentHour: number;
};

type Trend = "up" | "down" | "same" | "new";

const HOUR_MS = 60 * 60 * 1000;

export default function Leaderboard({ participants, spritzes, meId }: Props) {
  const rows = useMemo<Row[]>(() => {
    const now = Date.now();
    const byPid = new Map<string, { count: number; lastTs: number; recentHour: number }>();
    for (const s of spritzes) {
      if (s.deleted_at) continue;
      const ts = +new Date(s.consumed_at);
      const prev = byPid.get(s.participant_id) ?? { count: 0, lastTs: 0, recentHour: 0 };
      byPid.set(s.participant_id, {
        count: prev.count + 1,
        lastTs: Math.max(prev.lastTs, ts),
        recentHour: prev.recentHour + (now - ts < HOUR_MS ? 1 : 0),
      });
    }
    const built: Row[] = participants.map((p) => {
      const c = byPid.get(p.id) ?? { count: 0, lastTs: 0, recentHour: 0 };
      return { participant: p, count: c.count, lastTs: c.lastTs, recentHour: c.recentHour };
    });
    built.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastTs - a.lastTs;
    });
    return built;
  }, [participants, spritzes]);

  // Track previous rank order so we can show ↑/↓ trend arrows.
  const prevRanksRef = useRef<Map<string, number>>(new Map());
  const trends = useMemo<Map<string, Trend>>(() => {
    const map = new Map<string, Trend>();
    rows.forEach((row, idx) => {
      const prev = prevRanksRef.current.get(row.participant.id);
      if (prev === undefined) map.set(row.participant.id, "new");
      else if (idx < prev) map.set(row.participant.id, "up");
      else if (idx > prev) map.set(row.participant.id, "down");
      else map.set(row.participant.id, "same");
    });
    return map;
  }, [rows]);

  useEffect(() => {
    const m = new Map<string, number>();
    rows.forEach((row, idx) => m.set(row.participant.id, idx));
    prevRanksRef.current = m;
  }, [rows]);

  if (rows.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] px-6 py-12 text-center">
        <p className="display text-2xl italic text-[var(--color-ink-muted)]">No spritzes yet. Suspicious.</p>
      </section>
    );
  }

  const leader = rows[0];
  const challenger = rows[1];
  const photoFinish =
    leader && challenger && leader.count > 0 && leader.count - challenger.count === 1;

  return (
    <section className="flex flex-col gap-3" aria-label="Leaderboard">
      <AnimatePresence>
        {photoFinish && (
          <motion.div
            key="photo-finish"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-aperol)]/15 px-4 py-2 ring-1 ring-[var(--color-aperol)]/40"
            role="status"
            aria-live="polite"
          >
            <span aria-hidden className="text-base">📸</span>
            <span className="ui-label text-[11px] font-semibold text-[var(--color-aperol-deep)]">
              photo finish — {challenger.participant.display_name} is one tap behind
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {rows.map((row, idx) => {
          const tier = idx === 0 && row.count > 0 ? "leader" : idx === 1 ? "silver" : idx === 2 ? "bronze" : "rest";
          const isLeader = tier === "leader";
          const isMe = row.participant.id === meId;
          const rank = idx + 1;
          const trend = trends.get(row.participant.id) ?? "new";
          const gap = leader.count - row.count;

          const rankClass = isLeader
            ? "text-[64px]"
            : tier === "silver" || tier === "bronze"
            ? "text-[44px]"
            : "text-[32px]";
          const avatarClass = isLeader ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl";
          const nameClass = isLeader
            ? "display text-[28px] font-bold text-[var(--color-ink)]"
            : "font-sans text-[20px] font-semibold text-[var(--color-ink)]";
          const countClass = isLeader ? "text-[56px]" : "text-[32px]";

          const surfaceClass =
            tier === "leader"
              ? "bg-[var(--color-aperol)] px-5 py-6 shadow-[0_8px_28px_-6px_rgba(255,107,26,0.55)]"
              : tier === "silver"
              ? "bg-[var(--color-cream-warm)] px-4 py-4 ring-2 ring-[var(--color-bottle)]/45"
              : tier === "bronze"
              ? "bg-[var(--color-cream-warm)] px-4 py-4 ring-1 ring-[var(--color-ink)]/15"
              : "bg-[var(--color-cream-warm)] px-4 py-4";

          const subLabel = subLabelFor(tier);

          return (
            <motion.div
              key={row.participant.id}
              layout
              layoutId={row.participant.id}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={`relative flex items-center gap-4 rounded-[var(--radius-lg)] ${surfaceClass}`}
              style={isMe ? { boxShadow: `inset 0 0 0 2px ${row.participant.color}` } : undefined}
            >
              {isLeader && <Crown />}
              <div className={`display tabular w-14 text-center font-bold ${rankClass} text-[var(--color-ink)]`}>
                {rank}
              </div>
              <div
                aria-hidden
                className={`flex items-center justify-center rounded-full ${avatarClass} ${
                  isLeader ? "ring-2 ring-[var(--color-cream)]/80" : ""
                }`}
                style={{ backgroundColor: row.participant.color }}
              >
                {row.participant.emoji}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className={`truncate ${nameClass}`}>
                  {row.participant.display_name}
                  {isMe && (
                    <span className="ml-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                      you
                    </span>
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {subLabel && (
                    <span
                      className={`ui-label text-[10px] font-semibold ${
                        isLeader ? "text-[var(--color-ink)]/75" : "text-[var(--color-ink-muted)]"
                      }`}
                    >
                      {subLabel}
                    </span>
                  )}
                  {row.recentHour >= 3 && (
                    <span
                      className="ui-label inline-flex items-center gap-1 rounded-full bg-[var(--color-aperol)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-aperol-deep)]"
                      title={`${row.recentHour} spritzes in the last hour`}
                    >
                      <span aria-hidden>🔥</span>
                      {row.recentHour}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`display tabular font-bold text-[var(--color-ink)] ${countClass}`}>
                  {row.count}
                </div>
                <div className="flex items-center gap-1.5">
                  {!isLeader && gap > 0 && (
                    <span
                      className="ui-label rounded-full bg-[var(--color-ink)]/8 px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]"
                      title={`${gap} behind the leader`}
                    >
                      +{gap}
                    </span>
                  )}
                  <TrendChip trend={trend} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}

function subLabelFor(tier: "leader" | "silver" | "bronze" | "rest"): string | null {
  switch (tier) {
    case "leader":
      return "🥇 in the lead";
    case "silver":
      return "🥈 close behind";
    case "bronze":
      return "🥉 on the podium";
    default:
      return null;
  }
}

function TrendChip({ trend }: { trend: Trend }) {
  if (trend === "new" || trend === "same") return null;
  const isUp = trend === "up";
  return (
    <motion.span
      key={trend}
      initial={{ scale: 0.6, opacity: 0, y: isUp ? 6 : -6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`ui-label inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
        isUp
          ? "bg-[var(--color-aperol)] text-[var(--color-cream)]"
          : "bg-[var(--color-bottle)] text-[var(--color-cream)]"
      }`}
      aria-label={isUp ? "moved up" : "moved down"}
    >
      {isUp ? "↑" : "↓"}
    </motion.span>
  );
}
