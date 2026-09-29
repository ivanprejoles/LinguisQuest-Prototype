"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2, Turtle } from "lucide-react";
import { useSpeech } from "react-text-to-speech";

export type AudioMode = "recorded" | "speech";

interface AudioSpeakerButtonProps {
  /** "recorded" | "speech" */
  audioType?: AudioMode | string | null;
  /** Recorded audio URL or "__SPEECH__" / null */
  audioUrl?: string | null;
  /** Text to speak when using TTS (payload.question / payload.targetSentence) */
  text?: string;
  /** Language tag for TTS (e.g. "tl-PH") */
  voiceLanguage?: string;
  /** Playback speed multiplier (e.g., 0.6 for slow mode) */
  playbackRate?: number;
  /** Shortcut flag for slow turtle mode */
  isSlow?: boolean;
  /** Custom icon override ("volume" | "turtle") */
  icon?: "volume" | "turtle";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "ghost" | "outline" | "accent" | "turtle";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function GamifiedAudioSpeakerButton({
  audioType,
  audioUrl,
  text = "",
  voiceLanguage = "tl-PH",
  playbackRate,
  isSlow = false,
  icon,
  size = "md",
  variant,
  showLabel = false,
  label,
  className = "",
}: AudioSpeakerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effective playback speed (0.6 for slow turtle mode, 1.0 for standard)
  const effectiveRate = playbackRate ?? (isSlow ? 0.6 : 1.0);

  // Client-side Web Speech API fallback with rate control
  const { speechStatus, start: startClientFallback, stop: stopClientFallback } = useSpeech({
    text,
    lang: voiceLanguage,
    rate: effectiveRate,
    onError: (err) => console.error("Web Speech API Error:", err),
  });

  const isFallbackPlaying = speechStatus === "started";
  const isPlaying = isPlayingAudio || isFallbackPlaying;

  // Determine whether to play recorded audio or call TTS API
  const hasRecordedAudio =
    audioType === "recorded" &&
    Boolean(audioUrl) &&
    audioUrl !== "__SPEECH__" &&
    audioUrl !== "null";

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      stopClientFallback();
      setIsPlayingAudio(false);
      setIsLoading(false);
      return;
    }

    // Option 1: Recorded Audio Mode
    if (hasRecordedAudio && audioUrl) {
      setIsLoading(true);

      const audio = new Audio(audioUrl);
      audio.playbackRate = effectiveRate;
      audioRef.current = audio;

      const handleEnded = () => {
        setIsPlayingAudio(false);
        setIsLoading(false);
      };

      const handleError = (err: unknown) => {
        console.warn("Recorded audio playback failed, falling back to TTS API:", err);
        setIsLoading(false);
        setIsPlayingAudio(false);
        playServerTts();
      };

      audio.onended = handleEnded;
      audio.onerror = handleError;

      audio
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlayingAudio(true);
        })
        .catch((err) => handleError(err));

      return;
    }

    // Option 2: Speech Mode (via /api/tts)
    playServerTts();
  };

  const playServerTts = () => {
    if (!text || !text.trim()) return;

    setIsLoading(true);
    const serverTtsUrl = `/api/tts?text=${encodeURIComponent(
      text.trim()
    )}&lang=${encodeURIComponent(voiceLanguage)}&rate=${effectiveRate}`;
    
    const audio = new Audio(serverTtsUrl);
    audio.playbackRate = effectiveRate;
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setIsLoading(false);
    };

    const handleError = () => {
      console.warn("Server TTS Proxy error, falling back to Web Speech API.");
      setIsLoading(false);
      setIsPlayingAudio(false);
      startClientFallback();
    };

    audio.onended = handleEnded;
    audio.onerror = handleError;

    audio
      .play()
      .then(() => {
        setIsLoading(false);
        setIsPlayingAudio(true);
      })
      .catch(() => handleError());
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-xs rounded-xl",
    md: "h-12 px-5 text-sm rounded-2xl",
    lg: "h-14 px-6 text-base rounded-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Default variant selection based on mode
  const effectiveVariant = variant || (isSlow ? "turtle" : "primary");

  const variantClasses = {
    primary:
      "bg-sky-500 hover:bg-sky-600 text-white font-black shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none border-none",
    accent:
      "bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none border-none",
    turtle:
      "bg-amber-400 hover:bg-amber-500 text-amber-950 font-black shadow-[0_4px_0_0_#d97706] active:translate-y-1 active:shadow-none border-none",
    ghost:
      "bg-sky-50 hover:bg-sky-100 text-sky-600 font-extrabold border-2 border-sky-200 active:translate-y-0.5",
    outline:
      "bg-white border-2 border-slate-200 hover:border-sky-500 text-slate-700 hover:text-sky-600 font-extrabold shadow-[0_3px_0_0_#e2e8f0] active:translate-y-0.5 active:shadow-none",
  };

  const isDisabled = isLoading || (!hasRecordedAudio && !text.trim());

  const useTurtleIcon = icon === "turtle" || (isSlow && icon !== "volume");

  return (
    <Button
      type="button"
      onClick={handlePlay}
      disabled={isDisabled}
      className={`transition-all duration-150 flex items-center gap-2 shrink-0 ${sizeClasses[size]} ${variantClasses[effectiveVariant]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin text-current`} />
      ) : isPlaying ? (
        <VolumeX className={`${iconSizes[size]} animate-pulse text-current`} />
      ) : useTurtleIcon ? (
        <Turtle className={`${iconSizes[size]} text-current`} />
      ) : (
        <Volume2 className={`${iconSizes[size]} text-current`} />
      )}

      {showLabel && (
        <span className="truncate">
          {label || (isPlaying ? "Stop" : isSlow ? "Slow" : "Listen")}
        </span>
      )}
    </Button>
  );
}