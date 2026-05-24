import React from 'react';

const DataTable = ({ columns, data, renderRowActions }) => {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 text-left font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  {column.label}
                </th>
              ))}
              {renderRowActions && <th className="px-5 py-4 text-right font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-transparent">
            {data.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50">
                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`} className="whitespace-nowrap px-5 py-4 text-slate-700 dark:text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {renderRowActions && <td className="whitespace-nowrap px-5 py-4 text-right text-slate-700">{renderRowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
