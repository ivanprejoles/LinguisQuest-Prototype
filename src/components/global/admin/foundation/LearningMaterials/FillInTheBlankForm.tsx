// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { AudioRecorder } from "../AudioRecorder";
// import { ReactSpeechButton } from "../ReactSpeechSpeaker";
// import {
//   Volume2,
//   Sparkles,
//   CheckCircle2,
//   Scissors,
//   Mic,
//   Bot,
// } from "lucide-react";
// import {
//   AudioMode,
//   FillInTheBlankPayload,
//   FillInTheBlankOption,
// } from "@/types/foundation/materials";

// interface OptionItem {
//   id: string;
//   word: string;
// }

// interface FillInTheBlankFormProps {
//   initialData?: Partial<FillInTheBlankPayload>;
//   onChange: (payload: FillInTheBlankPayload) => void;
// }

// export function FillInTheBlankForm({
//   initialData,
//   onChange,
// }: FillInTheBlankFormProps) {


//   // 1. Initialize state strictly once on mount
//   const [fullSentence, setFullSentence] = useState(
//     initialData?.fullSentence ?? "Ang pusa ay kumakain ng isda"
//   );
//   const [audioMode, setAudioMode] = useState<AudioMode>(
//     initialData?.audioType ?? "recorded"
//   );
//   const [mainAudio, setMainAudio] = useState<File | null>(
//     initialData?.mainAudio ?? null
//   );
//   const [blankedWordIndex, setBlankedWordIndex] = useState<number | null>(
//     initialData?.blankedWordIndex ?? 3
//   );
//   const [correctOptionId, setCorrectOptionId] = useState<string>(
//     initialData?.correctAnswerId ?? "opt-1"
//   );

//   const [options, setOptions] = useState<OptionItem[]>(() => {
//     if (initialData?.options && initialData.options.length > 0) {
//       return initialData.options.map((opt) => ({
//         id: opt.id,
//         word: opt.word,
//       }));
//     }
//     return [
//       { id: "opt-1", word: "kumakain" },
//       { id: "opt-2", word: "tumatakbo" },
//       { id: "opt-3", word: "natutulog" },
//     ];
//   });

//   // Stabilize onChange ref to prevent parent re-renders from causing render loops
//   const onChangeRef = useRef(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   const words = fullSentence.trim().split(/\s+/).filter(Boolean);

//   // 2. Sync payload back to parent StageModal
//   useEffect(() => {
//     const targetWord =
//       blankedWordIndex !== null && words[blankedWordIndex]
//         ? words[blankedWordIndex]
//         : "";

//     const formattedOptions: FillInTheBlankOption[] = options.map((opt) => ({
//       id: opt.id,
//       word: opt.word.trim(),
//       isCorrect: opt.id === correctOptionId,
//     }));

//     const hasEmptyOptions = options.some((opt) => opt.word.trim().length === 0);

//     const isValid =
//       fullSentence.trim().length > 0 &&
//       blankedWordIndex !== null &&
//       options.length >= 3 &&
//       !hasEmptyOptions;

//     const payload: FillInTheBlankPayload = {
//       type: "fillInTheBlank",
//       fullSentence,
//       audioType: audioMode,
//       audioUrl: audioMode === "speech" ? "__SPEECH__" : null,
//       mainAudio: audioMode === "recorded" ? mainAudio : null,
//       blankedWordIndex,
//       targetWord,
//       options: formattedOptions,
//       correctAnswerId: correctOptionId,
//       isValid,
//     };

//     onChangeRef.current(payload);
//   }, [
//     fullSentence,
//     audioMode,
//     mainAudio,
//     blankedWordIndex,
//     options,
//     correctOptionId,
//   ]);

//   // When admin clicks a word in the sentence, update Option 1's word
//   const handleSelectBlankWord = (index: number) => {
//     setBlankedWordIndex(index);
//     const selectedWord = words[index];

//     setOptions((prev) =>
//       prev.map((opt, i) => (i === 0 ? { ...opt, word: selectedWord } : opt))
//     );
//   };

//   const handleOptionWordChange = (index: number, word: string) => {
//     setOptions((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], word };
//       return updated;
//     });
//   };

//   const handleOptionCountChange = (count: number) => {
//     if (count === 3 && options.length === 4) {
//       setOptions(options.slice(0, 3));
//       if (correctOptionId === "opt-4") setCorrectOptionId("opt-1");
//     } else if (count === 4 && options.length === 3) {
//       setOptions([...options, { id: "opt-4", word: "lumalangoy" }]);
//     }
//   };

//   return (
//     <div className="space-y-6 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl">
//       {/* SECTION 1: Full Sentence & Audio Speech Source */}
//       <div className="space-y-3">
//         <div>
//           <Label className="text-xs font-black uppercase text-slate-500 mb-1 block">
//             1. Target Sentence <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             value={fullSentence}
//             onChange={(e) => setFullSentence(e.target.value)}
//             placeholder="Type target sentence..."
//             className="font-extrabold h-12 rounded-xl bg-white border-2 text-base"
//           />
//         </div>

//         {/* Audio Source Selector */}
//         <div className="space-y-2">
//           <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//             <Volume2 className="w-4 h-4 text-green-500" /> Sentence Pronunciation Audio Source
//           </label>

//           {/* Audio Mode Toggle Buttons */}
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

//           {/* Dynamic Mode Panel */}
//           {audioMode === "recorded" ? (
//             <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 animate-in fade-in duration-150">
//               <AudioRecorder onAudioReady={setMainAudio} />
//             </div>
//           ) : (
//             <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-150">
//               <div className="space-y-1">
//                 <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
//                   <Sparkles className="w-4 h-4 text-blue-500" /> Dynamic Speech Synthesis Active
//                 </p>
//                 <p className="text-[11px] font-bold text-blue-600">
//                   Audio will be synthesized live on user devices via Text-to-Speech using the target prompt.
//                 </p>
//               </div>

//               {/* Test TTS Player Button */}
//               <div className="shrink-0 flex items-center gap-2">
//                 <ReactSpeechButton
//                   text={fullSentence}
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

//       {/* SECTION 2: Tap to Blank Out Word */}
//       <div className="space-y-2 bg-white border-2 border-slate-200 p-4 rounded-2xl">
//         <div className="flex items-center justify-between">
//           <Label className="text-xs font-black uppercase text-slate-600 flex items-center gap-1.5">
//             <Scissors className="w-4 h-4 text-green-500" />
//             2. Tap Word to Blank Out (`___`)
//           </Label>
//           <span className="text-[11px] font-bold text-slate-400">
//             Selected Target:{" "}
//             <strong className="text-green-600">
//               {blankedWordIndex !== null && words[blankedWordIndex]
//                 ? words[blankedWordIndex]
//                 : "None"}
//             </strong>
//           </span>
//         </div>

//         <div className="flex flex-wrap gap-2 pt-2 min-h-[50px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
//           {words.map((word, idx) => {
//             const isBlanked = blankedWordIndex === idx;
//             return (
//               <button
//                 key={idx}
//                 type="button"
//                 onClick={() => handleSelectBlankWord(idx)}
//                 className={`px-3.5 py-1.5 rounded-xl font-black text-sm border-2 transition-all ${
//                   isBlanked
//                     ? "bg-amber-100 border-amber-500 text-amber-800 shadow-[0_3px_0_0_#f59e0b] scale-105"
//                     : "bg-white border-slate-300 text-slate-700 hover:border-green-500 shadow-[0_2px_0_0_#cbd5e1]"
//                 }`}
//               >
//                 {isBlanked ? "_____" : word}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* SECTION 3: Option Words with ReactSpeechButton */}
//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <Label className="text-xs font-black uppercase text-slate-500 block">
//             3. Choice Options (Word choices with speech audio)
//           </Label>
//           <div className="flex gap-2">
//             <Button
//               type="button"
//               size="sm"
//               variant={options.length === 3 ? "default" : "outline"}
//               onClick={() => handleOptionCountChange(3)}
//               className={`font-black rounded-xl h-7 text-xs ${
//                 options.length === 3 ? "bg-green-500 text-white" : ""
//               }`}
//             >
//               3 Options
//             </Button>
//             <Button
//               type="button"
//               size="sm"
//               variant={options.length === 4 ? "default" : "outline"}
//               onClick={() => handleOptionCountChange(4)}
//               className={`font-black rounded-xl h-7 text-xs ${
//                 options.length === 4 ? "bg-green-500 text-white" : ""
//               }`}
//             >
//               4 Options
//             </Button>
//           </div>
//         </div>

//         <RadioGroup
//           value={correctOptionId}
//           onValueChange={setCorrectOptionId}
//           className="space-y-3"
//         >
//           {options.map((option, idx) => {
//             const isCorrect = correctOptionId === option.id;
//             return (
//               <div
//                 key={option.id}
//                 className={`p-4 rounded-2xl border-2 bg-white transition-all space-y-3 ${
//                   isCorrect
//                     ? "border-green-500 shadow-[0_3px_0_0_#22c55e]"
//                     : "border-slate-200"
//                 }`}
//               >
//                 <div className="flex items-center justify-between gap-3">
//                   <div className="flex items-center gap-2 shrink-0">
//                     <RadioGroupItem
//                       value={option.id}
//                       id={option.id}
//                       className="w-4 h-4 text-green-600"
//                     />
//                     <Label
//                       htmlFor={option.id}
//                       className="text-xs font-black uppercase text-slate-700 cursor-pointer"
//                     >
//                       Option {idx + 1}
//                     </Label>
//                   </div>

//                   {/* Word Input */}
//                   <Input
//                     value={option.word}
//                     onChange={(e) =>
//                       handleOptionWordChange(idx, e.target.value)
//                     }
//                     placeholder={`Enter option ${idx + 1} word...`}
//                     className="h-10 text-sm font-extrabold rounded-xl border-slate-300 bg-white"
//                   />

//                   {/* Individual ReactSpeechButton preview for this Option word */}
//                   <div className="shrink-0">
//                     <ReactSpeechButton
//                       text={option.word}
//                       voiceLanguage="tl-PH"
//                       size="sm"
//                       variant="ghost"
//                       showLabel={false}
//                     />
//                   </div>

//                   {isCorrect && (
//                     <span className="shrink-0 text-[10px] font-black uppercase text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-md flex items-center gap-1">
//                       <CheckCircle2 className="w-3 h-3" /> Correct
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </RadioGroup>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AudioRecorder } from "../AudioRecorder";
import { ReactSpeechButton } from "../ReactSpeechSpeaker";
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  Scissors,
  Mic,
  Bot,
} from "lucide-react";
import {
  AudioMode,
  FillInTheBlankPayload,
  FillInTheBlankOption,
} from "@/types/foundation/materials";

interface OptionItem {
  id: string;
  word: string;
}

interface FillInTheBlankFormProps {
  initialData?: Partial<FillInTheBlankPayload> | null;
  onSubmit: (payload: FillInTheBlankPayload) => void;
}

// Missing Word
export function FillInTheBlankForm({
  initialData,
  onSubmit,
}: FillInTheBlankFormProps) {
  // 1. Initialize state strictly once on mount
  const [fullSentence, setFullSentence] = useState(
    initialData?.fullSentence ?? "Ang pusa ay kumakain ng isda"
  );
  const [audioMode, setAudioMode] = useState<AudioMode>(
    initialData?.audioType ?? "recorded"
  );
  const [mainAudio, setMainAudio] = useState<File | null>(
    initialData?.mainAudio ?? null
  );
  const [blankedWordIndex, setBlankedWordIndex] = useState<number | null>(
    initialData?.blankedWordIndex ?? 3
  );
  const [correctOptionId, setCorrectOptionId] = useState<string>(
    initialData?.correctAnswerId ?? "opt-1"
  );

  const [options, setOptions] = useState<OptionItem[]>(() => {
    if (initialData?.options && initialData.options.length > 0) {
      return initialData.options.map((opt) => ({
        id: opt.id,
        word: opt.word,
      }));
    }
    return [
      { id: "opt-1", word: "kumakain" },
      { id: "opt-2", word: "tumatakbo" },
      { id: "opt-3", word: "natutulog" },
    ];
  });

  const words = fullSentence.trim().split(/\s+/).filter(Boolean);

  // 2. Direct form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetWord =
      blankedWordIndex !== null && words[blankedWordIndex]
        ? words[blankedWordIndex]
        : "";

    const formattedOptions: FillInTheBlankOption[] = options.map((opt) => ({
      id: opt.id,
      word: opt.word.trim(),
      isCorrect: opt.id === correctOptionId,
    }));

    const hasEmptyOptions = options.some((opt) => opt.word.trim().length === 0);

    const isValid =
      fullSentence.trim().length > 0 &&
      blankedWordIndex !== null &&
      options.length >= 3 &&
      !hasEmptyOptions;

    const payload: FillInTheBlankPayload = {
      type: "fillInTheBlank",
      fullSentence,
      audioType: audioMode,
      audioUrl: initialData?.audioUrl ?? (audioMode === "speech" ? "__SPEECH__" : null),
      mainAudio: audioMode === "recorded" ? mainAudio : null,
      blankedWordIndex,
      targetWord,
      options: formattedOptions,
      correctAnswerId: correctOptionId,
      isValid,
    };

    onSubmit(payload);
  };

  // When admin clicks a word in the sentence, update Option 1's word
  const handleSelectBlankWord = (index: number) => {
    setBlankedWordIndex(index);
    const selectedWord = words[index];

    setOptions((prev) =>
      prev.map((opt, i) => (i === 0 ? { ...opt, word: selectedWord } : opt))
    );
  };

  const handleOptionWordChange = (index: number, word: string) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], word };
      return updated;
    });
  };

  const handleOptionCountChange = (count: number) => {
    if (count === 3 && options.length === 4) {
      setOptions(options.slice(0, 3));
      if (correctOptionId === "opt-4") setCorrectOptionId("opt-1");
    } else if (count === 4 && options.length === 3) {
      setOptions([...options, { id: "opt-4", word: "lumalangoy" }]);
    }
  };

  return (
    <form
      id="stage-activity-form"
      onSubmit={handleSubmit}
      className="space-y-6 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl"
    >
      {/* SECTION 1: Full Sentence & Audio Speech Source */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-black uppercase text-slate-500 mb-1 block">
            1. Target Sentence <span className="text-red-500">*</span>
          </Label>
          <Input
            value={fullSentence}
            onChange={(e) => setFullSentence(e.target.value)}
            placeholder="Type target sentence..."
            className="font-extrabold h-12 rounded-xl bg-white border-2 text-base"
          />
        </div>

        {/* Audio Source Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-green-500" /> Sentence Pronunciation Audio Source
          </label>

          {/* Audio Mode Toggle Buttons */}
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

          {/* Dynamic Mode Panel */}
          {audioMode === "recorded" ? (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 animate-in fade-in duration-150">
              <AudioRecorder onAudioReady={setMainAudio} />
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

              {/* Test TTS Player Button */}
              <div className="shrink-0 flex items-center gap-2">
                <ReactSpeechButton
                  text={fullSentence}
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

      {/* SECTION 2: Tap to Blank Out Word */}
      <div className="space-y-2 bg-white border-2 border-slate-200 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-black uppercase text-slate-600 flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-green-500" />
            2. Tap Word to Blank Out (`___`)
          </Label>
          <span className="text-[11px] font-bold text-slate-400">
            Selected Target:{" "}
            <strong className="text-green-600">
              {blankedWordIndex !== null && words[blankedWordIndex]
                ? words[blankedWordIndex]
                : "None"}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 min-h-[50px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
          {words.map((word, idx) => {
            const isBlanked = blankedWordIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectBlankWord(idx)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-sm border-2 transition-all ${
                  isBlanked
                    ? "bg-amber-100 border-amber-500 text-amber-800 shadow-[0_3px_0_0_#f59e0b] scale-105"
                    : "bg-white border-slate-300 text-slate-700 hover:border-green-500 shadow-[0_2px_0_0_#cbd5e1]"
                }`}
              >
                {isBlanked ? "_____" : word}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Option Words with ReactSpeechButton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-black uppercase text-slate-500 block">
            3. Choice Options (Word choices with speech audio)
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={options.length === 3 ? "default" : "outline"}
              onClick={() => handleOptionCountChange(3)}
              className={`font-black rounded-xl h-7 text-xs ${
                options.length === 3 ? "bg-green-500 text-white" : ""
              }`}
            >
              3 Options
            </Button>
            <Button
              type="button"
              size="sm"
              variant={options.length === 4 ? "default" : "outline"}
              onClick={() => handleOptionCountChange(4)}
              className={`font-black rounded-xl h-7 text-xs ${
                options.length === 4 ? "bg-green-500 text-white" : ""
              }`}
            >
              4 Options
            </Button>
          </div>
        </div>

        <RadioGroup
          value={correctOptionId}
          onValueChange={setCorrectOptionId}
          className="space-y-3"
        >
          {options.map((option, idx) => {
            const isCorrect = correctOptionId === option.id;
            return (
              <div
                key={option.id}
                className={`p-4 rounded-2xl border-2 bg-white transition-all space-y-3 ${
                  isCorrect
                    ? "border-green-500 shadow-[0_3px_0_0_#22c55e]"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="w-4 h-4 text-green-600"
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-xs font-black uppercase text-slate-700 cursor-pointer"
                    >
                      Option {idx + 1}
                    </Label>
                  </div>

                  {/* Word Input */}
                  <Input
                    value={option.word}
                    onChange={(e) =>
                      handleOptionWordChange(idx, e.target.value)
                    }
                    placeholder={`Enter option ${idx + 1} word...`}
                    className="h-10 text-sm font-extrabold rounded-xl border-slate-300 bg-white"
                  />

                  {/* Individual ReactSpeechButton preview for this Option word */}
                  <div className="shrink-0">
                    <ReactSpeechButton
                      text={option.word}
                      voiceLanguage="tl-PH"
                      size="sm"
                      variant="ghost"
                      showLabel={false}
                    />
                  </div>

                  {isCorrect && (
                    <span className="shrink-0 text-[10px] font-black uppercase text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Correct
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </form>
  );
}