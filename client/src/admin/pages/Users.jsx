import React, { useState, useEffect, useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { fetchAdminUsers, updateAdminUser, deleteAdminUser } from '../api/adminApi';

const roleOptions = ['user', 'admin'];
const statusOptions = ['Active', 'Inactive'];

const Users = () => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', status: 'Active' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const usersPerPage = 5;

  // Filter users based on search query (case-insensitive)
  const filteredUsers = useMemo(() => {
    if (!query.trim()) return allUsers;
    const lowerQuery = query.toLowerCase().trim();
    return allUsers.filter((user) => {
      const nameMatch = (user.name || '').toLowerCase().includes(lowerQuery);
      const emailMatch = (user.email || '').toLowerCase().includes(lowerQuery);
      const idMatch = (user.id || '').toLowerCase().includes(lowerQuery);
      return nameMatch || emailMatch || idMatch;
    });
  }, [allUsers, query]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIdx, startIdx + usersPerPage);
  }, [filteredUsers, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminUsers({ page: 1, limit: 1000 });
      const usersData = (response.data.items || []).map((user) => ({
        id: user.id || user._id,
        name: user.name || 'Unknown',
        email: user.email || '',
        role: user.role || 'user',
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
        status: user.status || 'Active'
      }));
      setAllUsers(usersData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load users. Please try again.');
      setToast({ message: 'Unable to fetch users.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (actionLoading) return;
    setEditModalOpen(false);
    setSelectedUser(null);
    setEditForm({ name: '', email: '', role: 'user', status: 'Active' });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await updateAdminUser(selectedUser.id, editForm);
      setAllUsers((prevUsers) => prevUsers.map((user) => (user.id === selectedUser.id ? {
        ...user,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        status: response.data.user.status
      } : user)));
      setToast({ message: 'User updated successfully.', type: 'success' });
      closeEditModal();
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Unable to update user.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      await deleteAdminUser(deleteTarget.id);
      setAllUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
      setToast({ message: 'User deleted successfully.', type: 'success' });
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Unable to delete user.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'joined', label: 'Joined' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">User management</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Manage your users</h2>
          </div>
          <SearchBar value={query} onChange={handleQueryChange} placeholder="Search users (name, email, ID)" />
        </div>
      </div>

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {paginatedUsers.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-300">
          <p className="text-lg font-semibold">No users found</p>
          <p className="mt-2 text-sm">Try a different search or update filters to view available users.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={paginatedUsers}
            renderRowActions={(row) => (
              <div className="flex items-center justify-end gap-3 text-slate-600">
                <button
                  onClick={() => openEditModal(row)}
                  disabled={actionLoading}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-slate-100 transition hover:bg-slate-200 disabled:opacity-50"
                  title="Edit user"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(row)}
                  disabled={actionLoading}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-rose-100 text-rose-700 transition hover:bg-rose-200 disabled:opacity-50"
                  title="Delete user"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 py-10">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Edit user</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update user details and role access.</p>
              </div>
              <button
                onClick={closeEditModal}
                disabled={actionLoading}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                Email
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                Role
                <select
                  value={editForm.role}
                  onChange={(e) => handleEditChange('role', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                Status
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleUpdateUser}
                disabled={actionLoading}
                className="inline-flex min-w-[160px] items-center justify-center rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={closeEditModal}
                disabled={actionLoading}
                className="inline-flex min-w-[160px] items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete user"
        message={`Are you sure you want to delete ${deleteTarget?.name || 'this user'}? This action cannot be undone.`}
        confirmLabel="Delete user"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleDeleteUser}
        onCancel={closeDeleteModal}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Users;
