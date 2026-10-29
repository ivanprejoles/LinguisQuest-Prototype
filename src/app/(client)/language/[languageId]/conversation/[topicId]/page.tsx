// "use client";

// import dynamic from "next/dynamic";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import {
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
//   type FormEvent,
// } from "react";
// import { useLanguageStore } from "@/store/foundation/language-store";

// const VRMViewer = dynamic(
//   () => import("@/components/global/client/conversation/VRMViewer"),
//   { ssr: false }
// );

// type Message = {
//   role: "user" | "ai";
//   text: string;
// };

// type Topic = {
//   id: string;
//   title: string;
//   description: string;
//   aiOpeningMessage: string;
//   coachingInstructions: string;
// };

// type SpeechRecognitionAlternativeLike = {
//   transcript: string;
// };

// type SpeechRecognitionResultLike = {
//   0: SpeechRecognitionAlternativeLike;
//   isFinal: boolean;
// };

// type SpeechRecognitionEventLike = {
//   resultIndex: number;
//   results: ArrayLike<SpeechRecognitionResultLike>;
// };

// type SpeechRecognitionLike = {
//   lang: string;
//   continuous: boolean;
//   interimResults: boolean;
//   onresult: ((event: SpeechRecognitionEventLike) => void) | null;
//   onerror: ((event: { error: string }) => void) | null;
//   onend: (() => void) | null;
//   start: () => void;
//   stop: () => void;
//   abort: () => void;
// };

// type ConversationResponse = {
//   text: string;
//   voiceLanguage: string;
// };

// function getSpeechRecognitionConstructor():
//   | (new () => SpeechRecognitionLike)
//   | undefined {
//   if (typeof window === "undefined") return undefined;

//   const browserWindow = window as Window & {
//     SpeechRecognition?: new () => SpeechRecognitionLike;
//     webkitSpeechRecognition?: new () => SpeechRecognitionLike;
//   };

//   return (
//     browserWindow.SpeechRecognition ??
//     browserWindow.webkitSpeechRecognition
//   );
// }

// export default function ConversationPage() {
//   const params = useParams<{
//     languageId: string;
//     topicId: string;
//   }>();

//   const languageId = params.languageId;
//   const topicId = params.topicId;

//   const selectedLanguage = useLanguageStore(
//     (state) => state.selectedLanguage
//   );
//   const fetchLanguage = useLanguageStore(
//     (state) => state.fetchLanguage
//   );

//   const [topic, setTopic] = useState<Topic | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [loadingTopic, setLoadingTopic] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [starting, setStarting] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [talking, setTalking] = useState(false);
//   const [voiceEnabled, setVoiceEnabled] = useState(true);
//   const [error, setError] = useState("");

//   const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null); 
//   const startedTopicRef = useRef<string | null>(null);
//   const messagesRef = useRef<Message[]>([]);
//   const mountedRef = useRef(false);

//   const voiceLanguage =
//     selectedLanguage?.id === languageId
//       ? selectedLanguage.voiceLanguage
//       : "";

//   const languageReady =
//     selectedLanguage?.id === languageId && Boolean(voiceLanguage);

//   const updateMessages = useCallback((next: Message[]) => {
//     messagesRef.current = next;
//     setMessages(next);
//   }, []);

//   // Load the selected language into the Zustand store.
//   useEffect(() => {
//     void fetchLanguage(languageId);
//   }, [languageId, fetchLanguage]);

//   // Load the complete topic from the API.
//   useEffect(() => {
//     const controller = new AbortController();

//     async function loadTopic() {
//       try {
//         setLoadingTopic(true);
//         setError("");
//         setTopic(null);
//         updateMessages([]);
//         startedTopicRef.current = null;

//         const response = await fetch(
//           `/api/client/conversation/${encodeURIComponent(topicId)}`,
//           {
//             method: "GET",
//             signal: controller.signal,
//             cache: "no-store",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data.error || "Failed to load this conversation topic."
//           );
//         }

//         setTopic(data.topic as Topic);
//       } catch (err) {
//         if (err instanceof Error && err.name === "AbortError") {
//           return;
//         }

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Failed to load the conversation topic."
//         );
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoadingTopic(false);
//         }
//       }
//     }

//     void loadTopic();

//     return () => controller.abort();
//   }, [topicId, updateMessages]);

//   // Keep the VRM animation and audio state in sync.
//   useEffect(() => {
//     mountedRef.current = true;

//     return () => {
//       mountedRef.current = false;
//       recognitionRef.current?.abort();
//       audioRef.current?.pause();
//       audioRef.current = null;
//     };
//   }, []);

//   const stopSpeech = useCallback(() => {
//     recognitionRef.current?.stop();
//     recognitionRef.current = null;
//     setListening(false);
//   }, []);

//   const stopAudio = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       audioRef.current = null;
//     }

//     setTalking(false);
//   }, []);

//   const speak = useCallback(
//     async (text: string, lang: string) => {
//       if (!voiceEnabled || !text.trim()) return;

//       stopAudio();

//       const audio = new Audio(
//         `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
//       );

//       audioRef.current = audio;

//       audio.onplay = () => {
//         if (mountedRef.current) setTalking(true);
//       };

//       const finish = () => {
//         if (audioRef.current === audio) {
//           audioRef.current = null;
//           if (mountedRef.current) setTalking(false);
//         }
//       };

//       audio.onended = finish;
//       audio.onerror = finish;

//       try {
//         await audio.play();
//       } catch (err) {
//         finish();
//         console.error("Unable to play AI voice:", err);
//       }
//     },
//     [voiceEnabled, stopAudio]
//   );

//   const requestAI = useCallback(
//     async (
//       action: "start" | "message",
//       message?: string,
//       history: Message[] = []
//     ): Promise<ConversationResponse> => {
//       const response = await fetch(
//         `/api/client/conversation/${encodeURIComponent(topicId)}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             action,
//             languageId,
//             message,
//             history,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to communicate with AI.");
//       }

//       return data as ConversationResponse;
//     },
//     [languageId, topicId]
//   );

//   // Start each topic once, after both topic and selected language are ready.
//   useEffect(() => {
//     if (!topic || !languageReady || loadingTopic) return;
//     if (startedTopicRef.current === topicId) return;

//     let cancelled = false;
//     startedTopicRef.current = topicId;

//     async function startConversation() {
//       try {
//         setStarting(true);
//         setError("");

//         const result = await requestAI("start");

//         if (cancelled) return;

//         const openingMessage: Message = {
//           role: "ai",
//           text: result.text,
//         };

//         updateMessages([openingMessage]);

//         await speak(result.text, result.voiceLanguage || voiceLanguage);
//       } catch (err) {
//         if (cancelled) return;

//         startedTopicRef.current = null;
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Failed to start the conversation."
//         );
//       } finally {
//         if (!cancelled) setStarting(false);
//       }
//     }

//     void startConversation();

//     return () => {
//       cancelled = true;
//     };
//   }, [
//     topic,
//     topicId,
//     languageReady,
//     voiceLanguage,
//     loadingTopic,
//     requestAI,
//     updateMessages,
//     speak,
//   ]);

//   async function handleSend(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const text = input.trim();

//     if (!text || loading || starting || !topic || !languageReady) {
//       return;
//     }

//     stopSpeech();
//     stopAudio();
//     setInput("");
//     setError("");
//     setLoading(true);

//     const previousMessages = messagesRef.current;
//     const nextMessages: Message[] = [
//       ...previousMessages,
//       { role: "user", text },
//     ];

//     updateMessages(nextMessages);

//     try {
//       const result = await requestAI(
//         "message",
//         text,
//         previousMessages
//       );

//       const aiMessage: Message = {
//         role: "ai",
//         text: result.text,
//       };

//       updateMessages([...nextMessages, aiMessage]);

//       await speak(
//         result.text,
//         result.voiceLanguage || voiceLanguage
//       );
//     } catch (err) {
//       // Keep the user's message visible so they can retry.
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to send your message."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function toggleListening() {
//     if (listening) {
//       stopSpeech();
//       return;
//     }

//     const SpeechRecognition = getSpeechRecognitionConstructor();

//     if (!SpeechRecognition) {
//       setError(
//         "Speech recognition is not supported in this browser. Try a browser with microphone speech recognition support."
//       );
//       return;
//     }

//     if (!voiceLanguage) {
//       setError("Your selected language is still loading.");
//       return;
//     }

//     setError("");

//     const recognition = new SpeechRecognition();
//     recognition.lang = voiceLanguage;
//     recognition.continuous = false;
//     recognition.interimResults = true;

//     recognition.onresult = (event) => {
//       let transcript = "";

//       for (
//         let index = event.resultIndex;
//         index < event.results.length;
//         index++
//       ) {
//         transcript += event.results[index][0].transcript;
//       }

//       setInput(transcript);
//     };

//     recognition.onerror = (event) => {
//       setListening(false);

//       if (event.error !== "no-speech" && event.error !== "aborted") {
//         setError(`Microphone error: ${event.error}`);
//       }
//     };

//     recognition.onend = () => {
//       setListening(false);

//       if (recognitionRef.current === recognition) {
//         recognitionRef.current = null;
//       }
//     };

//     recognitionRef.current = recognition;

//     try {
//       recognition.start();
//       setListening(true);
//     } catch {
//       recognitionRef.current = null;
//       setListening(false);
//       setError("Unable to start speech recognition.");
//     }
//   }

//   function handleReset() {
//     stopSpeech();
//     stopAudio();
//     updateMessages([]);
//     startedTopicRef.current = null;
//     setError("");
//     setInput("");
//   }

//   async function handleRestart() {
//     if (!topic || !languageReady || starting || loading) return;

//     handleReset();
//     setStarting(true);

//     try {
//       const result = await requestAI("start");

//       const openingMessage: Message = {
//         role: "ai",
//         text: result.text,
//       };

//       updateMessages([openingMessage]);

//       await speak(
//         result.text,
//         result.voiceLanguage || voiceLanguage
//       );
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to restart the conversation."
//       );
//     } finally {
//       setStarting(false);
//     }
//   }

//   return (
//     <main className="min-h-screen bg-slate-950 text-white">
//       <header className="border-b border-white/10 px-4 py-4 sm:px-8">
//         <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
//           <div className="min-w-0">
//             <Link
//               href={`/language/${encodeURIComponent(languageId)}/conversation`}
//               className="text-sm text-slate-400 transition hover:text-white"
//             >
//               ← All topics
//             </Link>

//             <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">
//               {topic?.title || "Conversation"}
//             </h1>
//           </div>

//           <button
//             type="button"
//             onClick={() => {
//               setVoiceEnabled((enabled) => {
//                 if (enabled) stopAudio();
//                 return !enabled;
//               });
//             }}
//             className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm transition hover:bg-white/10"
//           >
//             {voiceEnabled ? "🔊 Voice on" : "🔇 Voice off"}
//           </button>
//         </div>
//       </header>

//       <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
//         {/* Avatar panel */}
//         <section className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 sm:min-h-[460px]">
//           <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
//             <div>
//               <p className="font-semibold">Your AI partner</p>
//               <p className="mt-1 text-xs text-slate-400">
//                 {talking
//                   ? "Speaking..."
//                   : listening
//                     ? "Listening to you..."
//                     : loading || starting
//                       ? "Thinking..."
//                       : "Ready to practice"}
//               </p>
//             </div>

//             <span
//               className={`size-2.5 rounded-full ${
//                 talking
//                   ? "animate-pulse bg-violet-400"
//                   : listening
//                     ? "animate-pulse bg-red-400"
//                     : "bg-emerald-400"
//               }`}
//             />
//           </div>

//           <div className="relative min-h-[280px] flex-1">
//             <VRMViewer talking={talking} />
//           </div>

//           <div className="border-t border-white/10 p-4">
//             <p className="text-sm text-slate-400">
//               {topic?.description || "Loading topic details..."}
//             </p>
//           </div>
//         </section>

//         {/* Conversation panel */}
//         <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
//           <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
//             <div>
//               <h2 className="font-semibold">Conversation</h2>
//               <p className="mt-1 text-xs text-slate-400">
//                 Practice naturally. Your chat is not saved to the database.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleRestart}
//               disabled={!topic || !languageReady || starting || loading}
//               className="rounded-lg px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Restart
//             </button>
//           </div>

//           <div
//             className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
//             aria-live="polite"
//           >
//             {loadingTopic && (
//               <p className="py-8 text-center text-sm text-slate-400">
//                 Loading topic...
//               </p>
//             )}

//             {!loadingTopic && !error && !topic && (
//               <p className="py-8 text-center text-sm text-slate-400">
//                 Topic not found.
//               </p>
//             )}

//             {topic && !languageReady && !loadingTopic && (
//               <p className="py-4 text-center text-sm text-slate-400">
//                 Loading your selected language...
//               </p>
//             )}

//             {starting && messages.length === 0 && (
//               <div className="flex justify-start">
//                 <div className="rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3 text-sm text-slate-300">
//                   Preparing your conversation...
//                 </div>
//               </div>
//             )}

//             {messages.map((message, index) => (
//               <div
//                 key={`${index}-${message.role}`}
//                 className={`flex ${
//                   message.role === "user"
//                     ? "justify-end"
//                     : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
//                     message.role === "user"
//                       ? "rounded-br-sm bg-violet-600 text-white"
//                       : "rounded-bl-sm border border-white/5 bg-white/5 text-slate-100"
//                   }`}
//                 >
//                   <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-60">
//                     {message.role === "user" ? "You" : "AI partner"}
//                   </p>
//                   {message.text}
//                 </div>
//               </div>
//             ))}

//             {loading && (
//               <div className="flex justify-start">
//                 <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-400">
//                   Thinking...
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div
//                 role="alert"
//                 className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
//               >
//                 {error}
//               </div>
//             )}
//           </div>

//           <form
//             onSubmit={handleSend}
//             className="border-t border-white/10 p-4"
//           >
//             <label htmlFor="message" className="sr-only">
//               Your message
//             </label>

//             <div className="flex items-end gap-2">
//               <button
//                 type="button"
//                 onClick={toggleListening}
//                 disabled={
//                   !languageReady || loading || starting || loadingTopic
//                 }
//                 aria-label={listening ? "Stop microphone" : "Use microphone"}
//                 title={listening ? "Stop listening" : "Speak your message"}
//                 className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
//                   listening
//                     ? "border-red-400/40 bg-red-400/15 text-red-300"
//                     : "border-white/10 text-slate-300 hover:bg-white/10"
//                 }`}
//               >
//                 {listening ? "■" : "🎙"}
//               </button>

//               <textarea
//                 id="message"
//                 value={input}
//                 onChange={(event) => setInput(event.target.value)}
//                 placeholder={
//                   listening
//                     ? "Listening... speak now"
//                     : "Type your message..."
//                 }
//                 rows={1}
//                 maxLength={4000}
//                 disabled={!languageReady || loading || starting || loadingTopic}
//                 onKeyDown={(event) => {
//                   if (
//                     event.key === "Enter" &&
//                     !event.shiftKey &&
//                     !event.nativeEvent.isComposing
//                   ) {
//                     event.preventDefault();
//                     event.currentTarget.form?.requestSubmit();
//                   }
//                 }}
//                 className="max-h-36 min-h-11 flex-1 resize-y rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/60 disabled:opacity-50"
//               />

//               <button
//                 type="submit"
//                 disabled={
//                   !input.trim() ||
//                   !languageReady ||
//                   loading ||
//                   starting ||
//                   loadingTopic
//                 }
//                 className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Send
//               </button>
//             </div>

//             <p className="mt-2 text-xs text-slate-500">
//               Enter to send · Shift + Enter for a new line
//             </p>
//           </form>
//         </section>
//       </div>
//     </main>
//   );
// }

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useMutation, useQuery } from "@tanstack/react-query";


import type {
  ConversationSummary,
} from "@/lib/conversation-summary";
import { useConversationMemoryStore } from "@/store/conversation/conversation-memory-store";

type ConversationTopic = {
  id: string;
  title: string;
  description: string | null;
  aiOpeningMessage: string | null;
  coachingInstructions: string | null;
};

type ConversationRequest = {
  action: "start" | "message";
  languageId: string;
  message?: string;
  summary: ConversationSummary | null;
};

type ConversationResponse = {
  text: string;
  summary: ConversationSummary;
  voiceLanguage: string;
};

async function fetchTopic(topicId: string): Promise<ConversationTopic> {
  const response = await fetch(
    `/api/client/conversation/${encodeURIComponent(topicId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Unable to load this conversation topic.");
  }

  return response.json();
}

async function requestConversation(
  topicId: string,
  request: ConversationRequest,
): Promise<ConversationResponse> {
  const response = await fetch(
    `/api/client/conversation/${encodeURIComponent(topicId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || "Unable to generate a response. Please try again.",
    );
  }

  return data as ConversationResponse;
}

/**
 * Integrate this logic into your existing conversation page.
 * Keep your current VRMViewer, speech recognition, TTS, and JSX layout.
 */
export default function ConversationPage({
  params,
}: {
  params: Promise<{ languageId: string; topicId: string }>;
}) {
  const [routeParams, setRouteParams] = useState<{
    languageId: string;
    topicId: string;
  } | null>(null);

  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A ref lock works immediately, before React can rerender.
  const requestLockRef = useRef(false);
  const startedSessionRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    params.then((resolved) => {
      if (mountedRef.current) {
        setRouteParams(resolved);
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, [params]);

  const languageId = routeParams?.languageId ?? "";
  const topicId = routeParams?.topicId ?? "";
  const sessionKey = `${languageId}:${topicId}`;

  const session = useConversationMemoryStore((state) =>
    sessionKey ? state.sessions[sessionKey] : undefined,
  );

  const ensureSession = useConversationMemoryStore(
    (state) => state.ensureSession,
  );
  const addExchange = useConversationMemoryStore(
    (state) => state.addExchange,
  );
  const addAssistantMessage = useConversationMemoryStore(
    (state) => state.addAssistantMessage,
  );
  const resetSession = useConversationMemoryStore(
    (state) => state.resetSession,
  );

  const topicQuery = useQuery({
    queryKey: ["conversation-topic", topicId],
    queryFn: () => fetchTopic(topicId),
    enabled: Boolean(topicId),
    retry: 1,
  });

  const conversationMutation = useMutation({
    mutationFn: (request: ConversationRequest) =>
      requestConversation(topicId, request),
    retry: false,
  });

  const isBusy =
    conversationMutation.isPending || pendingMessage !== null;

  useEffect(() => {
    if (!topicQuery.data || !sessionKey) return;

    ensureSession(sessionKey, topicQuery.data.title);
  }, [topicQuery.data, sessionKey, ensureSession]);

  const startConversation = useCallback(async (restart = false) => {
    if (
      !topicQuery.data ||
      !languageId ||
      !sessionKey ||
      requestLockRef.current
    ) {
      return;
    }

    const currentSession =
      useConversationMemoryStore.getState().sessions[sessionKey];

    if (
      !restart &&
      currentSession?.messages.length
    ) {
      return;
    }

    if (
      !restart &&
      startedSessionRef.current === sessionKey
    ) {
      return;
    }

    requestLockRef.current = true;
    startedSessionRef.current = sessionKey;
    setError(null);

    try {
      if (restart) {
        resetSession(sessionKey, topicQuery.data.title);
      }

      const result = await conversationMutation.mutateAsync({
        action: "start",
        languageId,
        summary: null,
      });

      if (!mountedRef.current) return;

      addAssistantMessage(
        sessionKey,
        result.text,
        result.summary,
      );
    } catch (caught) {
      startedSessionRef.current = null;

      if (mountedRef.current) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to start the conversation.",
        );
      }
    } finally {
      requestLockRef.current = false;
    }
  }, [
    topicQuery.data,
    languageId,
    sessionKey,
    conversationMutation,
    addAssistantMessage,
    resetSession,
  ]);

  useEffect(() => {
    if (!topicQuery.data || !sessionKey || !session) return;

    if (session.messages.length > 0) {
      startedSessionRef.current = sessionKey;
      return;
    }

    void startConversation();
  }, [
    topicQuery.data,
    sessionKey,
    session,
    startConversation,
  ]);

  const sendMessage = useCallback(async () => {
    const message = input.trim();

    if (
      !message ||
      message.length > 1200 ||
      !languageId ||
      !topicId ||
      !sessionKey ||
      requestLockRef.current
    ) {
      return;
    }

    requestLockRef.current = true;
    setPendingMessage(message);
    setInput("");
    setError(null);

    try {
      const latestSession =
        useConversationMemoryStore.getState().sessions[sessionKey];

      const result = await conversationMutation.mutateAsync({
        action: "message",
        languageId,
        message,
        summary: latestSession?.summary ?? null,
      });

      if (!mountedRef.current) return;

      addExchange(
        sessionKey,
        message,
        result.text,
        result.summary,
      );
    } catch (caught) {
      if (mountedRef.current) {
        setInput((current) => current || message);
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to send your message.",
        );
      }
    } finally {
      requestLockRef.current = false;

      if (mountedRef.current) {
        setPendingMessage(null);
      }
    }
  }, [
    input,
    languageId,
    topicId,
    sessionKey,
    conversationMutation,
    addExchange,
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleRestart = () => {
    if (requestLockRef.current) return;

    startedSessionRef.current = null;
    void startConversation(true);
  };

  if (!routeParams || topicQuery.isPending) {
    return <div className="p-6">Loading conversation...</div>;
  }

  if (topicQuery.isError || !topicQuery.data) {
    return (
      <div className="p-6">
        <p>{topicQuery.error?.message ?? "Topic not found."}</p>
        <button
          type="button"
          onClick={() => void topicQuery.refetch()}
          className="mt-3 rounded-lg border px-4 py-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {topicQuery.data.title}
          </h1>
          {topicQuery.data.description && (
            <p className="mt-1 text-sm opacity-70">
              {topicQuery.data.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRestart}
          disabled={isBusy}
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
        >
          Restart
        </button>
      </header>

      <section
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border p-4"
      >
        {(session?.messages ?? []).map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-3 ${
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-100 text-gray-900"
            }`}
          >
            {message.content}
          </div>
        ))}

        {pendingMessage !== null && (
          <div className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-xl bg-blue-600 px-4 py-3 text-white">
            {pendingMessage}
          </div>
        )}

        {isBusy && (
          <p className="text-sm opacity-60" role="status">
            Preparing your response...
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1200}
          rows={3}
          disabled={isBusy}
          placeholder="Type your message..."
          className="w-full resize-y rounded-xl border p-3 disabled:opacity-50"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs opacity-60">
            {input.length}/1200 · Enter to send, Shift+Enter for a new line
          </span>

          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {isBusy ? "Waiting..." : "Send"}
          </button>
        </div>
      </form>
    </main>
  );
}
