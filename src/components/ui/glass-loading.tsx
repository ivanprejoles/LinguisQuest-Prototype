import { GlassPanel } from "./glass-panel";

type GlassLoadingProps = {
  message?: string;
  minHeight?: string;
  className?: string;
};

export function GlassLoading({
  message = "Getting your adventure ready...",
  minHeight = "50vh",
  className = "",
}: GlassLoadingProps) {
  return (
    <div
      className={`flex items-center justify-center px-4 ${className}`}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <GlassPanel className="flex flex-col items-center gap-4 px-10 py-9 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
        />

        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-white/10 border-t-amber-300 border-r-amber-300/40" />
          <div className="h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(252,211,77,0.7)]" />
        </div>

        <p className="relative text-sm font-bold tracking-wide text-slate-100">
          {message}
        </p>
      </GlassPanel>
    </div>
  );
}