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
    
<div className="min-h-full flex flex-col justify-between select-none">

  {/* Evaluation Header */}
  <header className="max-w-3xl w-full mx-auto px-5 sm:px-6 pt-5">
    <div className="flex items-center gap-4 rounded-2xl border border-white/40 bg-white/85 backdrop-blur-md shadow-lg px-4 py-3">

      {/* Exit Button - unchanged */}
      <button
        type="button"
        onClick={handleExit}
        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
        aria-label="Close evaluation"
      >
        <X className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Evaluation Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
            Evaluation
          </p>
        </div>

        <h1 className="text-lg sm:text-xl font-black text-slate-800 truncate">
          Test Your Knowledge
        </h1>
      </div>

      {/* Timer */}
      <div
        className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 shrink-0"
        aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
        title="Time spent on this stage"
      >
        <Timer className="w-4 h-4 text-amber-600" />

        <span className="text-sm font-black text-amber-900 tabular-nums">
          {formatDuration(elapsedMs)}
        </span>
      </div>

    </div>
  </header>


  {/* Evaluation Content */}
  <main className="max-w-2xl w-full mx-auto px-5 sm:px-6 flex-1 flex flex-col justify-center py-8">

    {/* Section Heading */}
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className="w-1 h-6 rounded-full bg-amber-500" />

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-amber-500 drop-shadow-sm">
          Assessment
        </p>

        <p className="text-sm font-bold text-white drop-shadow-md">
          Read carefully and select your answer
        </p>
      </div>
    </div>

    {/* Question Card */}
    <div className="bg-[#fffdf7]/95 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <StageMaterialRenderer
        key={stage.id}
        stage={stage}
        onAnswerChange={setIsCurrentAnswerCorrect}
      />
    </div>

  </main>


  {/* Evaluation Footer */}
  <footer
    className={`w-full px-5 sm:px-6 py-5 transition-all duration-300 ${
      isSubmitted
        ? isCurrentAnswerCorrect
          ? "bg-emerald-50/90 border-t border-emerald-200 backdrop-blur-md"
          : "bg-rose-50/90 border-t border-rose-200 backdrop-blur-md"
        : "bg-white/80 border-t border-white/60 backdrop-blur-md"
    }`}
  >
    <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

      {/* Answer Feedback */}
      {isSubmitted ? (
        <div className="flex items-center gap-3 w-full sm:w-auto">

          {isCurrentAnswerCorrect ? (
            <>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>

              <div>
                <p className="font-black text-emerald-800 text-lg">
                  Excellent!
                </p>

                <p className="text-xs font-bold text-emerald-700">
                  Your answer is correct.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7 text-rose-600" />
              </div>

              <div>
                <p className="font-black text-rose-800 text-lg">
                  Not Quite!
                </p>

                <p className="text-xs font-bold text-rose-700">
                  Review your response and try again.
                </p>
              </div>
            </>
          )}

        </div>
      ) : (
        <div className="w-full sm:w-auto">
          <p className="text-sm font-black text-slate-800">
            Ready to check your answer?
          </p>

          <p className="text-xs font-semibold text-slate-500">
            Make sure your response is complete.
          </p>
        </div>
      )}


      {/* Action Buttons */}
      {!isSubmitted ? (
        <button
          type="button"
          onClick={handleCheckAnswer}
          className="w-full sm:w-auto border border-amber-200 bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 px-8 py-3.5 text-amber-950 rounded-xl font-black shadow-[0_4px_0_#b45309] transition hover:brightness-110 active:translate-y-1 active:shadow-none uppercase tracking-wider cursor-pointer"
        >
          Check Answer
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
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-white border transition-all active:translate-y-1 active:shadow-none uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            isCurrentAnswerCorrect
              ? "border-emerald-400 bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-600 shadow-[0_4px_0_#047857] hover:brightness-110"
              : "border-rose-300 bg-gradient-to-b from-rose-400 via-rose-500 to-red-600 shadow-[0_4px_0_#be123c] hover:brightness-110"
          }`}
        >
          {isNavigating || evaluationQuery.isFetching ? (
            <span className="flex items-center justify-center gap-2">
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
