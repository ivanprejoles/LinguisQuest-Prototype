"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  Gamepad2,
  Globe2,
} from "lucide-react";
import {
  ApiResponse,
} from "@/types/leaderboards";

type Props = {
  type: "foundation" | "story";
  setType: (value: "foundation" | "story") => void;
  languageId: string;
  setLanguageId: (value: string) => void;
  roadmapId: string;
  setRoadmapId: (value: string) => void;
  sessionId: string;
  setSessionId: (value: string) => void;
  data?: ApiResponse;
};

export function LeaderboardFilters({
  type,
  setType,
  languageId,
  setLanguageId,
  roadmapId,
  setRoadmapId,
  sessionId,
  setSessionId,
  data,
}: Props) {
  const isFoundation = type === "foundation";

  const languages = [...(data?.languages ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const roadmaps = [...(data?.roadmaps ?? [])]
    .filter((item) => item.languageId === languageId)
    .sort((a, b) => a.order - b.order);

  const sessions = [...(data?.sessions ?? [])]
    .filter((item) => item.languageId === languageId)
    .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));

  const activeLanguage = languages.find((item) => item.id === languageId);

  return (
    <>
      <section className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setType("foundation")}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            isFoundation
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Foundation League
          {isFoundation && <Check className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => setType("story")}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            !isFoundation
              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <Gamepad2 className="h-4 w-4" />
          Story Champions
          {!isFoundation && <Check className="h-4 w-4" />}
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Ranking filters
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a language and narrow down the leaderboard.
            </p>
          </div>
          <Globe2 className="h-5 w-5 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-semibold text-slate-700"
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
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {activeLanguage && (
              <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <img
                  src={`https://flagcdn.com/w80/${activeLanguage.countryCode.toLowerCase()}.png`}
                  alt={`${activeLanguage.name} flag`}
                  width={80}
                  height={53}
                  loading="lazy"
                  className="h-8 w-12 rounded border border-slate-200 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeLanguage.name}
                  </p>
                  <p className="text-xs text-slate-500">Selected language</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="target"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {isFoundation ? "Roadmap" : "Story session"}
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
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {isFoundation
                ? "Filter rankings by a specific roadmap."
                : "Filter rankings by a specific story session."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}