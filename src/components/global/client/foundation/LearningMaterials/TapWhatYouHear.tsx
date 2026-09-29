// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { TapWhatYouHearPayload } from "@/types/foundation/materials";
// import { RotateCcw } from "lucide-react";
// import { GamifiedAudioSpeakerButton } from "@/components/global/admin/foundation/GamifiedAudioSpeakerButton";

// export interface TapWhatYouHearProps {
//   payload: TapWhatYouHearPayload;
//   voiceLanguage?: string;
//   onAnswerChange: (isCorrect: boolean) => void;
//   disabled?: boolean;
// }

// interface BankItem {
//   id: string;
//   text: string;
// }

// const extractText = (val: unknown): string => {
//   if (typeof val === "string" || typeof val === "number") return String(val);
//   if (val && typeof val === "object") {
//     const obj = val as Record<string, unknown>;
//     return String(obj.word ?? obj.text ?? obj.label ?? obj.value ?? "");
//   }
//   return "";
// };

// export function TapWhatYouHear({
//   payload,
//   voiceLanguage = "tl-PH",
//   onAnswerChange,
//   disabled = false,
// }: TapWhatYouHearProps) {
//   const [selectedItems, setSelectedItems] = useState<BankItem[]>([]);
//   const [bankItems, setBankItems] = useState<BankItem[]>([]);
//   const speakerContainerRef = useRef<HTMLDivElement | null>(null);

//   const textToSpeak = extractText(
//     payload?.targetSentence || payload?.question
//   );

//   // Single word TTS feedback when tapping individual bank items
//   const speakWord = useCallback(
//     (text: string) => {
//       if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
//       window.speechSynthesis.cancel();
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = voiceLanguage;
//       utterance.rate = 0.9;
//       window.speechSynthesis.speak(utterance);
//     },
//     [voiceLanguage]
//   );

//   // Initialize word bank and auto-click speaker button on load
//   useEffect(() => {
//     const rawBank = payload?.wordBank || [];
//     const formattedBank: BankItem[] = rawBank.map((item, idx) => ({
//       id: `word-${idx}-${extractText(item)}`,
//       text: extractText(item),
//     }));

//     setBankItems(formattedBank);
//     setSelectedItems([]);
//     onAnswerChange(false);

//     // Automatically click the speaker button to auto-play audio on question load
//     const timer = setTimeout(() => {
//       const button = speakerContainerRef.current?.querySelector("button");
//       if (button) {
//         button.click();
//       }
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [payload, onAnswerChange]);

//   // Answer validation check
//   const validateAnswer = useCallback(
//     (currentSelected: BankItem[]) => {
//       const targetSeq = (payload?.correctSequence || []).map(extractText);
//       const userSeq = currentSelected.map((item) => item.text);

//       const isCorrect =
//         userSeq.length === targetSeq.length &&
//         userSeq.every((word, idx) => word === targetSeq[idx]);

//       onAnswerChange(isCorrect);
//     },
//     [payload, onAnswerChange]
//   );

//   // Tap word from pool to answer slot + speak word
//   const handleSelectWord = (item: BankItem) => {
//     if (disabled) return;
//     if (selectedItems.some((s) => s.id === item.id)) return;

//     speakWord(item.text);

//     const nextSelected = [...selectedItems, item];
//     setSelectedItems(nextSelected);
//     validateAnswer(nextSelected);
//   };

//   // Remove word from answer slot back to pool + speak word
//   const handleDeselectWord = (item: BankItem) => {
//     if (disabled) return;

//     speakWord(item.text);

//     const nextSelected = selectedItems.filter((s) => s.id !== item.id);
//     setSelectedItems(nextSelected);
//     validateAnswer(nextSelected);
//   };

//   // Reset answer area
//   const handleReset = () => {
//     if (disabled) return;
//     setSelectedItems([]);
//     onAnswerChange(false);
//   };

//   return (
//     <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
//       {/* 1. Audio Control Banner */}
//       <div className="flex items-center justify-between gap-4 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl w-full shadow-sm">
//         <div className="flex items-center gap-3">
//           {/* Standard Audio Playback Button (Auto-triggered via ref on load) */}
//           <div ref={speakerContainerRef}>
//             <GamifiedAudioSpeakerButton
//               audioType={payload?.audioType}
//               audioUrl={payload?.audioUrl}
//               text={textToSpeak}
//               voiceLanguage={voiceLanguage}
//               variant="primary"
//               size="md"
//               showLabel={true}
//               label="Listen"
//             />
//           </div>

//           {/* Slow Turtle Audio Playback Button */}
//           <GamifiedAudioSpeakerButton
//             audioType={payload?.audioType}
//             audioUrl={payload?.audioUrl}
//             text={textToSpeak}
//             voiceLanguage={voiceLanguage}
//             isSlow={true}
//             variant="turtle"
//             size="md"
//             showLabel={false}
//           />
//         </div>

//         {/* Reset Action */}
//         {selectedItems.length > 0 && !disabled && (
//           <button
//             type="button"
//             onClick={handleReset}
//             className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-colors py-1 px-2.5 rounded-xl hover:bg-red-50"
//           >
//             <RotateCcw className="w-3.5 h-3.5" />
//             Reset
//           </button>
//         )}
//       </div>

//       {/* 2. Answer Display Drop Zone */}
//       <div className="w-full min-h-[110px] p-4 bg-slate-50/70 border-2 border-dashed border-slate-300 rounded-3xl flex flex-wrap gap-2.5 items-center justify-start transition-all">
//         {selectedItems.length === 0 ? (
//           <p className="text-xs font-bold text-slate-400 italic mx-auto text-center">
//             Tap words below in the order you hear them...
//           </p>
//         ) : (
//           selectedItems.map((item) => (
//             <button
//               key={`selected-${item.id}`}
//               type="button"
//               disabled={disabled}
//               onClick={() => handleDeselectWord(item)}
//               className="px-4 py-2.5 bg-sky-500 text-white border-b-4 border-sky-700 rounded-2xl font-black text-sm shadow-sm hover:bg-sky-400 active:translate-y-1 active:border-b-0 transition-all animate-in zoom-in-95 duration-150"
//             >
//               {item.text}
//             </button>
//           ))
//         )}
//       </div>

//       {/* 3. Word Pool */}
//       <div className="w-full space-y-2">
//         <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider text-center">
//           Available Words
//         </span>
//         <div className="flex flex-wrap gap-2.5 justify-center">
//           {bankItems.map((item) => {
//             const isUsed = selectedItems.some((s) => s.id === item.id);

//             return (
//               <button
//                 key={`bank-${item.id}`}
//                 type="button"
//                 disabled={disabled || isUsed}
//                 onClick={() => handleSelectWord(item)}
//                 className={`px-4.5 py-2.5 rounded-2xl font-black text-sm transition-all duration-150 ${
//                   isUsed
//                     ? "bg-slate-100 border-2 border-slate-200 text-transparent pointer-events-none opacity-40 shadow-none"
//                     : "bg-white border-2 border-b-4 border-slate-200 text-slate-700 shadow-sm hover:border-sky-300 hover:bg-sky-50 active:translate-y-1 active:border-b-2"
//                 }`}
//               >
//                 {item.text}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TapWhatYouHearPayload } from "@/types/foundation/materials";
import { RotateCcw } from "lucide-react";
import { GamifiedAudioSpeakerButton } from "@/components/global/admin/foundation/GamifiedAudioSpeakerButton";

export interface TapWhatYouHearProps {
  payload: TapWhatYouHearPayload;
  voiceLanguage?: string;
  onAnswerChange: (isCorrect: boolean) => void;
  disabled?: boolean;
}

interface BankItem {
  id: string;
  text: string;
}

const extractText = (val: unknown): string => {
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    return String(obj.word ?? obj.text ?? obj.label ?? obj.value ?? "");
  }
  return "";
};

export function TapWhatYouHear({
  payload,
  voiceLanguage = "tl-PH",
  onAnswerChange,
  disabled = false,
}: TapWhatYouHearProps) {
  const [selectedItems, setSelectedItems] = useState<BankItem[]>([]);
  const [bankItems, setBankItems] = useState<BankItem[]>([]);
  const speakerContainerRef = useRef<HTMLDivElement | null>(null);

  const textToSpeak = extractText(
    payload?.targetSentence || payload?.question
  );

  // Single-word TTS matching GamifiedAudioSpeakerButton (Server TTS -> Web Speech with explicit voice matching)
  const speakWord = useCallback(
    (text: string) => {
      if (!text || !text.trim()) return;

      // 1. Primary: Use the server TTS endpoint (same as GamifiedAudioSpeakerButton)
      const serverTtsUrl = `/api/tts?text=${encodeURIComponent(
        text.trim()
      )}&lang=${encodeURIComponent(voiceLanguage)}&rate=0.9`;
      
      const audio = new Audio(serverTtsUrl);

      audio.play().catch(() => {
        // 2. Fallback: Web Speech API with explicit language-matching voice selection
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = voiceLanguage;
          utterance.rate = 0.9;

          const voices = window.speechSynthesis.getVoices();
          const targetLang = voiceLanguage.toLowerCase();
          const langPrefix = targetLang.split("-")[0];

          // Search for an exact match or fallback to matching language prefix
          const matchedVoice = voices.find(
            (v) =>
              v.lang.toLowerCase() === targetLang ||
              v.lang.toLowerCase().startsWith(langPrefix)
          );

          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }

          window.speechSynthesis.speak(utterance);
        }
      });
    },
    [voiceLanguage]
  );

  // Initialize word bank and auto-play prompt on question change
  useEffect(() => {
    const rawBank = payload?.wordBank || [];
    const formattedBank: BankItem[] = rawBank.map((item, idx) => ({
      id: `word-${idx}-${extractText(item)}`,
      text: extractText(item),
    }));

    setBankItems(formattedBank);
    setSelectedItems([]);

    // Auto-click the main speaker button on question load
    const timer = setTimeout(() => {
      const button = speakerContainerRef.current?.querySelector("button");
      if (button) {
        button.click();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [payload]);

  // Synchronize validation status with parent onAnswerChange whenever selectedItems changes
  useEffect(() => {
    const targetSeq = (payload?.correctSequence || []).map(extractText);
    const userSeq = selectedItems.map((item) => item.text);

    const isCorrect =
      userSeq.length === targetSeq.length &&
      userSeq.every((word, idx) => word === targetSeq[idx]);

    onAnswerChange(isCorrect);
  }, [selectedItems, payload?.correctSequence, onAnswerChange]);

  // Select word from pool into answer slot
  const handleSelectWord = (item: BankItem) => {
    if (disabled) return;
    if (selectedItems.some((s) => s.id === item.id)) return;

    speakWord(item.text);
    setSelectedItems((prev) => [...prev, item]);
  };

  // Remove word from answer slot back to pool
  const handleDeselectWord = (item: BankItem) => {
    if (disabled) return;

    setSelectedItems((prev) => prev.filter((s) => s.id !== item.id));
  };

  // Reset answer area
  const handleReset = () => {
    if (disabled) return;
    setSelectedItems([]);
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
      {/* 1. Audio Control Banner */}
      <div className="flex items-center justify-between gap-4 bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl w-full shadow-sm">
        <div className="flex items-center gap-3">
          {/* Standard Audio Playback Button (Auto-triggered via ref on load) */}
          <div ref={speakerContainerRef}>
            <GamifiedAudioSpeakerButton
              audioType={payload?.audioType}
              audioUrl={payload?.audioUrl}
              text={textToSpeak}
              voiceLanguage={voiceLanguage}
              variant="primary"
              size="md"
              showLabel={true}
              label="Listen"
            />
          </div>

          {/* Slow Turtle Audio Playback Button */}
          <GamifiedAudioSpeakerButton
            audioType={payload?.audioType}
            audioUrl={payload?.audioUrl}
            text={textToSpeak}
            voiceLanguage={voiceLanguage}
            isSlow={true}
            variant="turtle"
            size="md"
            showLabel={false}
          />
        </div>

        {/* Reset Action */}
        {selectedItems.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-colors py-1 px-2.5 rounded-xl hover:bg-red-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* 2. Answer Display Drop Zone */}
      <div className="w-full min-h-[110px] p-4 bg-slate-50/70 border-2 border-dashed border-slate-300 rounded-3xl flex flex-wrap gap-2.5 items-center justify-start transition-all">
        {selectedItems.length === 0 ? (
          <p className="text-xs font-bold text-slate-400 italic mx-auto text-center">
            Tap words below in the order you hear them...
          </p>
        ) : (
          selectedItems.map((item) => (
            <button
              key={`selected-${item.id}`}
              type="button"
              disabled={disabled}
              onClick={() => handleDeselectWord(item)}
              className="px-4 py-2.5 bg-sky-500 text-white border-b-4 border-sky-700 rounded-2xl font-black text-sm shadow-sm hover:bg-sky-400 active:translate-y-1 active:border-b-0 transition-all animate-in zoom-in-95 duration-150"
            >
              {item.text}
            </button>
          ))
        )}
      </div>

      {/* 3. Word Pool */}
      <div className="w-full space-y-2">
        <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider text-center">
          Available Words
        </span>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {bankItems.map((item) => {
            const isUsed = selectedItems.some((s) => s.id === item.id);

            return (
              <button
                key={`bank-${item.id}`}
                type="button"
                disabled={disabled || isUsed}
                onClick={() => handleSelectWord(item)}
                className={`px-4.5 py-2.5 rounded-2xl font-black text-sm transition-all duration-150 ${
                  isUsed
                    ? "bg-slate-100 border-2 border-slate-200 text-transparent pointer-events-none opacity-40 shadow-none"
                    : "bg-white border-2 border-b-4 border-slate-200 text-slate-700 shadow-sm hover:border-sky-300 hover:bg-sky-50 active:translate-y-1 active:border-b-2"
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}