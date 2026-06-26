export type TimeSlot = {
  time: string;
  label: string;
};

export type DaySchedule = {
  day: string;
  short: string;
  /** ISO yyyy-mm-dd. Populated by getAvailability; omitted on the static template. */
  date?: string;
  slots: TimeSlot[];
};

export const timezone = "PT";

export const DAY_META = [
  { day: "Sunday", short: "Sun" },
  { day: "Monday", short: "Mon" },
  { day: "Tuesday", short: "Tue" },
  { day: "Wednesday", short: "Wed" },
  { day: "Thursday", short: "Thu" },
  { day: "Friday", short: "Fri" },
  { day: "Saturday", short: "Sat" },
] as const;

// General availability: 12-3pm PT, three one-hour slots. The live freebusy pass
// in buildWeek drops any of these that collide with a real calendar event.
const AFTERNOON: TimeSlot[] = [
  { time: "12:00", label: "12pm" },
  { time: "13:00", label: "1pm" },
  { time: "14:00", label: "2pm" },
];

// Single source of truth for candidate slots, keyed by day-of-week (0=Sun..6=Sat).
export const WEEKLY_SLOTS: Record<number, TimeSlot[]> = {
  1: AFTERNOON,
  2: AFTERNOON,
  3: AFTERNOON,
  4: AFTERNOON,
  5: AFTERNOON,
};

// Dateless Mon-Fri view derived from WEEKLY_SLOTS — used as a fixture/sample.
export const availability: DaySchedule[] = [1, 2, 3, 4, 5].map((dow) => ({
  day: DAY_META[dow].day,
  short: DAY_META[dow].short,
  slots: WEEKLY_SLOTS[dow] ?? [],
}));
