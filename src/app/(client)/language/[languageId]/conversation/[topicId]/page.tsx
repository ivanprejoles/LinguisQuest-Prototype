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
import { useQuery } from "@tanstack/react-query";

import type { ConversationSummary } from "@/lib/conversation-summary";
import { useConversationMemoryStore } from "@/store/conversation/conversation-memory-store";
import { useLanguageStore } from "@/store/foundation/language-store";

const VRMViewer = dynamic(
  () => import("@/components/global/client/conversation/VRMViewer"),
  { ssr: false },
);

const MAX_MESSAGE_LENGTH = 1200;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

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

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
  length: number;
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

// -----------------------------------------------------------------------------
// Speech recognition
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// API helpers
// -----------------------------------------------------------------------------

async function fetchTopic(
  topicId: string,
  signal?: AbortSignal,
): Promise<ConversationTopic> {
  const response = await fetch(
    `/api/client/conversation/${encodeURIComponent(topicId)}`,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ?? "Unable to load this conversation topic.",
    );
  }

  const topic = data?.topic ?? data;

  if (!topic || typeof topic.id !== "string") {
    throw new Error("The conversation topic response is invalid.");
  }

  return topic as ConversationTopic;
}

async function requestConversation(
  topicId: string,
  request: ConversationRequest,
  signal?: AbortSignal,
): Promise<ConversationResponse> {
  const response = await fetch(
    `/api/client/conversation/${encodeURIComponent(topicId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ??
        "The AI tutor is temporarily unavailable. Please try again.",
    );
  }

  if (
    typeof data?.text !== "string" ||
    !data.text.trim() ||
    !data.summary ||
    typeof data.voiceLanguage !== "string"
  ) {
    throw new Error("The AI returned an invalid conversation response.");
  }

  return data as ConversationResponse;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ConversationPage() {
  const params = useParams<{
    languageId: string;
    topicId: string;
  }>();

  const languageId = params.languageId;
  const topicId = params.topicId;
  const sessionKey = `${languageId}:${topicId}`;

  // ---------------------------------------------------------------------------
  // Language store
  // ---------------------------------------------------------------------------

  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage,
  );

  const fetchLanguage = useLanguageStore(
    (state) => state.fetchLanguage,
  );

  const voiceLanguage =
    selectedLanguage?.id === languageId
      ? selectedLanguage.voiceLanguage
      : "";

  const languageReady = Boolean(voiceLanguage);

  // ---------------------------------------------------------------------------
  // Conversation store
  // ---------------------------------------------------------------------------

  const session = useConversationMemoryStore(
    (state) => state.sessions[sessionKey],
  );

  const ensureSession = useConversationMemoryStore(
    (state) => state.ensureSession,
  );

  const addPendingUserMessage = useConversationMemoryStore(
    (state) => state.addPendingUserMessage,
  );

  const setMessageStatus = useConversationMemoryStore(
    (state) => state.setMessageStatus,
  );

  const completeExchange = useConversationMemoryStore(
    (state) => state.completeExchange,
  );

  const addAssistantMessage = useConversationMemoryStore(
    (state) => state.addAssistantMessage,
  );

  const resetSession = useConversationMemoryStore(
    (state) => state.resetSession,
  );

  // ---------------------------------------------------------------------------
  // Local UI state
  // ---------------------------------------------------------------------------

  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [talking, setTalking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState("");

  const [voicePlaybackIssue, setVoicePlaybackIssue] = useState<
    "interaction-required" | "unavailable" | null
  >(null);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const requestLockRef = useRef(false);
  const startedSessionRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speechBaseInputRef = useRef("");

  const lastVoiceRef = useRef<{
    text: string;
    language: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Topic query
  // ---------------------------------------------------------------------------

  const topicQuery = useQuery({
    queryKey: ["conversation-topic", topicId],
    queryFn: ({ signal }) => fetchTopic(topicId, signal),
    enabled: Boolean(topicId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const topic = topicQuery.data;

  const isBusy = starting || sending;
  const savedMessages = session?.messages ?? [];

  // Find the latest unresolved learner message.
  // This is the message that must be retried before sending another one.
  const unresolvedMessage = [...savedMessages]
    .reverse()
    .find(
      (message) =>
        message.role === "user" &&
        (message.status === "pending" ||
          message.status === "failed" ||
          message.status === "retrying"),
    );

  const failedMessage =
    unresolvedMessage?.status === "failed"
      ? unresolvedMessage
      : null;

  // ---------------------------------------------------------------------------
  // Load language
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (languageId) {
      void fetchLanguage(languageId);
    }
  }, [languageId, fetchLanguage]);

  // ---------------------------------------------------------------------------
  // Component lifecycle
  // ---------------------------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      recognitionRef.current?.abort();
      recognitionRef.current = null;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Prepare persisted session
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!topic) return;

    ensureSession(sessionKey, topic.title);
  }, [topic, sessionKey, ensureSession]);

  // ---------------------------------------------------------------------------
  // Audio controls
  // ---------------------------------------------------------------------------

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audioRef.current = null;
    }

    if (mountedRef.current) {
      setTalking(false);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognitionRef.current = null;
      recognition.abort();
    }

    if (mountedRef.current) {
      setListening(false);
    }
  }, []);

  const speak = useCallback(
    async (text: string, language: string) => {
      if (!voiceEnabled || !text.trim() || !language) return;

      lastVoiceRef.current = { text, language };
      setVoicePlaybackIssue(null);

      stopAudio();

      const audio = new Audio(
        `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(language)}`,
      );

      audioRef.current = audio;

      const finish = () => {
        if (audioRef.current !== audio) return;

        audioRef.current = null;

        if (mountedRef.current) {
          setTalking(false);
        }
      };

      audio.onplay = () => {
        if (mountedRef.current && audioRef.current === audio) {
          setTalking(true);
        }
      };

      audio.onended = finish;

      audio.onerror = () => {
        if (audioRef.current !== audio) return;

        if (mountedRef.current) {
          setVoicePlaybackIssue("unavailable");
        }

        finish();
      };

      try {
        await audio.play();
      } catch (caught) {
        if (audioRef.current === audio) {
          const autoplayBlocked =
            caught instanceof DOMException &&
            caught.name === "NotAllowedError";

          if (mountedRef.current) {
            setVoicePlaybackIssue(
              autoplayBlocked ? "interaction-required" : "unavailable",
            );
          }

          finish();
        }

        console.warn("[AI Voice] Playback unavailable:", caught);
      }
    },
    [voiceEnabled, stopAudio],
  );

  // ---------------------------------------------------------------------------
  // Centralized Gemini request
  // ---------------------------------------------------------------------------

  const sendAIRequest = useCallback(
    (request: ConversationRequest, signal?: AbortSignal) =>
      requestConversation(topicId, request, signal),
    [topicId],
  );

  // ---------------------------------------------------------------------------
  // Start or restart a conversation
  // ---------------------------------------------------------------------------

  const startConversation = useCallback(
    async (restart = false) => {
      if (
        !topic ||
        !languageReady ||
        !sessionKey ||
        requestLockRef.current
      ) {
        return;
      }

      const currentSession =
        useConversationMemoryStore.getState().sessions[sessionKey];

      if (!restart && currentSession?.messages.length) {
        startedSessionRef.current = sessionKey;
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

      setStarting(true);
      setError("");

      stopSpeech();
      stopAudio();

      try {
        if (restart) {
          resetSession(sessionKey, topic.title);
        }

        const result = await sendAIRequest({
          action: "start",
          languageId,
          summary: null,
        });

        addAssistantMessage(
          sessionKey,
          result.text,
          result.summary,
        );

        if (mountedRef.current) {
          void speak(
            result.text,
            result.voiceLanguage || voiceLanguage,
          );
        }
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

        if (mountedRef.current) {
          setStarting(false);
        }
      }
    },
    [
      topic,
      languageId,
      languageReady,
      voiceLanguage,
      sessionKey,
      sendAIRequest,
      addAssistantMessage,
      resetSession,
      stopSpeech,
      stopAudio,
      speak,
    ],
  );

  // ---------------------------------------------------------------------------
  // Automatically start if there is no saved conversation
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!topic || !session || !languageReady) return;

    if (session.messages.length > 0) {
      startedSessionRef.current = sessionKey;
      return;
    }

    void startConversation();
  }, [
    topic,
    session,
    languageReady,
    sessionKey,
    startConversation,
  ]);

  // ---------------------------------------------------------------------------
  // Send a new learner message
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(async () => {
    const message = input.trim();

    if (
      !message ||
      message.length > MAX_MESSAGE_LENGTH ||
      !topic ||
      !languageReady ||
      requestLockRef.current
    ) {
      return;
    }

    // Do not allow another exchange while an earlier one is unresolved.
    const latestSession =
      useConversationMemoryStore.getState().sessions[sessionKey];

    const hasUnresolvedMessage = latestSession?.messages.some(
      (savedMessage) =>
        savedMessage.role === "user" &&
        (savedMessage.status === "pending" ||
          savedMessage.status === "failed" ||
          savedMessage.status === "retrying"),
    );

    if (hasUnresolvedMessage) return;

    requestLockRef.current = true;

    stopSpeech();
    stopAudio();

    setInput("");
    setError("");
    setSending(true);

    // Save the learner message BEFORE calling Gemini.
    // Its ID will be used if we need to retry.
    const messageId = addPendingUserMessage(sessionKey, message);

    try {
      const currentSession =
        useConversationMemoryStore.getState().sessions[sessionKey];

      const result = await sendAIRequest({
        action: "message",
        languageId,
        message,
        summary: currentSession?.summary ?? null,
      });

      // Complete the same saved learner message.
      // This does not add another user message.
      completeExchange(
        sessionKey,
        messageId,
        result.text,
        result.summary,
      );

      if (mountedRef.current) {
        void speak(
          result.text,
          result.voiceLanguage || voiceLanguage,
        );
      }
    } catch (caught) {
      // Keep the original message in Zustand.
      // It will appear with a Retry button.
      setMessageStatus(sessionKey, messageId, "failed");

      if (mountedRef.current) {
        setError(
          caught instanceof Error
            ? caught.message
            : "The tutor couldn't respond. Please try again.",
        );
      }
    } finally {
      requestLockRef.current = false;

      if (mountedRef.current) {
        setSending(false);
      }
    }
  }, [
    input,
    topic,
    languageReady,
    languageId,
    voiceLanguage,
    sessionKey,
    sendAIRequest,
    addPendingUserMessage,
    setMessageStatus,
    completeExchange,
    stopSpeech,
    stopAudio,
    speak,
  ]);

  // ---------------------------------------------------------------------------
  // Retry the exact same learner message
  // ---------------------------------------------------------------------------

  const retryMessage = useCallback(
    async (messageId: string) => {
      if (
        !topic ||
        !languageReady ||
        requestLockRef.current
      ) {
        return;
      }

      // Always retrieve the latest persisted message.
      const currentSession =
        useConversationMemoryStore.getState().sessions[sessionKey];

      const message = currentSession?.messages.find(
        (savedMessage) => savedMessage.id === messageId,
      );

      if (
        !message ||
        message.role !== "user" ||
        message.status !== "failed"
      ) {
        return;
      }

      requestLockRef.current = true;

      stopSpeech();
      stopAudio();

      setError("");
      setSending(true);

      // Reuse the original message ID.
      setMessageStatus(sessionKey, messageId, "retrying");

      try {
        const latestSession =
          useConversationMemoryStore.getState().sessions[sessionKey];

        const result = await sendAIRequest({
          action: "message",
          languageId,
          message: message.content,
          summary: latestSession?.summary ?? null,
        });

        // Complete the original message exactly once.
        completeExchange(
          sessionKey,
          messageId,
          result.text,
          result.summary,
        );

        if (mountedRef.current) {
          void speak(
            result.text,
            result.voiceLanguage || voiceLanguage,
          );
        }
      } catch (caught) {
        // Keep the original message and make Retry available again.
        setMessageStatus(sessionKey, messageId, "failed");

        if (mountedRef.current) {
          setError(
            caught instanceof Error
              ? caught.message
              : "The tutor couldn't respond. Please try again.",
          );
        }
      } finally {
        requestLockRef.current = false;

        if (mountedRef.current) {
          setSending(false);
        }
      }
    },
    [
      topic,
      languageReady,
      sessionKey,
      languageId,
      voiceLanguage,
      sendAIRequest,
      setMessageStatus,
      completeExchange,
      stopSpeech,
      stopAudio,
      speak,
    ],
  );

  // ---------------------------------------------------------------------------
  // Form submission
  // ---------------------------------------------------------------------------

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (failedMessage || unresolvedMessage || isBusy) return;

    void sendMessage();
  };

  // ---------------------------------------------------------------------------
  // Speech recognition
  // ---------------------------------------------------------------------------

  const toggleListening = useCallback(() => {
    if (listening) {
      stopSpeech();
      return;
    }

    if (isBusy || failedMessage || unresolvedMessage) return;

    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Try a supported browser.",
      );
      return;
    }

    if (!voiceLanguage) {
      setError("Your selected language is still loading.");
      return;
    }

    setError("");
    stopAudio();

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;

    speechBaseInputRef.current = input.trim();

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index++) {
        transcript += event.results[index][0].transcript;
      }

      const base = speechBaseInputRef.current;

      const combined = [base, transcript.trim()]
        .filter(Boolean)
        .join(" ");

      if (mountedRef.current) {
        setInput(combined.slice(0, MAX_MESSAGE_LENGTH));
      }
    };

    recognition.onerror = (event) => {
      if (!mountedRef.current) return;

      setListening(false);

      if (
        event.error !== "no-speech" &&
        event.error !== "aborted"
      ) {
        setError(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      if (mountedRef.current) {
        setListening(false);
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
  }, [
    listening,
    isBusy,
    failedMessage,
    unresolvedMessage,
    voiceLanguage,
    input,
    stopSpeech,
    stopAudio,
  ]);

  // ---------------------------------------------------------------------------
  // Restart and voice controls
  // ---------------------------------------------------------------------------

  const handleRestart = () => {
    if (requestLockRef.current || !topic || !languageReady) return;

    startedSessionRef.current = null;

    setInput("");
    setError("");

    void startConversation(true);
  };

  const toggleVoice = () => {
    setVoiceEnabled((enabled) => {
      if (enabled) {
        stopAudio();
        setVoicePlaybackIssue(null);
      }

      return !enabled;
    });
  };

  // ---------------------------------------------------------------------------
  // Status text
  // ---------------------------------------------------------------------------

  const statusText = talking
    ? "Speaking to you..."
    : listening
      ? "Listening to your story..."
      : starting
        ? "Preparing your adventure..."
        : sending
          ? "Thinking of what to say..."
          : failedMessage
            ? "Your tutor needs another try"
            : "Ready for your next chapter";

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (topicQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e9ede4] text-[#403b30]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#c5ad78] bg-[#f2e7ca] text-2xl text-[#a77a32]">
            ✦
          </div>

          <p className="text-sm font-medium">
            Preparing your next adventure...
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Topic error state
  // ---------------------------------------------------------------------------

  if (topicQuery.isError || !topic) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#e9ede4] p-6 text-[#403b30]">
        <div className="text-4xl">📜</div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#72552b]">
            The adventure is unavailable
          </h2>

          <p className="mt-2 text-sm text-[#68765d]">
            {topicQuery.error instanceof Error
              ? topicQuery.error.message
              : "We couldn't find this conversation."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void topicQuery.refetch()}
          className="rounded-xl border border-[#B99A5C] bg-[#78805B] px-6 py-3 text-sm font-semibold text-[#FFF3D9] transition hover:bg-[#899268]"
        >
          Try again
        </button>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Main interface
  // ---------------------------------------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e9ede4] text-[#403b30]">
      {/* Storybook background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 size-[32rem] rounded-full bg-[#d5dfcf]/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[34rem] rounded-full bg-[#e8d9bd]/60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(#D7BD7C 0.7px, transparent 0.7px)",
            backgroundSize: "12px 12px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#c5cbb8] bg-[#e9ede4]/95 shadow-[0_4px_18px_rgba(70,65,45,0.08)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="min-w-0">
            <Link
              href={`/language/${encodeURIComponent(languageId)}/conversation`}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#68765d] transition hover:text-[#34402e]"
            >
              <span>←</span>
              <span>Your adventures</span>
            </Link>

            <div className="mt-2 flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#c5ad78] bg-[#f2e7ca] text-xl text-[#a77a32]">
                📖
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#96743a]">
                  Today's chapter
                </p>
                <h1 className="truncate text-lg font-bold tracking-tight text-[#403b30] sm:text-xl">
                  {topic.title}
                </h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleVoice}
            aria-pressed={voiceEnabled}
            className="flex shrink-0 items-center gap-2 rounded-full border border-[#c5ad78] bg-[#f2e7ca] px-3 py-2 text-xs font-semibold text-[#403b30] transition hover:border-[#a77a32] hover:bg-[#e8d9b5]"
          >
            <span>{voiceEnabled ? "🔊" : "🔇"}</span>
            <span className="hidden sm:inline">
              {voiceEnabled ? "Voice on" : "Voice off"}
            </span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">

        {/* Avatar / story guide */}
        <section className="flex min-h-[360px] flex-col overflow-hidden rounded-[24px] border border-[#c5cbb8] bg-gradient-to-br from-[#e4eadc] via-[#dce4d4] to-[#e9dfc9] shadow-[0_12px_35px_rgba(70,65,45,0.12)] sm:min-h-[500px]">
          <div className="flex items-center justify-between gap-3 px-6 pt-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#96743a]">
                Your language companion
              </p>
              {/* <h2 className="mt-1 text-base font-bold text-[#403b30]">
                A little adventure awaits
              </h2> */}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#c5cbb8] bg-[#f2e7ca] px-3 py-1.5">
              <span
                className={`size-2 rounded-full ${
                  talking
                    ? "animate-pulse bg-[#a77a32]"
                    : listening
                      ? "animate-pulse bg-[#c77f69]"
                      : isBusy
                        ? "animate-pulse bg-[#b99a5c]"
                        : failedMessage
                          ? "bg-[#c77f69]"
                          : "bg-[#9aa47a]"
                }`}
              />
              <span className="text-[10px] font-medium text-[#59634f]">
                {statusText}
              </span>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative min-h-[280px] flex-1 overflow-hidden p-1">
            <div className="pointer-events-none absolute inset-x-8 bottom-5 h-16 rounded-[50%] bg-[#e9e5d6]/40 blur-2xl" />
            <VRMViewer talking={talking} />
          </div>

          {/* Story information */}
          <div className="mx-5 mb-5 rounded-xl border border-[#c5cbb8] bg-[#f2e7ca] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg text-[#a77a32]">✨</span>
              <div>
                <p className="text-xs font-bold text-[#72552b]">
                  Your little learning moment
                </p>
                <p className="mt-1 text-xs leading-5 text-[#59634f]">
                  {topic.description ||
                    "Take your time, explore new words, and enjoy the conversation."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conversation panel */}
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[24px] border border-[#c5ad78] bg-gradient-to-b from-[#fff4d3] via-[#f5e6bd] to-[#e9d3a0] shadow-[0_12px_35px_rgba(70,65,45,0.12)]">

          {/* Conversation heading */}
          <div className="flex items-center justify-between gap-3 border-b border-[#d2bd8e] bg-[#eee2c3] px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h2 className="text-base font-bold text-[#403b30]">
                  Your conversation
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#756448]">
                Every new word is part of your journey.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              disabled={!languageReady || isBusy}
              className="rounded-full border border-[#c5ad78] bg-[#f8efd9] px-4 py-2 text-xs font-semibold text-[#72552b] transition hover:bg-[#e8d9b5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↻ Restart
            </button>
          </div>

          {/* Voice playback notice */}
          {voiceEnabled && voicePlaybackIssue && (
            <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#d2bd8e] bg-[#f8efd9] px-4 py-3">
              <p className="text-xs leading-5 text-[#72552b]">
                {voicePlaybackIssue === "interaction-required"
                  ? "Your browser needs a click before it can play audio."
                  : "Voice is temporarily unavailable, but your conversation is safe."}
              </p>
              <button
                type="button"
                onClick={() => {
                  const lastVoice = lastVoiceRef.current;
                  if (lastVoice) {
                    void speak(lastVoice.text, lastVoice.language);
                  }
                }}
                className="shrink-0 rounded-xl border border-[#c5ad78] bg-[#fff8e8] px-3 py-2 text-sm text-[#403b30] transition hover:bg-[#e8d9b5]"
              >
                Play voice
              </button>
            </div>
          )}

          {/* Messages */}
          <div
            aria-live="polite"
            aria-relevant="additions text"
            className="flex-1 space-y-6 overflow-y-auto bg-gradient-to-b from-[#f8efd9] to-[#eee0bd] p-4 sm:p-6"
          >
            {!languageReady && (
              <p className="py-4 text-center text-sm text-[#756448]">
                Preparing your language...
              </p>
            )}

            {starting && savedMessages.length === 0 && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-bl-sm border border-[#d2bd8e] bg-[#fff4d3] px-5 py-3 text-sm text-[#72552b]">
                  Your guide is preparing the first chapter...
                </div>
              </div>
            )}

            {/* Saved messages */}
            {savedMessages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-[18px] border px-4 py-3.5 text-sm leading-7 shadow-sm sm:px-5 ${
                    message.role === "user"
                      ? "rounded-br-sm border-[#b8c5a8] bg-gradient-to-br from-[#e0e8d5] to-[#cbd8bd] text-[#34402e]"
                      : "rounded-bl-sm border-[#d2b775] bg-gradient-to-br from-[#fff8e8] to-[#f0dfb5] text-[#403b30]"
                  }`}
                >
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#96743a]">
                    {message.role === "user" ? "You" : "Your story guide"}
                  </p>
                  {message.content}
                </div>

                {/* Failed response and retry button */}
                {message.role === "user" && message.status === "failed" && (
                  <div className="mt-2 w-full max-w-[88%] rounded-xl border border-[#d5a18c] bg-[#f8e9e1] p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#92563f]">
                      <span>⚠</span>
                      <span>Tutor response failed</span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#594337]">
                      {error ||
                        "Your message was saved, but your tutor couldn't respond this time. You can try again."}
                    </p>

                    <p className="mt-2 text-[11px] text-[#80634f]">
                      Your original message is safe. Retrying will not duplicate it.
                    </p>

                    <button
                      type="button"
                      onClick={() => void retryMessage(message.id)}
                      disabled={isBusy}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#a77a32] bg-[#78805b] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#68734e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ↻ Retry response
                    </button>
                  </div>
                )}

                {/* Pending status */}
                {message.role === "user" && message.status === "pending" && (
                  <p className="mt-2 mr-2 text-[11px] text-[#756448]">
                    Sending your message...
                  </p>
                )}

                {/* Retrying status */}
                {message.role === "user" && message.status === "retrying" && (
                  <p className="mt-2 mr-2 inline-flex items-center gap-2 text-[11px] text-[#756448]">
                    <span className="size-2 animate-pulse rounded-full bg-[#a77a32]" />
                    Trying to reach your tutor again...
                  </p>
                )}
              </div>
            ))}

            {/* AI typing indicator */}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-bl-sm border border-[#d2bd8e] bg-[#fff4d3] px-5 py-3.5 text-sm text-[#72552b] shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-[#a77a32]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-[#a77a32] [animation-delay:120ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-[#a77a32] [animation-delay:240ms]" />
                    </span>
                    Thinking of a reply...
                  </span>
                </div>
              </div>
            )}

            {/* General errors */}
            {error && !failedMessage && (
              <div
                role="alert"
                className="rounded-xl border border-[#d5a18c] bg-[#f8e9e1] px-4 py-3 text-sm leading-6 text-[#92563f]"
              >
                <div className="flex items-start gap-2">
                  <span>⚠</span>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Retry explanation */}
            {failedMessage && !sending && (
              <div className="rounded-xl border border-dashed border-[#c5ad78] bg-[#f8efd9] px-4 py-3 text-center">
                <p className="text-xs leading-5 text-[#72552b]">
                  Retry your tutor's response above to continue your adventure.
                </p>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#d2bd8e] bg-[#eee2c3] p-4 sm:p-5"
          >
            <label htmlFor="conversation-message" className="sr-only">
              Your message
            </label>

            <div className="flex items-end gap-2 rounded-xl border border-[#c5ad78] bg-[#fff8e8] p-2 transition focus-within:border-[#a77a32] focus-within:ring-1 focus-within:ring-[#c5ad78]">

              {/* Microphone */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={
                  !languageReady || isBusy || Boolean(unresolvedMessage)
                }
                aria-label={listening ? "Stop microphone" : "Use microphone"}
                title={listening ? "Stop listening" : "Speak your message"}
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-lg transition disabled:cursor-not-allowed disabled:opacity-30 ${
                  listening
                    ? "bg-[#f2d9cd] text-[#92563f]"
                    : "text-[#68765d] hover:bg-[#e9ede4]"
                }`}
              >
                {listening ? "■" : "🎙"}
              </button>

              {/* Text input */}
              <textarea
                id="conversation-message"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
                }
                placeholder={
                  failedMessage
                    ? "Retry the previous response to continue..."
                    : listening
                      ? "Listening to your story..."
                      : "Write your next line..."
                }
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={
                  !languageReady || isBusy || Boolean(unresolvedMessage)
                }
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
                className="max-h-36 min-h-10 flex-1 resize-y bg-transparent px-2 py-2.5 text-sm text-[#403b30] outline-none placeholder:text-[#9b927f] disabled:cursor-not-allowed disabled:opacity-50"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  input.trim().length > MAX_MESSAGE_LENGTH ||
                  !languageReady ||
                  isBusy ||
                  Boolean(unresolvedMessage)
                }
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#a77a32] bg-[#78805b] text-lg text-white shadow-sm transition hover:bg-[#68734e] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {sending ? "…" : "➤"}
              </button>
            </div>

            {/* Composer footer */}
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <p className="text-[10px] text-[#756448]">
                {failedMessage
                  ? "Your previous message is saved. Retry above to continue."
                  : "Enter to send · Shift + Enter for a new line"}
              </p>

              <p className="text-[10px] tabular-nums text-[#756448]">
                {input.length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );

}
