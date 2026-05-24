from pathlib import Path

root = Path(r'c:\Users\nikitha\OneDrive\Desktop\ExpensesSplitter\client\src')

dashboard = root / 'pages' / 'Dashboard.js'
settlements = root / 'pages' / 'Settlements.js'

new_dashboard = '''import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
      const res = await axios.get('http://localhost:5000/api/groups');
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
      const res = await axios.get(`http://localhost:5000/api/expenses/${groupId}`);
      setExpenses(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettlements = async (groupId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/expenses/settlements/${groupId}`);
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
      await axios.delete(`http://localhost:5000/api/expenses/clear/${selectedGroup._id}`);
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
      const res = await axios.delete('http://localhost:5000/api/groups/admin/clear-all');

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
                  className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  value={selectedGroup?._id || ''}
                  onChange={(e) => {
                    const selected = groups.find((group) => group._id === e.target.value);
                    setSelectedGroup(selected);
                  }}
                >
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>{group.groupName}</option>
                  ))}
                </select>
                <GradientButton type="button" onClick={() => selectedGroup && fetchExpenses(selectedGroup._id)} className="bg-slate-950 hover:bg-slate-800">
                  Refresh data
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
'''

new_settlements = '''import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PremiumCard from '../components/PremiumCard';
import StatsCard from '../components/StatsCard';
import GradientButton from '../components/GradientButton';
import GlassContainer from '../components/GlassContainer';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { FiArrowDownLeft, FiArrowUpRight, FiRefreshCcw, FiShield } from 'react-icons/fi';

function Settlements() {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [settlementRows, setSettlementRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [settledTransactions, setSettledTransactions] = useState([]);
  const [settlementRecords, setSettlementRecords] = useState([]);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAllData, setClearingAllData] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchSettlements();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/groups');
      const groupsData = res.data || [];
      setGroups(groupsData);
      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load groups. Please try again.');
    }
  };

  const getGroupMembers = () => {
    return groups.find((group) => group._id === selectedGroup)?.members || [];
  };

  const getExpenseShares = (expense, members) => {
    const amount = parseFloat(expense.amount) || 0;
    const splitDetails = expense.splits || expense.splitDetails || {};

    if (splitDetails && Object.keys(splitDetails).length > 0) {
      return Object.fromEntries(
        Object.entries(splitDetails).map(([person, value]) => [person, parseFloat(value) || 0])
      );
    }

    const splitAmong = expense.splitAmong || [];
    if (expense.splitType === 'equal' && splitAmong.length > 0) {
      const perPerson = amount / splitAmong.length;
      return splitAmong.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
    }

    if (splitAmong.length > 0) {
      const perPerson = amount / splitAmong.length;
      return splitAmong.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
    }

    if (members.length > 0) {
      const perPerson = amount / members.length;
      return members.reduce((acc, person) => ({ ...acc, [person]: perPerson }), {});
    }

    return { [expense.paidBy || 'Unknown']: amount };
  };

  const calculateSettlementRows = (expenses, members) => {
    const balances = {};
    const ensurePerson = (person) => {
      if (!person) return;
      if (!balances[person]) {
        balances[person] = {
          person,
          totalPaid: 0,
          totalShare: 0,
          amountToReceive: 0,
          amountToPay: 0,
          netBalance: 0,
          status: 'Settled'
        };
      }
    };

    members.forEach((member) => ensurePerson(member));

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy || 'Unknown';
      const expenseMembers = Array.isArray(expense.splitAmong) ? expense.splitAmong : [];
      const shares = getExpenseShares(expense, members.length ? members : expenseMembers);
      const amount = parseFloat(expense.amount) || 0;

      ensurePerson(paidBy);
      balances[paidBy].totalPaid += amount;

      Object.entries(shares).forEach(([person, share]) => {
        ensurePerson(person);
        balances[person].totalShare += share;
      });
    });

    return Object.values(balances).map((row) => {
      const netBalance = parseFloat((row.totalPaid - row.totalShare).toFixed(2));
      const amountToReceive = netBalance > 0 ? netBalance : 0;
      const amountToPay = netBalance < 0 ? -netBalance : 0;
      const status = netBalance > 0 ? 'Receive' : netBalance < 0 ? 'Pay' : 'Settled';

      return {
        ...row,
        netBalance,
        amountToReceive,
        amountToPay,
        status
      };
    });
  };

  const enrichSettlementRows = (rows, settlementRecords) => {
    return rows.map((row) => {
      if (row.netBalance === 0) {
        return { ...row, paymentStatus: 'Settled', settled: true };
      }

      if (row.amountToReceive > 0) {
        const creditorRecords = settlementRecords.filter((settlement) => settlement.creditor === row.person);
        const allCreditorSettled = creditorRecords.length > 0 && creditorRecords.every((settlement) => settlement.settled);

        return {
          ...row,
          paymentStatus: allCreditorSettled ? 'Received' : 'HaveToReceive',
          settled: allCreditorSettled
        };
      }

      const relatedRecords = settlementRecords.filter((settlement) => settlement.debtor === row.person);
      const unsettledRecord = relatedRecords.find((settlement) => !settlement.settled);
      const isSettled = relatedRecords.length > 0 && relatedRecords.every((settlement) => settlement.settled);

      return {
        ...row,
        paymentStatus: isSettled ? 'Settled' : unsettledRecord?.paymentStatus || 'Pending',
        paymentMethod: unsettledRecord?.paymentMethod || '',
        transactionId: unsettledRecord?.transactionId || '',
        settledAt: unsettledRecord?.settledAt || null,
        settlementRecord: unsettledRecord || relatedRecords[0] || null,
        settled: isSettled
      };
    });
  };

  const simplifySettlements = (rows) => {
    const debtors = rows
      .filter((row) => row.netBalance < 0)
      .map((row) => ({ person: row.person, amount: -row.netBalance }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = rows
      .filter((row) => row.netBalance > 0)
      .map((row) => ({ person: row.person, amount: row.netBalance }))
      .sort((a, b) => b.amount - a.amount);

    const result = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0) {
        result.push({ from: debtor.person, to: creditor.person, amount });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount <= 0) debtorIndex += 1;
      if (creditor.amount <= 0) creditorIndex += 1;
    }

    return result;
  };

  const markAsSettled = (personFrom, personTo, amount) => {
    const transactionKey = `${personFrom}-${personTo}-${amount}`;
    if (!settledTransactions.includes(transactionKey)) {
      setSettledTransactions([...settledTransactions, transactionKey]);
    }
  };

  const updateBalances = (rows, settledTxns) => {
    return rows.map((row) => {
      const isSettled = settledTxns.some((txn) => {
        const [from, to, amount] = txn.split('-');
        return (from === row.person && to === row.person) || (to === row.person && from === row.person);
      });

      if (isSettled && row.netBalance !== 0) {
        return {
          ...row,
          netBalance: 0,
          amountToReceive: 0,
          amountToPay: 0,
          status: 'Settled'
        };
      }
      return row;
    });
  };

  const handleSettlePayment = async (from, to, amount) => {
    const transactionKey = `${from}-${to}-${amount}`;
    try {
      markAsSettled(from, to, amount);
      const updatedRows = updateBalances(settlementRows, [...settledTransactions, transactionKey]);
      setSettlementRows(updatedRows);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Settlement error:', err);
      setError('Failed to settle payment. Please try again.');
    }
  };

  const fetchSettlements = async () => {
    if (!selectedGroup) return;
    setError('');
    setLoading(true);
    setSettlementRows([]);

    try {
      const [expenseRes, settlementRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/expenses/${selectedGroup}`),
        axios.get(`http://localhost:5000/api/expenses/settlements/${selectedGroup}`),
      ]);

      const expenses = expenseRes.data || [];
      const settlementData = settlementRes.data || [];
      setSettlementRecords(settlementData);

      const rows = calculateSettlementRows(expenses, getGroupMembers());
      const enrichedRows = enrichSettlementRows(rows, settlementData);
      setSettlementRows(enrichedRows);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('fetchSettlements error:', err);
      const message = err?.response?.data?.message || err.message || 'Unable to refresh settlements. Please check the server.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (!selectedGroup) return;
    if (!window.confirm('Clear all expenses and settlements for this group?')) return;
    setLoading(true);
    setSettlementRows([]);
    setError('');

    try {
      await axios.delete(`http://localhost:5000/api/expenses/clear/${selectedGroup}`);
      await fetchSettlements();
    } catch (err) {
      console.error(err);
      setError('Unable to clear settlements. Please check the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllGroupData = async () => {
    try {
      setClearingAllData(true);
      const res = await axios.delete('http://localhost:5000/api/groups/admin/clear-all');
      
      if (res.data.success) {
        setGroups([]);
        setSelectedGroup('');
        setSettlementRows([]);
        setSettledTransactions([]);
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

  const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const totals = {
    totalPaid: settlementRows.reduce((sum, row) => sum + row.totalPaid, 0),
    totalOwes: settlementRows.reduce((sum, row) => sum + row.amountToPay, 0),
    totalReceivable: settlementRows.reduce((sum, row) => sum + row.amountToReceive, 0),
    netBalance: settlementRows.reduce((sum, row) => sum + row.netBalance, 0)
  };

  const receivers = settlementRows.filter((row) => row.netBalance > 0);
  const payers = settlementRows.filter((row) => row.netBalance < 0);
  const allSimplifiedTransactions = simplifySettlements(settlementRows);
  const simplifiedTransactions = updateSettlementCards(allSimplifiedTransactions, settledTransactions);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-[2.5rem] bg-slate-950/95 p-10 text-white shadow-[0_35px_90px_rgba(15,23,42,0.25)] relative overflow-hidden fade-in">
            <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
                Settlement center
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-tight">Settle balances with confidence.</h1>
                <p className="max-w-3xl text-slate-300 leading-8">Review who owes what, simplify transfers, and finalize payments in a premium settlement workflow.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Total owed</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalOwes)}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Total receivable</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalReceivable)}</p>
                </div>
              </div>
            </div>
          </div>

          <PremiumCard className="p-6 fade-in">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Quick actions</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Manage your settlement flow</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={fetchSettlements}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiRefreshCcw className="mr-2 h-4 w-4" /> Refresh balance data
              </button>
              <button
                type="button"
                onClick={clearData}
                disabled={!selectedGroup}
                className="inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear group settlement data
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowClearAllModal(true)}
                  disabled={clearingAllData}
                  className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearingAllData ? 'Clearing all data...' : 'Admin: Clear All Groups'}
                </button>
              )}
            </div>
          </PremiumCard>
        </section>

        <section className="mt-10 space-y-6">
          <GlassContainer className="p-6 fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Settlement controls</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Finalize group payments</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>{group.groupName}</option>
                  ))}
                </select>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                  <FiShield className="h-4 w-4 text-cyan-500" /> {lastRefreshed ? `Updated ${lastRefreshed}` : 'Not refreshed'}
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-[28px] bg-rose-50 px-5 py-4 text-sm text-rose-700 ring-1 ring-rose-100">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-[28px] bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-950">Simplified transactions</h3>
                  <p className="mt-2 text-sm text-slate-500">Payers and receivers after automatic settlement balancing.</p>

                  {loading ? (
                    <div className="mt-6 rounded-[24px] bg-slate-50 p-6 text-slate-500">Loading settlement data...</div>
                  ) : simplifiedTransactions.length === 0 ? (
                    <div className="mt-6 rounded-[24px] bg-slate-50 p-6 text-slate-500">No outstanding settlement transactions.</div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {simplifiedTransactions.map((txn) => (
                        <div key={`${txn.from}-${txn.to}-${txn.amount}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-slate-500">{txn.from} pays {txn.to}</p>
                              <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(txn.amount)}</p>
                            </div>
                            <GradientButton
                              type="button"
                              onClick={() => handleSettlePayment(txn.from, txn.to, txn.amount)}
                              className="bg-slate-950 hover:bg-slate-800"
                            >
                              Settle payment
                            </GradientButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <PremiumCard className="p-6">
                  <h3 className="text-xl font-semibold text-white">Who Pays</h3>
                  <div className="mt-6 space-y-3">
                    {payers.length === 0 ? (
                      <div className="rounded-[24px] bg-slate-900/70 p-4 text-slate-300">No payers available.</div>
                    ) : payers.map((person) => (
                      <div key={person.person} className="rounded-[24px] bg-slate-900/70 p-4 text-slate-100">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold">{person.person}</p>
                          <p className="text-lg font-semibold text-cyan-300">{formatCurrency(person.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCard>

                <PremiumCard className="p-6">
                  <h3 className="text-xl font-semibold text-white">Who Receives</h3>
                  <div className="mt-6 space-y-3">
                    {receivers.length === 0 ? (
                      <div className="rounded-[24px] bg-slate-900/70 p-4 text-slate-300">No receivers available.</div>
                    ) : receivers.map((person) => (
                      <div key={person.person} className="rounded-[24px] bg-slate-900/70 p-4 text-slate-100">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold">{person.person}</p>
                          <p className="text-lg font-semibold text-cyan-300">{formatCurrency(person.amountToReceive)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCard>
              </div>
            </div>
          </GlassContainer>
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

export default Settlements;
'''

with open(dashboard, 'w', encoding='utf-8') as f:
    f.write(new_dashboard)
with open(settlements, 'w', encoding='utf-8') as f:
    f.write(new_settlements)
