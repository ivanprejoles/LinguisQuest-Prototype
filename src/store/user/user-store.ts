
import { create } from "zustand"

export interface AppUser {
  id: string
  name: string | null
  imageUrl: string | null
  xp: number
  hearts: number
  maxHearts: number
  lastHeartRefillAt: string | null
}

type UserStatus = "idle" | "loading" | "success" | "error"

interface UserState {
  user: AppUser | null
  status: UserStatus
  error: string | null

  fetchUser: (signal?: AbortSignal) => Promise<void>
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  fetchUser: async (signal) => {
    set({ status: "loading", error: null })

    try {
      const response = await fetch("/api/client/me", {
        credentials: "same-origin",
        signal,
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Unauthorized"
            : "Failed to fetch user"
        )
      }

      const user: AppUser = await response.json()

      set({
        user,
        status: "success",
        error: null,
      })
    } catch (error) {
      if (signal?.aborted) return

      set({
        user: null,
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      })
    }
  },

  clearUser: () =>
    set({
      user: null,
      status: "idle",
      error: null,
    }),
}))
