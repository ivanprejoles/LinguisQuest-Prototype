
"use client";

import { useMemo, useState } from "react";
import { useParams} from "next/navigation";
import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { PageShell } from "@/components/global/admin/foundation/page-shell";

import {
  ArrowLeft,
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
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ============================================
// TYPES
// ============================================

type MedalTier = "bronze" | "silver" | "gold";

type Profile = {
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

type Roadmap = {
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

type StageRecord = {
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
    description: string | null;
    order: number;
    language: {
      name: string;
      countryCode: string;
    };
    totalStages: number;
  };
  records: StageRecord[];
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
  profile: Profile;
  roadmaps: Roadmap[];
};

type Tab = "foundation" | "story";

// ============================================
// HELPERS
// ============================================

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.error || "Unable to load learner information."
    );
  }

  return body as T;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDuration(value: number) {
  const seconds = Math.max(0, value) / 1000;

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.round(seconds % 60);

    return `${minutes}m ${remaining}s`;
  }

  return `${seconds.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} sec`;
}

function getText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getMedal(tier: MedalTier) {
  const medals = {
    bronze: {
      label: "Bronze",
      emoji: "🥉",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    silver: {
      label: "Silver",
      emoji: "🥈",
      color: "bg-slate-100 text-slate-700 border-slate-200",
    },
    gold: {
      label: "Gold",
      emoji: "🥇",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
  };

  return medals[tier] ?? medals.bronze;
}

function getActivityLabel(type: string) {
  const labels: Record<string, string> = {
    sentenceBuilder: "Sentence Builder",
    tracing: "Letter Tracing",
    multipleChoice: "Multiple Choice",
    tapWhatYouHear: "Listening Practice",
    fillInTheBlank: "Fill in the Blank",
    matching: "Matching",
  };

  return labels[type] ?? "Other Activity";
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>

      <p className="mt-3 break-words text-2xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-slate-500">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      Loading learner data...
    </div>
  );
}

function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="break-words text-sm font-semibold text-rose-800">
        {message}
      </p>

      <button
        type="button"
        onClick={retry}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

// ============================================
// ACTIVITY PREVIEW
// ============================================

function ActivityPreview({
  record,
}: {
  record: StageRecord;
}) {
  const payload = record.stage.payloadPreview ?? {};

  const question =
    getText(payload.question) || record.stage.question;

  const type = record.stage.type;

  const chips = (
    values: unknown[],
    empty = "No preview items available."
  ) => {
    const items = values.filter(
      (item): item is string => typeof item === "string"
    );

    if (!items.length) {
      return (
        <p className="text-xs text-slate-500">{empty}</p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="break-words rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-900"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-700" />

        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
          Activity preview
        </span>
      </div>

      {question && (
        <p className="mb-4 break-words text-sm font-bold leading-6 text-slate-800">
          {question}
        </p>
      )}

      {type === "tracing" && (
        <div className="flex min-h-24 items-center justify-center rounded-xl bg-white">
          <span className="text-5xl font-black text-cyan-600">
            {getText(payload.targetLetter) || "—"}
          </span>
        </div>
      )}

      {type === "sentenceBuilder" &&
        chips(getArray(payload.scrambledWordBank))}

      {type === "tapWhatYouHear" &&
        chips(getArray(payload.wordBank))}

      {type === "fillInTheBlank" && (
        <div className="space-y-3">
          {getText(payload.fullSentence) && (
            <p className="rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
              {getText(payload.fullSentence)}
            </p>
          )}

          <p className="text-[10px] font-black uppercase text-slate-500">
            Available choices
          </p>

          {chips(
            getArray(payload.options).map((item) => {
              if (
                item !== null &&
                typeof item === "object" &&
                "word" in item
              ) {
                return (item as { word: string }).word;
              }

              return "";
            })
          )}
        </div>
      )}

      {type === "multipleChoice" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {getArray(payload.options).map((item, index) => {
            if (!item || typeof item !== "object") return null;

            const option = item as {
              id?: string;
              text?: string;
              imageUrl?: string | null;
            };

            return (
              <div
                key={option.id || index}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
              >
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                )}

                <span className="break-words text-sm font-bold text-slate-700">
                  {option.text || "Choice"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {type === "matching" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {getArray(payload.pairs).map((item, index) => {
            if (!item || typeof item !== "object") return null;

            const pair = item as {
              sourceText?: string;
              targetText?: string;
            };

            return (
              <div
                key={index}
                className="grid grid-cols-2 gap-2 rounded-xl bg-white p-2"
              >
                <span className="break-words rounded-lg bg-cyan-50 p-2 text-xs font-bold text-cyan-900">
                  {pair.sourceText || "—"}
                </span>

                <span className="break-words rounded-lg bg-teal-50 p-2 text-xs font-bold text-teal-900">
                  {pair.targetText || "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {![
        "tracing",
        "sentenceBuilder",
        "tapWhatYouHear",
        "fillInTheBlank",
        "multipleChoice",
        "matching",
      ].includes(type) && (
        <p className="text-xs text-slate-500">
          No preview available for this activity type.
        </p>
      )}
    </div>
  );
}

// ============================================
// ROADMAP CARD
// ============================================

function RoadmapCard({
  roadmap,
  userId,
}: {
  roadmap: Roadmap;
  userId: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const query = useInfiniteQuery({
    queryKey: [
      "admin-user-profile",
      userId,
      "foundation",
      roadmap.id,
    ],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchJson<FoundationPage>(
        `/api/admin/users/${userId}?section=foundation&roadmapId=${encodeURIComponent(
          roadmap.id
        )}&limit=20&offset=${pageParam}`
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.nextOffset ?? undefined
        : undefined,
    enabled: expanded,
    staleTime: 60_000,
  });

  const records =
    query.data?.pages.flatMap((page) => page.records) ?? [];

  const percentage =
    roadmap.totalStages > 0
      ? Math.min(
          100,
          Math.round(
            (roadmap.stagesWithRecords / roadmap.totalStages) * 100
          )
        )
      : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="w-full p-4 text-left transition hover:bg-cyan-50/30 sm:p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words font-black text-slate-900">
              {roadmap.title}
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {roadmap.language.name}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-cyan-700">
              {percentage}%
            </p>

            <p className="text-[9px] font-bold uppercase text-slate-400">
              Progress
            </p>
          </div>

          <ChevronDown
            className={`h-5 w-5 shrink-0 text-slate-500 transition ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600">
            {roadmap.stagesWithRecords} / {roadmap.totalStages} stages explored
          </span>

          <span className="font-bold text-cyan-700">
            {percentage === 100 ? "All stages explored" : "In progress"}
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/70 p-4">
          {roadmap.description && (
            <p className="text-sm leading-6 text-slate-600">
              {roadmap.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-slate-900">
              Stage activity history
            </h4>

            <span className="text-xs font-bold text-slate-500">
              {query.data?.pages[0]?.totalCount ?? 0} total records
            </span>
          </div>

          {query.isLoading && <LoadingState />}

          {query.isError && (
            <ErrorState
              message={
                query.error instanceof Error
                  ? query.error.message
                  : "Unable to load stage history."
              }
              retry={() => void query.refetch()}
            />
          )}

          {!query.isLoading &&
            !query.isError &&
            records.length === 0 && (
              <EmptyState
                icon={<BookOpen className="h-7 w-7" />}
                title="No stage records"
                description="This learner has not recorded any activity in this roadmap."
              />
            )}

          {records.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black text-slate-900">
                    Stage {record.stage.order + 1}
                  </p>

                  <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                    {record.stage.question || "Activity details"}
                  </p>
                </div>

                <span className="rounded-full bg-cyan-100 px-3 py-1.5 text-[10px] font-black text-cyan-800">
                  {getActivityLabel(record.stage.type)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
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

              <ActivityPreview record={record} />
            </article>
          ))}

          {query.hasNextPage && (
            <button
              type="button"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-700 disabled:opacity-50"
            >
              {query.isFetchingNextPage ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}

              Load more stages
            </button>
          )}

          {query.isFetchNextPageError && (
            <button
              type="button"
              onClick={() => void query.fetchNextPage()}
              className="w-full text-center text-sm font-bold text-rose-600"
            >
              Could not load more stages. Retry.
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ============================================
// STORY CARD
// ============================================

function StoryCard({
  record,
}: {
  record: StoryRecord;
}) {
  const games = record.wins + record.losses;

  const winRate =
    games > 0
      ? Math.round((record.wins / games) * 100)
      : 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-100 text-violet-700">
            {record.session.imageUrl ? (
              <img
                src={record.session.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Gamepad2 className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="break-words font-black text-slate-900">
              {record.session.title || "Untitled story"}
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {record.session.language.name} ·{" "}
              {formatUpdatedAt(record.updatedAt)}
            </p>

            {record.session.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {record.session.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:w-64">
          <Metric
            label="Wins"
            value={record.wins.toLocaleString()}
          />

          <Metric
            label="Losses"
            value={record.losses.toLocaleString()}
          />

          <Metric
            label="Win rate"
            value={`${winRate}%`}
          />
        </div>
      </div>
    </article>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function AdminUserProfilePage() {
  const { adminId, userId } = useParams<{
    adminId: string;
    userId: string;
  }>();

  const [activeTab, setActiveTab] =
    useState<Tab>("foundation");

  // ========================================
  // SUMMARY
  // ========================================

  const summaryQuery = useQuery<SummaryResponse>({
    queryKey: ["admin-user-profile", userId, "summary"],
    queryFn: () =>
      fetchJson<SummaryResponse>(
        `/api/admin/users/${encodeURIComponent(userId)}?section=summary`
      ),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  // ========================================
  // STORY HISTORY
  // ========================================

  const storyQuery = useInfiniteQuery({
    queryKey: ["admin-user-profile", userId, "story"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchJson<StoryPage>(
        `/api/admin/users/${encodeURIComponent(userId)}?section=story&limit=20&offset=${pageParam}`
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.nextOffset ?? undefined
        : undefined,
    enabled: Boolean(userId) && activeTab === "story",
    staleTime: 60_000,
  });

  // ========================================
  // DERIVED DATA
  // ========================================

  const profile = summaryQuery.data?.profile;

  const storyRecords =
    storyQuery.data?.pages.flatMap(
      (page) => page.records
    ) ?? [];

  const roadmapsByLanguage = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; roadmaps: Roadmap[] }
    >();

    for (const roadmap of summaryQuery.data?.roadmaps ?? []) {
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
  }, [summaryQuery.data?.roadmaps]);

  const medal = profile
    ? getMedal(profile.medal)
    : getMedal("bronze");

  const xp = Math.max(0, profile?.xp ?? 0);

  const xpToNext =
    profile?.nextMedalXp === null ||
    profile?.nextMedalXp === undefined
      ? 0
      : Math.max(0, profile.nextMedalXp - xp);

  const medalProgress =
    profile?.medal === "gold"
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            ((profile?.xpIntoTier ?? 0) / 250) * 100
          )
        );

  // ========================================
  // LOADING
  // ========================================

  if (summaryQuery.isLoading && !summaryQuery.data) {
    return (
      <PageShell className="h-full min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl space-y-5 p-4 sm:p-6 lg:p-8">
          <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>

          <div className="h-60 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </PageShell>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (!summaryQuery.data || !profile) {
    return (
      <PageShell className="h-full min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl space-y-5 p-4 sm:p-6 lg:p-8">
          <Link
            href={`/admin-portal/${adminId}/accounts`}
            className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to accounts
          </Link>

          <ErrorState
            message={
              summaryQuery.error instanceof Error
                ? summaryQuery.error.message
                : "Unable to load learner profile."
            }
            retry={() => void summaryQuery.refetch()}
          />
        </div>
      </PageShell>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <main className="mx-auto w-full max-w-screen-2xl space-y-6 p-4 text-slate-900 sm:p-6 lg:p-8">

        {/* BACK NAVIGATION */}

        <Link
          href={`/admin-portal/${adminId}/accounts`}
          className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 transition hover:text-cyan-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to accounts
        </Link>

        {/* PROFILE HEADER */}

        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-500 to-teal-500 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[30px] border-white/10" />

            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80">
                <Sparkles className="h-4 w-4" />
                Admin learner overview
              </div>

              <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                Learner profile
              </h1>

              <p className="mt-2 text-sm text-white/80">
                Monitor learning activity, achievements, and progression.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50 text-2xl font-black text-cyan-800">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-2xl font-black text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Learner ID:{" "}
                <span className="font-semibold text-slate-700">
                  {profile.id}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Joined {formatDate(profile.joinedAt)}
              </p>
            </div>

            <div className={`flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black ${medal.color}`}>
              <span className="text-xl">{medal.emoji}</span>
              {medal.label} medal
            </div>
          </div>
        </section>

        {/* STATISTICS */}

        <section>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Performance overview
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              Learner statistics
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Zap className="h-5 w-5" />}
              label="Total XP"
              value={xp.toLocaleString()}
              color="bg-cyan-100 text-cyan-700"
            />

            <StatCard
              icon={<Medal className="h-5 w-5" />}
              label="Current medal"
              value={medal.label}
              color="bg-amber-100 text-amber-700"
            />

            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Stage records"
              value={profile.foundationStageRecordCount.toLocaleString()}
              color="bg-teal-100 text-teal-700"
            />

            <StatCard
              icon={<Gamepad2 className="h-5 w-5" />}
              label="Story sessions"
              value={profile.storySessionCount.toLocaleString()}
              color="bg-violet-100 text-violet-700"
            />
          </div>
        </section>

        {/* MEDAL PROGRESSION */}

        <section className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Trophy className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-black text-slate-900">
                  Medal progression
                </h2>

                <p className="text-xs text-slate-500">
                  Current achievement level
                </p>
              </div>
            </div>

            <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800">
              {profile.medal === "gold"
                ? "All medals earned"
                : `${xpToNext.toLocaleString()} XP to next medal`}
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 transition-all duration-700"
              style={{ width: `${medalProgress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              {
                name: "Bronze",
                emoji: "🥉",
                xp: "0 XP",
                active: profile.medal === "bronze",
              },
              {
                name: "Silver",
                emoji: "🥈",
                xp: "250 XP",
                active: profile.medal === "silver",
              },
              {
                name: "Gold",
                emoji: "🥇",
                xp: "500 XP",
                active: profile.medal === "gold",
              },
            ].map((item) => (
              <div
                key={item.name}
                className={`rounded-xl border p-3 text-center ${
                  item.active
                    ? "border-cyan-300 bg-cyan-50 shadow-sm"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <p className="text-xl">{item.emoji}</p>

                <p className="mt-1 text-xs font-black text-slate-800">
                  {item.name}
                </p>

                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  {item.xp}
                </p>

                {item.active && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-black text-cyan-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* LEARNING PROGRESSION */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Learning activity
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Learner progression
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review the learner's foundation roadmaps, individual stages, and story-session performance.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("foundation")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-black transition ${
                  activeTab === "foundation"
                    ? "bg-white text-cyan-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Foundation
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("story")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-black transition ${
                  activeTab === "story"
                    ? "bg-white text-cyan-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Swords className="h-4 w-4" />
                Story
              </button>
            </div>
          </div>

          {/* FOUNDATION */}

          {activeTab === "foundation" && (
            <div className="space-y-6 p-4 sm:p-6">
              {roadmapsByLanguage.length === 0 ? (
                <EmptyState
                  icon={<Globe2 className="h-7 w-7" />}
                  title="No roadmaps available"
                  description="There are no foundation roadmaps available to display."
                />
              ) : (
                roadmapsByLanguage.map((group) => (
                  <div
                    key={group.roadmaps[0]?.language.id}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-5 w-5 text-cyan-700" />

                      <h3 className="font-black text-slate-800">
                        {group.name}
                      </h3>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                        {group.roadmaps.length} roadmaps
                      </span>
                    </div>

                    {group.roadmaps.map((roadmap) => (
                      <RoadmapCard
                        key={roadmap.id}
                        roadmap={roadmap}
                        userId={userId}
                      />
                    ))}
                  </div>
                ))
              )}

              <p className="text-xs leading-5 text-slate-500">
                Stage progress represents saved stage records, not necessarily successfully completed stages.
              </p>
            </div>
          )}

          {/* STORY */}

          {activeTab === "story" && (
            <div className="space-y-4 p-4 sm:p-6">
              {storyQuery.isError && (
                <ErrorState
                  message={
                    storyQuery.error instanceof Error
                      ? storyQuery.error.message
                      : "Unable to load story history."
                  }
                  retry={() => void storyQuery.refetch()}
                />
              )}

              {storyQuery.isLoading && storyRecords.length === 0 && (
                <LoadingState />
              )}

              {!storyQuery.isLoading &&
                !storyQuery.isError &&
                storyRecords.length === 0 && (
                  <EmptyState
                    icon={<Gamepad2 className="h-7 w-7" />}
                    title="No story activity yet"
                    description="This learner has not recorded any story-session progress."
                  />
                )}

              {storyRecords.map((record) => (
                <StoryCard
                  key={record.id}
                  record={record}
                />
              ))}

              {storyQuery.hasNextPage && (
                <button
                  type="button"
                  disabled={storyQuery.isFetchingNextPage}
                  onClick={() => void storyQuery.fetchNextPage()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-cyan-800 transition hover:bg-cyan-50 disabled:opacity-50"
                >
                  {storyQuery.isFetchingNextPage && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}

                  Load more stories
                </button>
              )}

              {storyQuery.isFetchNextPageError && (
                <ErrorState
                  message="Could not load additional story records."
                  retry={() => void storyQuery.fetchNextPage()}
                />
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="flex items-center justify-center gap-2 py-3 text-center text-xs text-slate-400">
          <Sparkles className="h-4 w-4" />
          Admin learner progress overview
        </footer>

      </main>
    </PageShell>
  );
}
