"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TapWhatYouHearPayload } from "@/types/foundation/materials";
import { RotateCcw, Headphones, Sparkles } from "lucide-react";
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

  const speakWord = useCallback(
    (text: string) => {
      if (!text || !text.trim()) return;

      const serverTtsUrl = `/api/tts?text=${encodeURIComponent(
        text.trim()
      )}&lang=${encodeURIComponent(voiceLanguage)}&rate=0.9`;

      const audio = new Audio(serverTtsUrl);

      audio.play().catch(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = voiceLanguage;
          utterance.rate = 0.9;

          const voices = window.speechSynthesis.getVoices();
          const targetLang = voiceLanguage.toLowerCase();
          const langPrefix = targetLang.split("-")[0];

          const matchedVoice = voices.find(
            (v) =>
              v.lang.toLowerCase() === targetLang ||
              v.lang.toLowerCase().startsWith(langPrefix)
          );

          if (matchedVoice) utterance.voice = matchedVoice;

          window.speechSynthesis.speak(utterance);
        }
      });
    },
    [voiceLanguage]
  );

  // Initialize word bank and attempt autoplay
  useEffect(() => {
    const rawBank = payload?.wordBank || [];

    const formattedBank: BankItem[] = rawBank.map((item, idx) => ({
      id: `word-${idx}-${extractText(item)}`,
      text: extractText(item),
    }));

    setBankItems(formattedBank);
    setSelectedItems([]);

    const timer = setTimeout(() => {
      const button = speakerContainerRef.current?.querySelector("button");
      button?.click();
    }, 300);

    return () => clearTimeout(timer);
  }, [payload]);

  // Validate answer
  useEffect(() => {
    const targetSeq = (payload?.correctSequence || []).map(extractText);
    const userSeq = selectedItems.map((item) => item.text);

    const isCorrect =
      userSeq.length === targetSeq.length &&
      userSeq.every((word, idx) => word === targetSeq[idx]);

    onAnswerChange(isCorrect);
  }, [selectedItems, payload?.correctSequence, onAnswerChange]);

  const handleSelectWord = (item: BankItem) => {
    if (disabled) return;
    if (selectedItems.some((s) => s.id === item.id)) return;

    speakWord(item.text);
    setSelectedItems((prev) => [...prev, item]);
  };

  const handleDeselectWord = (item: BankItem) => {
    if (disabled) return;

    setSelectedItems((prev) => prev.filter((s) => s.id !== item.id));
  };

  const handleReset = () => {
    if (disabled) return;
    setSelectedItems([]);
  };

  // Expanded color palette for larger word banks
  const colors = [
    {
      selected: "border-cyan-400 bg-cyan-50 text-cyan-800",
      hover: "hover:border-cyan-400 hover:bg-cyan-50",
    },
    {
      selected: "border-violet-400 bg-violet-50 text-violet-800",
      hover: "hover:border-violet-400 hover:bg-violet-50",
    },
    {
      selected: "border-amber-400 bg-amber-50 text-amber-800",
      hover: "hover:border-amber-400 hover:bg-amber-50",
    },
    {
      selected: "border-emerald-400 bg-emerald-50 text-emerald-800",
      hover: "hover:border-emerald-400 hover:bg-emerald-50",
    },
    {
      selected: "border-rose-400 bg-rose-50 text-rose-800",
      hover: "hover:border-rose-400 hover:bg-rose-50",
    },
    {
      selected: "border-blue-400 bg-blue-50 text-blue-800",
      hover: "hover:border-blue-400 hover:bg-blue-50",
    },
    {
      selected: "border-orange-400 bg-orange-50 text-orange-800",
      hover: "hover:border-orange-400 hover:bg-orange-50",
    },
    {
      selected: "border-teal-400 bg-teal-50 text-teal-800",
      hover: "hover:border-teal-400 hover:bg-teal-50",
    },
    {
      selected: "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-800",
      hover: "hover:border-fuchsia-400 hover:bg-fuchsia-50",
    },
    {
      selected: "border-lime-400 bg-lime-50 text-lime-800",
      hover: "hover:border-lime-400 hover:bg-lime-50",
    },
    {
      selected: "border-indigo-400 bg-indigo-50 text-indigo-800",
      hover: "hover:border-indigo-400 hover:bg-indigo-50",
    },
    {
      selected: "border-pink-400 bg-pink-50 text-pink-800",
      hover: "hover:border-pink-400 hover:bg-pink-50",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-col gap-3 px-1 sm:gap-4">

      {/* Compact Header */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1.5">
          <Headphones className="h-3.5 w-3.5 text-cyan-600" />
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 sm:text-xs">
            Listen & Build
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-[0_2px_0_#e2e8f0] transition-colors hover:border-cyan-300 hover:text-cyan-600 active:translate-y-0.5 active:shadow-none disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>

      {/* Audio Controls */}
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 border-b-4 bg-white p-3 sm:p-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-700 sm:text-sm">
            Listen carefully
          </p>
          <p className="text-[10px] text-slate-400 sm:text-xs">
            Listen and arrange the words
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div ref={speakerContainerRef}>
            <GamifiedAudioSpeakerButton
              audioType={payload?.audioType}
              audioUrl={payload?.audioUrl}
              text={textToSpeak}
              voiceLanguage={voiceLanguage}
              variant="primary"
              size="sm"
              showLabel={true}
              label="Listen"
            />
          </div>

          <GamifiedAudioSpeakerButton
            audioType={payload?.audioType}
            audioUrl={payload?.audioUrl}
            text={textToSpeak}
            voiceLanguage={voiceLanguage}
            isSlow={true}
            variant="turtle"
            size="sm"
            showLabel={false}
          />
        </div>
      </div>

      {/* Answer Area */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 sm:text-xs">
            Your sentence
          </span>

          <span className="text-[10px] font-bold text-slate-400">
            {selectedItems.length} word{selectedItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Automatically expands into multiple rows */}
        <div className="flex min-h-[76px] w-full flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cyan-300 bg-white p-3 sm:min-h-[90px] sm:p-4">
          {selectedItems.length === 0 ? (
            <p className="px-2 text-center text-xs font-semibold text-slate-400">
              Tap the words below in the order you hear them
            </p>
          ) : (
            selectedItems.map((item) => {
              // Keep the same color the word had in the word bank
              const originalIndex = bankItems.findIndex(
                (bankItem) => bankItem.id === item.id
              );

              const color = colors[originalIndex % colors.length];

              return (
                <button
                  key={`selected-${item.id}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDeselectWord(item)}
                  className={`max-w-full break-words rounded-xl border-2 border-b-4 px-3 py-2 text-xs font-extrabold transition-all active:translate-y-0.5 active:border-b-2 disabled:cursor-default sm:text-sm ${color.selected}`}
                >
                  {item.text}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Word Bank */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 sm:text-xs">
            Available words
          </span>
        </div>

        {/* Automatically wraps into as many rows as needed */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:gap-2.5 sm:p-4">
          {bankItems.map((item, idx) => {
            const isUsed = selectedItems.some((s) => s.id === item.id);
            const color = colors[idx % colors.length];

            return (
              <button
                key={`bank-${item.id}`}
                type="button"
                disabled={disabled || isUsed}
                onClick={() => handleSelectWord(item)}
                className={`max-w-full break-words rounded-xl border-2 border-b-4 px-3 py-2 text-xs font-extrabold transition-all duration-150 sm:px-4 sm:py-2.5 sm:text-sm ${
                  isUsed
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none"
                    : `border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_#e2e8f0] ${color.hover} active:translate-y-0.5 active:border-b-2`
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="pt-1 text-center text-[10px] font-bold text-slate-400 sm:text-xs">
        Tap a selected word to remove it from your sentence.
      </p>
    </div>
  );
}
