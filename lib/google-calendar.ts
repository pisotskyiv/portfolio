import "server-only";
import { google } from "googleapis";
import type { DaySchedule } from "./availability";
import { DAY_META, WEEKLY_SLOTS } from "./availability";
import { buildWeek, getBusinessDays, isBlocked } from "./slot-time";
import { slotWindow, googleCalendarLink, isOfferedSlot } from "./booking";

/**
 * Resolve the service-account private key from env, tolerant of how the value
 * survives different hosts. Preference order:
 *   1. GOOGLE_PRIVATE_KEY_B64 — base64 of the raw PEM. No newline or quote
 *      fragility; the robust way to store a PEM in a single-line env UI.
 *   2. GOOGLE_PRIVATE_KEY — raw PEM, possibly with literal `\n` and/or a layer
 *      of wrapping quotes. Next's dotenv strips quotes locally, so a quoted
 *      value works in dev but 503s in prod (ERR_OSSL_UNSUPPORTED / DECODER
 *      routines::unsupported) on hosts like Vercel that keep the quotes — hence
 *      we strip them here too.
 */
export function loadServiceAccountKey(): string {
  const b64 = process.env.GOOGLE_PRIVATE_KEY_B64?.trim();
  if (b64) return Buffer.from(b64, "base64").toString("utf8");

  let key = process.env.GOOGLE_PRIVATE_KEY ?? "";
  if (key.length >= 2) {
    const quote = key[0];
    if ((quote === '"' || quote === "'") && key.at(-1) === quote) {
      key = key.slice(1, -1);
    }
  }
  return key.replace(/\\n/g, "\n");
}

function calendarAuth(scopes: string[]) {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: loadServiceAccountKey(),
    scopes,
  });
}

type FreeBusyCalendars =
  | {
      [id: string]: {
        errors?: Array<{ domain?: string | null; reason?: string | null }> | null;
      };
    }
  | null
  | undefined;

/**
 * freebusy.query does NOT fail the whole request when one calendar is
 * unreadable — it returns that calendar with an `errors` array and no `busy`,
 * so its events silently vanish from the merge and the owner looks free when
 * they're actually booked. The usual cause: a calendar (commonly the work one)
 * not shared with the service account `GOOGLE_CLIENT_EMAIL`, giving `notFound`
 * / `forbidden`. Surface every per-calendar failure as a loud, greppable warn
 * so this is visible in production logs instead of failing silent.
 */
function warnOnCalendarErrors(
  calendars: FreeBusyCalendars,
  context: string,
): void {
  for (const [id, cal] of Object.entries(calendars ?? {})) {
    if (cal.errors && cal.errors.length > 0) {
      console.warn(
        `[availability] freebusy unreadable for calendar ${id} (${context}); its busy times are missing — check the calendar is shared with ${process.env.GOOGLE_CLIENT_EMAIL ?? "the service account"}`,
        cal.errors,
      );
    }
  }
}

export async function getAvailability(
  now: Date = new Date(),
  weekOffset = 0,
): Promise<DaySchedule[]> {
  const days = getBusinessDays(now, 5, weekOffset);

  try {
    const auth = calendarAuth([
      "https://www.googleapis.com/auth/calendar.readonly",
    ]);
    const cal = google.calendar({ version: "v3", auth });

    const timeMin = new Date(`${days[0].dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(
      `${days[days.length - 1].dateStr}T23:59:59Z`,
    ).toISOString();

    const calIds = [
      process.env.GOOGLE_CALENDAR_ID_PERSONAL,
      process.env.GOOGLE_CALENDAR_ID_WORK,
    ].filter(Boolean) as string[];

    const res = await cal.freebusy.query({
      requestBody: { timeMin, timeMax, items: calIds.map((id) => ({ id })) },
    });
    warnOnCalendarErrors(res.data.calendars, "availability read");

    const busyBlocks = Object.values(res.data.calendars ?? {}).flatMap(
      (c) => (c.busy ?? []) as Array<{ start: string; end: string }>,
    );

    return buildWeek(now, WEEKLY_SLOTS, DAY_META, busyBlocks, weekOffset);
  } catch (err) {
    console.error(
      "[availability] calendar fetch failed; serving static fallback",
      err,
    );
    return buildWeek(now, WEEKLY_SLOTS, DAY_META, null, weekOffset);
  }
}

/** A booking rejected for a recoverable reason the client can act on. */
export class BookingError extends Error {
  constructor(
    public readonly code: "past" | "taken" | "unavailable",
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

export interface BookingResult {
  start: string;
  end: string;
  addToCalendarLink: string;
  /** Static reusable Google Meet URL (env `MEET_URL`), when configured. */
  meetUrl?: string;
}

export interface BookSlotInput {
  name: string;
  email: string;
  date: string;
  time: string;
  /** Injectable reference time for deterministic tests. */
  now?: Date;
}

/**
 * Write a one-hour intro-call event onto the owner's calendar via the service
 * account, with a freebusy re-check immediately before insert to guard against
 * a double-book race. Throws BookingError("past") or BookingError("taken") for
 * client-recoverable cases; other failures propagate as raw errors.
 *
 * The service account cannot invite attendees from a personal Gmail calendar
 * (needs Workspace domain-wide delegation — and passing `attendees` at all makes
 * the insert fail), so the booker is recorded in the event description for the
 * owner's reference and the recruiter self-adds via `addToCalendarLink`.
 */
export async function bookSlot(input: BookSlotInput): Promise<BookingResult> {
  const now = input.now ?? new Date();
  const { start, end } = slotWindow(input.date, input.time);
  if (start <= now) {
    throw new BookingError("past", "That time is in the past.");
  }
  // The 4-week window and the Mon-Fri afternoon grid are display limits on the
  // availability read; re-enforce them here so a hand-crafted POST can't book an
  // off-grid or out-of-window slot the UI never offered.
  if (!isOfferedSlot(input.date, input.time, now)) {
    throw new BookingError("unavailable", "That time isn't an available slot.");
  }

  // events.insert needs calendar.events; the freebusy precheck below is NOT
  // covered by that scope and 403s ("insufficient authentication scopes")
  // without a read scope, so request both.
  const auth = calendarAuth([
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);
  const cal = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID_PERSONAL ?? "primary";

  const fb = await cal.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: calendarId }],
    },
  });
  warnOnCalendarErrors(fb.data.calendars, "booking precheck");
  const busy = Object.values(fb.data.calendars ?? {}).flatMap(
    (c) => (c.busy ?? []) as Array<{ start: string; end: string }>,
  );
  if (isBlocked(start, end, busy)) {
    throw new BookingError("taken", "That slot was just taken. Pick another.");
  }

  const title = `Intro call — ${input.name}`;
  // A personal-Gmail service account can't create a per-meeting Meet link
  // (needs Workspace + domain-wide delegation), so we ride a static reusable
  // Meet room from env onto both the owner event and the recruiter's self-add
  // link. Unset env -> no join link rather than a broken one.
  const meetUrl = process.env.MEET_URL?.trim() || undefined;
  const details = meetUrl
    ? `Booked via the portfolio site by ${input.name} (${input.email}).\nJoin: ${meetUrl}`
    : `Booked via the portfolio site by ${input.name} (${input.email}).`;

  await cal.events.insert({
    calendarId,
    requestBody: {
      summary: title,
      description: details,
      location: meetUrl,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    addToCalendarLink: googleCalendarLink({
      title,
      details,
      start,
      end,
      location: meetUrl,
    }),
    meetUrl,
  };
}
