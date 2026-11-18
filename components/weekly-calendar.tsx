import { eachDayOfInterval, endOfWeek, isSameDay, startOfWeek } from "date-fns";
import { BookingButton } from "@/components/booking-button";
import { formatInAppZone, inAppZone, nowInAppZone } from "@/lib/time";
import type { AvailableSlot } from "@/types/app";

type WeeklyCalendarProps = {
  slots: AvailableSlot[];
  weekStart?: Date;
};

export function WeeklyCalendar({ slots, weekStart = nowInAppZone() }: WeeklyCalendarProps) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1, in: inAppZone });
  const end = endOfWeek(weekStart, { weekStartsOn: 1, in: inAppZone });
  const days = eachDayOfInterval({ start, end }, { in: inAppZone });

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-soft">
      <div className="grid gap-px bg-white/10 md:grid-cols-7">
        {days.map((day) => {
          const daySlots = slots.filter((slot) => isSameDay(slot.starts_at, day, { in: inAppZone }));

          return (
            <div key={day.toISOString()} className="min-h-[320px] bg-slate-950 p-4">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-court-200">
                  {formatInAppZone(day, "EEE")}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">{formatInAppZone(day, "d")}</h3>
              </div>

              <div className="space-y-3">
                {daySlots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                    No open coaching sessions.
                  </div>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-court-900 to-slate-900 p-4"
                    >
                      <p className="text-sm font-semibold text-white">
                        {formatInAppZone(slot.starts_at, "h:mm a")} to{" "}
                        {formatInAppZone(slot.ends_at, "h:mm a")}
                      </p>
                      <p className="mt-2 text-sm text-court-100">{slot.location}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-court-300">
                        {slot.court_name ?? "Main Court"} · {slot.skill_level.replace("_", " ")}
                      </p>
                      <p className="mt-3 text-xs text-slate-300">
                        Coach: {slot.coach_name ?? "Assigned coach"}
                      </p>
                      <div className="mt-4">
                        <BookingButton slotId={slot.id} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
