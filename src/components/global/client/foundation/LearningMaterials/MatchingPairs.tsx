// "use client";

// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   MatchingPairItem,
//   MatchingPairsPayload,
// } from "@/types/foundation/materials";
// import { RotateCcw } from "lucide-react";

// interface MatchingPairsProps {
//   payload: MatchingPairsPayload;
//   onAnswerChange: (isCorrect: boolean) => void;
//   disabled?: boolean;
// }

// interface UserMatch {
//   sourceId: string;
//   targetId: string;
//   colorIndex: number;
// }

// interface DisplayItem {
//   pairId: string;
//   text: string;
// }

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

// function shuffleArray<T>(array: T[]): T[] {
//   const arr = [...array];

//   for (let i = arr.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [arr[i], arr[j]] = [arr[j], arr[i]];
//   }

//   return arr;
// }

// const MATCH_COLORS = [
//   {
//     bg: "bg-sky-100",
//     border: "border-sky-500",
//     text: "text-sky-900",
//     shadow: "shadow-[0_4px_0_0_#0284c7]",
//   },
//   {
//     bg: "bg-emerald-100",
//     border: "border-emerald-500",
//     text: "text-emerald-900",
//     shadow: "shadow-[0_4px_0_0_#10b981]",
//   },
//   {
//     bg: "bg-amber-100",
//     border: "border-amber-500",
//     text: "text-amber-900",
//     shadow: "shadow-[0_4px_0_0_#f59e0b]",
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

//   const [userMatches, setUserMatches] = useState<UserMatch[]>([]);

//   const rawPairs: MatchingPairItem[] = useMemo(
//     () => payload?.pairs || [],
//     [payload?.pairs]
//   );

//   // Keep IDs for tracking, but use text for checking correctness.
//   const { sources, targets } = useMemo(() => {
//     const sourceItems: DisplayItem[] = rawPairs.map((pair, index) => ({
//       pairId: pair.id || `pair-${index}`,
//       text: getText(pair.sourceText),
//     }));

//     const targetItems: DisplayItem[] = rawPairs.map((pair, index) => ({
//       pairId: pair.id || `pair-${index}`,
//       text: getText(pair.targetText),
//     }));

//     return {
//       sources: shuffleArray(sourceItems),
//       targets: shuffleArray(targetItems),
//     };
//   }, [rawPairs]);

//   const getNextColorIndex = (matches: UserMatch[]): number => {
//     const usedColors = new Set(matches.map((match) => match.colorIndex));

//     let index = 0;

//     while (usedColors.has(index)) {
//       index++;
//     }

//     return index;
//   };

//   // Correctness is based on the word combination, not pair IDs or order.
//   const checkAnswers = useCallback(
//     (matches: UserMatch[]) => {
//       const allCorrect =
//         rawPairs.length > 0 &&
//         matches.length === rawPairs.length &&
//         matches.every((match) => {
//           const source = sources.find(
//             (item) => item.pairId === match.sourceId
//           );

//           const target = targets.find(
//             (item) => item.pairId === match.targetId
//           );

//           if (!source || !target) {
//             return false;
//           }

//           return rawPairs.some(
//             (pair) =>
//               getText(pair.sourceText) === source.text &&
//               getText(pair.targetText) === target.text
//           );
//         });

//       onAnswerChange(allCorrect);
//     },
//     [rawPairs, sources, targets, onAnswerChange]
//   );

//   // Reset when a different payload is loaded.
//   useEffect(() => {
//     setSelectedSourceId(null);
//     setSelectedTargetId(null);
//     setUserMatches([]);
//     onAnswerChange(false);
//   }, [payload, onAnswerChange]);

//   const completePair = (
//     sourceId: string,
//     targetId: string,
//     currentMatches: UserMatch[] = userMatches
//   ) => {
//     // Each source and target can only be used once.
//     const remainingMatches = currentMatches.filter(
//       (match) =>
//         match.sourceId !== sourceId &&
//         match.targetId !== targetId
//     );

//     const colorIndex = getNextColorIndex(remainingMatches);

//     const nextMatches: UserMatch[] = [
//       ...remainingMatches,
//       {
//         sourceId,
//         targetId,
//         colorIndex,
//       },
//     ];

//     setUserMatches(nextMatches);
//     setSelectedSourceId(null);
//     setSelectedTargetId(null);

//     checkAnswers(nextMatches);
//   };

//   const handleSourceClick = (sourceId: string) => {
//     if (disabled) return;

//     if (selectedSourceId === sourceId) {
//       setSelectedSourceId(null);
//       return;
//     }

//     // Remove this source's previous match, if any.
//     const remainingMatches = userMatches.filter(
//       (match) => match.sourceId !== sourceId
//     );

//     if (remainingMatches.length !== userMatches.length) {
//       setUserMatches(remainingMatches);
//       checkAnswers(remainingMatches);
//     }

//     if (selectedTargetId) {
//       completePair(sourceId, selectedTargetId, remainingMatches);
//       return;
//     }

//     setSelectedSourceId(sourceId);
//     setSelectedTargetId(null);
//   };

//   const handleTargetClick = (targetId: string) => {
//     if (disabled) return;

//     if (selectedTargetId === targetId) {
//       setSelectedTargetId(null);
//       return;
//     }

//     // Remove this target's previous match, if any.
//     const remainingMatches = userMatches.filter(
//       (match) => match.targetId !== targetId
//     );

//     if (remainingMatches.length !== userMatches.length) {
//       setUserMatches(remainingMatches);
//       checkAnswers(remainingMatches);
//     }

//     if (selectedSourceId) {
//       completePair(selectedSourceId, targetId, remainingMatches);
//       return;
//     }

//     setSelectedTargetId(targetId);
//     setSelectedSourceId(null);
//   };

//   const resetActivity = () => {
//     if (disabled) return;

//     setSelectedSourceId(null);
//     setSelectedTargetId(null);
//     setUserMatches([]);
//     onAnswerChange(false);
//   };

//   const getSourceMatch = (sourceId: string) =>
//     userMatches.find((match) => match.sourceId === sourceId);

//   const getTargetMatch = (targetId: string) =>
//     userMatches.find((match) => match.targetId === targetId);

//   const pendingColorIndex = getNextColorIndex(userMatches);

//   const getButtonClass = (
//     isSelected: boolean,
//     colorIndex?: number
//   ) => {
//     const matchColor =
//       colorIndex !== undefined
//         ? MATCH_COLORS[colorIndex % MATCH_COLORS.length]
//         : null;

//     const appearance = isSelected
//       ? matchColor
//         ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
//         : "bg-sky-100 border-sky-500 text-sky-900 shadow-[0_4px_0_0_#0284c7]"
//       : matchColor
//       ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
//       : "bg-white border-slate-200 text-slate-700 shadow-[0_4px_0_0_#e2e8f0] hover:border-slate-400 active:translate-y-0.5 active:shadow-none";

//     return `relative flex items-center justify-between p-4 rounded-2xl border-2 font-black text-sm text-left transition-all duration-150 ${appearance} ${
//       disabled ? "cursor-default opacity-80" : "cursor-pointer"
//     }`;
//   };

//   return (
//     <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
//       <h2 className="text-xl font-black text-white text-center leading-snug">
//         {getText(payload?.question) || "Tap the matching pairs"}
//       </h2>

//       <div className="grid grid-cols-2 gap-3.5 w-full">
//         {/* Source Column */}
//         <div className="flex flex-col gap-3">
//           {sources.map((item) => {
//             const match = getSourceMatch(item.pairId);
//             const isSelected = selectedSourceId === item.pairId;

//             return (
//               <button
//                 key={`src-${item.pairId}`}
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => handleSourceClick(item.pairId)}
//                 aria-pressed={isSelected}
//                 className={getButtonClass(
//                   isSelected,
//                   match?.colorIndex ??
//                     (isSelected ? pendingColorIndex : undefined)
//                 )}
//               >
//                 <span className="truncate pr-2">{item.text}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* Target Column */}
//         <div className="flex flex-col gap-3">
//           {targets.map((item) => {
//             const match = getTargetMatch(item.pairId);
//             const isSelected = selectedTargetId === item.pairId;

//             return (
//               <button
//                 key={`tgt-${item.pairId}`}
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => handleTargetClick(item.pairId)}
//                 aria-pressed={isSelected}
//                 className={getButtonClass(
//                   isSelected,
//                   match?.colorIndex ??
//                     (isSelected ? pendingColorIndex : undefined)
//                 )}
//               >
//                 <span className="truncate pr-2">{item.text}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <button
//         type="button"
//         onClick={resetActivity}
//         disabled={
//           disabled ||
//           (userMatches.length === 0 &&
//             !selectedSourceId &&
//             !selectedTargetId)
//         }
//         className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-[0_3px_0_0_#e2e8f0] transition hover:bg-slate-50 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
//       >
//         <RotateCcw className="h-4 w-4" />
//         Reset
//       </button>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MatchingPairItem,
  MatchingPairsPayload,
} from "@/types/foundation/materials";
import {
  RotateCcw,
  Link2,
  Sparkles,
  Check,
} from "lucide-react";

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
    shadow: "shadow-[0_2px_0_#0284c7]",
  },
  {
    bg: "bg-emerald-100",
    border: "border-emerald-500",
    text: "text-emerald-900",
    shadow: "shadow-[0_2px_0_#10b981]",
  },
  {
    bg: "bg-amber-100",
    border: "border-amber-500",
    text: "text-amber-900",
    shadow: "shadow-[0_2px_0_#f59e0b]",
  },
  {
    bg: "bg-violet-100",
    border: "border-violet-500",
    text: "text-violet-900",
    shadow: "shadow-[0_2px_0_#8b5cf6]",
  },
  {
    bg: "bg-rose-100",
    border: "border-rose-500",
    text: "text-rose-900",
    shadow: "shadow-[0_2px_0_#f43f5e]",
  },
  {
    bg: "bg-teal-100",
    border: "border-teal-500",
    text: "text-teal-900",
    shadow: "shadow-[0_2px_0_#14b8a6]",
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-500",
    text: "text-orange-900",
    shadow: "shadow-[0_2px_0_#f97316]",
  },
  {
    bg: "bg-indigo-100",
    border: "border-indigo-500",
    text: "text-indigo-900",
    shadow: "shadow-[0_2px_0_#6366f1]",
  },
  {
    bg: "bg-fuchsia-100",
    border: "border-fuchsia-500",
    text: "text-fuchsia-900",
    shadow: "shadow-[0_2px_0_#d946ef]",
  },
  {
    bg: "bg-lime-100",
    border: "border-lime-500",
    text: "text-lime-900",
    shadow: "shadow-[0_2px_0_#84cc16]",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-500",
    text: "text-pink-900",
    shadow: "shadow-[0_2px_0_#ec4899]",
  },
  {
    bg: "bg-cyan-100",
    border: "border-cyan-500",
    text: "text-cyan-900",
    shadow: "shadow-[0_2px_0_#06b6d4]",
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

    const appearance = matchColor
      ? `${matchColor.bg} ${matchColor.border} ${matchColor.text} ${matchColor.shadow}`
      : isSelected
      ? "bg-cyan-100 border-cyan-500 text-cyan-900 shadow-[0_2px_0_#06b6d4]"
      : "bg-white border-slate-200 text-slate-700 shadow-[0_2px_0_#e2e8f0] hover:border-cyan-300 hover:bg-cyan-50";

    return `relative flex min-h-[42px] w-full min-w-0 items-center justify-center rounded-xl border-2 px-2 py-2 text-center text-[11px] font-extrabold leading-tight transition-all duration-150 sm:min-h-[50px] sm:px-3 sm:py-2.5 sm:text-sm ${
      appearance
    } ${
      disabled
        ? "cursor-default"
        : "cursor-pointer active:translate-y-0.5 active:shadow-none"
    } ${
      isSelected && !matchColor
        ? "ring-2 ring-cyan-300 ring-offset-1"
        : ""
    }`;
  };

  const question = getText(payload?.question);
  const totalPairs = rawPairs.length;

  return (
    <div className="mx-auto flex w-full max-w-2xl min-w-0 select-none flex-col gap-2 px-1 sm:gap-3">

      {/* Compact Header */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1">
          <Link2 className="h-3 w-3 text-cyan-600" />
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-700 sm:text-xs">
            Match the Pairs
          </span>
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
          className="flex shrink-0 items-center gap-1 rounded-full border-2 border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-[0_2px_0_#e2e8f0] transition-colors hover:border-cyan-300 hover:text-cyan-700 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Compact Question */}
      {question && (
        <div className="rounded-xl border border-slate-200 border-b-2 bg-white px-3 py-2 text-center sm:px-4 sm:py-2.5">
          <div className="mb-0.5 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 sm:text-[10px]">
              Your challenge
            </span>
          </div>

          <h2 className="break-words text-xs font-extrabold leading-snug text-slate-800 sm:text-sm">
            {question}
          </h2>
        </div>
      )}

      {/* Compact Instructions and Progress */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="flex min-w-0 items-center gap-1 text-[9px] font-semibold text-white sm:text-xs">
          <Link2 className="h-3 w-3 shrink-0 text-cyan-500" />
          <span>Match one item from each column</span>
        </p>

        <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-extrabold text-cyan-700 sm:text-xs">
          {userMatches.length}/{totalPairs}
        </span>
      </div>

      {/* Matching Columns */}
      <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-3">

        {/* Source Column */}
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-700 sm:text-[10px]">
              Column A
            </span>
          </div>

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
                <span className="w-full break-words [overflow-wrap:anywhere]">
                  {item.text}
                </span>

                {match && (
                  <Check className="ml-1 h-3 w-3 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Target Column */}
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-violet-700 sm:text-[10px]">
              Column B
            </span>
          </div>

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
                <span className="w-full break-words [overflow-wrap:anywhere]">
                  {item.text}
                </span>

                {match && (
                  <Check className="ml-1 h-3 w-3 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
