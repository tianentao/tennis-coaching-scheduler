"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName
            }
          }
        });

        if (error) {
          setError(error.message);
          return;
        }

        setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/calendar");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 shadow-soft">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-court-700">
          Player Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Book coaching sessions, manage your schedule, and stay synced with your coach.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "sign-up" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Display name</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-court-400 transition focus:ring-2"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Alex Morgan"
              required
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-court-400 transition focus:ring-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="player@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-court-400 transition focus:ring-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-court-700">{message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        className="mt-6 text-sm font-medium text-court-700 transition hover:text-court-900"
      >
        {mode === "sign-in"
          ? "Need an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
