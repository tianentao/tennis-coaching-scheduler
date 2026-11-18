import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JsonResponse } from "@/types/app";

const bookSchema = z.object({
  slotId: z.uuid(),
  notes: z.string().max(500).optional()
});

export async function POST(request: Request) {
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

    const json = await request.json();
    const parsed = bookSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json<JsonResponse<never>>(
        { error: "Invalid booking payload." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("book_time_slot", {
      target_slot_id: parsed.data.slotId,
      booking_notes: parsed.data.notes ?? undefined
    });

    if (error) {
      return NextResponse.json<JsonResponse<never>>({ error: error.message }, { status: 409 });
    }

    return NextResponse.json<JsonResponse<typeof data>>({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete booking.";

    return NextResponse.json<JsonResponse<never>>({ error: message }, { status: 500 });
  }
}
