import { Badge } from "@/components/ui/badge";
import { Booking } from "@/lib/types";

type BookingListProps = {
  bookings: Booking[];
};

export function BookingList({ bookings }: BookingListProps) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            My Schedule
          </p>
          <h3 className="mt-2 text-2xl font-semibold">Upcoming bookings</h3>
        </div>
        <Badge label={`${bookings.length} sessions`} tone="muted" />
      </div>

      <div className="mt-6 space-y-4">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                  {booking.date} · {booking.time}
                </p>
                <h4 className="mt-2 text-lg font-semibold">{booking.sessionType}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {booking.court} · {booking.notes}
                </p>
              </div>
              <Badge
                label={booking.status}
                tone={booking.status === "Pending" ? "warning" : "primary"}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
