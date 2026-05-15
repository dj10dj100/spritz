"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SoundToggle from "./SoundToggle";

export default function HeaderChrome() {
  const pathname = usePathname();
  const isHub = pathname === "/";
  const isStats = pathname === "/stats";

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-2 flex items-center justify-between bg-[var(--color-cream)]/85 px-4 py-3 backdrop-blur-md">
      <nav className="flex items-center gap-3">
        <Link
          href="/"
          aria-current={isHub ? "page" : undefined}
          className={`ui-label text-[11px] ${isHub ? "text-[var(--color-aperol)]" : "text-[var(--color-ink-muted)]"}`}
        >
          Leaderboard
        </Link>
        <Link
          href="/stats"
          aria-current={isStats ? "page" : undefined}
          className={`ui-label text-[11px] ${isStats ? "text-[var(--color-aperol)]" : "text-[var(--color-ink-muted)]"}`}
        >
          Stats
        </Link>
      </nav>
      <SoundToggle />
    </header>
  );
}
