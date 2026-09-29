// "use client";

// import React, { useState, useRef, useEffect, useCallback } from "react";

// import { Mic, MicOff, Loader2 } from "lucide-react";
// import { CharacterModel } from "@/components/global/admin/ai-speak/AvatarCanvas";

// export default function FastConversationPage() {
//   const [isListening, setIsListening] = useState(false);
//   const [transcriptText, setTranscriptText] = useState("");
//   const [status, setStatus] = useState("Tap to start speaking");
//   const [emotion, setEmotion] = useState("neutral");
//   const [targetLanguage, setTargetLanguage] = useState("English");
//   const [langCode, setLangCode] = useState("en-US"); // e.g., "tl-PH" for Tagalog

//   const recognitionRef = useRef<any>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const latestTranscriptRef = useRef("");

//   // Process prompt with Gemini and trigger Google TTS Audio Stream
//   const processUserMessage = useCallback(async (text: string) => {
//     if (!text.trim()) return;

//     setStatus("Lingo is thinking...");
//     setEmotion("thinking");

//     try {
//       // 1. Fetch AI response and emotion from Gemini
//       const res = await fetch("/api/conversation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userText: text, targetLanguage }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Conversation failed");

//       // Set avatar emotion directly from Gemini response
//       setEmotion(data.emotion || "happy");
//       setStatus("Lingo is preparing voice...");

//       // 2. Load Google TTS Audio from proxy endpoint
//       const ttsUrl = `/api/tts?text=${encodeURIComponent(data.aiResponseText)}&lang=${encodeURIComponent(langCode)}`;

//       if (audioRef.current) {
//         audioRef.current.src = ttsUrl;
//         audioRef.current.onplay = () => setStatus("Lingo is speaking...");
//         audioRef.current.onended = () => {
//           setStatus("Tap mic to speak");
//           setEmotion("neutral");
//         };

//         // Play native stream
//         await audioRef.current.play();
//       }
//     } catch (err) {
//       console.error(err);
//       setStatus("Failed to process conversation");
//       setEmotion("neutral");
//     }
//   }, [targetLanguage, langCode]);

//   // Initialize Speech Recognition
//   useEffect(() => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

//     if (SpeechRecognition) {
//       const recognition = new SpeechRecognition();
//       recognition.continuous = false;
//       recognition.interimResults = true;
//       recognition.lang = langCode;

//       recognition.onresult = (event: any) => {
//         const text = Array.from(event.results)
//           .map((result: any) => result[0][0].transcript)
//           .join("");
//         setTranscriptText(text);
//         latestTranscriptRef.current = text;
//       };

//       recognition.onend = () => {
//         setIsListening(false);
//         if (latestTranscriptRef.current.trim()) {
//           processUserMessage(latestTranscriptRef.current);
//         }
//       };

//       recognitionRef.current = recognition;
//     }
//   }, [processUserMessage, langCode]);

//   // Mic Control
//   const toggleListening = () => {
//     if (!recognitionRef.current) return;

//     if (isListening) {
//       recognitionRef.current.stop();
//     } else {
//       // Stop ongoing audio playback if user starts speaking
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }
//       setTranscriptText("");
//       latestTranscriptRef.current = "";
//       recognitionRef.current.start();
//       setIsListening(true);
//       setStatus("Listening...");
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 text-white p-4 justify-between">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="font-black text-sky-400 text-lg tracking-wide">LINGO CONVERSATION</h1>
//         <p className="text-xs text-slate-400 font-medium">{status}</p>
//       </div>

//       {/* 3D Avatar Canvas */}
//       <CharacterModel audioRef={audioRef} emotion={emotion} />

//       {/* Native HTML5 Audio player synced with Avatar Canvas */}
//       <audio ref={audioRef} hidden crossOrigin="anonymous" />

//       {/* Live Speech Feedback */}
//       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[70px] flex items-center justify-center text-center">
//         <p className="text-sm font-semibold text-slate-300">
//           {transcriptText || <span className="text-slate-500 italic">Your speech will appear here...</span>}
//         </p>
//       </div>

//       {/* Toggle Button */}
//       <div className="flex justify-center pb-4">
//         <button
//           onClick={toggleListening}
//           className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-lg ${
//             isListening
//               ? "bg-red-500 scale-105 animate-pulse shadow-red-500/30"
//               : "bg-sky-500 hover:bg-sky-400 shadow-sky-500/30"
//           }`}
//         >
//           {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
//         </button>
//       </div>
//     </div>
//   );
// }