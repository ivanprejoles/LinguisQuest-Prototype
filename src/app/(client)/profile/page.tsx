
"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Gamepad2,
  Globe2,
  LoaderCircle,
  Medal,
  RefreshCw,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

// ============================================
// ACTIVITY TYPES
// ============================================

const ACTIVITY_TYPES = {
  SENTENCE_BUILDER: "sentenceBuilder",
  TRACING: "tracing",
  MULTIPLE_CHOICE: "multipleChoice",
  TAP_WHAT_YOU_HEAR: "tapWhatYouHear",
  FILL_IN_THE_BLANK: "fillInTheBlank",
  MATCHING: "matching",
} as const;

type ActivityType =
  (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  [ACTIVITY_TYPES.SENTENCE_BUILDER]: "Sentence Builder",
  [ACTIVITY_TYPES.TRACING]: "Letter Tracing",
  [ACTIVITY_TYPES.MULTIPLE_CHOICE]: "Multiple Choice",
  [ACTIVITY_TYPES.TAP_WHAT_YOU_HEAR]: "Listening Practice",
  [ACTIVITY_TYPES.FILL_IN_THE_BLANK]: "Fill in the Blank",
  [ACTIVITY_TYPES.MATCHING]: "Matching",
};

function getActivityLabel(type: string) {
  return ACTIVITY_LABELS[type as ActivityType] ?? "Other activity";
}

function isKnownActivity(type: string): type is ActivityType {
  return Object.values(ACTIVITY_TYPES).includes(type as ActivityType);
}

// ============================================
// TYPES
// ============================================

type MedalTier = "bronze" | "silver" | "gold";

type ProfileSummary = {
  id: string;
  name: string;
  imageUrl: string | null;
  xp: number;
  medal: MedalTier;
  nextMedalXp: number | null;
  xpIntoTier: number;
  joinedAt: string;
  foundationStageRecordCount: number;
  storySessionCount: number;
};

type RoadmapSummary = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  languageId: string;
  language: {
    id: string;
    name: string;
    countryCode: string;
  };
  totalStages: number;
  stagesWithRecords: number;
};

type FoundationStageRecord = {
  id: string;
  durationMs: number;
  playCount: number;
  wrongAttempts: number;
  createdAt: string;
  updatedAt: string;
  stage: {
    id: string;
    type: string;
    order: number;
    question: string;
    payloadPreview: Record<string, unknown>;
  };
};

type FoundationPage = {
  roadmap: {
    id: string;
    title: string;
    description: string;
    order: number;
    language: {
      name: string;
      countryCode: string;
    };
    totalStages: number;
  };
  records: FoundationStageRecord[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
};

type StoryRecord = {
  id: string;
  currentNodeId: string;
  wins: number;
  losses: number;
  updatedAt: string;
  session: {
    id: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    language: {
      id: string;
      name: string;
      countryCode: string;
    };
  };
};

type StoryPage = {
  records: StoryRecord[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
};

type SummaryResponse = {
  profile: ProfileSummary;
  roadmaps: RoadmapSummary[];
};

type ActivityOption = {
  id?: string;
  text?: string;
  word?: string;
  imageUrl?: string | null;
};

type MatchingPair = {
  id?: string;
  sourceText?: string;
  targetText?: string;
};

// ============================================
// HELPERS
// ============================================

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error || "Something went wrong. Please try again.");
  }

  return body;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Last activity unavailable";
  }

  return `Updated ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)}`;
}

function formatDuration(durationMs: number) {
  const seconds = Math.max(0, durationMs) / 1000;

  return `${seconds.toLocaleString(undefined, {
    maximumFractionDigits: seconds < 10 ? 1 : 0,
  })} sec`;
}

function medalDetails(tier: MedalTier) {
  switch (tier) {
    case "gold":
      return {
        label: "Gold",
        emoji: "🥇",
        className: "bg-amber-100 text-amber-800",
      };

    case "silver":
      return {
        label: "Silver",
        emoji: "🥈",
        className: "bg-slate-100 text-slate-700",
      };

    default:
      return {
        label: "Bronze",
        emoji: "🥉",
        className: "bg-orange-100 text-orange-800",
      };
  }
}

function getText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getObjectArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

// ============================================
// CHIP LIST
// ============================================

function ChipList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No preview items saved for this stage.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="max-w-full break-words rounded-lg border border-cyan-100 bg-cyan-50 px-2.5 py-1.5 text-sm font-semibold text-cyan-900"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

// ============================================
// STAGE PREVIEW
// ============================================

function StagePreview({ record }: { record: FoundationStageRecord }) {
  const payload = record.stage.payloadPreview ?? {};
  const question = getText(payload.question) || record.stage.question;
  const type = record.stage.type;

  return (
    <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-teal-50/70">
      <div className="flex items-center gap-2 border-b border-cyan-100 bg-white/70 px-3 py-3 sm:px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-cyan-800">
          Activity preview
        </span>
      </div>

      <div className="min-w-0 p-3 sm:p-4">
        {question ? (
          <p className="mb-4 break-words text-sm font-bold leading-6 text-slate-800">
            {question}
          </p>
        ) : null}

        {type === ACTIVITY_TYPES.SENTENCE_BUILDER ? (
          <div>
            <p className="mb-2 text-xs font-extrabold text-slate-500">
              SCRAMBLED WORDS
            </p>
            <ChipList values={getStringArray(payload.scrambledWordBank)} />
          </div>
        ) : null}

        {type === ACTIVITY_TYPES.TRACING ? (
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-cyan-100 bg-white shadow-inner">
            <span className="break-words text-5xl font-black text-cyan-600">
              {getText(payload.targetLetter) || "—"}
            </span>
          </div>
        ) : null}

        {type === ACTIVITY_TYPES.FILL_IN_THE_BLANK ? (
          <div className="space-y-3">
            {getText(payload.fullSentence) ? (
              <p className="break-words rounded-xl border border-cyan-100 bg-white p-3 text-sm font-semibold leading-6 text-slate-700">
                {getText(payload.fullSentence)}
              </p>
            ) : null}
            <div>
              <p className="mb-2 text-xs font-extrabold text-slate-500">
                ANSWER CHOICES
              </p>
              <ChipList
                values={getObjectArray<ActivityOption>(payload.options)
                  .map((option) => getText(option.word))
                  .filter(Boolean)}
              />
            </div>
          </div>
        ) : null}

        {type === ACTIVITY_TYPES.TAP_WHAT_YOU_HEAR ? (
          <div>
            <p className="mb-2 text-xs font-extrabold text-slate-500">
              WORD BANK
            </p>
            <ChipList values={getStringArray(payload.wordBank)} />
          </div>
        ) : null}

        {type === ACTIVITY_TYPES.MULTIPLE_CHOICE ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {getObjectArray<ActivityOption>(payload.options).map(
              (option, index) => (
                <div
                  key={option.id || `${option.text}-${index}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-cyan-100 bg-white p-3"
                >
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <span className="min-w-0 break-words text-sm font-bold text-slate-700">
                    {option.text || "Choice"}
                  </span>
                </div>
              )
            )}
          </div>
        ) : null}

        {type === ACTIVITY_TYPES.MATCHING ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {getObjectArray<MatchingPair>(payload.pairs).map(
              (pair, index) => (
                <div
                  key={pair.id || `${pair.sourceText}-${index}`}
                  className="grid min-w-0 grid-cols-2 gap-2 rounded-xl border border-cyan-100 bg-white p-2.5 text-sm sm:p-3"
                >
                  <span className="min-w-0 break-words rounded-lg bg-cyan-50 p-2 font-bold text-cyan-900">
                    {pair.sourceText || "—"}
                  </span>
                  <span className="min-w-0 break-words rounded-lg bg-teal-50 p-2 font-semibold text-teal-900">
                    {pair.targetText || "—"}
                  </span>
                </div>
              )
            )}
          </div>
        ) : null}

        {!isKnownActivity(type) ? (
          <p className="text-sm text-slate-500">
            A preview is not available for this activity type yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ============================================
// METRIC
// ============================================

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-cyan-100/80 bg-gradient-to-br from-cyan-50/80 to-white p-2.5 sm:p-3">
      <p className="break-words text-[9px] font-black uppercase tracking-wider text-cyan-700 sm:text-[10px]">
        {label}
      </p>
      <p className="mt-1 break-words text-xs font-black leading-5 text-slate-900 sm:text-sm">
        {value}
      </p>
    </div>
  );
}

// ============================================
// ROADMAP PROGRESS CARD
// ============================================

function RoadmapProgressCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const [expanded, setExpanded] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["profile", "foundation", roadmap.id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchJson<FoundationPage>(
        `/api/client/profile?section=foundation&roadmapId=${encodeURIComponent(
          roadmap.id
        )}&limit=20&offset=${pageParam}`
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset ?? undefined : undefined,
    enabled: expanded,
    staleTime: 60_000,
  });

  const records = data?.pages.flatMap((page) => page.records) ?? [];

  const percentage =
    roadmap.totalStages > 0
      ? Math.min(
          100,
          Math.round(
            (roadmap.stagesWithRecords / roadmap.totalStages) * 100
          )
        )
      : 0;

  const isComplete = percentage === 100;

  return (
    <article
      className={`min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors sm:rounded-3xl ${
        expanded
          ? "border-cyan-300 shadow-md shadow-cyan-100/70"
          : "border-slate-200 hover:border-cyan-200"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="block w-full min-w-0 text-left transition-colors hover:bg-cyan-50/30"
      >
        <div className="relative min-w-0 overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-100/50" />

          {/* Header: icon and title, with controls on a separate mobile row */}
          <div className="relative flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white sm:h-14 sm:w-14 sm:rounded-2xl">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="min-w-0 break-words text-sm font-black leading-5 text-slate-900 sm:text-lg sm:leading-6">
                  {roadmap.title}
                </h3>

                {isComplete ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                ) : null}
              </div>

              <p className="mt-1 break-words text-xs font-semibold text-slate-500 sm:text-sm">
                {roadmap.language.name}
              </p>
            </div>

            {/* Desktop progress and expand control */}
            <div className="hidden shrink-0 items-center gap-4 sm:flex">
              <div className="text-center">
                <span className="block text-2xl font-black tracking-tight text-cyan-700">
                  {percentage}%
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                  Progress
                </span>
              </div>

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  expanded
                    ? "rotate-180 bg-cyan-100 text-cyan-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Mobile progress summary */}
          <div className="relative mt-4 flex items-center justify-between gap-3 sm:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-xl font-black tracking-tight text-cyan-700">
                {percentage}%
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Progress
              </span>
            </div>

            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                expanded
                  ? "rotate-180 bg-cyan-100 text-cyan-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-4 sm:mt-5">
            <div className="mb-2 flex flex-col gap-1 text-[10px] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-xs">
              <span className="font-bold text-slate-600">
                {roadmap.stagesWithRecords} of {roadmap.totalStages} stages
                explored
              </span>
              <span className="font-bold text-cyan-700">
                {isComplete ? "Amazing work!" : "Keep going!"}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 sm:h-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-400 transition-all duration-700"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="min-w-0 border-t border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-white p-3 sm:p-6">
          {roadmap.description ? (
            <div className="mb-4 rounded-xl border border-cyan-100 bg-white/80 p-3 sm:mb-5 sm:rounded-2xl sm:p-4">
              <p className="break-words text-sm leading-6 text-slate-600">
                {roadmap.description}
              </p>
            </div>
          ) : null}

          <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 sm:text-xs">
                Your activity history
              </p>
              <h4 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                Stages explored
              </h4>
            </div>

            <span className="shrink-0 rounded-full bg-cyan-100 px-2.5 py-1.5 text-[10px] font-extrabold text-cyan-800 sm:px-3 sm:text-xs">
              {records.length} loaded
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-xl bg-white px-3 py-8 text-center text-sm font-bold text-cyan-800 sm:rounded-2xl sm:py-10">
              <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" />
              Loading your stage history...
            </div>
          ) : null}

          {isError ? (
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4">
              <span className="min-w-0 break-words">
                {error instanceof Error
                  ? error.message
                  : "Could not load stages."}
              </span>

              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 font-extrabold shadow-sm sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && records.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-cyan-200 bg-white px-4 py-8 text-center sm:rounded-2xl sm:px-5 sm:py-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 sm:h-14 sm:w-14 sm:rounded-2xl">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="mt-4 font-black text-slate-900">
                Your first stage awaits!
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
                Start exploring this roadmap. Your practice history will appear here.
              </p>
            </div>
          ) : null}

          <div className="min-w-0 space-y-3 sm:space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 text-sm font-black text-cyan-800 sm:h-10 sm:w-10">
                      {record.stage.order + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900 sm:text-base">
                        Stage {record.stage.order + 1}
                      </p>
                      <p className="mt-1 break-words text-sm leading-5 text-slate-600">
                        {record.stage.question || "Activity details"}
                      </p>
                    </div>
                  </div>

                  <span className="w-fit max-w-full break-words rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[10px] font-extrabold text-cyan-800 sm:text-xs">
                    {getActivityLabel(record.stage.type)}
                  </span>
                </div>

                {/* One metric per row on mobile; four columns on desktop */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric
                    label="Time played"
                    value={formatDuration(record.durationMs)}
                  />
                  <Metric
                    label="Play count"
                    value={record.playCount.toLocaleString()}
                  />
                  <Metric
                    label="Wrong attempts"
                    value={record.wrongAttempts.toLocaleString()}
                  />
                  <Metric
                    label="Last played"
                    value={formatUpdatedAt(record.updatedAt)}
                  />
                </div>

                <StagePreview record={record} />
              </div>
            ))}
          </div>

          {hasNextPage ? (
            <div className="pt-5 text-center">
              <button
                type="button"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-black text-white shadow-md shadow-cyan-200 transition hover:from-cyan-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
              >
                {isFetchingNextPage ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {isFetchingNextPage ? "Loading stages..." : "Load more stages"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}


// ============================================
// STAT CARDS
// ============================================

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "cyan" | "amber" | "teal" | "violet";
}) {
  const tones = {
    cyan: {
      card: "from-cyan-50 to-white border-cyan-100",
      icon: "bg-cyan-500 text-white shadow-cyan-200",
      value: "text-cyan-950",
    },
    amber: {
      card: "from-amber-50 to-white border-amber-100",
      icon: "bg-amber-400 text-white shadow-amber-200",
      value: "text-amber-950",
    },
    teal: {
      card: "from-teal-50 to-white border-teal-100",
      icon: "bg-teal-500 text-white shadow-teal-200",
      value: "text-teal-950",
    },
    violet: {
      card: "from-violet-50 to-white border-violet-100",
      icon: "bg-violet-500 text-white shadow-violet-200",
      value: "text-violet-950",
    },
  };

  const style = tones[tone];

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-sm sm:rounded-2xl sm:p-5 ${style.card}`}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/60 sm:h-20 sm:w-20" />

      <div
        className={`relative flex h-8 w-8 items-center justify-center rounded-lg shadow-sm sm:h-10 sm:w-10 sm:rounded-xl ${style.icon}`}
      >
        {icon}
      </div>

      <p
        className={`relative mt-2 break-words text-lg font-black leading-tight sm:mt-4 sm:text-3xl ${style.value}`}
      >
        {value}
      </p>

      <p className="relative mt-1 break-words text-[10px] font-bold leading-4 text-slate-500 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:gap-2 sm:rounded-2xl sm:p-4">
      <p className="break-words text-base font-black leading-tight text-cyan-900 sm:text-xl">
        {value}
      </p>

      <p className="break-words text-[9px] font-extrabold uppercase leading-tight tracking-wide text-cyan-700 sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border-2 border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-4 py-9 text-center sm:rounded-3xl sm:px-5 sm:py-12">
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-100/60" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-teal-100/60" />

      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-lg shadow-cyan-200 sm:h-16 sm:w-16">
        {icon}
      </div>

      <h3 className="relative mt-4 break-words text-base font-black text-slate-900 sm:mt-5 sm:text-lg">
        {title}
      </h3>

      <p className="relative mx-auto mt-2 max-w-md break-words text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="relative mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-extrabold text-cyan-700 shadow-sm sm:px-4 sm:text-xs">
        <Sparkles className="h-4 w-4 shrink-0" />
        Every journey starts somewhere
      </div>
    </div>
  );
}

// ============================================
// MAIN PROFILE COMPONENT
// ============================================

export default function ProfileProgressSection() {
  const [activeTab, setActiveTab] = useState<"foundation" | "story">(
    "foundation"
  );

  // PROFILE SUMMARY QUERY
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryQueryError,
    refetch: refetchSummary,
  } = useQuery<SummaryResponse>({
    queryKey: ["profile", "summary"],
    queryFn: () =>
      fetchJson<SummaryResponse>("/api/client/profile?section=summary"),
    staleTime: 2 * 60 * 1000,
  });

  const summaryError =
    summaryQueryError instanceof Error
      ? summaryQueryError.message
      : "";

  // STORY PROGRESS QUERY
  const {
    data: storyData,
    isLoading: storyLoading,
    isFetchingNextPage: storyLoadingMore,
    error: storyQueryError,
    refetch: refetchStory,
    fetchNextPage: fetchNextStoryPage,
    hasNextPage: hasMoreStories,
    isFetchNextPageError: storyNextPageError,
  } = useInfiniteQuery<StoryPage>({
    queryKey: ["profile", "story"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchJson<StoryPage>(
        `/api/client/profile?section=story&limit=20&offset=${pageParam}`
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset ?? undefined : undefined,
    enabled: activeTab === "story",
    staleTime: 60 * 1000,
  });

  const storyRecords =
    storyData?.pages.flatMap((page) => page.records) ?? [];

  const storyError =
    storyQueryError instanceof Error
      ? storyQueryError.message
      : "";

  // MEDAL
  const medal = summary
    ? medalDetails(summary.profile.medal)
    : medalDetails("bronze");

  // ROADMAPS GROUPED BY LANGUAGE
  const roadmapsByLanguage = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; roadmaps: RoadmapSummary[] }
    >();

    for (const roadmap of summary?.roadmaps ?? []) {
      const group = groups.get(roadmap.language.id) ?? {
        name: roadmap.language.name,
        roadmaps: [],
      };

      group.roadmaps.push(roadmap);
      groups.set(roadmap.language.id, group);
    }

    return [...groups.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [summary?.roadmaps]);

  // LOADING STATE
  if (summaryLoading && !summary) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-3 py-5 sm:px-6 sm:py-8">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100 sm:rounded-3xl" />

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-slate-100 sm:rounded-2xl"
            />
          ))}
        </div>

        <div className="h-48 animate-pulse rounded-2xl bg-slate-100 sm:rounded-3xl" />
      </section>
    );
  }

  // ERROR STATE
  if (!summary) {
    return (
      <section className="mx-auto w-full max-w-3xl px-3 py-8 sm:px-6 sm:py-10">
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 sm:p-5"
        >
          <p className="font-extrabold">We couldn’t load your profile</p>
          <p className="mt-1 break-words text-sm">
            {summaryError || "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => void refetchSummary()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold shadow-sm sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </section>
    );
  }

  // PROFILE CALCULATIONS
  const profile = summary.profile;

  const safeXp = Number.isFinite(profile.xp)
    ? Math.max(0, profile.xp)
    : 0;

  const xpToNextMedal =
    profile.nextMedalXp === null
      ? 0
      : Math.max(0, (profile.nextMedalXp ?? 0) - safeXp);

  const xpIntoTier = Number.isFinite(profile.xpIntoTier)
    ? Math.max(0, profile.xpIntoTier)
    : 0;

  const medalProgress =
    profile.medal === "gold"
      ? 100
      : Math.min(100, Math.max(0, (xpIntoTier / 250) * 100));

  // RENDER
  return (
    <main className="min-h-screen w-full overflow-x-clip bg-gradient-to-b from-cyan-50/70 via-slate-50 to-white pb-8 text-slate-900 sm:pb-12">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8">

        {/* PROFILE IDENTITY */}
<section className="min-w-0 overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-md shadow-cyan-100/50 sm:rounded-3xl">
  {/* Banner */}
  <div className="relative isolate overflow-hidden bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-400 px-4 py-6 sm:px-8 sm:py-8">
    <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-[20px] border-white/10 sm:h-56 sm:w-56 sm:border-[28px]" />

    <div className="pointer-events-none absolute right-24 top-8 h-16 w-16 rounded-full bg-white/10" />

    <div className="relative min-w-0">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/80 sm:text-xs sm:tracking-[0.18em]">
        <Sparkles className="h-4 w-4 shrink-0" />
        Your learning space
      </p>

      <h1 className="mt-2 text-xl font-black tracking-tight text-white sm:text-3xl">
        Keep up the great work!
      </h1>

      <p className="mt-1 max-w-lg text-xs leading-5 text-cyan-50 sm:text-sm sm:leading-6">
        Every practice session brings you closer to your learning goals.
      </p>
    </div>
  </div>

  {/* Profile details */}
  <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:px-8 sm:py-6">
    <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50 text-xl font-black text-cyan-900 sm:h-20 sm:w-20 sm:text-2xl">
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={`${profile.name}'s profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          profile.name.charAt(0).toUpperCase()
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="break-words text-lg font-black text-slate-900 sm:text-2xl">
          {profile.name}
        </h2>

        <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
          Learning since {formatDate(profile.joinedAt)}
        </p>
      </div>
    </div>

    <div
      className={`inline-flex w-fit max-w-full items-center gap-2 self-start rounded-xl px-3 py-2 text-xs font-black sm:self-center sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm ${medal.className}`}
    >
      <span className="text-lg sm:text-xl">{medal.emoji}</span>
      {medal.label} medal
    </div>
  </div>
</section>

        {/* STATISTICS */}
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-700 sm:text-xs sm:tracking-[0.18em]">
                Your achievements
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
                Your statistics
              </h2>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 sm:h-10 sm:w-10 sm:rounded-2xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Zap className="h-5 w-5" />}
              label="Total XP"
              value={safeXp.toLocaleString()}
              tone="cyan"
            />

            <StatCard
              icon={<Medal className="h-5 w-5" />}
              label="Current medal"
              value={medal.label}
              tone="amber"
            />

            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Stage records"
              value={profile.foundationStageRecordCount.toLocaleString()}
              tone="teal"
            />

            <StatCard
              icon={<Gamepad2 className="h-5 w-5" />}
              label="Story sessions"
              value={profile.storySessionCount.toLocaleString()}
              tone="violet"
            />
          </div>

          {/* MEDAL PROGRESSION */}
          <div className="relative mt-3 min-w-0 overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-4 shadow-sm sm:mt-4 sm:rounded-3xl sm:p-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-100/70" />

            <div className="relative flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-md shadow-cyan-200">
                  <Medal className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900">Medal progression</p>
                  <p className="text-xs leading-5 text-slate-500">
                    Your next achievement is within reach
                  </p>
                </div>
              </div>

              <span className="w-fit max-w-full rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-[11px] font-black text-cyan-800 shadow-sm sm:text-xs">
                {profile.medal === "gold"
                  ? "All medals earned!"
                  : `${xpToNextMedal.toLocaleString()} XP to go`}
              </span>
            </div>

            <div className="relative mt-4 sm:mt-5">
              <div className="h-3 overflow-hidden rounded-full border border-white bg-slate-200 shadow-inner sm:h-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-teal-400 shadow-sm transition-all duration-700"
                  style={{ width: `${medalProgress}%` }}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
                {[
                  { emoji: "🥉", label: "Bronze", xp: "0 XP", active: profile.medal === "bronze" },
                  { emoji: "🥈", label: "Silver", xp: "250 XP", active: profile.medal === "silver" },
                  { emoji: "🥇", label: "Gold", xp: "500 XP", active: profile.medal === "gold" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`min-w-0 rounded-xl border p-2 text-center transition sm:rounded-2xl sm:p-3 ${
                      item.active
                        ? "border-cyan-300 bg-white shadow-md shadow-cyan-100"
                        : "border-transparent bg-white/60"
                    }`}
                  >
                    <p className="text-lg sm:text-xl">{item.emoji}</p>
                    <p
                      className={`mt-1 text-[10px] font-black sm:text-xs ${
                        item.active ? "text-cyan-800" : "text-slate-500"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold text-slate-400 sm:text-[10px]">
                      {item.xp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDATION AND STORY PROGRESSION */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-md shadow-cyan-100/30 sm:rounded-3xl sm:shadow-lg">
          <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-teal-50 p-4 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-700 sm:text-xs sm:tracking-[0.18em]">
              Your learning journey
            </p>

            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Progression
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Check your roadmap stage history and story-session results.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-cyan-100 bg-white/80 p-1 shadow-inner sm:mt-5 sm:gap-2 sm:rounded-2xl sm:p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("foundation")}
                className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-extrabold transition sm:gap-2 sm:rounded-xl sm:px-3 sm:text-sm ${
                  activeTab === "foundation"
                    ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-200"
                    : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-800"
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">Foundation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("story")}
                className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-extrabold transition sm:gap-2 sm:rounded-xl sm:px-3 sm:text-sm ${
                  activeTab === "story"
                    ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-200"
                    : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-800"
                }`}
              >
                <Swords className="h-4 w-4 shrink-0" />
                <span className="truncate">Story</span>
              </button>
            </div>
          </div>

          {/* FOUNDATION TAB */}
          {activeTab === "foundation" ? (
            <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-6">
              {roadmapsByLanguage.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-8 w-8" />}
                  title="No foundation roadmaps yet"
                  description="Your roadmap progression will show here once roadmaps are available."
                />
              ) : (
                roadmapsByLanguage.map((group) => (
                  <div key={group.name} className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      <Globe2 className="h-4 w-4 shrink-0 text-cyan-700" />
                      <h3 className="break-words font-extrabold text-slate-800">
                        {group.name}
                      </h3>
                    </div>

                    <div className="min-w-0 space-y-3">
                      {group.roadmaps.map((roadmap) => (
                        <RoadmapProgressCard
                          key={roadmap.id}
                          roadmap={roadmap}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}

              <p className="break-words text-[10px] leading-5 text-slate-500 sm:text-xs">
                Stage counts reflect saved UserStageScore records. If your
                app creates a record before a learner successfully completes
                a stage, these counts mean “played/recorded,” not necessarily
                “completed.”
              </p>
            </div>
          ) : (

            /* STORY TAB */
            <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-6">
              {storyError ? (
                <div
                  role="alert"
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4"
                >
                  <span className="min-w-0 break-words">{storyError}</span>

                  <button
                    type="button"
                    onClick={() => void refetchStory()}
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-black text-white shadow-md shadow-cyan-200 transition hover:from-cyan-600 hover:to-teal-600 sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                </div>
              ) : null}

              {storyLoading && storyRecords.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm font-semibold text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading story progress…
                </div>
              ) : null}

              {storyData && storyRecords.length === 0 && !storyLoading ? (
                <EmptyState
                  icon={<Gamepad2 className="h-8 w-8" />}
                  title="Your story journey starts here"
                  description="Your story sessions, wins, and losses will appear here when you play."
                />
              ) : null}

              <div className="min-w-0 space-y-3">
                {storyRecords.map((record) => {
                  const games = record.wins + record.losses;

                  const winRate =
                    games > 0
                      ? Math.round((record.wins / games) * 100)
                      : 0;

                  return (
                    <article
                      key={record.id}
                      className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-cyan-200 sm:rounded-2xl sm:p-5 lg:flex-row lg:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-3 lg:flex-1">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-md shadow-cyan-100 sm:h-14 sm:w-14 sm:rounded-2xl">
                          {record.session.imageUrl ? (
                            <img
                              src={record.session.imageUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Gamepad2 className="h-6 w-6" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-extrabold text-slate-900 sm:text-base">
                            {record.session.title || "Untitled story"}
                          </h3>

                          <p className="mt-1 break-words text-[10px] font-semibold leading-5 text-slate-500 sm:text-xs">
                            {record.session.language.name} ·{" "}
                            {formatUpdatedAt(record.updatedAt)}
                          </p>

                          {record.session.description ? (
                            <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-slate-600 sm:text-sm">
                              {record.session.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-3 gap-2 lg:w-auto lg:min-w-52">
                        <MiniStat
                          label="Wins"
                          value={record.wins.toLocaleString()}
                        />
                        <MiniStat
                          label="Losses"
                          value={record.losses.toLocaleString()}
                        />
                        <MiniStat
                          label="Win rate"
                          value={`${winRate}%`}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>

              {hasMoreStories ? (
                <div className="pt-3 text-center sm:pt-5">
                  <button
                    type="button"
                    disabled={storyLoadingMore}
                    onClick={() => void fetchNextStoryPage()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-extrabold text-violet-800 transition hover:bg-violet-50 disabled:opacity-60 sm:w-auto sm:py-2.5"
                  >
                    {storyLoadingMore ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : null}
                    Load more stories
                  </button>
                </div>
              ) : null}

              {storyNextPageError ? (
                <div className="mt-3 flex flex-col items-center gap-2 text-center text-sm text-rose-700">
                  <p>Could not load more stories. Please try again.</p>
                  <button
                    type="button"
                    onClick={() => void fetchNextStoryPage()}
                    className="font-bold underline"
                  >
                    Retry loading
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="flex items-center justify-center gap-2 px-2 text-center text-[10px] leading-5 text-slate-500 sm:text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-700" />
          Every practice session is another step forward.
        </footer>
      </div>
    </main>
  );
}
