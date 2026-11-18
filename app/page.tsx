import Link from "next/link";
import { ArrowRight, CalendarClock, ShieldCheck, Trophy } from "lucide-react";

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
              href="/calendar"
              className="inline-flex items-center gap-2 rounded-full bg-court-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-court-400"
            >
              View calendar
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white transition hover:border-court-400"
            >
              Login or sign up
            </Link>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-court-500/10 via-slate-950 to-clay-500/10 p-8 shadow-soft">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-court-200">Included deliverables</p>
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
    </main>
  );
}
