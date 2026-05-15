"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { undoSpritz } from "@/app/actions";

type Props = {
  spritzId: string;
  expiresAt: number;
  onUndone: () => void;
  onDismiss: () => void;
};

export default function UndoToast({ spritzId, expiresAt, onUndone, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, expiresAt - Date.now());
      setRemaining(ms);
      if (ms <= 0) onDismiss();
    }, 100);
    return () => clearInterval(id);
  }, [expiresAt, onDismiss]);

  const seconds = Math.ceil(remaining / 1000);

  const handleUndo = () => {
    startTransition(async () => {
      const res = await undoSpritz(spritzId);
      if (res.ok) onUndone();
      else onDismiss();
    });
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-[var(--color-ink)] px-4 py-3 text-[var(--color-cream)] shadow-2xl"
    >
      <span className="font-sans text-sm">
        Logged. Undo in <span className="font-mono tabular text-[var(--color-cream)]">{seconds}s</span>
      </span>
      <button
        type="button"
        onClick={handleUndo}
        disabled={pending}
        className="ui-label rounded-[var(--radius-sm)] bg-[var(--color-error)] px-3 py-2 text-[11px] font-semibold text-[var(--color-cream)] transition active:scale-[0.95] disabled:opacity-60"
      >
        {pending ? "…" : "Undo"}
      </button>
    </motion.div>
  );
}
