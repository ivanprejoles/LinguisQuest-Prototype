"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Globe, ArrowRight } from "lucide-react";

interface Language {
  id: string;
  name: string;
  countryCode: string;
  voiceLanguage: string;
  order: number;
}

export default function LanguageSelectionPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/client/languages");
        const data = await res.json();
        if (Array.isArray(data)) {
          setLanguages(data);
        }
      } catch (err) {
        console.error("Failed to fetch languages:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLanguages();
  }, []);

  const handleSelectLanguage = (languageId: string) => {
    // Navigates to the next level: /learn/[languageId]
    router.push(`/language/${languageId}`);
  };

  if (loading) {
    return (
      <div className="h-fit flex items-center justify-center bg-[#F7F9F5]">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-fit bg-[#F7F9F5] py-12 px-6 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col items-start">
        {/* Header Title */}
        <h1 className="text-3xl font-extrabold text-slate-800 mb-12 text-center">
          Language Courses
        </h1>

        {/* Language Grid */}
        {languages.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 text-center w-full max-w-md">
            <p className="text-slate-500 font-bold">No languages available in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleSelectLanguage(lang.id)}
                className="group flex h-[190px] w-full flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 text-center transition-all duration-200 hover:border-slate-300 hover:shadow-md cursor-pointer"
              >
                {/* Flag */}
                <div className="mb-3 overflow-hidden rounded-lg border border-slate-100 shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={`https://flagcdn.com/w80/${lang.countryCode.toLowerCase()}.png`}
                    alt={`${lang.name} flag`}
                    width={80}
                    height={53}
                    className="h-12 w-20 object-cover"
                  />
                </div>

                {/* Language name */}
                <h3 className="mb-1 text-base font-extrabold text-slate-700">
                  {lang.name}
                </h3>

                {/* Voice language */}
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

// Converts ISO 2-letter country code (e.g., 'es', 'us', 'ph') to flag emoji
function getFlagEmoji(countryCode: string) {
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}