import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password should be at least 8 characters.');
      return;
    }
    setError('');

    const result = await register({ fullName, email, password });
    if (!result.success) {
      setError(result.message);
      return;
    }

    // Show success message with email notification
    const successMessage =
      'Registration successful! A welcome email has been sent to your address. Please log in to continue.';
    navigate('/login', { replace: true, state: { message: successMessage, type: 'success' } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 text-slate-100">
      <MainNavbar />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="space-y-8 rounded-[2rem] bg-slate-950/95 p-10 shadow-[0_35px_120px_rgba(15,23,42,0.25)] backdrop-blur-xl">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Join the community</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Create your Expenses Splitter account.</h1>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              Register quickly and start sharing bills, tracking balances, and closing group expenses with a modern dashboard experience.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Groups</p>
              <p className="mt-4 text-xl font-semibold text-white">Organize spend in one place</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Analytics</p>
              <p className="mt-4 text-xl font-semibold text-white">Understand every shared cost</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-[0_35px_120px_rgba(15,23,42,0.18)] backdrop-blur-xl text-slate-950 md:p-10">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Sign Up</p>
            <h2 className="text-3xl font-semibold">Create your profile</h2>
            <p className="text-sm leading-7 text-slate-600">Complete the form and start splitting expenses instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Full Name
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Email
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Password
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Create password"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Confirm Password
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  placeholder="Confirm password"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {error && <p className="rounded-3xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
            >
              Sign Up
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-950 transition hover:text-slate-700">
                Log In
              </Link>
            </p>
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
}
