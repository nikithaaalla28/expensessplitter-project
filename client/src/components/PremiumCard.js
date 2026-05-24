export default function PremiumCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-[32px] border border-slate-800/70 bg-slate-950/95 shadow-[0_35px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl text-white transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}
