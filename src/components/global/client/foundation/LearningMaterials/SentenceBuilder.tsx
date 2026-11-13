
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SentenceBuilderPayload } from "@/types/foundation/materials";
import { RotateCcw, Sparkles } from "lucide-react";
import { GamifiedAudioSpeakerButton } from "@/components/global/admin/foundation/GamifiedAudioSpeakerButton";

interface Props {
  payload: SentenceBuilderPayload;
  voiceLanguage?: string;
  onAnswerChange: (isCorrect: boolean) => void;
}

interface TileItem {
  id: string;
  text: string;
}

const getWordText = (item: unknown): string => {
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(obj.word ?? obj.text ?? obj.label ?? "");
  }

  return String(item ?? "");
};

const tileColors = [
  "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
  "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100",
  "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
  "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100",
  "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100",
  "border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100",
  "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
];

export function SentenceBuilder({
  payload,
  voiceLanguage = "tl-PH",
  onAnswerChange,
}: Props) {
  const createTileBank = useCallback((): TileItem[] => {
    const rawBank = payload.scrambledWordBank || [];

    return rawBank.map((item, index) => ({
      id: `tile-${index}-${getWordText(item)}`,
      text: getWordText(item),
    }));
  }, [payload.scrambledWordBank]);

  const [selectedTiles, setSelectedTiles] = useState<TileItem[]>([]);
  const [bankTiles, setBankTiles] = useState<TileItem[]>(createTileBank);

  // Reset tiles when the activity changes
  useEffect(() => {
    setSelectedTiles([]);
    setBankTiles(createTileBank());
  }, [payload, createTileBank]);

  // Play pronunciation of an individual word
  const speakWord = useCallback(
    (text: string) => {
      if (!text || !text.trim()) return;

      const serverTtsUrl = `/api/tts?text=${encodeURIComponent(
        text.trim()
      )}&lang=${encodeURIComponent(voiceLanguage)}&rate=0.9`;

      const audio = new Audio(serverTtsUrl);

      audio.play().catch(() => {
        if (
          typeof window !== "undefined" &&
          "speechSynthesis" in window
        ) {
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = voiceLanguage;
          utterance.rate = 0.9;

          const voices = window.speechSynthesis.getVoices();
          const targetLang = voiceLanguage.toLowerCase();
          const langPrefix = targetLang.split("-")[0];

          const matchedVoice = voices.find(
            (voice) =>
              voice.lang.toLowerCase() === targetLang ||
              voice.lang.toLowerCase().startsWith(langPrefix)
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

  // Validate the constructed sentence
  const checkAnswer = (currentSelected: TileItem[]) => {
    const correctTargetStrings = (
      payload.correctSentenceArray || []
    ).map(getWordText);

    const isMatched =
      currentSelected.length === correctTargetStrings.length &&
      currentSelected.every(
        (tile, index) => tile.text === correctTargetStrings[index]
      );

    onAnswerChange(isMatched);
  };

  // Select a word and play its pronunciation
  const handleSelect = (tile: TileItem) => {
    if (selectedTiles.some((t) => t.id === tile.id)) return;

    // Play audio when the user taps a word
    speakWord(tile.text);

    const nextSelected = [...selectedTiles, tile];

    setSelectedTiles(nextSelected);
    checkAnswer(nextSelected);
  };

  // Remove a selected word
  const handleDeselect = (tileId: string) => {
    const nextSelected = selectedTiles.filter(
      (tile) => tile.id !== tileId
    );

    setSelectedTiles(nextSelected);
    checkAnswer(nextSelected);
  };

  // Reset the sentence
  const handleReset = () => {
    setSelectedTiles([]);
    onAnswerChange(false);
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-3 sm:gap-4 select-none pt-1">

      {/* Activity Header */}
      <div className="w-full flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 border-2 border-cyan-200 px-3 py-1.5">
          <Sparkles className="w-4 h-4 text-cyan-700" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-cyan-800">
            Build the Sentence
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-100 hover:border-slate-300 active:translate-y-0.5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
      </div>

      {/* Question and Audio */}
      <div className="w-full bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
        <GamifiedAudioSpeakerButton
          audioType={payload.audioType}
          audioUrl={payload.audioUrl}
          text={payload.question}
          voiceLanguage={voiceLanguage}
          size="md"
          variant="primary"
        />

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-700 mb-1">
            Listen and build the sentence
          </span>

          <h2 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
            {payload.question}
          </h2>
        </div>
      </div>

      {/* Answer Area */}
      <div className="w-full min-h-[90px] p-3 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-wrap gap-2 items-center justify-start relative">
        {selectedTiles.length === 0 ? (
          <p className="text-xs sm:text-sm font-bold text-slate-500 italic w-full text-center">
            Tap the word tiles below to build your sentence.
          </p>
        ) : (
          selectedTiles.map((tile, index) => (
            <button
              key={`selected-${tile.id}`}
              type="button"
              onClick={() => handleDeselect(tile.id)}
              className={`px-3 py-2 border-2 border-b-4 rounded-xl font-bold text-sm shadow-sm active:translate-y-1 active:border-b-2 transition-all animate-in zoom-in-95 duration-100 ${
                tileColors[
                  bankTiles.findIndex((bankTile) => bankTile.id === tile.id) %
                    tileColors.length
                ]
              }`}
            >
              {tile.text}
            </button>
          ))
        )}

        {/* Clear Answer */}
        {selectedTiles.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute top-2 right-2 p-1.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-700 rounded-lg shadow-sm transition-all"
            title="Clear answer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Word Tile Bank */}
      <div className="w-full flex flex-wrap gap-2 justify-center pt-0 min-h-0">
        {bankTiles.map((tile, index) => {
          const isUsed = selectedTiles.some(
            (selected) => selected.id === tile.id
          );

          return isUsed ? (
            <div
              key={`ghost-${tile.id}`}
              className="px-3 py-2 bg-slate-200 border-2 border-slate-300 rounded-xl text-transparent font-bold text-sm select-none pointer-events-none"
            >
              {tile.text}
            </div>
          ) : (
            <button
              key={`bank-${tile.id}`}
              type="button"
              onClick={() => handleSelect(tile)}
              className={`px-3 py-2 border-2 border-b-4 rounded-xl font-bold text-sm shadow-sm active:border-b-2 active:translate-y-1 transition-all ${
                tileColors[index % tileColors.length]
              }`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

    </div>
  );
}
