"use client";

import { useLanguageStore } from "@/store/foundation/language-store";

export function LanguageIndicator() {
  const selectedLanguage = useLanguageStore(
    (state) => state.selectedLanguage
  );

  if (!selectedLanguage) return null;

  return (
    <div className="flex shrink-0 items-center justify-center">
      <img
        src={`https://flagcdn.com/w80/${selectedLanguage.countryCode.toLowerCase()}.png`}
        alt={`${selectedLanguage.name} flag`}
        title={`Selected language: ${selectedLanguage.name}`}
        width={36}
        height={24}
        className="h-8 w-11 rounded-md border border-white/15 object-cover object-left shadow-[0_0_8px_rgba(34,211,238,0.12)] transition-transform "
      />
    </div>
  );
}