import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import PremiumCard from '../components/PremiumCard';
import StatsCard from '../components/StatsCard';
import GradientButton from '../components/GradientButton';
import GlassContainer from '../components/GlassContainer';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiActivity, FiFileText } from 'react-icons/fi';

function AddExpense() {
  const { isAdmin } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: [],
    category: 'Food',
    splitType: 'equal',
    splitDetails: {},
    groupId: ''
  });
  const [splitInput, setSplitInput] = useState('');
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAllData, setClearingAllData] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setExpenseData((prev) => ({ ...prev, groupId: selectedGroup }));
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      const groupsData = res.data || [];
      setGroups(groupsData);
      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0]._id);
      }
    } catch (error) {
      console.error(error);
      setError('Unable to load groups. Please try again.');
    }
  };

  const handleChange = (e) => {
    setExpenseData({
      ...expenseData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSplitPerson = () => {
    const person = splitInput.trim();
    if (!person) return;

    setExpenseData((prev) => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(person) ? prev.splitAmong : [...prev.splitAmong, person]
    }));
    setSplitInput('');
  };

  const handleRemoveSplitPerson = (index) => {
    setExpenseData((prev) => {
      const newSplitAmong = prev.splitAmong.filter((_, i) => i !== index);
      const newSplitDetails = { ...prev.splitDetails };
      delete newSplitDetails[prev.splitAmong[index]];

      return {
        ...prev,
        splitAmong: newSplitAmong,
        splitDetails: newSplitDetails
      };
    });
  };

  const calculateSplits = () => {
    const amount = parseFloat(expenseData.amount) || 0;
    const people = expenseData.splitAmong;

    if (expenseData.splitType === 'equal' && people.length > 0) {
      const each = amount / people.length;
      return people.reduce((acc, person) => ({ ...acc, [person]: each }), {});
    }

    return expenseData.splitDetails;
  };

  const handleClearGroup = () => {
    setSelectedGroup('');
    setExpenseData({
      description: '',
      amount: '',
      paidBy: '',
      splitAmong: [],
      category: 'Food',
      splitType: 'equal',
      splitDetails: {},
      groupId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedGroup) {
      setError('Please select a group first.');
      return;
    }

    if (!expenseData.description || !expenseData.amount || !expenseData.paidBy) {
      setError('Please fill all required fields.');
      return;
    }

    if (expenseData.splitAmong.length === 0) {
      setError('Please add at least one person to split with.');
      return;
    }

    if (expenseData.splitType !== 'equal') {
      const hasAllDetails = expenseData.splitAmong.every(
        (person) => expenseData.splitDetails[person] && expenseData.splitDetails[person] > 0
      );
      if (!hasAllDetails) {
        setError('Please fill split details for all people.');
        return;
      }
    }

    try {
      const splits = calculateSplits();
      const submitData = {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        splits
      };

      const response = await api.post('/expenses/add', submitData);
      if (response?.data?.success === true) {
        setToast({ message: 'Expenses added', type: 'success' });
        setError('');
        setExpenseData({
          description: '',
          amount: '',
          paidBy: '',
          splitAmong: [],
          category: 'Food',
          splitType: 'equal',
          splitDetails: {},
          groupId: selectedGroup
        });
        setReceipt(null);
      } else {
        setError(response?.data?.message || 'Unable to add expense. Please try again.');
      }
    } catch (error) {
      console.error('Expense submission error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Error adding expense. Please try again.');
    }
  };

  const handleClearAllGroupData = async () => {
    try {
      setClearingAllData(true);
      const res = await api.delete('/groups/admin/clear-all');
      if (res.data.success) {
        setGroups([]);
        setSelectedGroup('');
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

  const totalAmount = expenseData.amount ? parseFloat(expenseData.amount) : 0;
  const splitCount = expenseData.splitAmong.length;
  const equalShare = splitCount > 0 ? (totalAmount / splitCount).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
          <PremiumCard className="p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/95 text-white fade-in">
            <div className="flex flex-col gap-4">
              <div className="inline-flex rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
                Expense control
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight">Add expenses with precision and clarity.</h1>
                <p className="max-w-2xl text-slate-300 leading-8">
                  A calm workspace for recording group spend, choosing split types, and previewing shares before submitting.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatsCard
                  title="Groups"
                  value={groups.length}
                  description="Available groups ready for expense entry."
                  icon={<FiUsers className="h-5 w-5" />}
                />
                <StatsCard
                  title="Split count"
                  value={splitCount || '0'}
                  description="People added to the current expense."
                  icon={<FiActivity className="h-5 w-5" />}
                />
              </div>
            </div>
          </PremiumCard>

          <div className="space-y-4">
            <PremiumCard className="p-6 fade-in">
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400/15 text-cyan-200">
                  <FiFileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Quick overview</p>
                  <p className="mt-2 text-xl font-semibold">Start fast with the right group.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[24px] bg-white/5 p-4 text-slate-300 ring-1 ring-white/10">Choose a group and capture the payment details cleanly.</div>
                <div className="rounded-[24px] bg-white/5 p-4 text-slate-300 ring-1 ring-white/10">Save receipts, split options, and notes in one place.</div>
              </div>
            </PremiumCard>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.95fr]">
          <GlassContainer className="p-8 fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Add Expense</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Record spend in a premium layout.</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setExpenseData({
                      description: '',
                      amount: '',
                      paidBy: '',
                      splitAmong: [],
                      category: 'Food',
                      splitType: 'equal',
                      splitDetails: {},
                      groupId: selectedGroup
                    });
                    setSplitInput('');
                    setError('');
                  }}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset form
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowClearAllModal(true)}
                    className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {clearingAllData ? 'Clearing...' : 'Admin Clear All'}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-[28px] bg-rose-50 px-5 py-4 text-sm text-rose-700 ring-1 ring-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Select group</label>
                  <div className="flex gap-3">
                    <select
                      className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      {groups.length > 0 ? (
                        groups.map((group) => (
                          <option key={group._id} value={group._id}>{group.groupName}</option>
                        ))
                      ) : (
                        <option value="">No groups available</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={handleClearGroup}
                      className="rounded-full border border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Paid By</label>
                  <input
                    type="text"
                    name="paidBy"
                    className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="Name of payer"
                    value={expenseData.paidBy}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="Dinner at the cafe"
                    value={expenseData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="₹0.00"
                    value={expenseData.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Category</label>
                  <select
                    name="category"
                    className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    value={expenseData.category}
                    onChange={handleChange}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Accommodation</option>
                    <option>Utilities</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Split Type</label>
                  <select
                    name="splitType"
                    className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    value={expenseData.splitType}
                    onChange={handleChange}
                  >
                    <option value="equal">Equal Split</option>
                    <option value="exact">Exact Amount</option>
                    <option value="percentage">Percentage</option>
                    <option value="shares">Shares</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Split Among</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    className="flex-1 rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="Add person name"
                    value={splitInput}
                    onChange={(e) => setSplitInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSplitPerson())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSplitPerson}
                    className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {expenseData.splitAmong.map((person, index) => (
                    <span key={index} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm">
                      {person}
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitPerson(index)}
                        className="rounded-full bg-slate-900 px-2 text-white transition hover:bg-slate-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Preview</p>
                  <p className="mt-4 text-slate-700">Total amount</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">₹{totalAmount.toFixed(2)}</p>
                  <p className="mt-4 text-slate-500">People</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{splitCount}</p>
                  {expenseData.splitType === 'equal' && (
                    <p className="mt-4 text-slate-600">Each pays: ₹{equalShare}</p>
                  )}
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Receipt & group</p>
                  <p className="mt-4 text-slate-700">Receipt file</p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                    Upload receipt
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="mt-2 text-slate-500">{receipt ? receipt.name : 'No file selected'}</p>
                  <div className="mt-6 rounded-[24px] bg-slate-950/95 p-5 text-white">
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Group</p>
                    <p className="mt-3 text-lg font-semibold">{groups.find((group) => group._id === selectedGroup)?.groupName || 'Not selected'}</p>
                  </div>
                </div>
              </div>

              <GradientButton type="submit" className="w-full">
                Add Expense
              </GradientButton>
            </form>
          </GlassContainer>

          <div className="space-y-6">
            <PremiumCard className="p-6 fade-in">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Expense intelligence</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Stay in control</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] bg-white/5 p-4 text-slate-300 ring-1 ring-white/10">
                  Use split types for equal, exact, or percentage payback modes.
                </div>
                <div className="rounded-[24px] bg-white/5 p-4 text-slate-300 ring-1 ring-white/10">
                  Review each person’s share before submitting to reduce settlement friction.
                </div>
              </div>
            </PremiumCard>
          </div>
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

export default AddExpense;
