"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegisterSuccessCard({ token }: { token: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}/?u=${token}` : `/?u=${token}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked — fall back to the visible URL the user can copy manually
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] p-5">
      <span className="ui-label text-[11px] text-[var(--color-ink-muted)]">your link</span>
      <code className="block break-all rounded-[var(--radius-sm)] bg-[var(--color-cream)] px-3 py-3 font-mono text-[12px] text-[var(--color-ink)]">
        {url}
      </code>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="ui-label flex-1 rounded-[var(--radius-md)] bg-[var(--color-ink)] px-4 py-3 text-[12px] font-semibold text-[var(--color-cream)] transition active:scale-95"
        >
          {copied ? "copied" : "copy link"}
        </button>
        <Link
          href={`/?u=${token}`}
          className="ui-label flex-1 rounded-[var(--radius-md)] bg-[var(--color-aperol)] px-4 py-3 text-center text-[12px] font-semibold text-[var(--color-cream)] transition active:scale-95"
        >
          use it now
        </Link>
      </div>
    </div>
  );
}
