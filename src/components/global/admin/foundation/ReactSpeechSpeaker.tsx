"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useSpeech } from "react-text-to-speech";

interface ReactSpeechSpeakerProps {
  text: string;
  voiceLanguage?: string; // e.g., "es-ES", "fr-FR", "tl-PH"
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "ghost" | "outline";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ReactSpeechButton({
  text,
  voiceLanguage = "tl-PH",
  size = "md",
  variant = "primary",
  showLabel = false,
  label,
  className = "",
}: ReactSpeechSpeakerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingProxy, setIsPlayingProxy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback engine using react-text-to-speech
  const { speechStatus, start: startFallback, stop: stopFallback } = useSpeech({
    text,
    lang: voiceLanguage,
    onError: (err) => console.error("Web Speech API Error:", err),
  });

  const isFallbackPlaying = speechStatus === "started";
  const isPlaying = isPlayingProxy || isFallbackPlaying;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!text || !text.trim()) return;

    // Stop current playback if active
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      stopFallback();
      setIsPlayingProxy(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Call internal proxy API endpoint with text and target voice language
    const audioUrl = `/api/tts?text=${encodeURIComponent(text.trim())}&lang=${encodeURIComponent(voiceLanguage)}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      setIsPlayingProxy(true);
      audio.play().catch((err) => {
        console.warn("Audio element play failed, invoking react-text-to-speech fallback:", err);
        setIsPlayingProxy(false);
        startFallback();
      });
    };

    audio.onended = () => {
      setIsPlayingProxy(false);
    };

    audio.onerror = () => {
      console.warn("Server TTS Proxy failed. Switching to react-text-to-speech fallback.");
      setIsLoading(false);
      setIsPlayingProxy(false);
      startFallback();
    };
  };

  // Sizing definitions
  const sizeClasses = {
    sm: "h-9 px-3 text-xs rounded-xl",
    md: "h-11 px-4 text-sm rounded-2xl",
    lg: "h-14 px-6 text-base rounded-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Duolingo-inspired styled variants matching your language modal design
  const variantClasses = {
    primary:
      "bg-sky-500 hover:bg-sky-600 text-white font-extrabold shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none border-none",
    ghost:
      "bg-sky-50 hover:bg-sky-100 text-sky-600 font-extrabold border-2 border-sky-200 active:translate-y-0.5",
    outline:
      "bg-white border-2 border-slate-200 hover:border-sky-500 text-slate-700 hover:text-sky-600 font-extrabold shadow-[0_3px_0_0_#e2e8f0] active:translate-y-0.5 active:shadow-none",
  };

  return (
    <Button
      type="button"
      onClick={handleSpeak}
      disabled={isLoading || !text.trim()}
      className={`transition-all duration-150 flex items-center gap-2 shrink-0 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin text-current`} />
      ) : isPlaying ? (
        <VolumeX className={`${iconSizes[size]} animate-pulse text-current`} />
      ) : (
        <Volume2 className={`${iconSizes[size]} text-current`} />
      )}

      {showLabel && (
        <span className="truncate">
          {label || (isPlaying ? "Stop" : "Listen")}
        </span>
      )}
    </Button>
  );
}