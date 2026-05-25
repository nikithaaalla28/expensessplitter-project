import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import MainNavbar from '../components/MainNavbar';
import PremiumCard from '../components/PremiumCard';
import StatsCard from '../components/StatsCard';
import GradientButton from '../components/GradientButton';
import GlassContainer from '../components/GlassContainer';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiTrendingUp, FiShield, FiClock } from 'react-icons/fi';

function Dashboard() {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAllData, setClearingAllData] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchExpenses(selectedGroup._id);
      fetchSettlements(selectedGroup._id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groups');
      const groupsData = res.data || [];
      setGroups(groupsData);
      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (groupId) => {
    try {
      const res = await api.get(`/expenses/${groupId}`);
      setExpenses(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettlements = async (groupId) => {
    try {
      const res = await api.get(`/expenses/settlements/${groupId}`);
      setSettlements(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const clearGroupData = async () => {
    if (!selectedGroup) return;
    if (!window.confirm('Clear all expenses and settlements for this group?')) return;

    try {
      setClearing(true);
      await api.delete(`/expenses/clear/${selectedGroup._id}`);
      await fetchExpenses(selectedGroup._id);
      await fetchSettlements(selectedGroup._id);
      setToast({ message: 'Group data cleared successfully.', type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: 'Unable to clear group data.', type: 'error' });
    } finally {
      setClearing(false);
    }
  };

  const handleClearAllGroupData = async () => {
    try {
      setClearingAllData(true);
      const res = await api.delete('/groups/admin/clear-all');

      if (res.data.success) {
        setGroups([]);
        setSelectedGroup(null);
        setExpenses([]);
        setSettlements([]);
        setShowClearAllModal(false);
        setToast({ message: 'All group dropdown data cleared successfully.', type: 'success' });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to clear group data. Please try again.', type: 'error' });
    } finally {
      setClearingAllData(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  const pendingSettlements = settlements.filter((item) => !item.settled).length;
  const memberCount = selectedGroup?.members?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <MainNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.45fr_0.95fr]">
          <PremiumCard className="p-10 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/95 text-white fade-in">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200 backdrop-blur-xl">
                Dashboard overview
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-tight">Your group spending, simplified.</h1>
                <p className="max-w-3xl text-slate-300 leading-8">
                  Manage expenses, settle balances, and keep every member aligned with a premium, modern dashboard experience.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Groups</p>
                  <p className="mt-4 text-3xl font-semibold">{groups.length}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Expenses</p>
                  <p className="mt-4 text-3xl font-semibold">{expenses.length}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Pending</p>
                  <p className="mt-4 text-3xl font-semibold">{pendingSettlements}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Total spent</p>
                  <p className="mt-4 text-3xl font-semibold">₹{totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <div className="space-y-6">
            <GlassContainer className="p-6 fade-in">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Active group</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-950">{selectedGroup?.groupName ?? 'No group selected'}</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                  <FiClock className="h-4 w-4 text-cyan-600" />
                  Live updates
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Members</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{memberCount}</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Recent spend</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{expenses.slice(-1)[0]?.amount ? `₹${expenses.slice(-1)[0].amount}` : '—'}</p>
                </div>
              </div>
            </GlassContainer>

            <PremiumCard className="p-6 fade-in">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Quick actions</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Manage groups faster</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <Link to="/create-group" className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Create new group</Link>
                <Link to="/add-expense" className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Add a new expense</Link>
                <Link to="/settlement" className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">View settlements</Link>
                <button
                  type="button"
                  onClick={clearGroupData}
                  disabled={!selectedGroup || clearing}
                  className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearing ? 'Clearing group...' : 'Clear current data'}
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowClearAllModal(true)}
                    disabled={clearingAllData}
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {clearingAllData ? 'Clearing all data...' : 'Admin: Clear All Groups'}
                  </button>
                )}
              </div>
            </PremiumCard>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <GlassContainer className="p-6 fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Group overview</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Recent expenses</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  disabled={loading}
                  className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                  value={selectedGroup?._id || ''}
                  onChange={(e) => {
                    const selected = groups.find((group) => group._id === e.target.value);
                    setSelectedGroup(selected);
                  }}
                >
                  {loading ? (
                    <option>Loading groups...</option>
                  ) : (
                    groups.map((group) => (
                      <option key={group._id} value={group._id}>{group.groupName}</option>
                    ))
                  )}
                </select>
                <GradientButton type="button" onClick={() => selectedGroup && fetchExpenses(selectedGroup._id)} className="bg-slate-950 hover:bg-slate-800">
                  {loading ? 'Loading...' : 'Refresh data'}
                </GradientButton>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatsCard title="Total expenses" value={`₹${totalExpenses.toFixed(2)}`} description="All recorded spend in this group." icon={<FiTrendingUp className="h-5 w-5" />} />
              <StatsCard title="Expense count" value={expenses.length} description="Entries captured so far." icon={<FiUsers className="h-5 w-5" />} />
              <StatsCard title="Pending settles" value={pendingSettlements} description="Open balances to resolve." icon={<FiShield className="h-5 w-5" />} />
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Paid By</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expenses.slice(0, 5).map((expense) => (
                    <tr key={expense._id} className="bg-white transition hover:bg-slate-50">
                      <td className="px-6 py-4">{expense.description}</td>
                      <td className="px-6 py-4">₹{expense.amount}</td>
                      <td className="px-6 py-4">{expense.paidBy}</td>
                      <td className="px-6 py-4">{expense.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassContainer>

          <aside className="space-y-6">
            <PremiumCard className="p-6 fade-in">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Snapshot</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Balance summary</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Groups available</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{groups.length}</p>
                </div>
                <div className="rounded-[24px] bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Pending settlements</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{pendingSettlements}</p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-6 fade-in">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Action</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Ready to settle</h3>
                </div>
              </div>
              <p className="mt-4 text-slate-300 leading-7">Use the settlement view to resolve balances and complete payments in one place.</p>
              <div className="mt-6 grid gap-3">
                <Link to="/settlement" className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Open settlement flow</Link>
              </div>
            </PremiumCard>
          </aside>
        </section>
      </main>

      <ConfirmationModal
        isOpen={showClearAllModal}
        title="Clear All Group Data?"
        message="Are you sure you want to clear all group data? This action will permanently delete all groups, expenses, and settlements from the system. This cannot be undone."
        onConfirm={handleClearAllGroupData}
        onCancel={() => setShowClearAllModal(false)}
        isLoading={clearingAllData}
        isDangerous={true}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
