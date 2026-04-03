import { AvailabilitySlot, Booking } from "@/lib/types";

export async function fetchAvailability(): Promise<AvailabilitySlot[]> {
  const response = await fetch("/api/availability", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load availability");
  }

  return response.json();
}

export async function fetchBookings(): Promise<Booking[]> {
  const response = await fetch("/api/bookings", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load bookings");
  }

  return response.json();
}

export async function createBooking(slotId: string): Promise<Booking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      slotId,
      userId: 1
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create booking");
  }

  return response.json();
}
