"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/booking?id=${bookingId}`, {
        method: "DELETE"
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to cancel booking.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="rounded-full border border-clay-300 px-4 py-2 text-sm font-semibold text-clay-100 transition hover:border-clay-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Cancelling..." : "Cancel booking"}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
