import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) return;

    const result = await login({ email, password }, remember);
    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.14),transparent_24%),#f8fbff] text-slate-950">
      <MainNavbar />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-8 rounded-[2rem] bg-white/90 p-10 shadow-[0_35px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Welcome back</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Secure login for your expenses.</h1>
            <p className="max-w-xl text-base leading-8 text-slate-600">
              Login to manage your groups, track every shared bill, and settle balances with confidence.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Fast insights</p>
              <p className="mt-4 text-xl font-semibold text-slate-900">Group dashboards</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Smart settle</p>
              <p className="mt-4 text-xl font-semibold text-slate-900">Automated recommendations</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white/95 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-10">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Login</p>
            <h2 className="text-3xl font-semibold text-slate-950">Access your account</h2>
            <p className="text-sm leading-7 text-slate-600">Enter your login details to continue to your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <p className="rounded-3xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            )}
            {error && (
              <p className="rounded-3xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}
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
                  placeholder="Enter password"
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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                Remember me
              </label>
              <button type="button" className="text-sm font-semibold text-slate-900 transition hover:text-slate-700">Forgot password?</button>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
            >
              Login
            </button>

            <p className="text-center text-sm text-slate-600">
              Don’t have an account?{' '}
              <Link to="/register" className="font-semibold text-slate-900 transition hover:text-slate-700">
                Register
              </Link>
            </p>
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
}
