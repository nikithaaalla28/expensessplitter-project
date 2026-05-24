export default function DashboardSection({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">{title}</p>
          {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
