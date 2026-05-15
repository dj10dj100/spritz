"use client";

import { useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { logSpritz } from "@/app/actions";
import { playClink } from "@/lib/clink";
import { getSoundOn } from "@/lib/sound-prefs";
import type { Participant, Spritz } from "@/lib/types";

type Props = {
  me: Participant;
  onOptimisticInsert: (tempSpritz: Spritz) => void;
  onConfirmed: (tempId: string, real: Spritz) => void;
  onFailed: (tempId: string) => void;
};

export default function BigSpritzButton({ me, onOptimisticInsert, onConfirmed, onFailed }: Props) {
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inflight = useRef(0);

  const burstConfetti = useCallback(() => {
    confetti({
      particleCount: 28,
      spread: 70,
      startVelocity: 32,
      gravity: 1.1,
      ticks: 80,
      origin: { y: 0.7 },
      colors: ["#FF6B1A", "#E04E00", "#FBF1E4", "#1F4A2E"],
      disableForReducedMotion: true,
    });
  }, []);

  const onTap = useCallback(async () => {
    inflight.current += 1;
    const tempId = `temp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const temp: Spritz = {
      id: tempId,
      participant_id: me.id,
      consumed_at: now,
      location: null,
      note: null,
      deleted_at: null,
    };
    onOptimisticInsert(temp);
    burstConfetti();
    if (getSoundOn()) playClink();

    const result = await logSpritz();
    if (result.ok) {
      onConfirmed(tempId, { ...temp, id: result.id });
    } else {
      onFailed(tempId);
      setErrorMsg(result.error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setErrorMsg(null), 3500);
    }
    inflight.current -= 1;
  }, [me.id, onOptimisticInsert, burstConfetti, onConfirmed, onFailed]);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onTap}
        className={`ui-label h-24 w-full rounded-[var(--radius-xl)] bg-[var(--color-aperol)] text-[20px] font-bold text-[var(--color-cream)] shadow-[0_8px_24px_-8px_rgba(255,107,26,0.7)] transition-transform duration-[80ms] ease-out active:scale-[0.94] active:bg-[var(--color-aperol-deep)] ${
          shake ? "shake" : ""
        }`}
        aria-label="Log a spritz"
      >
        +1 SPRITZ 🍹
      </button>
      {errorMsg && (
        <p role="status" className="text-xs text-[var(--color-error)]">
          couldn&rsquo;t log that, tap again
        </p>
      )}
    </div>
  );
}
