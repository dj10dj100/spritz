"use client";

import { useState } from "react";
import {
  COLOR_PALETTE,
  DEFAULT_COLOR,
  DEFAULT_EMOJI,
  EMOJI_PALETTE,
} from "@/lib/palettes";

export default function ParticipantStyleFields({
  initialEmoji = DEFAULT_EMOJI,
  initialColor = DEFAULT_COLOR,
}: {
  initialEmoji?: string;
  initialColor?: string;
}) {
  const [emoji, setEmoji] = useState(initialEmoji);
  const [color, setColor] = useState(initialColor);

  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="ui-label text-[11px] text-[var(--color-ink-muted)]">Emoji</legend>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_PALETTE.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex aspect-square items-center justify-center rounded-[var(--radius-md)] text-xl transition active:scale-95 ${
                emoji === e
                  ? "bg-[var(--color-aperol)] text-[var(--color-cream)]"
                  : "bg-[var(--color-cream)] text-[var(--color-ink)]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <input type="hidden" name="emoji" value={emoji} />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="ui-label text-[11px] text-[var(--color-ink-muted)]">Color</legend>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`flex aspect-square items-center justify-center rounded-full border-2 transition active:scale-95 ${
                color === c ? "border-[var(--color-ink)]" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <input type="hidden" name="color" value={color} />
      </fieldset>
    </>
  );
}
