"use client";

import React, { useState, useMemo } from "react";
import {
  FillInTheBlankPayload,
  FillInTheBlankOption,
} from "@/types/foundation/materials";
import { Volume2, CheckCircle2 } from "lucide-react";
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

  // Normalize options array from payload
  const options = useMemo<FillInTheBlankOption[]>(() => {
    return (payload?.options || []).map((opt, index) => ({
      id: opt.id || `opt-${index + 1}`,
      word: opt.word || "",
      isCorrect: Boolean(opt.isCorrect),
    }));
  }, [payload]);

  // Extract sentence parts based on blankedWordIndex, explicit underscores, or target word
  const { before, after } = useMemo(() => {
    const fullSentence = payload?.fullSentence || "";
    const wordIndex = payload?.blankedWordIndex;

    // Strategy 1: Explicit index from builder
    if (typeof wordIndex === "number" && wordIndex >= 0) {
      const words = fullSentence.trim().split(/\s+/).filter(Boolean);
      if (wordIndex < words.length) {
        const beforeStr = words.slice(0, wordIndex).join(" ");
        const afterStr = words.slice(wordIndex + 1).join(" ");
        return { before: beforeStr, after: afterStr };
      }
    }

    // Strategy 2: Explicit "____" in fullSentence string
    if (fullSentence.includes("____")) {
      const parts = fullSentence.split(/_+/);
      return { before: parts[0]?.trim() || "", after: parts[1]?.trim() || "" };
    }

    // Strategy 3: Target word match fallback
    const targetWord = payload?.targetWord || "";
    if (targetWord && fullSentence.includes(targetWord)) {
      const parts = fullSentence.split(targetWord);
      return { before: parts[0]?.trim() || "", after: parts[1]?.trim() || "" };
    }

    return { before: fullSentence, after: "" };
  }, [payload]);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    setSelectedId(optionId);
    onAnswerChange(isCorrect);
  };

  const selectedOption = options.find((o) => o.id === selectedId);
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

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6">
      {/* Sentence Card with Audio Speaker */}
      <div className="relative w-full bg-slate-50 border-2 border-b-4 border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Listen & Complete Sentence
            </span>
          </div>

          {/* Audio Player / Speech Synthesizer */}
          <div className="shrink-0 flex items-center gap-2">
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

        {/* Sentence Display with Dynamic Blank Slot */}
        <div className="text-xl md:text-2xl font-black text-slate-800 leading-relaxed text-center py-2">
          {before}{" "}
          <span
            className={`inline-flex items-center justify-center min-w-[120px] px-4 py-1 mx-1.5 rounded-2xl border-b-4 font-black transition-all ${
              selectedOption
                ? "bg-amber-100 border-amber-500 text-amber-900 shadow-[0_2px_0_0_#f59e0b] scale-105"
                : "bg-slate-200/80 border-slate-300 text-slate-400 border-dashed border-2 min-h-[44px]"
            }`}
          >
            {selectedOption ? selectedOption.word : "______"}
          </span>{" "}
          {after}
        </div>
      </div>

      {/* Choice Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id, opt.isCorrect)}
              className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 border-b-4 transition-all cursor-pointer select-none active:translate-y-0.5 ${
                isSelected
                  ? "bg-sky-500 border-sky-600 text-white shadow-[0_4px_0_0_#0284c7]"
                  : "bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50 shadow-[0_4px_0_0_#e2e8f0]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    opt.id.replace("opt-", "")
                  )}
                </span>
                <span className="text-lg font-black">{opt.word}</span>
              </div>

              {/* Individual Speech Button for Choice Word */}
              <div
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
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