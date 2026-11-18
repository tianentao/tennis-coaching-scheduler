import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/demo/seed";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Nightly demo reset, scheduled in vercel.json. Vercel Cron sends
// `Authorization: Bearer $CRON_SECRET` when the CRON_SECRET env var is set.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const password = process.env.DEMO_ACCOUNT_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "DEMO_ACCOUNT_PASSWORD is not set." }, { status: 500 });
  }

  try {
    const result = await resetDemo(createSupabaseAdminClient(), password);
    console.log("Demo reset:", result);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Demo reset failed.";
    console.error("Demo reset failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
