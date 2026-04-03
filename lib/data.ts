import { db } from "@/lib/db";
import { AvailabilitySlot, Booking } from "@/lib/types";

export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingConflictError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

const availability: AvailabilitySlot[] = [
  {
    id: "slot-1",
    date: "2026-04-03",
    dayLabel: "Fri",
    time: "7:00 AM",
    court: "Court 1",
    spotsLeft: 1,
    sessionType: "Private Lesson",
    focus: "Serve mechanics"
  },
  {
    id: "slot-2",
    date: "2026-04-03",
    dayLabel: "Fri",
    time: "5:30 PM",
    court: "Court 2",
    spotsLeft: 4,
    sessionType: "Group Clinic",
    focus: "Baseline consistency"
  },
  {
    id: "slot-3",
    date: "2026-04-04",
    dayLabel: "Sat",
    time: "9:00 AM",
    court: "Court 3",
    spotsLeft: 2,
    sessionType: "Match Review",
    focus: "Pattern construction"
  },
  {
    id: "slot-4",
    date: "2026-04-05",
    dayLabel: "Sun",
    time: "11:00 AM",
    court: "Court 1",
    spotsLeft: 1,
    sessionType: "Private Lesson",
    focus: "Net play reactions"
  },
  {
    id: "slot-5",
    date: "2026-04-06",
    dayLabel: "Mon",
    time: "6:00 PM",
    court: "Court 4",
    spotsLeft: 6,
    sessionType: "Group Clinic",
    focus: "Footwork and recovery"
  }
];

const bookings: Booking[] = [
  {
    id: "booking-1",
    playerName: "Tim Roberts",
    sessionType: "Private Lesson",
    date: "2026-04-03",
    time: "7:00 AM",
    court: "Court 1",
    status: "Confirmed",
    notes: "Focus on first-serve percentage"
  },
  {
    id: "booking-2",
    playerName: "Tim Roberts",
    sessionType: "Group Clinic",
    date: "2026-04-06",
    time: "6:00 PM",
    court: "Court 4",
    status: "Pending",
    notes: "Bring match footage for review"
  }
];

export async function getAvailability(): Promise<AvailabilitySlot[]> {
  const result = await db.query<{
    id: number;
    time_slot: string;
    coach_id: number;
  }>(
    `
      SELECT id, time_slot, coach_id
      FROM sessions
      ORDER BY time_slot ASC
    `
  );

  return result.rows.map((row) => {
    const timeSlot = new Date(row.time_slot);

    return {
      id: `slot-${row.id}`,
      date: timeSlot.toISOString().slice(0, 10),
      dayLabel: timeSlot.toLocaleDateString("en-US", { weekday: "short" }),
      time: timeSlot.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }),
      court: `Coach ${row.coach_id}`,
      spotsLeft: 1,
      sessionType: "Private Lesson",
      focus: "General coaching session"
    };
  });
}

export async function getBookings(): Promise<Booking[]> {
  const result = await db.query<{
    booking_id: number;
    user_email: string;
    time_slot: string;
    coach_id: number;
  }>(
    `
      SELECT
        bookings.id AS booking_id,
        users.email AS user_email,
        sessions.time_slot,
        sessions.coach_id
      FROM bookings
      INNER JOIN users ON users.id = bookings.user_id
      INNER JOIN sessions ON sessions.id = bookings.session_id
      ORDER BY sessions.time_slot ASC
    `
  );

  return result.rows.map((row) => {
    const timeSlot = new Date(row.time_slot);

    return {
      id: `booking-${row.booking_id}`,
      playerName: row.user_email,
      sessionType: "Private Lesson",
      date: timeSlot.toISOString().slice(0, 10),
      time: timeSlot.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }),
      court: `Coach ${row.coach_id}`,
      status: "Confirmed",
      notes: "Booked from PostgreSQL"
    };
  });
}

export async function createBooking(
  slotId: string,
  userId: number
): Promise<Booking | null> {
  const sessionId = Number(slotId.replace(/^slot-/, ""));

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return null;
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  const client = await db.connect();
  let transactionOpen = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const sessionResult = await client.query<{
      id: number;
      time_slot: string;
      coach_id: number;
    }>(
      `
        SELECT id, time_slot, coach_id
        FROM sessions
        WHERE id = $1
        FOR UPDATE
      `,
      [sessionId]
    );

    const session = sessionResult.rows[0];

    if (!session) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return null;
    }

    const existingBookingResult = await client.query<{ id: number }>(
      `
        SELECT id
        FROM bookings
        WHERE session_id = $1
      `,
      [sessionId]
    );

    if (existingBookingResult.rowCount && existingBookingResult.rowCount > 0) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      throw new BookingConflictError("Session is already booked");
    }

    const userResult = await client.query<{
      id: number;
      email: string;
    }>(
      `
        SELECT id, email
        FROM users
        WHERE id = $1
      `
      ,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      throw new UserNotFoundError("User not found");
    }

    const insertResult = await client.query<{ id: number }>(
      `
        INSERT INTO bookings (user_id, session_id)
        VALUES ($1, $2)
        RETURNING id
      `,
      [userId, sessionId]
    );

    await client.query("COMMIT");
    transactionOpen = false;

    const timeSlot = new Date(session.time_slot);

    return {
      id: `booking-${insertResult.rows[0].id}`,
      playerName: user.email,
      sessionType: "Private Lesson",
      date: timeSlot.toISOString().slice(0, 10),
      time: timeSlot.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }),
      court: `Coach ${session.coach_id}`,
      status: "Confirmed",
      notes: "Booked from PostgreSQL"
    };
  } catch (error) {
    if (transactionOpen) {
      await client.query("ROLLBACK");
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new BookingConflictError("Session is already booked");
    }

    throw error;
  } finally {
    client.release();
  }
}
