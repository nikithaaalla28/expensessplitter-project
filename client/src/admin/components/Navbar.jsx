import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiGrid, FiMoon, FiSearch, FiSun, FiArrowLeft } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../api/adminApi';

const PAGES = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Groups', path: '/admin/groups' },
  { label: 'Expenses', path: '/admin/expenses' },
  { label: 'Settlements', path: '/admin/settlements' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Notifications', path: '/admin/notifications' },
  { label: 'Feedback', path: '/admin/feedback' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'Activity Logs', path: '/admin/activity-logs' }
];

const Navbar = ({ onMenuClick }) => {
  const { adminUser, adminTheme, applyAdminTheme, logoutAdmin } = useAdminAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

 

  const handleThemeToggle = () => {
    const nextTheme = adminTheme === 'Dark' ? 'Light' : 'Dark';
    applyAdminTheme(nextTheme);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  

  // Search suggestion handlers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = PAGES.filter((p) => p.label.toLowerCase().includes(normalized));
    setSuggestions(filtered);
    setShowSuggestions(true);
    setActiveIndex(-1);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = suggestions[activeIndex] || suggestions[0];
      if (target) {
        setQuery('');
        setShowSuggestions(false);
        navigate(target.path);
      } else {
        // try exact match by label
        const exact = PAGES.find((p) => p.label.toLowerCase() === query.trim().toLowerCase());
        if (exact) navigate(exact.path);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Notifications: polling
  const loadNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await fetchAdminNotifications();
      const items = res.data?.items || [];
      setNotifications(items);
      setUnreadCount(res.data?.unreadCount || items.filter((i) => !i.isRead).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    // Load notifications initially
    loadNotifications();
    // Also refresh when notification dropdown is opened
  }, []);

  useEffect(() => {
    if (showNotif) {
      loadNotifications();
    }
  }, [showNotif]);

  const handleOpenNotification = async (item) => {
    try {
      if (!item.isRead) {
        await markNotificationRead(item._id || item.id);
        setNotifications((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      // For now navigate to related page if meta.path exists
      if (item.meta && item.meta.path) navigate(item.meta.path);
    } catch (err) {
      console.error('Error opening notification', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Unable to mark all read', err);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 dark:border-slate-700 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm shadow-slate-200 dark:shadow-slate-950">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden"
          >
            <FiGrid className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              title="Back to main dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm">Admin dashboard</div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative w-[320px]">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search pages (e.g. Users, Reports, Groups)"
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-11 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div ref={suggestionsRef} className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg transition-transform duration-150">
                  {suggestions.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No results found</div>
                  ) : (
                    suggestions.map((s, idx) => (
                      <button
                        key={s.path}
                        onMouseDown={(e) => { e.preventDefault(); navigate(s.path); setQuery(''); setShowSuggestions(false); }}
                        className={`w-full text-left px-4 py-3 text-sm ${idx === activeIndex ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {s.label}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleThemeToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {adminTheme === 'Dark' ? <FiSun className="h-5 w-5 text-amber-500" /> : <FiMoon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif((s) => !s)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                  <div className="flex items-center gap-2">
                    <button onClick={handleMarkAllRead} className="text-xs text-slate-500 dark:text-slate-400 hover:underline">Mark all as read</button>
                  </div>
                </div>
                <div className="mt-3 max-h-64 overflow-auto">
                  {notifLoading ? (
                    <div className="p-4 text-sm text-slate-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <button key={n._id} onClick={() => handleOpenNotification(n)} className={`w-full text-left px-3 py-3 text-sm ${n.isRead ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800'} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                          </div>
                          <div className="ml-2 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span className="h-8 w-8 rounded-2xl bg-cyan-500/15 text-cyan-700 grid place-items-center font-semibold">A</span>
              <span>{adminUser?.name || 'Admin'}</span>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl shadow-slate-300/10 dark:shadow-slate-950/20">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{adminUser?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{adminUser?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/settings')}
                    className="w-full rounded-3xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Account settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-3xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
