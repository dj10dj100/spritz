import Link from "next/link";
import { isAdmin } from "@/lib/participant";
import { createSupabaseReadClient } from "@/lib/supabase/server";
import {
  addParticipant,
  adminLogin,
  adminLogout,
  removeParticipant,
  setParticipantTotal,
} from "@/app/actions";
import AdminParticipantList from "@/components/AdminParticipantList";
import AdminAddForm from "@/components/AdminAddForm";
import type { Participant } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authed = await isAdmin();

  if (!authed) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">admin</p>
          <h1 className="display text-[44px]">Trip control</h1>
        </div>
        {error && (
          <p className="text-sm text-[var(--color-error)]">
            {error === "wrong" ? "Wrong password." : error}
          </p>
        )}
        <form action={adminLogin} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="Trip password"
            autoComplete="off"
            required
            className="rounded-[var(--radius-md)] border border-[var(--color-ink-faint)] bg-[var(--color-cream-warm)] px-4 py-3 font-sans text-base text-[var(--color-ink)] focus:border-[var(--color-aperol)] focus:outline-none"
          />
          <button
            type="submit"
            className="ui-label h-12 rounded-[var(--radius-md)] bg-[var(--color-ink)] text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
          >
            Unlock
          </button>
        </form>
        <Link href="/" className="ui-label text-[11px] text-[var(--color-ink-muted)] underline">
          ← Leaderboard
        </Link>
      </main>
    );
  }

  const supabase = createSupabaseReadClient();
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .order("joined_at", { ascending: true })
    .returns<Participant[]>();

  const { data: activeSpritzes } = await supabase
    .from("spritzes")
    .select("participant_id")
    .is("deleted_at", null)
    .returns<{ participant_id: string }[]>();

  const totals: Record<string, number> = {};
  for (const row of activeSpritzes ?? []) {
    totals[row.participant_id] = (totals[row.participant_id] ?? 0) + 1;
  }

  return (
    <main className="flex flex-1 flex-col gap-8 py-6">
      <header className="flex items-center justify-between">
        <h1 className="display text-[44px]">Trip control</h1>
        <form action={adminLogout}>
          <button
            type="submit"
            className="ui-label text-[11px] text-[var(--color-ink-muted)] underline"
          >
            log out
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="ui-label text-[11px] text-[var(--color-ink-muted)]">Add a participant</h2>
        {error && error !== "wrong" && (
          <p className="text-sm text-[var(--color-error)]">{error === "name" ? "Pick a name first." : error}</p>
        )}
        <AdminAddForm action={addParticipant} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="ui-label text-[11px] text-[var(--color-ink-muted)]">
          Participants ({(participants ?? []).length})
        </h2>
        <AdminParticipantList
          participants={participants ?? []}
          totals={totals}
          onRemoveAction={removeParticipant}
          onSetTotalAction={setParticipantTotal}
        />
      </section>
    </main>
  );
}
