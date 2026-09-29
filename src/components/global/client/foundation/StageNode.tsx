"use client";

import React from "react";
import { Stage } from "@prisma/client";
import { Star, Play, CheckCircle2, Lock } from "lucide-react";

interface StageNodeProps {
  stage: Stage;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  onStartStage: (stage: Stage) => void;
}

export function StageNode({
  stage,
  index,
  isUnlocked,
  isCompleted,
  onStartStage,
}: StageNodeProps) {
  // Compute horizontal offset for winding snake path effect (-40px to +40px)
  const xOffset = Math.sin(index * 1.2) * 45;

  return (
    <div
      className="relative flex flex-col items-center my-4 transition-all duration-300"
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      <button
        disabled={!isUnlocked}
        onClick={() => onStartStage(stage)}
        className={`group relative w-20 h-20 rounded-full flex items-center justify-center font-black text-xl transition-all transform active:translate-y-1 ${
          isCompleted
            ? "bg-amber-400 border-4 border-amber-500 text-white shadow-[0_8px_0_0_#d97706] hover:bg-amber-300"
            : isUnlocked
            ? "bg-green-500 border-4 border-green-600 text-white shadow-[0_8px_0_0_#16a34a] hover:bg-green-400 hover:-translate-y-0.5"
            : "bg-slate-200 border-4 border-slate-300 text-slate-400 shadow-[0_8px_0_0_#cbd5e1] cursor-not-allowed"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        ) : isUnlocked ? (
          <Play className="w-8 h-8 fill-current ml-1" />
        ) : (
          <Lock className="w-7 h-7" />
        )}

        {/* Floating level badge */}
        <span className="absolute -bottom-2 bg-white text-slate-700 text-[11px] font-black px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
          {index + 1}
        </span>
      </button>

      {/* Tooltip on hover */}
      <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-opacity shadow-lg z-10">
        {stage.question || `Level ${index + 1}`}
      </div>
    </div>
  );
}