import { TZDate, tz } from "@date-fns/tz";
import { format } from "date-fns";

// All sessions happen at one club, so every date is computed and shown in the club's
// time zone, not the server's (UTC on Vercel) or the visitor's browser zone.
// lib/demo/seed.ts (and scripts/seed-demo.ts) import this file directly under Node.
export const APP_TIME_ZONE = "America/Los_Angeles";
export const APP_TIME_ZONE_LABEL = "Pacific Time";

// Pass as `{ in: inAppZone }` to date-fns v4 functions (startOfWeek, isSameDay, ...).
export const inAppZone = tz(APP_TIME_ZONE);

export function nowInAppZone() {
  return TZDate.tz(APP_TIME_ZONE);
}

export function formatInAppZone(date: Date | string, pattern: string) {
  return format(new Date(date), pattern, { in: inAppZone });
}

// Reads an <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") as wall-clock
// time in APP_TIME_ZONE. `new Date(value)` would use the browser's zone instead.
export function parseAppZoneDateTimeLocal(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    throw new Error(`Invalid date-time value: ${value}`);
  }
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return new TZDate(year, month - 1, day, hour, minute, APP_TIME_ZONE);
}
