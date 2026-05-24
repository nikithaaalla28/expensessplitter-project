import React, { useEffect, useState } from 'react';
import ActivityFeed from '../components/ActivityFeed';
import Loader from '../components/Loader';
import { fetchAdminActivityLogs } from '../api/adminApi';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchAdminActivityLogs();
        const list = Array.isArray(res.data)
          ? res.data.map((entry) => ({
              id: entry._id || entry.id,
              title: entry.action || entry.title || 'Event',
              description: entry.detail || entry.description || entry.message || '',
              time: entry.timestamp || (entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '')
            }))
          : [];
        setLogs(list);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Unable to load activity logs.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 dark:bg-rose-950/40 px-6 py-4 text-sm text-rose-800 dark:text-rose-200 shadow-sm">{error}</div>
      )}

      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Activity logs</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Audit timeline</h2>
          </div>
          <p className="text-sm text-slate-500">Review admin actions, login history, and event tracking for your platform.</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <ActivityFeed items={logs.map((entry) => ({ id: entry.id, title: entry.title, description: entry.description, time: entry.time }))} />
      </div>
    </div>
  );
};

export default ActivityLogs;
