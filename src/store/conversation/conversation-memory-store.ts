
// "use client";

// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";

// import {
//   createEmptyConversationSummary,
//   mergeConversationSummaries,
//   sanitizeConversationSummary,
//   type ConversationSummary,
// } from "@/lib/conversation-summary";

// // -----------------------------------------------------------------------------
// // Types
// // -----------------------------------------------------------------------------

// export type ConversationRole = "user" | "assistant";

// export type MessageStatus =
//   | "pending"
//   | "failed"
//   | "retrying"
//   | "completed";

// export type ConversationMessage = {
//   id: string;
//   role: ConversationRole;
//   content: string;
//   createdAt: number;
//   status: MessageStatus;
// };

// export type ConversationSession = {
//   messages: ConversationMessage[];
//   summary: ConversationSummary;
//   updatedAt: number;
//   exchangeCount: number;
// };

// type ConversationMemoryState = {
//   sessions: Record<string, ConversationSession>;

//   ensureSession: (key: string, goal?: string) => void;

//   addPendingUserMessage: (
//     key: string,
//     content: string,
//   ) => string;

//   setMessageStatus: (
//     key: string,
//     messageId: string,
//     status: MessageStatus,
//   ) => void;

//   completeExchange: (
//     key: string,
//     messageId: string,
//     assistantMessage: string,
//     updatedSummary?: unknown,
//   ) => void;

//   addExchange: (
//     key: string,
//     userMessage: string,
//     assistantMessage: string,
//     updatedSummary?: unknown,
//   ) => void;

//   addAssistantMessage: (
//     key: string,
//     assistantMessage: string,
//     updatedSummary?: unknown,
//   ) => void;

//   setSummary: (key: string, summary: unknown) => void;

//   resetSession: (key: string, goal?: string) => void;
// };

// // -----------------------------------------------------------------------------
// // Configuration
// // -----------------------------------------------------------------------------

// // const MAX_MESSAGES = 10;
// // const MAX_MESSAGE_LENGTH = 4000;
// // const MAX_SESSION_COUNT = 30;
// const MAX_MESSAGES = 20;
// const MAX_MESSAGE_LENGTH = 1000;
// const MAX_SESSION_COUNT = 30;


// const VALID_STATUSES: MessageStatus[] = [
//   "pending",
//   "failed",
//   "retrying",
//   "completed",
// ];

// // -----------------------------------------------------------------------------
// // Message helpers
// // -----------------------------------------------------------------------------

// function createMessage(
//   role: ConversationRole,
//   content: string,
//   status: MessageStatus = "completed",
// ): ConversationMessage {
//   return {
//     id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
//     role,
//     content: content.slice(0, MAX_MESSAGE_LENGTH),
//     createdAt: Date.now(),
//     status,
//   };
// }

// function limitMessages(
//   messages: ConversationMessage[],
// ): ConversationMessage[] {
//   return messages.slice(-MAX_MESSAGES);
// }

// function sanitizeStoredMessage(
//   value: unknown,
// ): ConversationMessage | null {
//   if (!value || typeof value !== "object" || Array.isArray(value)) {
//     return null;
//   }

//   const item = value as Record<string, unknown>;

//   if (
//     (item.role !== "user" && item.role !== "assistant") ||
//     typeof item.content !== "string"
//   ) {
//     return null;
//   }

//   const status = VALID_STATUSES.includes(
//     item.status as MessageStatus,
//   )
//     ? (item.status as MessageStatus)
//     : "completed";

//   return {
//     id:
//       typeof item.id === "string"
//         ? item.id
//         : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,

//     role: item.role,

//     content: item.content.slice(0, MAX_MESSAGE_LENGTH),

//     createdAt:
//       typeof item.createdAt === "number" &&
//       Number.isFinite(item.createdAt)
//         ? item.createdAt
//         : Date.now(),

//     status,
//   };
// }

// // -----------------------------------------------------------------------------
// // Session helpers
// // -----------------------------------------------------------------------------

// function createSession(goal = ""): ConversationSession {
//   return {
//     messages: [],
//     summary: createEmptyConversationSummary(goal),
//     updatedAt: Date.now(),
//     exchangeCount: 0,
//   };
// }

// function sanitizeSession(value: unknown): ConversationSession {
//   if (!value || typeof value !== "object" || Array.isArray(value)) {
//     return createSession();
//   }

//   const item = value as Record<string, unknown>;

//   const messages = Array.isArray(item.messages)
//     ? item.messages
//         .map(sanitizeStoredMessage)
//         .filter(
//           (message): message is ConversationMessage =>
//             message !== null,
//         )
//     : [];

//   return {
//     messages: limitMessages(messages),

//     summary: sanitizeConversationSummary(item.summary),

//     updatedAt:
//       typeof item.updatedAt === "number" &&
//       Number.isFinite(item.updatedAt)
//         ? item.updatedAt
//         : Date.now(),

//     exchangeCount:
//       typeof item.exchangeCount === "number" &&
//       Number.isFinite(item.exchangeCount)
//         ? Math.max(0, Math.floor(item.exchangeCount))
//         : 0,
//   };
// }

// // -----------------------------------------------------------------------------
// // Store
// // -----------------------------------------------------------------------------

// export const useConversationMemoryStore =
//   create<ConversationMemoryState>()(
//     persist(
//       (set) => ({
//         sessions: {},

//         // ---------------------------------------------------------------------
//         // Ensure session exists
//         // ---------------------------------------------------------------------

//         ensureSession: (key, goal = "") => {
//           set((state) => {
//             if (state.sessions[key]) {
//               return state;
//             }

//             const sessions = {
//               ...state.sessions,
//               [key]: createSession(goal),
//             };

//             const keys = Object.keys(sessions);

//             while (keys.length > MAX_SESSION_COUNT) {
//               const oldestKey = keys.reduce((oldest, current) => {
//                 return sessions[current].updatedAt <
//                   sessions[oldest].updatedAt
//                   ? current
//                   : oldest;
//               });

//               delete sessions[oldestKey];

//               keys.splice(keys.indexOf(oldestKey), 1);
//             }

//             return { sessions };
//           });
//         },

//         // ---------------------------------------------------------------------
//         // Add learner message BEFORE requesting AI response
//         // Returns the stable ID used for retrying this same message.
//         // ---------------------------------------------------------------------

//         addPendingUserMessage: (key, content) => {
//           const message = createMessage(
//             "user",
//             content,
//             "pending",
//           );

//           set((state) => {
//             const session = state.sessions[key] ?? createSession();

//             return {
//               sessions: {
//                 ...state.sessions,
//                 [key]: {
//                   ...session,
//                   messages: limitMessages([
//                     ...session.messages,
//                     message,
//                   ]),
//                   updatedAt: Date.now(),
//                 },
//               },
//             };
//           });

//           return message.id;
//         },

//         // ---------------------------------------------------------------------
//         // Update an existing message status
//         // ---------------------------------------------------------------------

//         setMessageStatus: (key, messageId, status) => {
//           set((state) => {
//             const session = state.sessions[key];

//             if (!session) return state;

//             const messageExists = session.messages.some(
//               (message) => message.id === messageId,
//             );

//             if (!messageExists) return state;

//             return {
//               sessions: {
//                 ...state.sessions,
//                 [key]: {
//                   ...session,
//                   messages: session.messages.map((message) =>
//                     message.id === messageId
//                       ? { ...message, status }
//                       : message,
//                   ),
//                   updatedAt: Date.now(),
//                 },
//               },
//             };
//           });
//         },

//         // ---------------------------------------------------------------------
//         // Complete an existing learner message + AI response
//         //
//         // The learner message is NOT added again.
//         // The exchange count increments only once.
//         // ---------------------------------------------------------------------

//         completeExchange: (
//           key,
//           messageId,
//           assistantMessage,
//           updatedSummary,
//         ) => {
//           set((state) => {
//             const session = state.sessions[key];

//             if (!session) return state;

//             const userMessage = session.messages.find(
//               (message) => message.id === messageId,
//             );

//             if (!userMessage || userMessage.role !== "user") {
//               return state;
//             }

//             // Prevent duplicate completion and double counting.
//             if (userMessage.status === "completed") {
//               return state;
//             }

//             // Do not append an AI response to an already completed message.
//             const messages = [
//               ...session.messages.map((message) =>
//                 message.id === messageId
//                   ? { ...message, status: "completed" as const }
//                   : message,
//               ),
//               createMessage("assistant", assistantMessage),
//             ];

//             const summary =
//               updatedSummary === undefined
//                 ? session.summary
//                 : mergeConversationSummaries(
//                     session.summary,
//                     updatedSummary,
//                   );

//             return {
//               sessions: {
//                 ...state.sessions,
//                 [key]: {
//                   messages: limitMessages(messages),
//                   summary,
//                   updatedAt: Date.now(),
//                   exchangeCount: session.exchangeCount + 1,
//                 },
//               },
//             };
//           });
//         },

//         // ---------------------------------------------------------------------
//         // Add a complete learner + AI exchange
//         // Kept for backward compatibility.
//         // ---------------------------------------------------------------------

//         addExchange: (
//           key,
//           userMessage,
//           assistantMessage,
//           updatedSummary,
//         ) => {
//           set((state) => {
//             const session = state.sessions[key] ?? createSession();

//             const messages = [
//               ...session.messages,
//               createMessage("user", userMessage),
//               createMessage("assistant", assistantMessage),
//             ];

//             const summary =
//               updatedSummary === undefined
//                 ? session.summary
//                 : mergeConversationSummaries(
//                     session.summary,
//                     updatedSummary,
//                   );

//             return {
//               sessions: {
//                 ...state.sessions,
//                 [key]: {
//                   messages: limitMessages(messages),
//                   summary,
//                   updatedAt: Date.now(),
//                   exchangeCount: session.exchangeCount + 1,
//                 },
//               },
//             };
//           });
//         },

//         // ---------------------------------------------------------------------
//         // Add opening message or assistant-only message
//         // ---------------------------------------------------------------------

//         addAssistantMessage: (
//           key,
//           assistantMessage,
//           updatedSummary,
//         ) => {
//           set((state) => {
//             const session = state.sessions[key] ?? createSession();

//             const summary =
//               updatedSummary === undefined
//                 ? session.summary
//                 : mergeConversationSummaries(
//                     session.summary,
//                     updatedSummary,
//                   );

//             return {
//               sessions: {
//                 ...state.sessions,
//                 [key]: {
//                   messages: limitMessages([
//                     ...session.messages,
//                     createMessage("assistant", assistantMessage),
//                   ]),
//                   summary,
//                   updatedAt: Date.now(),
//                   exchangeCount: session.exchangeCount,
//                 },
//               },
//             };
//           });
//         },

//         // ---------------------------------------------------------------------
//         // Update summary independently
//         // ---------------------------------------------------------------------

//         setSummary: (key, summary) => {
//           set((state) => {
//             const session = state.sessions[key] ?? createSession();

//             return {
//               sessions: {
//                 ...state.sessions,
//                 [key]: {
//                   ...session,
//                   summary: mergeConversationSummaries(
//                     session.summary,
//                     summary,
//                   ),
//                   updatedAt: Date.now(),
//                 },
//               },
//             };
//           });
//         },

//         // ---------------------------------------------------------------------
//         // Reset session
//         // ---------------------------------------------------------------------

//         resetSession: (key, goal = "") => {
//           set((state) => ({
//             sessions: {
//               ...state.sessions,
//               [key]: createSession(goal),
//             },
//           }));
//         },
//       }),

//       // -----------------------------------------------------------------------
//       // Persistence
//       // -----------------------------------------------------------------------

//       {
//         name: "linguisquest-conversation-memory",

//         storage: createJSONStorage(() => localStorage),

//         merge: (persistedState, currentState) => {
//           const persisted = persistedState as
//             | Partial<ConversationMemoryState>
//             | undefined;

//           const rawSessions = persisted?.sessions;

//           const sessions: Record<string, ConversationSession> = {};

//           if (
//             rawSessions &&
//             typeof rawSessions === "object" &&
//             !Array.isArray(rawSessions)
//           ) {
//             for (const [key, value] of Object.entries(rawSessions)) {
//               sessions[key] = sanitizeSession(value);
//             }
//           }

//           return {
//             ...currentState,
//             sessions,
//           };
//         },
//       },
//     ),
//   );

  
// export const MAX_HISTORY_MESSAGES = 10;

// export function getRecentConversationHistory(
//   session: ConversationSession | undefined,
// ) {
//   if (!session) return [];

//   return session.messages
//     .filter(
//       (message) =>
//         message.status === "completed",
//     )
//     .slice(-MAX_HISTORY_MESSAGES)
//     .map(({ role, content }) => ({
//       role,
//       content,
//     }));
// }

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createEmptyConversationSummary,
  mergeConversationSummaries,
  sanitizeConversationSummary,
  type ConversationSummary,
} from "@/lib/conversation-summary";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ConversationRole = "user" | "assistant";

export type MessageStatus =
  | "pending"
  | "failed"
  | "retrying"
  | "completed";

export type ConversationMessage = {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: number;
  status: MessageStatus;
};

export type ConversationSession = {
  // UI history only. Never send this array to the AI API.
  messages: ConversationMessage[];

  // Compact memory sent to the AI API.
  summary: ConversationSummary;

  updatedAt: number;
  exchangeCount: number;
};

type ConversationMemoryState = {
  sessions: Record<string, ConversationSession>;

  ensureSession: (key: string, goal?: string) => void;

  addPendingUserMessage: (
    key: string,
    content: string,
  ) => string;

  setMessageStatus: (
    key: string,
    messageId: string,
    status: MessageStatus,
  ) => void;

  completeExchange: (
    key: string,
    messageId: string,
    assistantMessage: string,
    updatedSummary?: unknown,
  ) => void;

  addExchange: (
    key: string,
    userMessage: string,
    assistantMessage: string,
    updatedSummary?: unknown,
  ) => void;

  addAssistantMessage: (
    key: string,
    assistantMessage: string,
    updatedSummary?: unknown,
  ) => void;

  setSummary: (key: string, summary: unknown) => void;

  resetSession: (key: string, goal?: string) => void;
};

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_SESSION_COUNT = 30;

const VALID_STATUSES: MessageStatus[] = [
  "pending",
  "failed",
  "retrying",
  "completed",
];

// -----------------------------------------------------------------------------
// Message helpers
// -----------------------------------------------------------------------------

function createMessage(
  role: ConversationRole,
  content: string,
  status: MessageStatus = "completed",
): ConversationMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    role,
    content: content.slice(0, MAX_MESSAGE_LENGTH),
    createdAt: Date.now(),
    status,
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

  const status = VALID_STATUSES.includes(
    item.status as MessageStatus,
  )
    ? (item.status as MessageStatus)
    : "completed";

  return {
    id:
      typeof item.id === "string" && item.id.length > 0
        ? item.id
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,

    role: item.role,

    content: item.content.slice(0, MAX_MESSAGE_LENGTH),

    createdAt:
      typeof item.createdAt === "number" &&
      Number.isFinite(item.createdAt)
        ? item.createdAt
        : Date.now(),

    status,
  };
}

// -----------------------------------------------------------------------------
// Session helpers
// -----------------------------------------------------------------------------

function createSession(goal = ""): ConversationSession {
  return {
    messages: [],
    summary: createEmptyConversationSummary(goal),
    updatedAt: Date.now(),
    exchangeCount: 0,
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
          (message): message is ConversationMessage =>
            message !== null,
        )
    : [];

  return {
    messages: limitMessages(messages),

    summary: sanitizeConversationSummary(item.summary),

    updatedAt:
      typeof item.updatedAt === "number" &&
      Number.isFinite(item.updatedAt)
        ? item.updatedAt
        : Date.now(),

    exchangeCount:
      typeof item.exchangeCount === "number" &&
      Number.isFinite(item.exchangeCount)
        ? Math.max(0, Math.floor(item.exchangeCount))
        : 0,
  };
}

/**
 * Enforces the maximum number of stored sessions.
 * The oldest session is removed based on updatedAt.
 */
function limitSessions(
  sessions: Record<string, ConversationSession>,
): Record<string, ConversationSession> {
  const entries = Object.entries(sessions);

  if (entries.length <= MAX_SESSION_COUNT) {
    return sessions;
  }

  entries.sort(
    ([, a], [, b]) => a.updatedAt - b.updatedAt,
  );

  const retainedEntries = entries.slice(-MAX_SESSION_COUNT);

  return Object.fromEntries(retainedEntries);
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useConversationMemoryStore =
  create<ConversationMemoryState>()(
    persist(
      (set) => ({
        sessions: {},

        // ---------------------------------------------------------------------
        // Ensure session exists
        // ---------------------------------------------------------------------

        ensureSession: (key, goal = "") => {
          set((state) => {
            if (state.sessions[key]) {
              return state;
            }

            const sessions = limitSessions({
              ...state.sessions,
              [key]: createSession(goal),
            });

            return { sessions };
          });
        },

        // ---------------------------------------------------------------------
        // Add learner message before requesting AI response
        // Returns the stable ID used when retrying this message.
        // ---------------------------------------------------------------------

        addPendingUserMessage: (key, content) => {
          const message = createMessage(
            "user",
            content,
            "pending",
          );

          set((state) => {
            const session = state.sessions[key] ?? createSession();

            const sessions = limitSessions({
              ...state.sessions,
              [key]: {
                ...session,
                messages: limitMessages([
                  ...session.messages,
                  message,
                ]),
                updatedAt: Date.now(),
              },
            });

            return { sessions };
          });

          return message.id;
        },

        // ---------------------------------------------------------------------
        // Update an existing message status
        // ---------------------------------------------------------------------

        setMessageStatus: (key, messageId, status) => {
          set((state) => {
            const session = state.sessions[key];

            if (!session) return state;

            const messageExists = session.messages.some(
              (message) => message.id === messageId,
            );

            if (!messageExists) return state;

            const sessions = limitSessions({
              ...state.sessions,
              [key]: {
                ...session,
                messages: session.messages.map((message) =>
                  message.id === messageId
                    ? { ...message, status }
                    : message,
                ),
                updatedAt: Date.now(),
              },
            });

            return { sessions };
          });
        },

        // ---------------------------------------------------------------------
        // Complete an existing learner message + AI response
        //
        // The learner message is not added again.
        // The AI memory update is merged into the existing summary.
        // ---------------------------------------------------------------------

        completeExchange: (
          key,
          messageId,
          assistantMessage,
          updatedSummary,
        ) => {
          set((state) => {
            const session = state.sessions[key];

            if (!session) return state;

            const userMessage = session.messages.find(
              (message) => message.id === messageId,
            );

            if (!userMessage || userMessage.role !== "user") {
              return state;
            }

            // Prevent duplicate completion and double counting.
            if (userMessage.status === "completed") {
              return state;
            }

            const messages = [
              ...session.messages.map((message) =>
                message.id === messageId
                  ? { ...message, status: "completed" as const }
                  : message,
              ),
              createMessage("assistant", assistantMessage),
            ];

            // The API returns a memory update for the latest exchange.
            // Merge it with the existing client-side conversation summary.
            const summary =
              updatedSummary === undefined
                ? session.summary
                : mergeConversationSummaries(
                    session.summary,
                    updatedSummary,
                  );

            const sessions = limitSessions({
              ...state.sessions,
              [key]: {
                messages: limitMessages(messages),
                summary,
                updatedAt: Date.now(),
                exchangeCount: session.exchangeCount + 1,
              },
            });

            return { sessions };
          });
        },

        // ---------------------------------------------------------------------
        // Add a complete learner + AI exchange
        // Kept for backward compatibility.
        // ---------------------------------------------------------------------

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

            const summary =
              updatedSummary === undefined
                ? session.summary
                : mergeConversationSummaries(
                    session.summary,
                    updatedSummary,
                  );

            const sessions = limitSessions({
              ...state.sessions,
              [key]: {
                messages: limitMessages(messages),
                summary,
                updatedAt: Date.now(),
                exchangeCount: session.exchangeCount + 1,
              },
            });

            return { sessions };
          });
        },

        // ---------------------------------------------------------------------
        // Add opening message or assistant-only message
        // ---------------------------------------------------------------------

        addAssistantMessage: (
          key,
          assistantMessage,
          updatedSummary,
        ) => {
          set((state) => {
            const session = state.sessions[key] ?? createSession();

            const summary =
              updatedSummary === undefined
                ? session.summary
                : mergeConversationSummaries(
                    session.summary,
                    updatedSummary,
                  );

            const sessions = limitSessions({
              ...state.sessions,
              [key]: {
                messages: limitMessages([
                  ...session.messages,
                  createMessage("assistant", assistantMessage),
                ]),
                summary,
                updatedAt: Date.now(),
                exchangeCount: session.exchangeCount,
              },
            });

            return { sessions };
          });
        },

        // ---------------------------------------------------------------------
        // Update summary independently
        // ---------------------------------------------------------------------

        setSummary: (key, summary) => {
          set((state) => {
            const session = state.sessions[key] ?? createSession();

            const sessions = limitSessions({
              ...state.sessions,
              [key]: {
                ...session,
                summary: mergeConversationSummaries(
                  session.summary,
                  summary,
                ),
                updatedAt: Date.now(),
              },
            });

            return { sessions };
          });
        },

        // ---------------------------------------------------------------------
        // Reset session
        // ---------------------------------------------------------------------

        resetSession: (key, goal = "") => {
          set((state) => ({
            sessions: limitSessions({
              ...state.sessions,
              [key]: createSession(goal),
            }),
          }));
        },
      }),

      // -----------------------------------------------------------------------
      // Persistence
      // -----------------------------------------------------------------------

      {
        name: "linguisquest-conversation-memory",

        storage: createJSONStorage(() => localStorage),

        merge: (persistedState, currentState) => {
          const persisted = persistedState as
            | Partial<ConversationMemoryState>
            | undefined;

          const rawSessions = persisted?.sessions;

          const sessions: Record<string, ConversationSession> = {};

          if (
            rawSessions &&
            typeof rawSessions === "object" &&
            !Array.isArray(rawSessions)
          ) {
            for (const [key, value] of Object.entries(rawSessions)) {
              sessions[key] = sanitizeSession(value);
            }
          }

          return {
            ...currentState,
            sessions: limitSessions(sessions),
          };
        },
      },
    ),
  );
