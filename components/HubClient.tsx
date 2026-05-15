"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Participant, Spritz } from "@/lib/types";
import type { WindowStatus } from "@/lib/time";
import BigSpritzButton from "./BigSpritzButton";
import Leaderboard from "./Leaderboard";
import LiveFeed from "./LiveFeed";
import UndoToast from "./UndoToast";

const FEED_PAGE_SIZE = 20;
const UNDO_WINDOW_MS = 10_000;

type Props = {
  me: Participant | null;
  initialParticipants: Participant[];
  initialSpritzes: Spritz[];
  initialFeed: Spritz[];
  windowStatus: WindowStatus;
};

type PendingUndo = { id: string; expiresAt: number };

export default function HubClient({
  me,
  initialParticipants,
  initialSpritzes,
  initialFeed,
  windowStatus,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [spritzes, setSpritzes] = useState<Spritz[]>(initialSpritzes);
  const [feed, setFeed] = useState<Spritz[]>(initialFeed);
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const participantsById = useMemo(() => {
    const m = new Map<string, Participant>();
    for (const p of participants) m.set(p.id, p);
    return m;
  }, [participants]);

  const upsertSpritz = useCallback((s: Spritz) => {
    setSpritzes((prev) => {
      const without = prev.filter((x) => x.id !== s.id);
      if (s.deleted_at) return without;
      return [...without, s];
    });
    setFeed((prev) => {
      const without = prev.filter((x) => x.id !== s.id);
      if (s.deleted_at) return without;
      const merged = [s, ...without];
      merged.sort((a, b) => +new Date(b.consumed_at) - +new Date(a.consumed_at));
      return merged.slice(0, FEED_PAGE_SIZE);
    });
  }, []);

  const removeSpritz = useCallback((id: string) => {
    setSpritzes((prev) => prev.filter((s) => s.id !== id));
    setFeed((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("spritzes-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "spritzes" },
        (payload: RealtimePostgresChangesPayload<Spritz>) => {
          if (payload.new && "id" in payload.new) {
            upsertSpritz(payload.new as Spritz);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "spritzes" },
        (payload: RealtimePostgresChangesPayload<Spritz>) => {
          if (!payload.new || !("id" in payload.new)) return;
          const next = payload.new as Spritz;
          if (next.deleted_at) {
            removeSpritz(next.id);
          } else {
            upsertSpritz(next);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participants" },
        (payload: RealtimePostgresChangesPayload<Participant>) => {
          const p = payload.new as Participant | undefined;
          if (!p || !("id" in p)) return;
          setParticipants((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, upsertSpritz, removeSpritz]);

  // Expire the undo window so the toast goes away even if the user does nothing.
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!pendingUndo) return;
    const ms = Math.max(0, pendingUndo.expiresAt - Date.now());
    undoTimer.current = setTimeout(() => setPendingUndo(null), ms);
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, [pendingUndo]);

  const onOptimisticInsert = useCallback((tempSpritz: Spritz) => {
    upsertSpritz(tempSpritz);
  }, [upsertSpritz]);

  const onInsertConfirmed = useCallback((tempId: string, real: Spritz) => {
    setSpritzes((prev) => {
      const without = prev.filter((s) => s.id !== tempId && s.id !== real.id);
      return [...without, real];
    });
    setFeed((prev) => {
      const without = prev.filter((s) => s.id !== tempId && s.id !== real.id);
      const merged = [real, ...without];
      merged.sort((a, b) => +new Date(b.consumed_at) - +new Date(a.consumed_at));
      return merged.slice(0, FEED_PAGE_SIZE);
    });
    setPendingUndo({ id: real.id, expiresAt: Date.now() + UNDO_WINDOW_MS });
  }, []);

  const onInsertFailed = useCallback((tempId: string) => {
    removeSpritz(tempId);
  }, [removeSpritz]);

  const onUndoComplete = useCallback((id: string) => {
    removeSpritz(id);
    setPendingUndo(null);
  }, [removeSpritz]);

  return (
    <main className="flex flex-1 flex-col gap-8 pb-12 pt-2">
      <header className="flex flex-col items-center gap-1 text-center">
        <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">aperitivo hour</p>
        <h1 className="display flex flex-col items-center leading-none text-[var(--color-aperol)]">
          <span className="text-[48px] [font-weight:800] sm:text-[72px]">Finale Ligure</span>
          <span className="text-[28px] italic text-[var(--color-ink-muted)] [font-weight:400] sm:text-[36px]">
            2026
          </span>
        </h1>
      </header>

      <Leaderboard participants={participants} spritzes={spritzes} meId={me?.id ?? ""} />

      {windowStatus.state !== "open" ? (
        <p className="rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] px-4 py-4 text-center text-sm italic text-[var(--color-ink-muted)]">
          {windowStatus.state === "before"
            ? `Spritz window opens ${windowStatus.opensLabel}.`
            : `Trip's over — window closed ${windowStatus.closedLabel}.`}
        </p>
      ) : me ? (
        <BigSpritzButton
          me={me}
          onOptimisticInsert={onOptimisticInsert}
          onConfirmed={onInsertConfirmed}
          onFailed={onInsertFailed}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm italic text-[var(--color-ink-muted)]">
            Got your personal link? Open it to spritz.
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <a
              href="/register"
              className="ui-label inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-aperol)] px-6 text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
            >
              Join the trip →
            </a>
            <a
              href="/register?recover=1"
              className="ui-label inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-ink-faint)] bg-[var(--color-cream-warm)] px-6 text-[13px] font-semibold text-[var(--color-ink)] transition active:scale-[0.97]"
            >
              Lost your link?
            </a>
          </div>
        </div>
      )}

      <LiveFeed feed={feed} participantsById={participantsById} />

      {me && pendingUndo && (
        <UndoToast
          spritzId={pendingUndo.id}
          expiresAt={pendingUndo.expiresAt}
          onUndone={() => onUndoComplete(pendingUndo.id)}
          onDismiss={() => setPendingUndo(null)}
        />
      )}
    </main>
  );
}
