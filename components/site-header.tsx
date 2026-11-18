import Link from "next/link";
import { CalendarDays, LogOut, Trophy } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: isAdmin } = user ? await supabase.rpc("is_admin") : { data: false };

  async function signOut() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="rounded-full bg-court-500 p-2 text-slate-950">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <p className="hidden text-sm font-semibold uppercase tracking-[0.3em] text-court-200 sm:block">
              Match Point
            </p>
            <p className="text-base font-semibold sm:text-lg">Tennis Coaching Scheduler</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200 sm:gap-3">
          <Link
            href="/calendar"
            className="rounded-full border border-white/10 px-4 py-2 transition hover:border-court-400 hover:text-white"
          >
            Calendar
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-4 py-2 transition hover:border-court-400 hover:text-white"
          >
            Dashboard
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-full border border-white/10 px-4 py-2 transition hover:border-court-400 hover:text-white"
            >
              Admin
            </Link>
          ) : null}
          {user ? (
            <form action={signOut}>
              <button className="inline-flex items-center gap-2 rounded-full bg-clay-500 px-4 py-2 font-medium text-white transition hover:bg-clay-600">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-court-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-court-400"
            >
              <CalendarDays className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
