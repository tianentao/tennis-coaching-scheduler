"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { APP_TIME_ZONE_LABEL, parseAppZoneDateTimeLocal } from "@/lib/time";

export function AdminSlotForm() {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [courtName, setCourtName] = useState("");
  const [skillLevel, setSkillLevel] = useState("all_levels");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startsAt: parseAppZoneDateTimeLocal(startsAt).toISOString(),
          endsAt: parseAppZoneDateTimeLocal(endsAt).toISOString(),
          location,
          courtName: courtName || null,
          skillLevel
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create slot.");
        return;
      }

      setStartsAt("");
      setEndsAt("");
      setLocation("");
      setCourtName("");
      setSkillLevel("all_levels");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-soft"
    >
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-court-200">
          Create Slot
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Add coach availability</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Starts at ({APP_TIME_ZONE_LABEL})
          </span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-court-400 transition focus:ring-2"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Ends at ({APP_TIME_ZONE_LABEL})
          </span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-court-400 transition focus:ring-2"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Location</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-court-400 transition focus:ring-2"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Downtown Tennis Club"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Court name</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-court-400 transition focus:ring-2"
            value={courtName}
            onChange={(event) => setCourtName(event.target.value)}
            placeholder="Court 3"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-200">Skill level</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-court-400 transition focus:ring-2"
            value={skillLevel}
            onChange={(event) => setSkillLevel(event.target.value)}
          >
            <option value="all_levels">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 rounded-full bg-court-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-court-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Create time slot"}
      </button>
    </form>
  );
}
