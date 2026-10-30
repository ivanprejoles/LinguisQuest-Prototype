
"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type ElapsedTimerProps = {
  startedAt: number;
};

export function ElapsedTimer({ startedAt }: ElapsedTimerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      setElapsedMs(Date.now() - startedAt);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div
      className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-600 font-bold tabular-nums"
      aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
      title="Time spent on this stage"
    >
      <Timer className="w-4 h-4 shrink-0" />
      <span>{formatDuration(elapsedMs)}</span>
    </div>
  );
}
