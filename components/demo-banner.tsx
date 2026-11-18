import { FlaskConical } from "lucide-react";

// Shown on every page of the demo deployment (when DEMO_ACCOUNT_PASSWORD is set).
export function DemoBanner() {
  if (!process.env.DEMO_ACCOUNT_PASSWORD) {
    return null;
  }

  return (
    <div className="border-b border-clay-500/30 bg-clay-500/10 px-6 py-2 text-center text-sm text-clay-100">
      <FlaskConical className="mr-2 inline h-4 w-4 -translate-y-px text-clay-300" aria-hidden />
      <span className="font-semibold text-clay-200">Live demo</span>
      <span className="text-clay-100/80"> · Accounts are shared and data resets every night.</span>
    </div>
  );
}
