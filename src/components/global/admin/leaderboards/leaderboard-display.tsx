import Link from "next/link";
import { Award, Crown, Swords, Trophy, Zap } from "lucide-react";
import { FoundationEntry, StoryEntry } from "@/types/leaderboards";

type Props = {
  entries: (FoundationEntry | StoryEntry)[];
  type: "foundation" | "story";
  isLoading: boolean;
};

export function Avatar({
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
  entry,
  rank,
  type,
}: {
  entry: FoundationEntry | StoryEntry;
  rank: 1 | 2 | 3;
  type: "foundation" | "story";
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

  const isFoundation = type === "foundation";
  const foundationEntry = isFoundation ? (entry as FoundationEntry) : null;
  const storyEntry = !isFoundation ? (entry as StoryEntry) : null;

  const subtitle = foundationEntry
    ? `Stage ${foundationEntry.stageOrder + 1} · ${foundationEntry.roadmapTitle}`
    : `${((storyEntry?.winRate ?? 0) * 100).toFixed(0)}% win rate`;

  const score = foundationEntry
    ? `${foundationEntry.points.toLocaleString()} XP`
    : `${storyEntry?.wins ?? 0} wins`;

  return (
    <Link
      href={`/accounts/${entry.userId}`}
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
          <Avatar name={entry.name} imageUrl={entry.imageUrl} size="large" />
        </div>

        <span
          className={`absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-black ${styles.medal}`}
        >
          {rank}
        </span>
      </div>

      <p className="mt-4 w-full truncate text-base font-extrabold text-slate-900">
        {entry.name}
      </p>

      <p className="mt-1 min-h-8 text-xs font-semibold text-slate-600">
        {subtitle}
      </p>

      <div
        className={`mt-3 flex items-center gap-1 rounded-full px-3 py-2 text-xs font-black sm:text-sm ${
          isFoundation
            ? "bg-lime-200 text-lime-950"
            : "bg-violet-200 text-violet-950"
        }`}
      >
        {isFoundation ? (
          <Zap className="h-4 w-4" fill="currentColor" />
        ) : (
          <Swords className="h-4 w-4" />
        )}
        {score}
      </div>
    </Link>
  );
}

export function LeaderboardDisplay({ entries, type, isLoading }: Props) {
  const topThree = entries.slice(0, 3);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Top-ranked learners
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Highest-performing learners in the selected category.
          </p>
        </div>

        <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          TOP 3
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : topThree.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Trophy className="mx-auto h-9 w-9 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            No top performers yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Rankings will appear here when learners have recorded activity.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
          {([2, 1, 3] as const)
            .filter((rank) => topThree.length >= rank)
            .map((rank) => {
              const entry = topThree[rank - 1];
              if (!entry) return null;

              return (
                <PodiumCard
                  key={entry.userId}
                  entry={entry}
                  rank={rank}
                  type={type}
                />
              );
            })}
        </div>
      )}
    </section>
  );
}