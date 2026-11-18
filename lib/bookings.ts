import { formatISO } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AvailableSlot, BookingRecord } from "@/types/app";

export async function getAvailableSlots(params?: { startsAt?: Date; endsAt?: Date }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("available_time_slots")
    .select("*")
    .order("starts_at", { ascending: true });

  if (params?.startsAt) {
    query = query.gte("starts_at", formatISO(params.startsAt));
  }

  if (params?.endsAt) {
    query = query.lte("starts_at", formatISO(params.endsAt));
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as AvailableSlot[];
}

export async function getMyBookings() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        status,
        notes,
        created_at,
        cancelled_at,
        time_slots (
          id,
          starts_at,
          ends_at,
          location,
          court_name,
          skill_level,
          is_active
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as BookingRecord[];
}

export async function getAllBookings() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        status,
        notes,
        created_at,
        cancelled_at,
        user_id,
        profiles (
          display_name
        ),
        time_slots (
          id,
          starts_at,
          ends_at,
          location,
          court_name,
          skill_level,
          is_active
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
