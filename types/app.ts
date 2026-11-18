export type JsonResponse<T> = {
  data?: T;
  error?: string;
};

export type SlotSkillLevel = "beginner" | "intermediate" | "advanced" | "all_levels";
export type BookingStatus = "booked" | "cancelled";
export type AppRole = "player" | "coach" | "admin";

export type AvailableSlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  location: string;
  court_name: string | null;
  skill_level: SlotSkillLevel;
  coach_id: string;
  coach_name: string | null;
};

export type BookingRecord = {
  id: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  cancelled_at: string | null;
  time_slots: {
    id: string;
    starts_at: string;
    ends_at: string;
    location: string;
    court_name: string | null;
    skill_level: SlotSkillLevel;
    is_active: boolean;
  } | null;
};

export type AdminBookingRecord = {
  id: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  cancelled_at: string | null;
  user_id: string;
  profiles: {
    display_name: string | null;
  } | null;
  time_slots: {
    id: string;
    starts_at: string;
    ends_at: string;
    location: string;
    court_name: string | null;
    skill_level: SlotSkillLevel;
    is_active: boolean;
  } | null;
};
