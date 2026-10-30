
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Crown,
  Flame,
  Gamepad2,
  Globe2,
  Medal,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";

type Language = {
  id: string;
  name: string;
  countryCode: string;
  order: number;
};

type Roadmap = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  languageId: string;
};

type Session = {
  id: string;
  title: string | null;
  languageId: string;
};

type PublicUser = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  xp: number
};

type FoundationScore = {
  id: string;
  userId: string;
  languageId: string;
  roadmapId: string;
  stageId: string;
  durationMs: number;
  wrongAttempts: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
  user: PublicUser;
  stage: {
    id: string;
    order: number;
    roadmapId: string;
    roadmap: {
      id: string;
      title: string;
      order: number;
      languageId: string;
    };
  };
};

type StoryProgress = {
  id: string;
  userId: string;
  sessionId: string;
  currentNodeId: string | null;
  winCount: number;
  lossCount: number;
  updatedAt: string;
  user: PublicUser;
  session: Session;
};

type ApiResponse = {
  languages: Language[];
  roadmaps: Roadmap[];
  sessions: Session[];
  scores: FoundationScore[];
  progress: StoryProgress[];
  error?: string;
};

type FoundationEntry = {
  userId: string;
  name: string;
  imageUrl: string | null;
  roadmapId: string;
  roadmapTitle: string;
  roadmapOrder: number;
  stageOrder: number;
  durationMs: number;
  wrongAttempts: number;
  playCount: number;
  points: number;
  recordedStages: number;
  totalDurationMs: number;
  totalWrongAttempts: number;
};

type StoryEntry = {
  userId: string;
  name: string;
  imageUrl: string | null;
  wins: number;
  losses: number;
  winRate: number;
  sessionsPlayed: number;
};

function calculateFoundationLeaderboard(
  scores: FoundationScore[],
  selectedRoadmapId: string
): FoundationEntry[] {
  const filtered = scores.filter(
    (score) =>
      score.roadmapId === score.stage.roadmapId &&
      score.roadmapId === score.stage.roadmap.id &&
      score.languageId === score.stage.roadmap.languageId &&
      (!selectedRoadmapId || score.roadmapId === selectedRoadmapId)
  );

  const grouped = new Map<
    string,
    { user: PublicUser; records: FoundationScore[] }
  >();

  for (const score of filtered) {
    const current = grouped.get(score.userId);

    if (current) {
      current.records.push(score);
    } else {
      grouped.set(score.userId, {
        user: score.user,
        records: [score],
      });
    }
  }

  const entries: FoundationEntry[] = [];

  for (const [userId, data] of grouped) {
    const records = data.records;

    const sorted = [...records].sort((a, b) => {
      if (a.stage.roadmap.order !== b.stage.roadmap.order) {
        return b.stage.roadmap.order - a.stage.roadmap.order;
      }

      if (a.stage.order !== b.stage.order) {
        return b.stage.order - a.stage.order;
      }

      return (
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      );
    });

    const highest = sorted[0];
    if (!highest) continue;

    entries.push({
      userId,
      name: data.user.name?.trim() || "Learner",
      imageUrl: data.user.imageUrl,
      roadmapId: highest.roadmapId,
      roadmapTitle: highest.stage.roadmap.title,
      roadmapOrder: highest.stage.roadmap.order,
      stageOrder: highest.stage.order,
      durationMs: highest.durationMs,
      wrongAttempts: highest.wrongAttempts,
      playCount: highest.playCount,
      points: data.user.xp,
      recordedStages: records.length,
      totalDurationMs: records.reduce(
        (sum, record) => sum + record.durationMs,
        0
      ),
      totalWrongAttempts: records.reduce(
        (sum, record) => sum + record.wrongAttempts,
        0
      ),
    });
  }

  return entries.sort((a, b) => {
    if (a.points !== b.points) {
        return b.points - a.points;
    }

    // Tie-breakers when users have equal XP
    if (a.roadmapOrder !== b.roadmapOrder) {
        return b.roadmapOrder - a.roadmapOrder;
    }

    if (a.stageOrder !== b.stageOrder) {
        return b.stageOrder - a.stageOrder;
    }

    return a.name.localeCompare(b.name);
    });
}

function calculateStoryLeaderboard(
  progress: StoryProgress[],
  selectedSessionId: string
): StoryEntry[] {
  const filtered = progress.filter(
    (item) =>
      !selectedSessionId || item.sessionId === selectedSessionId
  );

  const grouped = new Map<
    string,
    {
      user: PublicUser;
      wins: number;
      losses: number;
      sessionsPlayed: number;
    }
  >();

  for (const item of filtered) {
    const current = grouped.get(item.userId);

    if (current) {
      current.wins += item.winCount;
      current.losses += item.lossCount;
      current.sessionsPlayed += 1;
    } else {
      grouped.set(item.userId, {
        user: item.user,
        wins: item.winCount,
        losses: item.lossCount,
        sessionsPlayed: 1,
      });
    }
  }

  const entries: StoryEntry[] = [];

  for (const [userId, item] of grouped) {
    const games = item.wins + item.losses;

    entries.push({
      userId,
      name: item.user.name?.trim() || "Learner",
      imageUrl: item.user.imageUrl,
      wins: item.wins,
      losses: item.losses,
      winRate: games ? item.wins / games : 0,
      sessionsPlayed: item.sessionsPlayed,
    });
  }

  return entries.sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    if (a.winRate !== b.winRate) return b.winRate - a.winRate;
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.name.localeCompare(b.name);
  });
}

function formatDuration(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function Avatar({
  name,
  imageUrl,
  size = "normal",
}: {
  name: string;
  imageUrl: string | null;
  size?: "normal" | "large";
}) {
  const sizeClass =
    size === "large"
      ? "h-14 w-14 text-lg sm:h-16 sm:w-16 sm:text-xl"
      : "h-9 w-9 text-xs sm:h-11 sm:w-11 sm:text-sm";

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-lime-100 font-extrabold text-lime-800 shadow-sm`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name}'s avatar`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

function PodiumCard({
  rank,
  name,
  imageUrl,
  subtitle,
  score,
  kind,
}: {
  rank: 1 | 2 | 3;
  name: string;
  imageUrl: string | null;
  subtitle: string;
  score: string;
  kind: "foundation" | "story";
}) {
  const styles = {
    1: {
      card: "border-yellow-300 bg-gradient-to-b from-yellow-100 to-amber-50",
      crown: "text-yellow-600",
      medal: "bg-yellow-400 text-yellow-950",
      label: "CHAMPION",
      height: "sm:mt-0",
    },
    2: {
      card: "border-slate-300 bg-gradient-to-b from-slate-100 to-white",
      crown: "text-slate-500",
      medal: "bg-slate-300 text-slate-800",
      label: "RUNNER-UP",
      height: "sm:mt-8",
    },
    3: {
      card: "border-orange-300 bg-gradient-to-b from-orange-100 to-orange-50",
      crown: "text-orange-600",
      medal: "bg-orange-300 text-orange-950",
      label: "TOP 3",
      height: "sm:mt-12",
    },
  }[rank];

  return (
    <div
      className={`${styles.height} relative flex min-w-0 flex-col items-center rounded-3xl border-2 p-4 text-center shadow-[0_5px_0_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-1 sm:p-5 ${styles.card}`}
    >
      {rank === 1 && (
        <Crown
          className={`absolute -top-5 h-9 w-9 -rotate-6 ${styles.crown}`}
          fill="currentColor"
        />
      )}

      <span
        className={`mb-3 mt-2 rounded-full px-3 py-1 text-[10px] font-black tracking-widest ${styles.medal}`}
      >
        {styles.label}
      </span>

      <div className="relative">
        <div
          className={`rounded-2xl border-4 ${
            rank === 1
              ? "border-yellow-400"
              : rank === 2
                ? "border-slate-300"
                : "border-orange-300"
          }`}
        >
          <Avatar name={name} imageUrl={imageUrl} size="large" />
        </div>
        <span
          className={`absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-black ${styles.medal}`}
        >
          {rank}
        </span>
      </div>

      <p className="mt-4 w-full truncate text-base font-extrabold text-slate-900">
        {name}
      </p>
      <p className="mt-1 min-h-8 text-xs font-semibold text-slate-600">
        {subtitle}
      </p>

      <div
        className={`mt-3 flex items-center gap-1 rounded-full px-3 py-2 text-xs font-black sm:text-sm ${
          kind === "foundation"
            ? "bg-lime-200 text-lime-950"
            : "bg-violet-200 text-violet-950"
        }`}
      >
        {kind === "foundation" ? (
          <Zap className="h-4 w-4" fill="currentColor" />
        ) : (
          <Swords className="h-4 w-4" />
        )}
        {score}
      </div>
    </div>
  );
}

export default function LeaderboardsPage() {
  const [type, setType] = useState<"foundation" | "story">("foundation");
  const [languageId, setLanguageId] = useState("");
  const [roadmapId, setRoadmapId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const response = await fetch("/api/client/leaderboards", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(result.error || "Couldn't load languages.");
        }

        setData(result);

        const ordered = [...result.languages].sort(
          (a, b) => a.order - b.order
        );

        setLanguageId((current) =>
          ordered.some((language) => language.id === current)
            ? current
            : ordered[0]?.id ?? ""
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!languageId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadLeaderboard() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ type, languageId });
        const response = await fetch(
          `/api/client/leaderboards?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        const result = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(
            result.error || "Couldn't load the leaderboard."
          );
        }

        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadLeaderboard();
    return () => controller.abort();
  }, [type, languageId]);

  const languages = useMemo(
    () =>
      [...(data?.languages ?? [])].sort((a, b) => a.order - b.order),
    [data?.languages]
  );

  const roadmaps = useMemo(
    () =>
      [...(data?.roadmaps ?? [])]
        .filter((item) => item.languageId === languageId)
        .sort((a, b) => a.order - b.order),
    [data?.roadmaps, languageId]
  );

  const sessions = useMemo(
    () =>
      [...(data?.sessions ?? [])]
        .filter((item) => item.languageId === languageId)
        .sort((a, b) =>
          (a.title ?? "").localeCompare(b.title ?? "")
        ),
    [data?.sessions, languageId]
  );

  useEffect(() => {
    if (roadmapId && !roadmaps.some((item) => item.id === roadmapId)) {
      setRoadmapId("");
    }
  }, [roadmaps, roadmapId]);

  useEffect(() => {
    if (sessionId && !sessions.some((item) => item.id === sessionId)) {
      setSessionId("");
    }
  }, [sessions, sessionId]);

  const foundation = useMemo(
    () =>
      calculateFoundationLeaderboard(data?.scores ?? [], roadmapId),
    [data?.scores, roadmapId]
  );

  const story = useMemo(
    () =>
      calculateStoryLeaderboard(data?.progress ?? [], sessionId),
    [data?.progress, sessionId]
  );

  const isFoundation = type === "foundation";
  const activeLanguage = languages.find(
    (item) => item.id === languageId
  );
  const rankings = isFoundation ? foundation : story;
  const totalPlayers = rankings.length;
  const visibleRankings = rankings.slice(0, 100);
  const hiddenPlayers = Math.max(0, totalPlayers - visibleRankings.length);
  const topThree = rankings.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#ecfeff] pb-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Hero banner */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br bg-gradient-to-br from-cyan-500 via-cyan-500 to-teal-500 px-4 py-6 text-white shadow-[0_8px_0_#0891b2] sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-64 w-64 rounded-full border-[30px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 -z-10 h-52 w-52 rounded-full bg-yellow-300/20" />

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
                <Sparkles className="h-4 w-4" />
                Your next level starts here
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                The leaderboard
              </h1>
              <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-cyan-50 sm:text-base">
                Learn, play, climb the ranks, and earn your place among
                the legends. Every stage is a new chance to shine!
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-3">
                  <Trophy className="h-5 w-5 text-yellow-200" />
                  <div>
                    <p className="text-xl font-black text-white">
                      {totalPlayers}
                    </p>
                    <p className="text-xs font-semibold text-cyan-50">
                      Ranked learners
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-3">
                  <Flame className="h-5 w-5 text-orange-200" />
                  <div>
                    <p className="text-xl font-black text-white">
                      {isFoundation ? "XP" : "Wins"}
                    </p>
                    <p className="text-xs font-semibold text-green-50">
                      Keep progressing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden shrink-0 items-center justify-center sm:flex">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-white/20 bg-yellow-300 shadow-xl">
                <Trophy className="h-20 w-20 text-yellow-950" fill="currentColor" />
                <Star
                  className="absolute -right-2 top-3 h-9 w-9 text-white"
                  fill="currentColor"
                />
                <Sparkles className="absolute -left-3 bottom-5 h-8 w-8 text-yellow-100" />
              </div>
            </div>
          </div>
        </section>

        {/* Mode selection */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setType("foundation")}
            className={`group flex items-center gap-3 rounded-3xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 sm:gap-4 sm:p-5 ${
              isFoundation
                ? "border-lime-500 bg-white shadow-[0_5px_0_#a3cf65]"
                : "border-slate-200 bg-white/70 hover:border-lime-300"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-800 sm:h-14 sm:w-14">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-slate-900">Foundation League</p>
              <p className="mt-1 text-sm text-slate-600">
                Climb roadmaps and master new stages.
              </p>
            </div>
            {isFoundation && (
              <Check className="h-6 w-6 shrink-0 text-lime-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setType("story")}
            className={`group flex items-center gap-3 rounded-3xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 sm:gap-4 sm:p-5 ${
              !isFoundation
                ? "border-violet-500 bg-white shadow-[0_5px_0_#c4b5fd]"
                : "border-slate-200 bg-white/70 hover:border-violet-300"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-800 sm:h-14 sm:w-14">
              <Gamepad2 className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-slate-900">Story Champions</p>
              <p className="mt-1 text-sm text-slate-600">
                Win encounters and become a story legend.
              </p>
            </div>
            {!isFoundation && (
              <Check className="h-6 w-6 shrink-0 text-violet-600" />
            )}
          </button>
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-3xl border border-lime-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-lime-700" />
            <h2 className="font-extrabold text-slate-900">
              Choose your arena
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="language"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Learning language
              </label>
              <div className="relative">
                <select
                  id="language"
                  value={languageId}
                  onChange={(event) => {
                    setLanguageId(event.target.value);
                    setRoadmapId("");
                    setSessionId("");
                  }}
                  className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 font-bold text-slate-900 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
                >
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              </div>

              {activeLanguage && (
                <div className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-lime-50 px-3 py-2">
                  <img
                    src={`https://flagcdn.com/w80/${activeLanguage.countryCode.toLowerCase()}.png`}
                    alt={`${activeLanguage.name} flag`}
                    width={80}
                    height={53}
                    loading="lazy"
                    className="h-9 w-14 rounded-md border border-slate-200 object-cover"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {activeLanguage.name}
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      Selected language
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="target"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                {isFoundation ? "Roadmap challenge" : "Story adventure"}
              </label>
              <div className="relative">
                <select
                  id="target"
                  value={isFoundation ? roadmapId : sessionId}
                  onChange={(event) =>
                    isFoundation
                      ? setRoadmapId(event.target.value)
                      : setSessionId(event.target.value)
                  }
                  className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 font-bold text-slate-900 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
                >
                  <option value="">
                    All {isFoundation ? "roadmaps" : "story sessions"}
                  </option>
                  {isFoundation
                    ? roadmaps.map((roadmap) => (
                        <option key={roadmap.id} value={roadmap.id}>
                          {roadmap.order}. {roadmap.title}
                        </option>
                      ))
                    : sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.title || "Untitled session"}
                        </option>
                      ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {isFoundation
                  ? "Compare progress across all roadmaps or focus on one."
                  : "Compare all stories or focus on one adventure."}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border-2 border-red-200 bg-red-50 p-4 font-semibold text-red-800"
          >
            {error}
          </div>
        )}

        {/* Podium */}
        <section className="mt-9">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                Hall of fame
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Top learners <span className="text-yellow-500">★</span>
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-yellow-100 px-3 py-2 text-xs font-extrabold text-yellow-900 sm:flex">
              <Medal className="h-4 w-4" />
              TOP 3
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 rounded-3xl border border-lime-100 bg-white p-6 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-3xl bg-slate-100"
                />
              ))}
            </div>
          ) : topThree.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-lime-200 bg-white/70 px-6 py-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-4 text-lg font-black text-slate-900">
                Your podium is waiting!
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Complete stages or win story encounters to claim a spot.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3 sm:items-end">
              {([2, 1, 3] as const)
                .filter((rank) => topThree.length >= rank)
                .map((rank) => {
                  const entry = topThree[rank - 1];

                  if (!entry) return null;

                  return (
                    <PodiumCard
                      key={entry.userId}
                      rank={rank}
                      name={entry.name}
                      imageUrl={entry.imageUrl}
                      kind={type}
                      subtitle={
                        isFoundation
                            ? `Stage ${(entry as FoundationEntry).stageOrder} · ${
                                (entry as FoundationEntry).roadmapTitle
                            }`
                            : `${((entry as StoryEntry).winRate * 100).toFixed(0)}% win rate`
                        }
                      score={
                        isFoundation
                          ? `${(
                              entry as FoundationEntry
                            ).points.toLocaleString()} XP`
                          : `${(entry as StoryEntry).wins} wins`
                      }
                    />
                  );
                })}
            </div>
          )}
        </section>

        {/* Full rankings */}
        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                Keep climbing
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {totalPlayers > 100 ? "Top 100 rankings" : "All rankings"}
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
              {totalPlayers} players
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-lime-50 to-white px-5 py-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isFoundation
                    ? "bg-lime-200 text-lime-900"
                    : "bg-violet-200 text-violet-900"
                }`}
              >
                {isFoundation ? (
                  <Zap className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Swords className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">
                  {isFoundation ? "Foundation League" : "Story Champions"}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  {isFoundation
                    ? "Progression first, then stage performance."
                    : "Wins first, followed by win rate and losses."}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : totalPlayers === 0 ? (
              <div className="p-10 text-center">
                <Award className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-900">
                  No rankings to show yet
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Try another language or challenge.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleRankings.map((entry, index) => {
                  const isTopThree = index < 3;
                  const placeStyle =
                    index === 0
                      ? "bg-yellow-100 text-yellow-900"
                      : index === 1
                        ? "bg-slate-200 text-slate-800"
                        : index === 2
                          ? "bg-orange-100 text-orange-900"
                          : "bg-slate-100 text-slate-600";

                  return (
                    <div
                      key={entry.userId}
                      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 transition-colors hover:bg-lime-50/70 sm:gap-5 sm:px-6 sm:py-4 ${
                        isTopThree ? "bg-lime-50/30" : "bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black sm:h-10 sm:w-10 sm:text-sm ${placeStyle}`}
                      >
                        {index === 0 ? (
                          <Crown className="h-5 w-5" fill="currentColor" />
                        ) : index === 1 ? (
                          <Medal className="h-5 w-5" />
                        ) : index === 2 ? (
                          <Award className="h-5 w-5" />
                        ) : (
                          `#${index + 1}`
                        )}
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          name={entry.name}
                          imageUrl={entry.imageUrl}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-extrabold text-slate-900">
                            {entry.name}
                          </p>

                          {isFoundation ? (
                            <>
                              <p className="truncate text-xs font-semibold text-slate-600">
                                {(entry as FoundationEntry).roadmapTitle}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-lime-500"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        ((entry as FoundationEntry)
                                          .stageOrder /
                                          Math.max(
                                            1,
                                            (entry as FoundationEntry)
                                              .stageOrder + 3
                                          )) *
                                          100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500">
                                  Stage {(entry as FoundationEntry).stageOrder}
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs font-semibold text-slate-600">
                              {(entry as StoryEntry).sessionsPlayed}{" "}
                              {(
                                entry as StoryEntry
                              ).sessionsPlayed === 1
                                ? "session"
                                : "sessions"}{" "}
                              played
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 text-right">
                        {isFoundation ? (
                          <>
                            <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-lime-100 px-2 py-1.5 text-xs font-black text-lime-900 sm:px-3 sm:text-sm">
                              <Zap
                                className="h-4 w-4 text-lime-700"
                                fill="currentColor"
                              />
                              {(entry as FoundationEntry).points.toLocaleString()}
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-slate-500">
                              {formatDuration(
                                (entry as FoundationEntry).durationMs
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-violet-100 px-2 py-1.5 text-xs font-black text-violet-900 sm:px-3 sm:text-sm">
                              <Swords className="h-4 w-4" />
                              {(entry as StoryEntry).wins} wins
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-slate-500">
                              {(
                                (entry as StoryEntry).winRate * 100
                              ).toFixed(1)}
                              % win rate
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {hiddenPlayers > 0 && (
                  <div className="flex items-center justify-center gap-3 bg-slate-50 px-4 py-4 text-center sm:px-6">
                    <span className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 px-3 text-sm font-black text-cyan-900">
                      +{hiddenPlayers.toLocaleString()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-700">
                        {hiddenPlayers.toLocaleString()} more learners
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Showing the top 100 of {totalPlayers.toLocaleString()} players.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 rounded-2xl border border-lime-200 bg-white px-3 py-2 text-center text-xs font-bold text-slate-600 sm:rounded-full sm:px-4">
            <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            Practice a little every day. Great things add up!
          </div>
          <p className="max-w-xl text-xs leading-5 text-slate-500">
            Foundation scores use the selected highest-stage record.
            Recorded stages may not equal completed stages unless your
            application only stores scores for successful completions.
          </p>
        </footer>
      </div>
    </main>
  );
}
