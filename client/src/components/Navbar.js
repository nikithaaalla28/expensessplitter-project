import { NavLink, Link } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', theme: 'dashboard' },
  { label: 'Create Group', to: '/create-group', theme: 'create-group' },
  { label: 'Settlements', to: '/settlement', theme: 'settlements' },
  { label: 'Add Expense', to: '/add-expense', theme: 'add-expense' }
];

function Navbar() {
  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6">
      <nav className="flex flex-col gap-4 rounded-[2rem] bg-white/90 border border-slate-200/70 px-5 py-4 shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-[1.75rem] bg-slate-950 px-4 py-3 text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400 text-xl font-semibold text-slate-950">
            ES
          </div>
          <div className="space-y-1 text-left">
            <p className="text-base font-semibold">Expenses Splitter</p>
            <p className="text-xs text-slate-300">Premium expense sharing</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 ${
                  isActive ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;