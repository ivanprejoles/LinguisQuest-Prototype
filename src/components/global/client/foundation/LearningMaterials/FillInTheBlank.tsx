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
