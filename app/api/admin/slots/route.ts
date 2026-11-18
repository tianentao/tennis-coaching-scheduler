import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JsonResponse } from "@/types/app";

const createSlotSchema = z.object({
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  location: z.string().min(2).max(200),
  courtName: z.string().max(120).nullable().optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "all_levels"]).default("all_levels")
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

    const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");

    if (roleError || !isAdmin) {
      return NextResponse.json<JsonResponse<never>>(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const parsed = createSlotSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json<JsonResponse<never>>(
        { error: "Invalid slot payload." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        coach_id: user.id,
        starts_at: parsed.data.startsAt,
        ends_at: parsed.data.endsAt,
        location: parsed.data.location,
        court_name: parsed.data.courtName ?? null,
        skill_level: parsed.data.skillLevel
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json<JsonResponse<never>>({ error: error.message }, { status: 400 });
    }

    return NextResponse.json<JsonResponse<typeof data>>({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create slot.";

    return NextResponse.json<JsonResponse<never>>({ error: message }, { status: 500 });
  }
}
