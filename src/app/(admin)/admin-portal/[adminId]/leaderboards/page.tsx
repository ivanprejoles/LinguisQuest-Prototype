"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/global/admin/foundation/page-shell";
import { useLeaderboard } from "@/hooks/use-leaderboards";
import {
  calculateFoundationLeaderboard,
  calculateStoryLeaderboard,
  getFoundationStats,
  getStoryStats,
} from "@/lib/leaderboards";
import { LeaderboardHeader } from "@/components/global/admin/leaderboards/leaderboard-header";
import { LeaderboardFilters } from "@/components/global/admin/leaderboards/leaderboard-filters";
import { LeaderboardDisplay } from "@/components/global/admin/leaderboards/leaderboard-display";
import { LeaderboardTable } from "@/components/global/admin/leaderboards/leaderboard-table";

export default function LeaderboardPage() {
  const [type, setType] = useState<"foundation" | "story">("foundation");
  const [languageId, setLanguageId] = useState("");
  const [roadmapId, setRoadmapId] = useState("");
  const [sessionId, setSessionId] = useState("");

  const {
    options,
    data,
    isLoading,
    error,
  } = useLeaderboard(type, languageId);

  // Select the first available language after the options request completes.
  useEffect(() => {
    if (!options?.languages?.length) return;

    const ordered = [...options.languages].sort(
      (a, b) => a.order - b.order
    );

    setLanguageId((current) =>
      ordered.some((language) => language.id === current)
        ? current
        : ordered[0]?.id ?? ""
    );
  }, [options?.languages]);

  const filterData = options ?? data;

  const languages = useMemo(
    () =>
      [...(filterData?.languages ?? [])].sort(
        (a, b) => a.order - b.order
      ),
    [filterData?.languages]
  );

  const roadmaps = useMemo(
    () =>
      [...(filterData?.roadmaps ?? [])]
        .filter((item) => item.languageId === languageId)
        .sort((a, b) => a.order - b.order),
    [filterData?.roadmaps, languageId]
  );

  const sessions = useMemo(
    () =>
      [...(filterData?.sessions ?? [])]
        .filter((item) => item.languageId === languageId)
        .sort((a, b) =>
          (a.title ?? "").localeCompare(b.title ?? "")
        ),
    [filterData?.sessions, languageId]
  );

  // Clear a selected filter if it no longer belongs to the selected language.
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
  const rankings = isFoundation ? foundation : story;

  const foundationScores = useMemo(
    () =>
      (data?.scores ?? []).filter(
        (score) => !roadmapId || score.roadmapId === roadmapId
      ),
    [data?.scores, roadmapId]
  );

  const stats = useMemo(
    () =>
      isFoundation
        ? getFoundationStats(foundation, foundationScores)
        : getStoryStats(story),
    [isFoundation, foundation, foundationScores, story]
  );

  const activeLanguage = languages.find(
    (language) => language.id === languageId
  );

  const errorMessage =
    error instanceof Error ? error.message : error ? "Something went wrong." : "";

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:p-8">
        <LeaderboardHeader stats={stats} category={type} />

        <LeaderboardFilters
          type={type}
          setType={setType}
          languageId={languageId}
          setLanguageId={setLanguageId}
          roadmapId={roadmapId}
          setRoadmapId={setRoadmapId}
          sessionId={sessionId}
          setSessionId={setSessionId}
          data={filterData}
        />

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <LeaderboardDisplay
          entries={rankings}
          type={type}
          isLoading={isLoading}
        />

        <LeaderboardTable
          entries={rankings}
          type={type}
          isLoading={isLoading}
        />

        <footer className="flex flex-col gap-1 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Leaderboard administration ·{" "}
            {activeLanguage?.name ?? "No language selected"}
          </p>
          <p>
            {isFoundation
              ? "Foundation rankings are ordered by XP and progression."
              : "Story rankings are ordered by wins, win rate, and losses."}
          </p>
        </footer>
      </div>
    </PageShell>
  );
}