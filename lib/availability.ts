export type TimeSlot = {
  time: string;
  label: string;
};

export type DaySchedule = {
  day: string;
  short: string;
  slots: TimeSlot[];
};

export const availability: DaySchedule[] = [
  {
    day: "Monday",
    short: "Mon",
    slots: [
      { time: "09:00", label: "9am" },
      { time: "10:00", label: "10am" },
      { time: "14:00", label: "2pm" },
    ],
  },
  {
    day: "Tuesday",
    short: "Tue",
    slots: [],
  },
  {
    day: "Wednesday",
    short: "Wed",
    slots: [
      { time: "09:00", label: "9am" },
      { time: "10:00", label: "10am" },
      { time: "11:00", label: "11am" },
      { time: "14:00", label: "2pm" },
    ],
  },
  {
    day: "Thursday",
    short: "Thu",
    slots: [
      { time: "09:00", label: "9am" },
      { time: "10:00", label: "10am" },
      { time: "14:00", label: "2pm" },
      { time: "15:00", label: "3pm" },
    ],
  },
  {
    day: "Friday",
    short: "Fri",
    slots: [],
  },
];

export const timezone = "PST";
export const bookingEmail = "vlad.pisotski@gmail.com";
