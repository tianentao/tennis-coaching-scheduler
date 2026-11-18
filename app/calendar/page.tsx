import Link from "next/link";
import { addWeeks, endOfWeek, isAfter, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WeeklyCalendar } from "@/components/weekly-calendar";
import { requireUser } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/bookings";
import { APP_TIME_ZONE_LABEL, formatInAppZone, inAppZone, nowInAppZone } from "@/lib/time";
import { cn } from "@/lib/utils";

const MAX_WEEKS_AHEAD = 12;

function parseWeekOffset(value: string | string[] | undefined) {
  const offset = Number.parseInt(Array.isArray(value) ? value[0] : (value ?? "0"), 10);
  if (Number.isNaN(offset)) {
    return 0;
  }
  return Math.min(Math.max(offset, 0), MAX_WEEKS_AHEAD);
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ week?: string | string[] }>;
}) {
  await requireUser();
  const weekOffset = parseWeekOffset((await searchParams).week);

  const now = nowInAppZone();
  const weekStart = addWeeks(startOfWeek(now, { weekStartsOn: 1, in: inAppZone }), weekOffset);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1, in: inAppZone });
  const slots = await getAvailableSlots({
    // Don't offer sessions that have already started.
    startsAt: isAfter(now, weekStart) ? now : weekStart,
    endsAt: weekEnd
  });

  const weekLabel = `${formatInAppZone(weekStart, "MMM d")} – ${formatInAppZone(weekEnd, "MMM d, yyyy")}`;
  const navClass =
    "inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-sm transition";
  const enabledClass = "text-slate-200 hover:border-court-400 hover:text-white";
  const disabledClass = "pointer-events-none text-slate-600";

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-court-200">
            Available Sessions
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Weekly coaching calendar</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Open time slots exclude any active booking, so players only see sessions that are
            still available. All times are {APP_TIME_ZONE_LABEL}.
          </p>
        </div>

        <nav aria-label="Change week" className="flex flex-col items-start gap-3 md:items-end">
          <p className="text-lg font-semibold text-white">{weekLabel}</p>
          <div className="flex gap-2">
            <Link
              href={{ pathname: "/calendar", query: { week: weekOffset - 1 } }}
              aria-disabled={weekOffset === 0}
              tabIndex={weekOffset === 0 ? -1 : undefined}
              className={cn(navClass, weekOffset === 0 ? disabledClass : enabledClass)}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
            {weekOffset !== 0 ? (
              <Link href="/calendar" className={cn(navClass, enabledClass)}>
                This week
              </Link>
            ) : null}
            <Link
              href={{ pathname: "/calendar", query: { week: weekOffset + 1 } }}
              aria-disabled={weekOffset === MAX_WEEKS_AHEAD}
              tabIndex={weekOffset === MAX_WEEKS_AHEAD ? -1 : undefined}
              className={cn(navClass, weekOffset === MAX_WEEKS_AHEAD ? disabledClass : enabledClass)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </section>

      <WeeklyCalendar slots={slots} weekStart={weekStart} />
    </main>
  );
}
