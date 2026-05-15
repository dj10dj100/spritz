import type { Participant, Spritz } from "./types";
import { startOfRomeDay } from "./time";
import { TIMEZONE } from "./trip-config";

// Per-spritz physical/nutritional facts. One bar-poured Aperol spritz:
// 60ml Aperol (11% ABV) + 90ml Prosecco (11% ABV) + ~25ml soda.
export const ML_PER_SPRITZ = 175;
export const KCAL_PER_SPRITZ = 125;
// UK alcohol units = (ml × ABV%) / 1000. Aperol: 60×11=660; Prosecco: 90×11=990. Total 1650 → 1.65 units.
export const UNITS_PER_SPRITZ = 1.65;

function activeSpritzes(spritzes: Spritz[]): Spritz[] {
  return spritzes.filter((s) => !s.deleted_at);
}

export function totalGroup(spritzes: Spritz[]): number {
  return activeSpritzes(spritzes).length;
}

export function spritzesPerHour(spritzes: Spritz[], now: Date = new Date()): number {
  const cutoff = now.getTime() - 60 * 60 * 1000;
  const recent = activeSpritzes(spritzes).filter((s) => +new Date(s.consumed_at) >= cutoff);
  return Math.round((recent.length / 1) * 10) / 10;
}

/**
 * Longest gap between consecutive consumed_at for a participant, in hours.
 * Returns null if the participant has fewer than 2 active spritzes.
 */
export function dryStreak(spritzes: Spritz[], participantId: string): number | null {
  const list = activeSpritzes(spritzes)
    .filter((s) => s.participant_id === participantId)
    .map((s) => +new Date(s.consumed_at))
    .sort((a, b) => a - b);
  if (list.length < 2) return null;
  let maxGapMs = 0;
  for (let i = 1; i < list.length; i++) {
    const gap = list[i] - list[i - 1];
    if (gap > maxGapMs) maxGapMs = gap;
  }
  return Math.round((maxGapMs / 3_600_000) * 10) / 10;
}

export type SpritzOfTheDay = { participant: Participant; count: number } | null;

/**
 * Participant with the most spritzes in the current Europe/Rome day.
 * Ties broken by latest consumed_at. Null if zero spritzes today.
 */
export function spritzOfTheDay(
  spritzes: Spritz[],
  participants: Participant[],
  now: Date = new Date(),
): SpritzOfTheDay {
  const dayStart = startOfRomeDay(now).getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  const todays = activeSpritzes(spritzes).filter((s) => {
    const t = +new Date(s.consumed_at);
    return t >= dayStart && t < dayEnd;
  });
  if (todays.length === 0) return null;

  const stats = new Map<string, { count: number; lastTs: number }>();
  for (const s of todays) {
    const prev = stats.get(s.participant_id) ?? { count: 0, lastTs: 0 };
    stats.set(s.participant_id, {
      count: prev.count + 1,
      lastTs: Math.max(prev.lastTs, +new Date(s.consumed_at)),
    });
  }
  let bestId: string | null = null;
  let best = { count: 0, lastTs: 0 };
  for (const [pid, s] of stats) {
    if (s.count > best.count || (s.count === best.count && s.lastTs > best.lastTs)) {
      bestId = pid;
      best = s;
    }
  }
  if (!bestId) return null;
  const participant = participants.find((p) => p.id === bestId);
  if (!participant) return null;
  return { participant, count: best.count };
}

export type LoserRow = { participant: Participant; count: number } | null;

/**
 * Participant with fewest spritzes (including zero). Ties broken alphabetically.
 */
export function loser(spritzes: Spritz[], participants: Participant[]): LoserRow {
  if (participants.length === 0) return null;
  const counts = new Map<string, number>();
  for (const p of participants) counts.set(p.id, 0);
  for (const s of activeSpritzes(spritzes)) {
    counts.set(s.participant_id, (counts.get(s.participant_id) ?? 0) + 1);
  }
  const ranked = participants
    .map((p) => ({ participant: p, count: counts.get(p.id) ?? 0 }))
    .sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      return a.participant.display_name.localeCompare(b.participant.display_name);
    });
  return ranked[0] ?? null;
}

export type DailyCount = { key: string; label: string; count: number };

/**
 * Group active spritzes by Europe/Rome day, returning one entry per day from
 * the earliest-spritz day through today (inclusive). Empty days included as 0.
 */
export function spritzesPerDay(spritzes: Spritz[], now: Date = new Date()): DailyCount[] {
  const active = activeSpritzes(spritzes);
  if (active.length === 0) return [];

  const bucket = new Map<string, number>();
  let earliest = Number.POSITIVE_INFINITY;
  for (const s of active) {
    const t = +new Date(s.consumed_at);
    if (t < earliest) earliest = t;
    const key = romeDayKey(new Date(s.consumed_at));
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }

  const startTs = +startOfRomeDay(new Date(earliest));
  const endTs = +startOfRomeDay(now);
  const out: DailyCount[] = [];
  for (let t = startTs; t <= endTs; t += 24 * 60 * 60 * 1000) {
    const d = new Date(t);
    const key = romeDayKey(d);
    out.push({ key, label: romeDayLabel(d), count: bucket.get(key) ?? 0 });
  }
  return out;
}

function romeDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function romeDayLabel(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "numeric",
  }).format(d);
}
