"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMOJI_PALETTE = ["🍹", "🍸", "🥂", "🍷", "🍺", "🌶️", "🍋", "🍊", "🍑", "🐝", "🦄", "🐙"];
const COLOR_PALETTE = [
  "#FF6B1A", "#E04E00", "#1F4A2E", "#9CC9D8", "#D69500",
  "#C13A2E", "#5A9BAE", "#6E5F50", "#3E7C47", "#A45EE5",
];

function safeEmoji(input: string | undefined): string {
  if (!input) return "🍹";
  return EMOJI_PALETTE.includes(input) ? input : "🍹";
}

function safeColor(input: string | undefined): string {
  if (!input) return "#FF6B1A";
  return COLOR_PALETTE.includes(input) ? input : "#FF6B1A";
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 32);
  if (!displayName) {
    redirect("/onboard?error=missing_name");
  }
  const emoji = safeEmoji(String(formData.get("emoji") ?? ""));
  const color = safeColor(String(formData.get("color") ?? ""));

  const { error } = await supabase.from("participants").insert({
    auth_user_id: user.id,
    display_name: displayName,
    emoji,
    color,
  });

  if (error) {
    redirect(`/onboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect("/");
}

export async function logSpritz(): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: participant, error: participantErr } = await supabase
    .from("participants")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (participantErr || !participant) {
    return { ok: false, error: "Finish onboarding first." };
  }

  const { data, error } = await supabase
    .from("spritzes")
    .insert({ participant_id: participant.id })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Insert failed." };
  }

  return { ok: true, id: data.id };
}

export async function undoSpritz(spritzId: string): Promise<{ ok: boolean; error?: string }> {
  if (!spritzId) return { ok: false, error: "Missing id." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Idempotent: only soft-delete if not already soft-deleted.
  const { error } = await supabase
    .from("spritzes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", spritzId)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
