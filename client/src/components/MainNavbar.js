import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const navLinks = [
  { label: 'Login', to: '/login', filled: false },
  { label: 'Admin', to: '/admin/login', filled: false },
  { label: 'Register', to: '/register', filled: true }
];

export default function MainNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
        <Link to="/" className="flex items-center gap-3 rounded-3xl bg-white/80 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-xl font-semibold text-white shadow-inner shadow-slate-900/20">
            ES
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Expenses Splitter</p>
            <p className="text-xs text-slate-500">Smart spend sharing</p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold transition ${
                item.filled
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-900/5 md:hidden"
        >
          {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden bg-white/95 transition-all duration-300 ${
          isOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2 px-6 pb-6 pt-3">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
