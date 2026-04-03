import { BookingCalendarClient } from "@/components/scheduling/booking-calendar-client";

export default function BookingCalendarPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] bg-white p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Booking Calendar
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          Schedule a lesson around court demand and player goals
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Choose from live availability, then reserve a session directly from the
          calendar. The booking flow posts to App Router API endpoints.
        </p>
      </div>

      <BookingCalendarClient />
    </section>
  );
}
