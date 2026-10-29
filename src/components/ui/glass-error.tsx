import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { GlassPanel } from "./glass-panel";

type GlassErrorAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

type GlassErrorProps = {
  title?: string;
  description: ReactNode;
  icon?: ReactNode;
  primaryAction?: GlassErrorAction;
  secondaryAction?: GlassErrorAction;
  className?: string;
};

const actionBaseClasses =
  "inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-3 text-sm font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182A] disabled:cursor-not-allowed disabled:opacity-50";

const actionVariantClasses = {
  primary:
    "border-amber-200/30 bg-gradient-to-r from-amber-400 to-amber-500 text-[#211708] shadow-lg shadow-amber-950/20 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400",
  secondary:
    "border-white/15 bg-white/[0.06] text-slate-100 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12]",
};

export function GlassError({
  title = "Something went wrong",
  description,
  icon,
  primaryAction,
  secondaryAction,
  className = "",
}: GlassErrorProps) {
  const actions = [
    primaryAction
      ? { ...primaryAction, variant: primaryAction.variant ?? "primary" as const }
      : undefined,
    secondaryAction
      ? {
          ...secondaryAction,
          variant: secondaryAction.variant ?? "secondary" as const,
        }
      : undefined,
  ].filter((action) => action !== undefined);

  return (
    <div
      className={`mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-20 text-center ${className}`}
      role="alert"
    >
      <GlassPanel className="flex h-20 w-20 items-center justify-center rounded-2xl">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-amber-300/[0.04]"
        />
        <span className="relative text-amber-200">
          {icon ?? <CircleHelp className="h-12 w-12" />}
        </span>
      </GlassPanel>

      <h2 className="text-xl font-black tracking-tight text-white">
        {title}
      </h2>

      <div className="max-w-sm text-sm leading-6 text-slate-300">
        {description}
      </div>

      {actions.length > 0 && (
        <div className="mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {actions.map((action, index) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`${actionBaseClasses} ${
                actionVariantClasses[action.variant]
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
