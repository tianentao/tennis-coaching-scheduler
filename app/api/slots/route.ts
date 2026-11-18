import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/bookings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JsonResponse } from "@/types/app";

const slotsQuerySchema = z.object({
  startsAt: z.iso.datetime().optional(),
  endsAt: z.iso.datetime().optional()
});

export async function GET(request: Request) {
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
    const parsed = slotsQuerySchema.safeParse({
      startsAt: searchParams.get("startsAt") ?? undefined,
      endsAt: searchParams.get("endsAt") ?? undefined
    });

    if (!parsed.success) {
      return NextResponse.json<JsonResponse<never>>(
        { error: "Invalid date filters supplied." },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots({
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined
    });

    return NextResponse.json<JsonResponse<typeof slots>>({ data: slots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch slots.";

    return NextResponse.json<JsonResponse<never>>({ error: message }, { status: 500 });
  }
}
