import React, { useState, useEffect, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import ActivityFeed from '../components/ActivityFeed';
import Loader from '../components/Loader';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  fetchAdminNotifications,
  createAdminNotification,
  deleteAdminNotification
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

const Notifications = () => {
  const { isAuthenticated } = useAdminAuth();
  const [announce, setAnnounce] = useState('');
  const [reminder, setReminder] = useState('');
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announceLoading, setAnnounceLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [error, setError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const loadNotifications = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await fetchAdminNotifications();
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      setError('');
    } catch (err) {
      console.error('Unable to load notifications:', err);
      setError('Unable to load notifications.');
      showToast('Unable to load notifications.', 'error');
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => loadNotifications(false), 10000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleSendAnnouncement = async (event) => {
    event.preventDefault();
    const message = announce.trim();
    if (!message) {
      setError('Please enter announcement message');
      showToast('Please enter announcement message', 'error');
      return;
    }

    setAnnounceLoading(true);
    try {
      const response = await createAdminNotification({
        title: 'Announcement',
        message,
        type: 'announcement'
      });
      const created = response?.data;
      setAnnounce('');
      showToast('Announcement sent successfully', 'success');
      if (created) {
        setNotifications((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Failed to send announcement:', err);
      const message = err?.response?.data?.message || 'Failed to send announcement';
      setError(message);
      showToast(message, 'error');
    } finally {
      setAnnounceLoading(false);
    }
  };

  const handleSendReminder = async (event) => {
    event.preventDefault();
    const message = reminder.trim();
    if (!message) {
      setError('Please enter reminder message');
      showToast('Please enter reminder message', 'error');
      return;
    }

    if (!reminderDateTime) {
      setError('Please choose a reminder date and time');
      showToast('Please choose a reminder date and time', 'error');
      return;
    }

    const scheduledDate = new Date(reminderDateTime);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      setError('Please select a future reminder date and time');
      showToast('Please select a future reminder date and time', 'error');
      return;
    }

    setReminderLoading(true);
    try {
      const response = await createAdminNotification({
        title: 'Reminder',
        message,
        type: 'reminder',
        scheduledTime: scheduledDate.toISOString()
      });
      const created = response?.data;
      setReminder('');
      setReminderDateTime('');
      showToast('Reminder scheduled successfully', 'success');
      if (created) {
        setNotifications((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Failed to schedule reminder:', err);
      const message = err?.response?.data?.message || 'Failed to schedule reminder';
      setError(message);
      showToast(message, 'error');
    } finally {
      setReminderLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteAdminNotification(id);
      setNotifications((prev) => prev.filter((notification) => (notification._id || notification.id) !== id));
      showToast('Notification deleted successfully', 'success');
    } catch (err) {
      console.error('Unable to delete notification:', err);
      const message = err?.response?.data?.message || 'Unable to delete notification';
      showToast(message, 'error');
    }
  };

  if (loading) return <Loader />;

  const notificationItems = notifications.map((notification) => {
    const createdAt = notification.createdAt;
    const scheduledTime = notification.scheduledTime;
    const sentTime = notification.sentTime;
    const timeLabel = notification.type === 'reminder'
      ? notification.status === 'Pending'
        ? `Scheduled ${formatDateTime(scheduledTime)}`
        : `Sent ${formatDateTime(sentTime || createdAt)}`
      : `Sent ${formatDateTime(sentTime || createdAt)}`;

    return {
      id: notification._id || notification.id,
      title: notification.title || (notification.type === 'reminder' ? 'Reminder' : 'Announcement'),
      description: notification.message,
      status: notification.status,
      time: timeLabel
    };
  });

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Notifications</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Announcements & reminders</h2>
          </div>
          <span className="rounded-full bg-cyan-100 dark:bg-cyan-900 px-4 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">Live channel</span>
        </div>
      </div>

      {toast.message && (
        <div className={`rounded-[2rem] border px-6 py-4 text-sm shadow-sm ${toast.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {toast.message}
        </div>
      )}

      {error && !toast.message && (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Broadcast</p>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Create an announcement</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Share a message with all active groups and users instantly.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSendAnnouncement}>
            <textarea
              value={announce}
              onChange={(e) => setAnnounce(e.target.value)}
              rows={5}
              placeholder="Write your announcement here..."
              className="w-full rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              disabled={!isAuthenticated || announceLoading}
            />
            <button
              type="submit"
              disabled={!isAuthenticated || announceLoading}
              className={`inline-flex items-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${!isAuthenticated || announceLoading ? 'cursor-not-allowed bg-slate-400' : 'bg-cyan-600 hover:bg-cyan-500'}`}
            >
              <FiSend className="h-4 w-4" />
              {announceLoading ? 'Sending...' : 'Send announcement'}
            </button>
          </form>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Reminder</p>
            <h3 className="text-2xl font-semibold text-slate-900">Schedule a reminder</h3>
            <p className="text-sm text-slate-600">Send a reminder message to users at a scheduled date and time.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSendReminder}>
            <textarea
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              rows={4}
              placeholder="Enter reminder message..."
              className="w-full rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              disabled={!isAuthenticated || reminderLoading}
            />
            <input
              type="datetime-local"
              value={reminderDateTime}
              onChange={(e) => setReminderDateTime(e.target.value)}
              className="w-full rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              disabled={!isAuthenticated || reminderLoading}
            />
            <button
              type="submit"
              disabled={!isAuthenticated || reminderLoading}
              className={`inline-flex items-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold text-white transition ${!isAuthenticated || reminderLoading ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-950 hover:bg-slate-800'}`}
            >
              <FiSend className="h-4 w-4" />
              {reminderLoading ? 'Scheduling...' : 'Send reminder'}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-400">Notification history</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Recent messages</h3>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {notificationItems.length > 0 ? (
            <ActivityFeed items={notificationItems} onDelete={handleDeleteNotification} />
          ) : (
            <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
              No notifications yet. Create an announcement or schedule a reminder to populate the history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
