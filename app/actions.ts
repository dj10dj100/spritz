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
import { spritzWindowStatus } from "@/lib/time";
import { DEFAULT_COLOR, DEFAULT_EMOJI, safeColor, safeEmoji } from "@/lib/palettes";

export async function logSpritz(): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const me = await getCurrentParticipant();
  if (!me) return { ok: false, error: "Not in the trip." };

  const window = spritzWindowStatus();
  if (window.state === "before") {
    return { ok: false, error: `Spritz window opens ${window.opensLabel}.` };
  }
  if (window.state === "after") {
    return { ok: false, error: `Trip's over — window closed ${window.closedLabel}.` };
  }

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

// ─── self-registration ────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerParticipant(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 32);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);

  if (!displayName) redirect("/register?error=name");
  if (!email || !EMAIL_RE.test(email)) redirect("/register?error=email");

  const supabase = createSupabaseAdminClient();

  const { data: existing, error: lookupErr } = await supabase
    .from("participants")
    .select("token")
    .eq("email", email)
    .maybeSingle<{ token: string }>();

  if (lookupErr) redirect(`/register?error=${encodeURIComponent(lookupErr.message)}`);

  if (existing) {
    redirect(`/register?token=${existing.token}&returning=1`);
  }

  const emoji = safeEmoji(String(formData.get("emoji") ?? "")) || DEFAULT_EMOJI;
  const color = safeColor(String(formData.get("color") ?? "")) || DEFAULT_COLOR;
  const token = generateToken();
  const { error } = await supabase
    .from("participants")
    .insert({ token, display_name: displayName, email, emoji, color });

  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/register?token=${token}`);
}

export async function addParticipant(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 32);
  if (!displayName) redirect("/admin?error=name");

  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const email = rawEmail || null;
  if (email && !EMAIL_RE.test(email)) {
    redirect("/admin?error=" + encodeURIComponent("Email doesn't look right."));
  }

  const emoji = safeEmoji(String(formData.get("emoji") ?? ""));
  const color = safeColor(String(formData.get("color") ?? ""));
  const token = generateToken();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("participants")
    .insert({ token, display_name: displayName, email, emoji, color });

  if (error) {
    const msg = /unique/i.test(error.message) ? "Email already registered." : error.message;
    redirect(`/admin?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function removeParticipant(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin");

  const supabase = createSupabaseAdminClient();
  const { error, count } = await supabase
    .from("participants")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  if (!count) redirect(`/admin?error=${encodeURIComponent("Delete affected 0 rows.")}`);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function setParticipantTotal(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("total") ?? "");
  if (!id) redirect("/admin");

  const target = Number.parseInt(raw, 10);
  if (!Number.isFinite(target) || target < 0 || target > 9999) {
    redirect(`/admin?error=${encodeURIComponent("Total must be 0–9999.")}`);
  }

  const supabase = createSupabaseAdminClient();

  const { data: active, error: readErr } = await supabase
    .from("spritzes")
    .select("id, consumed_at")
    .eq("participant_id", id)
    .is("deleted_at", null)
    .order("consumed_at", { ascending: false });

  if (readErr) redirect(`/admin?error=${encodeURIComponent(readErr.message)}`);

  const current = active?.length ?? 0;
  const diff = target - current;

  if (diff > 0) {
    const rows = Array.from({ length: diff }, () => ({ participant_id: id }));
    const { error } = await supabase.from("spritzes").insert(rows);
    if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  } else if (diff < 0) {
    const toDelete = (active ?? []).slice(0, -diff).map((r) => r.id as string);
    const { error } = await supabase
      .from("spritzes")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", toDelete);
    if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}
