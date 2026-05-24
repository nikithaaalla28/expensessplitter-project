export default function StatsCard({ title, value, description, icon }) {
  return (
    <div className="rounded-[28px] border border-slate-800/70 bg-slate-950/95 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
        </div>
        {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/15">{icon}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}
