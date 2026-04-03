import { NextRequest, NextResponse } from "next/server";
import {
  BookingConflictError,
  UserNotFoundError,
  createBooking,
  getBookings
} from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getBookings());
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { slotId?: string; userId?: number };

  if (!body.slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 });
  }

  if (!body.userId || !Number.isInteger(body.userId) || body.userId <= 0) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const booking = await createBooking(body.slotId, body.userId);

    if (!booking) {
      return NextResponse.json(
        { error: "Slot not available for booking" },
        { status: 409 }
      );
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    throw error;
  }
}
