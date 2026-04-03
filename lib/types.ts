export type SessionType = "Private Lesson" | "Group Clinic" | "Match Review";

export type SessionStatus = "Confirmed" | "Pending" | "Waitlist";

export type AvailabilitySlot = {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  court: string;
  spotsLeft: number;
  sessionType: SessionType;
  focus: string;
};

export type Booking = {
  id: string;
  playerName: string;
  sessionType: SessionType;
  date: string;
  time: string;
  court: string;
  status: SessionStatus;
  notes: string;
};
