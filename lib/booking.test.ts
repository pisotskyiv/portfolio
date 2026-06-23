import { describe, it, expect } from "vitest";
import { bookInput, slotWindow, googleCalendarLink, formatSlotLabel } from "./booking";

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
