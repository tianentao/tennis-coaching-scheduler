import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT = "/calendar";

// Only follow `next` if it stays on this site. Otherwise a link like
// /api/auth/callback?next=https://evil.example (or //evil.example) would bounce
// visitors to another site through ours.
function safeRedirectUrl(next: string | null, origin: string) {
  if (next) {
    try {
      const target = new URL(next, origin);
      if (target.origin === origin) {
        return target;
      }
    } catch {
      // Malformed URL: fall through to the default.
    }
  }
  return new URL(DEFAULT_REDIRECT, origin);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(safeRedirectUrl(searchParams.get("next"), origin));
}
