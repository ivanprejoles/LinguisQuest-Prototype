
import type { ReactNode } from "react";

type ErrorMessageProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  className?: string;
};

export default function ErrorMessage({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = "",
}: ErrorMessageProps) {
  const showAction = Boolean(actionLabel && onAction);

  return (
    <div
      role="alert"
      className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-red-800">
            {title}
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {description}
          </p>

          {showAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {actionIcon}
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
