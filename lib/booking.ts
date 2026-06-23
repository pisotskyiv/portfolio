// Pure, client-safe booking helpers. No googleapis, no server-only — so the
// zod contract, the slot-window math, and the add-to-calendar link builder are
// all unit-testable and shareable between the route, the I/O layer, and the UI.

import { z } from "zod";
import { slotToUTC, SLOT_MS, TIMEZONE } from "./slot-time";

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

/** Human-readable slot label in Pacific time, e.g. "Wed, Jun 24, 12 PM PT". */
export function formatSlotLabel(date: string, time: string): string {
  const start = slotToUTC(date, time);
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
  }).format(start);
  return `${formatted} PT`;
}

/** `2030-01-15T17:00:00.000Z` -> `20300115T170000Z` (Google's basic format). */
function toBasicUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * A "render?action=TEMPLATE" link the recruiter clicks to self-add the event to
 * their own calendar — our only invite path, since a personal-Gmail service
 * account cannot email invites. An optional `location` (e.g. the Google Meet
 * URL) rides along as the event location so the self-added copy carries the
 * join link too.
 */
export function googleCalendarLink(opts: {
  title: string;
  details: string;
  start: Date;
  end: Date;
  location?: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toBasicUTC(opts.start)}/${toBasicUTC(opts.end)}`,
    details: opts.details,
  });
  if (opts.location) params.set("location", opts.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Wrap a calendar link in our own redirect so a click is logged before the
 * visitor lands on Google's "finalize" page. The endpoint host-allowlists the
 * target, so it is never an open redirector. This is the closest signal we get
 * to "they opened finalize" — not "they saved", which Google exposes no
 * callback for.
 */
export function trackedCalLink(rawLink: string): string {
  return `/api/cal-redirect?to=${encodeURIComponent(rawLink)}`;
}
