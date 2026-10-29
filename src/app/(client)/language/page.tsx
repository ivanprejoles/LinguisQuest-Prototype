
"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Language {
  id: string;
  name: string;
  countryCode: string;
  voiceLanguage: string;
  order: number;
}

async function fetchLanguages(): Promise<Language[]> {
  const res = await fetch("/api/client/languages");

  if (!res.ok) {
    throw new Error("Failed to fetch languages");
  }

  return res.json();
}

export default function LanguageSelectionPage() {
  const router = useRouter();

  const {
    data: languages = [],
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelectLanguage = (languageId: string) => {
    router.push(`/language/${languageId}`);
  };

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F9F5]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 bg-[#F7F9F5] p-8">
        <p className="font-bold text-slate-600">
          Failed to load languages.
        </p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl bg-green-500 px-5 py-2 font-bold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {isFetching ? "Retrying..." : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center bg-[#F7F9F5] px-6 py-12">
      <div className="flex w-full max-w-4xl flex-col items-start">
        <h1 className="mb-12 text-3xl font-extrabold text-slate-800">
          Language Courses
        </h1>

        {languages.length === 0 ? (
          <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-8 text-center">
            <p className="font-bold text-slate-500">
              No languages available in database.
            </p>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleSelectLanguage(lang.id)}
                className="group flex h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 text-center transition-all duration-200 hover:border-slate-300 hover:shadow-md"
              >
                <div className="mb-3 overflow-hidden rounded-lg border border-slate-100 shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={`https://flagcdn.com/w80/${lang.countryCode.toLowerCase()}.png`}
                    alt={`${lang.name} flag`}
                    width={80}
                    height={53}
                    loading="lazy"
                    className="h-12 w-20 object-cover"
                  />
                </div>

                <h2 className="mb-1 text-base font-extrabold text-slate-700">
                  {lang.name}
                </h2>

                <span className="text-xs font-semibold text-slate-400">
                  {lang.voiceLanguage}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
