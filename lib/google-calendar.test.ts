import { describe, it, expect, vi, beforeEach } from "vitest";

// google-calendar.ts imports "server-only" (throws outside an RSC build) and
// "googleapis" (network). Stub both so the booking logic is unit-testable.
vi.mock("server-only", () => ({}));

// vi.hoisted: the googleapis factory reads `jwtCtor` eagerly (it's a property
// value, not inside the lazy calendar() arrow), so it must exist before the
// hoisted vi.mock runs.
const { freebusyQuery, eventsInsert, jwtCtor } = vi.hoisted(() => ({
  freebusyQuery: vi.fn(),
  eventsInsert: vi.fn(),
  jwtCtor: vi.fn(),
}));
vi.mock("googleapis", () => ({
  google: {
    auth: { JWT: jwtCtor },
    calendar: () => ({
      freebusy: { query: freebusyQuery },
      events: { insert: eventsInsert },
    }),
  },
}));

import { bookSlot, BookingError } from "./google-calendar";

const VALID = {
  name: "Jane Recruiter",
  email: "jane@example.com",
  date: "2030-01-15", // winter -> PST -> 09:00 PT == 17:00Z
  time: "09:00",
};
const BEFORE = new Date("2030-01-01T00:00:00Z");
const AFTER = new Date("2030-02-01T00:00:00Z");

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GOOGLE_CALENDAR_ID_PERSONAL", "primary-cal");
  vi.stubEnv("GOOGLE_CLIENT_EMAIL", "svc@example.iam.gserviceaccount.com");
  vi.stubEnv("GOOGLE_PRIVATE_KEY", "key");
  freebusyQuery.mockResolvedValue({ data: { calendars: { "primary-cal": { busy: [] } } } });
  eventsInsert.mockResolvedValue({ data: { id: "evt1", htmlLink: "https://cal/evt1" } });
});

describe("bookSlot", () => {
  it("inserts the event and returns an add-to-calendar link on a free slot", async () => {
    const result = await bookSlot({ ...VALID, now: BEFORE });

    expect(eventsInsert).toHaveBeenCalledOnce();
    const arg = eventsInsert.mock.calls[0][0];
    expect(arg.calendarId).toBe("primary-cal");
    expect(arg.requestBody.start.dateTime).toBe("2030-01-15T17:00:00.000Z");
    expect(arg.requestBody.end.dateTime).toBe("2030-01-15T18:00:00.000Z");
    // No `attendees`: a service account on a personal calendar can't invite
    // without DWD, and including them fails the insert. The booker is captured
    // in the description instead.
    expect(arg.requestBody.attendees).toBeUndefined();
    expect(arg.requestBody.description).toContain("jane@example.com");

    expect(result.start).toBe("2030-01-15T17:00:00.000Z");
    expect(result.addToCalendarLink).toContain("action=TEMPLATE");
  });

  it("requests a scope set covering both the freebusy precheck and insert", async () => {
    // freebusy.query 403s under calendar.events alone, so the JWT must also
    // carry a read scope (or full calendar). Regression lock for that bug.
    await bookSlot({ ...VALID, now: BEFORE });
    const { scopes } = jwtCtor.mock.calls[0][0] as { scopes: string[] };
    expect(scopes).toContain("https://www.googleapis.com/auth/calendar.events");
    expect(
      scopes.some(
        (s) =>
          s === "https://www.googleapis.com/auth/calendar" ||
          s === "https://www.googleapis.com/auth/calendar.readonly",
      ),
    ).toBe(true);
  });

  it("rejects a slot in the past without touching the calendar", async () => {
    await expect(bookSlot({ ...VALID, now: AFTER })).rejects.toMatchObject({
      code: "past",
    });
    expect(freebusyQuery).not.toHaveBeenCalled();
    expect(eventsInsert).not.toHaveBeenCalled();
  });

  it("rejects a slot that freebusy reports as taken (409 class) without inserting", async () => {
    freebusyQuery.mockResolvedValue({
      data: {
        calendars: {
          "primary-cal": {
            busy: [{ start: "2030-01-15T17:30:00Z", end: "2030-01-15T18:30:00Z" }],
          },
        },
      },
    });
    const err = await bookSlot({ ...VALID, now: BEFORE }).catch((e) => e);
    expect(err).toBeInstanceOf(BookingError);
    expect(err.code).toBe("taken");
    expect(eventsInsert).not.toHaveBeenCalled();
  });
});
