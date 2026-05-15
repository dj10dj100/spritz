"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="ui-label flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-ink)] px-6 text-[15px] font-semibold text-[var(--color-cream)] shadow-md transition active:scale-[0.97] disabled:opacity-60"
      >
        <GoogleMark />
        {loading ? "Redirecting…" : "Sign in with Google"}
      </button>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#FFC107" d="M17.6 9.2c0-.6 0-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.3h2.9c1.7-1.5 2.7-3.8 2.7-6.6Z"/>
      <path fill="#4CAF50" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.6-1.9 1-3.1 1-2.4 0-4.4-1.6-5.1-3.8H.9v2.4A9 9 0 0 0 9 18Z"/>
      <path fill="#1976D2" d="M3.9 10.7A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.2.3-1.7V4.9H.9A9 9 0 0 0 0 9c0 1.5.3 2.8.9 4.1l3-2.4Z"/>
      <path fill="#E53935" d="M9 3.6c1.3 0 2.5.5 3.4 1.4l2.6-2.6A9 9 0 0 0 .9 4.9l3 2.4C4.6 5.1 6.6 3.6 9 3.6Z"/>
    </svg>
  );
}
