"use client";

import ParticipantStyleFields from "./ParticipantStyleFields";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export default function AdminAddForm({ action }: Props) {
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

      <label className="flex flex-col gap-2">
        <span className="ui-label text-[11px] text-[var(--color-ink-muted)]">
          Email <span className="lowercase tracking-normal text-[var(--color-ink-faint)]">(optional)</span>
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="dan@example.com"
          className="rounded-[var(--radius-md)] border border-[var(--color-ink-faint)] bg-[var(--color-cream)] px-4 py-3 font-sans text-base text-[var(--color-ink)] focus:border-[var(--color-aperol)] focus:outline-none"
        />
      </label>

      <ParticipantStyleFields />

      <button
        type="submit"
        className="ui-label h-12 rounded-[var(--radius-md)] bg-[var(--color-aperol)] text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
      >
        Add + generate URL
      </button>
    </form>
  );
}
