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

import { ElapsedTimer } from "@/components/global/ElapsedTimer";
import {
  StageData,
  StageMaterialRenderer,
} from "@/components/global/client/foundation/StageMaterialRenderer";
import { GlassError } from "@/components/ui/glass-error";
import { GlassLoading } from "@/components/ui/glass-loading";

const TOTAL_STAGES = 25;
const WRONG_FEEDBACK_DURATION = 1500;

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

  const [lessonStartedAt, setLessonStartedAt] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
    useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const startedAtRef = useRef<number | null>(null);
  const wrongFeedbackTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

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

    if (wrongFeedbackTimeoutRef.current) {
      clearTimeout(wrongFeedbackTimeoutRef.current);
      wrongFeedbackTimeoutRef.current = null;
    }

    const now = Date.now();

    startedAtRef.current = now;
    setLessonStartedAt(now);
    setWrongAttempts(0);
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);

    if (nextStageId) {
      router.prefetch(
        `/language/${languageId}/foundation/${roadmapId}/${nextStageId}`
      );
    }

    return () => {
      if (wrongFeedbackTimeoutRef.current) {
        clearTimeout(wrongFeedbackTimeoutRef.current);
        wrongFeedbackTimeoutRef.current = null;
      }
    };
  }, [
    stage?.id,
    nextStageId,
    languageId,
    roadmapId,
    router,
  ]);

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

  // Check the answer. Incorrect feedback resets automatically.
  const handleCheckAnswer = useCallback(() => {
    if (wrongFeedbackTimeoutRef.current) {
      clearTimeout(wrongFeedbackTimeoutRef.current);
      wrongFeedbackTimeoutRef.current = null;
    }

    setIsSubmitted(true);

    if (!isCurrentAnswerCorrect) {
      setWrongAttempts((previous) => previous + 1);

      wrongFeedbackTimeoutRef.current = setTimeout(() => {
        setIsSubmitted(false);
        wrongFeedbackTimeoutRef.current = null;
      }, WRONG_FEEDBACK_DURATION);
    }
  }, [isCurrentAnswerCorrect]);

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
          className="p-2 text-white hover:text-slate-400 rounded-xl transition-colors cursor-pointer"
          aria-label="Close lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex justify-between text-xs font-bold text-white">
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
        {lessonStartedAt !== null && (
          <ElapsedTimer startedAt={lessonStartedAt} />
        )}
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
            ? isCurrentAnswerCorrect
              ? "backdrop-blur-xl bg-emerald-950/50 border-emerald-300/30"
              : "backdrop-blur-xl bg-rose-950/50 border-rose-300/30"
            : ""
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {/* Answer feedback */}
          {isSubmitted ? (
            <div
              className="flex items-center gap-3"
              role="status"
              aria-live="polite"
            >
              {isCurrentAnswerCorrect ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                  <div>
                    <p className="font-black text-green-300 text-lg">
                      Excellent!
                    </p>
                    <p className="text-xs font-bold text-green-200">
                      Your answer is correct.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-rose-400 shrink-0 animate-pulse" />
                  <div>
                    <p className="font-black text-rose-300 text-lg">
                      Not quite!
                    </p>
                    <p className="text-xs font-bold text-rose-200">
                      Check your response and try again.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Check, feedback, or Continue button */}
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
                isCurrentAnswerCorrect ? handleNextStage : undefined
              }
              disabled={
                isNavigating ||
                (isSubmitted && !isCurrentAnswerCorrect)
              }
              aria-live="polite"
              className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto disabled:opacity-100 disabled:cursor-default ${
                isCurrentAnswerCorrect
                  ? "bg-green-500 hover:bg-green-400 shadow-green-600 cursor-pointer"
                  : "bg-rose-500 shadow-rose-600 wrong-answer-button"
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
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Not quite!
                </span>
              )}
            </button>
          )}
        </div>
      </footer>

      {/* Wrong-answer shake animation */}
      <style jsx>{`
        .wrong-answer-button {
          animation: wrong-shake 0.4s ease-in-out;
        }

        @keyframes wrong-shake {
          0%,
          100% {
            transform: translateX(0);
          }

          20%,
          60% {
            transform: translateX(-5px);
          }

          40%,
          80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
}
