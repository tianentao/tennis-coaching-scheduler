import { AdminBookingsTable } from "@/components/admin-bookings-table";
import { AdminSlotForm } from "@/components/admin-slot-form";
import { requireAdmin } from "@/lib/auth";
import { getAllBookings } from "@/lib/bookings";
import type { AdminBookingRecord } from "@/types/app";

export default async function AdminPage() {
  await requireAdmin();
  const bookings = (await getAllBookings()) as AdminBookingRecord[];

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-court-200">
          Coach Admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Manage availability and bookings</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Coaches and admins can create new time slots here and review booking activity across all
          players.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <AdminSlotForm />
        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-court-200">
              Bookings
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">All session reservations</h2>
          </div>
          <AdminBookingsTable bookings={bookings} />
        </section>
      </div>
    </main>
  );
}
