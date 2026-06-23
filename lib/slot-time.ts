// Pure, client-safe time math for scheduling. No googleapis, no server-only —
// so it is unit-testable and reusable by both the availability read path
// (lib/google-calendar.ts) and the booking write path (app/api/book).

import type { DaySchedule, TimeSlot } from "./availability";

export const TIMEZONE = "America/Los_Angeles";
export const SLOT_MS = 60 * 60 * 1000;

/**
 * The next `count` business days (Mon-Fri) starting from `now` in LA time,
 * as UTC date strings. Mid-week this rolls forward over the weekend rather
 * than showing dead past columns. `now` is injectable for deterministic tests.
 *
 * When `weekOffset > 0`, snaps to the Monday of the Nth week ahead instead of
 * rolling from today — so callers get a clean Mon-Fri view of a future week.
 */
export function getBusinessDays(
  now: Date = new Date(),
  count = 5,
  weekOffset = 0,
): Array<{ dateStr: string; dow: number }> {
  const laDateStr = now.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
  const cursor = new Date(`${laDateStr}T12:00:00Z`);

  const dow = cursor.getUTCDay(); // 0=Sun..6=Sat
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  // On weekOffset=0, a weekend means the current week's Mon is already past —
  // jump to next week instead of showing five empty past columns.
  const extraWeek = weekOffset === 0 && (dow === 0 || dow === 6) ? 7 : 0;
  cursor.setUTCDate(cursor.getUTCDate() - daysSinceMonday + weekOffset * 7 + extraWeek);

  const out: Array<{ dateStr: string; dow: number }> = [];
  while (out.length < count) {
    const dow = cursor.getUTCDay();
    if (dow >= 1 && dow <= 5) {
      out.push({ dateStr: cursor.toISOString().slice(0, 10), dow });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/**
 * Convert a local LA wall-clock slot (date + "HH:MM") to an absolute UTC Date,
 * resolving the PST/PDT offset dynamically via an Intl noon-UTC reference so it
 * is correct year-round.
 */
export function slotToUTC(dateStr: string, timeStr: string): Date {
  const refUTC = new Date(`${dateStr}T12:00:00Z`);
  const laHour = Number(
    refUTC.toLocaleString("en-US", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      hour12: false,
    }),
  );
  const offsetHours = 12 - laHour; // 7 for PDT, 8 for PST
  const [h, m] = timeStr.split(":").map(Number);
  const result = new Date(`${dateStr}T00:00:00Z`);
  result.setUTCHours(h + offsetHours, m, 0, 0);
  return result;
}

/** True if [start, end) overlaps any busy block. Adjacency does not count. */
export function isBlocked(
  start: Date,
  end: Date,
  busy: Array<{ start: string; end: string }>,
): boolean {
  return busy.some((b) => start < new Date(b.end) && end > new Date(b.start));
}

/**
 * Compose the next business days with a day-of-week slot template into dated
 * day schedules, dropping past slots and (when `busy` is provided) any slot
 * that overlaps a busy block. `busy === null` means "no calendar data" — the
 * fallback path still returns dated, future-only slots.
 */
export function buildWeek(
  now: Date,
  weeklySlots: Record<number, TimeSlot[]>,
  dayMeta: ReadonlyArray<{ day: string; short: string }>,
  busy: Array<{ start: string; end: string }> | null,
  weekOffset = 0,
): DaySchedule[] {
  return getBusinessDays(now, 5, weekOffset).map(({ dateStr, dow }) => {
    const slots = (weeklySlots[dow] ?? []).filter((slot) => {
      const start = slotToUTC(dateStr, slot.time);
      const end = new Date(start.getTime() + SLOT_MS);
      return start > now && (busy === null || !isBlocked(start, end, busy));
    });
    return { day: dayMeta[dow].day, short: dayMeta[dow].short, date: dateStr, slots };
  });
}
