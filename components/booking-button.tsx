"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BookingButton({ slotId }: { slotId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleBook() {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ slotId })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to book this session.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleBook}
        disabled={isPending}
        className="rounded-full bg-court-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-court-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Booking..." : "Book session"}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
