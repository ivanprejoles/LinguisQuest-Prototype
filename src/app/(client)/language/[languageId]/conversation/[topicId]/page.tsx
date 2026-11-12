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

const MAX_MESSAGE_LENGTH = 1000;

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
  success: boolean;
  text: string;
  summary: ConversationSummary;
  memoryUpdated: boolean;
  voiceLanguage: string;
  hearts: {
    hearts: number;
    maxHearts: number;
    nextRefillAt: string | null;
  } | null;
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
    data?.success !== true ||
    typeof data.text !== "string" ||
    !data.text.trim() ||
    !data.summary ||
    typeof data.voiceLanguage !== "string" ||
    typeof data.memoryUpdated !== "boolean"
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
  const [chatOpen, setChatOpen] = useState(false);
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

  const replayMessage = useCallback(
    (text: string) => {
      if (!voiceLanguage || !text.trim() || !voiceEnabled) return;

      void speak(text, voiceLanguage);
    },
    [voiceLanguage, voiceEnabled, speak],
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

  // Prevent another exchange while an earlier one is unresolved.
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

  // Save the learner message before requesting Gemini.
  const messageId = addPendingUserMessage(sessionKey, message);

  try {
    // Get the latest session after saving the pending message.
    const currentSession =
      useConversationMemoryStore.getState().sessions[sessionKey];

    // Send only the latest message and compact summary.
    // Conversation history is no longer sent to the API.
    const result = await sendAIRequest({
      action: "message",
      languageId,
      message,
      summary: currentSession?.summary ?? null,
    });

    // Complete the original learner message and merge the AI memory update.
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
    // Preserve the original message so the learner can retry it.
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

    // Retrieve the latest persisted message.
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

      // No conversation history is sent.
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
      // Make the same message available for another retry.
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
    <main className="relative flex h-[calc(100dvh-var(--header-height,4.25rem))] min-h-0 flex-col overflow-hidden bg-[#e9ede4] text-[#403b30]">
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
      {/* Main layout */}
      <div className="relative z-10 mx-auto grid h-full min-h-0 w-full max-w-7xl grid-cols-1 overflow-hidden px-2 py-2 sm:px-4 sm:py-4 lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-5 lg:px-8 lg:py-4">
        {/* Avatar / story guide */}
        <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#c5cbb8] bg-gradient-to-br from-[#e4eadc] via-[#dce4d4] to-[#e9dfc9] shadow-[0_12px_35px_rgba(70,65,45,0.12)] lg:min-h-[500px]">
  
          {/* Compact floating header */}
          <div className="relative z-20 flex items-start gap-2 px-3 pt-3 sm:px-6 sm:pt-5">
            {/* Back button */}
            <Link
              href={`/language/${encodeURIComponent(languageId)}/conversation`}
              aria-label="Back to your adventures"
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#c5cbb8] bg-[#f2e7ca]/95 text-lg text-[#68765d] shadow-sm backdrop-blur-md transition hover:bg-[#e8d9b5] active:scale-95 sm:size-10"
            >
              ←
            </Link>

            {/* Topic title and description */}
            <div className="min-w-0 flex-1 px-1 text-center">
              <h2 className="truncate text-sm font-bold leading-tight text-[#72552b] sm:text-base">
                {topic.title}
              </h2>

              <p className="mx-auto mt-1 line-clamp-2 max-w-md text-[10px] leading-relaxed text-[#68765d] sm:text-xs">
                {topic.description ||
                  "Take your time, explore new words, and enjoy the conversation."}
              </p>
            </div>

            {/* Mute / unmute */}
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceEnabled}
              aria-label={voiceEnabled ? "Mute voice" : "Unmute voice"}
              title={voiceEnabled ? "Mute voice" : "Unmute voice"}
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#c5ad78] bg-[#f2e7ca]/95 text-base shadow-sm backdrop-blur-md transition hover:bg-[#e8d9b5] active:scale-95 sm:size-10 sm:text-lg"
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
          </div>

          {/* Compact conversation status */}
          <div className="relative z-10 flex justify-center px-3 pt-2 sm:pt-3">
            <div className="inline-flex max-w-[85%] items-center gap-2 rounded-full border border-[#c5cbb8]/80 bg-[#f2e7ca]/90 px-3 py-1 shadow-sm backdrop-blur-md">
              <span
                className={`size-1.5 shrink-0 rounded-full ${
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
              <span className="truncate text-[10px] font-medium text-[#59634f] sm:text-xs">
                {statusText}
              </span>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative min-h-0 flex-1 overflow-hidden p-1">
            <div className="pointer-events-none absolute inset-x-8 bottom-5 h-16 rounded-[50%] bg-[#e9e5d6]/40 blur-2xl" />
            <VRMViewer talking={talking} />
          </div>
        </section>

        {/* Conversation panel */}
        <section
          className={`
            absolute inset-x-1 bottom-1 z-30
            flex max-h-[72%] min-h-0 flex-col overflow-hidden
            rounded-2xl border border-[#c5ad78]
            bg-gradient-to-b from-[#fff4d3] via-[#f5e6bd] to-[#e9d3a0]
            shadow-[0_12px_35px_rgba(70,65,45,0.25)]
            transition-all duration-300
            lg:relative lg:inset-auto lg:z-auto
            lg:h-full lg:max-h-full lg:min-h-0
            lg:rounded-[24px]
          `}
        >
          {/* Conversation heading / mobile chat toggle */}
          <div className="flex items-center justify-between gap-2 border-b border-[#d2bd8e] bg-[#eee2c3] px-3 py-2.5 sm:px-5 sm:py-4 lg:px-6">
            <button
              type="button"
              onClick={() => setChatOpen((open) => !open)}
              aria-expanded={chatOpen}
              className="flex min-w-0 flex-1 items-center gap-2 text-left lg:pointer-events-none"
            >
              <span className="text-base sm:text-lg">💬</span>

              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[#403b30] sm:text-base">
                  Your conversation
                </h2>
                <p className="hidden text-xs text-[#756448] sm:block">
                  Every new word is part of your journey.
                </p>
              </div>

              <span className="ml-auto text-xs text-[#806536] lg:hidden">
                {chatOpen ? "▼" : "▲"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              disabled={!languageReady || isBusy}
              className="shrink-0 rounded-full border border-[#c5ad78] bg-[#f8efd9] px-2.5 py-1.5 text-[10px] font-semibold text-[#72552b] transition hover:bg-[#e8d9b5] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-2 sm:text-xs"
            >
              ↻ Restart
            </button>
          </div>

          {/* Collapsible conversation content */}
          <div
            className={`
              min-h-0 flex-1 flex-col overflow-hidden
              ${chatOpen ? "flex" : "hidden"}
              lg:flex
            `}
          >
            {/* Voice playback notice */}
            {voiceEnabled && voicePlaybackIssue && (
              <div className="mx-3 mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#d2bd8e] bg-[#f8efd9] px-3 py-2 sm:mx-4 sm:px-4 sm:py-3">
                <p className="text-[10px] leading-relaxed text-[#72552b] sm:text-xs">
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
                  className="shrink-0 rounded-lg border border-[#c5ad78] bg-[#fff8e8] px-2 py-1.5 text-[10px] text-[#403b30] transition hover:bg-[#e8d9b5] sm:px-3 sm:py-2 sm:text-sm"
                >
                  Play voice
                </button>
              </div>
            )}

            {/* Messages */}
            <div
              aria-live="polite"
              aria-relevant="additions text"
              className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain bg-gradient-to-b from-[#f8efd9] to-[#eee0bd] p-3 sm:space-y-6 sm:p-6"
            >
              {!languageReady && (
                <p className="py-4 text-center text-xs text-[#756448] sm:text-sm">
                  Preparing your language...
                </p>
              )}

              {starting && savedMessages.length === 0 && (
                <div className="flex justify-start">
                  <div className="rounded-xl rounded-bl-sm border border-[#d2bd8e] bg-[#fff4d3] px-3 py-2.5 text-xs text-[#72552b] sm:px-5 sm:py-3 sm:text-sm">
                    Your guide is preparing the first chapter...
                  </div>
                </div>
              )}

              {savedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap break-words rounded-[18px] border px-3 py-2.5 text-xs leading-6 shadow-sm sm:px-5 sm:py-3.5 sm:text-sm sm:leading-7 ${
                      message.role === "user"
                        ? "rounded-br-sm border-[#b8c5a8] bg-gradient-to-br from-[#e0e8d5] to-[#cbd8bd] text-[#34402e]"
                        : "rounded-bl-sm border-[#d2b775] bg-gradient-to-br from-[#fff8e8] to-[#f0dfb5] text-[#403b30]"
                    }`}
                  >
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#96743a] sm:mb-1.5 sm:text-[10px]">
                      {message.role === "user" ? "You" : "Your story guide"}
                    </p>
                    {message.content}
                  </div>

                  {message.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => replayMessage(message.content)}
                      disabled={!voiceEnabled || !languageReady}
                      aria-label="Replay this AI message"
                      title="Replay audio"
                      className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#c5ad78] bg-[#fff8e8] text-sm text-[#806536] shadow-sm transition hover:border-[#a77a32] hover:bg-[#e8d9b5] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                    >
                      <span aria-hidden="true">🔊</span>
                    </button>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-xl rounded-bl-sm border border-[#d2bd8e] bg-[#fff4d3] px-3 py-2.5 text-xs text-[#72552b] shadow-sm sm:px-5 sm:py-3.5 sm:text-sm">
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

              {error && !failedMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#d5a18c] bg-[#f8e9e1] px-3 py-2.5 text-xs leading-5 text-[#92563f] sm:px-4 sm:py-3 sm:text-sm sm:leading-6"
                >
                  <div className="flex items-start gap-2">
                    <span>⚠</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {failedMessage && !sending && (
                <div className="rounded-xl border border-dashed border-[#c5ad78] bg-[#f8efd9] px-3 py-2.5 text-center sm:px-4 sm:py-3">
                  <p className="text-[10px] leading-5 text-[#72552b] sm:text-xs">
                    Retry your tutor's response above to continue your adventure.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-[#d2bd8e] bg-[#eee2c3] p-2.5 sm:p-4 lg:p-5"
          >
            <label htmlFor="conversation-message" className="sr-only">
              Your message
            </label>

            <div className="flex items-end gap-1.5 rounded-xl border border-[#c5ad78] bg-[#fff8e8] p-1.5 sm:gap-2 sm:p-2">
              {/* Microphone */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={
                  !languageReady || isBusy || Boolean(unresolvedMessage)
                }
                aria-label={listening ? "Stop microphone" : "Use microphone"}
                title={listening ? "Stop listening" : "Speak your message"}
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-base transition disabled:cursor-not-allowed disabled:opacity-30 sm:size-10 sm:text-lg ${
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
                className="max-h-28 min-h-9 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-xs text-[#403b30] outline-none placeholder:text-[#9b927f] disabled:cursor-not-allowed disabled:opacity-50 sm:max-h-36 sm:min-h-10 sm:py-2.5 sm:text-sm"
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
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#a77a32] bg-[#78805b] text-base text-white shadow-sm transition hover:bg-[#68734e] disabled:cursor-not-allowed disabled:opacity-40 sm:size-10 sm:text-lg"
                aria-label="Send message"
              >
                {sending ? "…" : "➤"}
              </button>
            </div>

            {/* Composer footer */}
            <div className="mt-1.5 flex items-center justify-between gap-2 px-1 sm:mt-3 sm:gap-3">
              <p className="min-w-0 truncate text-[9px] text-[#756448] sm:text-[10px]">
                {failedMessage
                  ? "Your previous message is saved. Retry above to continue."
                  : "Enter to send · Shift + Enter for a new line"}
              </p>

              <p className="shrink-0 text-[9px] tabular-nums text-[#756448] sm:text-[10px]">
                {input.length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
