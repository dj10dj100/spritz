import { cookies } from "next/headers";
import { createSupabaseReadClient } from "./supabase/server";
import type { Participant } from "./types";

export const PARTICIPANT_COOKIE = "spritz_token";
export const ADMIN_COOKIE = "spritz_admin";

export async function getCurrentParticipant(): Promise<Participant | null> {
  const jar = await cookies();
  const token = jar.get(PARTICIPANT_COOKIE)?.value;
  if (!token) return null;
  const supabase = createSupabaseReadClient();
  const { data } = await supabase
    .from("participants")
    .select("*")
    .eq("token", token)
    .maybeSingle<Participant>();
  return data ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const v = jar.get(ADMIN_COOKIE)?.value;
  return v === expectedAdminCookie();
}

export function expectedAdminCookie(): string {
  // Deterministic per-deploy: hash the admin password. Anyone who steals the
  // cookie can't reverse-engineer the password, and rotating the password
  // invalidates every existing admin session.
  const pw = process.env.ADMIN_PASSWORD ?? "";
  if (!pw) return "__unset__";
  // Tiny deterministic obfuscation; not a security mechanism, just so the cookie
  // value doesn't echo the password.
  let h = 0xcbf29ce4;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `v1.${h.toString(16)}`;
}

export function generateToken(): string {
  // 10 chars from a URL-safe alphabet. ~57 bits — plenty for a 4–12 person trip.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
