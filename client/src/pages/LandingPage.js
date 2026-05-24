import { Link } from 'react-router-dom';
import { FiUsers, FiCreditCard, FiRepeat, FiBarChart2 } from 'react-icons/fi';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';

const features = [
  {
    icon: FiUsers,
    title: 'Track Balances',
    description: 'See who owes what in real time with clean balance summaries and group insights.'
  },
  {
    icon: FiCreditCard,
    title: 'Organize Group Expenses',
    description: 'Add shared bills, trips, dinners, and events with ease across friends and family.'
  },
  {
    icon: FiRepeat,
    title: 'Smart Settlements',
    description: 'One-tap settlement recommendations reduce transfers and close balances faster.'
  },
  {
    icon: FiBarChart2,
    title: 'Expense Analytics',
    description: 'Visualize spend categories, top payers, and travel budgets at a glance.'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950/5 text-slate-900">
      <MainNavbar />

      <main className="relative overflow-hidden px-6 pb-20 pt-6 md:px-8 lg:pt-10">
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top_left,_rgba(30,64,175,0.18),_transparent_32%),_radial-gradient(circle_at_top_right,_rgba(79,70,229,0.12),_transparent_24%)]" />
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="space-y-8 py-6 lg:py-0">
            <span className="inline-flex rounded-full bg-slate-900/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 shadow-sm shadow-slate-900/5">
              Premium expense sharing
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Split Expenses Smartly With Friends & Family
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              “Track every expense, split every bill, and settle every balance with ease.”
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Learn More
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/90 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Family trips</p>
                <p className="mt-4 text-2xl font-semibold text-slate-900">45+</p>
                <p className="mt-2 text-sm text-slate-500">Groups already managing shared spend the easy way.</p>
              </div>
              <div className="rounded-3xl bg-slate-900 px-5 py-6 text-white shadow-2xl shadow-slate-900/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Quick settle</p>
                <p className="mt-4 text-2xl font-semibold">₹8.9k</p>
                <p className="mt-2 text-sm text-slate-300">Saved across recent trips and events.</p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-700 to-slate-950 px-6 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.2)] sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_20%)]" />
              <div className="relative space-y-6 text-white">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.32em] text-sky-300/80">Shared travel</p>
                  <h2 className="text-3xl font-semibold leading-tight">Group spend overview</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-xl">
                    <p className="text-sm text-slate-200">Total expense</p>
                    <p className="mt-3 text-2xl font-semibold">₹2,740</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-xl">
                    <p className="text-sm text-slate-200">Members</p>
                    <p className="mt-3 text-2xl font-semibold">12</p>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Next settle</span>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-100">2 days left</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-2 w-[68%] rounded-full bg-sky-400" />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-4 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
            </div>
          </section>
        </div>

        <section id="features" className="mx-auto mt-20 max-w-7xl rounded-[2rem] bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl md:p-10">
          <div className="grid gap-4 md:grid-cols-2 md:items-end md:gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">App features</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Designed for modern shared spending.</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                Expenses Splitter brings clarity to group finance with smart tools, friendly layouts, and automated settlement suggestions.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="group rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 transition group-hover:bg-slate-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
