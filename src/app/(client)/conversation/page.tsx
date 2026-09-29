"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AvatarCanvas } from "@/components/global/client/conversation/AvatarCanvas";
import { Mic, MicOff, Loader2 } from "lucide-react";

export default function FastConversationPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [status, setStatus] = useState("Hold or tap to speak");
  const [emotion, setEmotion] = useState("neutral");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize browser speech recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US"; // Change language dynamically as needed

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setTranscriptText(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // 1. Process prompt with Gemini and trigger automated reply
  const processUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setStatus("Lingo is thinking...");
    setEmotion("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText: text, targetLanguage: "English" }),
      });

      const data = await res.json();
      setEmotion(data.emotion || "happy");

      // 2. Natural human-like pause (650ms delay) before AI speaks automatically
      setStatus("Lingo is replying...");
      setTimeout(() => {
        if (audioRef.current) {
          // Native browser TTS fallback or dynamic audio stream endpoint
          const utterance = new SpeechSynthesisUtterance(data.aiResponseText);
          utterance.rate = 0.95; // Slightly slower for language learners

          utterance.onstart = () => setStatus("Lingo is speaking...");
          utterance.onend = () => {
            setStatus("Hold or tap to speak");
            setEmotion("neutral");
          };

          window.speechSynthesis.speak(utterance);
        }
      }, 650);
    } catch (err) {
      console.error(err);
      setStatus("Failed to respond");
    }
  }, []);

  // Mic control toggles
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcriptText) processUserMessage(transcriptText);
    } else {
      window.speechSynthesis.cancel(); // Stop active speaking
      setTranscriptText("");
      recognitionRef.current.start();
      setIsListening(true);
      setStatus("Listening...");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 text-white p-4 justify-between">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-black text-sky-400 text-lg tracking-wide">LINGO CONVERSATION</h1>
        <p className="text-xs text-slate-400 font-medium">{status}</p>
      </div>

      {/* 3D Model with zero unnecessary re-renders */}
      <AvatarCanvas audioRef={audioRef} emotion={emotion} />

      {/* Hidden audio element for audio node connectivity */}
      <audio ref={audioRef} hidden />

      {/* Live Speech Feedback */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[70px] flex items-center justify-center text-center">
        <p className="text-sm font-semibold text-slate-300">
          {transcriptText || <span className="text-slate-500 italic">Your speech will appear here...</span>}
        </p>
      </div>

      {/* Single Push-to-Talk Button */}
      <div className="flex justify-center pb-4">
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-lg ${
            isListening
              ? "bg-red-500 scale-105 animate-pulse shadow-red-500/30"
              : "bg-sky-500 hover:bg-sky-400 shadow-sky-500/30"
          }`}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
      </div>
    </div>
  );
}