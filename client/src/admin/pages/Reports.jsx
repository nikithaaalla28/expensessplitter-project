import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiStar, FiTarget, FiUsers } from 'react-icons/fi';
import ExpenseBarChart from '../charts/ExpenseBarChart';
import ExpensePieChart from '../charts/ExpensePieChart';
import ActivityChart from '../charts/ActivityChart';
import ActivityFeed from '../components/ActivityFeed';
import Loader from '../components/Loader';
import Toast from '../../components/Toast';
import { fetchAdminReports } from '../api/adminApi';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await fetchAdminReports();
        setReport(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load report analytics.');
        setToast({ message: 'Unable to fetch reports. Please try again.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadReport();
    const interval = setInterval(loadReport, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  const data = report || {
    totalUsers: 0,
    totalGroups: 0,
    totalExpenses: 0,
    totalExpenseAmount: 0,
    totalSettlements: 0,
    totalSettlementAmount: 0,
    pendingSettlements: 0,
    monthlyExpenses: [],
    categoryDistribution: [],
    groupWiseExpenses: [],
    recentActivities: []
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">{error}</div>
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Reports</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Financial analytics</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Download insights
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700"><FiUsers className="h-6 w-6" /></span>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Total users</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700"><FiStar className="h-6 w-6" /></span>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Total groups</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totalGroups.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700"><FiTrendingUp className="h-6 w-6" /></span>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Total expenses</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">₹{data.totalExpenseAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700"><FiTarget className="h-6 w-6" /></span>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Total settlements</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">₹{data.totalSettlementAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ExpenseBarChart data={data.monthlyExpenses} />
        <ExpensePieChart data={data.categoryDistribution} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Group totals</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Top expense groups</h3>
            </div>
            <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">Live</span>
          </div>
          <div className="mt-6 space-y-4">
            {data.groupWiseExpenses.map((group) => (
              <div key={group.groupId} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{group.groupName}</p>
                    <p className="text-sm text-slate-500">{group.expenseCount} expenses</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">₹{group.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {data.groupWiseExpenses.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                No group expense summaries available yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ActivityChart data={data.groupWiseExpenses.map((item) => ({ name: item.groupName, value: item.totalAmount }))} />
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Recent activity</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Latest admin events</h3>
            </div>
            <ActivityFeed items={data.recentActivities.map((activity) => ({
              id: activity.id,
              title: activity.title,
              description: activity.description,
              time: activity.time ? new Date(activity.time).toLocaleString() : 'Just now'
            }))} />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Reports;
