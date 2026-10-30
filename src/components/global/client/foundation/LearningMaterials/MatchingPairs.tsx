
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import {
//   MatchingPairItem,
//   MatchingPairsPayload,
// } from "@/types/foundation/materials";
// import { X } from "lucide-react";

// interface MatchingPairsProps {
//   payload: MatchingPairsPayload;
//   onAnswerChange: (isCorrect: boolean) => void;
//   disabled?: boolean;
// }

// // Helper to safely extract string text
// const getText = (val: unknown): string => {
//   if (typeof val === "string" || typeof val === "number") {
//     return String(val);
//   }

//   if (val && typeof val === "object") {
//     const obj = val as Record<string, unknown>;
//     return String(
//       obj.text ?? obj.sourceText ?? obj.targetText ?? obj.word ?? ""
//     );
//   }

//   return "";
// };

// // Utility function to shuffle array
// function shuffleArray<T>(array: T[]): T[] {
//   const arr = [...array];

//   for (let i = arr.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [arr[i], arr[j]] = [arr[j], arr[i]];
//   }

//   return arr;
// }

// // Colors used for correctly matched pairs.
// // The same pair receives the same color in both columns.
// const MATCH_COLORS = [
//   {
//     bg: "bg-emerald-100",
//     border: "border-emerald-500",
//     text: "text-emerald-900",
//     shadow: "shadow-[0_4px_0_0_#10b981]",
//   },
//   {
//     bg: "bg-sky-100",
//     border: "border-sky-500",
//     text: "text-sky-900",
//     shadow: "shadow-[0_4px_0_0_#0ea5e9]",
//   },
//   {
//     bg: "bg-amber-100",
//     border: "border-amber-500",
//     text: "text-amber-900",
//     shadow: "shadow-[0_4px_0_0_#f59e0b]",
//   },
//   {
//     bg: "bg-violet-100",
//     border: "border-violet-500",
//     text: "text-violet-900",
//     shadow: "shadow-[0_4px_0_0_#8b5cf6]",
//   },
// ];

// export function MatchingPairs({
//   payload,
//   onAnswerChange,
//   disabled = false,
// }: MatchingPairsProps) {
//   const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
//     null
//   );
//   const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
//     null
//   );
//   const [matchedIds, setMatchedIds] = useState<string[]>([]);
//   const [mismatchState, setMismatchState] = useState<{
//     sourceId: string;
//     targetId: string;
//   } | null>(null);

//   const rawPairs: MatchingPairItem[] = useMemo(
//     () => payload?.pairs || [],
//     [payload]
//   );

//   // Generate scrambled source and target columns.
//   const { sources, targets } = useMemo(() => {
//     const srcList = rawPairs.map((pair, index) => ({
//       pairId: pair.id || `pair-${index}`,
//       text: getText(pair.sourceText),
//     }));

//     const tgtList = rawPairs.map((pair, index) => ({
//       pairId: pair.id || `pair-${index}`,
//       text: getText(pair.targetText),
//     }));

//     return {
//       sources: shuffleArray(srcList),
//       targets: shuffleArray(tgtList),
//     };
//   }, [rawPairs]);

//   // Reset the activity when the payload changes.
//   useEffect(() => {
//     setSelectedSourceId(null);
//     setSelectedTargetId(null);
//     setMatchedIds([]);
//     setMismatchState(null);
//   }, [payload]);

//   // Get a consistent color for a pair in either column.
//   const getMatchColor = (pairId: string) => {
//     const pairIndex = rawPairs.findIndex(
//       (pair, index) => (pair.id || `pair-${index}`) === pairId
//     );

//     const colorIndex = pairIndex >= 0 ? pairIndex : 0;

//     return MATCH_COLORS[colorIndex % MATCH_COLORS.length];
//   };

//   const checkMatch = (sourcePairId: string, targetPairId: string) => {
//     if (
//       matchedIds.includes(sourcePairId) ||
//       matchedIds.includes(targetPairId)
//     ) {
//       return;
//     }

//     if (sourcePairId === targetPairId) {
//       const nextMatched = [...matchedIds, sourcePairId];

//       setMatchedIds(nextMatched);
//       setSelectedSourceId(null);
//       setSelectedTargetId(null);
//       setMismatchState(null);

//       // Mark the activity correct only after every pair is matched.
//       if (nextMatched.length === rawPairs.length && rawPairs.length > 0) {
//         onAnswerChange(true);
//       }
//     } else {
//       // Briefly show incorrect selections in red.
//       setMismatchState({
//         sourceId: sourcePairId,
//         targetId: targetPairId,
//       });

//       setTimeout(() => {
//         setMismatchState(null);
//         setSelectedSourceId(null);
//         setSelectedTargetId(null);
//       }, 600);
//     }
//   };

//   const handleSourceClick = (pairId: string) => {
//     if (disabled || matchedIds.includes(pairId) || mismatchState) {
//       return;
//     }

//     setSelectedSourceId(pairId);

//     if (selectedTargetId) {
//       checkMatch(pairId, selectedTargetId);
//     }
//   };

//   const handleTargetClick = (pairId: string) => {
//     if (disabled || matchedIds.includes(pairId) || mismatchState) {
//       return;
//     }

//     setSelectedTargetId(pairId);

//     if (selectedSourceId) {
//       checkMatch(selectedSourceId, pairId);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
//       {/* Title / Instruction */}
//       <h2 className="text-xl font-black text-white text-center leading-snug">
//         {getText(payload?.question) || "Tap the matching pairs"}
//       </h2>

//       {/* Two Column Matching Board */}
//       <div className="grid grid-cols-2 gap-3.5 w-full">
//         {/* Source Column */}
//         <div className="flex flex-col gap-3">
//           {sources.map((item) => {
//             const isMatched = matchedIds.includes(item.pairId);
//             const isSelected = selectedSourceId === item.pairId;
//             const isMismatched =
//               mismatchState?.sourceId === item.pairId;

//             const matchColor = isMatched
//               ? getMatchColor(item.pairId)
//               : null;

//             return (
//               <button
//                 key={`src-${item.pairId}`}
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => handleSourceClick(item.pairId)}
//                 className={`relative flex items-center justify-between p-4 rounded-2xl border-2 font-black text-sm text-left transition-all duration-150 ${
//                   disabled
//                     ? "cursor-default opacity-80"
//                     : isMatched
//                     ? "cursor-default"
//                     : "cursor-pointer"
//                 } ${
//                   isMismatched
//                     ? "bg-rose-50 border-rose-500 text-rose-800 shadow-[0_4px_0_0_#e11d48]"
//                     : matchColor
//                     ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
//                     : isSelected
//                     ? "bg-sky-50 border-sky-500 text-sky-800 shadow-[0_4px_0_0_#0284c7] translate-y-0.5"
//                     : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none"
//                 }`}
//               >
//                 <span className="truncate pr-2">{item.text}</span>

//                 {isMismatched && (
//                   <X className="w-4 h-4 text-rose-500 shrink-0 stroke-[3]" />
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         {/* Target Column */}
//         <div className="flex flex-col gap-3">
//           {targets.map((item) => {
//             const isMatched = matchedIds.includes(item.pairId);
//             const isSelected = selectedTargetId === item.pairId;
//             const isMismatched =
//               mismatchState?.targetId === item.pairId;

//             const matchColor = isMatched
//               ? getMatchColor(item.pairId)
//               : null;

//             return (
//               <button
//                 key={`tgt-${item.pairId}`}
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => handleTargetClick(item.pairId)}
//                 className={`relative flex items-center justify-between p-4 rounded-2xl border-2 font-black text-sm text-left transition-all duration-150 ${
//                   disabled
//                     ? "cursor-default opacity-80"
//                     : isMatched
//                     ? "cursor-default"
//                     : "cursor-pointer"
//                 } ${
//                   isMismatched
//                     ? "bg-rose-50 border-rose-500 text-rose-800 shadow-[0_4px_0_0_#e11d48]"
//                     : matchColor
//                     ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
//                     : isSelected
//                     ? "bg-sky-50 border-sky-500 text-sky-800 shadow-[0_4px_0_0_#0284c7] translate-y-0.5"
//                     : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none"
//                 }`}
//               >
//                 <span className="truncate pr-2">{item.text}</span>

//                 {isMismatched && (
//                   <X className="w-4 h-4 text-rose-500 shrink-0 stroke-[3]" />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MatchingPairItem,
  MatchingPairsPayload,
} from "@/types/foundation/materials";
import { RotateCcw } from "lucide-react";

interface MatchingPairsProps {
  payload: MatchingPairsPayload;
  onAnswerChange: (isCorrect: boolean) => void;
  disabled?: boolean;
}

interface UserMatch {
  sourceId: string;
  targetId: string;
  colorIndex: number;
}

interface DisplayItem {
  pairId: string;
  text: string;
}

const getText = (val: unknown): string => {
  if (typeof val === "string" || typeof val === "number") {
    return String(val);
  }

  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;

    return String(
      obj.text ?? obj.sourceText ?? obj.targetText ?? obj.word ?? ""
    );
  }

  return "";
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

const MATCH_COLORS = [
  {
    bg: "bg-sky-100",
    border: "border-sky-500",
    text: "text-sky-900",
    shadow: "shadow-[0_4px_0_0_#0284c7]",
  },
  {
    bg: "bg-emerald-100",
    border: "border-emerald-500",
    text: "text-emerald-900",
    shadow: "shadow-[0_4px_0_0_#10b981]",
  },
  {
    bg: "bg-amber-100",
    border: "border-amber-500",
    text: "text-amber-900",
    shadow: "shadow-[0_4px_0_0_#f59e0b]",
  },
];

export function MatchingPairs({
  payload,
  onAnswerChange,
  disabled = false,
}: MatchingPairsProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    null
  );

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    null
  );

  const [userMatches, setUserMatches] = useState<UserMatch[]>([]);

  const rawPairs: MatchingPairItem[] = useMemo(
    () => payload?.pairs || [],
    [payload?.pairs]
  );

  // Keep IDs for tracking, but use text for checking correctness.
  const { sources, targets } = useMemo(() => {
    const sourceItems: DisplayItem[] = rawPairs.map((pair, index) => ({
      pairId: pair.id || `pair-${index}`,
      text: getText(pair.sourceText),
    }));

    const targetItems: DisplayItem[] = rawPairs.map((pair, index) => ({
      pairId: pair.id || `pair-${index}`,
      text: getText(pair.targetText),
    }));

    return {
      sources: shuffleArray(sourceItems),
      targets: shuffleArray(targetItems),
    };
  }, [rawPairs]);

  const getNextColorIndex = (matches: UserMatch[]): number => {
    const usedColors = new Set(matches.map((match) => match.colorIndex));

    let index = 0;

    while (usedColors.has(index)) {
      index++;
    }

    return index;
  };

  // Correctness is based on the word combination, not pair IDs or order.
  const checkAnswers = useCallback(
    (matches: UserMatch[]) => {
      const allCorrect =
        rawPairs.length > 0 &&
        matches.length === rawPairs.length &&
        matches.every((match) => {
          const source = sources.find(
            (item) => item.pairId === match.sourceId
          );

          const target = targets.find(
            (item) => item.pairId === match.targetId
          );

          if (!source || !target) {
            return false;
          }

          return rawPairs.some(
            (pair) =>
              getText(pair.sourceText) === source.text &&
              getText(pair.targetText) === target.text
          );
        });

      onAnswerChange(allCorrect);
    },
    [rawPairs, sources, targets, onAnswerChange]
  );

  // Reset when a different payload is loaded.
  useEffect(() => {
    setSelectedSourceId(null);
    setSelectedTargetId(null);
    setUserMatches([]);
    onAnswerChange(false);
  }, [payload, onAnswerChange]);

  const completePair = (
    sourceId: string,
    targetId: string,
    currentMatches: UserMatch[] = userMatches
  ) => {
    // Each source and target can only be used once.
    const remainingMatches = currentMatches.filter(
      (match) =>
        match.sourceId !== sourceId &&
        match.targetId !== targetId
    );

    const colorIndex = getNextColorIndex(remainingMatches);

    const nextMatches: UserMatch[] = [
      ...remainingMatches,
      {
        sourceId,
        targetId,
        colorIndex,
      },
    ];

    setUserMatches(nextMatches);
    setSelectedSourceId(null);
    setSelectedTargetId(null);

    checkAnswers(nextMatches);
  };

  const handleSourceClick = (sourceId: string) => {
    if (disabled) return;

    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null);
      return;
    }

    // Remove this source's previous match, if any.
    const remainingMatches = userMatches.filter(
      (match) => match.sourceId !== sourceId
    );

    if (remainingMatches.length !== userMatches.length) {
      setUserMatches(remainingMatches);
      checkAnswers(remainingMatches);
    }

    if (selectedTargetId) {
      completePair(sourceId, selectedTargetId, remainingMatches);
      return;
    }

    setSelectedSourceId(sourceId);
    setSelectedTargetId(null);
  };

  const handleTargetClick = (targetId: string) => {
    if (disabled) return;

    if (selectedTargetId === targetId) {
      setSelectedTargetId(null);
      return;
    }

    // Remove this target's previous match, if any.
    const remainingMatches = userMatches.filter(
      (match) => match.targetId !== targetId
    );

    if (remainingMatches.length !== userMatches.length) {
      setUserMatches(remainingMatches);
      checkAnswers(remainingMatches);
    }

    if (selectedSourceId) {
      completePair(selectedSourceId, targetId, remainingMatches);
      return;
    }

    setSelectedTargetId(targetId);
    setSelectedSourceId(null);
  };

  const resetActivity = () => {
    if (disabled) return;

    setSelectedSourceId(null);
    setSelectedTargetId(null);
    setUserMatches([]);
    onAnswerChange(false);
  };

  const getSourceMatch = (sourceId: string) =>
    userMatches.find((match) => match.sourceId === sourceId);

  const getTargetMatch = (targetId: string) =>
    userMatches.find((match) => match.targetId === targetId);

  const pendingColorIndex = getNextColorIndex(userMatches);

  const getButtonClass = (
    isSelected: boolean,
    colorIndex?: number
  ) => {
    const matchColor =
      colorIndex !== undefined
        ? MATCH_COLORS[colorIndex % MATCH_COLORS.length]
        : null;

    const appearance = isSelected
      ? matchColor
        ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
        : "bg-sky-100 border-sky-500 text-sky-900 shadow-[0_4px_0_0_#0284c7]"
      : matchColor
      ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
      : "bg-white border-slate-200 text-slate-700 shadow-[0_4px_0_0_#e2e8f0] hover:border-slate-400 active:translate-y-0.5 active:shadow-none";

    return `relative flex items-center justify-between p-4 rounded-2xl border-2 font-black text-sm text-left transition-all duration-150 ${appearance} ${
      disabled ? "cursor-default opacity-80" : "cursor-pointer"
    }`;
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
      <h2 className="text-xl font-black text-white text-center leading-snug">
        {getText(payload?.question) || "Tap the matching pairs"}
      </h2>

      <div className="grid grid-cols-2 gap-3.5 w-full">
        {/* Source Column */}
        <div className="flex flex-col gap-3">
          {sources.map((item) => {
            const match = getSourceMatch(item.pairId);
            const isSelected = selectedSourceId === item.pairId;

            return (
              <button
                key={`src-${item.pairId}`}
                type="button"
                disabled={disabled}
                onClick={() => handleSourceClick(item.pairId)}
                aria-pressed={isSelected}
                className={getButtonClass(
                  isSelected,
                  match?.colorIndex ??
                    (isSelected ? pendingColorIndex : undefined)
                )}
              >
                <span className="truncate pr-2">{item.text}</span>
              </button>
            );
          })}
        </div>

        {/* Target Column */}
        <div className="flex flex-col gap-3">
          {targets.map((item) => {
            const match = getTargetMatch(item.pairId);
            const isSelected = selectedTargetId === item.pairId;

            return (
              <button
                key={`tgt-${item.pairId}`}
                type="button"
                disabled={disabled}
                onClick={() => handleTargetClick(item.pairId)}
                aria-pressed={isSelected}
                className={getButtonClass(
                  isSelected,
                  match?.colorIndex ??
                    (isSelected ? pendingColorIndex : undefined)
                )}
              >
                <span className="truncate pr-2">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={resetActivity}
        disabled={
          disabled ||
          (userMatches.length === 0 &&
            !selectedSourceId &&
            !selectedTargetId)
        }
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-[0_3px_0_0_#e2e8f0] transition hover:bg-slate-50 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>
    </div>
  );
}
