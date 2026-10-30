"use client";

import React, { useState, useEffect } from "react";
import { MultipleChoicePayload } from "@/types/foundation/materials";
import Image from "next/image";
import { Check } from "lucide-react";

interface MultipleChoiceProps {
  payload: MultipleChoicePayload;
  onAnswerChange: (isCorrect: boolean) => void;
  disabled?: boolean;
}

// Helper to safely extract string text from string, number, or object
const getText = (val: unknown): string => {
  if (typeof val === "string" || typeof val === "number") return String(val);
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
        imageUrl: typeof obj.imageUrl === "string" ? obj.imageUrl : null,
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

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none">
      {/* Question / Instruction Heading */}
      <h2 className="text-xl font-black text-white text-center leading-snug">
        {getText(payload?.question) || "Select the correct option"}
      </h2>

      {/* Options Grid */}
      <div
        className={`grid gap-3.5 w-full ${
          options.length === 3 && !hasImages
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {options.map((option, idx) => {
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option.id, option.isCorrect)}
              className={`relative flex ${
                hasImages ? "flex-col items-center p-3.5" : "flex-row items-center p-4 gap-3"
              } rounded-3xl border-2 transition-all duration-150 active:translate-y-1 active:shadow-none ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${
                isSelected
                  ? "bg-sky-50 border-sky-500 text-sky-800 shadow-[0_4px_0_0_#0284c7]"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0]"
              }`}
            >
              {/* Option Number Badge */}
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs transition-colors shrink-0 ${
                  isSelected
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                }`}
              >
                {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </span>

              {/* Optional Image */}
              {option.imageUrl && (
                <div className="relative w-full h-32 my-2 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <Image
                    src={option.imageUrl}
                    alt={option.text}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}

              {/* Option Text */}
              <span className={`font-black text-base text-center flex-1 ${hasImages ? "mt-1" : "text-left"}`}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}