export default function GlassContainer({ children, className = '' }) {
  return (
    <div className={`glass-panel rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}
