// Pure, client-safe booking helpers. No googleapis, no server-only — so the
// zod contract, the slot-window math, and the add-to-calendar link builder are
// all unit-testable and shareable between the route, the I/O layer, and the UI.

import { z } from "zod";
import { slotToUTC, SLOT_MS } from "./slot-time";

/**
 * Request body for POST /api/book. Shape only — the slot's date/time. The
 * booker's identity (name/email) is taken from the authenticated session
 * server-side, never trusted from the client. Range/past validation happens in
 * the I/O layer against a live `now`.
 */
export const bookInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be yyyy-mm-dd"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time must be HH:MM"),
});
export type BookInput = z.infer<typeof bookInput>;

export interface SlotWindow {
  start: Date;
  end: Date;
}

/** Absolute UTC [start, end) for a local LA wall-clock slot, one hour long. */
export function slotWindow(date: string, time: string): SlotWindow {
  const start = slotToUTC(date, time);
  return { start, end: new Date(start.getTime() + SLOT_MS) };
}

/** `2030-01-15T17:00:00.000Z` -> `20300115T170000Z` (Google's basic format). */
function toBasicUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * A "render?action=TEMPLATE" link the recruiter clicks to self-add the event to
 * their own calendar — our only invite path, since a personal-Gmail service
 * account cannot email invites.
 */
export function googleCalendarLink(opts: {
  title: string;
  details: string;
  start: Date;
  end: Date;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toBasicUTC(opts.start)}/${toBasicUTC(opts.end)}`,
    details: opts.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
