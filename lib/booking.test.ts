import { describe, it, expect } from "vitest";
import {
  bookInput,
  slotWindow,
  googleCalendarLink,
  trackedCalLink,
  formatSlotLabel,
  isOfferedSlot,
  MAX_WEEK_OFFSET,
} from "./booking";

describe("bookInput", () => {
  it("accepts a well-formed date and time", () => {
    const result = bookInput.safeParse({ date: "2030-01-15", time: "09:00" });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(bookInput.safeParse({ date: "01/15/2030", time: "09:00" }).success).toBe(false);
    expect(bookInput.safeParse({ date: "2030-1-5", time: "09:00" }).success).toBe(false);
  });

  it("rejects a malformed time", () => {
    expect(bookInput.safeParse({ date: "2030-01-15", time: "9am" }).success).toBe(false);
    expect(bookInput.safeParse({ date: "2030-01-15", time: "25:00" }).success).toBe(true); // shape only; range guarded elsewhere
  });

  it("rejects extra or missing fields gracefully", () => {
    expect(bookInput.safeParse({ time: "09:00" }).success).toBe(false);
    expect(bookInput.safeParse({}).success).toBe(false);
  });
});

describe("slotWindow", () => {
  it("returns a one-hour window starting at the slot instant", () => {
    const { start, end } = slotWindow("2030-01-15", "09:00");
    expect(end.getTime() - start.getTime()).toBe(60 * 60 * 1000);
    // 2030-01-15 is winter -> PST (UTC-8) -> 09:00 PT == 17:00Z
    expect(start.toISOString()).toBe("2030-01-15T17:00:00.000Z");
  });
});

describe("googleCalendarLink", () => {
  it("builds a Google Calendar TEMPLATE url with basic-format UTC dates", () => {
    const start = new Date("2030-01-15T17:00:00.000Z");
    const end = new Date("2030-01-15T18:00:00.000Z");
    const url = googleCalendarLink({
      title: "Intro call — Jane",
      details: "Booked by Jane (jane@x.com).",
      start,
      end,
    });
    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("dates")).toBe("20300115T170000Z/20300115T180000Z");
    expect(params.get("text")).toBe("Intro call — Jane");
    expect(params.get("details")).toBe("Booked by Jane (jane@x.com).");
  });

  it("omits the location param when no location is given", () => {
    const url = googleCalendarLink({
      title: "x",
      details: "y",
      start: new Date("2030-01-15T17:00:00.000Z"),
      end: new Date("2030-01-15T18:00:00.000Z"),
    });
    expect(new URL(url).searchParams.has("location")).toBe(false);
  });

  it("carries a location (e.g. the Meet URL) when given", () => {
    const meet = "https://meet.google.com/abc-defg-hij";
    const url = googleCalendarLink({
      title: "x",
      details: "y",
      start: new Date("2030-01-15T17:00:00.000Z"),
      end: new Date("2030-01-15T18:00:00.000Z"),
      location: meet,
    });
    expect(new URL(url).searchParams.get("location")).toBe(meet);
  });
});

describe("trackedCalLink", () => {
  it("wraps a calendar link in the cal-redirect tracker, url-encoded", () => {
    const raw = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Hi";
    const tracked = trackedCalLink(raw);
    expect(tracked.startsWith("/api/cal-redirect?to=")).toBe(true);
    // `to` round-trips back to the original link
    const to = new URLSearchParams(tracked.split("?")[1]).get("to");
    expect(to).toBe(raw);
  });
});

describe("isOfferedSlot", () => {
  // 2026-06-24 is a Wednesday; 10:00Z == 03:00 PDT, so the day's afternoon
  // slots are all still in the future. Window math: offset 0 snaps to Mon
  // 2026-06-22; offset MAX (4) reaches Mon 2026-07-20 .. Fri 2026-07-24.
  const now = new Date("2026-06-24T10:00:00Z");

  it("accepts a future Mon-Fri afternoon slot in the current week", () => {
    expect(isOfferedSlot("2026-06-25", "12:00", now)).toBe(true); // Thu 12pm
    expect(isOfferedSlot("2026-06-26", "14:00", now)).toBe(true); // Fri 2pm
  });

  it("accepts a slot at the far edge of the booking window", () => {
    expect(isOfferedSlot("2026-07-20", "13:00", now)).toBe(true); // offset 4 Mon
    expect(isOfferedSlot("2026-07-24", "14:00", now)).toBe(true); // offset 4 Fri
  });

  it("rejects a slot beyond the MAX_WEEK_OFFSET window", () => {
    // Mon of week 5 ahead — one week past the last offered week.
    expect(isOfferedSlot("2026-07-27", "12:00", now)).toBe(false);
    expect(isOfferedSlot("2027-03-15", "12:00", now)).toBe(false);
  });

  it("rejects an off-grid time on an otherwise valid day", () => {
    expect(isOfferedSlot("2026-06-25", "09:00", now)).toBe(false); // 9am, not a slot
    expect(isOfferedSlot("2026-06-25", "03:00", now)).toBe(false); // 3am
    expect(isOfferedSlot("2026-06-25", "15:00", now)).toBe(false); // 3pm, past the grid
  });

  it("rejects weekend days", () => {
    expect(isOfferedSlot("2026-06-27", "12:00", now)).toBe(false); // Sat
    expect(isOfferedSlot("2026-06-28", "12:00", now)).toBe(false); // Sun
  });

  it("rejects a past slot even on a grid day/time", () => {
    expect(isOfferedSlot("2026-06-22", "12:00", now)).toBe(false); // Mon, already gone
    expect(isOfferedSlot("2026-06-23", "14:00", now)).toBe(false); // Tue, already gone
  });

  it("exposes the window bound as a constant", () => {
    expect(MAX_WEEK_OFFSET).toBe(4);
  });
});

describe("formatSlotLabel", () => {
  it("renders a Pacific-time label for the slot", () => {
    // 2026-06-24 is a Wednesday; 12:00 PT.
    const label = formatSlotLabel("2026-06-24", "12:00");
    expect(label).toMatch(/Wed/);
    expect(label).toMatch(/Jun 24/);
    expect(label).toMatch(/12/);
    expect(label).toMatch(/PT$/);
  });
});
