"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  PARTICIPANT_COOKIE,
  expectedAdminCookie,
  generateToken,
  getCurrentParticipant,
  isAdmin,
} from "@/lib/participant";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

export async function logSpritz(): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const me = await getCurrentParticipant();
  if (!me) return { ok: false, error: "Not in the trip." };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spritzes")
    .insert({ participant_id: me.id })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Insert failed." };
  }
  return { ok: true, id: data.id };
}

export async function undoSpritz(spritzId: string): Promise<{ ok: boolean; error?: string }> {
  if (!spritzId) return { ok: false, error: "Missing id." };
  const me = await getCurrentParticipant();
  if (!me) return { ok: false, error: "Not in the trip." };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("spritzes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", spritzId)
    .eq("participant_id", me.id) // only undo your own
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(PARTICIPANT_COOKIE);
  revalidatePath("/");
  redirect("/");
}

// ─── admin ────────────────────────────────────────────────────────────────

export async function adminLogin(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || pw !== expected) {
    redirect("/admin?error=wrong");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, expectedAdminCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  redirect("/admin");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function addParticipant(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 32);
  if (!displayName) redirect("/admin?error=name");

  const emoji = safeEmoji(String(formData.get("emoji") ?? ""));
  const color = safeColor(String(formData.get("color") ?? ""));
  const token = generateToken();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("participants")
    .insert({ token, display_name: displayName, emoji, color });

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function removeParticipant(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin");

  const supabase = createSupabaseAdminClient();
  await supabase.from("participants").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}
