import { createSupabaseReadClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/participant";
import { spritzWindowStatus } from "@/lib/time";
import HubClient from "@/components/HubClient";
import type { Participant, Spritz } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEED_PAGE_SIZE = 20;

export default async function HomePage() {
  const me = await getCurrentParticipant();

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
      windowStatus={spritzWindowStatus()}
    />
  );
}
