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
        const res = await fetch("/api/client/foundation/languages");
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
    router.push(`/foundation/${languageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-black text-slate-800">Choose a Course</h1>
        </div>
        <p className="text-slate-500 font-bold mb-10 text-center">
          Select a language to view its roadmaps and stages
        </p>

        {/* Language Grid */}
        {languages.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 text-center">
            <p className="text-slate-500 font-bold">No languages available in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleSelectLanguage(lang.id)}
                className="group relative flex flex-col items-center p-6 bg-white border-2 border-b-4 border-slate-200 hover:border-green-500 rounded-3xl transition-all active:translate-y-1 active:border-b-2 hover:shadow-lg text-center"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {getFlagEmoji(lang.countryCode)}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">
                  {lang.name}
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  {lang.voiceLanguage}
                </span>

                <div className="flex items-center gap-2 text-sm font-black text-green-600 mt-auto">
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
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