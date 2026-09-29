// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { AudioRecorder } from "../AudioRecorder";
// import { ReactSpeechButton } from "../ReactSpeechSpeaker";
// import {
//   Plus,
//   Trash2,
//   Volume2,
//   Sparkles,
//   CheckCircle2,
//   RotateCcw,
//   Mic,
//   Bot,
// } from "lucide-react";
// import { AudioMode, TapWhatYouHearPayload } from "@/types/foundation/materials";

// export interface TapWhatYouHearFormProps {
//   initialData?: Partial<TapWhatYouHearPayload>;
//   onChange: (payload: TapWhatYouHearPayload) => void;
// }

// export function TapWhatYouHearForm({ initialData, onChange }: TapWhatYouHearFormProps) {
//   // 1. Initialize state strictly once on mount (SentenceBuilder pattern)
//   const [targetSentence, setTargetSentence] = useState(
//     initialData?.targetSentence ?? initialData?.question ?? ""
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

//   const [wordBank, setWordBank] = useState<string[]>(
//     initialData?.wordBank ?? []
//   );
//   const [newWord, setNewWord] = useState("");

//   // Track correct sequence using word bank indices to mirror SentenceBuilder
//   const [correctSequenceIndices, setCorrectSequenceIndices] = useState<number[]>(() => {
//     if (initialData?.correctSequence && initialData?.wordBank) {
//       const bank = initialData.wordBank;
//       const usedIndices = new Set<number>();

//       return initialData.correctSequence
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

//   // Stabilize onChange ref to prevent parent function reference changes from re-triggering effects
//   const onChangeRef = useRef(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   // 2. Sync state back to parent StageModal payload
//   useEffect(() => {
//     const correctSequence = correctSequenceIndices
//       .map((i) => wordBank[i])
//       .filter((w): w is string => w !== undefined);

//     const isAudioValid =
//       audioMode === "speech" || audioFile !== null || Boolean(existingAudioUrl);

//     const isValid =
//       targetSentence.trim().length > 0 &&
//       wordBank.length > 0 &&
//       correctSequence.length > 0 &&
//       isAudioValid;

//     const audioUrlPayload = (
//       audioMode === "speech" ? "__SPEECH__" : existingAudioUrl
//     ) as "__SPEECH__" | null;

//     onChangeRef.current({
//       type: "tapWhatYouHear",
//       question: targetSentence,
//       targetSentence,
//       audioType: audioMode,
//       audioUrl: audioUrlPayload,
//       audioFile: audioMode === "recorded" ? audioFile : null,
//       wordBank,
//       correctSequence,
//       isValid,
//     });
//   }, [
//     targetSentence,
//     audioMode,
//     audioFile,
//     existingAudioUrl,
//     wordBank,
//     correctSequenceIndices,
//   ]);

//   // Actions
//   const handleAddWord = () => {
//     const trimmed = newWord.trim();
//     if (!trimmed) return;
//     setWordBank([...wordBank, trimmed]);
//     setNewWord("");
//   };

//   // Remove word tile from pool AND recalculate sequence bank indices
//   const handleRemoveWordFromBank = (indexToRemove: number) => {
//     setWordBank(wordBank.filter((_, idx) => idx !== indexToRemove));
//     setCorrectSequenceIndices(
//       correctSequenceIndices
//         .filter((idx) => idx !== indexToRemove)
//         .map((idx) => (idx > indexToRemove ? idx - 1 : idx))
//     );
//   };

//   // Handle selecting word tile into sequence
//   const handleTapWordToSequence = (bankIndex: number) => {
//     if (correctSequenceIndices.includes(bankIndex)) return;
//     setCorrectSequenceIndices([...correctSequenceIndices, bankIndex]);
//   };

//   // Remove specific word at sequence position
//   const handleRemoveFromSequenceAt = (sequencePosToRemove: number) => {
//     setCorrectSequenceIndices(
//       correctSequenceIndices.filter((_, pos) => pos !== sequencePosToRemove)
//     );
//   };

//   return (
//     <div className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
//       {/* 1. Target Sentence & Audio Source Selection */}
//       <div className="space-y-3">
//         <div>
//           <Label className="text-xs font-black uppercase text-slate-500 mb-1 block">
//             Target Sentence <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             value={targetSentence}
//             onChange={(e) => setTargetSentence(e.target.value)}
//             placeholder="e.g. Kamusta ka, mabuti"
//             className="font-bold h-11 rounded-xl bg-white border-2"
//           />
//         </div>

//         {/* 2. Audio Attachment / React Speech Toggle */}
//         <div className="space-y-2">
//           <Label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
//             <Volume2 className="w-4 h-4 text-green-500" /> Audio Clip Source (Required)
//           </Label>

//           {/* Mode Switcher Buttons */}
//           <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
//             <button
//               type="button"
//               onClick={() => setAudioMode("recorded")}
//               className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
//                 audioMode === "recorded"
//                   ? "bg-white text-slate-800 shadow-sm border border-slate-200"
//                   : "text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               <Mic className="w-4 h-4 text-green-500" /> Custom Audio Upload / Record
//             </button>

//             <button
//               type="button"
//               onClick={() => setAudioMode("speech")}
//               className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
//                 audioMode === "speech"
//                   ? "bg-white text-slate-800 shadow-sm border border-slate-200"
//                   : "text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               <Bot className="w-4 h-4 text-blue-500" /> React Speech Speaker
//             </button>
//           </div>

//           {/* Dynamic Audio Source Panel */}
//           {audioMode === "recorded" ? (
//             <div className="bg-white p-3 border-2 border-slate-200 rounded-2xl animate-in fade-in duration-150">
//               <AudioRecorder onAudioReady={setAudioFile} />
//             </div>
//           ) : (
//             <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-150">
//               <div className="space-y-1">
//                 <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
//                   <Sparkles className="w-4 h-4 text-blue-500" /> Dynamic Speech Synthesis Active
//                 </p>
//                 <p className="text-[11px] font-bold text-blue-600">
//                   Audio will be synthesized live on user devices via Text-to-Speech using the target sentence above.
//                 </p>
//               </div>

//               {/* TTS Preview Button */}
//               <div className="shrink-0">
//                 <ReactSpeechButton
//                   text={targetSentence}
//                   voiceLanguage="tl-PH"
//                   size="sm"
//                   variant="ghost"
//                   showLabel={true}
//                   label="Test Voice"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 3. Word Pool Management */}
//       <div className="space-y-3">
//         <Label className="text-xs font-black uppercase text-slate-500 block">
//           Add Words to Word Pool
//         </Label>
//         <div className="flex gap-2">
//           <Input
//             value={newWord}
//             onChange={(e) => setNewWord(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddWord())}
//             placeholder="Type a word..."
//             className="font-bold h-11 rounded-xl bg-white border-2 flex-1"
//           />
//           <Button
//             type="button"
//             onClick={handleAddWord}
//             className="h-11 px-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl"
//           >
//             <Plus className="w-4 h-4 mr-1" /> Add
//           </Button>
//         </div>

//         {/* Word Pool Tags */}
//         <div className="flex flex-wrap gap-2 pt-1">
//           {wordBank.map((word, index) => {
//             const isUsed = correctSequenceIndices.includes(index);
//             return (
//               <span
//                 key={`word-${index}-${word}`}
//                 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm border-2 transition-all ${
//                   isUsed
//                     ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60"
//                     : "bg-white border-slate-300 text-slate-800 shadow-[0_2px_0_0_#cbd5e1]"
//                 }`}
//               >
//                 {word}
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveWordFromBank(index)}
//                   className="text-slate-400 hover:text-red-500 ml-1"
//                 >
//                   <Trash2 className="w-3.5 h-3.5" />
//                 </button>
//               </span>
//             );
//           })}
//         </div>
//       </div>

//       {/* 4. Correct Sequence Arrangement Area */}
//       <div className="space-y-2 pt-2">
//         <div className="flex items-center justify-between">
//           <Label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1">
//             <Sparkles className="w-3.5 h-3.5 text-green-500" />
//             Set Correct Answer Sequence
//           </Label>
//           {correctSequenceIndices.length > 0 && (
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={() => setCorrectSequenceIndices([])}
//               className="h-7 text-xs font-bold text-slate-400 hover:text-red-500 gap-1"
//             >
//               <RotateCcw className="w-3 h-3" /> Reset Sequence
//             </Button>
//           )}
//         </div>

//         {/* Selected Sequence Slots */}
//         <div className="min-h-[64px] p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-wrap items-center gap-2">
//           {correctSequenceIndices.length === 0 ? (
//             <p className="text-xs font-semibold text-slate-400 italic">
//               Tap available words below to build the exact sequence spoken in the audio...
//             </p>
//           ) : (
//             correctSequenceIndices.map((bankIndex, pos) => (
//               <button
//                 key={`seq-${pos}-${bankIndex}`}
//                 type="button"
//                 onClick={() => handleRemoveFromSequenceAt(pos)}
//                 className="bg-green-500 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl border-b-4 border-green-700 shadow-sm active:translate-y-0.5"
//               >
//                 {wordBank[bankIndex]}
//               </button>
//             ))
//           )}
//         </div>

//         {/* Clickable Word Bank to Build Sequence */}
//         <div className="pt-2">
//           <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
//             Tap words in correct order:
//           </span>
//           <div className="flex flex-wrap gap-2">
//             {wordBank.map((word, index) => {
//               const isSelected = correctSequenceIndices.includes(index);
//               return (
//                 <Button
//                   key={`bank-${index}-${word}`}
//                   type="button"
//                   disabled={isSelected}
//                   onClick={() => handleTapWordToSequence(index)}
//                   variant="outline"
//                   className={`font-bold rounded-xl h-9 border-2 ${
//                     isSelected
//                       ? "opacity-40 bg-slate-100 border-slate-200"
//                       : "border-slate-300 hover:border-green-500 hover:bg-green-50"
//                   }`}
//                 >
//                   {word}
//                 </Button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Validation Status */}
//         {correctSequenceIndices.length > 0 && (
//           <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
//             <CheckCircle2 className="w-4 h-4" /> Correct sequence configured ({correctSequenceIndices.length} words)
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "../AudioRecorder";
import { ReactSpeechButton } from "../ReactSpeechSpeaker";
import {
  Plus,
  Trash2,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Mic,
  Bot,
} from "lucide-react";
import { AudioMode, TapWhatYouHearPayload } from "@/types/foundation/materials";

export interface TapWhatYouHearFormProps {
  initialData?: Partial<TapWhatYouHearPayload> | null;
  onSubmit: (payload: TapWhatYouHearPayload) => void;
}

// Audio DIctation
export function TapWhatYouHearForm({
  initialData,
  onSubmit,
}: TapWhatYouHearFormProps) {
  const [targetSentence, setTargetSentence] = useState(
    initialData?.targetSentence ?? initialData?.question ?? ""
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

  const [wordBank, setWordBank] = useState<string[]>(
    initialData?.wordBank ?? []
  );
  const [newWord, setNewWord] = useState("");

  const [correctSequenceIndices, setCorrectSequenceIndices] = useState<
    number[]
  >(() => {
    if (initialData?.correctSequence && initialData?.wordBank) {
      const bank = initialData.wordBank;
      const usedIndices = new Set<number>();

      return initialData.correctSequence
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

  // Runs ONLY when the Save button (or Enter key) triggers form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const correctSequence = correctSequenceIndices
      .map((i) => wordBank[i])
      .filter((w): w is string => w !== undefined);

    const isAudioValid =
      audioMode === "speech" || audioFile !== null || Boolean(existingAudioUrl);

    const isValid =
      targetSentence.trim().length > 0 &&
      wordBank.length > 0 &&
      correctSequence.length > 0 &&
      isAudioValid;

    const audioUrlPayload = (
      audioMode === "speech" ? "__SPEECH__" : existingAudioUrl
    ) as "__SPEECH__" | null;

    onSubmit({
      type: "tapWhatYouHear",
      question: targetSentence,
      targetSentence,
      audioType: audioMode,
      audioUrl: audioUrlPayload,
      audioFile: audioMode === "recorded" ? audioFile : null,
      wordBank,
      correctSequence,
      isValid,
    });
  };

  // Actions
  const handleAddWord = () => {
    const trimmed = newWord.trim();
    if (!trimmed) return;
    setWordBank((prev) => [...prev, trimmed]);
    setNewWord("");
  };

  // Remove word tile from pool AND recalculate sequence bank indices
  const handleRemoveWordFromBank = (indexToRemove: number) => {
    setWordBank((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setCorrectSequenceIndices((prev) =>
      prev
        .filter((idx) => idx !== indexToRemove)
        .map((idx) => (idx > indexToRemove ? idx - 1 : idx))
    );
  };

  // Handle selecting word tile into sequence
  const handleTapWordToSequence = (bankIndex: number) => {
    setCorrectSequenceIndices((prev) =>
      prev.includes(bankIndex) ? prev : [...prev, bankIndex]
    );
  };

  // Remove specific word at sequence position
  const handleRemoveFromSequenceAt = (sequencePosToRemove: number) => {
    setCorrectSequenceIndices((prev) =>
      prev.filter((_, pos) => pos !== sequencePosToRemove)
    );
  };

  return (
    <form
      id="stage-activity-form"
      onSubmit={handleSubmit}
      className="space-y-5 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl"
    >
      {/* 1. Target Sentence & Audio Source Selection */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-black uppercase text-slate-500 mb-1 block">
            Target Sentence <span className="text-red-500">*</span>
          </Label>
          <Input
            value={targetSentence}
            onChange={(e) => setTargetSentence(e.target.value)}
            placeholder="e.g. Kamusta ka, mabuti"
            className="font-bold h-11 rounded-xl bg-white border-2"
          />
        </div>

        {/* 2. Audio Attachment / React Speech Toggle */}
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-green-500" /> Audio Clip Source
            (Required)
          </Label>

          {/* Mode Switcher Buttons */}
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
              <Mic className="w-4 h-4 text-green-500" /> Custom Audio Upload /
              Record
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

          {/* Dynamic Audio Source Panel */}
          {audioMode === "recorded" ? (
            <div className="bg-white p-3 border-2 border-slate-200 rounded-2xl animate-in fade-in duration-150">
              <AudioRecorder onAudioReady={setAudioFile} />
            </div>
          ) : (
            <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Dynamic Speech
                  Synthesis Active
                </p>
                <p className="text-[11px] font-bold text-blue-600">
                  Audio will be synthesized live on user devices via Text-to-Speech
                  using the target sentence above.
                </p>
              </div>

              {/* TTS Preview Button */}
              <div className="shrink-0">
                <ReactSpeechButton
                  text={targetSentence}
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
      </div>

      {/* 3. Word Pool Management */}
      <div className="space-y-3">
        <Label className="text-xs font-black uppercase text-slate-500 block">
          Add Words to Word Pool
        </Label>
        <div className="flex gap-2">
          <Input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddWord())
            }
            placeholder="Type a word..."
            className="font-bold h-11 rounded-xl bg-white border-2 flex-1"
          />
          <Button
            type="button"
            onClick={handleAddWord}
            className="h-11 px-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {/* Word Pool Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {wordBank.map((word, index) => {
            const isUsed = correctSequenceIndices.includes(index);
            return (
              <span
                key={`word-${index}-${word}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm border-2 transition-all ${
                  isUsed
                    ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60"
                    : "bg-white border-slate-300 text-slate-800 shadow-[0_2px_0_0_#cbd5e1]"
                }`}
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleRemoveWordFromBank(index)}
                  className="text-slate-400 hover:text-red-500 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* 4. Correct Sequence Arrangement Area */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-green-500" />
            Set Correct Answer Sequence
          </Label>
          {correctSequenceIndices.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCorrectSequenceIndices([])}
              className="h-7 text-xs font-bold text-slate-400 hover:text-red-500 gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Sequence
            </Button>
          )}
        </div>

        {/* Selected Sequence Slots */}
        <div className="min-h-[64px] p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-wrap items-center gap-2">
          {correctSequenceIndices.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 italic">
              Tap available words below to build the exact sequence spoken in
              the audio...
            </p>
          ) : (
            correctSequenceIndices.map((bankIndex, pos) => (
              <button
                key={`seq-${pos}-${bankIndex}`}
                type="button"
                onClick={() => handleRemoveFromSequenceAt(pos)}
                className="bg-green-500 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-xl border-b-4 border-green-700 shadow-sm active:translate-y-0.5"
              >
                {wordBank[bankIndex]}
              </button>
            ))
          )}
        </div>

        {/* Clickable Word Bank to Build Sequence */}
        <div className="pt-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
            Tap words in correct order:
          </span>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word, index) => {
              const isSelected = correctSequenceIndices.includes(index);
              return (
                <Button
                  key={`bank-${index}-${word}`}
                  type="button"
                  disabled={isSelected}
                  onClick={() => handleTapWordToSequence(index)}
                  variant="outline"
                  className={`font-bold rounded-xl h-9 border-2 ${
                    isSelected
                      ? "opacity-40 bg-slate-100 border-slate-200"
                      : "border-slate-300 hover:border-green-500 hover:bg-green-50"
                  }`}
                >
                  {word}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Validation Status */}
        {correctSequenceIndices.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> Correct sequence configured (
            {correctSequenceIndices.length} words)
          </div>
        )}
      </div>
    </form>
  );
}