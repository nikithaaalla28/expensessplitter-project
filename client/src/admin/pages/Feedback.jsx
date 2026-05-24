import React, { useState, useEffect, useCallback } from 'react';
import { FiMessageCircle, FiSend, FiTrash2, FiEye, FiCheckCircle } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  fetchAdminFeedback,
  replyAdminFeedback,
  updateAdminFeedbackStatus,
  deleteAdminFeedback
} from '../api/adminApi';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const normalizeStatus = (value) => {
  if (!value) return 'Pending';
  const formatted = String(value).trim();
  if (formatted === 'Open' || formatted === 'Pending') return 'Pending';
  if (formatted === 'Replied' || formatted === 'In Review') return 'Replied';
  if (formatted === 'Resolved') return 'Resolved';
  return formatted;
};

const Feedback = () => {
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadFeedback = useCallback(async () => {
    try {
      const res = await fetchAdminFeedback();
      const list = Array.isArray(res.data)
        ? res.data.map((item) => ({
            id: item._id || item.id,
            user: item.userName || item.email || 'Anonymous',
            category: item.category || 'General',
            message: item.message || '',
            status: normalizeStatus(item.status),
            date: formatDateTime(item.createdAt),
            response: item.response || '',
            createdAt: item.createdAt
          }))
        : [];
      setFeedback(list);
      setError('');
    } catch (err) {
      console.error('Unable to load feedback:', err);
      setError('Unable to load feedback.');
      showToast('Unable to load feedback.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
    const interval = setInterval(loadFeedback, 10000);
    return () => clearInterval(interval);
  }, [loadFeedback]);

  const filteredItems = feedback.filter((item) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return [item.user, item.message, item.category, item.status, item.date]
      .join(' ')
      .toLowerCase()
      .includes(normalized);
  });

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setDetailsItem(item);
    setReply('');
  };

  const handleSendResponse = async (event) => {
    event.preventDefault();
    if (!selectedItem) {
      showToast('Please select a feedback item to reply.', 'error');
      return;
    }
    if (!reply.trim()) {
      showToast('Please enter a reply message.', 'error');
      return;
    }

    setProcessing(true);
    try {
      const response = await replyAdminFeedback({ feedbackId: selectedItem.id, adminMessage: reply.trim() });
      const updatedFeedback = response?.data?.feedback;
      if (updatedFeedback) {
        setFeedback((prev) => prev.map((item) => (item.id === updatedFeedback._id ? {
          ...item,
          status: normalizeStatus(updatedFeedback.status),
          response: updatedFeedback.response || reply.trim()
        } : item)));
        setSelectedItem((prev) => prev && prev.id === updatedFeedback._id ? {
          ...prev,
          status: normalizeStatus(updatedFeedback.status),
          response: updatedFeedback.response || reply.trim()
        } : prev);
        setDetailsItem((prev) => prev && prev.id === updatedFeedback._id ? {
          ...prev,
          status: normalizeStatus(updatedFeedback.status),
          response: updatedFeedback.response || reply.trim()
        } : prev);
      }
      setReply('');
      showToast('Reply sent successfully. Status updated to Replied.');
    } catch (err) {
      console.error('Failed to send reply:', err);
      const message = err?.response?.data?.message || 'Failed to send reply';
      showToast(message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkResolved = async (item) => {
    setProcessing(true);
    try {
      const response = await updateAdminFeedbackStatus(item.id, { status: 'Resolved' });
      const updated = response?.data?.feedback;
      if (updated) {
        setFeedback((prev) => prev.map((row) => (row.id === updated._id ? {
          ...row,
          status: normalizeStatus(updated.status)
        } : row)));
        if (selectedItem?.id === updated._id) {
          setSelectedItem((prev) => ({ ...prev, status: normalizeStatus(updated.status) }));
        }
        if (detailsItem?.id === updated._id) {
          setDetailsItem((prev) => ({ ...prev, status: normalizeStatus(updated.status) }));
        }
      }
      showToast('Feedback marked as Resolved.');
    } catch (err) {
      console.error('Unable to mark resolved:', err);
      const message = err?.response?.data?.message || 'Unable to update feedback status';
      showToast(message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await deleteAdminFeedback(deleteTarget.id);
      setFeedback((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (selectedItem?.id === deleteTarget.id) setSelectedItem(null);
      if (detailsItem?.id === deleteTarget.id) setDetailsItem(null);
      showToast('Feedback deleted successfully.');
    } catch (err) {
      console.error('Unable to delete feedback:', err);
      const message = err?.response?.data?.message || 'Unable to delete feedback';
      showToast(message, 'error');
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Feedback management</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">User insights</h2>
          </div>
          <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search feedback by user, type, status or date" />
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {error && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {filteredItems.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
              <p className="text-lg font-semibold">No feedback found</p>
              <p className="mt-2 text-sm">Adjust the search or wait for new submissions to appear.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:border-cyan-200">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.user}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.category}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{item.date}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="inline-flex items-center gap-2 rounded-3xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
                    >
                      <FiMessageCircle className="h-4 w-4" /> Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailsItem(item)}
                      className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200"
                    >
                      <FiEye className="h-4 w-4" /> Details
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-slate-600">{item.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleMarkResolved(item)}
                    disabled={processing || item.status === 'Resolved'}
                    className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${item.status === 'Resolved' ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                  >
                    <FiCheckCircle className="h-4 w-4" /> Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    disabled={processing}
                    className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                  >
                    <FiTrash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Reply panel</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Send feedback response</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Interactive</span>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSendResponse}>
            <div>
              <label className="text-sm font-semibold text-slate-700">Selected user</label>
              <input
                type="text"
                readOnly
                value={selectedItem?.user || 'Choose a feedback item'}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Feedback type</label>
              <input
                type="text"
                readOnly
                value={selectedItem?.category || 'N/A'}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Message</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={5}
                placeholder="Write your reply..."
                disabled={!selectedItem || processing}
                className="mt-2 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedItem || processing}
              className={`inline-flex items-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${!selectedItem || processing ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-950 hover:bg-slate-800'}`}
            >
              <FiSend className="h-4 w-4" /> {processing ? 'Sending...' : 'Send reply'}
            </button>
          </form>
        </div>
      </div>

      {detailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Feedback details</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{detailsItem.user}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsItem(null)}
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Category</p>
                <p className="mt-2 text-slate-900">{detailsItem.category}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Status</p>
                <p className="mt-2 text-slate-900">{detailsItem.status}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 sm:col-span-2">
                <p className="text-sm font-semibold text-slate-700">Submitted</p>
                <p className="mt-2 text-slate-900">{detailsItem.date}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Message</p>
                <p className="mt-2 text-slate-600 whitespace-pre-wrap">{detailsItem.message}</p>
              </div>
              {detailsItem.response && (
                <div className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50 p-5">
                  <p className="text-sm font-semibold text-slate-700">Admin reply</p>
                  <p className="mt-2 text-slate-600 whitespace-pre-wrap">{detailsItem.response}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete feedback"
        message="Are you sure you want to delete this feedback entry? This cannot be undone."
        onConfirm={handleDeleteFeedback}
        onCancel={() => setDeleteTarget(null)}
        isLoading={processing}
        isDangerous
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Feedback;
