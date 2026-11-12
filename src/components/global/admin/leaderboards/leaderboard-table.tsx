
"use client";

import Link from "next/link";
import {
  Award,
  Crown,
  Medal,
  Swords,
  Zap,
} from "lucide-react";
import { FoundationEntry, StoryEntry } from "@/types/leaderboards";
import { formatDuration } from "@/lib/leaderboards";
import { Avatar } from "./leaderboard-display";

type Entry = FoundationEntry | StoryEntry;

type Props = {
  entries: Entry[];
  type: "foundation" | "story";
  isLoading: boolean;
};

export function LeaderboardTable({
  entries,
  type,
  isLoading,
}: Props) {
  const isFoundation = type === "foundation";

  const totalPlayers = entries.length;
  const visibleRankings = entries.slice(0, 100);
  const hiddenPlayers = Math.max(
    0,
    totalPlayers - visibleRankings.length
  );

  const placeStyle = (index: number) =>
    index === 0
      ? "bg-amber-100 text-amber-800"
      : index === 1
        ? "bg-slate-200 text-slate-700"
        : index === 2
          ? "bg-orange-100 text-orange-800"
          : "bg-slate-100 text-slate-600";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {totalPlayers > 100
              ? "Top 100 ranked users"
              : "All ranked users"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review individual learner performance and ranking details.
          </p>
        </div>

        <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
          {totalPlayers.toLocaleString()} learners
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* TABLE HEADER */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
              {isFoundation ? (
                <Zap className="h-4 w-4" />
              ) : (
                <Swords className="h-4 w-4" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isFoundation
                  ? "Foundation League"
                  : "Story Champions"}
              </h3>
              <p className="text-xs text-slate-500">
                {isFoundation
                  ? "Ranked by XP and progression."
                  : "Ranked by wins, win rate, and losses."}
              </p>
            </div>
          </div>

          <span className="hidden text-xs font-medium text-slate-400 sm:block">
            Showing up to 100 results
          </span>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : totalPlayers === 0 ? (
          <div className="p-10 text-center">
            <Award className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-900">
              No rankings available
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another language or category.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* COLUMN LABELS */}
            <div className="hidden grid-cols-[60px_minmax(0,1fr)_160px] items-center bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:grid">
              <span>Rank</span>
              <span>Learner</span>
              <span className="text-right">
                {isFoundation ? "Experience" : "Performance"}
              </span>
            </div>

            {visibleRankings.map((entry, index) => {
              const isTopThree = index < 3;

              const foundation = isFoundation
                ? (entry as FoundationEntry)
                : null;

              const story = !isFoundation
                ? (entry as StoryEntry)
                : null;

              return (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[60px_minmax(0,1fr)_160px] sm:px-5 ${
                    isTopThree ? "bg-slate-50/50" : "bg-white"
                  }`}
                >
                  {/* RANK */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${placeStyle(index)}`}
                  >
                    {index === 0 ? (
                      <Crown className="h-4 w-4" />
                    ) : index === 1 ? (
                      <Medal className="h-4 w-4" />
                    ) : index === 2 ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>

                  {/* LEARNER PROFILE */}
                  <Link
                    href={`/accounts/${entry.userId}`}
                    className="group flex min-w-0 items-center gap-3"
                  >
                    <Avatar
                      name={entry.name}
                      imageUrl={entry.imageUrl}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                        {entry.name}
                      </p>

                      {foundation ? (
                        <>
                          <p className="truncate text-xs text-slate-500">
                            {foundation.roadmapTitle}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-slate-700"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (foundation.stageOrder /
                                      Math.max(
                                        1,
                                        foundation.stageOrder + 3
                                      )) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-[11px] font-medium text-slate-500">
                              Stage {foundation.stageOrder + 1}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500">
                          {story?.sessionsPlayed}{" "}
                          {story?.sessionsPlayed === 1
                            ? "session"
                            : "sessions"}{" "}
                          played
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* SCORE */}
                  <div className="min-w-0 text-right">
                    {foundation ? (
                      <>
                        <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-800 sm:text-sm">
                          <Zap className="h-4 w-4 text-amber-600" />
                          {foundation.points.toLocaleString()} XP
                        </div>

                        <p className="mt-1 text-[11px] text-slate-500">
                          {formatDuration(foundation.durationMs)}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-800 sm:text-sm">
                          <Swords className="h-4 w-4 text-slate-500" />
                          {story?.wins} wins
                        </div>

                        <p className="mt-1 text-[11px] text-slate-500">
                          {((story?.winRate ?? 0) * 100).toFixed(1)}%
                          {" "}win rate
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* HIDDEN PLAYERS */}
            {hiddenPlayers > 0 && (
              <div className="flex items-center justify-center gap-3 bg-slate-50 px-4 py-4 text-center">
                <span className="flex h-9 items-center justify-center rounded-lg bg-slate-200 px-3 text-sm font-bold text-slate-700">
                  +{hiddenPlayers.toLocaleString()}
                </span>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {hiddenPlayers.toLocaleString()} more learners
                  </p>
                  <p className="text-xs text-slate-500">
                    Showing the top 100 of{" "}
                    {totalPlayers.toLocaleString()} players.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
