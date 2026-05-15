import { createSupabaseReadClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/participant";
import HubClient from "@/components/HubClient";
import { TRIP_NAME } from "@/lib/trip-config";
import type { Participant, Spritz } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEED_PAGE_SIZE = 20;

export default async function HomePage() {
  const me = await getCurrentParticipant();

  if (!me) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-10 py-12 text-center">
        <div className="flex flex-col gap-3">
          <p className="ui-label text-[11px] text-[var(--color-ink-muted)]">aperitivo hour</p>
          <h1 className="display text-[88px] leading-none text-[var(--color-aperol)] [font-weight:800]">
            {TRIP_NAME}
          </h1>
          <p className="text-[var(--color-ink-muted)]">
            Invite-only. Open the personal link sent to you on WhatsApp.
          </p>
        </div>
      </main>
    );
  }

  const supabase = createSupabaseReadClient();
  const [{ data: participants }, { data: feed }, { data: allSpritzes }] = await Promise.all([
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
    supabase
      .from("spritzes")
      .select("id, participant_id, consumed_at, deleted_at")
      .is("deleted_at", null)
      .returns<Spritz[]>(),
  ]);

  return (
    <HubClient
      me={me}
      initialParticipants={participants ?? []}
      initialSpritzes={allSpritzes ?? []}
      initialFeed={feed ?? []}
    />
  );
}
