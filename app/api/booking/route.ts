import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JsonResponse } from "@/types/app";

const bookingIdSchema = z.uuid();

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<JsonResponse<never>>(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");
    const parsed = bookingIdSchema.safeParse(bookingId);

    if (!parsed.success) {
      return NextResponse.json<JsonResponse<never>>(
        { error: "A valid booking id is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("cancel_booking", {
      target_booking_id: parsed.data
    });

    if (error) {
      return NextResponse.json<JsonResponse<never>>({ error: error.message }, { status: 400 });
    }

    return NextResponse.json<JsonResponse<typeof data>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to cancel booking.";

    return NextResponse.json<JsonResponse<never>>({ error: message }, { status: 500 });
  }
}
