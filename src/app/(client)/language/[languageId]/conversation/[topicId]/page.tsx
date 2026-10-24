"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useLanguageStore } from "@/store/foundation/language-store";

const VRMViewer = dynamic(
  () => import("@/components/global/client/conversation/VRMViewer"),
  { ssr: false }
);

type Message = {
  role: "user" | "ai";
  text: string;
};

type Topic = {
  id: string;
  title: string;
  description: string;
  aiOpeningMessage: string;
  coachingInstructions: string;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type ConversationResponse = {
  text: string;
  voiceLanguage: string;
};

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionLike)
  | undefined {
  if (typeof window === "undefined") return undefined;

  const browserWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };

  return (
    browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition
  );
}

export default function ConversationPage() {
  const params = useParams<{
    languageId: string;
    topicId: string;
  }>();

  const languageId = params.languageId;
  const topicId = params.topicId;

  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage
  );
  const fetchLanguage = useLanguageStore(
    (state) => state.fetchLanguage
  );

  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [listening, setListening] = useState(false);
  const [talking, setTalking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); 
  const startedTopicRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const mountedRef = useRef(false);

  const voiceLanguage =
    selectedLanguage?.id === languageId
      ? selectedLanguage.voiceLanguage
      : "";

  const languageReady =
    selectedLanguage?.id === languageId && Boolean(voiceLanguage);

  const updateMessages = useCallback((next: Message[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  // Load the selected language into the Zustand store.
  useEffect(() => {
    void fetchLanguage(languageId);
  }, [languageId, fetchLanguage]);

  // Load the complete topic from the API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadTopic() {
      try {
        setLoadingTopic(true);
        setError("");
        setTopic(null);
        updateMessages([]);
        startedTopicRef.current = null;

        const response = await fetch(
          `/api/client/conversation/${encodeURIComponent(topicId)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load this conversation topic."
          );
        }

        setTopic(data.topic as Topic);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load the conversation topic."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTopic(false);
        }
      }
    }

    void loadTopic();

    return () => controller.abort();
  }, [topicId, updateMessages]);

  // Keep the VRM animation and audio state in sync.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      recognitionRef.current?.abort();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stopSpeech = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setTalking(false);
  }, []);

  const speak = useCallback(
    async (text: string, lang: string) => {
      if (!voiceEnabled || !text.trim()) return;

      stopAudio();

      const audio = new Audio(
        `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
      );

      audioRef.current = audio;

      audio.onplay = () => {
        if (mountedRef.current) setTalking(true);
      };

      const finish = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          if (mountedRef.current) setTalking(false);
        }
      };

      audio.onended = finish;
      audio.onerror = finish;

      try {
        await audio.play();
      } catch (err) {
        finish();
        console.error("Unable to play AI voice:", err);
      }
    },
    [voiceEnabled, stopAudio]
  );

  const requestAI = useCallback(
    async (
      action: "start" | "message",
      message?: string,
      history: Message[] = []
    ): Promise<ConversationResponse> => {
      const response = await fetch(
        `/api/client/conversation/${encodeURIComponent(topicId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            languageId,
            message,
            history,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with AI.");
      }

      return data as ConversationResponse;
    },
    [languageId, topicId]
  );

  // Start each topic once, after both topic and selected language are ready.
  useEffect(() => {
    if (!topic || !languageReady || loadingTopic) return;
    if (startedTopicRef.current === topicId) return;

    let cancelled = false;
    startedTopicRef.current = topicId;

    async function startConversation() {
      try {
        setStarting(true);
        setError("");

        const result = await requestAI("start");

        if (cancelled) return;

        const openingMessage: Message = {
          role: "ai",
          text: result.text,
        };

        updateMessages([openingMessage]);

        await speak(result.text, result.voiceLanguage || voiceLanguage);
      } catch (err) {
        if (cancelled) return;

        startedTopicRef.current = null;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start the conversation."
        );
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    void startConversation();

    return () => {
      cancelled = true;
    };
  }, [
    topic,
    topicId,
    languageReady,
    voiceLanguage,
    loadingTopic,
    requestAI,
    updateMessages,
    speak,
  ]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text || loading || starting || !topic || !languageReady) {
      return;
    }

    stopSpeech();
    stopAudio();
    setInput("");
    setError("");
    setLoading(true);

    const previousMessages = messagesRef.current;
    const nextMessages: Message[] = [
      ...previousMessages,
      { role: "user", text },
    ];

    updateMessages(nextMessages);

    try {
      const result = await requestAI(
        "message",
        text,
        previousMessages
      );

      const aiMessage: Message = {
        role: "ai",
        text: result.text,
      };

      updateMessages([...nextMessages, aiMessage]);

      await speak(
        result.text,
        result.voiceLanguage || voiceLanguage
      );
    } catch (err) {
      // Keep the user's message visible so they can retry.
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send your message."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleListening() {
    if (listening) {
      stopSpeech();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Try a browser with microphone speech recognition support."
      );
      return;
    }

    if (!voiceLanguage) {
      setError("Your selected language is still loading.");
      return;
    }

    setError("");

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        transcript += event.results[index][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("Unable to start speech recognition.");
    }
  }

  function handleReset() {
    stopSpeech();
    stopAudio();
    updateMessages([]);
    startedTopicRef.current = null;
    setError("");
    setInput("");
  }

  async function handleRestart() {
    if (!topic || !languageReady || starting || loading) return;

    handleReset();
    setStarting(true);

    try {
      const result = await requestAI("start");

      const openingMessage: Message = {
        role: "ai",
        text: result.text,
      };

      updateMessages([openingMessage]);

      await speak(
        result.text,
        result.voiceLanguage || voiceLanguage
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to restart the conversation."
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/language/${encodeURIComponent(languageId)}/conversation`}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← All topics
            </Link>

            <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">
              {topic?.title || "Conversation"}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setVoiceEnabled((enabled) => {
                if (enabled) stopAudio();
                return !enabled;
              });
            }}
            className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm transition hover:bg-white/10"
          >
            {voiceEnabled ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        {/* Avatar panel */}
        <section className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 sm:min-h-[460px]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div>
              <p className="font-semibold">Your AI partner</p>
              <p className="mt-1 text-xs text-slate-400">
                {talking
                  ? "Speaking..."
                  : listening
                    ? "Listening to you..."
                    : loading || starting
                      ? "Thinking..."
                      : "Ready to practice"}
              </p>
            </div>

            <span
              className={`size-2.5 rounded-full ${
                talking
                  ? "animate-pulse bg-violet-400"
                  : listening
                    ? "animate-pulse bg-red-400"
                    : "bg-emerald-400"
              }`}
            />
          </div>

          <div className="relative min-h-[280px] flex-1">
            <VRMViewer talking={talking} />
          </div>

          <div className="border-t border-white/10 p-4">
            <p className="text-sm text-slate-400">
              {topic?.description || "Loading topic details..."}
            </p>
          </div>
        </section>

        {/* Conversation panel */}
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">Conversation</h2>
              <p className="mt-1 text-xs text-slate-400">
                Practice naturally. Your chat is not saved to the database.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              disabled={!topic || !languageReady || starting || loading}
              className="rounded-lg px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Restart
            </button>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
            aria-live="polite"
          >
            {loadingTopic && (
              <p className="py-8 text-center text-sm text-slate-400">
                Loading topic...
              </p>
            )}

            {!loadingTopic && !error && !topic && (
              <p className="py-8 text-center text-sm text-slate-400">
                Topic not found.
              </p>
            )}

            {topic && !languageReady && !loadingTopic && (
              <p className="py-4 text-center text-sm text-slate-400">
                Loading your selected language...
              </p>
            )}

            {starting && messages.length === 0 && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Preparing your conversation...
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-sm bg-violet-600 text-white"
                      : "rounded-bl-sm border border-white/5 bg-white/5 text-slate-100"
                  }`}
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-60">
                    {message.role === "user" ? "You" : "AI partner"}
                  </p>
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-400">
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
              >
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-white/10 p-4"
          >
            <label htmlFor="message" className="sr-only">
              Your message
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={
                  !languageReady || loading || starting || loadingTopic
                }
                aria-label={listening ? "Stop microphone" : "Use microphone"}
                title={listening ? "Stop listening" : "Speak your message"}
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  listening
                    ? "border-red-400/40 bg-red-400/15 text-red-300"
                    : "border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {listening ? "■" : "🎙"}
              </button>

              <textarea
                id="message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  listening
                    ? "Listening... speak now"
                    : "Type your message..."
                }
                rows={1}
                maxLength={4000}
                disabled={!languageReady || loading || starting || loadingTopic}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                className="max-h-36 min-h-11 flex-1 resize-y rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/60 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  !languageReady ||
                  loading ||
                  starting ||
                  loadingTopic
                }
                className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
