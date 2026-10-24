"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react"
import { useUserStore } from "@/store/user/user-store"


interface Roadmap {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  imageFileId: string | null
  order: number
  languageId: string
  stageCount: number
}


interface RoadmapResponse {
  roadmaps: Roadmap[]
}

const XP_PER_ROADMAP = 250
const XP_PER_STAGE = 10
const STAGES_PER_ROADMAP = 25


function getRoadmapColor(index: number) {
  // Move around the color wheel with a large hue difference.
  const hue = (index * 137.508 + 12) % 360

  return {
    background: `hsl(${hue}, 75%, 42%)`,
    border: `hsl(${hue}, 80%, 32%)`,
    shadow: `hsl(${hue}, 85%, 25%)`,
    soft: `hsla(${hue}, 90%, 85%, 0.24)`,
    progress: `hsl(${(hue + 55) % 360}, 95%, 72%)`,
  }
}


export default function LanguageRoadmapPage() {
  const params = useParams<{ languageId: string }>()
  const router = useRouter()
  const languageId = params.languageId

  const user = useUserStore((state) => state.user)
  const userStatus = useUserStore((state) => state.status)

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const xp = user?.xp ?? 0

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRoadmaps() {
      if (!languageId) {
        router.replace("/language")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/client/languages/${languageId}/roadmaps`,
          { signal: controller.signal }
        )

        if (response.status === 404) {
          router.replace("/language")
          return
        }

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Please sign in to continue."
              : "Unable to load roadmaps."
          )
        }

        const result: RoadmapResponse = await response.json()

        if (!controller.signal.aborted) {
          setRoadmaps(
            [...result.roadmaps].sort((a, b) => a.order - b.order)
          )
        }
      } catch (err) {
        if (controller.signal.aborted) return

        console.error("Failed to fetch roadmaps:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void fetchRoadmaps()

    return () => controller.abort()
  }, [languageId, router])

  function openRoadmap(roadmapId: string) {
    router.push(
      `/language/${languageId}/foundation/${roadmapId}`
    )
  }

  function openEvaluation(roadmapId: string) {
    router.push(
      `/language/${languageId}/foundation/${roadmapId}/evaluation`
    )
  }

  if (
    loading ||
    userStatus === "loading" ||
    userStatus === "idle"
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
          <p className="text-sm font-bold text-slate-500">
            Getting your adventure ready...
          </p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-20 text-center">
        <CircleHelp className="h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-black text-slate-800">
          Unable to load your roadmaps
        </h2>
        <p className="text-sm text-slate-500">
          {error ?? "Please sign in to continue."}
        </p>
        <button
          onClick={() => router.push("/language")}
          className="rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-white"
        >
          Back to Languages
        </button>
      </div>
    )
  }

  // const completedCount = Math.min(
  //   roadmaps.length,
  //   Math.floor(xp / XP_PER_ROADMAP)
  // )
  const completedCount = roadmaps.filter((roadmap, index) => {
    const requiredXP = roadmaps
      .slice(0, index)
      .reduce(
        (total, item) =>
          total +
          Math.min(25, Math.max(0, item.stageCount ?? 0)) *
            XP_PER_STAGE,
        0
      )

    const stageCount = Math.min(
      25,
      Math.max(0, roadmap.stageCount ?? 0)
    )

    return (
      stageCount > 0 &&
      xp >= requiredXP + stageCount * XP_PER_STAGE
    )
  }).length

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
      {/* Header */}
      <section className="mb-7">
        {/* <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Your learning adventure
          </span>
        </div> */}

        <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          Choose your next quest!
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Learn step by step, earn XP, and unlock new adventures.
        </p>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-white shadow-[0_3px_0_#d97706]">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">
                Your experience
              </p>
              <p className="text-xl font-black text-amber-950">
                {xp.toLocaleString()} XP
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-amber-800">
              {completedCount}/{roadmaps.length}
            </p>
            <p className="text-xs font-bold text-amber-700">
              quests completed
            </p>
          </div>
        </div>
      </section>

      {roadmaps.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="font-black text-slate-700">
            Your adventure starts soon!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            No roadmaps have been added to this language yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {roadmaps.map((roadmap, index) => {
            // const requiredXP = index * XP_PER_ROADMAP
            const stageCount = Math.min( 25, Math.max(0, roadmap.stageCount ?? 0))
            const requiredXP = roadmaps
                                .slice(0, index)
                                .reduce((total, item) => total + Math.min(25, Math.max(0, item.stageCount ?? 0)) * XP_PER_STAGE, 0)
            const roadmapXP = Math.max(0, xp - requiredXP)
            const completedStages = Math.min( stageCount,Math.floor(roadmapXP / XP_PER_STAGE))
            const isLocked = xp < requiredXP
            const isCompleted = stageCount > 0 && completedStages >= stageCount
            // c  = (index + 1) * XP_PER_ROADMAP
            const isCurrent = !isLocked && !isCompleted

            // const roadmapXP = Math.min(
            //   XP_PER_ROADMAP,
            //   Math.max(0, xp - requiredXP)
            // )

            // const completedStages = isCompleted
            //   ? STAGES_PER_ROADMAP
            //   : Math.min(
            //       STAGES_PER_ROADMAP,
            //       Math.floor(roadmapXP / XP_PER_STAGE)
            //     )

            // const progress = Math.round(
            //   (completedStages / STAGES_PER_ROADMAP) * 100
            // )
            const progress = stageCount > 0 ? Math.round((completedStages / stageCount) * 100) : 0

            const color = getRoadmapColor(roadmap.order)
            const expanded = expandedId === roadmap.id

            return (
              <article
                key={roadmap.id}
                style={
                  isLocked
                    ? undefined
                    : {
                        backgroundColor: color.background,
                        borderColor: color.border,
                        boxShadow: `0 5px 0 ${color.shadow}`,
                      }
                }
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  isLocked
                    ? "border-slate-200 bg-slate-200 text-slate-500"
                    : "text-white"
                }`}
              >
                <div className="relative flex min-h-[178px]">
                  <div className="relative z-10 flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                          isLocked ? "text-slate-500" : "text-white/80"
                        }`}
                      >
                        Section {index + 1}
                      </span>

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-extrabold">
                          <CheckCircle2 className="h-3 w-3" />
                          COMPLETED
                        </span>
                      )}

                      {isCurrent && (
                        <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-extrabold">
                          IN PROGRESS
                        </span>
                      )}

                      {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-300/70 px-2 py-1 text-[10px] font-extrabold text-slate-600">
                          <LockKeyhole className="h-3 w-3" />
                          LOCKED
                        </span>
                      )}
                    </div>

                    <h2 className="max-w-[250px] text-lg font-black leading-tight sm:text-xl">
                      {roadmap.title}
                    </h2>

                    <p
                      className={`mt-1 line-clamp-2 max-w-[260px] text-xs font-semibold leading-5 ${
                        isLocked ? "text-slate-500" : "text-white/80"
                      }`}
                    >
                      {roadmap.description ||
                        "A new adventure awaits. Keep learning and level up!"}
                    </p>

                    <div className="mt-4 max-w-[270px]">
                      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-extrabold">
                        <span className="flex items-center gap-1">
                          {isLocked ? (
                            <LockKeyhole className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          {isLocked
                            ? `${requiredXP - xp} more XP to unlock`
                            : `${completedStages} / ${stageCount} stages`}
                        </span>

                        {!isLocked && <span>{progress}%</span>}
                      </div>

                      <div
                        className={`h-2.5 overflow-hidden rounded-full ${
                          isLocked ? "bg-slate-300" : "bg-black/20"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLocked ? "bg-slate-400" : ""
                          }`}
                          style={{
                            width: `${isLocked ? 0 : progress}%`,
                            ...(isLocked
                              ? {}
                              : { backgroundColor: color.progress }),
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-300/80 px-3 py-2 text-[10px] font-black text-slate-600">
                          <LockKeyhole className="h-3 w-3" />
                          NEED {requiredXP} XP
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => openRoadmap(roadmap.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-white/90 active:translate-y-px"
                          >
                            {isCompleted
                              ? "Review"
                              : completedStages > 0
                                ? "Continue"
                                : "Start quest"}
                            <ArrowRight className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() =>
                              setExpandedId(
                                expanded ? null : roadmap.id
                              )
                            }
                            aria-expanded={expanded}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-black uppercase tracking-wide text-white/90 hover:bg-white/10"
                          >
                            Details
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${
                                expanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Illustration */}
                  <div className="relative flex w-[34%] shrink-0 items-center justify-center sm:w-[36%]">
                    <div
                      className="absolute inset-2 rounded-2xl"
                      style={{
                        backgroundColor: isLocked
                          ? "rgba(148, 163, 184, 0.25)"
                          : color.soft,
                      }}
                    />

                    {roadmap.imageUrl ? (
                      <img
                        src={roadmap.imageUrl}
                        alt=""
                        className={`relative z-10 max-h-32 w-full object-contain p-1 sm:max-h-36 ${
                          isLocked
                            ? "grayscale opacity-50"
                            : "drop-shadow-md"
                        }`}
                      />
                    ) : (
                      <div
                        className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl ${
                          isLocked
                            ? "bg-slate-300 text-slate-500"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {isLocked ? (
                          <LockKeyhole className="h-9 w-9" />
                        ) : isCompleted ? (
                          <Trophy className="h-10 w-10" />
                        ) : (
                          <BookOpen className="h-10 w-10" />
                        )}
                      </div>
                    )}

                    
                    {isCompleted && (
                      <div className="absolute bottom-3 right-3 z-20">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-300 bg-gradient-to-b from-lime-300 via-green-400 to-green-600 shadow-[0_4px_0_#15803d,0_6px_10px_rgba(0,0,0,0.25)]">
                          {/* Glossy top shine */}
                          <div className="absolute left-1 top-1 h-2 w-3 -rotate-12 rounded-full bg-white/70 blur-[1px]" />

                          {/* Checkmark */}
                          <Check className="relative z-10 mt-0.5 h-5 w-5 stroke-[4] text-white drop-shadow-[0_2px_1px_rgba(0,80,30,0.65)]" />
                        </div>
                      </div>
                    )}


                    {isLocked && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="rounded-full bg-slate-500/80 p-3 text-white shadow-md">
                          <LockKeyhole className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable details */}
                {expanded && !isLocked && (
                  <div className="border-t border-white/20 bg-black/10 px-4 py-4 sm:px-5">
                    <p className="text-sm font-semibold leading-6 text-white/95">
                      {roadmap.description ||
                        `Explore ${stageCount} stages and earn ${XP_PER_STAGE} XP for every stage you complete.`}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-lg bg-white/15 px-3 py-2">
                        <BookOpen className="mr-1 inline h-3.5 w-3.5" />
                        {stageCount} stages
                      </span>
                      <span className="rounded-lg bg-white/15 px-3 py-2">
                        <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                        10 XP per stage
                      </span>
                    </div>

                    {isCompleted && (
                      <button
                        onClick={() => openEvaluation(roadmap.id)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-yellow-950 shadow-[0_3px_0_#ca8a04] transition hover:bg-yellow-200 active:translate-y-px active:shadow-none"
                      >
                        <Trophy className="h-4 w-4" />
                        Take evaluation
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs font-semibold leading-5 text-slate-400">
        Keep going! Complete each adventure to unlock the next one.
      </p>
    </main>
  )
}

