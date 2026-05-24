import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const statusClasses = {
  Pending: 'border-amber-200 bg-amber-100 text-amber-700',
  Sent: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  Failed: 'border-rose-200 bg-rose-100 text-rose-700'
};

const ActivityFeed = ({ items, onDelete }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
              {item.status && (
                <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${statusClasses[item.status] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                  {item.status}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">{item.time || item.timestamp}</span>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-rose-600"
                  aria-label="Delete notification"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description || item.detail || item.message}</p>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
