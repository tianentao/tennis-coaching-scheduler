"use client";

import { useEffect, useState } from "react";
import { createBooking, fetchAvailability } from "@/api/client";
import { SessionCard } from "@/components/scheduling/session-card";
import { AvailabilitySlot } from "@/lib/types";

export function BookingCalendarClient() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function loadAvailability() {
      try {
        const nextSlots = await fetchAvailability();
        setSlots(nextSlots);
      } catch (error) {
        console.error(error);
        setMessage("Could not load availability.");
      }
    }

    void loadAvailability();
  }, []);

  async function handleBook(slotId: string) {
    setBookingSlotId(slotId);
    setMessage("");

    try {
      await createBooking(slotId);
      const refreshedSlots = await fetchAvailability();
      setSlots(refreshedSlots);
      setMessage("Session booked successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Booking failed. Try another slot.");
    } finally {
      setBookingSlotId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-[28px] bg-white/80 p-5 shadow-panel">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Live availability
          </p>
          <h3 className="mt-2 text-2xl font-semibold">Reserve the next session</h3>
        </div>
        {message ? <p className="text-sm font-medium text-court-700">{message}</p> : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {slots.map((slot) => (
          <SessionCard
            key={slot.id}
            slot={slot}
            onBook={handleBook}
            isBooking={bookingSlotId === slot.id}
          />
        ))}
      </div>
    </div>
  );
}
