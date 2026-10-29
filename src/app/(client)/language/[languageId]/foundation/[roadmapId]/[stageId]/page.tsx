// "use client";

// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Loader2,
//   X,
//   CheckCircle2,
//   AlertCircle,
//   Timer,
// } from "lucide-react";
// import {
//   StageData,
//   StageMaterialRenderer,
// } from "@/components/global/client/foundation/StageMaterialRenderer";
// import { GlassError } from "@/components/ui/glass-error";
// import { GlassLoading } from "@/components/ui/glass-loading";

// const TOTAL_STAGES = 25;

// type StageApiResponse = {
//   stage: StageData;
//   nextStageId: string | null;
// };

// function formatDuration(ms: number) {
//   const totalSeconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;

//   return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
// }

// export default function StageLessonPage() {
//   const params = useParams();
//   const router = useRouter();

//   const languageId = params?.languageId as string;
//   const roadmapId = params?.roadmapId as string;
//   const stageId = params?.stageId as string;

//   const [stage, setStage] = useState<StageData | null>(null);
//   const [nextStageId, setNextStageId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [elapsedMs, setElapsedMs] = useState(0);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [wrongAttempts, setWrongAttempts] = useState(0);

//   const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
//     useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const startedAtRef = useRef<number | null>(null);

//   // Load the current stage and the next stage ID.
//   useEffect(() => {
//     const controller = new AbortController();

//     async function fetchStage() {
//       if (!languageId || !roadmapId || !stageId) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setStage(null);
//       setNextStageId(null);
//       setElapsedMs(0);
//       setIsSubmitted(false);
//       setIsCurrentAnswerCorrect(false);
//       setIsNavigating(false);
//       startedAtRef.current = null;

//       try {
//         const response = await fetch(
//           `/api/client/languages/${languageId}/roadmaps/${roadmapId}/stages/${stageId}`,
//           { signal: controller.signal }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to load stage.");
//         }

//         const data: StageApiResponse = await response.json();

//         if (controller.signal.aborted) return;

//         setStage(data.stage);
//         setNextStageId(data.nextStageId);

//         // Start the timer when the stage is ready.
//         startedAtRef.current = Date.now();

//         // Prefetch the next stage's page for a smoother transition.
//         if (data.nextStageId) {
//           router.prefetch(
//             `/language/${languageId}/foundation/${roadmapId}/${data.nextStageId}`
//           );
//         }
//       } catch (error) {
//         if (!controller.signal.aborted) {
//           console.error("Failed to load stage:", error);
//         }
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     }

//     void fetchStage();

//     return () => controller.abort();
//   }, [languageId, roadmapId, stageId, router]);

//   // Update the visible timer while the stage is active.
//   useEffect(() => {
//     if (!stage || startedAtRef.current === null) return;

//     const interval = setInterval(() => {
//       if (startedAtRef.current !== null) {
//         setElapsedMs(Date.now() - startedAtRef.current);
//       }
//     }, 250);

//     return () => clearInterval(interval);
//   }, [stage, stageId]);

//   const handleCheckAnswer = () => {
//     setIsSubmitted(true);
//   };

//   const handleRetry = () => {
//     setWrongAttempts((prev) => prev + 1);
//     setIsSubmitted(false);
//     setIsCurrentAnswerCorrect(false);
//   };

//   const handleNextStage = useCallback(async () => {
//     if (!stage || !isCurrentAnswerCorrect || isNavigating) return;

//     setIsNavigating(true);

//     const durationMs = Math.max(
//       0,
//       Date.now() - (startedAtRef.current ?? Date.now())
//     );

//     try {
//       const response = await fetch(
//         `/api/client/languages/${languageId}/roadmaps/${roadmapId}/stages/${stageId}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             action: "complete",
//             durationMs,
//             wrongAttempts,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to save stage progress.");
//       }

//       if (nextStageId) {
//         router.push(
//           `/language/${languageId}/foundation/${roadmapId}/${nextStageId}`
//         );
//       } else {
//         router.push(`/language/${languageId}/foundation/${roadmapId}`);
//       }
//     } catch (error) {
//       console.error("Failed to save stage play:", error);
//       setIsNavigating(false);
//     }
//   }, [
//     stage,
//     isCurrentAnswerCorrect,
//     isNavigating,
//     wrongAttempts,
//     languageId,
//     roadmapId,
//     stageId,
//     nextStageId,
//     router,
//   ]);

//   const handleExit = () => {
//     router.push(`/language/${languageId}/foundation/${roadmapId}`);
//   };

//   if (loading) {
//     return (
//       <GlassLoading message="Setting up your lesson, get ready!" />
//     );
//   }

//   if (!stage) {
//     return (
//       <GlassError
//         title="Stage data couldn't be loaded"
//         description="Something went wrong loading this stage. Please try again."
//         primaryAction={{
//           label: "Exit Lesson",
//           onClick:handleExit
//         }}
//       />
//     );
//   }

//   // Assumes stage order is zero-based: 0 through 24.
//   const stageNumber = Math.min(
//     TOTAL_STAGES,
//     Math.max(1, stage.order + 1)
//   );

//   const progressPercentage = (stageNumber / TOTAL_STAGES) * 100;

//   return (
//     <div className="h-full flex flex-col justify-between select-none">
//       {/* Lesson Navigation Header */}
//       <header className="max-w-2xl w-full mx-auto px-6 pt-6 flex items-center gap-4">
//         <button
//           onClick={handleExit}
//           className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
//           aria-label="Close lesson"
//         >
//           <X className="w-6 h-6 stroke-[3]" />
//         </button>

//         {/* Progress */}
//         <div className="flex-1 min-w-0">
//           <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
//             <span>
//               Stage {stageNumber} of {TOTAL_STAGES}
//             </span>
//             <span>{Math.round(progressPercentage)}%</span>
//           </div>

//           <div
//             className="h-3 bg-slate-100 rounded-full overflow-hidden"
//             role="progressbar"
//             aria-label="Lesson progress"
//             aria-valuemin={0}
//             aria-valuemax={TOTAL_STAGES}
//             aria-valuenow={stageNumber}
//           >
//             <div
//               className="h-full bg-green-500 rounded-full transition-[width] duration-500 ease-out"
//               style={{ width: `${progressPercentage}%` }}
//             />
//           </div>
//         </div>

//         {/* Elapsed time */}
//         <div
//           className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-600 font-bold tabular-nums"
//           aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
//           title="Time spent on this stage"
//         >
//           <Timer className="w-4 h-4 shrink-0" />
//           <span>{formatDuration(elapsedMs)}</span>
//         </div>
//       </header>

//       {/* Stage Material */}
//       <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center py-6">
//         <StageMaterialRenderer
//           stage={stage}
//           onAnswerChange={setIsCurrentAnswerCorrect}
//         />
//       </main>

//       {/* Answer Feedback & Submit Footer */}
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
//       >
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
//               onClick={handleCheckAnswer}
//               className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto cursor-pointer"
//             >
//               Check
//             </button>
//           ) : (
//             <button
//               onClick={
//                 isCurrentAnswerCorrect ? handleNextStage : handleRetry
//               }
//               disabled={isNavigating}
//               className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
//                 isCurrentAnswerCorrect
//                   ? "bg-green-500 hover:bg-green-400 shadow-green-600"
//                   : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
//               }`}
//             >
//               {isNavigating ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Saving...
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
//   );
// }

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react";

import {
  StageData,
  StageMaterialRenderer,
} from "@/components/global/client/foundation/StageMaterialRenderer";
import { GlassError } from "@/components/ui/glass-error";
import { GlassLoading } from "@/components/ui/glass-loading";

const TOTAL_STAGES = 25;

type StageApiResponse = {
  stage: StageData;
  nextStageId: string | null;
};

type CompleteStageVariables = {
  durationMs: number;
  wrongAttempts: number;
};

async function fetchStage(
  languageId: string,
  roadmapId: string,
  stageId: string,
  signal: AbortSignal
): Promise<StageApiResponse> {
  const response = await fetch(
    `/api/client/languages/${encodeURIComponent(languageId)}/roadmaps/${encodeURIComponent(roadmapId)}/stages/${encodeURIComponent(stageId)}`,
    { signal }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error ?? `Failed to load stage (${response.status}).`
    );
  }

  if (!result?.stage) {
    throw new Error("The server returned an invalid stage response.");
  }

  return {
    stage: result.stage,
    nextStageId: result.nextStageId ?? null,
  };
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function StageLessonPage() {
  const params = useParams<{
    languageId: string;
    roadmapId: string;
    stageId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const languageId = params.languageId;
  const roadmapId = params.roadmapId;
  const stageId = params.stageId;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
    useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const startedAtRef = useRef<number | null>(null);

  // Fetch and cache the current stage.
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stage", languageId, roadmapId, stageId],
    queryFn: ({ signal }) =>
      fetchStage(languageId, roadmapId, stageId, signal),
    enabled: Boolean(languageId && roadmapId && stageId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const stage = data?.stage ?? null;
  const nextStageId = data?.nextStageId ?? null;

  // Reset lesson-specific state when a different stage loads.
  useEffect(() => {
    if (!stage) return;

    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setWrongAttempts(0);
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);

    if (nextStageId) {
      router.prefetch(
        `/language/${languageId}/foundation/${roadmapId}/${nextStageId}`
      );
    }
  }, [
    stage?.id,
    nextStageId,
    languageId,
    roadmapId,
    router,
  ]);

  // Update the visible timer while the lesson is active.
  useEffect(() => {
    if (!stage || startedAtRef.current === null) return;

    const interval = setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [stage?.id]);

  // Save completion only when the user chooses to continue.
  const completeStageMutation = useMutation({
    mutationFn: async ({
      durationMs,
      wrongAttempts,
    }: CompleteStageVariables) => {
      const response = await fetch(
        `/api/client/languages/${encodeURIComponent(languageId)}/roadmaps/${encodeURIComponent(roadmapId)}/stages/${encodeURIComponent(stageId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "complete",
            durationMs,
            wrongAttempts,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ??
            `Failed to save stage progress (${response.status}).`
        );
      }

      return result;
    },
    onSuccess: () => {
      // Refresh cached roadmap progress when it is next viewed.
      void queryClient.invalidateQueries({
        queryKey: ["roadmap-stages", languageId, roadmapId],
      });
    },
  });

  const handleCheckAnswer = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  const handleRetry = useCallback(() => {
    setWrongAttempts((previous) => previous + 1);
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);
  }, []);

  const handleNextStage = useCallback(async () => {
    if (
      !stage ||
      !isCurrentAnswerCorrect ||
      completeStageMutation.isPending
    ) {
      return;
    }

    const durationMs = Math.max(
      0,
      Date.now() - (startedAtRef.current ?? Date.now())
    );

    try {
      await completeStageMutation.mutateAsync({
        durationMs,
        wrongAttempts,
      });

      if (nextStageId) {
        router.push(
          `/language/${languageId}/foundation/${roadmapId}/${nextStageId}`
        );
      } else {
        router.push(
          `/language/${languageId}/foundation/${roadmapId}`
        );
      }
    } catch (error) {
      console.error("Failed to save stage progress:", error);
    }
  }, [
    stage,
    isCurrentAnswerCorrect,
    completeStageMutation,
    wrongAttempts,
    nextStageId,
    languageId,
    roadmapId,
    router,
  ]);

  const handleExit = useCallback(() => {
    router.push(`/language/${languageId}/foundation/${roadmapId}`);
  }, [router, languageId, roadmapId]);

  if (!languageId || !roadmapId || !stageId) {
    return (
      <GlassError
        title="Invalid lesson"
        description="The language, roadmap, or stage ID is missing."
        primaryAction={{
          label: "Exit Lesson",
          onClick: () => router.push("/language"),
        }}
      />
    );
  }

  if (isPending) {
    return (
      <GlassLoading message="Setting up your lesson, get ready!" />
    );
  }

  if (isError || !stage) {
    return (
      <GlassError
        title="Stage data couldn't be loaded"
        description={
          error instanceof Error
            ? error.message
            : "Something went wrong loading this stage. Please try again."
        }
        primaryAction={{
          label: "Try again",
          onClick: () => {
            void refetch();
          },
        }}
      />
    );
  }

  const isNavigating = completeStageMutation.isPending;

  // Assumes stage order is zero-based: 0 through 24.
  const stageNumber = Math.min(
    TOTAL_STAGES,
    Math.max(1, stage.order + 1)
  );

  const progressPercentage = (stageNumber / TOTAL_STAGES) * 100;

  return (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Lesson Navigation Header */}
      <header className="max-w-2xl w-full mx-auto px-6 pt-6 flex items-center gap-4">
        <button
          onClick={handleExit}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          aria-label="Close lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
            <span>
              Stage {stageNumber} of {TOTAL_STAGES}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>

          <div
            className="h-3 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuemin={0}
            aria-valuemax={TOTAL_STAGES}
            aria-valuenow={stageNumber}
          >
            <div
              className="h-full bg-green-500 rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Elapsed time */}
        <div
          className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-600 font-bold tabular-nums"
          aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
          title="Time spent on this stage"
        >
          <Timer className="w-4 h-4 shrink-0" />
          <span>{formatDuration(elapsedMs)}</span>
        </div>
      </header>

      {/* Stage Material */}
      <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center py-6">
        <StageMaterialRenderer
          stage={stage}
          onAnswerChange={setIsCurrentAnswerCorrect}
        />
      </main>

      {/* Answer Feedback & Submit Footer */}
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
              onClick={handleCheckAnswer}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto cursor-pointer"
            >
              Check
            </button>
          ) : (
            <button
              onClick={
                isCurrentAnswerCorrect
                  ? handleNextStage
                  : handleRetry
              }
              disabled={isNavigating}
              className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                isCurrentAnswerCorrect
                  ? "bg-green-500 hover:bg-green-400 shadow-green-600"
                  : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
              }`}
            >
              {isNavigating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : isCurrentAnswerCorrect ? (
                "Continue"
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
