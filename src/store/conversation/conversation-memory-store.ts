
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createEmptyConversationSummary,
  mergeConversationSummaries,
  sanitizeConversationSummary,
  type ConversationSummary,
} from "@/lib/conversation-summary";

export type ConversationRole = "user" | "assistant";

export type ConversationMessage = {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: number;
};

export type ConversationSession = {
  messages: ConversationMessage[];
  summary: ConversationSummary;
  updatedAt: number;
};

type ConversationMemoryState = {
  sessions: Record<string, ConversationSession>;

  ensureSession: (key: string, goal?: string) => void;

  addExchange: (
    key: string,
    userMessage: string,
    assistantMessage: string,
    updatedSummary: unknown,
  ) => void;

  addAssistantMessage: (
    key: string,
    assistantMessage: string,
    updatedSummary?: unknown,
  ) => void;

  setSummary: (key: string, summary: unknown) => void;

  resetSession: (key: string, goal?: string) => void;
};

const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_SESSION_COUNT = 30;

function createMessage(
  role: ConversationRole,
  content: string,
): ConversationMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    role,
    content: content.slice(0, MAX_MESSAGE_LENGTH),
    createdAt: Date.now(),
  };
}

function createSession(goal = ""): ConversationSession {
  return {
    messages: [],
    summary: createEmptyConversationSummary(goal),
    updatedAt: Date.now(),
  };
}

function limitMessages(
  messages: ConversationMessage[],
): ConversationMessage[] {
  return messages.slice(-MAX_MESSAGES);
}

function sanitizeStoredMessage(
  value: unknown,
): ConversationMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    (item.role !== "user" && item.role !== "assistant") ||
    typeof item.content !== "string"
  ) {
    return null;
  }

  return {
    id:
      typeof item.id === "string"
        ? item.id
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    role: item.role,
    content: item.content.slice(0, MAX_MESSAGE_LENGTH),
    createdAt:
      typeof item.createdAt === "number"
        ? item.createdAt
        : Date.now(),
  };
}

function sanitizeSession(value: unknown): ConversationSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createSession();
  }

  const item = value as Record<string, unknown>;

  const messages = Array.isArray(item.messages)
    ? item.messages
        .map(sanitizeStoredMessage)
        .filter(
          (message): message is ConversationMessage => message !== null,
        )
    : [];

  return {
    messages: limitMessages(messages),
    summary: sanitizeConversationSummary(item.summary),
    updatedAt:
      typeof item.updatedAt === "number"
        ? item.updatedAt
        : Date.now(),
  };
}

export const useConversationMemoryStore =
  create<ConversationMemoryState>()(
    persist(
      (set) => ({
        sessions: {},

        ensureSession: (key, goal = "") => {
          set((state) => {
            if (state.sessions[key]) {
              return state;
            }

            const sessions = {
              ...state.sessions,
              [key]: createSession(goal),
            };

            const keys = Object.keys(sessions);

            // Bound storage across topics and languages as well.
            while (keys.length > MAX_SESSION_COUNT) {
              const oldestKey = keys.reduce((oldest, current) => {
                return sessions[current].updatedAt <
                  sessions[oldest].updatedAt
                  ? current
                  : oldest;
              });

              delete sessions[oldestKey];
              keys.splice(keys.indexOf(oldestKey), 1);
            }

            return { sessions };
          });
        },

        addExchange: (
          key,
          userMessage,
          assistantMessage,
          updatedSummary,
        ) => {
          set((state) => {
            const session = state.sessions[key] ?? createSession();

            const messages = [
              ...session.messages,
              createMessage("user", userMessage),
              createMessage("assistant", assistantMessage),
            ];

            return {
              sessions: {
                ...state.sessions,
                [key]: {
                  messages: limitMessages(messages),
                  summary: mergeConversationSummaries(
                    session.summary,
                    updatedSummary,
                  ),
                  updatedAt: Date.now(),
                },
              },
            };
          });
        },

        addAssistantMessage: (key, assistantMessage, updatedSummary) => {
          set((state) => {
            const session = state.sessions[key] ?? createSession();

            const summary =
              updatedSummary === undefined
                ? session.summary
                : mergeConversationSummaries(
                    session.summary,
                    updatedSummary,
                  );

            return {
              sessions: {
                ...state.sessions,
                [key]: {
                  messages: limitMessages([
                    ...session.messages,
                    createMessage("assistant", assistantMessage),
                  ]),
                  summary,
                  updatedAt: Date.now(),
                },
              },
            };
          });
        },

        setSummary: (key, summary) => {
          set((state) => {
            const session = state.sessions[key] ?? createSession();

            return {
              sessions: {
                ...state.sessions,
                [key]: {
                  ...session,
                  summary: mergeConversationSummaries(
                    session.summary,
                    summary,
                  ),
                  updatedAt: Date.now(),
                },
              },
            };
          });
        },

        resetSession: (key, goal = "") => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [key]: createSession(goal),
            },
          }));
        },
      }),
      {
        name: "linguisquest-conversation-memory",
        storage: createJSONStorage(() => localStorage),

        // Validate persisted data when it is restored.
        merge: (persistedState, currentState) => {
          const persisted = persistedState as
            | Partial<ConversationMemoryState>
            | undefined;

          const rawSessions = persisted?.sessions;
          const sessions: Record<string, ConversationSession> = {};

          if (rawSessions && typeof rawSessions === "object") {
            for (const [key, value] of Object.entries(rawSessions)) {
              sessions[key] = sanitizeSession(value);
            }
          }

          return {
            ...currentState,
            sessions,
          };
        },
      },
    ),
  );
