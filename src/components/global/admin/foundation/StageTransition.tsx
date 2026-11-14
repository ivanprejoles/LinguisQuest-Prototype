
"use client";

import React from "react";

interface StageTransitionProps {
  active: boolean;
}

export function StageTransition({ active }: StageTransitionProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden bg-[#06121d] ${
          active
            ? "stage-transition-active"
            : "stage-transition-inactive"
        }`}
      >
        {/* Cyan expanding layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-cyan-400 to-teal-300 stage-transition-panel" />

        {/* Light sweep */}
        <div className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 opacity-50 blur-2xl stage-transition-sweep bg-gradient-to-r from-transparent via-white to-transparent" />

        {/* Center branding */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="stage-transition-content text-center">
            <div className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              LinguisQuest
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
              Preparing your next adventure
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .stage-transition-inactive {
          visibility: hidden;
        }

        .stage-transition-active {
          visibility: visible;
        }

        .stage-transition-panel {
          transform: translateX(-100%);
        }

        .stage-transition-active .stage-transition-panel {
          animation: stage-panel-enter 800ms
            cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .stage-transition-sweep {
          transform: translateX(-150%) skewX(-12deg);
        }

        .stage-transition-active .stage-transition-sweep {
          animation: stage-light-sweep 900ms ease-out forwards;
        }

        .stage-transition-content {
          opacity: 0;
          transform: translateY(15px);
        }

        .stage-transition-active .stage-transition-content {
          animation: stage-content-enter 400ms ease-out 350ms forwards;
        }

        @keyframes stage-panel-enter {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes stage-light-sweep {
          from {
            transform: translateX(-150%) skewX(-12deg);
          }
          to {
            transform: translateX(450%) skewX(-12deg);
          }
        }

        @keyframes stage-content-enter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stage-transition-active .stage-transition-panel {
            animation-duration: 1ms;
          }

          .stage-transition-active .stage-transition-sweep {
            animation: none;
          }

          .stage-transition-active .stage-transition-content {
            animation-duration: 1ms;
          }
        }
      `}</style>
    </>
  );
}
