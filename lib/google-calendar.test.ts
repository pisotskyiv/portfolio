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

import {
  bookSlot,
  BookingError,
  getAvailability,
  loadServiceAccountKey,
} from "./google-calendar";

const VALID = {
  name: "Jane Recruiter",
  email: "jane@example.com",
  // Tue, within the 4-week window of BEFORE; winter -> PST -> 12:00 PT == 20:00Z.
  // Must be a real offered slot (Mon-Fri, 12/13/14 PT) or bookSlot rejects it.
  date: "2030-01-15",
  time: "12:00",
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

describe("loadServiceAccountKey", () => {
  const PEM =
    "-----BEGIN PRIVATE KEY-----\nMIIBVgIBADANBg==\n-----END PRIVATE KEY-----\n";

  it("converts literal \\n and strips wrapping double quotes (the prod 503)", () => {
    // Mirrors a value pasted into Vercel straight from a .env line: surrounding
    // quotes kept + newlines as literal \n. Both must be normalised or OpenSSL
    // throws ERR_OSSL_UNSUPPORTED.
    vi.stubEnv("GOOGLE_PRIVATE_KEY_B64", "");
    vi.stubEnv(
      "GOOGLE_PRIVATE_KEY",
      '"-----BEGIN PRIVATE KEY-----\\nMIIBVgIBADANBg==\\n-----END PRIVATE KEY-----\\n"',
    );
    const key = loadServiceAccountKey();
    expect(key).toBe(PEM);
    expect(key).not.toContain('"');
    expect(key).not.toContain("\\n");
  });

  it("prefers GOOGLE_PRIVATE_KEY_B64 when set", () => {
    vi.stubEnv("GOOGLE_PRIVATE_KEY_B64", Buffer.from(PEM).toString("base64"));
    vi.stubEnv("GOOGLE_PRIVATE_KEY", "ignored-raw-value");
    expect(loadServiceAccountKey()).toBe(PEM);
  });
});

describe("bookSlot", () => {
  it("inserts the event and returns an add-to-calendar link on a free slot", async () => {
    const result = await bookSlot({ ...VALID, now: BEFORE });

    expect(eventsInsert).toHaveBeenCalledOnce();
    const arg = eventsInsert.mock.calls[0][0];
    expect(arg.calendarId).toBe("primary-cal");
    expect(arg.requestBody.start.dateTime).toBe("2030-01-15T20:00:00.000Z");
    expect(arg.requestBody.end.dateTime).toBe("2030-01-15T21:00:00.000Z");
    // No `attendees`: a service account on a personal calendar can't invite
    // without DWD, and including them fails the insert. The booker is captured
    // in the description instead.
    expect(arg.requestBody.attendees).toBeUndefined();
    expect(arg.requestBody.description).toContain("jane@example.com");

    expect(result.start).toBe("2030-01-15T20:00:00.000Z");
    expect(result.addToCalendarLink).toContain("action=TEMPLATE");
  });

  it("omits the Meet link when MEET_URL is unset", async () => {
    const result = await bookSlot({ ...VALID, now: BEFORE });
    const arg = eventsInsert.mock.calls[0][0];
    expect(arg.requestBody.location).toBeUndefined();
    expect(result.meetUrl).toBeUndefined();
    expect(new URL(result.addToCalendarLink).searchParams.has("location")).toBe(false);
  });

  it("injects MEET_URL onto the event location, description, and self-add link", async () => {
    const meet = "https://meet.google.com/abc-defg-hij";
    vi.stubEnv("MEET_URL", meet);
    const result = await bookSlot({ ...VALID, now: BEFORE });
    const arg = eventsInsert.mock.calls[0][0];
    expect(arg.requestBody.location).toBe(meet);
    expect(arg.requestBody.description).toContain(meet);
    expect(result.meetUrl).toBe(meet);
    expect(new URL(result.addToCalendarLink).searchParams.get("location")).toBe(meet);
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

  it("rejects an out-of-window or off-grid slot ('unavailable') without touching the calendar", async () => {
    // Beyond the 4-week window (the availability UI never offers this far out),
    // and an off-grid time on a real day — both must be refused on the write
    // path, not just hidden on the read path.
    const outOfWindow = bookSlot({ ...VALID, date: "2030-06-17", now: BEFORE });
    await expect(outOfWindow).rejects.toMatchObject({ code: "unavailable" });

    const offGrid = bookSlot({ ...VALID, time: "09:00", now: BEFORE });
    await expect(offGrid).rejects.toMatchObject({ code: "unavailable" });

    expect(freebusyQuery).not.toHaveBeenCalled();
    expect(eventsInsert).not.toHaveBeenCalled();
  });

  it("rejects a slot that freebusy reports as taken (409 class) without inserting", async () => {
    freebusyQuery.mockResolvedValue({
      data: {
        calendars: {
          "primary-cal": {
            busy: [{ start: "2030-01-15T20:30:00Z", end: "2030-01-15T21:30:00Z" }],
          },
        },
      },
    });
    const err = await bookSlot({ ...VALID, now: BEFORE }).catch((e) => e);
    expect(err).toBeInstanceOf(BookingError);
    expect(err.code).toBe("taken");
    expect(eventsInsert).not.toHaveBeenCalled();
  });

  it("warns (but still books) when the precheck freebusy reports a calendar error", async () => {
    // An unreadable calendar comes back with `errors` and no `busy`, so it
    // looks free. We must not silently treat that as "available" — surface it.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    freebusyQuery.mockResolvedValue({
      data: {
        calendars: {
          "primary-cal": { errors: [{ domain: "global", reason: "notFound" }] },
        },
      },
    });
    await bookSlot({ ...VALID, now: BEFORE });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("primary-cal"),
      expect.anything(),
    );
    expect(eventsInsert).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("getAvailability free/busy warnings", () => {
  it("warns when a calendar is unreadable and keeps serving the merge", async () => {
    // The exact production symptom: work calendar not shared with the service
    // account -> notFound error, its busy times silently dropped.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("GOOGLE_CALENDAR_ID_WORK", "work-cal");
    freebusyQuery.mockResolvedValue({
      data: {
        calendars: {
          "primary-cal": { busy: [] },
          "work-cal": { errors: [{ domain: "global", reason: "notFound" }] },
        },
      },
    });
    await getAvailability(new Date("2030-01-13T12:00:00Z"));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("work-cal"),
      expect.anything(),
    );
    warn.mockRestore();
  });

  it("does not warn when every calendar is readable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("GOOGLE_CALENDAR_ID_WORK", "work-cal");
    freebusyQuery.mockResolvedValue({
      data: {
        calendars: {
          "primary-cal": { busy: [] },
          "work-cal": { busy: [] },
        },
      },
    });
    await getAvailability(new Date("2030-01-13T12:00:00Z"));
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
