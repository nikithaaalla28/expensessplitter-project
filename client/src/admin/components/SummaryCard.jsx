import React from 'react';

const SummaryCard = ({ title, value, caption, icon, accent }) => {
  return (
    <div className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-800 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_25px_100px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-400">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );
};

export default SummaryCard;
