"use client";

import React, { useState, useEffect } from "react";
import { MultipleChoicePayload } from "@/types/foundation/materials";
import Image from "next/image";
import { Check, RotateCcw } from "lucide-react";
import { SpeechButton } from "@/components/global/speech-button";

interface MultipleChoiceProps {
  payload: MultipleChoicePayload;
  onAnswerChange: (isCorrect: boolean) => void;
  disabled?: boolean;
  voiceLanguage: string;
}

// Helper to safely extract string text from string, number, or object
const getText = (val: unknown): string => {
  if (typeof val === "string" || typeof val === "number") {
    return String(val);
  }

  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    return String(obj.text ?? obj.word ?? obj.label ?? obj.value ?? "");
  }

  return "";
};

export function MultipleChoice({
  payload,
  onAnswerChange,
  disabled = false,
  voiceLanguage,
}: MultipleChoiceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset selection when payload changes
  useEffect(() => {
    setSelectedId(null);
  }, [payload]);

  // Normalize options array to ensure safe handling of structure
  const options = (payload?.options || []).map((opt: unknown, index: number) => {
    if (typeof opt === "object" && opt !== null) {
      const obj = opt as Record<string, unknown>;
      const optText = getText(obj.text ?? obj.word ?? obj);
      const optId = String(obj.id ?? `opt-${index + 1}`);
      const targetAnswer = getText(payload?.correctAnswer);

      return {
        id: optId,
        text: optText,
        imageUrl: typeof obj.imageUrl === "string" && obj.imageUrl
          ? obj.imageUrl
          : null,
        isCorrect:
          obj.isCorrect !== undefined
            ? Boolean(obj.isCorrect)
            : optId === targetAnswer || optText === targetAnswer,
      };
    }

    const strVal = getText(opt);
    const targetAnswer = getText(payload?.correctAnswer);

    return {
      id: `opt-${index + 1}`,
      text: strVal,
      imageUrl: null,
      isCorrect: strVal === targetAnswer,
    };
  });

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    if (disabled) return;

    setSelectedId(optionId);
    onAnswerChange(isCorrect);
  };

  const hasImages = options.some((opt) => opt.imageUrl);

  const questionText =
    getText(payload?.question) || "Choose the correct answer!";

  // Option colors
  const colors = [
    {
      badge: "bg-cyan-100 text-cyan-700",
      selected: "border-cyan-500 bg-cyan-50",
      shadow: "shadow-[0_3px_0_#06b6d4]",
      hover: "hover:border-cyan-300",
    },
    {
      badge: "bg-violet-100 text-violet-700",
      selected: "border-violet-500 bg-violet-50",
      shadow: "shadow-[0_3px_0_#8b5cf6]",
      hover: "hover:border-violet-300",
    },
    {
      badge: "bg-amber-100 text-amber-700",
      selected: "border-amber-500 bg-amber-50",
      shadow: "shadow-[0_3px_0_#f59e0b]",
      hover: "hover:border-amber-300",
    },
    {
      badge: "bg-emerald-100 text-emerald-700",
      selected: "border-emerald-500 bg-emerald-50",
      shadow: "shadow-[0_3px_0_#10b981]",
      hover: "hover:border-emerald-300",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl select-none flex-col items-center gap-2">

      {/* Compact Activity Header */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1">
          <Check className="h-3.5 w-3.5 shrink-0 text-cyan-600" />

          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700">
            Multiple Choice
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedId(null)}
          disabled={disabled}
          className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-[0_2px_0_#e2e8f0] transition-all hover:border-cyan-300 hover:text-cyan-600 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>

      {/* Compact Question + Speech Button */}
      <div className="flex w-full items-center justify-center gap-2 px-1 py-1">
        <h2 className="min-w-0 text-center text-base font-black leading-snug text-white sm:text-lg md:text-xl">
          {questionText}
        </h2>

        <SpeechButton
          text={questionText}
          voiceLanguage={voiceLanguage || "tl-PH"}
          size="sm"
          variant="ghost"
          className="!h-9 !w-9 !shrink-0 !p-0 rounded-xl"
        />
      </div>

      {/* Compact Options Grid */}
      <div
        className={`grid w-full gap-2 ${
          hasImages
            ? "grid-cols-2 items-stretch"
            : options.length === 3
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {options.map((option, idx) => {
          const isSelected = selectedId === option.id;
          const color = colors[idx % colors.length];

          return (
            <div key={option.id} className="relative h-full min-w-0">

              {/* Speech Button */}
              <div className="absolute right-2 top-2 z-20 rounded-lg bg-white shadow-sm">
                <SpeechButton
                  text={option.text}
                  voiceLanguage={voiceLanguage || "tl-PH"}
                  size="sm"
                  variant="ghost"
                  className="!h-8 !w-8 !p-0 rounded-lg"
                />
              </div>

              {option.imageUrl ? (
                /* IMAGE OPTION */
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    handleSelect(option.id, option.isCorrect)
                  }
                  className={`group relative flex h-full w-full flex-col items-center overflow-hidden rounded-2xl border-2 p-2 transition-all duration-200 ${
                    disabled
                      ? "cursor-default"
                      : "cursor-pointer hover:-translate-y-0.5"
                  } ${
                    isSelected
                      ? `${color.selected} ${color.shadow}`
                      : `border-slate-200 bg-white shadow-[0_3px_0_#e2e8f0] ${color.hover}`
                  }`}
                >
                  {/* Option Badge */}
                  <span
                    className={`absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${color.badge}`}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>

                  {/* Image Area */}
                  <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-1.5 sm:h-28">
                    <Image
                      src={option.imageUrl}
                      alt={option.text}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, 240px"
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Answer Text */}
                  <div className="flex min-h-9 w-full items-center justify-center px-2 py-1.5">
                    <span className="text-center text-sm font-extrabold text-slate-700 sm:text-base">
                      {option.text}
                    </span>
                  </div>
                </button>
              ) : (
                /* TEXT-ONLY OPTION */
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    handleSelect(option.id, option.isCorrect)
                  }
                  className={`group flex min-h-[56px] w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2 pr-12 text-left transition-all duration-200 ${
                    disabled
                      ? "cursor-default"
                      : "cursor-pointer hover:-translate-y-0.5"
                  } ${
                    isSelected
                      ? `${color.selected} ${color.shadow}`
                      : `border-slate-200 bg-white shadow-[0_3px_0_#e2e8f0] ${color.hover}`
                  }`}
                >
                  {/* Option Badge */}
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${color.badge}`}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>

                  {/* Answer Text */}
                  <span className="min-w-0 flex-1 break-words text-sm font-extrabold text-slate-700">
                    {option.text}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
