import { Badge } from "@/components/ui/badge";
import { AvailabilitySlot } from "@/lib/types";

type CalendarDayCardProps = {
  slot: AvailabilitySlot;
};

export function CalendarDayCard({ slot }: CalendarDayCardProps) {
  return (
    <article className="rounded-[28px] bg-court-900 p-5 text-white shadow-panel">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-court-200">
            {slot.dayLabel}
          </p>
          <h3 className="mt-2 text-3xl font-semibold">
            {new Date(slot.date).getDate()}
          </h3>
        </div>
        <Badge label={slot.sessionType} tone="muted" />
      </div>
      <p className="mt-6 text-lg font-medium">{slot.time}</p>
      <p className="mt-2 text-sm text-court-100">{slot.focus}</p>
      <p className="mt-6 text-sm text-court-200">
        {slot.court} · {slot.spotsLeft} spots remaining
      </p>
    </article>
  );
}
