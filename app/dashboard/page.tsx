import { CalendarDayCard } from "@/components/scheduling/calendar-day-card";
import { BookingList } from "@/components/scheduling/booking-list";
import { SessionCard } from "@/components/scheduling/session-card";
import { getAvailability, getBookings } from "@/lib/data";

export default async function DashboardPage() {
  const availability = await getAvailability();
  const bookings = await getBookings();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-panel">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Weekly snapshot
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            Smooth out the week before prime-time sessions fill up
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Open slots</p>
              <p className="mt-2 text-3xl font-semibold">14</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Booked today</p>
              <p className="mt-2 text-3xl font-semibold">7</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Player retention</p>
              <p className="mt-2 text-3xl font-semibold">91%</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {availability.slice(0, 3).map((slot) => (
            <CalendarDayCard key={slot.id} slot={slot} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
              Priority slots
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Recommended to fill next</h3>
          </div>
          <div className="grid gap-5">
            {availability.slice(0, 2).map((slot) => (
              <SessionCard key={slot.id} slot={slot} />
            ))}
          </div>
        </div>

        <BookingList bookings={bookings} />
      </section>
    </div>
  );
}
