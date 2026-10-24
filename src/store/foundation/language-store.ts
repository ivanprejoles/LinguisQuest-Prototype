
import { create } from "zustand"

export interface Language {
  id: string
  name: string
  countryCode: string
  voiceLanguage: string
  order: number
}

type FetchStatus = "idle" | "loading" | "success" | "error"

interface LanguageState {
  selectedLanguage: Language | null
  status: FetchStatus
  requestedLanguageId: string | null
  fetchLanguage: (languageId: string) => Promise<void>
  clearLanguage: () => void
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  selectedLanguage: null,
  status: "idle",
  requestedLanguageId: null,

  fetchLanguage: async (languageId) => {
    const { selectedLanguage, status, requestedLanguageId } = get()

    // Reuse the language if it's already loaded.
    if (
      selectedLanguage?.id === languageId &&
      status === "success"
    ) {
      return
    }

    // Prevent duplicate requests for the same language.
    if (
      requestedLanguageId === languageId &&
      status === "loading"
    ) {
      return
    }

    set({
      requestedLanguageId: languageId,
      status: "loading",
    })

    try {
      const response = await fetch(
        `/api/client/languages/${encodeURIComponent(languageId)}`,
      )

      
        if (!response.ok) {
            const body = await response.text()

            console.error("Language API failed:", {
                url: response.url,
                status: response.status,
                statusText: response.statusText,
                body,
            })

            throw new Error(
                response.status === 404
                ? "Language not found"
                : `Failed to fetch language (${response.status})`,
            )
        }


        const language: Language = await response.json()

        // Ignore results from outdated requests.
        if (get().requestedLanguageId !== languageId) return

        set({
            selectedLanguage: language,
            status: "success",
        })
    } catch (error) {
      if (get().requestedLanguageId !== languageId) return

      console.error("Failed to fetch language:", error)

      set({
        selectedLanguage: null,
        status: "error",
      })
    }
  },

  clearLanguage: () =>
    set({
      selectedLanguage: null,
      status: "idle",
      requestedLanguageId: null,
    }),
}))
