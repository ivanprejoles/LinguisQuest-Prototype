// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Plus, Trash2, ArrowRightLeft, Sparkles } from "lucide-react";
// import { MatchingPairsPayload, MatchingPairItem } from "@/types/foundation/materials";

// export interface MatchingPairsFormProps {
//   initialData?: Partial<MatchingPairsPayload>;
//   onChange: (payload: MatchingPairsPayload) => void;
// }

// export function MatchingPairsForm({
//   initialData,
//   onChange,
// }: MatchingPairsFormProps) {
//   // 1. Initialize state strictly once on mount (SentenceBuilder pattern)
//   const [question, setQuestion] = useState(
//     initialData?.question ?? "Tap the matching pairs"
//   );

//   const [pairs, setPairs] = useState<MatchingPairItem[]>(() => {
//     if (initialData?.pairs && initialData.pairs.length > 0) {
//       return initialData.pairs.map((p) => ({
//         id: p.id || `pair-${Math.random().toString(36).substring(2, 9)}`,
//         sourceText: p.sourceText ?? "",
//         targetText: p.targetText ?? "",
//       }));
//     }
//     return [
//       { id: "pair-1", sourceText: "", targetText: "" },
//       { id: "pair-2", sourceText: "", targetText: "" },
//       { id: "pair-3", sourceText: "", targetText: "" },
//       { id: "pair-4", sourceText: "", targetText: "" },
//     ];
//   });

//   // Stabilize onChange ref to prevent parent re-render reference changes from triggering infinite loops
//   const onChangeRef = useRef(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   // 2. Sync state back to parent StageModal payload
//   useEffect(() => {
//     const hasEnoughPairs = pairs.length >= 2;
//     const allPairsFilled = pairs.every(
//       (p) => p.sourceText.trim().length > 0 && p.targetText.trim().length > 0
//     );
//     const isValid =
//       question.trim().length > 0 && hasEnoughPairs && allPairsFilled;

//     const payload: MatchingPairsPayload = {
//       type: "matching",
//       question,
//       pairs: pairs.map((p) => ({
//         id: p.id,
//         sourceText: p.sourceText.trim(),
//         targetText: p.targetText.trim(),
//       })),
//       isValid,
//     };

//     onChangeRef.current(payload);
//   }, [question, pairs]);

//   // Actions
//   const handleAddPair = () => {
//     if (pairs.length >= 6) return;
//     setPairs((prev) => [
//       ...prev,
//       { id: `pair-${Date.now()}`, sourceText: "", targetText: "" },
//     ]);
//   };

//   const handleRemovePair = (id: string) => {
//     if (pairs.length <= 2) return;
//     setPairs((prev) => prev.filter((p) => p.id !== id));
//   };

//   const handlePairTextChange = (
//     id: string,
//     field: "sourceText" | "targetText",
//     value: string
//   ) => {
//     setPairs((prev) =>
//       prev.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair))
//     );
//   };

//   return (
//     <div className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
//       {/* 1. Instruction / Prompt Header */}
//       <div>
//         <Label className="text-xs font-black uppercase text-slate-500 mb-1 block tracking-wider">
//           Instruction / Question Title
//         </Label>
//         <Input
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           placeholder="e.g. Tap the matching pairs"
//           className="font-bold h-11 rounded-xl bg-white border-2 border-slate-200 focus:border-green-500 transition-colors"
//         />
//       </div>

//       {/* 2. Pairs Header & Quick Add */}
//       <div className="flex items-center justify-between pt-1">
//         <div>
//           <Label className="text-xs font-black uppercase text-slate-500 block tracking-wider">
//             Word Pairs Setup
//           </Label>
//           <span className="text-[11px] font-bold text-slate-400">
//             Define target words and their matching translations (2-6 pairs)
//           </span>
//         </div>
//         <Button
//           type="button"
//           size="sm"
//           onClick={handleAddPair}
//           disabled={pairs.length >= 6}
//           className="bg-green-500 hover:bg-green-600 active:translate-y-0.5 text-white font-black rounded-xl h-9 px-3.5 flex items-center gap-1.5 shadow-[0_3px_0_0_#16a34a] disabled:opacity-50 disabled:shadow-none transition-all"
//         >
//           <Plus className="w-4 h-4 stroke-[3]" />
//           <span>Add Pair</span>
//         </Button>
//       </div>

//       {/* 3. Matching Pairs List */}
//       <div className="space-y-3">
//         {pairs.map((pair, idx) => (
//           <div
//             key={pair.id}
//             className="group relative bg-white border-2 border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3 transition-all"
//           >
//             {/* Pair Index Badge */}
//             <div className="flex items-center gap-2 self-start sm:self-center">
//               <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500">
//                 {idx + 1}
//               </span>
//             </div>

//             {/* Target Language Word */}
//             <div className="flex-1 w-full">
//               <Input
//                 value={pair.sourceText}
//                 onChange={(e) =>
//                   handlePairTextChange(pair.id, "sourceText", e.target.value)
//                 }
//                 placeholder="Target word (e.g. Hola)"
//                 className="font-extrabold h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-green-500 text-slate-800"
//               />
//             </div>

//             {/* Connection Icon */}
//             <div className="hidden sm:flex items-center justify-center text-slate-300">
//               <ArrowRightLeft className="w-4 h-4" />
//             </div>

//             {/* Translation Word */}
//             <div className="flex-1 w-full">
//               <Input
//                 value={pair.targetText}
//                 onChange={(e) =>
//                   handlePairTextChange(pair.id, "targetText", e.target.value)
//                 }
//                 placeholder="Translation (e.g. Hello)"
//                 className="font-extrabold h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-green-500 text-slate-800"
//               />
//             </div>

//             {/* Remove Action Button */}
//             <Button
//               type="button"
//               variant="ghost"
//               size="icon"
//               onClick={() => handleRemovePair(pair.id)}
//               disabled={pairs.length <= 2}
//               className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 self-end sm:self-center shrink-0"
//             >
//               <Trash2 className="w-4 h-4" />
//             </Button>
//           </div>
//         ))}
//       </div>

//       {/* 4. Teacher Tip Card */}
//       <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 flex items-start gap-3">
//         <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
//         <p className="text-xs font-bold text-sky-800 leading-relaxed">
//           <strong>Teacher Tip:</strong> The word bank will automatically scramble both sides during gameplay so students can tap items to match them.
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowRightLeft, Sparkles } from "lucide-react";
import { MatchingPairsPayload, MatchingPairItem } from "@/types/foundation/materials";

export interface MatchingPairsFormProps {
  initialData?: Partial<MatchingPairsPayload> | null;
  onSubmit: (payload: MatchingPairsPayload) => void;
}

// Matching Pairs
export function MatchingPairsForm({
  initialData,
  onSubmit,
}: MatchingPairsFormProps) {
  // 1. Initialize state strictly once on mount
  const [question, setQuestion] = useState(
    initialData?.question ?? "Tap the matching pairs"
  );

  const [pairs, setPairs] = useState<MatchingPairItem[]>(() => {
    if (initialData?.pairs && initialData.pairs.length > 0) {
      return initialData.pairs.map((p) => ({
        id: p.id || `pair-${Math.random().toString(36).substring(2, 9)}`,
        sourceText: p.sourceText ?? "",
        targetText: p.targetText ?? "",
      }));
    }
    return [
      { id: "pair-1", sourceText: "", targetText: "" },
      { id: "pair-2", sourceText: "", targetText: "" },
      { id: "pair-3", sourceText: "", targetText: "" },
      { id: "pair-4", sourceText: "", targetText: "" },
    ];
  });

  // 2. Direct form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanQuestion = question.trim();
    const cleanedPairs = pairs.map((p) => ({
      id: p.id,
      sourceText: p.sourceText.trim(),
      targetText: p.targetText.trim(),
    }));

    const hasEnoughPairs = cleanedPairs.length >= 2;
    const allPairsFilled = cleanedPairs.every(
      (p) => p.sourceText.length > 0 && p.targetText.length > 0
    );

    const isValid = cleanQuestion.length > 0 && hasEnoughPairs && allPairsFilled;

    const payload: MatchingPairsPayload = {
      type: "matching",
      question: cleanQuestion,
      pairs: cleanedPairs,
      isValid,
    };

    onSubmit(payload);
  };

  // Internal Action Handlers
  const handleAddPair = () => {
    if (pairs.length >= 6) return;
    setPairs((prev) => [
      ...prev,
      { id: `pair-${Date.now()}`, sourceText: "", targetText: "" },
    ]);
  };

  const handleRemovePair = (id: string) => {
    if (pairs.length <= 2) return;
    setPairs((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePairTextChange = (
    id: string,
    field: "sourceText" | "targetText",
    value: string
  ) => {
    setPairs((prev) =>
      prev.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair))
    );
  };

  return (
    <form
      id="stage-activity-form"
      onSubmit={handleSubmit}
      className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl"
    >
      {/* 1. Instruction / Prompt Header */}
      <div>
        <Label className="text-xs font-black uppercase text-slate-500 mb-1 block tracking-wider">
          Instruction / Question Title <span className="text-red-500">*</span>
        </Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Tap the matching pairs"
          className="font-bold h-11 rounded-xl bg-white border-2 border-slate-200 focus:border-green-500 transition-colors"
        />
      </div>

      {/* 2. Pairs Header & Quick Add */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <Label className="text-xs font-black uppercase text-slate-500 block tracking-wider">
            Word Pairs Setup
          </Label>
          <span className="text-[11px] font-bold text-slate-400">
            Define target words and their matching translations (2-6 pairs)
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddPair}
          disabled={pairs.length >= 6}
          className="bg-green-500 hover:bg-green-600 active:translate-y-0.5 text-white font-black rounded-xl h-9 px-3.5 flex items-center gap-1.5 shadow-[0_3px_0_0_#16a34a] disabled:opacity-50 disabled:shadow-none transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Pair</span>
        </Button>
      </div>

      {/* 3. Matching Pairs List */}
      <div className="space-y-3">
        {pairs.map((pair, idx) => (
          <div
            key={pair.id}
            className="group relative bg-white border-2 border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3 transition-all"
          >
            {/* Pair Index Badge */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500">
                {idx + 1}
              </span>
            </div>

            {/* Target Language Word */}
            <div className="flex-1 w-full">
              <Input
                value={pair.sourceText}
                onChange={(e) =>
                  handlePairTextChange(pair.id, "sourceText", e.target.value)
                }
                placeholder="Target word (e.g. Hola)"
                className="font-extrabold h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-green-500 text-slate-800"
              />
            </div>

            {/* Connection Icon */}
            <div className="hidden sm:flex items-center justify-center text-slate-300">
              <ArrowRightLeft className="w-4 h-4" />
            </div>

            {/* Translation Word */}
            <div className="flex-1 w-full">
              <Input
                value={pair.targetText}
                onChange={(e) =>
                  handlePairTextChange(pair.id, "targetText", e.target.value)
                }
                placeholder="Translation (e.g. Hello)"
                className="font-extrabold h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-green-500 text-slate-800"
              />
            </div>

            {/* Remove Action Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePair(pair.id)}
              disabled={pairs.length <= 2}
              className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 self-end sm:self-center shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* 4. Teacher Tip Card */}
      <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-sky-800 leading-relaxed">
          <strong>Teacher Tip:</strong> The word bank will automatically scramble both sides during gameplay so students can tap items to match them.
        </p>
      </div>
    </form>
  );
}