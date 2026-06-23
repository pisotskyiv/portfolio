import "server-only";
import { google } from "googleapis";
import type { DaySchedule } from "./availability";
import { DAY_META, WEEKLY_SLOTS } from "./availability";
import { buildWeek, getBusinessDays, isBlocked } from "./slot-time";
import { slotWindow, googleCalendarLink } from "./booking";

export async function getAvailability(
  now: Date = new Date(),
  weekOffset = 0,
): Promise<DaySchedule[]> {
  const days = getBusinessDays(now, 5, weekOffset);

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
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
    public readonly code: "past" | "taken",
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

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    // events.insert needs calendar.events; the freebusy precheck below is NOT
    // covered by that scope and 403s ("insufficient authentication scopes")
    // without a read scope, so request both.
    scopes: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });
  const cal = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID_PERSONAL ?? "primary";

  const fb = await cal.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: calendarId }],
    },
  });
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
