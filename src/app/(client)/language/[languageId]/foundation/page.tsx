// "use client"

// import { useEffect, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import {
//   ArrowRight,
//   BookOpen,
//   Check,
//   CheckCircle2,
//   ChevronDown,
//   CircleHelp,
//   LockKeyhole,
//   RotateCcw,
//   Sparkles,
//   Trophy,
// } from "lucide-react"
// import { useUserStore } from "@/store/user/user-store"
// import { GlassLoading } from "@/components/ui/glass-loading"
// import { GlassError } from "@/components/ui/glass-error"


// interface Roadmap {
//   id: string
//   title: string
//   description: string | null
//   imageUrl: string | null
//   imageFileId: string | null
//   order: number
//   languageId: string
//   stageCount: number
// }


// export interface RoadmapResponse {
//   roadmaps: Roadmap[]
// }

// const XP_PER_ROADMAP = 250
// const XP_PER_STAGE = 10
// const STAGES_PER_ROADMAP = 25


// function getRoadmapColor(index: number) {
//   // Move around the color wheel with a large hue difference.
//   const hue = (index * 137.508 + 12) % 360

//   return {
//     background: `hsl(${hue}, 75%, 42%)`,
//     border: `hsl(${hue}, 80%, 32%)`,
//     shadow: `hsl(${hue}, 85%, 25%)`,
//     soft: `hsla(${hue}, 90%, 85%, 0.24)`,
//     progress: `hsl(${(hue + 55) % 360}, 95%, 72%)`,
//   }
// }


// export default function LanguageRoadmapPage() {
//   const params = useParams<{ languageId: string }>()
//   const router = useRouter()
//   const languageId = params.languageId

//   const user = useUserStore((state) => state.user)
//   const userStatus = useUserStore((state) => state.status)

//   const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [expandedId, setExpandedId] = useState<string | null>(null)

//   const xp = user?.xp ?? 0

//   useEffect(() => {
//     const controller = new AbortController()

//     async function fetchRoadmaps() {
//       if (!languageId) {
//         router.replace("/language")
//         return
//       }

//       setLoading(true)
//       setError(null)

//       try {
//         const response = await fetch(
//           `/api/client/languages/${languageId}/roadmaps`,
//           { signal: controller.signal }
//         )

//         if (response.status === 404) {
//           router.replace("/language")
//           return
//         }

//         if (!response.ok) {
//           throw new Error(
//             response.status === 401
//               ? "Please sign in to continue."
//               : "Unable to load roadmaps."
//           )
//         }

//         const result: RoadmapResponse = await response.json()

//         if (!controller.signal.aborted) {
//           setRoadmaps(
//             [...result.roadmaps].sort((a, b) => a.order - b.order)
//           )
//         }
//       } catch (err) {
//         if (controller.signal.aborted) return

//         console.error("Failed to fetch roadmaps:", err)
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Something went wrong."
//         )
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false)
//         }
//       }
//     }

//     void fetchRoadmaps()

//     return () => controller.abort()
//   }, [languageId, router])

//   function openRoadmap(roadmapId: string) {
//     router.push(
//       `/language/${languageId}/foundation/${roadmapId}`
//     )
//   }

//   function openEvaluation(roadmapId: string) {
//     router.push(
//       `/language/${languageId}/foundation/${roadmapId}/evaluation`
//     )
//   }

  
//   if (
//     loading ||
//     userStatus === "loading" ||
//     userStatus === "idle"
//   ) {
//     return (
//       <GlassLoading message="Getting your roadmaps ready..."/>
//     )
//   }

  
//   if (error || !user) {
//     return (
//       <GlassError
//         title="Unable to load your roadmaps"
//         description="This story could not be found."
//         primaryAction={{
//           label: "Back to Languages",
//           onClick: () => router.push("/language")
//         }}
//       />
//     )
//   }


//   // const completedCount = Math.min(
//   //   roadmaps.length,
//   //   Math.floor(xp / XP_PER_ROADMAP)
//   // )
//   const completedCount = roadmaps.filter((roadmap, index) => {
//     const requiredXP = roadmaps
//       .slice(0, index)
//       .reduce(
//         (total, item) =>
//           total +
//           Math.min(25, Math.max(0, item.stageCount ?? 0)) *
//             XP_PER_STAGE,
//         0
//       )

//     const stageCount = Math.min(
//       25,
//       Math.max(0, roadmap.stageCount ?? 0)
//     )

//     return (
//       stageCount > 0 &&
//       xp >= requiredXP + stageCount * XP_PER_STAGE
//     )
//   }).length

//   return (
//     <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
//       {/* Header */}
//       <section className="relative mb-7 overflow-hidden rounded-3xl border border-white/15 bg-[#10182A]/30 p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-7">
//         {/* Decorative glow */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
//         />
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
//         />

//         <div className="relative">
//           <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5">
//             <Sparkles className="h-3.5 w-3.5 text-amber-300" />
//             <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">
//               Your adventure begins
//             </span>
//           </div>

//           <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm sm:text-4xl">
//             Choose your next quest!
//           </h1>

//           <p className="mt-2 max-w-lg text-sm leading-6 text-slate-200/80 sm:text-base">
//             Learn step by step, earn XP, and unlock new adventures.
//           </p>

//           {/* Experience summary */}
//           <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:gap-4 sm:p-4">
//             <div className="flex min-w-0 items-center gap-3">
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-gradient-to-br from-amber-300 to-amber-600 text-[#211708] shadow-lg shadow-amber-950/20">
//                 <Trophy className="h-5 w-5" />
//               </div>

//               <div className="min-w-0">
//                 <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 sm:text-xs">
//                   Your experience
//                 </p>
//                 <p className="mt-0.5 truncate text-xl font-black tabular-nums text-amber-200 sm:text-2xl">
//                   {xp.toLocaleString()} <span className="text-sm font-bold">XP</span>
//                 </p>
//               </div>
//             </div>

//             <div className="flex min-w-0 items-center justify-end gap-3 border-l border-white/10 pl-3 text-right sm:pl-4">
//               <div className="min-w-0">
//                 <p className="text-xl font-black tabular-nums text-white sm:text-2xl">
//                   {completedCount}
//                   <span className="mx-1 text-slate-400">/</span>
//                   <span className="text-slate-300">{roadmaps.length}</span>
//                 </p>
//                 <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-xs">
//                   Quests completed
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>


//       {roadmaps.length === 0 ? (
//         <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
//           <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
//           <h2 className="font-black text-slate-700">
//             Your adventure starts soon!
//           </h2>
//           <p className="mt-2 text-sm text-slate-500">
//             No roadmaps have been added to this language yet.
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-5">
//           {roadmaps.map((roadmap, index) => {
//             const stageCount = Math.min( 25, Math.max(0, roadmap.stageCount ?? 0))
//             const requiredXP = roadmaps
//                                 .slice(0, index)
//                                 .reduce((total, item) => total + Math.min(25, Math.max(0, item.stageCount ?? 0)) * XP_PER_STAGE, 0)
//             const roadmapXP = Math.max(0, xp - requiredXP)
//             const completedStages = Math.min( stageCount,Math.floor(roadmapXP / XP_PER_STAGE))
//             const isLocked = xp < requiredXP
//             const isCompleted = stageCount > 0 && completedStages >= stageCount
//             const isCurrent = !isLocked && !isCompleted
//             const progress = stageCount > 0 ? Math.round((completedStages / stageCount) * 100) : 0

//             const color = getRoadmapColor(roadmap.order)
//             const expanded = expandedId === roadmap.id

//             return (
//               <article
//                 key={roadmap.id}
//                 style={
//                   isLocked
//                     ? undefined
//                     : {
//                         backgroundColor: color.background,
//                         borderColor: color.border,
//                         boxShadow: `0 5px 0 ${color.shadow}`,
//                       }
//                 }
//                 className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
//                   isLocked
//                     ? "border-slate-200 bg-slate-200 text-slate-500"
//                     : "text-white"
//                 }`}
//               >
//                 <div className="relative flex min-h-[178px]">
//                   <div className="relative z-10 flex min-w-0 flex-1 flex-col p-4 sm:p-5">
//                     <div className="mb-2 flex flex-wrap items-center gap-2">
//                       <span
//                         className={`text-[10px] font-black uppercase tracking-[0.16em] ${
//                           isLocked ? "text-slate-500" : "text-white/80"
//                         }`}
//                       >
//                         Section {index + 1}
//                       </span>

//                       {isCompleted && (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-extrabold">
//                           <CheckCircle2 className="h-3 w-3" />
//                           COMPLETED
//                         </span>
//                       )}

//                       {isCurrent && (
//                         <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-extrabold">
//                           IN PROGRESS
//                         </span>
//                       )}

//                       {isLocked && (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-slate-300/70 px-2 py-1 text-[10px] font-extrabold text-slate-600">
//                           <LockKeyhole className="h-3 w-3" />
//                           LOCKED
//                         </span>
//                       )}
//                     </div>

//                     <h2 className="max-w-[250px] text-lg font-black leading-tight sm:text-xl">
//                       {roadmap.title}
//                     </h2>

//                     <p
//                       className={`mt-1 line-clamp-2 max-w-[260px] text-xs font-semibold leading-5 ${
//                         isLocked ? "text-slate-500" : "text-white/80"
//                       }`}
//                     >
//                       {roadmap.description ||
//                         "A new adventure awaits. Keep learning and level up!"}
//                     </p>

//                     <div className="mt-4 max-w-[270px]">
//                       <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-extrabold">
//                         <span className="flex items-center gap-1">
//                           {isLocked ? (
//                             <LockKeyhole className="h-3 w-3" />
//                           ) : (
//                             <Check className="h-3 w-3" />
//                           )}
//                           {isLocked
//                             ? `${requiredXP - xp} more XP to unlock`
//                             : `${completedStages} / ${stageCount} stages`}
//                         </span>

//                         {!isLocked && <span>{progress}%</span>}
//                       </div>

//                       <div
//                         className={`h-2.5 overflow-hidden rounded-full ${
//                           isLocked ? "bg-slate-300" : "bg-black/20"
//                         }`}
//                       >
//                         <div
//                           className={`h-full rounded-full transition-all duration-500 ${
//                             isLocked ? "bg-slate-400" : ""
//                           }`}
//                           style={{
//                             width: `${isLocked ? 0 : progress}%`,
//                             ...(isLocked
//                               ? {}
//                               : { backgroundColor: color.progress }),
//                           }}
//                         />
//                       </div>
//                     </div>

//                     <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
//                       {isLocked ? (
//                         <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-300/80 px-3 py-2 text-[10px] font-black text-slate-600">
//                           <LockKeyhole className="h-3 w-3" />
//                           NEED {requiredXP} XP
//                         </span>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => openRoadmap(roadmap.id)}
//                             className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-white/90 active:translate-y-px cursor-pointer"
//                           >
//                             {isCompleted
//                               ? "Review"
//                               : completedStages > 0
//                                 ? "Continue"
//                                 : "Start quest"}
//                             <ArrowRight className="h-3 w-3" />
//                           </button>

//                           <button
//                             onClick={() =>
//                               setExpandedId(
//                                 expanded ? null : roadmap.id
//                               )
//                             }
//                             aria-expanded={expanded}
//                             className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-black uppercase tracking-wide text-white/90 hover:bg-white/10 cursor-pointer"
//                           >
//                             Details
//                             <ChevronDown
//                               className={`h-3 w-3 transition-transform ${
//                                 expanded ? "rotate-180" : ""
//                               }`}
//                             />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   {/* Illustration */}
//                   <div className="relative flex w-[34%] shrink-0 items-center justify-center sm:w-[36%]">
//                     <div
//                       className="absolute inset-2 rounded-2xl"
//                       style={{
//                         backgroundColor: isLocked
//                           ? "rgba(148, 163, 184, 0.25)"
//                           : color.soft,
//                       }}
//                     />

//                     {roadmap.imageUrl ? (
//                       <img
//                         src={roadmap.imageUrl}
//                         alt=""
//                         className={`relative z-10 max-h-32 w-full object-contain p-1 sm:max-h-36 ${
//                           isLocked
//                             ? "grayscale opacity-50"
//                             : "drop-shadow-md"
//                         }`}
//                       />
//                     ) : (
//                       <div
//                         className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl ${
//                           isLocked
//                             ? "bg-slate-300 text-slate-500"
//                             : "bg-white/20 text-white"
//                         }`}
//                       >
//                         {isLocked ? (
//                           <LockKeyhole className="h-9 w-9" />
//                         ) : isCompleted ? (
//                           <Trophy className="h-10 w-10" />
//                         ) : (
//                           <BookOpen className="h-10 w-10" />
//                         )}
//                       </div>
//                     )}

                    
//                     {isCompleted && (
//                       <div className="absolute bottom-3 right-3 z-20">
//                         <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-300 bg-gradient-to-b from-lime-300 via-green-400 to-green-600 shadow-[0_4px_0_#15803d,0_6px_10px_rgba(0,0,0,0.25)]">
//                           {/* Glossy top shine */}
//                           <div className="absolute left-1 top-1 h-2 w-3 -rotate-12 rounded-full bg-white/70 blur-[1px]" />

//                           {/* Checkmark */}
//                           <Check className="relative z-10 mt-0.5 h-5 w-5 stroke-[4] text-white drop-shadow-[0_2px_1px_rgba(0,80,30,0.65)]" />
//                         </div>
//                       </div>
//                     )}


//                     {isLocked && (
//                       <div className="absolute inset-0 z-20 flex items-center justify-center">
//                         <div className="rounded-full bg-slate-500/80 p-3 text-white shadow-md">
//                           <LockKeyhole className="h-5 w-5" />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Expandable details */}
//                 {expanded && !isLocked && (
//                   <div className="border-t border-white/20 bg-black/10 px-4 py-4 sm:px-5">
//                     <p className="text-sm font-semibold leading-6 text-white/95">
//                       {roadmap.description ||
//                         `Explore ${stageCount} stages and earn ${XP_PER_STAGE} XP for every stage you complete.`}
//                     </p>

//                     <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
//                       <span className="rounded-lg bg-white/15 px-3 py-2">
//                         <BookOpen className="mr-1 inline h-3.5 w-3.5" />
//                         {stageCount} stages
//                       </span>
//                       <span className="rounded-lg bg-white/15 px-3 py-2">
//                         <Sparkles className="mr-1 inline h-3.5 w-3.5" />
//                         10 XP per stage
//                       </span>
//                     </div>

//                     {isCompleted && (
//                       <button
//                         onClick={() => openEvaluation(roadmap.id)}
//                         className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-yellow-950 shadow-[0_3px_0_#ca8a04] transition hover:bg-yellow-200 active:translate-y-px active:shadow-none cursor-pointer"
//                       >
//                         <Trophy className="h-4 w-4" />
//                         Take evaluation
//                         <ArrowRight className="h-4 w-4" />
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </article>
//             )
//           })}
//         </div>
//       )}

//       <p className="mt-8 text-center text-xs font-semibold leading-5 text-slate-400">
//         Keep going! Complete each adventure to unlock the next one.
//       </p>
//     </main>
//   )
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  LockKeyhole,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useUserStore } from "@/store/user/user-store";
import { GlassLoading } from "@/components/ui/glass-loading";
import { GlassError } from "@/components/ui/glass-error";

interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageFileId: string | null;
  order: number;
  languageId: string;
  stageCount: number;
}

export interface RoadmapResponse {
  roadmaps: Roadmap[];
}

interface RoadmapProgress {
  roadmap: Roadmap;
  stageCount: number;
  requiredXP: number;
  completedStages: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
}

const XP_PER_STAGE = 10;
const MAX_STAGES_PER_ROADMAP = 25;

class RoadmapNotFoundError extends Error {}

async function fetchRoadmaps(
  languageId: string,
  signal: AbortSignal
): Promise<Roadmap[]> {
  const response = await fetch(
    `/api/client/languages/${encodeURIComponent(languageId)}/roadmaps`,
    { signal }
  );

  if (response.status === 404) {
    throw new RoadmapNotFoundError("Language not found.");
  }

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Please sign in to continue."
        : "Unable to load roadmaps. Please try again."
    );
  }

  const result: RoadmapResponse = await response.json();

  if (!Array.isArray(result.roadmaps)) {
    throw new Error("The server returned an invalid roadmap response.");
  }

  return [...result.roadmaps].sort((a, b) => a.order - b.order);
}

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

function getStageCount(count: number) {
  return Math.min(
    MAX_STAGES_PER_ROADMAP,
    Math.max(0, count || 0)
  );
}

export default function LanguageRoadmapPage() {
  const params = useParams<{ languageId: string }>();
  const router = useRouter();

  const languageId = params.languageId;

  const user = useUserStore((state) => state.user);
  const userStatus = useUserStore((state) => state.status);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const xp = Math.max(0, user?.xp ?? 0);

  const {
    data: roadmaps = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["roadmaps", languageId],
    queryFn: ({ signal }) => fetchRoadmaps(languageId, signal),
    enabled: Boolean(
      languageId && user && userStatus !== "loading" && userStatus !== "idle"
    ),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Redirect if the language doesn't exist.
  useEffect(() => {
    if (!languageId || error instanceof RoadmapNotFoundError) {
      router.replace("/language");
    }
  }, [languageId, error, router]);

  // Calculate every roadmap's XP requirements and progress once.
  const roadmapProgress = useMemo<RoadmapProgress[]>(() => {
    let requiredXP = 0;

    return roadmaps.map((roadmap) => {
      const stageCount = getStageCount(roadmap.stageCount);
      const roadmapRequiredXP = requiredXP;

      const earnedXP = Math.max(0, xp - roadmapRequiredXP);
      const completedStages = Math.min(
        stageCount,
        Math.floor(earnedXP / XP_PER_STAGE)
      );

      const isLocked = xp < roadmapRequiredXP;
      const isCompleted =
        stageCount > 0 && completedStages >= stageCount;

      const progress =
        stageCount > 0
          ? Math.round((completedStages / stageCount) * 100)
          : 0;

      // The next roadmap starts after this roadmap's XP requirement.
      requiredXP += stageCount * XP_PER_STAGE;

      return {
        roadmap,
        stageCount,
        requiredXP: roadmapRequiredXP,
        completedStages,
        isLocked,
        isCompleted,
        progress,
      };
    });
  }, [roadmaps, xp]);

  const completedCount = roadmapProgress.filter(
    (item) => item.isCompleted
  ).length;

  function openRoadmap(roadmapId: string) {
    router.push(
      `/language/${languageId}/foundation/${roadmapId}`
    );
  }

  function openEvaluation(roadmapId: string) {
    router.push(
      `/language/${languageId}/foundation/${roadmapId}/evaluation`
    );
  }

  if (
    !languageId ||
    userStatus === "loading" ||
    userStatus === "idle" ||
    (isPending && user)
  ) {
    return <GlassLoading message="Getting your roadmaps ready..." />;
  }

  if (!user) {
    return (
      <GlassError
        title="Sign in to continue"
        description="Please sign in to access your language roadmaps."
        primaryAction={{
          label: "Back to Languages",
          onClick: () => router.push("/language"),
        }}
      />
    );
  }

  if (error instanceof RoadmapNotFoundError) {
    return <GlassLoading message="Returning to languages..." />;
  }

  if (isError) {
    return (
      <GlassError
        title="Unable to load your roadmaps"
        description={
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        }
        primaryAction={{
          label: isFetching ? "Retrying..." : "Try Again",
          onClick: () => {
            void refetch();
          },
        }}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
      {/* Header */}
      <section className="relative mb-7 overflow-hidden rounded-3xl border border-white/15 bg-[#10182A]/30 p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
        />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200">
              Your adventure begins
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm sm:text-4xl">
            Choose your next quest!
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-200/80 sm:text-base">
            Learn step by step, earn XP, and unlock new adventures.
          </p>

          {/* Experience summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:gap-4 sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-gradient-to-br from-amber-300 to-amber-600 text-[#211708] shadow-lg shadow-amber-950/20">
                <Trophy className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 sm:text-xs">
                  Your experience
                </p>
                <p className="mt-0.5 truncate text-xl font-black tabular-nums text-amber-200 sm:text-2xl">
                  {xp.toLocaleString()}{" "}
                  <span className="text-sm font-bold">XP</span>
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-3 border-l border-white/10 pl-3 text-right sm:pl-4">
              <div className="min-w-0">
                <p className="text-xl font-black tabular-nums text-white sm:text-2xl">
                  {completedCount}
                  <span className="mx-1 text-slate-400">/</span>
                  <span className="text-slate-300">
                    {roadmaps.length}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-xs">
                  Quests completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {roadmapProgress.length === 0 ? (
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
          {roadmapProgress.map((item, index) => {
            const {
              roadmap,
              stageCount,
              requiredXP,
              completedStages,
              isLocked,
              isCompleted,
              progress,
            } = item;

            const isCurrent = !isLocked && !isCompleted;
            const color = getRoadmapColor(roadmap.order);
            const expanded = expandedId === roadmap.id;

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
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-white/90 active:translate-y-px"
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
                            aria-controls={`roadmap-details-${roadmap.id}`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-black uppercase tracking-wide text-white/90 hover:bg-white/10"
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
                        loading="lazy"
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
                          <div className="absolute left-1 top-1 h-2 w-3 -rotate-12 rounded-full bg-white/70 blur-[1px]" />
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
                  <div
                    id={`roadmap-details-${roadmap.id}`}
                    className="border-t border-white/20 bg-black/10 px-4 py-4 sm:px-5"
                  >
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
                        {XP_PER_STAGE} XP per stage
                      </span>
                    </div>

                    {isCompleted && (
                      <button
                        onClick={() => openEvaluation(roadmap.id)}
                        className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-yellow-950 shadow-[0_3px_0_#ca8a04] transition hover:bg-yellow-200 active:translate-y-px active:shadow-none"
                      >
                        <Trophy className="h-4 w-4" />
                        Take evaluation
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs font-semibold leading-5 text-slate-400">
        Keep going! Complete each adventure to unlock the next one.
      </p>
    </main>
  );
}