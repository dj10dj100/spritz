"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
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
};

export default function Leaderboard({ participants, spritzes, meId }: Props) {
  const rows = useMemo<Row[]>(() => {
    const countsByParticipant = new Map<string, { count: number; lastTs: number }>();
    for (const s of spritzes) {
      if (s.deleted_at) continue;
      const prev = countsByParticipant.get(s.participant_id) ?? { count: 0, lastTs: 0 };
      const ts = +new Date(s.consumed_at);
      countsByParticipant.set(s.participant_id, {
        count: prev.count + 1,
        lastTs: Math.max(prev.lastTs, ts),
      });
    }
    const built: Row[] = participants.map((p) => {
      const c = countsByParticipant.get(p.id) ?? { count: 0, lastTs: 0 };
      return { participant: p, count: c.count, lastTs: c.lastTs };
    });
    built.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastTs - a.lastTs;
    });
    return built;
  }, [participants, spritzes]);

  if (rows.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] px-6 py-12 text-center">
        <p className="display text-2xl italic text-[var(--color-ink-muted)]">No spritzes yet. Suspicious.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3" aria-label="Leaderboard">
      <AnimatePresence initial={false}>
        {rows.map((row, idx) => {
          const isLeader = idx === 0 && row.count > 0;
          const isMe = row.participant.id === meId;
          const rank = idx + 1;
          const rankClass = isLeader
            ? "text-[64px]"
            : idx < 3
            ? "text-[44px]"
            : "text-[32px]";
          const avatarClass = isLeader ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl";
          const nameClass = isLeader
            ? "display text-[28px] font-bold text-[var(--color-ink)]"
            : "font-sans text-[20px] font-semibold text-[var(--color-ink)]";
          const countClass = isLeader ? "text-[56px]" : "text-[32px]";
          const surfaceClass = isLeader
            ? "bg-[var(--color-aperol)] px-5 py-6 shadow-[0_8px_28px_-6px_rgba(255,107,26,0.55)]"
            : "bg-[var(--color-cream-warm)] px-4 py-4";
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
              <div className="flex min-w-0 flex-1 flex-col">
                <span className={`truncate ${nameClass}`}>
                  {row.participant.display_name}
                  {isMe && (
                    <span className="ml-2 text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                      you
                    </span>
                  )}
                </span>
                {isLeader && (
                  <span className="ui-label text-[10px] font-semibold text-[var(--color-ink)]/75">
                    in the lead
                  </span>
                )}
              </div>
              <div
                className={`display tabular font-bold text-[var(--color-ink)] ${countClass}`}
              >
                {row.count}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
