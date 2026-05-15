"use client";

import { useState } from "react";

const EMOJI_PALETTE = ["🍹", "🍸", "🥂", "🍷", "🍺", "🌶️", "🍋", "🍊", "🍑", "🐝", "🦄", "🐙"];
const COLOR_PALETTE = [
  "#FF6B1A", "#E04E00", "#1F4A2E", "#9CC9D8", "#D69500",
  "#C13A2E", "#5A9BAE", "#6E5F50", "#3E7C47", "#A45EE5",
];

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export default function AdminAddForm({ action }: Props) {
  const [emoji, setEmoji] = useState(EMOJI_PALETTE[0]);
  const [color, setColor] = useState(COLOR_PALETTE[0]);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-4">
      <label className="flex flex-col gap-2">
        <span className="ui-label text-[11px] text-[var(--color-ink-muted)]">Display name</span>
        <input
          name="display_name"
          maxLength={32}
          required
          placeholder="Dan"
          className="rounded-[var(--radius-md)] border border-[var(--color-ink-faint)] bg-[var(--color-cream)] px-4 py-3 font-sans text-base text-[var(--color-ink)] focus:border-[var(--color-aperol)] focus:outline-none"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="ui-label text-[11px] text-[var(--color-ink-muted)]">Emoji</legend>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_PALETTE.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex aspect-square items-center justify-center rounded-[var(--radius-md)] text-xl transition active:scale-95 ${
                emoji === e ? "bg-[var(--color-aperol)] text-[var(--color-cream)]" : "bg-[var(--color-cream)] text-[var(--color-ink)]"
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

      <button
        type="submit"
        className="ui-label h-12 rounded-[var(--radius-md)] bg-[var(--color-aperol)] text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
      >
        Add + generate URL
      </button>
    </form>
  );
}
