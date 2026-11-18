import { BookingList } from "@/components/booking-list";
import { getMyBookings } from "@/lib/bookings";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();
  const bookings = await getMyBookings();

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-court-200">
          My Bookings
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Manage upcoming sessions</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Users can review their active and cancelled sessions here, while RLS ensures they only
          see their own data.
        </p>
      </section>

      <BookingList bookings={bookings} />
    </main>
  );
}
