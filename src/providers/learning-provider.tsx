"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useUserStore } from "@/store/user/user-store"
import { useLanguageStore } from "@/store/foundation/language-store"


export function LearningProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, userId } = useAuth()
  const params = useParams()

  // Language ID exists only on routes that define this dynamic segment.
  const languageId =
    typeof params.languageId === "string"
      ? params.languageId
      : undefined

  const fetchUser = useUserStore((state) => state.fetchUser)
  const clearUser = useUserStore((state) => state.clearUser)

  const fetchLanguage = useLanguageStore(
    (state) => state.fetchLanguage,
  )
  const clearLanguage = useLanguageStore(
    (state) => state.clearLanguage,
  )

  // Load the authenticated user.
  useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      clearUser()
      return
    }

    const controller = new AbortController()

    void fetchUser(controller.signal)

    return () => controller.abort()
  }, [isLoaded, userId, fetchUser, clearUser])

  // Load only the language identified by the URL.
  useEffect(() => {
    if (!languageId) {
      clearLanguage()
      return
    }

    void fetchLanguage(languageId)
  }, [languageId, fetchLanguage, clearLanguage])

  return <>{children}</>
}
