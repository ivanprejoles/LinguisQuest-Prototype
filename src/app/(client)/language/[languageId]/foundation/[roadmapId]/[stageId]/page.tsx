// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
// import { StageData, StageMaterialRenderer } from "@/components/global/client/foundation/StageMaterialRenderer";

// export default function StageLessonPage() {
//   const params = useParams();
//   const router = useRouter();

//   const languageId = params?.languageId as string;
//   const roadmapId = params?.roadmapId as string;
//   const stageId = params?.stageId as string;

//   const [stage, setStage] = useState<StageData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   // States to manage answer checking and progress footer
//   const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
//     useState<boolean>(false);
//   const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

//   useEffect(() => {
//     async function fetchStage() {
//       if (!stageId) return;
//       try {
//         setLoading(true);
//         const res = await fetch(`/api/client/languages/${languageId}/roadmaps/${roadmapId}/stages/${stageId}`);
//         if (!res.ok) throw new Error("Stage not found");
//         const data: StageData = await res.json();
//         console.log(data)
//         setStage(data);
//       } catch (err) {
//         console.error("Failed to load stage data:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStage();
//   }, [stageId]);

//   const handleCheckAnswer = () => {
//     setIsSubmitted(true);
//   };

//   const handleNextStage = () => {
//     // Reset local verification state before routing or transitioning
//     setIsSubmitted(false);
//     setIsCurrentAnswerCorrect(false);

//     // Route back to language roadmap or next stage
//     router.push(`/foundation/${languageId}`);
//   };

//   const handleExit = () => {
//     router.push(`/foundation/${languageId}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
//       </div>
//     );
//   }

//   if (!stage) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
//         <p className="text-slate-600 font-bold">Stage data could not be loaded.</p>
//         <button
//           onClick={handleExit}
//           className="px-6 py-3 bg-slate-200 text-slate-800 rounded-2xl font-black"
//         >
//           Exit Lesson
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex flex-col justify-between select-none">
//       {/* Lesson Navigation Header */}
//       <header className="max-w-2xl w-full mx-auto px-6 py-6 flex items-center gap-4">
//         <button
//           onClick={handleExit}
//           className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
//           aria-label="Close lesson"
//         >
//           <X className="w-6 h-6 stroke-[3]" />
//         </button>

//         {/* Progress Bar */}
//         <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
//           <div className="h-full bg-green-500 rounded-full w-1/3 transition-all duration-300" />
//         </div>
//       </header>

//       {/* Main Material Socket Area */}
//       <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center py-6">
//         <StageMaterialRenderer
//           stage={stage}
//           onAnswerChange={(isCorrect) => setIsCurrentAnswerCorrect(isCorrect)}
//         />
//       </main>

//       {/* Answer Feedback & Submit Footer */}
//       <footer
//         className={`w-full py-6 px-6 border-t-2 transition-colors duration-200 ${
//           isSubmitted
//             ? isCurrentAnswerCorrect
//               ? "bg-green-100 border-green-300"
//               : "bg-rose-100 border-rose-300"
//             : "bg-white border-slate-200"
//         }`}
//       >
//         <div className="max-w-xl mx-auto flex items-center justify-between">
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
//               className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto"
//             >
//               Check
//             </button>
//           ) : (
//             <button
//               onClick={handleNextStage}
//               className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto ${
//                 isCurrentAnswerCorrect
//                   ? "bg-green-500 hover:bg-green-400 shadow-green-600"
//                   : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
//               }`}
//             >
//               Continue
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

const TOTAL_STAGES = 25;

type StageApiResponse = {
  stage: StageData;
  nextStageId: string | null;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function StageLessonPage() {
  const params = useParams();
  const router = useRouter();

  const languageId = params?.languageId as string;
  const roadmapId = params?.roadmapId as string;
  const stageId = params?.stageId as string;

  const [stage, setStage] = useState<StageData | null>(null);
  const [nextStageId, setNextStageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
    useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const startedAtRef = useRef<number | null>(null);

  // Load the current stage and the next stage ID.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchStage() {
      if (!languageId || !roadmapId || !stageId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setStage(null);
      setNextStageId(null);
      setElapsedMs(0);
      setIsSubmitted(false);
      setIsCurrentAnswerCorrect(false);
      setIsNavigating(false);
      startedAtRef.current = null;

      try {
        const response = await fetch(
          `/api/client/languages/${languageId}/roadmaps/${roadmapId}/stages/${stageId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load stage.");
        }

        const data: StageApiResponse = await response.json();

        if (controller.signal.aborted) return;

        setStage(data.stage);
        setNextStageId(data.nextStageId);

        // Start the timer when the stage is ready.
        startedAtRef.current = Date.now();

        // Prefetch the next stage's page for a smoother transition.
        if (data.nextStageId) {
          router.prefetch(
            `/language/${languageId}/foundation/${roadmapId}/${data.nextStageId}`
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load stage:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchStage();

    return () => controller.abort();
  }, [languageId, roadmapId, stageId, router]);

  // Update the visible timer while the stage is active.
  useEffect(() => {
    if (!stage || startedAtRef.current === null) return;

    const interval = setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [stage, stageId]);

  const handleCheckAnswer = () => {
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setWrongAttempts((prev) => prev + 1);
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);
  };

  const handleNextStage = useCallback(async () => {
    if (!stage || !isCurrentAnswerCorrect || isNavigating) return;

    setIsNavigating(true);

    const durationMs = Math.max(
      0,
      Date.now() - (startedAtRef.current ?? Date.now())
    );

    try {
      const response = await fetch(
        `/api/client/languages/${languageId}/roadmaps/${roadmapId}/stages/${stageId}`,
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

      if (!response.ok) {
        throw new Error("Failed to save stage progress.");
      }

      if (nextStageId) {
        router.push(
          `/language/${languageId}/foundation/${roadmapId}/${nextStageId}`
        );
      } else {
        router.push(`/language/${languageId}/foundation/${roadmapId}`);
      }
    } catch (error) {
      console.error("Failed to save stage play:", error);
      setIsNavigating(false);
    }
  }, [
    stage,
    isCurrentAnswerCorrect,
    isNavigating,
    wrongAttempts,
    languageId,
    roadmapId,
    stageId,
    nextStageId,
    router,
  ]);

  const handleExit = () => {
    router.push(`/language/${languageId}/foundation/${roadmapId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-slate-600 font-bold">
          Stage data could not be loaded.
        </p>

        <button
          onClick={handleExit}
          className="px-6 py-3 bg-slate-200 text-slate-800 rounded-2xl font-black"
        >
          Exit Lesson
        </button>
      </div>
    );
  }

  // Assumes stage order is zero-based: 0 through 24.
  const stageNumber = Math.min(
    TOTAL_STAGES,
    Math.max(1, stage.order + 1)
  );

  const progressPercentage = (stageNumber / TOTAL_STAGES) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      {/* Lesson Navigation Header */}
      <header className="max-w-2xl w-full mx-auto px-6 py-6 flex items-center gap-4">
        <button
          onClick={handleExit}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
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
        className={`w-full py-6 px-6 border-t-2 transition-colors duration-200 ${
          isSubmitted
            ? isCurrentAnswerCorrect
              ? "bg-green-100 border-green-300"
              : "bg-rose-100 border-rose-300"
            : "bg-white border-slate-200"
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
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto"
            >
              Check
            </button>
          ) : (
            <button
              onClick={
                isCurrentAnswerCorrect ? handleNextStage : handleRetry
              }
              disabled={isNavigating}
              className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto disabled:opacity-60 disabled:cursor-not-allowed ${
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
