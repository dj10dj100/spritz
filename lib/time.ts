import { TIMEZONE, TRIP_END, TRIP_START } from "./trip-config";

export type WindowStatus =
  | { state: "before"; opensLabel: string }
  | { state: "open"; closesLabel: string }
  | { state: "after"; closedLabel: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether the spritz window is open in Europe/Rome time.
 * Window is inclusive of both TRIP_START and TRIP_END (full Rome days).
 */
export function spritzWindowStatus(now: Date = new Date()): WindowStatus {
  // T12:00:00Z is a safe midday-UTC anchor that resolves to the right calendar
  // day in Rome regardless of DST.
  const startTs = +startOfRomeDay(new Date(`${TRIP_START}T12:00:00Z`));
  const endStartTs = +startOfRomeDay(new Date(`${TRIP_END}T12:00:00Z`));
  const endTs = endStartTs + DAY_MS; // exclusive upper bound
  const n = +now;

  if (n < startTs) return { state: "before", opensLabel: niceDate(TRIP_START) };
  if (n >= endTs) return { state: "after", closedLabel: niceDate(TRIP_END) };
  return { state: "open", closesLabel: niceDate(TRIP_END) };
}

function niceDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function formatRome(d: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...opts,
  }).format(date);
}

export function startOfRomeDay(d: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  // Build the wall-clock midnight for Rome, then resolve to a UTC instant.
  // Trick: format midnight-in-Rome, then parse using Date with the timezone offset baked in.
  // The simplest reliable approach: compute the offset for that date by formatting parts.
  const wall = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const tzOffsetMin = romeOffsetMinutes(wall);
  return new Date(wall.getTime() - tzOffsetMin * 60_000);
}

function romeOffsetMinutes(at: Date): number {
  // Returns the offset (in minutes) between Europe/Rome wall-clock and UTC at the given instant.
  // Positive = Rome is ahead of UTC.
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const asUTC = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second")),
  );
  return Math.round((asUTC - at.getTime()) / 60_000);
}

export function relativeTime(d: Date | string, now: Date = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffSec = Math.round((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}
