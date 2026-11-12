import { LeaderboardStat } from "@/lib/leaderboards";

type Props = {
  stats: LeaderboardStat[];
  category: "foundation" | "story";
};

export function LeaderboardHeader({ stats, category }: Props) {
  return (
    <section className="space-y-4 border-b border-slate-200 pb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Admin Portal</span>
            <span>/</span>
            <span className="text-slate-900">Leaderboards</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Leaderboard Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor learner rankings, learning progress, and performance.
          </p>
        </div>

        <span className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm">
          {category === "foundation" ? "Foundation League" : "Story Champions"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {stat.value}
            </p>
            {stat.detail && (
              <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}