import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

const AdminLogin = () => {
  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('nikithaaalla0628@gmail.com');
  const [password, setPassword] = useState('nikitha12');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginAdmin({ email, password }, remember);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-10 rounded-[2rem] bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-12">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-500">Admin portal</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Expense admin login</h1>
            <p className="text-slate-500">Secure access to analytics, settlements, and user management for your expense splitter app.</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative rounded-3xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400">
                  <FiMail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nikithaaalla0628@gmail.com"
                    className="w-full border-none bg-transparent pl-11 text-sm text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative rounded-3xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400">
                  <FiLock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-none bg-transparent pl-11 pr-10 text-sm text-slate-900 outline-none"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  Remember me
                </label>
                <button type="button" className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-500">Forgot password?</button>
              </div>

              {error && <p className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in as admin'}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden w-1/2 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-white to-indigo-200/50 p-8 shadow-xl shadow-slate-200/50 lg:block">
          <div className="space-y-6">
            <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700">Secure admin panel</div>
            <h2 className="text-3xl font-semibold text-slate-900">Control settlements, users, groups, and reports from one premium experience.</h2>
            <p className="text-slate-600 leading-7">A responsive admin console built with clean SaaS design, modern glass cards, and crisp dashboard analytics.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white/80 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Quick analytics</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">Monthly insights</p>
              </div>
              <div className="rounded-3xl bg-white/80 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Management</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">Users & groups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
