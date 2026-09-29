"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MatchingPairsPayload, MatchingPairItem } from "@/types/foundation/materials";
import { Check, X } from "lucide-react";

interface MatchingPairsProps {
  payload: MatchingPairsPayload;
  onAnswerChange: (isCorrect: boolean) => void;
  disabled?: boolean;
}

// Helper to safely extract string text
const getText = (val: unknown): string => {
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    return String(obj.text ?? obj.sourceText ?? obj.targetText ?? obj.word ?? "");
  }
  return "";
};

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MatchingPairs({
  payload,
  onAnswerChange,
  disabled = false,
}: MatchingPairsProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mismatchState, setMismatchState] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);

  const rawPairs: MatchingPairItem[] = useMemo(() => payload?.pairs || [], [payload]);

  // Generate scrambled left (source) and right (target) banks
  const { sources, targets } = useMemo(() => {
    const srcList = rawPairs.map((p, idx) => ({
      pairId: p.id || `pair-${idx}`,
      text: getText(p.sourceText),
    }));

    const tgtList = rawPairs.map((p, idx) => ({
      pairId: p.id || `pair-${idx}`,
      text: getText(p.targetText),
    }));

    return {
      sources: shuffleArray(srcList),
      targets: shuffleArray(tgtList),
    };
  }, [rawPairs]);

  // Reset state on payload change
  useEffect(() => {
    setSelectedSourceId(null);
    setSelectedTargetId(null);
    setMatchedIds([]);
    setMismatchState(null);
  }, [payload]);

  const handleSourceClick = (pairId: string) => {
    if (disabled || matchedIds.includes(pairId) || mismatchState) return;

    setSelectedSourceId(pairId);

    if (selectedTargetId) {
      checkMatch(pairId, selectedTargetId);
    }
  };

  const handleTargetClick = (pairId: string) => {
    if (disabled || matchedIds.includes(pairId) || mismatchState) return;

    setSelectedTargetId(pairId);

    if (selectedSourceId) {
      checkMatch(selectedSourceId, pairId);
    }
  };

  const checkMatch = (sourcePairId: string, targetPairId: string) => {
    if (sourcePairId === targetPairId) {
      const nextMatched = [...matchedIds, sourcePairId];
      setMatchedIds(nextMatched);
      setSelectedSourceId(null);
      setSelectedTargetId(null);

      if (nextMatched.length === rawPairs.length && rawPairs.length > 0) {
        onAnswerChange(true);
      }
    } else {
      // Show mismatch error feedback briefly
      setMismatchState({ sourceId: sourcePairId, targetId: targetPairId });
      setTimeout(() => {
        setMismatchState(null);
        setSelectedSourceId(null);
        setSelectedTargetId(null);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
      {/* Title / Instruction */}
      <h2 className="text-xl font-black text-slate-800 text-center leading-snug">
        {getText(payload?.question) || "Tap the matching pairs"}
      </h2>

      {/* Two Column Matching Board */}
      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* Source Column */}
        <div className="flex flex-col gap-3">
          {sources.map((item) => {
            const isMatched = matchedIds.includes(item.pairId);
            const isSelected = selectedSourceId === item.pairId;
            const isMismatched = mismatchState?.sourceId === item.pairId;

            return (
              <button
                key={`src-${item.pairId}`}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleSourceClick(item.pairId)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 font-black text-sm text-left transition-all duration-150 ${
                  disabled && !isMatched ? "cursor-default opacity-80" : "cursor-pointer"
                } ${
                  isMatched
                    ? "bg-slate-100 border-slate-200 text-slate-300 opacity-60 shadow-none cursor-default"
                    : isMismatched
                    ? "bg-rose-50 border-rose-500 text-rose-800 shadow-[0_4px_0_0_#e11d48]"
                    : isSelected
                    ? "bg-sky-50 border-sky-500 text-sky-800 shadow-[0_4px_0_0_#0284c7] translate-y-0.5"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none"
                }`}
              >
                <span className="truncate pr-2">{item.text}</span>
                {isMatched && <Check className="w-4 h-4 text-slate-300 shrink-0 stroke-[3]" />}
                {isMismatched && <X className="w-4 h-4 text-rose-500 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Target Column */}
        <div className="flex flex-col gap-3">
          {targets.map((item) => {
            const isMatched = matchedIds.includes(item.pairId);
            const isSelected = selectedTargetId === item.pairId;
            const isMismatched = mismatchState?.targetId === item.pairId;

            return (
              <button
                key={`tgt-${item.pairId}`}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleTargetClick(item.pairId)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 font-black text-sm text-left transition-all duration-150 ${
                  disabled && !isMatched ? "cursor-default opacity-80" : "cursor-pointer"
                } ${
                  isMatched
                    ? "bg-slate-100 border-slate-200 text-slate-300 opacity-60 shadow-none cursor-default"
                    : isMismatched
                    ? "bg-rose-50 border-rose-500 text-rose-800 shadow-[0_4px_0_0_#e11d48]"
                    : isSelected
                    ? "bg-sky-50 border-sky-500 text-sky-800 shadow-[0_4px_0_0_#0284c7] translate-y-0.5"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none"
                }`}
              >
                <span className="truncate pr-2">{item.text}</span>
                {isMatched && <Check className="w-4 h-4 text-slate-300 shrink-0 stroke-[3]" />}
                {isMismatched && <X className="w-4 h-4 text-rose-500 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}