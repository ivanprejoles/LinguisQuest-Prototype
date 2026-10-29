// "use client"

// import React, { useCallback, useEffect, useRef, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { useQuery } from "@tanstack/react-query"
// import {
//   Loader2,
//   X,
//   CheckCircle2,
//   AlertCircle,
//   Timer,
// } from "lucide-react"

// import {
//   type StageData,
//   StageMaterialRenderer,
// } from "@/components/global/client/foundation/StageMaterialRenderer"
// import { GlassLoading } from "@/components/ui/glass-loading"
// import { GlassError } from "@/components/ui/glass-error"

// type StageId = {
//   id: string
// }

// type EvaluationApiResponse = {
//   stage: StageData
//   stageIds?: StageId[]
// }

// function formatDuration(ms: number) {
//   const totalSeconds = Math.floor(ms / 1000)
//   const minutes = Math.floor(totalSeconds / 60)
//   const seconds = totalSeconds % 60

//   return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
// }

// export default function EvaluationPage() {
//   const params = useParams()
//   const router = useRouter()

//   const languageId = params?.languageId as string
//   const roadmapId = params?.roadmapId as string

//   // null means the initial request should select a random stage.
//   const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
//   const [stageIds, setStageIds] = useState<StageId[]>([])

//   const [elapsedMs, setElapsedMs] = useState(0)
//   const [isNavigating, setIsNavigating] = useState(false)
//   const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
//     useState(false)
//   const [isSubmitted, setIsSubmitted] = useState(false)

//   const startedAtRef = useRef<number | null>(null)

//   const evaluationQuery = useQuery<EvaluationApiResponse, Error>({
//     queryKey: [
//       "evaluation-stage",
//       languageId,
//       roadmapId,
//       selectedStageId,
//     ],
//     enabled: Boolean(languageId && roadmapId),
//     queryFn: async ({ signal }) => {
//       const query = selectedStageId
//         ? `?stageId=${encodeURIComponent(selectedStageId)}`
//         : ""

//       const response = await fetch(
//         `/api/client/languages/${encodeURIComponent(languageId)}` +
//           `/roadmaps/${encodeURIComponent(roadmapId)}/evaluation${query}`,
//         { signal },
//       )

//       if (!response.ok) {
//         const result = await response.json().catch(() => null)
//         throw new Error(
//           result?.error ?? "Failed to load evaluation stage.",
//         )
//       }

//       return (await response.json()) as EvaluationApiResponse
//     },
//   })

//   const stage = evaluationQuery.data?.stage ?? null

//   // The API returns the ID pool on the initial request only.
//   useEffect(() => {
//     const ids = evaluationQuery.data?.stageIds

//     if (ids) {
//       setStageIds(ids)
//     }
//   }, [evaluationQuery.data?.stageIds])

//   // Reset the answer state and timer for each new stage.
//   useEffect(() => {
//     if (!stage) return

//     startedAtRef.current = Date.now()
//     setElapsedMs(0)
//     setIsSubmitted(false)
//     setIsCurrentAnswerCorrect(false)
//     setIsNavigating(false)
//   }, [stage?.id])

//   // Keep the timer running while the current stage is displayed.
//   useEffect(() => {
//     if (!stage) return

//     const interval = window.setInterval(() => {
//       if (startedAtRef.current !== null) {
//         setElapsedMs(Date.now() - startedAtRef.current)
//       }
//     }, 250)

//     return () => window.clearInterval(interval)
//   }, [stage?.id])

//   const handleCheckAnswer = () => {
//     setIsSubmitted(true)
//   }

//   const handleRetry = () => {
//     setIsSubmitted(false);
//     setIsCurrentAnswerCorrect(false);
//     };

//   const handleNextStage = useCallback(() => {
//     if (
//         !stage ||
//         !isCurrentAnswerCorrect ||
//         isNavigating ||
//         stageIds.length === 0
//     ) {
//         return;
//     }

//     setIsNavigating(true);

//     // Choose another stage without saving evaluation progress.
//     const candidates = stageIds.filter(
//         (item) => item.id !== stage.id,
//     );

//     const pool = candidates.length > 0 ? candidates : stageIds;
//     const randomStage = pool[Math.floor(Math.random() * pool.length)];

//     // Changing the query key loads the next evaluation stage.
//     setSelectedStageId(randomStage.id);
//     }, [stage, isCurrentAnswerCorrect, isNavigating, stageIds]);

//   const handleExit = () => {
//     router.push(
//       `/language/${encodeURIComponent(languageId)}/foundation/${encodeURIComponent(roadmapId)}`,
//     )
//   }

//   if (evaluationQuery.isPending || !stage) {
//     if (evaluationQuery.isError) {
//       return (
//         <GlassError
//             title="Unable to Load Evaluation"
//             description={
//                 evaluationQuery.error.message ||
//                 "Something went wrong while loading your evaluation. Please try again."
//             }
//             primaryAction={{
//                 label: "Try Again",
//                 onClick: () => void evaluationQuery.refetch(),
//             }}
//             secondaryAction={{
//                 label: "Exit Evaluation",
//                 onClick: handleExit,
//             }}
//         />
//       )
//     }

//     return (
//           <GlassLoading message="Preparing your evaluation..." />
//     );
//   }

//   return (
//     <div className="h-full flex flex-col justify-between select-none">
//       {/* Evaluation header */}
//       <header className="max-w-2xl w-full mx-auto px-6 pt-6 flex items-center gap-4">
//         <button
//           type="button"
//           onClick={handleExit}
//           className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
//           aria-label="Close evaluation"
//         >
//           <X className="w-6 h-6 stroke-[3]" />
//         </button>

//         <div className="flex-1 min-w-0">
//           <p className="text-xs font-bold uppercase tracking-widest text-green-600">
//             Evaluation
//           </p>
//           <h1 className="text-lg font-black text-slate-800">
//             Test your knowledge
//           </h1>
//         </div>

//         <div
//           className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-600 font-bold tabular-nums"
//           aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
//           title="Time spent on this stage"
//         >
//           <Timer className="w-4 h-4 shrink-0" />
//           <span>{formatDuration(elapsedMs)}</span>
//         </div>
//       </header>

//       {/* Current stage */}
//       <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center py-6">
//         <StageMaterialRenderer
//           key={stage.id}
//           stage={stage}
//           onAnswerChange={setIsCurrentAnswerCorrect}
//         />
//       </main>

//       {/* Answer feedback and controls */}
//       <footer
//         className={`w-full py-6 px-6 transition-all border-slate-500 border-t duration-200 ${
//             isSubmitted
//             ? `backdrop-blur-xl border-t ${
//                 isCurrentAnswerCorrect
//                     ? "bg-emerald-950/50 border-emerald-300/30"
//                     : "bg-rose-950/50 border-rose-300/30"
//                 }`
//             : ""
//         }`}
//     >
//         <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
//           {isSubmitted ? (
//             <div className="flex items-center gap-3">
//               {isCurrentAnswerCorrect ? (
//                 <>
//                   <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
//                   <div>
//                     <p className="font-black text-green-800 text-lg">
//                       Excellent!
//                     </p>
//                     <p className="text-xs font-bold text-green-600">
//                       Your answer is correct.
//                     </p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
//                   <div>
//                     <p className="font-black text-rose-800 text-lg">
//                       Not quite
//                     </p>
//                     <p className="text-xs font-bold text-rose-600">
//                       Check your response and try again.
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           ) : (
//             <div />
//           )}

//           {!isSubmitted ? (
//             <button
//               type="button"
//               onClick={handleCheckAnswer}
//               className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto cursor-pointer"
//             >
//               Check
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={
//                 isCurrentAnswerCorrect
//                   ? handleNextStage
//                   : handleRetry
//               }
//               disabled={isNavigating || evaluationQuery.isFetching}
//               className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
//                 isCurrentAnswerCorrect
//                   ? "bg-green-500 hover:bg-green-400 shadow-green-600"
//                   : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
//               }`}
//             >
//               {isNavigating || evaluationQuery.isFetching ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Loading...
//                 </span>
//               ) : isCurrentAnswerCorrect ? (
//                 "Continue"
//               ) : (
//                 "Retry"
//               )}
//             </button>
//           )}
//         </div>
//       </footer>
//     </div>
//   )
// }

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react";

import {
  type StageData,
  StageMaterialRenderer,
} from "@/components/global/client/foundation/StageMaterialRenderer";
import { GlassLoading } from "@/components/ui/glass-loading";
import { GlassError } from "@/components/ui/glass-error";

type StageId = {
  id: string;
};

type EvaluationApiResponse = {
  stage: StageData;
  stageIds?: StageId[];
};

const EVALUATION_STALE_TIME = 5 * 60 * 1000;

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();

  const languageId = params?.languageId as string;
  const roadmapId = params?.roadmapId as string;

  // null asks the API to choose the initial random stage.
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [stageIds, setStageIds] = useState<StageId[]>([]);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const evaluationQuery = useQuery<EvaluationApiResponse, Error>({
    queryKey: [
      "evaluation-stage",
      languageId,
      roadmapId,
      selectedStageId,
    ],
    enabled: Boolean(languageId && roadmapId),
    staleTime: EVALUATION_STALE_TIME,
    retry: 1,
    queryFn: async ({ signal }) => {
      const query = selectedStageId
        ? `?stageId=${encodeURIComponent(selectedStageId)}`
        : "";

      const response = await fetch(
        `/api/client/languages/${encodeURIComponent(languageId)}` +
          `/roadmaps/${encodeURIComponent(roadmapId)}/evaluation${query}`,
        { signal },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          result?.error ?? "Failed to load evaluation stage.",
        );
      }

      const data = (await response.json()) as EvaluationApiResponse;

      if (!data?.stage?.id) {
        throw new Error("The evaluation API returned invalid stage data.");
      }

      return data;
    },
  });

  const stage = evaluationQuery.data?.stage ?? null;

  // Keep the available stage IDs from the initial API response.
  useEffect(() => {
    const ids = evaluationQuery.data?.stageIds;

    if (ids) {
      setStageIds(ids);
    }
  }, [evaluationQuery.data?.stageIds]);

  // Reset answer state and start the timer for each new stage.
  useEffect(() => {
    if (!stage) return;

    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);
    setIsNavigating(false);
  }, [stage?.id]);

  // Update the elapsed time while a stage is displayed.
  useEffect(() => {
    if (!stage) return;

    const interval = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [stage?.id]);

  const handleCheckAnswer = () => {
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);
  };

  const handleNextStage = useCallback(() => {
    if (
      !stage ||
      !isCurrentAnswerCorrect ||
      isNavigating ||
      evaluationQuery.isFetching
    ) {
      return;
    }

    const uniqueStageIds = Array.from(
      new Set(stageIds.map((item) => item.id).filter(Boolean)),
    );

    const candidates = uniqueStageIds.filter((id) => id !== stage.id);

    // Avoid selecting the same stage again when alternatives exist.
    if (candidates.length === 0) {
      setIsNavigating(false);
      return;
    }

    const randomStageId =
      candidates[Math.floor(Math.random() * candidates.length)];

    setIsNavigating(true);
    setSelectedStageId(randomStageId);
  }, [
    stage,
    isCurrentAnswerCorrect,
    isNavigating,
    evaluationQuery.isFetching,
    stageIds,
  ]);

  const handleExit = () => {
    router.push(
      `/language/${encodeURIComponent(languageId)}/foundation/${encodeURIComponent(roadmapId)}`,
    );
  };

  if (!languageId || !roadmapId) {
    return (
      <GlassError
        title="Invalid Evaluation"
        description="The language or roadmap could not be identified."
        primaryAction={{
          label: "Go Back",
          onClick: handleExit,
        }}
      />
    );
  }

  if (evaluationQuery.isPending || (!stage && !evaluationQuery.isError)) {
    return <GlassLoading message="Preparing your evaluation..." />;
  }

  if (evaluationQuery.isError || !stage) {
    return (
      <GlassError
        title="Unable to Load Evaluation"
        description={
          evaluationQuery.error?.message ??
          "Something went wrong while loading your evaluation. Please try again."
        }
        primaryAction={{
          label: "Try Again",
          onClick: () => void evaluationQuery.refetch(),
        }}
        secondaryAction={{
          label: "Exit Evaluation",
          onClick: handleExit,
        }}
      />
    );
  }

  const uniqueStageIds = Array.from(
    new Set(stageIds.map((item) => item.id).filter(Boolean)),
  );

  const hasAnotherStage = uniqueStageIds.some((id) => id !== stage.id);

  return (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Evaluation header */}
      <header className="max-w-2xl w-full mx-auto px-6 pt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleExit}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          aria-label="Close evaluation"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600">
            Evaluation
          </p>
          <h1 className="text-lg font-black text-slate-800">
            Test your knowledge
          </h1>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-600 font-bold tabular-nums"
          aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
          title="Time spent on this stage"
        >
          <Timer className="w-4 h-4 shrink-0" />
          <span>{formatDuration(elapsedMs)}</span>
        </div>
      </header>

      {/* Current stage */}
      <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center py-6">
        <StageMaterialRenderer
          key={stage.id}
          stage={stage}
          onAnswerChange={setIsCurrentAnswerCorrect}
        />
      </main>

      {/* Answer feedback and controls */}
      <footer
        className={`w-full py-6 px-6 transition-all border-slate-500 border-t duration-200 ${
          isSubmitted
            ? `backdrop-blur-xl border-t ${
                isCurrentAnswerCorrect
                  ? "bg-emerald-950/50 border-emerald-300/30"
                  : "bg-rose-950/50 border-rose-300/30"
              }`
            : ""
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {isSubmitted ? (
            <div className="flex items-center gap-3">
              {isCurrentAnswerCorrect ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <p className="font-black text-green-800 text-lg">
                      Excellent!
                    </p>
                    <p className="text-xs font-bold text-green-600">
                      Your answer is correct.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-black text-rose-800 text-lg">
                      Not quite
                    </p>
                    <p className="text-xs font-bold text-rose-600">
                      Check your response and try again.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div />
          )}

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto cursor-pointer"
            >
              Check
            </button>
          ) : (
            <button
              type="button"
              onClick={
                isCurrentAnswerCorrect
                  ? handleNextStage
                  : handleRetry
              }
              disabled={
                isNavigating ||
                evaluationQuery.isFetching ||
                (isCurrentAnswerCorrect && !hasAnotherStage)
              }
              className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                isCurrentAnswerCorrect
                  ? "bg-green-500 hover:bg-green-400 shadow-green-600"
                  : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
              }`}
            >
              {isNavigating || evaluationQuery.isFetching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : isCurrentAnswerCorrect ? (
                hasAnotherStage ? "Continue" : "No More Stages"
              ) : (
                "Retry"
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
