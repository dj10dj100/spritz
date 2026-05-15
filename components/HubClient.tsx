"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Participant, Spritz } from "@/lib/types";
import { TRIP_NAME } from "@/lib/trip-config";
import BigSpritzButton from "./BigSpritzButton";
import Leaderboard from "./Leaderboard";
import LiveFeed from "./LiveFeed";
import UndoToast from "./UndoToast";

const FEED_PAGE_SIZE = 20;
const UNDO_WINDOW_MS = 10_000;

type Props = {
  me: Participant;
  initialParticipants: Participant[];
  initialSpritzes: Spritz[];
  initialFeed: Spritz[];
};

type PendingUndo = { id: string; expiresAt: number };

export default function HubClient({ me, initialParticipants, initialSpritzes, initialFeed }: Props) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [spritzes, setSpritzes] = useState<Spritz[]>(initialSpritzes);
  const [feed, setFeed] = useState<Spritz[]>(initialFeed);
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
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
        <h1 className="display text-[64px] leading-none text-[var(--color-aperol)] [font-weight:800] sm:text-[88px]">
          {TRIP_NAME}
        </h1>
      </header>

      <Leaderboard participants={participants} spritzes={spritzes} meId={me.id} />

      <BigSpritzButton
        me={me}
        onOptimisticInsert={onOptimisticInsert}
        onConfirmed={onInsertConfirmed}
        onFailed={onInsertFailed}
      />

      <LiveFeed feed={feed} participantsById={participantsById} />

      {pendingUndo && (
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
