// "use client";

// import React, { useState, useMemo } from "react";
// import {
//   FillInTheBlankPayload,
//   FillInTheBlankOption,
// } from "@/types/foundation/materials";
// import { Volume2, CheckCircle2 } from "lucide-react";
// import { GamifiedReactSpeechButton } from "@/components/global/admin/foundation/GamifiedReactSpeechSpeaker";
// import { GamifiedAudioSpeakerButton } from "@/components/global/admin/foundation/GamifiedAudioSpeakerButton";

// interface Props {
//   payload: FillInTheBlankPayload;
//   voiceLanguage?: string;
//   onAnswerChange: (isCorrect: boolean) => void;
// }

// export function FillInTheBlank({
//   payload,
//   voiceLanguage = "tl-PH",
//   onAnswerChange,
// }: Props) {
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   console.log(voiceLanguage)

//   // Normalize options array from payload
//   const options = useMemo<FillInTheBlankOption[]>(() => {
//     return (payload?.options || []).map((opt, index) => ({
//       id: opt.id || `opt-${index + 1}`,
//       word: opt.word || "",
//       isCorrect: Boolean(opt.isCorrect),
//     }));
//   }, [payload]);

//   // Extract sentence parts based on blankedWordIndex, explicit underscores, or target word
//   const { before, after } = useMemo(() => {
//     const fullSentence = payload?.fullSentence || "";
//     const wordIndex = payload?.blankedWordIndex;

//     // Strategy 1: Explicit index from builder
//     if (typeof wordIndex === "number" && wordIndex >= 0) {
//       const words = fullSentence.trim().split(/\s+/).filter(Boolean);
//       if (wordIndex < words.length) {
//         const beforeStr = words.slice(0, wordIndex).join(" ");
//         const afterStr = words.slice(wordIndex + 1).join(" ");
//         return { before: beforeStr, after: afterStr };
//       }
//     }

//     // Strategy 2: Explicit "____" in fullSentence string
//     if (fullSentence.includes("____")) {
//       const parts = fullSentence.split(/_+/);
//       return { before: parts[0]?.trim() || "", after: parts[1]?.trim() || "" };
//     }

//     // Strategy 3: Target word match fallback
//     const targetWord = payload?.targetWord || "";
//     if (targetWord && fullSentence.includes(targetWord)) {
//       const parts = fullSentence.split(targetWord);
//       return { before: parts[0]?.trim() || "", after: parts[1]?.trim() || "" };
//     }

//     return { before: fullSentence, after: "" };
//   }, [payload]);

//   const handleSelect = (optionId: string, isCorrect: boolean) => {
//     setSelectedId(optionId);
//     onAnswerChange(isCorrect);
//   };

//   const selectedOption = options.find((o) => o.id === selectedId);
//   const fullSentenceText = payload?.fullSentence || "";

//   const resolvedAudioUrl = useMemo(() => {
//     const rawAudio = payload?.mainAudio as unknown;
//     if (typeof rawAudio === "string") return rawAudio;
//     if (rawAudio instanceof File) {
//       return URL.createObjectURL(rawAudio);
//     }
//     if (payload?.audioUrl && payload.audioUrl !== "__SPEECH__") {
//       return payload.audioUrl;
//     }
//     return null;
//   }, [payload]);

//   return (
//     <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6">
//       {/* Sentence Card with Audio Speaker */}
//       <div className="relative w-full bg-slate-50 border-2 border-b-4 border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
//         <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
//           <div className="flex items-center gap-2">
//             <Volume2 className="w-4 h-4 text-sky-500" />
//             <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
//               Listen & Complete Sentence
//             </span>
//           </div>

//           {/* Audio Player / Speech Synthesizer */}
//           <div className="shrink-0 flex items-center gap-2">
//             <GamifiedAudioSpeakerButton
//               audioType={payload?.audioType}
//               audioUrl={resolvedAudioUrl}
//               text={fullSentenceText}
//               voiceLanguage={voiceLanguage}
//               size="sm"
//               variant="ghost"
//               showLabel={true}
//               label="Listen"
//             />
//           </div>
//         </div>

//         {/* Sentence Display with Dynamic Blank Slot */}
//         <div className="text-xl md:text-2xl font-black text-slate-800 leading-relaxed text-center py-2">
//           {before}{" "}
//           <span
//             className={`inline-flex items-center justify-center min-w-[120px] px-4 py-1 mx-1.5 rounded-2xl border-b-4 font-black transition-all ${
//               selectedOption
//                 ? "bg-amber-100 border-amber-500 text-amber-900 shadow-[0_2px_0_0_#f59e0b] scale-105"
//                 : "bg-slate-200/80 border-slate-300 text-slate-400 border-dashed border-2 min-h-[44px]"
//             }`}
//           >
//             {selectedOption ? selectedOption.word : "______"}
//           </span>{" "}
//           {after}
//         </div>
//       </div>

//       {/* Choice Options Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
//         {options.map((opt) => {
//           const isSelected = selectedId === opt.id;

//           return (
//             <div
//               key={opt.id}
//               onClick={() => handleSelect(opt.id, opt.isCorrect)}
//               className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 border-b-4 transition-all cursor-pointer select-none active:translate-y-0.5 ${
//                 isSelected
//                   ? "bg-sky-500 border-sky-600 text-white shadow-[0_4px_0_0_#0284c7]"
//                   : "bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 shadow-[0_4px_0_0_#e2e8f0]"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <span
//                   className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
//                     isSelected
//                       ? "bg-white/20 text-white"
//                       : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
//                   }`}
//                 >
//                   {isSelected ? (
//                     <CheckCircle2 className="w-4 h-4 text-white" />
//                   ) : (
//                     opt.id.replace("opt-", "")
//                   )}
//                 </span>
//                 <span className="text-lg font-black">{opt.word}</span>
//               </div>

//               {/* Individual Speech Button for Choice Word */}
//               <div
//                 className="shrink-0"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <GamifiedReactSpeechButton
//                   text={opt.word}
//                   voiceLanguage={voiceLanguage}
//                   size="sm"
//                   variant="ghost"
//                   showLabel={false}
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FillInTheBlankPayload,
  FillInTheBlankOption,
} from "@/types/foundation/materials";
import {
  Volume2,
  Check,
  RotateCcw,
  Sparkles,
  Puzzle,
} from "lucide-react";
import { GamifiedReactSpeechButton } from "@/components/global/admin/foundation/GamifiedReactSpeechSpeaker";
import { GamifiedAudioSpeakerButton } from "@/components/global/admin/foundation/GamifiedAudioSpeakerButton";

interface Props {
  payload: FillInTheBlankPayload;
  voiceLanguage?: string;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function FillInTheBlank({
  payload,
  voiceLanguage = "tl-PH",
  onAnswerChange,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [payload]);

  const options = useMemo<FillInTheBlankOption[]>(() => {
    return (payload?.options || []).map((opt, index) => ({
      id: opt.id || `opt-${index + 1}`,
      word: opt.word || "",
      isCorrect: Boolean(opt.isCorrect),
    }));
  }, [payload]);

  const { before, after } = useMemo(() => {
    const fullSentence = payload?.fullSentence || "";
    const wordIndex = payload?.blankedWordIndex;

    if (typeof wordIndex === "number" && wordIndex >= 0) {
      const words = fullSentence.trim().split(/\s+/).filter(Boolean);

      if (wordIndex < words.length) {
        return {
          before: words.slice(0, wordIndex).join(" "),
          after: words.slice(wordIndex + 1).join(" "),
        };
      }
    }

    if (fullSentence.includes("____")) {
      const parts = fullSentence.split(/_+/);

      return {
        before: parts[0]?.trim() || "",
        after: parts[1]?.trim() || "",
      };
    }

    const targetWord = payload?.targetWord || "";

    if (targetWord && fullSentence.includes(targetWord)) {
      const parts = fullSentence.split(targetWord);

      return {
        before: parts[0]?.trim() || "",
        after: parts[1]?.trim() || "",
      };
    }

    return { before: fullSentence, after: "" };
  }, [payload]);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    setSelectedId(optionId);
    onAnswerChange(isCorrect);
  };

  const handleRetry = () => {
    setSelectedId(null);
  };

  const selectedOption = options.find((option) => option.id === selectedId);
  const fullSentenceText = payload?.fullSentence || "";

  const resolvedAudioUrl = useMemo(() => {
    const rawAudio = payload?.mainAudio as unknown;

    if (typeof rawAudio === "string") return rawAudio;

    if (rawAudio instanceof File) {
      return URL.createObjectURL(rawAudio);
    }

    if (payload?.audioUrl && payload.audioUrl !== "__SPEECH__") {
      return payload.audioUrl;
    }

    return null;
  }, [payload]);

  const colors = [
    {
      badge: "bg-cyan-100 text-cyan-700",
      selected: "border-cyan-500 bg-cyan-50",
      shadow: "shadow-[0_3px_0_#06b6d4]",
      hover: "hover:border-cyan-400",
    },
    {
      badge: "bg-violet-100 text-violet-700",
      selected: "border-violet-500 bg-violet-50",
      shadow: "shadow-[0_3px_0_#8b5cf6]",
      hover: "hover:border-violet-400",
    },
    {
      badge: "bg-amber-100 text-amber-700",
      selected: "border-amber-500 bg-amber-50",
      shadow: "shadow-[0_3px_0_#f59e0b]",
      hover: "hover:border-amber-400",
    },
    {
      badge: "bg-emerald-100 text-emerald-700",
      selected: "border-emerald-500 bg-emerald-50",
      shadow: "shadow-[0_3px_0_#10b981]",
      hover: "hover:border-emerald-400",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl select-none flex-col items-center gap-2">

      {/* Compact Activity Header */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1">
          <Puzzle className="h-3.5 w-3.5 text-cyan-600" />
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700">
            Fill in the Blank
          </span>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-[0_2px_0_#e2e8f0] transition-all hover:border-cyan-300 hover:text-cyan-600 active:translate-y-0.5 active:shadow-none"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>

      {/* Compact Sentence Card */}
      <div className="w-full rounded-2xl border-2 border-slate-200 border-b-4 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">

        {/* Audio Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
              <Volume2 className="h-3.5 w-3.5 text-cyan-600" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Listen & Complete
            </span>
          </div>

          <div className="shrink-0">
            <GamifiedAudioSpeakerButton
              audioType={payload?.audioType}
              audioUrl={resolvedAudioUrl}
              text={fullSentenceText}
              voiceLanguage={voiceLanguage}
              size="sm"
              variant="ghost"
              showLabel={true}
              label="Listen"
            />
          </div>
        </div>

        {/* Sentence and Blank */}
        <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-x-2 gap-y-1.5 py-3 text-center text-base font-black leading-snug text-slate-800 sm:text-xl">
          {before && <span>{before}</span>}

          <span
            className={`inline-flex min-h-10 min-w-[100px] items-center justify-center rounded-xl border-2 border-b-4 px-3 py-1.5 transition-all duration-200 sm:min-w-[120px] ${
              selectedOption
                ? "border-amber-400 bg-amber-100 text-amber-900 shadow-[0_2px_0_#f59e0b]"
                : "border-dashed border-cyan-300 bg-cyan-50 text-cyan-500"
            }`}
          >
            {selectedOption ? selectedOption.word : "______"}
          </span>

          {after && <span>{after}</span>}
        </div>

        {/* Compact Instruction */}
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Choose the missing word
          </p>
        </div>
      </div>

      {/* Compact Answer Options */}
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt, idx) => {
          const isSelected = selectedId === opt.id;
          const color = colors[idx % colors.length];

          return (
            <div key={opt.id} className="relative min-w-0">
              <button
                type="button"
                onClick={() => handleSelect(opt.id, opt.isCorrect)}
                className={`group flex min-h-[54px] w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2 pr-12 text-left transition-all duration-200 sm:min-h-[60px] ${
                  isSelected
                    ? `${color.selected} ${color.shadow}`
                    : `border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_#e2e8f0] ${color.hover} hover:-translate-y-0.5`
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${color.badge}`}
                >
                  {isSelected ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>

                <span className="min-w-0 flex-1 break-words text-sm font-extrabold text-slate-700">
                  {opt.word}
                </span>
              </button>

              {/* Individual Speech Button */}
              <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-white">
                <GamifiedReactSpeechButton
                  text={opt.word}
                  voiceLanguage={voiceLanguage}
                  size="sm"
                  variant="ghost"
                  showLabel={false}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
