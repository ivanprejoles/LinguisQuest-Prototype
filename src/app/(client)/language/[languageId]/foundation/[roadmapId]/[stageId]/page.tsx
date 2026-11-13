"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

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
} from "lucide-react";

import { ElapsedTimer } from "@/components/global/ElapsedTimer";

import {
  StageData,
  StageMaterialRenderer,
} from "@/components/global/client/foundation/StageMaterialRenderer";

import { BonusRoundLayout } from "@/components/global/client/foundation/BonusRoundLayout";

import { GlassError } from "@/components/ui/glass-error";
import { GlassLoading } from "@/components/ui/glass-loading";

import {
  UserStageScore,
  useSrsStore,
} from "@/store/foundation/srs-store";

import { useUserStore } from "@/store/user/user-store";

const WRONG_FEEDBACK_DURATION = 1500;

type StageApiResponse = {
  stage: StageData;
  nextStageId: string | null;
  hasNextStage: boolean;
  totalStages: number;
};

type CompleteStageVariables = {
  durationMs: number;
  wrongAttempts: number;
  action: "complete" | "review";
};

type StageCompletionResponse = {
  success: boolean;
  score: UserStageScore;
  xpAwarded: number;
  xp: number;
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

    hasNextStage:
      typeof result.hasNextStage === "boolean"
        ? result.hasNextStage
        : Boolean(result.nextStageId),

    totalStages:
      typeof result.totalStages === "number"
        ? result.totalStages
        : 0,
  };
}

export default function StageLessonPage() {
  const params = useParams<{
    languageId: string;
    roadmapId: string;
    stageId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const languageId = params.languageId;
  const roadmapId = params.roadmapId;
  const stageId = params.stageId;

  // --------------------------------------------------
  // BONUS MODE
  // --------------------------------------------------

  const isBonusRound = searchParams.get("mode") === "bonus";

  const returnToStageId = searchParams.get("returnToStageId");
  const returnToRoadmapId = searchParams.get("returnToRoadmapId");

  // --------------------------------------------------
  // SRS STORE
  // --------------------------------------------------

  const ensureLanguageLoaded = useSrsStore(
    (state) => state.ensureLanguageLoaded
  );

  const updateScore = useSrsStore(
    (state) => state.updateScore
  );

  const claimDueReview = useSrsStore(
    (state) => state.claimDueReview
  );

  // Load all SRS scores belonging to this language.
  // The store organizes them by roadmap internally.
  useEffect(() => {
    if (!languageId) return;

    void ensureLanguageLoaded(languageId).catch((error) => {
      console.error("Failed to load language SRS scores:", error);
    });
  }, [languageId, ensureLanguageLoaded]);

  // --------------------------------------------------
  // USER STORE
  // --------------------------------------------------

  const setXp = useUserStore((state) => state.setXp);

  // --------------------------------------------------
  // LESSON STATE
  // --------------------------------------------------

  const [lessonStartedAt, setLessonStartedAt] = useState<number | null>(
    null
  );

  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
    useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const startedAtRef = useRef<number | null>(null);

  const wrongFeedbackTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // --------------------------------------------------
  // FETCH CURRENT STAGE
  // --------------------------------------------------

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

  const hasNextStage = data?.hasNextStage ?? false;

  const totalStages = data?.totalStages ?? 0;

  // --------------------------------------------------
  // RESET LESSON STATE WHEN STAGE CHANGES
  // --------------------------------------------------

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

    // Only prefetch the next stage during normal lessons.
    if (!isBonusRound && nextStageId) {
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
    isBonusRound,
    router,
  ]);

  // --------------------------------------------------
  // SAVE NORMAL COMPLETION OR BONUS REVIEW
  // --------------------------------------------------

  const completeStageMutation = useMutation<
    StageCompletionResponse,
    Error,
    CompleteStageVariables
  >({
    mutationFn: async ({
      durationMs,
      wrongAttempts,
      action,
    }) => {
      const response = await fetch(
        `/api/client/languages/${encodeURIComponent(languageId)}/roadmaps/${encodeURIComponent(roadmapId)}/stages/${encodeURIComponent(stageId)}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action,
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

      if (
        !result?.score ||
        typeof result.xp !== "number" ||
        typeof result.xpAwarded !== "number"
      ) {
        throw new Error(
          "The server returned an incomplete stage completion response."
        );
      }

      return result as StageCompletionResponse;
    },

    onSuccess: (result) => {
      // Update XP using the latest database value.
      setXp(result.xp);

      // Invalidate the roadmap containing the current stage.
      void queryClient.invalidateQueries({
        queryKey: ["roadmap-stages", languageId, roadmapId],
      });
    },
  });

  // --------------------------------------------------
  // CHECK ANSWER
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CONTINUE / COMPLETE REVIEW
  // --------------------------------------------------

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
      // ==============================================
      // BONUS REVIEW COMPLETION
      // ==============================================

      if (isBonusRound) {
        const result = await completeStageMutation.mutateAsync({
          action: "review",
          durationMs,
          wrongAttempts,
        });

        // Update this bonus stage's score and recalculate
        // its next review schedule.
        updateScore(result.score);

        // Return to the original roadmap and next stage.
        if (returnToStageId && returnToRoadmapId) {
          router.push(
            `/language/${languageId}/foundation/${returnToRoadmapId}/${returnToStageId}`
          );

          return;
        }

        // There was no next normal stage.
        router.push(`/language/${languageId}/foundation`);

        return;
      }

      // ==============================================
      // NORMAL STAGE COMPLETION
      // ==============================================

      // Ensure all stages across this language's roadmaps
      // are loaded before checking the review queue.
      //
      // Normal completion must still be saved if SRS loading fails.
      try {
        await ensureLanguageLoaded(languageId);
      } catch (srsError) {
        console.error(
          "Unable to load language SRS scores:",
          srsError
        );
      }

      // Save the normal stage first.
      const result = await completeStageMutation.mutateAsync({
        action: "complete",
        durationMs,
        wrongAttempts,
      });

      // Update the completed stage's schedule.
      updateScore(result.score);

      // ==============================================
      // CHECK FOR ONE DUE BONUS REVIEW
      // ==============================================

      const nextBonus = claimDueReview(
        stage.id,
        result.score.updatedAt,
        languageId,
        Date.now()
      );

      if (nextBonus) {
        const bonusUrl = new URLSearchParams({
          mode: "bonus",
          returnToStageId: nextStageId ?? "",
          returnToRoadmapId: roadmapId,
        });

        // IMPORTANT:
        // Use the roadmap and stage from the SRS result.
        // The bonus stage may belong to another roadmap.
        router.push(
          `/language/${languageId}/foundation/${nextBonus.roadmapId}/${nextBonus.stageId}?${bonusUrl.toString()}`
        );

        return;
      }

      // ==============================================
      // NO DUE REVIEW: NORMAL NAVIGATION
      // ==============================================

      if (hasNextStage && nextStageId) {
        router.push(
          `/language/${languageId}/foundation/${roadmapId}/${nextStageId}`
        );

        return;
      }

      // Last normal stage reached.
      router.push(`/language/${languageId}/foundation`);
    } catch (error) {
      console.error("Failed to save stage progress:", error);
    }
  }, [
    stage,
    isCurrentAnswerCorrect,
    completeStageMutation,
    wrongAttempts,
    isBonusRound,
    returnToStageId,
    returnToRoadmapId,
    updateScore,
    ensureLanguageLoaded,
    claimDueReview,
    languageId,
    roadmapId,
    hasNextStage,
    nextStageId,
    router,
  ]);

  // --------------------------------------------------
  // EXIT
  // --------------------------------------------------

  const handleExit = useCallback(() => {
    // If the student exits a bonus round, return to
    // the original roadmap when that information exists.
    const destinationRoadmapId =
      isBonusRound && returnToRoadmapId
        ? returnToRoadmapId
        : roadmapId;

    router.push(
      `/language/${languageId}/foundation/${destinationRoadmapId}`
    );
  }, [
    router,
    languageId,
    roadmapId,
    isBonusRound,
    returnToRoadmapId,
  ]);

  // --------------------------------------------------
  // LOADING AND ERROR STATES
  // --------------------------------------------------

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

  // --------------------------------------------------
  // SHARED VALUES
  // --------------------------------------------------

  const isNavigating = completeStageMutation.isPending;

  const stageNumber = Math.min(
    totalStages || stage.order + 1,
    Math.max(1, stage.order + 1)
  );

  const progressPercentage =
    totalStages > 0
      ? Math.min(100, (stageNumber / totalStages) * 100)
      : 0;

  // --------------------------------------------------
  // BONUS ROUND LAYOUT
  // --------------------------------------------------

  if (isBonusRound) {
    return (
      <BonusRoundLayout
        // stageTitle={stage.type}
        isSubmitted={isSubmitted}
        isAnswerCorrect={isCurrentAnswerCorrect}
        isSubmitting={isNavigating}
        onCheckAnswer={handleCheckAnswer}
        onContinue={handleNextStage}
        onExit={handleExit}
      >
        <StageMaterialRenderer
          stage={stage}
          onAnswerChange={setIsCurrentAnswerCorrect}
        />
      </BonusRoundLayout>
    );
  }

  // --------------------------------------------------
  // NORMAL STAGE LAYOUT
  // Existing normal-stage design is preserved.
  // --------------------------------------------------

  return (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Lesson Navigation Header */}
      <header className="max-w-2xl w-full mx-auto px-4 pt-3 sm:px-6 sm:pt-4 flex items-center gap-3 sm:gap-4">
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
              Stage {stageNumber} of {totalStages}
            </span>

            <span>{Math.round(progressPercentage)}%</span>
          </div>

          <div
            className="h-3 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuemin={0}
            aria-valuemax={totalStages}
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
      <main className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center px-4 py-2 sm:px-6 sm:py-4">
        <StageMaterialRenderer
          stage={stage}
          onAnswerChange={setIsCurrentAnswerCorrect}
        />
      </main>

      {/* Answer Feedback & Submit Footer */}
      {/* <footer
        className={`w-full py-6 px-6 transition-all border-slate-500 border-t duration-200 ${
          isSubmitted
            ? isCurrentAnswerCorrect
              ? "backdrop-blur-xl bg-emerald-950/50 border-emerald-300/30"
              : "backdrop-blur-xl bg-rose-950/50 border-rose-300/30"
            : ""
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          Answer feedback
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

          Check, feedback, or Continue button
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
      </footer> */}

{/* Answer Feedback & Submit Footer */}
<footer
  className={`w-full border-t border-slate-500 px-4 py-3 sm:px-6 sm:py-4 transition-all duration-200 ${
    isSubmitted
      ? isCurrentAnswerCorrect
        ? "backdrop-blur-xl bg-emerald-950/50 border-emerald-300/30"
        : "backdrop-blur-xl bg-rose-950/50 border-rose-300/30"
      : ""
  }`}
>
  <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
    {/* Answer feedback */}
    {isSubmitted ? (
      <div
        className="flex min-w-0 items-center gap-2"
        role="status"
        aria-live="polite"
      >
        {isCurrentAnswerCorrect ? (
          <>
            <CheckCircle2 className="h-6 w-6 shrink-0 text-green-400 sm:h-7 sm:w-7" />

            <div className="min-w-0">
              <p className="text-sm font-black text-green-300 sm:text-base">
                Excellent!
              </p>
              <p className="text-[10px] font-bold text-green-200 sm:text-xs">
                Your answer is correct.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-6 w-6 shrink-0 animate-pulse text-rose-400 sm:h-7 sm:w-7" />

            <div className="min-w-0">
              <p className="text-sm font-black text-rose-300 sm:text-base">
                Not quite!
              </p>
              <p className="text-[10px] font-bold text-rose-200 sm:text-xs">
                Check your response and try again.
              </p>
            </div>
          </>
        )}
      </div>
    ) : (
      <div />
    )}

    {/* Check or Continue button */}
    {!isSubmitted ? (
      <button
        onClick={handleCheckAnswer}
        className="ml-auto cursor-pointer rounded-xl bg-green-500 px-6 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_3px_0_0_#16a34a] transition-all hover:bg-green-400 active:translate-y-1 active:shadow-none sm:px-8 sm:py-3"
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
        className={`ml-auto rounded-xl px-6 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_3px_0_0] transition-all active:translate-y-1 active:shadow-none disabled:cursor-default disabled:opacity-100 sm:px-8 sm:py-3 ${
          isCurrentAnswerCorrect
            ? "cursor-pointer bg-green-500 shadow-green-600 hover:bg-green-400"
            : "bg-rose-500 shadow-rose-600 wrong-answer-button"
        }`}
      >
        {isNavigating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        ) : isCurrentAnswerCorrect ? (
          "Continue"
        ) : (
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
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
