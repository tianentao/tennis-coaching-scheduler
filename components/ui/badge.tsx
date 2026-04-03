import { cn } from "@/lib/utils";

type BadgeProps = {
  label: string;
  tone?: "primary" | "muted" | "warning";
};

export function Badge({ label, tone = "primary" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        tone === "primary" && "bg-court-100 text-court-800",
        tone === "muted" && "bg-white/80 text-slate-600",
        tone === "warning" && "bg-amber-100 text-amber-800"
      )}
    >
      {label}
    </span>
  );
}
