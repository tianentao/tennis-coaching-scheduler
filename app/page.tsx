import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  DatabaseZap,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Trophy
} from "lucide-react";

const features = [
  {
    title: "Secure session booking",
    description: "Race-safe reservations backed by PostgreSQL constraints and transactional RPCs.",
    icon: ShieldCheck
  },
  {
    title: "Weekly court calendar",
    description: "Browse open coaching sessions in a clean week view optimized for quick booking.",
    icon: CalendarClock
  },
  {
    title: "Coach-ready operations",
    description: "Time slot management, booking oversight, and admin-friendly access controls.",
    icon: Trophy
  }
];

const howItWorks = [
  {
    title: "No double bookings, even under a race",
    description:
      "Booking runs inside a PostgreSQL function that locks the slot row (SELECT … FOR UPDATE) before checking it. A partial unique index allows only one active booking per slot as a second safety net. If two players click at the same moment, one gets the session and the other gets a clear \"already booked\" error.",
    icon: LockKeyhole
  },
  {
    title: "Access rules live in the database",
    description:
      "Row Level Security policies decide who sees what. Players only ever see their own bookings, and coaches see everyone's. The open-slots view checks availability through a SECURITY DEFINER helper that reveals only yes or no, so it's accurate without exposing other players' bookings.",
    icon: DatabaseZap
  },
  {
    title: "One time zone, everywhere",
    description:
      "Every session happens at one club, so dates are computed and shown in Pacific Time whether the server runs in UTC or the visitor is in Tokyo. The coach's slot form reads typed times the same way.",
    icon: Clock3
  },
  {
    title: "A demo that resets itself",
    description:
      "One-click demo sign-in happens on the server, so the shared password never reaches the browser, and it repairs itself if a visitor changes it. A Vercel Cron job wipes visitor accounts and re-seeds two fresh weeks of sessions every night.",
    icon: RotateCcw
  }
];

const stack = [
  "Next.js 15 App Router",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Supabase Auth",
  "PostgreSQL + RLS",
  "Vercel"
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-court-200">
            Production-Ready Scheduling
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
            A full-stack tennis coaching app for booking, cancellations, and coach availability.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Built with Next.js App Router, Supabase Auth, PostgreSQL, and Row Level Security to
            keep every booking accurate and every user scoped correctly.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-court-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-court-400"
            >
              Try the live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white transition hover:border-court-400"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-court-500/10 via-slate-950 to-clay-500/10 p-8 shadow-soft">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-court-200">What it does</p>
            <div className="mt-8 space-y-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="rounded-2xl bg-white/5 p-3 text-court-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">{feature.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mt-28 scroll-mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-court-200">
          How it works
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
          The interesting parts are the ones you can&apos;t see.
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-7 shadow-soft"
              >
                <div className="inline-flex rounded-2xl bg-court-500/10 p-3 text-court-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
              </article>
            );
          })}
        </div>

        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tech stack">
          {stack.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-slate-300"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
