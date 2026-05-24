import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiBell, FiCreditCard, FiHome, FiLayers, FiLogOut, FiMessageCircle, FiRefreshCw, FiSettings, FiUsers } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
  { label: 'Users', path: '/admin/users', icon: FiUsers },
  { label: 'Groups', path: '/admin/groups', icon: FiLayers },
  { label: 'Expenses', path: '/admin/expenses', icon: FiCreditCard },
  { label: 'Settlements', path: '/admin/settlements', icon: FiRefreshCw },
  { label: 'Reports', path: '/admin/reports', icon: FiBarChart2 },
  { label: 'Notifications', path: '/admin/notifications', icon: FiBell },
  { label: 'Feedback', path: '/admin/feedback', icon: FiMessageCircle },
  { label: 'Settings', path: '/admin/settings', icon: FiSettings },
  { label: 'Activity Logs', path: '/admin/activity-logs', icon: FiActivity }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { adminUser, logoutAdmin } = useAdminAuth();

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950/95 shadow-2xl shadow-slate-900/40 transition duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex h-full flex-col px-6 pb-6 pt-8 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin</p>
            <h2 className="mt-2 text-2xl font-semibold">SpendVault</h2>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className="hidden items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 lg:flex"
            >
              Go to Main Website
            </NavLink>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-300 transition hover:bg-white/15 lg:hidden"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
                }
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-auto rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-slate-950/20">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin profile</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-200">A</div>
            <div>
              <p className="text-sm font-semibold text-white">{adminUser?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-400">{adminUser?.email || 'nikithaaalla0628@gmail.com'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logoutAdmin}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiLogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
