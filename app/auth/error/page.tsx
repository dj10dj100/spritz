import Link from "next/link";

type Search = { reason?: string };

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { reason } = await searchParams;
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <h1 className="display text-[44px] text-[var(--color-aperol-deep)]">Couldn&rsquo;t sign you in</h1>
      <p className="text-[var(--color-ink-muted)]">
        {reason ?? "Something went wrong with Google. Give it another go."}
      </p>
      <Link
        href="/"
        className="ui-label inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-aperol)] px-6 text-[15px] font-semibold text-[var(--color-cream)] shadow-sm transition active:scale-[0.97]"
      >
        Try again
      </Link>
    </main>
  );
}
