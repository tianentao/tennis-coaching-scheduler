export function TopBar() {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] bg-white/80 p-6 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Spring Cycle 2026
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          Keep every lesson booked with room for player progression
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-slate-500">Utilization</p>
          <p className="mt-1 text-xl font-semibold">82%</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Waitlist</p>
          <p className="mt-1 text-xl font-semibold">6 players</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-1 text-xl font-semibold">$4.8k</p>
        </div>
      </div>
    </div>
  );
}
