"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, ClipboardList, UserRound } from "lucide-react";
import { demoSignIn, type DemoRole } from "@/app/login/actions";

const OPTIONS: { role: DemoRole; title: string; description: string; icon: typeof UserRound }[] = [
  {
    role: "player",
    title: "Try as a player",
    description: "Browse the weekly calendar, book a session, then cancel it.",
    icon: UserRound
  },
  {
    role: "coach",
    title: "Try as the coach",
    description: "Create time slots and review every player's bookings.",
    icon: ClipboardList
  }
];

function DemoButton({ option }: { option: (typeof OPTIONS)[number] }) {
  const { pending, data } = useFormStatus();
  const isThisPending = pending && data?.get("role") === option.role;
  const Icon = option.icon;

  return (
    <button
      type="submit"
      name="role"
      value={option.role}
      disabled={pending}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-court-500 hover:bg-court-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="rounded-full bg-court-100 p-2 text-court-800">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-slate-950">
          {isThisPending ? "Signing you in..." : option.title}
        </span>
        <span className="block text-sm text-slate-600">{option.description}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-court-700" />
    </button>
  );
}

export function DemoLogin() {
  const [state, formAction] = useActionState(demoSignIn, { error: null });

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-court-700">Live Demo</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">One click, no signup</h2>

      <form action={formAction} className="mt-6 space-y-3">
        {OPTIONS.map((option) => (
          <DemoButton key={option.role} option={option} />
        ))}
      </form>

      {state.error ? <p className="mt-4 text-sm text-red-600">{state.error}</p> : null}
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Demo accounts are shared with other visitors, so you may see their bookings too. Demo data resets every night.
      </p>
    </div>
  );
}
