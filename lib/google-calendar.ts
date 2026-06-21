import "server-only";
import { google } from "googleapis";
import type { DaySchedule } from "./availability";
import { DAY_META, WEEKLY_SLOTS } from "./availability";
import { buildWeek, getBusinessDays } from "./slot-time";

export async function getAvailability(
  now: Date = new Date(),
): Promise<DaySchedule[]> {
  const days = getBusinessDays(now);

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

    return buildWeek(now, WEEKLY_SLOTS, DAY_META, busyBlocks);
  } catch (err) {
    console.error(
      "[availability] calendar fetch failed; serving static fallback",
      err,
    );
    return buildWeek(now, WEEKLY_SLOTS, DAY_META, null);
  }
}
