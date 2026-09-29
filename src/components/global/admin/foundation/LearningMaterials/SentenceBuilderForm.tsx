// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Plus,
//   X,
//   AlertCircle,
//   Sparkles,
//   CheckCircle2,
//   Volume2,
//   Mic,
//   Bot,
// } from "lucide-react";
// import { AudioRecorder } from "../AudioRecorder";
// import { ReactSpeechButton } from "../ReactSpeechSpeaker";
// import { AudioMode, SentenceBuilderPayload } from "@/types/foundation/materials";

// export interface SentenceBuilderFormProps {
//   initialData?: Partial<SentenceBuilderPayload>;
//   onChange: (payload: SentenceBuilderPayload) => void;
// }

// export const SentenceBuilderForm: React.FC<SentenceBuilderFormProps> = ({
//   initialData,
//   onChange,
// }) => {
//   // 1. Initialize state
//   const [promptSentence, setPromptSentence] = useState(
//     initialData?.question ?? ""
//   );
//   const [audioMode, setAudioMode] = useState<AudioMode>(
//     initialData?.audioType ?? "recorded"
//   );
//   const [audioFile, setAudioFile] = useState<File | null>(
//     initialData?.audioFile ?? null
//   );
//   const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(
//     initialData?.audioUrl ?? null
//   );
//   const [wordInput, setWordInput] = useState("");
//   const [wordPool, setWordPool] = useState<string[]>(
//     initialData?.scrambledWordBank ?? []
//   );

//   // Initial sequence indices calculation
//   const [correctSequenceIndices, setCorrectSequenceIndices] = useState<number[]>(() => {
//     if (initialData?.correctSentenceArray && initialData?.scrambledWordBank) {
//       const bank = initialData.scrambledWordBank;
//       const usedIndices = new Set<number>();

//       return initialData.correctSentenceArray
//         .map((word) => {
//           const foundIdx = bank.findIndex(
//             (item, idx) => item === word && !usedIndices.has(idx)
//           );
//           if (foundIdx !== -1) {
//             usedIndices.add(foundIdx);
//             return foundIdx;
//           }
//           return -1;
//         })
//         .filter((idx) => idx !== -1);
//     }
//     return [];
//   });

//   // Minimum pool size rule (at least 3 words required)
//   const MIN_POOL_SIZE = 3;
//   const isPoolSizeValid = wordPool.length >= MIN_POOL_SIZE;

//   // Stabilize onChange ref to prevent parent function reference changes from re-triggering effects
//   const onChangeRef = useRef(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   // 2. Sync changes back to parent StageModal payload
//   useEffect(() => {
//     const correctSentenceArray = correctSequenceIndices
//       .map((i) => wordPool[i])
//       .filter((w): w is string => w !== undefined);

//     const audioUrlPayload = (
//       audioMode === "speech" ? "__SPEECH__" : existingAudioUrl
//     ) as "__SPEECH__" | null;

//     onChangeRef.current({
//       question: promptSentence,
//       scrambledWordBank: wordPool,
//       correctSentenceArray,
//       audioType: audioMode,
//       audioUrl: audioUrlPayload,
//       audioFile: audioMode === "recorded" ? audioFile : null,
//       isValid:
//         isPoolSizeValid &&
//         correctSequenceIndices.length > 0 &&
//         promptSentence.trim().length > 0,
//       type: "sentenceBuilder",
//     });
//   }, [
//     promptSentence,
//     wordPool,
//     correctSequenceIndices,
//     isPoolSizeValid,
//     audioMode,
//     audioFile,
//     existingAudioUrl,
//   ]);

//   // Actions
//   const handleAddWord = () => {
//     const trimmed = wordInput.trim();
//     if (!trimmed) return;
//     setWordPool([...wordPool, trimmed]);
//     setWordInput("");
//   };

//   // Remove word tile from pool AND recalculate order bank indices
//   const handleRemoveWordFromPool = (indexToRemove: number) => {
//     setWordPool(wordPool.filter((_, idx) => idx !== indexToRemove));
//     setCorrectSequenceIndices(
//       correctSequenceIndices
//         .filter((idx) => idx !== indexToRemove)
//         .map((idx) => (idx > indexToRemove ? idx - 1 : idx))
//     );
//   };

//   // Toggle word selection from Word Bank
//   const handleToggleWordFromPool = (poolIndex: number) => {
//     if (correctSequenceIndices.includes(poolIndex)) {
//       setCorrectSequenceIndices(
//         correctSequenceIndices.filter((i) => i !== poolIndex)
//       );
//     } else {
//       setCorrectSequenceIndices([...correctSequenceIndices, poolIndex]);
//     }
//   };

//   // Remove specific word at index position directly inside Target Answer Order
//   const handleRemoveFromSequenceAt = (sequencePositionToRemove: number) => {
//     setCorrectSequenceIndices(
//       correctSequenceIndices.filter((_, pos) => pos !== sequencePositionToRemove)
//     );
//   };

//   return (
//     <div className="pt-2 flex flex-col gap-5">
//       {/* 1. Target Sentence Prompt */}
//       <div className="space-y-1.5">
//         <label className="text-xs font-black uppercase tracking-wider text-slate-500">
//           Tagalog / Target Sentence Prompt <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <Input
//             value={promptSentence}
//             onChange={(e) => setPromptSentence(e.target.value)}
//             placeholder="e.g. Ang pusa ay kumakain ng isda"
//             className="h-14 px-5 rounded-2xl border-2 border-slate-300 focus-visible:border-green-500 font-extrabold text-base text-slate-800 shadow-[0_3px_0_0_#e2e8f0]"
//           />
//         </div>
//       </div>

//       {/* 2. Audio Source Selector */}
//       <div className="space-y-2">
//         <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//           <Volume2 className="w-4 h-4 text-green-500" /> Sentence Pronunciation Audio Source
//         </label>

//         <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
//           <button
//             type="button"
//             onClick={() => setAudioMode("recorded")}
//             className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
//               audioMode === "recorded"
//                 ? "bg-white text-slate-800 shadow-sm border border-slate-200"
//                 : "text-slate-500 hover:text-slate-700"
//             }`}
//           >
//             <Mic className="w-4 h-4 text-green-500" /> Custom Audio Upload / Record
//           </button>

//           <button
//             type="button"
//             onClick={() => setAudioMode("speech")}
//             className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
//               audioMode === "speech"
//                 ? "bg-white text-slate-800 shadow-sm border border-slate-200"
//                 : "text-slate-500 hover:text-slate-700"
//             }`}
//           >
//             <Bot className="w-4 h-4 text-blue-500" /> React Speech Speaker
//           </button>
//         </div>

//         {audioMode === "recorded" ? (
//           <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 animate-in fade-in duration-150">
//             <AudioRecorder onAudioReady={setAudioFile} />
//           </div>
//         ) : (
//           <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-150">
//             <div className="space-y-1">
//               <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
//                 <Sparkles className="w-4 h-4 text-blue-500" /> Dynamic Speech Synthesis Active
//               </p>
//               <p className="text-[11px] font-bold text-blue-600">
//                 Audio will be synthesized live on user devices via Text-to-Speech using the target prompt.
//               </p>
//             </div>

//             <div className="shrink-0 flex items-center gap-2">
//               <ReactSpeechButton
//                 text={promptSentence}
//                 voiceLanguage="tl-PH"
//                 size="sm"
//                 variant="ghost"
//                 showLabel={true}
//                 label="Test Voice"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* 3. Word Tile Bank */}
//       <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
//             <Sparkles className="w-4 h-4 text-green-500" />
//             Word Tile Bank Container
//           </label>

//           <div className="text-[11px] font-extrabold flex items-center gap-1">
//             {isPoolSizeValid ? (
//               <span className="text-green-600 flex items-center gap-1">
//                 <CheckCircle2 className="w-3.5 h-3.5" /> Pool Size Valid ({wordPool.length} / 3 min)
//               </span>
//             ) : (
//               <span className="text-amber-600 flex items-center gap-1">
//                 <AlertCircle className="w-3.5 h-3.5" /> Need at least 3 word tiles ({wordPool.length}/3)
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <Input
//             value={wordInput}
//             onChange={(e) => setWordInput(e.target.value)}
//             onKeyDown={(e) =>
//               e.key === "Enter" && (e.preventDefault(), handleAddWord())
//             }
//             placeholder="Add word tile..."
//             className="h-12 px-4 rounded-xl border-2 border-slate-300 font-bold text-sm bg-white"
//           />
//           <Button
//             type="button"
//             onClick={handleAddWord}
//             className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 font-black shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none"
//           >
//             <Plus className="w-5 h-5" />
//           </Button>
//         </div>

//         <div className="flex flex-wrap gap-2 pt-2 min-h-[50px]">
//           {wordPool.length === 0 && (
//             <p className="text-xs font-bold text-slate-400 italic">
//               No word tiles added yet. Add at least 3 words.
//             </p>
//           )}

//           {wordPool.map((word, index) => {
//             const sequencePos = correctSequenceIndices.indexOf(index);
//             const isSelected = sequencePos !== -1;

//             return (
//               <div
//                 key={index}
//                 onClick={() => handleToggleWordFromPool(index)}
//                 className={`cursor-pointer relative group rounded-2xl border-2 px-4 py-2 font-black text-sm transition-all duration-150 flex items-center gap-2 select-none ${
//                   isSelected
//                     ? "bg-green-100 border-green-500 text-green-700 shadow-[0_3px_0_0_#22c55e]"
//                     : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 shadow-[0_3px_0_0_#cbd5e1]"
//                 }`}
//               >
//                 {isSelected && (
//                   <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-black flex items-center justify-center">
//                     {sequencePos + 1}
//                   </span>
//                 )}

//                 <span>{word}</span>

//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleRemoveWordFromPool(index);
//                   }}
//                   className="ml-1 text-slate-300 hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity"
//                 >
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* 4. Target Answer Sequence Container */}
//       <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-2">
//         <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
//           Target Answer Order (Tap word tiles above or tap below to remove)
//         </label>

//         <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-white rounded-xl border border-slate-200 items-center">
//           {correctSequenceIndices.length === 0 ? (
//             <span className="text-xs font-bold text-slate-400">
//               Tap tiles above in the correct order...
//             </span>
//           ) : (
//             correctSequenceIndices.map((poolIndex, pos) => (
//               <div
//                 key={pos}
//                 onClick={() => handleRemoveFromSequenceAt(pos)}
//                 className="cursor-pointer bg-slate-800 text-white rounded-xl border-2 border-slate-900 px-3.5 py-1.5 text-xs font-black shadow-[0_3px_0_0_#0f172a] flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100 group hover:bg-red-900 transition-colors"
//               >
//                 <span className="w-4 h-4 rounded-full bg-green-500 text-slate-900 text-[9px] font-black flex items-center justify-center">
//                   {pos + 1}
//                 </span>
//                 <span>{wordPool[poolIndex]}</span>
//                 <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Volume2,
  Mic,
  Bot,
} from "lucide-react";
import { AudioRecorder } from "../AudioRecorder";
import { ReactSpeechButton } from "../ReactSpeechSpeaker";
import { AudioMode, SentenceBuilderPayload } from "@/types/foundation/materials";

export interface SentenceBuilderFormProps {
  initialData?: Partial<SentenceBuilderPayload> | null;
  onSubmit: (payload: SentenceBuilderPayload) => void;
}

export const SentenceBuilderForm: React.FC<SentenceBuilderFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [promptSentence, setPromptSentence] = useState(
    initialData?.question ?? ""
  );
  const [audioMode, setAudioMode] = useState<AudioMode>(
    initialData?.audioType ?? "recorded"
);
  const [audioFile, setAudioFile] = useState<File | null>(
    initialData?.audioFile ?? null
  );
  const [existingAudioUrl] = useState<string | null>(
    initialData?.audioUrl ?? null
  );
  const [wordInput, setWordInput] = useState("");
  const [wordPool, setWordPool] = useState<string[]>(
    initialData?.scrambledWordBank ?? []
  );

  const [correctSequenceIndices, setCorrectSequenceIndices] = useState<number[]>(() => {
    if (initialData?.correctSentenceArray && initialData?.scrambledWordBank) {
      const bank = initialData.scrambledWordBank;
      const usedIndices = new Set<number>();

      return initialData.correctSentenceArray
        .map((word) => {
          const foundIdx = bank.findIndex(
            (item, idx) => item === word && !usedIndices.has(idx)
          );
          if (foundIdx !== -1) {
            usedIndices.add(foundIdx);
            return foundIdx;
          }
          return -1;
        })
        .filter((idx) => idx !== -1);
    }
    return [];
  });

  const MIN_POOL_SIZE = 3;
  const isPoolSizeValid = wordPool.length >= MIN_POOL_SIZE;

  // Runs ONLY when the Save button (or Enter key) triggers form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const correctSentenceArray = correctSequenceIndices
      .map((i) => wordPool[i])
      .filter((w): w is string => w !== undefined);

    const audioUrlPayload = (
      audioMode === "speech" ? "__SPEECH__" : existingAudioUrl
    ) as "__SPEECH__" | null;

    const isValid =
      isPoolSizeValid &&
      correctSequenceIndices.length > 0 &&
      promptSentence.trim().length > 0;

    onSubmit({
      question: promptSentence,
      scrambledWordBank: wordPool,
      correctSentenceArray,
      audioType: audioMode,
      audioUrl: audioUrlPayload,
      audioFile: audioMode === "recorded" ? audioFile : null,
      isValid,
      type: "sentenceBuilder",
    });
  };

  const handleAddWord = () => {
    const trimmed = wordInput.trim();
    if (!trimmed) return;
    setWordPool((prev) => [...prev, trimmed]);
    setWordInput("");
  };

  const handleRemoveWordFromPool = (indexToRemove: number) => {
    setWordPool((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setCorrectSequenceIndices((prev) =>
      prev
        .filter((idx) => idx !== indexToRemove)
        .map((idx) => (idx > indexToRemove ? idx - 1 : idx))
    );
  };

  const handleToggleWordFromPool = (poolIndex: number) => {
    setCorrectSequenceIndices((prev) =>
      prev.includes(poolIndex)
        ? prev.filter((i) => i !== poolIndex)
        : [...prev, poolIndex]
    );
  };

  const handleRemoveFromSequenceAt = (sequencePositionToRemove: number) => {
    setCorrectSequenceIndices((prev) =>
      prev.filter((_, pos) => pos !== sequencePositionToRemove)
    );
  };

  return (
    <form
      id="stage-activity-form"
      onSubmit={handleSubmit}
      className="pt-2 flex flex-col gap-5"
    >
      {/* Target Sentence Prompt */}
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">
          Tagalog / Target Sentence Prompt <span className="text-red-500">*</span>
        </label>
        <Input
          value={promptSentence}
          onChange={(e) => setPromptSentence(e.target.value)}
          placeholder="e.g. Ang pusa ay kumakain ng isda"
          className="h-14 px-5 rounded-2xl border-2 border-slate-300 focus-visible:border-green-500 font-extrabold text-base text-slate-800 shadow-[0_3px_0_0_#e2e8f0]"
        />
      </div>

      {/* Audio Source Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-green-500" /> Sentence Pronunciation Audio Source
        </label>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setAudioMode("recorded")}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              audioMode === "recorded"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Mic className="w-4 h-4 text-green-500" /> Custom Audio Upload / Record
          </button>

          <button
            type="button"
            onClick={() => setAudioMode("speech")}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              audioMode === "speech"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bot className="w-4 h-4 text-blue-500" /> React Speech Speaker
          </button>
        </div>

        {audioMode === "recorded" ? (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 animate-in fade-in duration-150">
            <AudioRecorder onAudioReady={setAudioFile} />
          </div>
        ) : (
          <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" /> Dynamic Speech Synthesis Active
              </p>
              <p className="text-[11px] font-bold text-blue-600">
                Audio will be synthesized live on user devices via Text-to-Speech using the target prompt.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <ReactSpeechButton
                text={promptSentence}
                voiceLanguage="tl-PH"
                size="sm"
                variant="ghost"
                showLabel={true}
                label="Test Voice"
              />
            </div>
          </div>
        )}
      </div>

      {/* Word Tile Bank */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-green-500" />
            Word Tile Bank Container
          </label>

          <div className="text-[11px] font-extrabold flex items-center gap-1">
            {isPoolSizeValid ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pool Size Valid ({wordPool.length} / 3 min)
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Need at least 3 word tiles ({wordPool.length}/3)
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddWord())
            }
            placeholder="Add word tile..."
            className="h-12 px-4 rounded-xl border-2 border-slate-300 font-bold text-sm bg-white"
          />
          <Button
            type="button"
            onClick={handleAddWord}
            className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 font-black shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 min-h-[50px]">
          {wordPool.length === 0 && (
            <p className="text-xs font-bold text-slate-400 italic">
              No word tiles added yet. Add at least 3 words.
            </p>
          )}

          {wordPool.map((word, index) => {
            const sequencePos = correctSequenceIndices.indexOf(index);
            const isSelected = sequencePos !== -1;

            return (
              <div
                key={index}
                onClick={() => handleToggleWordFromPool(index)}
                className={`cursor-pointer relative group rounded-2xl border-2 px-4 py-2 font-black text-sm transition-all duration-150 flex items-center gap-2 select-none ${
                  isSelected
                    ? "bg-green-100 border-green-500 text-green-700 shadow-[0_3px_0_0_#22c55e]"
                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 shadow-[0_3px_0_0_#cbd5e1]"
                }`}
              >
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-black flex items-center justify-center">
                    {sequencePos + 1}
                  </span>
                )}

                <span>{word}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWordFromPool(index);
                  }}
                  className="ml-1 text-slate-300 hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Answer Sequence Container */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          Target Answer Order (Tap word tiles above or tap below to remove)
        </label>

        <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-white rounded-xl border border-slate-200 items-center">
          {correctSequenceIndices.length === 0 ? (
            <span className="text-xs font-bold text-slate-400">
              Tap tiles above in the correct order...
            </span>
          ) : (
            correctSequenceIndices.map((poolIndex, pos) => (
              <div
                key={pos}
                onClick={() => handleRemoveFromSequenceAt(pos)}
                className="cursor-pointer bg-slate-800 text-white rounded-xl border-2 border-slate-900 px-3.5 py-1.5 text-xs font-black shadow-[0_3px_0_0_#0f172a] flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100 group hover:bg-red-900 transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-green-500 text-slate-900 text-[9px] font-black flex items-center justify-center">
                  {pos + 1}
                </span>
                <span>{wordPool[poolIndex]}</span>
                <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </div>
            ))
          )}
        </div>
      </div>
    </form>
  );
};