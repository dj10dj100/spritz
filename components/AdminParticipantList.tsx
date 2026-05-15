"use client";

import { useEffect, useState } from "react";
import type { Participant } from "@/lib/types";

type Props = {
  participants: Participant[];
  totals: Record<string, number>;
  onRemoveAction: (formData: FormData) => void | Promise<void>;
  onSetTotalAction: (formData: FormData) => void | Promise<void>;
};

export default function AdminParticipantList({
  participants,
  totals,
  onRemoveAction,
  onSetTotalAction,
}: Props) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  if (participants.length === 0) {
    return (
      <p className="rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-6 text-center text-sm italic text-[var(--color-ink-muted)]">
        No one yet. Add someone above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {participants.map((p) => (
        <li
          key={p.id}
          className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-4"
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: p.color }}
            >
              {p.emoji}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-sans text-base font-semibold text-[var(--color-ink)]">
                {p.display_name}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                token: {p.token}
              </span>
            </div>
            <form action={onRemoveAction}>
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                className="ui-label rounded-[var(--radius-sm)] bg-[var(--color-error)]/15 px-3 py-2 text-[10px] font-semibold text-[var(--color-error)] transition active:scale-95"
              >
                remove
              </button>
            </form>
          </div>
          <TotalEditor
            participantId={p.id}
            total={totals[p.id] ?? 0}
            onSetTotalAction={onSetTotalAction}
          />
          <ShareRow url={origin ? `${origin}/?u=${p.token}` : `/?u=${p.token}`} />
        </li>
      ))}
    </ul>
  );
}

function TotalEditor({
  participantId,
  total,
  onSetTotalAction,
}: {
  participantId: string;
  total: number;
  onSetTotalAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={onSetTotalAction} className="flex items-center gap-2">
      <span className="ui-label text-[10px] text-[var(--color-ink-muted)]">total</span>
      <input type="hidden" name="id" value={participantId} />
      <input
        type="number"
        name="total"
        min={0}
        max={9999}
        step={1}
        defaultValue={total}
        className="w-20 rounded-[var(--radius-sm)] border border-[var(--color-ink-faint)] bg-[var(--color-cream)] px-2 py-2 text-center font-mono text-base text-[var(--color-ink)] focus:border-[var(--color-aperol)] focus:outline-none"
      />
      <button
        type="submit"
        className="ui-label rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-3 py-2 text-[10px] font-semibold text-[var(--color-cream)] transition active:scale-95"
      >
        save
      </button>
      <span className="ui-label ml-auto text-[10px] text-[var(--color-ink-muted)]">
        now: {total}
      </span>
    </form>
  );
}

function ShareRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-[var(--radius-sm)] bg-[var(--color-cream)] px-3 py-2 font-mono text-[12px] text-[var(--color-ink-muted)]">
        {url}
      </code>
      <button
        type="button"
        onClick={copy}
        className="ui-label rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-3 py-2 text-[10px] font-semibold text-[var(--color-cream)] transition active:scale-95"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
