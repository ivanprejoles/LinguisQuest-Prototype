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
  id: string; // Unique ID to support sentences with duplicate words
  text: string;
}

const getWordText = (item: unknown): string => {
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(obj.word ?? obj.text ?? obj.label ?? "");
  }
  return String(item ?? "");
};

export function SentenceBuilder({
  payload,
  voiceLanguage = "tl-PH",
  onAnswerChange,
}: Props) {
  // Map bank into unique TileItem objects
  const createTileBank = useCallback((): TileItem[] => {
    const rawBank = payload.scrambledWordBank || [];
    return rawBank.map((item, index) => ({
      id: `tile-${index}-${getWordText(item)}`,
      text: getWordText(item),
    }));
  }, [payload.scrambledWordBank]);

  console.log(payload)

  const [selectedTiles, setSelectedTiles] = useState<TileItem[]>([]);
  const [bankTiles, setBankTiles] = useState<TileItem[]>(createTileBank);

  // Sync state whenever payload changes
  useEffect(() => {
    setSelectedTiles([]);
    setBankTiles(createTileBank());
  }, [payload, createTileBank]);

  // Evaluates answer correctness
  const checkAnswer = (currentSelected: TileItem[]) => {
    const correctTargetStrings = (payload.correctSentenceArray || []).map(getWordText);

    const isMatched =
      currentSelected.length === correctTargetStrings.length &&
      currentSelected.every((tile, idx) => tile.text === correctTargetStrings[idx]);

    onAnswerChange(isMatched);
  };

  const handleSelect = (tile: TileItem) => {
    if (selectedTiles.some((t) => t.id === tile.id)) return;

    const nextSelected = [...selectedTiles, tile];
    setSelectedTiles(nextSelected);
    checkAnswer(nextSelected);
  };

  const handleDeselect = (tileId: string) => {
    const nextSelected = selectedTiles.filter((t) => t.id !== tileId);
    setSelectedTiles(nextSelected);
    checkAnswer(nextSelected);
  };

  const handleReset = () => {
    setSelectedTiles([]);
    onAnswerChange(false);
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full gap-6 select-none pt-2">
      {/* Target Question / Audio Prompt Header */}
      <div className="w-full bg-sky-50/80 border-2 border-sky-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
        <GamifiedAudioSpeakerButton
          audioType={payload.audioType}   // "speech"
          audioUrl={payload.audioUrl}     // "__SPEECH__"
          text={payload.question}         // "Ang pusa ay kumakain ng isda"
          voiceLanguage={voiceLanguage}   // "tl-PH"
          size="md"
          variant="primary"
          />
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Translate or build this sentence
          </span>
          <h2 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
            {payload.question}
          </h2>
        </div>
      </div>

      {/* Answer Dropzone Slot */}
      <div className="w-full min-h-[120px] p-4 bg-slate-100/80 border-2 border-dashed border-slate-300 rounded-3xl flex flex-wrap gap-2.5 items-center justify-start relative transition-all">
        {selectedTiles.length === 0 ? (
          <p className="text-sm font-extrabold text-slate-400 italic w-full text-center pointer-events-none">
            Tap word tiles below to assemble your sentence...
          </p>
        ) : (
          selectedTiles.map((tile) => (
            <button
              key={`selected-${tile.id}`}
              type="button"
              onClick={() => handleDeselect(tile.id)}
              className="px-4 py-2.5 bg-white border-2 border-b-4 border-sky-400 hover:border-sky-500 text-sky-600 rounded-2xl font-black text-base shadow-sm active:translate-y-1 active:border-b-2 transition-all animate-in zoom-in-95 duration-100"
            >
              {tile.text}
            </button>
          ))
        )}

        {/* Clear All Button */}
        {selectedTiles.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
            title="Reset answer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Word Tile Bank */}
      <div className="w-full flex flex-wrap gap-2.5 justify-center pt-2 min-h-[100px]">
        {bankTiles.map((tile) => {
          const isUsed = selectedTiles.some((t) => t.id === tile.id);

          return isUsed ? (
            /* Ghost tile placeholder maintains grid structure */
            <div
              key={`ghost-${tile.id}`}
              className="px-4 py-2.5 bg-slate-200/50 border-2 border-slate-200 rounded-2xl text-transparent font-black text-base select-none pointer-events-none"
            >
              {tile.text}
            </div>
          ) : (
            /* Interactive Bank Tile */
            <button
              key={`bank-${tile.id}`}
              type="button"
              onClick={() => handleSelect(tile)}
              className="px-4 py-2.5 bg-white border-2 border-b-4 border-slate-200 hover:border-slate-300 active:border-b-2 active:translate-y-1 rounded-2xl font-black text-base text-slate-700 shadow-sm transition-all"
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}