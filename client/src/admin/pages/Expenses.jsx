import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { fetchAdminExpenses, deleteAdminExpense } from '../api/adminApi';

const Expenses = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const initialLoadRef = useRef(true);
  const itemsPerPage = 10;

  const columns = useMemo(
    () => [
      { key: 'title', label: 'Expense' },
      { key: 'amount', label: 'Amount', render: (row) => `₹${row.amount.toLocaleString()}` },
      { key: 'paidBy', label: 'Paid by' },
      { key: 'group', label: 'Group' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
    ],
    []
  );

  const loadExpenses = useCallback(async () => {
    try {
      if (initialLoadRef.current) {
        setLoading(true);
      }
      setFetching(true);
      const response = await fetchAdminExpenses({
        search: debouncedQuery.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage
      });

      const expensesData = (response.data.items || []).map((expense) => ({
        id: expense.id,
        title: expense.title || expense.description,
        amount: expense.amount || 0,
        paidBy: expense.paidBy || 'Unknown',
        group: expense.group || 'Unknown Group',
        date: expense.date ? new Date(expense.date).toLocaleDateString() : 'Unknown',
        category: expense.category || 'Other',
        status: expense.status || 'Recorded'
      }));

      setExpenses(expensesData);
      setTotalPages(response.data.totalPages || 1);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load expenses. Please try again.');
      setToast({ message: 'Unable to fetch expenses.', type: 'error' });
    } finally {
      setLoading(false);
      setFetching(false);
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      }
    }
  }, [debouncedQuery, currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const openDeleteModal = (expense) => {
    setDeleteTarget(expense);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteExpense = async () => {
    if (!deleteTarget?.id) return;
    const targetId = deleteTarget.id;
    const shouldMovePageBack = expenses.length === 1 && currentPage > 1;

    try {
      setActionLoading(true);
      setExpenses((prev) => prev.filter((item) => item.id !== targetId));
      await deleteAdminExpense(targetId);

      setToast({ message: 'Expense deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
      setDeleteTarget(null);

      if (shouldMovePageBack) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else {
        await loadExpenses();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Unable to delete expense.', type: 'error' });
      await loadExpenses();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Expense management</p>
            <div className="flex items-center gap-3">
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Expense history</h2>
              {fetching && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Updating...
                </span>
              )}
            </div>
          </div>
          <SearchBar value={query} onChange={handleSearchChange} placeholder="Search expenses, groups, users, amount or date" />
        </div>
      </div>

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
          <p className="text-lg font-semibold">{query.trim() ? 'No matching expenses found' : 'No expenses available'}</p>
          <p className="mt-2 text-sm">
            {query.trim()
              ? 'Try a different search term or clear the search to view all expenses.'
              : 'Create or sync expenses in the app to see them appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={expenses}
            renderRowActions={(row) => (
              <button
                onClick={() => openDeleteModal(row)}
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center rounded-3xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 disabled:opacity-50"
              >
                <FiTrash2 className="mr-2 h-4 w-4" /> Delete
              </button>
            )}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete expense"
        message="Are you sure you want to delete this expense?"
        confirmLabel="Delete expense"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleDeleteExpense}
        onCancel={closeDeleteModal}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Expenses;
