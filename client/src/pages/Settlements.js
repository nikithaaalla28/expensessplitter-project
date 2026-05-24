import React, { useCallback, useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import PremiumCard from '../components/PremiumCard';
import GradientButton from '../components/GradientButton';
import GlassContainer from '../components/GlassContainer';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { FiRefreshCcw, FiShield } from 'react-icons/fi';

function Settlements() {
  const { isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [settlementRows, setSettlementRows] = useState([]);
  const [summary, setSummary] = useState({
    totals: {
      totalPaid: 0,
      totalShare: 0,
      totalReceivable: 0,
      totalOwes: 0,
      netBalance: 0
    },
    payers: [],
    receivers: [],
    simplifiedTransactions: []
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAllData, setClearingAllData] = useState(false);
  const [toast, setToast] = useState(null);
  const [settlingTxnKey, setSettlingTxnKey] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchSettlements = useCallback(async () => {
    if (!selectedGroup) return;
    setError('');
    setLoading(true);

    try {
      const [summaryRes, historyRes] = await Promise.all([
        api.get(`/expenses/settlements-summary/${selectedGroup}`),
        api.get(`/expenses/settlements/history/${selectedGroup}`)
      ]);

      const summaryData = summaryRes.data || {};
      setSettlementRows(summaryData.rows || []);
      setSummary({
        totals: summaryData.totals || {
          totalPaid: 0,
          totalShare: 0,
          totalReceivable: 0,
          totalOwes: 0,
          netBalance: 0
        },
        payers: summaryData.payers || [],
        receivers: summaryData.receivers || [],
        simplifiedTransactions: summaryData.simplifiedTransactions || []
      });
      setPaymentHistory(historyRes.data.history || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('fetchSettlements error:', err);
      const message = err?.response?.data?.message || err.message || 'Unable to refresh settlement data. Please check the server.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      fetchSettlements();
    }
  }, [selectedGroup, fetchSettlements]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      const groupsData = res.data || [];
      setGroups(groupsData);
      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load groups. Please try again.');
    }
  };

  const handlePaymentAmountChange = (txnKey, value) => {
    const numericValue = value === '' ? '' : Number(value);
    setPaymentInputs((prev) => ({ ...prev, [txnKey]: numericValue }));
  };

  const handleSettlePayment = async (from, to, amount, txnKey) => {
    if (!selectedGroup) {
      setToast({ message: 'Select a group before settling payments.', type: 'error' });
      return;
    }

    const enteredAmount = paymentInputs[txnKey] ?? amount;
    const paidAmount = Number(enteredAmount) || 0;

    if (paidAmount <= 0) {
      setToast({ message: 'Enter a valid payment amount before settling.', type: 'error' });
      return;
    }
    if (paidAmount > amount) {
      setToast({ message: 'Amount cannot exceed remaining balance.', type: 'error' });
      return;
    }

    setError('');
    setSettlingTxnKey(txnKey);
    setLoading(true);

    try {
      const res = await api.post('/expenses/settlements/settle-transaction', {
        groupId: selectedGroup,
        from,
        to,
        amount: paidAmount
      });

      if (res.data.success) {
        setToast({ message: res.data.message, type: 'success' });
        setPaymentInputs((prev) => ({ ...prev, [txnKey]: '' }));

        if (res.data.summary) {
          setSettlementRows(res.data.summary.rows || []);
          setSummary({
            totals: res.data.summary.totals || {},
            payers: res.data.summary.payers || [],
            receivers: res.data.summary.receivers || [],
            simplifiedTransactions: res.data.summary.simplifiedTransactions || []
          });
        }

        if (res.data.history) {
          setPaymentHistory(res.data.history);
        }

        if (!res.data.summary) {
          await fetchSettlements();
        }
      }
    } catch (err) {
      console.error('Settlement error:', err);
      const message = err?.response?.data?.message || 'Failed to settle payment. Please try again.';
      const debugInfo = err?.response?.data?.debug;
      
      if (debugInfo) {
        console.error('Settlement lookup failed:', debugInfo);
      }
      
      setToast({ message, type: 'error' });
      setError(message);
    } finally {
      setLoading(false);
      setSettlingTxnKey(null);
    }
  };

  const clearData = async () => {
    if (!selectedGroup) return;
    if (!window.confirm('Clear all expenses and settlements for this group?')) return;
    setLoading(true);
    setSettlementRows([]);
    setError('');

    try {
      await api.delete(`/expenses/clear/${selectedGroup}`);
      await fetchSettlements();
      setToast({ message: 'Group settlement data cleared successfully.', type: 'success' });
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || 'Unable to clear settlements. Please check the server.';
      setError(message);
      setToast({ message: 'Failed to clear settlements.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllGroupData = async () => {
    try {
      setClearingAllData(true);
      const res = await api.delete('/groups/admin/clear-all');
      
      if (res.data.success) {
        setGroups([]);
        setSelectedGroup('');
        setSettlementRows([]);
        setPaymentHistory([]);
        setPaymentInputs({});
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

  const totals = summary.totals || {
    totalPaid: 0,
    totalShare: 0,
    totalReceivable: 0,
    totalOwes: 0,
    netBalance: 0
  };

  const receivers = summary.receivers || settlementRows.filter((row) => row.amountToReceive > 0);
  const payers = summary.payers || settlementRows.filter((row) => row.amountToPay > 0);
  const simplifiedTransactions = summary.simplifiedTransactions || [];

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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Total Paid</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalPaid)}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Total Owes</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalOwes)}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Total Receivable</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalReceivable)}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Amount To Pay</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalOwes)}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Amount To Receive</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.totalReceivable)}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Net Balance</p>
                  <p className="mt-4 text-3xl font-semibold">{formatCurrency(totals.netBalance)}</p>
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

            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Settlement summary</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Consolidated balances</h3>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Person Name</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Paid</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Share</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Amount To Receive</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Amount To Pay</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Final Net Balance</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {settlementRows.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-slate-500">No consolidated settlement data available.</td>
                      </tr>
                    ) : (
                      settlementRows.map((row) => (
                        <tr key={row.person} className="hover:bg-slate-50">
                          <td className="px-4 py-4 text-slate-900 font-medium">{row.person}</td>
                          <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(row.totalPaid)}</td>
                          <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(row.totalShare)}</td>
                          <td className="px-4 py-4 text-right text-emerald-600">{formatCurrency(row.amountToReceive)}</td>
                          <td className="px-4 py-4 text-right text-rose-600">{formatCurrency(row.amountToPay)}</td>
                          <td className={`px-4 py-4 text-right font-semibold ${row.netBalance > 0 ? 'text-emerald-600' : row.netBalance < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {formatCurrency(row.netBalance)}
                          </td>
                          <td className="px-4 py-4 text-slate-700">{row.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
                      {simplifiedTransactions.map((txn) => {
                        const txnKey = `${txn.from}-${txn.to}`;
                        const inputValue = paymentInputs[txnKey] ?? txn.amount;
                        const numericInput = Number(inputValue) || 0;
                        const isProcessing = settlingTxnKey === txnKey;
                        const disableSettle = isProcessing || loading || txn.amount <= 0 || numericInput <= 0 || numericInput > txn.amount;

                        return (
                          <div key={txnKey} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:shadow-lg">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm text-slate-500">{txn.from} pays {txn.to}</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(txn.amount)}</p>
                              </div>
                              <div className="flex flex-col gap-3 sm:w-1/2">
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={inputValue}
                                  onChange={(e) => handlePaymentAmountChange(txnKey, e.target.value)}
                                  disabled={loading || isProcessing}
                                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                                <GradientButton
                                  type="button"
                                  disabled={disableSettle}
                                  onClick={() => handleSettlePayment(txn.from, txn.to, txn.amount, txnKey)}
                                  className="bg-slate-950 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isProcessing ? (
                                    <span className="inline-flex items-center gap-2">
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                      Settling...
                                    </span>
                                  ) : 'Settle payment'}
                                </GradientButton>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">Payment history</h3>
                      <p className="mt-2 text-sm text-slate-500">Recent settlement activity recorded in MongoDB.</p>
                    </div>
                  </div>
                  {paymentHistory.length === 0 ? (
                    <div className="mt-6 rounded-[24px] bg-slate-50 p-6 text-slate-500">No payments have been recorded yet.</div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {paymentHistory.map((entry) => (
                        <div key={`${entry.settlementId}-${entry.paymentDate}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-slate-500">{entry.paidBy} paid {entry.paidTo}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(entry.paidAmount)}</p>
                            </div>
                            <div className="text-right text-sm text-slate-500">
                              <p>{new Date(entry.paymentDate).toLocaleString()}</p>
                              <p className="mt-1">Remaining: {formatCurrency(entry.remainingAmount)}</p>
                            </div>
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
                          <p className="text-lg font-semibold text-cyan-300">{formatCurrency(person.amountToPay)}</p>
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
