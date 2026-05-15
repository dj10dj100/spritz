import Link from "next/link";
import { registerParticipant } from "@/app/actions";
import ParticipantStyleFields from "@/components/ParticipantStyleFields";
import RegisterSuccessCard from "@/components/RegisterSuccessCard";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    error?: string;
    returning?: string;
    recover?: string;
  }>;
}) {
  const { token, error, returning, recover } = await searchParams;

  if (token) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center">
        <header className="flex flex-col gap-2">
          <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">
            {returning ? "welcome back" : "you're in"}
          </p>
          <h1 className="display text-[44px] text-[var(--color-aperol)]">
            {returning ? "Found your link." : "Cheers."}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Bookmark this — it&rsquo;s your personal spritz link.
          </p>
        </header>
        <RegisterSuccessCard token={token} />
        <Link
          href="/"
          className="ui-label text-[11px] text-[var(--color-ink-muted)] underline"
        >
          ← Leaderboard
        </Link>
      </main>
    );
  }

  const errorMsg =
    error === "name"
      ? "Pick a name."
      : error === "email"
      ? "That email doesn't look right."
      : error;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">aperitivo hour</p>
        <h1 className="display text-[44px] text-[var(--color-aperol)]">
          {recover ? "Recover your link." : "Join the trip."}
        </h1>
        <p className="max-w-[360px] text-sm text-[var(--color-ink-muted)]">
          {recover
            ? "Already registered? Enter your email below — we'll show your existing link."
            : "Pick a name, drop your email. We'll show you a personal link to bookmark. Already registered? Same form — re-enter your email."}
        </p>
      </header>

      {errorMsg && (
        <p className="text-sm text-[var(--color-error)]">{errorMsg}</p>
      )}

      <form
        action={registerParticipant}
        className="flex w-full max-w-sm flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-5"
      >
        <label className="flex flex-col gap-2">
          <span className="ui-label text-[11px] text-[var(--color-ink-muted)]">Display name</span>
          <input
            type="text"
            name="display_name"
            placeholder="Dan"
            autoComplete="given-name"
            maxLength={32}
            required
            className="rounded-[var(--radius-md)] border border-[var(--color-ink-faint)] bg-[var(--color-cream)] px-4 py-3 font-sans text-base text-[var(--color-ink)] focus:border-[var(--color-aperol)] focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="ui-label text-[11px] text-[var(--color-ink-muted)]">Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="rounded-[var(--radius-md)] border border-[var(--color-ink-faint)] bg-[var(--color-cream)] px-4 py-3 font-sans text-base text-[var(--color-ink)] focus:border-[var(--color-aperol)] focus:outline-none"
          />
        </label>

        <ParticipantStyleFields />

        <button
          type="submit"
          className="ui-label h-12 rounded-[var(--radius-md)] bg-[var(--color-aperol)] text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
        >
          Get my link
        </button>
      </form>

      <Link href="/" className="ui-label text-[11px] text-[var(--color-ink-muted)] underline">
        ← Leaderboard
      </Link>
    </main>
  );
}
