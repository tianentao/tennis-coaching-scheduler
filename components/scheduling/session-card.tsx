import { Badge } from "@/components/ui/badge";
import { AvailabilitySlot } from "@/lib/types";

type SessionCardProps = {
  slot: AvailabilitySlot;
  onBook?: (slotId: string) => void;
  isBooking?: boolean;
};

export function SessionCard({ slot, onBook, isBooking }: SessionCardProps) {
  return (
    <article className="rounded-[28px] border border-court-100 bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            {slot.dayLabel} · {slot.date}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{slot.sessionType}</h3>
          <p className="mt-2 text-sm text-slate-600">{slot.focus}</p>
        </div>
        <Badge
          label={`${slot.spotsLeft} spot${slot.spotsLeft === 1 ? "" : "s"} left`}
          tone={slot.spotsLeft <= 1 ? "warning" : "primary"}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Time
          </p>
          <p className="mt-1 font-medium text-ink">{slot.time}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Court
          </p>
          <p className="mt-1 font-medium text-ink">{slot.court}</p>
        </div>
      </div>

      {onBook ? (
        <button
          type="button"
          onClick={() => onBook(slot.id)}
          disabled={slot.spotsLeft === 0 || isBooking}
          className="mt-6 w-full rounded-2xl bg-court-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-court-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isBooking ? "Booking..." : "Book Session"}
        </button>
      ) : null}
    </article>
  );
}
