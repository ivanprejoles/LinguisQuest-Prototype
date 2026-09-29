"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

export interface ReactSpeechButtonProps {
  text: string;
  voiceLanguage?: string; // e.g. "tl-PH", "en-US", "es-ES"
  rate?: number;
  pitch?: number;
  size?: "sm" | "md" | "lg";
  variant?: "sky" | "green" | "ghost";
  showLabel?: boolean;
  label?: string;
  className?: string;
}   

export const GamifiedReactSpeechButton: React.FC<ReactSpeechButtonProps> = ({
  text,
  voiceLanguage = "tl-PH",
  rate = 0.9, // Slightly slower for language learning clarity
  pitch = 1,
  size = "md",
  variant = "sky",
  showLabel = true,
  label = "Listen",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSupport, setHasSupport] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setHasSupport(false);
    }
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!hasSupport || !text.trim()) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLanguage;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!hasSupport) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
        <VolumeX className="w-4 h-4" /> TTS Unavailable
      </div>
    );
  }

// Variant Styling
  const variantStyles = {
    sky: isPlaying
      ? "bg-sky-400 border-sky-600 text-white shadow-none translate-y-1"
      : "bg-sky-500 hover:bg-sky-400 border-sky-600 text-white shadow-[0_4px_0_0_#0284c7] active:shadow-none active:translate-y-1",
    green: isPlaying
      ? "bg-green-400 border-green-600 text-white shadow-none translate-y-1"
      : "bg-green-500 hover:bg-green-400 border-green-600 text-white shadow-[0_4px_0_0_#16a34a] active:shadow-none active:translate-y-1",
    ghost: isPlaying
      ? "bg-sky-100 border-sky-400 text-sky-700 translate-y-0.5"
      : "bg-white hover:bg-sky-50 border-slate-200 text-sky-600 shadow-[0_3px_0_0_#e2e8f0] active:shadow-none active:translate-y-1",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 rounded-xl text-xs gap-1.5",
    md: "px-4 py-2.5 rounded-2xl text-sm gap-2.5",
    lg: "px-6 py-4 rounded-2xl text-base gap-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!text.trim()}
      className={`inline-flex items-center justify-center font-black border-2 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      <Volume2
        className={`${iconSizes[size]} shrink-0 ${
          isPlaying ? "animate-bounce" : ""
        }`}
      />

      {/* Animated Equalizer Waveform during speech */}
      {isPlaying ? (
        <div className="flex items-center gap-0.5 h-4 px-1">
          <span className="w-1 bg-current rounded-full h-2 animate-[bounce_0.6s_infinite_100ms]" />
          <span className="w-1 bg-current rounded-full h-4 animate-[bounce_0.6s_infinite_200ms]" />
          <span className="w-1 bg-current rounded-full h-2.5 animate-[bounce_0.6s_infinite_300ms]" />
        </div>
      ) : showLabel ? (
        <span className="tracking-wide uppercase font-extrabold">{label}</span>
      ) : null}
    </button>
  );
};