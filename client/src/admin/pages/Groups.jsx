import React, { useState, useEffect, useMemo } from 'react';
import { FiTrash2, FiEye, FiX } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../../components/ConfirmationModal';
import { fetchAdminGroups, fetchAdminGroup, deleteAdminGroup } from '../api/adminApi';

const Groups = () => {
  const [query, setQuery] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const limit = 8;

  // Filter groups based on search query (case-insensitive)
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return allGroups;
    const lowerQuery = query.toLowerCase().trim();
    return allGroups.filter((group) => {
      const nameMatch = (group.name || '').toLowerCase().includes(lowerQuery);
      const createdByMatch = (group.createdBy || '').toLowerCase().includes(lowerQuery);
      const idMatch = (group.id || '').toLowerCase().includes(lowerQuery);
      return nameMatch || createdByMatch || idMatch;
    });
  }, [allGroups, query]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredGroups.length / limit) || 1;
  const paginatedGroups = useMemo(() => {
    const startIdx = (currentPage - 1) * limit;
    return filteredGroups.slice(startIdx, startIdx + limit);
  }, [filteredGroups, currentPage]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminGroups({ page: 1, limit: 1000 });
      const groupsData = (response.data.data || []).map((group) => ({
        id: group._id || group.id,
        name: group.groupName || group.name,
        createdBy: group.createdBy || 'Unknown',
        members: Array.isArray(group.members) ? group.members.length : group.members || 0,
        created: group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Unknown',
        status: group.status || 'Active',
        totalExpense: group.totalExpense || 0
      }));
      setAllGroups(groupsData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleSearch = (event) => {
    setQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleViewGroup = async (id) => {
    try {
      setDetailLoading(true);
      const response = await fetchAdminGroup(id);
      const { group, expenseCount, expenseTotal, settlementCount, settlementTotal, recentExpenses } = response.data;
      setSelectedGroup({
        id: group._id || group.id,
        name: group.groupName || group.name,
        members: Array.isArray(group.members) ? group.members : [],
        created: group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Unknown',
        status: group.status || 'Active',
        totalExpense: group.totalExpense || 0,
        expenseCount,
        expenseTotal,
        settlementCount,
        settlementTotal,
        recentExpenses: recentExpenses || []
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load group details. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeleteLoading(true);
      await deleteAdminGroup(groupToDelete.id);
      setAllGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setGroupToDelete(null);
      setSelectedGroup((prev) => (prev?.id === groupToDelete.id ? null : prev));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to delete group. Please try again.');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Group management</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Group operations</h2>
          </div>
          <SearchBar value={query} onChange={handleSearch} placeholder="Search groups (name, created by, ID)" />
        </div>
      </div>

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {paginatedGroups.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-300">
          <p className="text-lg font-semibold">No groups found</p>
          <p className="mt-2 text-sm">Adjust your search or refresh to see the latest groups.</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {paginatedGroups.map((group) => (
            <div key={group.id} className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{group.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Created {group.created}</p>
                </div>
                <StatusBadge status={group.status} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">Members: {group.members}</div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">Total: ₹{group.totalExpense.toLocaleString()}</div>
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">Status: {group.status}</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleViewGroup(group.id)}
                  className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FiEye className="h-4 w-4" /> View
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(group)}
                  className="inline-flex items-center gap-2 rounded-3xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                >
                  <FiTrash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={(page) => setCurrentPage(page)} />
      )}

      <ConfirmationModal
        isOpen={!!groupToDelete}
        title="Delete group"
        message={`Are you sure you want to delete ${groupToDelete?.name || 'this group'}? This will also remove related expenses and settlements.`}
        onConfirm={confirmDeleteGroup}
        onCancel={() => setGroupToDelete(null)}
        isLoading={isDeleteLoading}
        isDangerous
        confirmLabel="Delete"
      />

      {(detailLoading && !selectedGroup) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50">
          <Loader />
        </div>
      )}

      {selectedGroup && (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/50 p-4">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Group details</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{selectedGroup.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Group ID: {selectedGroup.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-5 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Created</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{selectedGroup.created}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-5 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Members</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{selectedGroup.members.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-5 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Expenses</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{selectedGroup.expenseCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-800 p-5 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Settlements</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{selectedGroup.settlementCount}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Total expense</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">₹{selectedGroup.expenseTotal.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Total settlement</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">₹{selectedGroup.settlementTotal.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Members</h3>
              {selectedGroup.members.length > 0 ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {selectedGroup.members.map((member) => (
                    <li key={member} className="rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
                      {member}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">This group has no members yet.</p>
              )}
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent expenses</h3>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Latest 5</span>
              </div>
              {selectedGroup.recentExpenses.length ? (
                <div className="mt-4 grid gap-3">
                  {selectedGroup.recentExpenses.map((expense) => (
                    <div key={`${expense._id}-${expense.createdAt}`} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.description}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paid by {expense.paidBy}</p>
                        </div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">₹{expense.amount.toLocaleString()}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{expense.category || 'No category'}</span>
                        <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No expenses recorded for this group yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;

