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
export const bookingEmail = "vlad.pisotski@gmail.com";

export const DAY_META = [
  { day: "Sunday", short: "Sun" },
  { day: "Monday", short: "Mon" },
  { day: "Tuesday", short: "Tue" },
  { day: "Wednesday", short: "Wed" },
  { day: "Thursday", short: "Thu" },
  { day: "Friday", short: "Fri" },
  { day: "Saturday", short: "Sat" },
] as const;

// Single source of truth for candidate slots, keyed by day-of-week (0=Sun..6=Sat).
export const WEEKLY_SLOTS: Record<number, TimeSlot[]> = {
  1: [
    { time: "09:00", label: "9am" },
    { time: "10:00", label: "10am" },
    { time: "14:00", label: "2pm" },
  ],
  3: [
    { time: "09:00", label: "9am" },
    { time: "10:00", label: "10am" },
    { time: "11:00", label: "11am" },
    { time: "14:00", label: "2pm" },
  ],
  4: [
    { time: "09:00", label: "9am" },
    { time: "10:00", label: "10am" },
    { time: "14:00", label: "2pm" },
    { time: "15:00", label: "3pm" },
  ],
};

// Dateless Mon-Fri view derived from WEEKLY_SLOTS — used as a fixture/sample.
export const availability: DaySchedule[] = [1, 2, 3, 4, 5].map((dow) => ({
  day: DAY_META[dow].day,
  short: DAY_META[dow].short,
  slots: WEEKLY_SLOTS[dow] ?? [],
}));
