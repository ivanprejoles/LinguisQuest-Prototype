
// import { create } from "zustand"

// export interface Language {
//   id: string
//   name: string
//   countryCode: string
//   voiceLanguage: string
//   order: number
// }

// type FetchStatus = "idle" | "loading" | "success" | "error"

// interface LanguageState {
//   selectedLanguage: Language | null
//   status: FetchStatus
//   requestedLanguageId: string | null
//   fetchLanguage: (languageId: string) => Promise<void>
//   clearLanguage: () => void
// }

// export const useLanguageStore = create<LanguageState>((set, get) => ({
//   selectedLanguage: null,
//   status: "idle",
//   requestedLanguageId: null,

//   fetchLanguage: async (languageId) => {
//     const { selectedLanguage, status, requestedLanguageId } = get()

//     // Reuse the language if it's already loaded.
//     if (
//       selectedLanguage?.id === languageId &&
//       status === "success"
//     ) {
//       return
//     }

//     // Prevent duplicate requests for the same language.
//     if (
//       requestedLanguageId === languageId &&
//       status === "loading"
//     ) {
//       return
//     }

//     set({
//       requestedLanguageId: languageId,
//       status: "loading",
//     })

//     try {
//       const response = await fetch(
//         `/api/client/languages/${encodeURIComponent(languageId)}`,
//       )

      
//         if (!response.ok) {
//             const body = await response.text()

//             console.error("Language API failed:", {
//                 url: response.url,
//                 status: response.status,
//                 statusText: response.statusText,
//                 body,
//             })

//             throw new Error(
//                 response.status === 404
//                 ? "Language not found"
//                 : `Failed to fetch language (${response.status})`,
//             )
//         }


//         const language: Language = await response.json()

//         // Ignore results from outdated requests.
//         if (get().requestedLanguageId !== languageId) return

//         set({
//             selectedLanguage: language,
//             status: "success",
//         })
//     } catch (error) {
//       if (get().requestedLanguageId !== languageId) return

//       console.error("Failed to fetch language:", error)

//       set({
//         selectedLanguage: null,
//         status: "error",
//       })
//     }
//   },

//   clearLanguage: () =>
//     set({
//       selectedLanguage: null,
//       status: "idle",
//       requestedLanguageId: null,
//     }),
// }))

import { create } from "zustand";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Language {
  id: string;
  name: string;
  countryCode: string;
  voiceLanguage: string;
  order: number;
}

type FetchStatus = "idle" | "loading" | "success" | "error";

interface LanguageState {
  selectedLanguage: Language | null;
  status: FetchStatus;
  requestedLanguageId: string | null;

  fetchLanguage: (languageId: string) => Promise<void>;
  clearLanguage: () => void;
}

// -----------------------------------------------------------------------------
// Request cache
// -----------------------------------------------------------------------------

// Prevents multiple components from requesting the same language simultaneously.
const languageRequests = new Map<string, Promise<void>>();

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useLanguageStore = create<LanguageState>((set, get) => ({
  selectedLanguage: null,
  status: "idle",
  requestedLanguageId: null,

  fetchLanguage: async (languageId) => {
    const current = get();

    // Reuse an already loaded language.
    if (
      current.selectedLanguage?.id === languageId &&
      current.status === "success"
    ) {
      return;
    }

    // Reuse an in-flight request for the same currently requested language.
    if (
      current.requestedLanguageId === languageId &&
      current.status === "loading"
    ) {
      const existingRequest = languageRequests.get(languageId);

      if (existingRequest) {
        return existingRequest;
      }
    }

    set({
      requestedLanguageId: languageId,
      status: "loading",
    });

    const request = (async () => {
      try {
        const response = await fetch(
          `/api/client/languages/${encodeURIComponent(languageId)}`,
        );

        if (!response.ok) {
          const body = await response.text();

          console.error("Language API failed:", {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            body,
          });

          throw new Error(
            response.status === 404
              ? "Language not found"
              : `Failed to fetch language (${response.status})`,
          );
        }

        const language: Language = await response.json();

        // Basic response validation.
        if (
          !language ||
          typeof language.id !== "string" ||
          typeof language.name !== "string" ||
          typeof language.voiceLanguage !== "string"
        ) {
          throw new Error("Invalid language response");
        }

        // Ignore results from outdated requests.
        if (get().requestedLanguageId !== languageId) {
          return;
        }

        set({
          selectedLanguage: language,
          status: "success",
        });
      } catch (error) {
        // Do not overwrite the state of a newer language request.
        if (get().requestedLanguageId !== languageId) {
          return;
        }

        console.error("Failed to fetch language:", error);

        set({
          selectedLanguage: null,
          status: "error",
        });

        throw error;
      }
    })();

    languageRequests.set(languageId, request);

    try {
      await request;
    } finally {
      // Only remove the request if it is still the latest request for this ID.
      if (languageRequests.get(languageId) === request) {
        languageRequests.delete(languageId);
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Clear selected language
  // ---------------------------------------------------------------------------

  clearLanguage: () => {
    set({
      selectedLanguage: null,
      status: "idle",
      requestedLanguageId: null,
    });
  },
}));
