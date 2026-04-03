import { BookingList } from "@/components/scheduling/booking-list";
import { getBookings } from "@/lib/data";

export default async function MyBookingsPage() {
  const bookings = await getBookings();

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-white p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          My Bookings
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          Track confirmed and pending coaching sessions
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          This view gives players a compact summary of upcoming lessons, notes,
          and current booking status.
        </p>
      </div>

      <BookingList bookings={bookings} />
    </section>
  );
}
