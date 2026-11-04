"use client";

import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

interface BonusRoundLayoutProps {
  children: React.ReactNode;
  stageTitle?: string;

  isSubmitted: boolean;
  isAnswerCorrect: boolean;
  isSubmitting: boolean;

  onCheckAnswer: () => void;
  onContinue: () => void;
  onExit: () => void;
}

export function BonusRoundLayout({
  children,
  stageTitle,
  isSubmitted,
  isAnswerCorrect,
  isSubmitting,
  onCheckAnswer,
  onContinue,
  onExit,
}: BonusRoundLayoutProps) {
  return (
    <div className="min-h-full flex flex-col bg-transparent text-slate-800 select-none">
      {/* Bonus Header */}
      <header className="w-full max-w-2xl mx-auto px-5 sm:px-6 pt-5 sm:pt-7">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit bonus review"
            className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 rounded-full bg-amber-100 border border-amber-200 px-4 py-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-black tracking-wide text-amber-800">
              BONUS REVIEW
            </span>
          </div>

          <div className="w-10" />
        </div>

        {/* Friendly introduction */}
        <div className="mt-5 rounded-3xl bg-white border border-amber-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                Time to remember!
              </h1>

              <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
                A little practice helps your memory grow. Let's see what
                you remember!
              </p>

              {stageTitle && (
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                  {stageTitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Activity */}
      <main className="w-full max-w-xl mx-auto px-5 sm:px-6 flex-1 flex flex-col justify-center py-6">
        <div className="rounded-3xl border border-amber-100 shadow-sm p-4 sm:p-6">
          {children}
        </div>
      </main>

      {/* Answer Feedback and Actions */}
      <footer
        className={`w-full border-t px-5 sm:px-6 py-5 sm:py-6 transition-colors ${
          isSubmitted
            ? isAnswerCorrect
              ? "bg-emerald-50 border-emerald-200"
              : "bg-rose-50 border-rose-200"
            : "bg-white border-amber-100"
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isSubmitted && isAnswerCorrect && (
              <div
                className="flex items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-black text-emerald-800">
                    Great memory!
                  </p>
                  <p className="text-xs font-medium text-emerald-700">
                    You got it right!
                  </p>
                </div>
              </div>
            )}

            {isSubmitted && !isAnswerCorrect && (
              <div
                className="flex items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
                <div>
                  <p className="font-black text-rose-800">
                    Almost there!
                  </p>
                  <p className="text-xs font-medium text-rose-700">
                    Give it another try.
                  </p>
                </div>
              </div>
            )}

            {!isSubmitted && (
              <p className="text-sm font-bold text-slate-500">
                Take your time. You've got this!
              </p>
            )}
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={onCheckAnswer}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-7 py-4 text-white font-black shadow-[0_4px_0_0_#d97706] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wide cursor-pointer"
            >
              Check
            </button>
          ) : isAnswerCorrect ? (
            <button
              type="button"
              onClick={onContinue}
              disabled={isSubmitting}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 sm:px-7 py-4 text-white font-black shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Review
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <div className="rounded-2xl bg-rose-100 px-5 py-4 text-sm font-black text-rose-700">
              Try again
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}