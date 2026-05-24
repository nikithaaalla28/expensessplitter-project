import React from 'react';

const statusStyles = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  Blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
  Completed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
