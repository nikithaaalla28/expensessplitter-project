import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../../components/Toast';
import Pagination from '../components/Pagination';
import { fetchAdminSettlements } from '../api/adminApi';

const Settlements = () => {
  const [search, setSearch] = useState('');
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadSettlements = async () => {
      try {
        setFetching(true);
        const response = await fetchAdminSettlements({
          search: debouncedSearch,
          page: currentPage,
          limit: itemsPerPage
        });

        const settlementsData = response.data.items.map((settlement) => ({
          id: settlement.id,
          debtor: settlement.debtor || 'Unknown',
          creditor: settlement.creditor || 'Unknown',
          amount: settlement.amount || 0,
          status: settlement.status || 'Pending',
          date: settlement.date ? new Date(settlement.date).toLocaleDateString() : 'Unknown',
          group: settlement.group || 'Unknown Group'
        }));
        setSettlements(settlementsData);
        setTotalPages(response.data.totalPages || 1);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load settlements. Please try again.');
        setToast({ message: 'Unable to fetch settlements.', type: 'error' });
      } finally {
        setLoading(false);
        setFetching(false);
      }
    };

    loadSettlements();
    const interval = setInterval(loadSettlements, 15000);
    return () => clearInterval(interval);
}, [debouncedSearch, currentPage]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const filteredSettlements = React.useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return settlements;

    return settlements.filter((item) => {
      const amountText = item.amount != null ? String(item.amount) : '';
      const dateText = item.date || '';
      const paymentText = item.paymentMethod || '';
      const descriptionText = item.description || '';
      const creditorText = item.creditor || '';
      const debtorText = item.debtor || '';
      const groupText = item.group || '';
      const statusText = item.status || '';
      const searchTarget = [
        amountText,
        debtorText,
        creditorText,
        groupText,
        statusText,
        paymentText,
        dateText,
        descriptionText
      ].join(' ').toLowerCase();

      return searchTarget.includes(normalized);
    });
  }, [search, settlements]);

  const pendingCount = filteredSettlements.filter((item) => item.status === 'Pending').length;
  const completedCount = filteredSettlements.filter((item) => item.status === 'Completed' || item.status === 'Settled').length;

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Settlement center</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Settlement workflows</h2>
          </div>
          {/* Export button removed per admin request */}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-[2rem] bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{pendingCount}</p>
          </div>
          <div className="rounded-[2rem] bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Completed</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{completedCount}</p>
          </div>
          <div className="rounded-[2rem] bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Outstanding</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{settlements.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Quick filter</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Search and review settlements</h3>
          </div>
          <div className="flex w-full items-center gap-3 lg:max-w-2xl">
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search settlements..." />
            {fetching && <span className="text-sm text-slate-400">Updating...</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          {filteredSettlements.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
              <p className="text-lg font-semibold">No settlements found</p>
            </div>
          ) : (
            filteredSettlements.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:border-cyan-200">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.debtor} owes {item.creditor}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">₹{item.amount.toLocaleString()}</p>
                    <p className="mt-2 text-sm text-slate-500">Group: {item.group}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span className="text-sm text-slate-500">{item.date}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                    Review settlement details for follow-up
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Settlements;
