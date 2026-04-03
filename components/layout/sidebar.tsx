"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/booking-calendar", label: "Booking Calendar" },
  { href: "/my-bookings", label: "My Bookings" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col rounded-[28px] bg-ink px-6 py-8 text-white shadow-panel lg:w-72">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-court-200">
          Racquet Lab
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Coaching Scheduler</h1>
        <p className="mt-3 text-sm text-slate-300">
          Plan lessons, review upcoming sessions, and keep the weekly court
          schedule tight.
        </p>
      </div>

      <nav className="mt-10 flex flex-col gap-3">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-court-400 text-ink"
                  : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-white/5 p-5">
        <p className="text-sm font-medium text-court-100">This week</p>
        <p className="mt-2 text-3xl font-semibold">18 sessions</p>
        <p className="mt-2 text-sm text-slate-300">
          4 private lessons, 3 clinics, 2 review blocks still open.
        </p>
      </div>
    </aside>
  );
}
