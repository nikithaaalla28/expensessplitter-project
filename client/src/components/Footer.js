import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiGithub, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950/5 px-6 py-12 text-slate-700 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">ES</div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Expenses Splitter</p>
              <p className="text-sm text-slate-500">Modern group expense management.</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-500">
            Split bills, track balances, and settle payments with confidence. Bring your friends, family, and travel groups together on one shared app.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick links</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
              <Link to="/" className="transition hover:text-slate-900">Home</Link>
              <Link to="/login" className="transition hover:text-slate-900">Login</Link>
              <Link to="/register" className="transition hover:text-slate-900">Register</Link>
              <Link to="/dashboard" className="transition hover:text-slate-900">Dashboard</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Connect</p>
            <div className="mt-4 flex items-center gap-4 text-slate-600">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-slate-900"><FiGithub className="h-5 w-5" /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="transition hover:text-slate-900"><FiTwitter className="h-5 w-5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-slate-900"><FiInstagram className="h-5 w-5" /></a>
              <a href="mailto:hello@expensessplitter.com" className="transition hover:text-slate-900"><FiMail className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200/80 pt-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Expenses Splitter. Crafted for smarter expense sharing.
      </div>
    </footer>
  );
}
