import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="grid min-h-[calc(100vh-80px)] place-items-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.32em] text-rose-500">Unauthorized</p>
        <h1 className="mt-6 text-5xl font-semibold text-slate-950">403</h1>
        <p className="mt-4 text-xl text-slate-700">You do not have permission to access this admin panel.</p>
        <p className="mt-4 text-slate-500">Please sign in with an admin account or return to the regular dashboard.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/admin/login"
            className="inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Admin login
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
