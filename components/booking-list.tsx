import { CancelBookingButton } from "@/components/cancel-booking-button";
import { formatInAppZone } from "@/lib/time";
import type { BookingRecord } from "@/types/app";

export function BookingList({ bookings }: { bookings: BookingRecord[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 text-slate-300 shadow-soft">
        No bookings yet. Head to the calendar to reserve a coaching session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const slot = booking.time_slots;

        return (
          <article
            key={booking.id}
            className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-soft"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-court-200">
                  {booking.status}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {slot ? formatInAppZone(slot.starts_at, "EEEE, MMM d · h:mm a") : "Slot removed"}
                </h3>
                {slot ? (
                  <p className="mt-2 text-sm text-slate-300">
                    {slot.location}
                    {slot.court_name ? ` · ${slot.court_name}` : ""}
                  </p>
                ) : null}
              </div>

              {booking.status === "booked" ? <CancelBookingButton bookingId={booking.id} /> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
