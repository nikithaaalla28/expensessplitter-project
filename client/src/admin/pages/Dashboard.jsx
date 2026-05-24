import React, { useEffect, useState } from 'react';
import { FiArrowUpRight, FiUsers, FiLayers, FiShoppingBag, FiShield } from 'react-icons/fi';
import SummaryCard from '../components/SummaryCard';
import ActivityFeed from '../components/ActivityFeed';
import ExpenseBarChart from '../charts/ExpenseBarChart';
import ExpensePieChart from '../charts/ExpensePieChart';
import ActivityChart from '../charts/ActivityChart';
import Loader from '../components/Loader';
import { fetchAdminSummary } from '../api/adminApi';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentGroups, setRecentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetchAdminSummary();
        const data = response.data;

        setSummary({
          totalUsers: data.totalUsers || 0,
          totalGroups: data.totalGroups || 0,
          totalExpenses: data.totalExpenses || 0,
          pendingSettlements: data.totalSettlements || 0,
          monthlyExpenses: data.monthlyExpenses || [],
          expenseDistribution: data.expenseDistribution || [],
          activeGroups: data.activeGroups || [],
          highestSpender: data.highestSpender || 'N/A',
          mostActiveGroup: data.mostActiveGroup || 'N/A',
          liveRevenue: (data.monthlyExpenses && data.monthlyExpenses.length > 0)
            ? data.monthlyExpenses[data.monthlyExpenses.length - 1].amount
            : 0
        });

        // Format recent groups for display
        setRecentGroups(data.recentGroups || []);
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <Loader />;

  const data = summary || {
    totalUsers: 0,
    totalGroups: 0,
    totalExpenses: 0,
    pendingSettlements: 0,
    monthlyExpenses: [],
    expenseDistribution: [],
    activeGroups: [],
    highestSpender: 'N/A',
    mostActiveGroup: 'N/A',
    liveRevenue: 0
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Admin overview</p>
              <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">Control panel</h1>
              <p className="max-w-2xl text-slate-500 dark:text-slate-400">Manage your expense splitter app with premium analytics, quick actions, and settlement insights.</p>
            </div>
            <div className="rounded-[2rem] bg-slate-950 px-6 py-5 text-white shadow-[0_30px_60px_rgba(15,23,42,0.12)]">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Live revenue</p>
              <p className="mt-3 text-3xl font-semibold">₹{data.liveRevenue.toLocaleString()}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-cyan-200"><FiArrowUpRight className="h-4 w-4" /> Updated live</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Users"
              value={data.totalUsers}
              caption="Active users in the platform"
              accent="bg-indigo-100 text-indigo-700"
              icon={<FiUsers className="h-6 w-6" />}
            />
            <SummaryCard
              title="Total Groups"
              value={data.totalGroups}
              caption="Groups currently active"
              accent="bg-cyan-100 text-cyan-700"
              icon={<FiLayers className="h-6 w-6" />}
            />
            <SummaryCard
              title="Total Expenses"
              value={data.totalExpenses}
              caption="Recorded spend entries"
              accent="bg-slate-100 text-slate-700"
              icon={<FiShoppingBag className="h-6 w-6" />}
            />
            <SummaryCard
              title="Pending Settlements"
              value={data.pendingSettlements}
              caption="Balances that still need closure"
              accent="bg-emerald-100 text-emerald-700"
              icon={<FiShield className="h-6 w-6" />}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Active groups</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Group engagement</h2>
              </div>
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">Live</span>
            </div>
            <div className="mt-6 space-y-4">
              {recentGroups.map((group) => (
                <div key={group.id} className="rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{group.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{group.members} members • created {group.created}</p>
                    </div>
                    <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{group.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ActivityFeed items={data.recentActivities || []} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <ExpenseBarChart data={data.monthlyExpenses} />
        <div className="space-y-6">
          <ExpensePieChart data={data.expenseDistribution} />
          <ActivityChart data={data.activeGroups} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Insight</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Highest spender</h3>
          <p className="mt-4 text-slate-600 dark:text-slate-400">{data.highestSpender} is the highest spender this month, driving the majority of group bookings and expense activity.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Trend</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Most active group</h3>
          <p className="mt-4 text-slate-600 dark:text-slate-400">{data.mostActiveGroup} has the strongest engagement, with multiple expenses and fast settlement cycles.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Workflow</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Settlement health</h3>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Monitor pending settlement volume and prioritize reminders for user groups closing balances faster.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
