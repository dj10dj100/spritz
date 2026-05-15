import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GoogleSignIn from "@/components/GoogleSignIn";
import HubClient from "@/components/HubClient";
import { TRIP_NAME } from "@/lib/trip-config";
import type { Participant, Spritz } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEED_PAGE_SIZE = 20;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-10 py-12 text-center">
        <div className="flex flex-col gap-3">
          <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">aperitivo hour</p>
          <h1 className="display text-[88px] leading-none text-[var(--color-aperol)] [font-weight:800]">
            {TRIP_NAME}
          </h1>
          <p className="text-[var(--color-ink-muted)]">
            A leaderboard for friends drinking too many Aperol spritzes.
          </p>
        </div>
        <GoogleSignIn />
      </main>
    );
  }

  const { data: me } = await supabase
    .from("participants")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle<Participant>();

  if (!me) {
    redirect("/onboard");
  }

  const [{ data: participants }, { data: spritzes }] = await Promise.all([
    supabase
      .from("participants")
      .select("*")
      .order("joined_at", { ascending: true })
      .returns<Participant[]>(),
    supabase
      .from("spritzes")
      .select("*")
      .is("deleted_at", null)
      .order("consumed_at", { ascending: false })
      .limit(FEED_PAGE_SIZE)
      .returns<Spritz[]>(),
  ]);

  // We also need ALL active spritz counts for the leaderboard — fetch the participant_id list separately.
  const { data: allActiveSpritzes } = await supabase
    .from("spritzes")
    .select("id, participant_id, consumed_at, deleted_at")
    .is("deleted_at", null)
    .returns<Spritz[]>();

  return (
    <HubClient
      me={me!}
      initialParticipants={participants ?? []}
      initialSpritzes={allActiveSpritzes ?? []}
      initialFeed={spritzes ?? []}
    />
  );
}
