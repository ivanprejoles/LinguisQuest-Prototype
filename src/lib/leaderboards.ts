import {
  FoundationEntry,
  FoundationScore,
  PublicUser,
  StoryEntry,
  StoryProgress,
} from "@/types/leaderboards";

export type LeaderboardEntry = FoundationEntry | StoryEntry;

export type LeaderboardStat = {
  label: string;
  value: string;
  detail?: string;
};

export function calculateFoundationLeaderboard(
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

    if (current) current.records.push(score);
    else grouped.set(score.userId, { user: score.user, records: [score] });
  }

  const entries: FoundationEntry[] = [];

  for (const [userId, data] of grouped) {
    const sorted = [...data.records].sort((a, b) => {
      if (a.stage.roadmap.order !== b.stage.roadmap.order) {
        return b.stage.roadmap.order - a.stage.roadmap.order;
      }

      if (a.stage.order !== b.stage.order) {
        return b.stage.order - a.stage.order;
      }

      return new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime();
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
      recordedStages: data.records.length,
      totalDurationMs: data.records.reduce(
        (sum, record) => sum + record.durationMs,
        0
      ),
      totalWrongAttempts: data.records.reduce(
        (sum, record) => sum + record.wrongAttempts,
        0
      ),
    });
  }

  return entries.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.roadmapOrder !== b.roadmapOrder) {
      return b.roadmapOrder - a.roadmapOrder;
    }
    if (a.stageOrder !== b.stageOrder) return b.stageOrder - a.stageOrder;
    return a.name.localeCompare(b.name);
  });
}

export function calculateStoryLeaderboard(
  progress: StoryProgress[],
  selectedSessionId: string
): StoryEntry[] {
  const filtered = progress.filter(
    (item) => !selectedSessionId || item.sessionId === selectedSessionId
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

export function formatDuration(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function getFoundationStats(
  entries: FoundationEntry[],
  scores: FoundationScore[]
): LeaderboardStat[] {
  const totalXp = entries.reduce((sum, entry) => sum + entry.points, 0);
  const totalLearningTime = entries.reduce(
    (sum, entry) => sum + entry.totalDurationMs,
    0
  );
  const totalWrongAttempts = entries.reduce(
    (sum, entry) => sum + entry.totalWrongAttempts,
    0
  );
  const totalRecordedStages = entries.reduce(
    (sum, entry) => sum + entry.recordedStages,
    0
  );

  // Sum play counts from all matching score records, not just each learner's
  // highest-stage record.
  const totalPlays = scores.reduce((sum, score) => sum + score.playCount, 0);

  return [
    {
      label: "Ranked learners",
      value: entries.length.toLocaleString(),
      detail: "Learners with recorded progress",
    },
    {
      label: "Total XP",
      value: totalXp.toLocaleString(),
      detail: "Combined learner XP",
    },
    {
      label: "Total plays",
      value: totalPlays.toLocaleString(),
      detail: "Across matching stage records",
    },
    {
      label: "Avg. stage duration",
      value: formatDuration(
        totalRecordedStages
          ? totalLearningTime / totalRecordedStages
          : 0
      ),
      detail: "Average per recorded stage",
    },
  ];
}

export function getStoryStats(entries: StoryEntry[]): LeaderboardStat[] {
  const wins = entries.reduce((sum, entry) => sum + entry.wins, 0);
  const losses = entries.reduce((sum, entry) => sum + entry.losses, 0);
  const games = wins + losses;
  const sessions = entries.reduce(
    (sum, entry) => sum + entry.sessionsPlayed,
    0
  );

  return [
    {
      label: "Active players",
      value: entries.length.toLocaleString(),
      detail: "Players with recorded sessions",
    },
    {
      label: "Total wins",
      value: wins.toLocaleString(),
      detail: "Combined wins",
    },
    {
      label: "Total games",
      value: games.toLocaleString(),
      detail: "Wins plus losses",
    },
    {
      label: "Overall win rate",
      value: `${games ? ((wins / games) * 100).toFixed(1) : "0.0"}%`,
      detail: "Weighted across all games",
    },
    {
      label: "Total losses",
      value: losses.toLocaleString(),
      detail: "Combined losses",
    },
    {
      label: "Player sessions",
      value: sessions.toLocaleString(),
      detail: "Recorded player-session entries",
    },
  ];
}