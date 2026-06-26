import { describe, expect, it } from "vitest";
import {
  SLOT_MS,
  buildWeek,
  getBusinessDays,
  isBlocked,
  slotToUTC,
} from "./slot-time";

describe("slotToUTC", () => {
  it("converts a winter slot at PST (UTC-8)", () => {
    // January -> PST. 09:00 LA = 17:00 UTC.
    expect(slotToUTC("2026-01-12", "09:00").toISOString()).toBe(
      "2026-01-12T17:00:00.000Z",
    );
  });

  it("converts a summer slot at PDT (UTC-7)", () => {
    // July -> PDT. 09:00 LA = 16:00 UTC.
    expect(slotToUTC("2026-07-13", "09:00").toISOString()).toBe(
      "2026-07-13T16:00:00.000Z",
    );
  });

  it("converts an afternoon slot", () => {
    expect(slotToUTC("2026-01-12", "14:00").toISOString()).toBe(
      "2026-01-12T22:00:00.000Z",
    );
  });
});

describe("isBlocked", () => {
  const busy = [
    { start: "2026-01-12T17:00:00.000Z", end: "2026-01-12T18:00:00.000Z" },
  ];

  it("returns true when the slot overlaps a busy block", () => {
    const start = new Date("2026-01-12T17:00:00.000Z");
    const end = new Date(start.getTime() + SLOT_MS);
    expect(isBlocked(start, end, busy)).toBe(true);
  });

  it("returns false when the slot is clear", () => {
    const start = new Date("2026-01-12T19:00:00.000Z");
    const end = new Date(start.getTime() + SLOT_MS);
    expect(isBlocked(start, end, busy)).toBe(false);
  });

  it("treats an adjacent block as not blocking (busy end meets slot start)", () => {
    const start = new Date("2026-01-12T18:00:00.000Z");
    const end = new Date(start.getTime() + SLOT_MS);
    expect(isBlocked(start, end, busy)).toBe(false);
  });
});

describe("getBusinessDays", () => {
  it("returns the next 5 business days starting from a Monday", () => {
    const days = getBusinessDays(new Date("2026-06-15T12:00:00Z")); // a Monday
    expect(days.map((d) => d.dateStr)).toEqual([
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19",
    ]);
    expect(days.map((d) => d.dow)).toEqual([1, 2, 3, 4, 5]);
  });

  it("snaps to Mon-Fri of the current week when starting midweek", () => {
    const days = getBusinessDays(new Date("2026-06-18T12:00:00Z")); // a Thursday
    expect(days.map((d) => d.dateStr)).toEqual([
      "2026-06-15", // Mon
      "2026-06-16", // Tue
      "2026-06-17", // Wed
      "2026-06-18", // Thu
      "2026-06-19", // Fri
    ]);
  });

  it("starts on Monday when given a weekend day", () => {
    const days = getBusinessDays(new Date("2026-06-20T12:00:00Z")); // a Saturday
    expect(days[0].dateStr).toBe("2026-06-22"); // following Monday
  });

  it("rolls to next week's Mon-Fri when today is Friday (weekOffset=0)", () => {
    // The current week is spent by Friday — only same-day slots would remain,
    // so default to a clean next-week view instead of a near-empty column.
    const days = getBusinessDays(new Date("2026-06-26T12:00:00Z")); // a Friday
    expect(days.map((d) => d.dateStr)).toEqual([
      "2026-06-29", // Mon
      "2026-06-30",
      "2026-07-01",
      "2026-07-02",
      "2026-07-03", // Fri
    ]);
  });

  it("snaps to Mon-Fri of next calendar week when weekOffset=1 (from Thursday)", () => {
    const days = getBusinessDays(new Date("2026-06-18T12:00:00Z"), 5, 1); // Thursday
    expect(days.map((d) => d.dateStr)).toEqual([
      "2026-06-22", // Mon
      "2026-06-23", // Tue
      "2026-06-24", // Wed
      "2026-06-25", // Thu
      "2026-06-26", // Fri
    ]);
  });

  it("snaps to Mon-Fri two weeks ahead when weekOffset=2", () => {
    const days = getBusinessDays(new Date("2026-06-15T12:00:00Z"), 5, 2); // Monday
    expect(days.map((d) => d.dateStr)).toEqual([
      "2026-06-29",
      "2026-06-30",
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
    ]);
  });
});

describe("buildWeek", () => {
  const WEEKLY = {
    1: [{ time: "09:00", label: "9am" }],
    3: [{ time: "10:00", label: "10am" }],
  };
  const META = [
    { day: "Sunday", short: "Sun" },
    { day: "Monday", short: "Mon" },
    { day: "Tuesday", short: "Tue" },
    { day: "Wednesday", short: "Wed" },
    { day: "Thursday", short: "Thu" },
    { day: "Friday", short: "Fri" },
    { day: "Saturday", short: "Sat" },
  ];

  it("attaches dates and keeps future weekday slots", () => {
    // Monday 01:00 PDT — the 9am slot is still ahead.
    const week = buildWeek(new Date("2026-06-15T08:00:00Z"), WEEKLY, META, null);
    expect(week[0].date).toBe("2026-06-15");
    expect(week[0].day).toBe("Monday");
    expect(week[0].slots.map((s) => s.time)).toEqual(["09:00"]);
    expect(week[1].slots).toEqual([]); // Tuesday has no template slots
  });

  it("drops past slots", () => {
    // Monday noon PDT (19:00Z) — the 9am slot is already past.
    const week = buildWeek(new Date("2026-06-15T19:00:00Z"), WEEKLY, META, null);
    expect(week[0].slots).toEqual([]);
  });

  it("drops slots that overlap a busy block", () => {
    // Mon 9am PDT = 16:00Z; busy 16:00-17:00Z covers it.
    const busy = [
      { start: "2026-06-15T16:00:00.000Z", end: "2026-06-15T17:00:00.000Z" },
    ];
    const week = buildWeek(new Date("2026-06-15T08:00:00Z"), WEEKLY, META, busy);
    expect(week[0].slots).toEqual([]);
  });
});
