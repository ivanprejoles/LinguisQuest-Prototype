"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  Globe2,
  LoaderCircle,
  Medal,
  RefreshCw,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";

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
  language: { id: string; name: string; countryCode: string };
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
    language: { name: string; countryCode: string };
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
    language: { id: string; name: string; countryCode: string };
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

type SummaryResponse = { profile: ProfileSummary; roadmaps: RoadmapSummary[] };
type ActivityOption = { id?: string; text?: string; word?: string; imageUrl?: string | null };
type MatchingPair = { id?: string; sourceText?: string; targetText?: string };

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
  if (Number.isNaN(date.getTime())) return "Last activity unavailable";
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
      return { label: "Gold", emoji: "🥇", className: "bg-amber-100 text-amber-800" };
    case "silver":
      return { label: "Silver", emoji: "🥈", className: "bg-slate-100 text-slate-700" };
    default:
      return { label: "Bronze", emoji: "🥉", className: "bg-orange-100 text-orange-800" };
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

function ChipList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <p className="text-xs text-slate-500">No preview items saved for this stage.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="rounded-lg border border-cyan-100 bg-cyan-50 px-2.5 py-1.5 text-sm font-semibold text-cyan-900"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function StagePreview({ record }: { record: FoundationStageRecord }) {
  const payload = record.stage.payloadPreview ?? {};
  const question = getText(payload.question) || record.stage.question;
  const type = record.stage.type;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold uppercase tracking-wide text-cyan-800">
          Stage preview
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
          {type}
        </span>
      </div>

      {question ? <p className="mt-3 font-bold text-slate-900">{question}</p> : null}

      {type === "sentenceBuilder" ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">Scrambled words</p>
          <ChipList values={getStringArray(payload.scrambledWordBank)} />
        </div>
      ) : null}

      {type === "tracing" ? (
        <div className="mt-3 flex min-h-20 items-center justify-center rounded-xl border border-cyan-100 bg-white">
          <span className="text-4xl font-black text-cyan-700">
            {getText(payload.targetLetter) || "—"}
          </span>
        </div>
      ) : null}

      {type === "fillInTheBlank" ? (
        <div className="mt-3 space-y-3">
          {getText(payload.fullSentence) ? (
            <p className="rounded-xl bg-white p-3 text-sm text-slate-700">
              {getText(payload.fullSentence)}
            </p>
          ) : null}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500">Choices</p>
            <ChipList
              values={getObjectArray<ActivityOption>(payload.options)
                .map((option) => getText(option.word))
                .filter(Boolean)}
            />
          </div>
        </div>
      ) : null}

      {type === "tapWhatYouHear" ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">Word bank</p>
          <ChipList values={getStringArray(payload.wordBank)} />
        </div>
      ) : null}

      {type === "multipleChoice" ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {getObjectArray<ActivityOption>(payload.options).map((option, index) => (
            <div
              key={option.id || `${option.text}-${index}`}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"
            >
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                />
              ) : null}
              <span className="break-words text-sm font-semibold text-slate-700">
                {option.text || "Choice"}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {type === "matching" ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {getObjectArray<MatchingPair>(payload.pairs).map((pair, index) => (
            <div
              key={pair.id || `${pair.sourceText}-${index}`}
              className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm"
            >
              <span className="break-words font-bold text-slate-800">
                {pair.sourceText || "—"}
              </span>
              <span className="break-words text-slate-600">
                {pair.targetText || "—"}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {!([
        "sentenceBuilder",
        "tracing",
        "fillInTheBlank",
        "tapWhatYouHear",
        "multipleChoice",
        "matching",
      ] as string[]).includes(type) ? (
        <p className="mt-3 text-sm text-slate-500">
          A preview is not available for this activity type yet.
        </p>
      ) : null}
    </div>
  );
}


function RoadmapProgressCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState<FoundationPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const percentage = roadmap.totalStages > 0
    ? Math.min(100, Math.round((roadmap.stagesWithRecords / roadmap.totalStages) * 100))
    : 0;

  async function loadPage(offset: number, append: boolean) {
    setLoading(true);
    setError("");
    try {
      const next = await fetchJson<FoundationPage>(
        `/api/client/profile?section=foundation&roadmapId=${encodeURIComponent(roadmap.id)}&limit=20&offset=${offset}`,
      );
      setPage((current) =>
        append && current
          ? { ...next, records: [...current.records, ...next.records] }
          : next,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load stages.");
    } finally {
      setLoading(false);
    }
  }

  function toggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded && !page && !loading) void loadPage(0, false);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        className="flex w-full min-w-0 items-center gap-3 p-4 text-left transition hover:bg-cyan-50/50 sm:p-5"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-slate-900">{roadmap.title}</p>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
            {roadmap.language.name} · {roadmap.stagesWithRecords} of {roadmap.totalStages} stages with records
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-cyan-500 transition-[width]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm font-extrabold text-cyan-800">
          <span>{percentage}%</span>
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-slate-100 p-4 sm:p-5">
          {roadmap.description ? (
            <p className="mb-4 text-sm leading-6 text-slate-600">{roadmap.description}</p>
          ) : null}
          {loading && !page ? (
            <div className="flex items-center gap-2 py-6 text-sm font-semibold text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading stage details…
            </div>
          ) : null}
          {error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadPage(page?.records.length ?? 0, Boolean(page))}
                className="inline-flex items-center gap-1 font-bold underline underline-offset-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          ) : null}
          {page && page.records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 font-bold text-slate-800">No stage records yet</p>
              <p className="mt-1 text-sm text-slate-500">Play a stage in this roadmap to see its details here.</p>
            </div>
          ) : null}
          {page?.records.map((record) => (
            <div key={record.id} className="border-b border-slate-100 py-4 last:border-b-0 last:pb-0 first:pt-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-slate-900">Stage {record.stage.order}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {record.stage.question || "Activity details"}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-900">
                  {record.stage.type}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Time played" value={formatDuration(record.durationMs)} />
                <Metric label="Play count" value={record.playCount.toLocaleString()} />
                <Metric label="Wrong attempts" value={record.wrongAttempts.toLocaleString()} />
                <Metric label="Last played" value={formatUpdatedAt(record.updatedAt)} />
              </div>
              <StagePreview record={record} />
            </div>
          ))}
          {page?.hasMore ? (
            <div className="pt-4 text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => page.nextOffset !== null && void loadPage(page.nextOffset, true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-extrabold text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Load more stages
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export default function ProfileProgressSection() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [activeTab, setActiveTab] = useState<"foundation" | "story">("foundation");
  const [storyPage, setStoryPage] = useState<StoryPage | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState("");

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      setSummary(await fetchJson<SummaryResponse>("/api/client/profile?section=summary"));
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Could not load your profile.");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadStory = useCallback(async (offset: number, append: boolean) => {
    setStoryLoading(true);
    setStoryError("");
    try {
      const next = await fetchJson<StoryPage>(
        `/api/client/profile?section=story&limit=20&offset=${offset}`,
      );
      setStoryPage((current) =>
        append && current ? { ...next, records: [...current.records, ...next.records] } : next,
      );
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : "Could not load story progress.");
    } finally {
      setStoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (activeTab === "story" && !storyPage && !storyLoading && !storyError) {
      void loadStory(0, false);
    }
  }, [activeTab, storyPage, storyLoading, storyError, loadStory]);

  const medal = summary ? medalDetails(summary.profile.medal) : medalDetails("bronze");
  const roadmapsByLanguage = useMemo(() => {
    const groups = new Map<string, { name: string; roadmaps: RoadmapSummary[] }>();
    for (const roadmap of summary?.roadmaps ?? []) {
      const group = groups.get(roadmap.language.id) ?? {
        name: roadmap.language.name,
        roadmaps: [],
      };
      group.roadmaps.push(roadmap);
      groups.set(roadmap.language.id, group);
    }
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [summary?.roadmaps]);

  if (summaryLoading && !summary) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6">
        <div className="h-36 animate-pulse rounded-3xl bg-slate-100" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-extrabold">We couldn’t load your profile</p>
          <p className="mt-1 text-sm">{summaryError || "Please try again."}</p>
          <button
            type="button"
            onClick={() => void loadSummary()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      </section>
    );
  }
  

  const profile = summary.profile;
  const xpToNextMedal = profile.nextMedalXp === null
    ? 0
    : Math.max(0, profile.nextMedalXp - profile.xp);
  const medalProgress = profile.medal === "gold"
    ? 100
    : Math.min(100, Math.max(0, (profile.xpIntoTier / 250) * 100));

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-12 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 sm:px-6 sm:py-8">
        {/* Profile identity */}
        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 sm:h-32" />
          <div className="-mt-10 flex flex-col gap-4 px-4 pb-5 sm:-mt-12 sm:flex-row sm:items-end sm:px-7 sm:pb-7">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-cyan-100 text-2xl font-black text-cyan-900 shadow-sm sm:h-24 sm:w-24">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt={`${profile.name}'s profile`} className="h-full w-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">{profile.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Learner since {formatDate(profile.joinedAt)}</p>
            </div>
            <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm font-extrabold ${medal.className}`}>
              <span aria-hidden="true" className="text-lg">{medal.emoji}</span>
              {medal.label} medal
            </div>
          </div>
        </section>

        {/* Profile statistics */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-700" />
            <h2 className="text-lg font-black">Statistics</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={<Zap className="h-5 w-5" />} label="Total XP" value={profile.xp.toLocaleString()} tone="cyan" />
            <StatCard icon={<Medal className="h-5 w-5" />} label="Current medal" value={medal.label} tone="amber" />
            <StatCard icon={<BookOpen className="h-5 w-5" />} label="Stage records" value={profile.foundationStageRecordCount.toLocaleString()} tone="teal" />
            <StatCard icon={<Gamepad2 className="h-5 w-5" />} label="Story sessions" value={profile.storySessionCount.toLocaleString()} tone="violet" />
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-extrabold text-slate-900">Medal progression</p>
              <p className="text-sm font-bold text-slate-600">
                {profile.medal === "gold" ? "Highest medal reached" : `${xpToNextMedal.toLocaleString()} XP to ${profile.medal === "bronze" ? "Silver" : "Gold"}`}
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-[width]" style={{ width: `${medalProgress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
              <span>🥉 Bronze · 0 XP</span>
              <span>🥈 Silver · 250 XP</span>
              <span>🥇 Gold · 500 XP</span>
            </div>
          </div>
        </section>

        {/* Foundation and story progression */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Your learning journey</p>
            <h2 className="mt-1 text-2xl font-black">Progression</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Check your roadmap stage history and story-session results.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("foundation")}
                className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold transition ${activeTab === "foundation" ? "bg-white text-cyan-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <BookOpen className="h-4 w-4 shrink-0" /> Foundation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("story")}
                className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold transition ${activeTab === "story" ? "bg-white text-violet-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Swords className="h-4 w-4 shrink-0" /> Story
              </button>
            </div>
          </div>

          {activeTab === "foundation" ? (
            <div className="space-y-6 p-4 sm:p-6">
              {roadmapsByLanguage.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-8 w-8" />}
                  title="No foundation roadmaps yet"
                  description="Your roadmap progression will show here once roadmaps are available."
                />
              ) : (
                roadmapsByLanguage.map((group) => (
                  <div key={group.name}>
                    <div className="mb-3 flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-cyan-700" />
                      <h3 className="font-extrabold text-slate-800">{group.name}</h3>
                    </div>
                    <div className="space-y-3">
                      {group.roadmaps.map((roadmap) => (
                        <RoadmapProgressCard key={roadmap.id} roadmap={roadmap} />
                      ))}
                    </div>
                  </div>
                ))
              )}
              <p className="text-xs leading-5 text-slate-500">
                Stage counts reflect saved UserStageScore records. If your app creates a record before a learner successfully completes a stage, these counts mean “played/recorded,” not necessarily “completed.”
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {storyError ? (
                <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  {storyError}
                  <button type="button" onClick={() => void loadStory(storyPage?.records.length ?? 0, Boolean(storyPage))} className="ml-2 font-bold underline">Retry</button>
                </div>
              ) : null}
              {storyLoading && !storyPage ? (
                <div className="flex items-center gap-2 py-8 text-sm font-semibold text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Loading story progress…
                </div>
              ) : null}
              {storyPage && storyPage.records.length === 0 ? (
                <EmptyState
                  icon={<Gamepad2 className="h-8 w-8" />}
                  title="Your story journey starts here"
                  description="Your story sessions, wins, and losses will appear here when you play."
                />
              ) : null}
              <div className="space-y-3">
                {storyPage?.records.map((record) => {
                  const games = record.wins + record.losses;
                  const winRate = games > 0 ? Math.round((record.wins / games) * 100) : 0;
                  return (
                    <article key={record.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:p-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-100 text-violet-800">
                        {record.session.imageUrl ? (
                          <img src={record.session.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <Gamepad2 className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-extrabold text-slate-900">{record.session.title || "Untitled story"}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {record.session.language.name} · {formatUpdatedAt(record.updatedAt)}
                        </p>
                        {record.session.description ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{record.session.description}</p>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:min-w-52">
                        <MiniStat label="Wins" value={record.wins.toLocaleString()} />
                        <MiniStat label="Losses" value={record.losses.toLocaleString()} />
                        <MiniStat label="Win rate" value={`${winRate}%`} />
                      </div>
                    </article>
                  );
                })}
              </div>
              {storyPage?.hasMore ? (
                <div className="pt-5 text-center">
                  <button
                    type="button"
                    disabled={storyLoading}
                    onClick={() => storyPage.nextOffset !== null && void loadStory(storyPage.nextOffset, true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-extrabold text-violet-800 transition hover:bg-violet-50 disabled:opacity-60"
                  >
                    {storyLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Load more stories
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <footer className="flex items-center justify-center gap-2 px-2 text-center text-xs leading-5 text-slate-500">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-700" /> Every practice session is another step forward.
        </footer>
      </div>
    </main>
  );
}

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
    cyan: "bg-cyan-50 text-cyan-800",
    amber: "bg-amber-50 text-amber-800",
    teal: "bg-teal-50 text-teal-800",
    violet: "bg-violet-50 text-violet-800",
  };
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <p className="mt-3 break-words text-xl font-black text-slate-900 sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-2 py-2.5 text-center">
      <p className="truncate text-sm font-black text-slate-900">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
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
    <div className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">{icon}</div>
      <h3 className="mt-3 font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
