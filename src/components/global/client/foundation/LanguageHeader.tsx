"use client";

import React from "react";
import { Language } from "@prisma/client";
import { Globe, Trophy, Zap, Heart } from "lucide-react";

interface LanguageHeaderProps {
  languages: Language[];
  selectedLanguage: Language | null;
  onSelectLanguage: (lang: Language) => void;
}

export function LanguageHeader({
  languages,
  selectedLanguage,
  onSelectLanguage,
}: LanguageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-slate-200 px-6 py-3 flex items-center justify-between">
      {/* Language Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {languages.map((lang) => {
          const isSelected = selectedLanguage?.id === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onSelectLanguage(lang)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 border-2 ${
                isSelected
                  ? "bg-green-50 border-green-500 text-green-600 shadow-[0_3px_0_0_#22c55e]"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 shadow-[0_2px_0_0_#e2e8f0]"
              }`}
            >
              <span className="text-base">
                {getFlagEmoji(lang.countryCode)}
              </span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>

      {/* Gamification Counters */}
      <div className="flex items-center gap-4 shrink-0 font-extrabold text-sm">
        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
          <Zap className="w-4 h-4 fill-amber-500" />
          <span>12</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
          <Heart className="w-4 h-4 fill-red-500" />
          <span>5</span>
        </div>
      </div>
    </header>
  );
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}