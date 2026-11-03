
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  Volume1,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useSpeech } from "react-text-to-speech";

type SpeechSpeed = "normal" | "slow";
type SpeechSize = "sm" | "md" | "lg";
type SpeechVariant = "primary" | "ghost" | "outline";

interface SpeechButtonProps {
  text: string;
  voiceLanguage?: string;
  speed?: SpeechSpeed;
  size?: SpeechSize;
  variant?: SpeechVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function SpeechButton({
  text,
  voiceLanguage = "tl-PH",
  speed = "normal",
  size = "md",
  variant = "primary",
  showLabel = false,
  label,
  className = "",
}: SpeechButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingProxy, setIsPlayingProxy] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback Web Speech API
  const {
    speechStatus,
    start: startFallback,
    stop: stopFallback,
  } = useSpeech({
    text,
    lang: voiceLanguage,
    rate: speed === "slow" ? 0.7 : 1,
    onError: (err) => {
      console.error("Speech API Error:", err);
    },
  });

  const isFallbackPlaying = speechStatus === "started";
  const isPlaying = isPlayingProxy || isFallbackPlaying;

  // Stop audio and speech when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop current playback
  const stopSpeaking = () => {
    const audio = audioRef.current;

    // Clear reference first to prevent stale callbacks
    audioRef.current = null;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    stopFallback();

    setIsPlayingProxy(false);
    setIsLoading(false);
  };

  // Play speech
  const handleSpeak = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    if (!text?.trim() || isLoading) return;

    // Stop if currently playing
    if (isPlaying) {
      stopSpeaking();
      return;
    }

    setIsLoading(true);

    // Build TTS API URL
    const params = new URLSearchParams({
      text: text.trim(),
      lang: voiceLanguage,
      speed,
    });

    const audio = new Audio(`/api/tts?${params.toString()}`);

    audioRef.current = audio;
    audio.preload = "auto";

    // Audio is ready
    audio.oncanplaythrough = async () => {
      if (audioRef.current !== audio) return;

      setIsLoading(false);
      setIsPlayingProxy(true);

      try {
        await audio.play();
      } catch (err) {
        console.warn("Audio playback failed:", err);

        audioRef.current = null;
        setIsPlayingProxy(false);

        startFallback();
      }
    };

    // Playback finished
    audio.onended = () => {
      if (audioRef.current !== audio) return;

      audioRef.current = null;
      setIsPlayingProxy(false);
    };

    // API failed - use browser speech fallback
    audio.onerror = () => {
      if (audioRef.current !== audio) return;

      console.warn("TTS proxy failed. Using fallback.");

      audioRef.current = null;
      setIsLoading(false);
      setIsPlayingProxy(false);

      startFallback();
    };
  };

  // Button dimensions
  const sizeClasses: Record<SpeechSize, string> = {
    sm: "h-9 px-3 text-xs rounded-xl",
    md: "h-11 px-4 text-sm rounded-2xl",
    lg: "h-14 px-6 text-base rounded-2xl",
  };

  // Icon dimensions
  const iconSizes: Record<SpeechSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Button styles
  const variantClasses: Record<SpeechVariant, string> = {
    primary:
      "bg-sky-500 hover:bg-sky-600 text-white font-extrabold shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none border-none",

    ghost:
      "bg-sky-50 hover:bg-sky-100 text-sky-600 font-extrabold border-2 border-sky-200 active:translate-y-0.5",

    outline:
      "bg-white border-2 border-slate-200 hover:border-sky-500 text-slate-700 hover:text-sky-600 font-extrabold shadow-[0_3px_0_0_#e2e8f0] active:translate-y-0.5 active:shadow-none",
  };

  // Dynamic icon
  const Icon = isLoading
    ? Loader2
    : isPlaying
      ? VolumeX
      : speed === "slow"
        ? Volume1
        : Volume2;

  // Default label
  const defaultLabel =
    speed === "slow" ? "Slow" : "Listen";

  const displayLabel =
    label || (isPlaying ? "Stop" : defaultLabel);

  return (
    <Button
      type="button"
      onClick={handleSpeak}
      disabled={isLoading || !text?.trim()}
      aria-label={
        isPlaying
          ? "Stop speech"
          : speed === "slow"
            ? "Play slow speech"
            : "Play normal speech"
      }
      aria-pressed={isPlaying}
      className={`
        transition-all duration-150
        flex items-center justify-center gap-2
        shrink-0 select-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {/* Speech Icon + Slow Indicator */}
      <span className="relative inline-flex items-center shrink-0">
        <Icon
          className={`
            ${iconSizes[size]}
            ${isLoading ? "animate-spin" : ""}
            ${isPlaying ? "animate-pulse" : ""}
          `}
        />

        {/* Slow Speed Badge */}
        {speed === "slow" && !isLoading && !isPlaying && (
          <span
            className="
              absolute -top-2 -right-3
              text-[9px] font-black
              leading-none
            "
          >
            0.7×
          </span>
        )}
      </span>

      {/* Optional Dynamic Label */}
      {showLabel && (
        <span className="truncate">
          {displayLabel}
        </span>
      )}
    </Button>
  );
}
