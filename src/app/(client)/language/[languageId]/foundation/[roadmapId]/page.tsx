"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Crown,
  Gem,
  LockKeyhole,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { useUserStore } from "@/store/user/user-store";
import { GlassLoading } from "@/components/ui/glass-loading";
import { GlassError } from "@/components/ui/glass-error";

interface Stage {
  id: string;
  type: string;
  order: number;
  question: string;
  payload: unknown;
}

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageFileId?: string | null;
  order: number;
  languageId: string;
}

interface RoadmapResponse {
  roadmap: Roadmap;
  stages: Stage[];
  nextRoadmap: Roadmap | null;
  previousStageCount: number;
}

interface TransitionOrigin {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface GameTransition {
  title: string;
  href: string;
  origin: TransitionOrigin;
  accent: string;
}

class RoadmapFetchError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "RoadmapFetchError";
  }
}

const XP_PER_STAGE = 10;

const stageIcons = [Star, BookOpen, Gem, Trophy, Crown];

function getRoadmapColor(index: number) {
  const hue = (index * 137.508 + 12) % 360;

  return {
    background: `hsl(${hue}, 75%, 42%)`,
    border: `hsl(${hue}, 80%, 32%)`,
    shadow: `hsl(${hue}, 85%, 25%)`,
    soft: `hsla(${hue}, 90%, 85%, 0.24)`,
    progress: `hsl(${(hue + 55) % 360}, 95%, 72%)`,
  };
}

async function fetchRoadmapStages(
  languageId: string,
  roadmapId: string,
  signal: AbortSignal
): Promise<RoadmapResponse> {
  const response = await fetch(
    `/api/client/languages/${encodeURIComponent(languageId)}/roadmaps/${encodeURIComponent(roadmapId)}/stages`,
    { signal }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new RoadmapFetchError(
      result?.error ??
        (response.status === 401
          ? "Please sign in to continue."
          : `Failed to load roadmap (${response.status}).`),
      response.status
    );
  }

  if (
    !result?.roadmap ||
    !Array.isArray(result.stages)
  ) {
    throw new Error("The server returned an invalid roadmap response.");
  }

  
  return {
    roadmap: result.roadmap,
    stages: result.stages,
    nextRoadmap: result.nextRoadmap ?? null,
    previousStageCount: result.previousStageCount ?? 0,
  } as RoadmapResponse;
}

export default function RoadmapStagesPage() {
  const { languageId, roadmapId } = useParams<{
    languageId: string;
    roadmapId: string;
  }>();

  const router = useRouter();

  const user = useUserStore((state) => state.user);
  const userXp = Math.max(0, user?.xp ?? 0);

  const [transition, setTransition] =
    useState<GameTransition | null>(null);

  const [transitionExpanded, setTransitionExpanded] =
    useState(false);

  const transitionTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const animationFrames = useRef<number[]>([]);
  const transitionLock = useRef(false);

  // Fetch and cache this roadmap's stages.
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["roadmap-stages", languageId, roadmapId],
    queryFn: ({ signal }) =>
      fetchRoadmapStages(languageId, roadmapId, signal),
    enabled: Boolean(languageId && roadmapId),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof RoadmapFetchError &&
        [401, 403, 404].includes(error.status)
      ) {
        return false;
      }

      return failureCount < 1;
    },
  });

  // Clean up navigation timers and animation frames on unmount.
  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }

      animationFrames.current.forEach((frame) => {
        cancelAnimationFrame(frame);
      });
    };
  }, []);

  // Use one transition handler for stages and the next roadmap.
  const startTransition = useCallback(
    (
      title: string,
      href: string,
      element: HTMLButtonElement,
      accent: string
    ) => {
      if (transitionLock.current) return;

      transitionLock.current = true;

      const rect = element.getBoundingClientRect();

      setTransition({
        title,
        href,
        accent,
        origin: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
      });

      setTransitionExpanded(false);

      animationFrames.current.forEach((frame) => {
        cancelAnimationFrame(frame);
      });
      animationFrames.current = [];

      animationFrames.current.push(
        requestAnimationFrame(() => {
          animationFrames.current.push(
            requestAnimationFrame(() => {
              setTransitionExpanded(true);
            })
          );
        })
      );

      transitionTimer.current = setTimeout(() => {
        router.push(href);
      }, 760);
    },
    [router]
  );

  const handleStartStage = useCallback(
    (
      stage: Stage,
      element: HTMLButtonElement,
      accent: string
    ) => {
      if (!data) return;

      startTransition(
        `Stage ${stage.order + 1}`,
        `/language/${languageId}/foundation/${roadmapId}/${stage.id}`,
        element,
        accent
      );
    },
    [data, languageId, roadmapId, startTransition]
  );

  const handleEnterNextRoadmap = useCallback(
    (element: HTMLButtonElement, accent: string) => {
      const nextRoadmap = data?.nextRoadmap;

      if (!nextRoadmap) return;

      startTransition(
        nextRoadmap.title,
        `/language/${languageId}/foundation/${nextRoadmap.id}`,
        element,
        accent
      );
    },
    [data?.nextRoadmap, languageId, startTransition]
  );

  if (!languageId || !roadmapId) {
    return (
      <GlassError
        title="Invalid learning path"
        description="The language or roadmap ID is missing."
        primaryAction={{
          label: "Back to languages",
          onClick: () => router.push("/language"),
        }}
      />
    );
  }

  if (isPending) {
    return (
      <GlassLoading message="Preparing all the stages..." />
    );
  }

  if (isError || !data) {
    return (
      <GlassError
        title="Unable to load your stages"
        description={
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        }
        primaryAction={{
          label: isFetching ? "Retrying..." : "Try again",
          onClick: () => {
            void refetch();
          },
        }}
      />
    );
  }

  
  const { roadmap, stages } = data;
  const nextRoadmap = data.nextRoadmap;

  // Roadmap order starts at 0.
  const color = getRoadmapColor(roadmap.order);
  const totalStages = stages.length;

  // Use the actual number of stages in previous roadmaps.
  const previousStageCount = data.previousStageCount;

  const completedStageCount = Math.max(
    0,
    Math.min(
      totalStages,
      Math.floor(userXp / XP_PER_STAGE) -
        previousStageCount
    )
  );

  const isRoadmapCompleted =
    totalStages > 0 &&
    completedStageCount >= totalStages;

  const nextStageIndex = completedStageCount;

  const progressPercent =
    totalStages > 0
      ? Math.round(
          (completedStageCount / totalStages) * 100
        )
      : 0;


  return (
    <main className="relative mx-auto h-full w-full max-w-5xl overflow-hidden px-4 pb-20 pt-5 sm:px-6">
      {/* Roadmap header */}
      <header
        className="relative overflow-hidden rounded-2xl border-2 p-5 text-white"
        style={{
          backgroundColor: color.background,
          borderColor: color.border,
          boxShadow: `0 5px 0 ${color.shadow}`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 -top-8 h-32 w-32 rounded-full"
          style={{ backgroundColor: color.soft }}
        />

        <button
          type="button"
          onClick={() =>
            router.push(`/language/${languageId}/foundation`)
          }
          aria-label="Back to roadmaps"
          className="relative mb-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
              Learning path · Unit {roadmap.order + 1}
            </span>

            <h1 className="mt-1 text-2xl font-black leading-tight">
              {roadmap.title}
            </h1>

            {roadmap.description && (
              <p className="mt-2 max-w-sm text-xs font-semibold leading-5 text-white/85">
                {roadmap.description}
              </p>
            )}
          </div>

          {roadmap.imageUrl ? (
            <img
              src={roadmap.imageUrl}
              alt=""
              className="h-20 w-20 shrink-0 object-contain drop-shadow-lg sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <BookOpen className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-3 text-xs font-extrabold">
          <span>
            {isRoadmapCompleted
              ? "Roadmap completed!"
              : `${completedStageCount} / ${stages.length} stages completed`}
          </span>

          <span className="rounded-full bg-black/15 px-3 py-1">
            {userXp} XP
          </span>
        </div>

        <div
          className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-black/20"
          role="progressbar"
          aria-label="Roadmap progress"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: color.progress,
            }}
          />
        </div>

        {isRoadmapCompleted && (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/language/${languageId}/foundation/${roadmapId}/evaluation`
              )
            }
            className="relative mt-5 flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 px-4 py-3 text-left text-amber-950 shadow-[0_4px_0_#b45309] transition hover:brightness-110 active:translate-y-1 active:shadow-none"
          >
            <span className="absolute -right-2 -top-4 h-16 w-16 rounded-full bg-white/20 blur-xl" />

            <span className="relative flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/30 shadow-inner">
                <Trophy className="h-6 w-6" />
              </span>

              <span>
                <span className="block text-sm font-black">
                  Take the evaluation
                </span>
                <span className="block text-[11px] font-bold text-amber-950/75">
                  All {stages.length} stages completed!
                </span>
              </span>
            </span>

            <ArrowRight className="relative h-5 w-5" />
          </button>
        )}
      </header>

      {/* Stepping-stone learning path */}
      <section className="relative mt-8">
        <div className="mb-8 text-center">
          <span
            className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest"
            style={{
              backgroundColor: color.soft,
              color: color.background,
            }}
          >
            {isRoadmapCompleted
              ? "Adventure completed"
              : "Your adventure starts here"}
          </span>
        </div>

        {stages.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-9 w-9 text-slate-300" />
            <p className="font-bold text-slate-500">
              No stages in this roadmap yet.
            </p>
          </div>
        ) : (
          <div className="relative mx-auto flex max-w-sm flex-col items-center">
            {/* Dotted path */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 320 ${Math.max(stages.length * 116, 120)}`}
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d={stages
                  .map((_, index) => {
                    const x = 160 + Math.sin(index * 1.25) * 62;
                    const y = 45 + index * 116;

                    if (index === 0) return `M ${x} ${y}`;

                    const previousX =
                      160 + Math.sin((index - 1) * 1.25) * 62;
                    const previousY = 45 + (index - 1) * 116;
                    const middleY = (previousY + y) / 2;

                    return `Q ${previousX} ${middleY} ${x} ${y}`;
                  })
                  .join(" ")}
                stroke={color.border}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="3 10"
                opacity="0.22"
              />
            </svg>

            {stages.map((stage, index) => {
              const isCompleted = index < completedStageCount;

              const isCurrent =
                index === nextStageIndex &&
                !isRoadmapCompleted;

              const isLocked = !isCompleted && !isCurrent;
              const StageIcon = stageIcons[index % stageIcons.length];
              const xOffset = Math.sin(index * 1.25) * 62;

              return (
                <div
                  key={stage.id}
                  className="relative z-10 flex w-full flex-col items-center"
                  style={{
                    marginBottom:
                      index === stages.length - 1 ? 0 : 26,
                    transform: `translateX(${xOffset}px)`,
                  }}
                >
                  {index === 0 && !isRoadmapCompleted && (
                    <div className="relative mb-1">
                      <span
                        className="relative block rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
                        style={{
                          backgroundColor: color.background,
                        }}
                      >
                        Start
                      </span>

                      <div
                        className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
                        style={{
                          backgroundColor: color.background,
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(event) => {
                      if (isCurrent) {
                        handleStartStage(
                          stage,
                          event.currentTarget,
                          color.background
                        );
                      }
                    }}
                    disabled={!isCurrent || !!transition}
                    aria-label={
                      isCompleted
                        ? `Stage ${index + 1} completed`
                        : isLocked
                          ? `Stage ${index + 1} locked`
                          : `Start stage ${index + 1}`
                    }
                    className={`group relative flex h-[66px] w-[66px] items-center justify-center rounded-full border-[4px] transition-all duration-150 ${
                      isCompleted
                        ? "border-emerald-700 bg-gradient-to-b from-lime-300 to-green-500 text-white shadow-[0_6px_0_#15803d]"
                        : isLocked
                          ? "border-slate-200 bg-slate-200 text-slate-400 shadow-[0_5px_0_#cbd5e1] grayscale"
                          : "cursor-pointer text-white hover:brightness-110 active:translate-y-1 active:shadow-none"
                    }`}
                    style={
                      isCurrent
                        ? {
                            background: `linear-gradient(145deg, hsl(${(roadmap.order * 137.508 + 32) % 360}, 90%, 70%), ${color.background})`,
                            borderColor: color.border,
                            boxShadow: `0 6px 0 ${color.shadow}, 0 9px 12px rgba(0,0,0,0.12)`,
                          }
                        : undefined
                    }
                  >
                    {!isLocked && (
                      <>
                        <span className="absolute left-2 top-1.5 h-4 w-7 -rotate-45 rounded-full bg-white/40 blur-[1px]" />
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white/80" />
                      </>
                    )}

                    {isCompleted ? (
                      <Check className="relative z-10 h-7 w-7 stroke-[4] drop-shadow-[0_2px_1px_rgba(0,80,30,0.45)]" />
                    ) : isLocked ? (
                      <LockKeyhole className="h-6 w-6" />
                    ) : (
                      <StageIcon className="relative z-10 h-7 w-7 fill-white/20 stroke-[2.8] drop-shadow-sm" />
                    )}

                    <span
                      className={`absolute -bottom-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 px-1 text-[9px] font-black ${
                        isLocked
                          ? "border-slate-200 bg-slate-100 text-slate-400"
                          : "border-white bg-white text-slate-700"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </button>

                  <span
                    className={`mt-3 text-[10px] font-extrabold ${
                      isLocked
                        ? "text-slate-300"
                        : isCompleted
                          ? "text-emerald-600"
                          : "text-slate-500"
                    }`}
                  >
                    {isCompleted
                      ? "Completed!"
                      : isLocked
                        ? "Keep going!"
                        : "Begin your quest"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Next-roadmap portal */}
      {stages.length > 0 &&
        isRoadmapCompleted &&
        nextRoadmap && (
          <section className="relative mt-14 flex flex-col items-center pb-8">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Your next adventure awaits
            </p>

            <button
              type="button"
              onClick={(event) =>
                handleEnterNextRoadmap(
                  event.currentTarget,
                  getRoadmapColor(nextRoadmap.order).background
                )
              }
              disabled={!!transition}
              className="group relative flex cursor-pointer flex-col items-center gap-4 disabled:cursor-wait"
            >
              <span className="absolute top-2 h-24 w-24 animate-ping rounded-full bg-violet-400/20 [animation-duration:2.5s]" />

              <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-indigo-600 to-cyan-400 p-1 shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-110">
                <span className="absolute inset-1 animate-spin rounded-full border-2 border-dashed border-cyan-100/80 [animation-duration:8s]" />

                <span className="absolute inset-3 rounded-full bg-indigo-950 shadow-[inset_0_0_22px_rgba(34,211,238,0.7)]" />

                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 via-violet-400 to-fuchsia-500 shadow-[0_0_24px_rgba(103,232,249,0.8)]">
                  <Sparkles className="h-8 w-8 text-white drop-shadow-lg" />
                </span>
              </span>

              <span className="rounded-xl border-2 border-violet-300 bg-gradient-to-b from-violet-500 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-[0_4px_0_#3730a3] transition group-hover:brightness-110 active:translate-y-1 active:shadow-none">
                Enter {nextRoadmap.title}
              </span>
            </button>
          </section>
        )}

      {isRoadmapCompleted && !nextRoadmap && (
        <div className="mt-12 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-amber-500" />

          <h2 className="font-black text-amber-900">
            You've reached the end!
          </h2>

          <p className="mt-1 text-sm text-amber-800/75">
            Complete your evaluation to celebrate your progress.
          </p>
        </div>
      )}

      {/* Cinematic transition */}
      {transition && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Entering ${transition.title}`}
          className="fixed z-[100] overflow-hidden bg-[#080d20]"
          style={{
            left: transitionExpanded ? 0 : transition.origin.left,
            top: transitionExpanded ? 0 : transition.origin.top,
            width: transitionExpanded
              ? "100vw"
              : transition.origin.width,
            height: transitionExpanded
              ? "100dvh"
              : transition.origin.height,
            borderRadius: transitionExpanded ? 0 : 999,
            transition:
              "left 700ms cubic-bezier(0.16, 1, 0.3, 1), top 700ms cubic-bezier(0.16, 1, 0.3, 1), width 700ms cubic-bezier(0.16, 1, 0.3, 1), height 700ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 500ms ease",
            willChange: "left, top, width, height",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${transition.accent}, #312e81 35%, #080d20 72%)`,
              transform: transitionExpanded
                ? "scale(1.1)"
                : "scale(0.4)",
              transition: "transform 800ms ease-out",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, rgba(8,13,32,0.1) 30%, #080d20 80%)",
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 shadow-[0_0_60px_rgba(103,232,249,0.55)] backdrop-blur-sm"
              style={{
                transform: transitionExpanded
                  ? "scale(1)"
                  : "scale(0.5)",
                transition:
                  "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Sparkles className="h-10 w-10 animate-pulse" />
            </div>

            <h2 className="text-3xl font-black sm:text-5xl">
              {transition.title}
            </h2>

            <p className="mt-3 text-sm font-semibold text-white/70">
              Entering your adventure...
            </p>

            <div className="mt-7 h-1.5 w-36 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: transitionExpanded ? "100%" : "0%",
                  transition: "width 700ms ease-out",
                }}
              />
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 opacity-40 blur-2xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${transition.accent}, transparent)`,
              transform: transitionExpanded
                ? "translateX(450%) skewX(-12deg)"
                : "translateX(-150%) skewX(-12deg)",
              transition: "transform 800ms ease-out",
            }}
          />
        </div>
      )}
    </main>
  );
}