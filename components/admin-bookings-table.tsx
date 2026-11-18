import { formatInAppZone } from "@/lib/time";
import type { AdminBookingRecord } from "@/types/app";

export function AdminBookingsTable({ bookings }: { bookings: AdminBookingRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-soft">
      <table className="min-w-full divide-y divide-white/10 text-left">
        <thead className="bg-white/5">
          <tr className="text-xs uppercase tracking-[0.2em] text-court-200">
            <th className="px-5 py-4">Player</th>
            <th className="px-5 py-4">Slot</th>
            <th className="px-5 py-4">Location</th>
            <th className="px-5 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-sm text-slate-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-5 py-4">{booking.profiles?.display_name ?? booking.user_id}</td>
              <td className="px-5 py-4">
                {booking.time_slots
                  ? formatInAppZone(booking.time_slots.starts_at, "MMM d, yyyy h:mm a")
                  : "Removed slot"}
              </td>
              <td className="px-5 py-4">{booking.time_slots?.location ?? "N/A"}</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
