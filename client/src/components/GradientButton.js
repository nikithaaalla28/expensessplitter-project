export default function GradientButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_60px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(56,189,248,0.2)] ${className}`}
    >
      {children}
    </button>
  );
}
