"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Participant, Spritz } from "@/lib/types";
import { relativeTime } from "@/lib/time";

type Props = {
  feed: Spritz[];
  participantsById: Map<string, Participant>;
};

export default function LiveFeed({ feed, participantsById }: Props) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (feed.length === 0) {
    return (
      <section className="px-2 text-center">
        <p className="display text-lg italic text-[var(--color-ink-muted)]">
          The feed is dry. Be the hero.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2" aria-label="Live feed">
      <h2 className="ui-label text-[11px] text-[var(--color-ink-muted)]">live feed</h2>
      <AnimatePresence initial={false}>
        {feed.map((s, idx) => {
          const p = participantsById.get(s.participant_id);
          if (!p) return null;
          const dim = idx > 0;
          return (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center gap-3 px-1 py-2"
            >
              <span aria-hidden className="text-base">{p.emoji}</span>
              <p className={`min-w-0 flex-1 text-sm ${dim ? "text-[var(--color-ink-muted)]" : "text-[var(--color-ink)]"}`}>
                <span className="font-semibold">{p.display_name}</span>{" "}
                <span>just clocked one</span>
              </p>
              <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">{relativeTime(s.consumed_at)}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
