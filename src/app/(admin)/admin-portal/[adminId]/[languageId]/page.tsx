"use client";

import React, { use } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Map, 
  BookOpenCheck, 
  Bot, 
  ArrowRight, 
  Flame, 
  Trophy 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LanguageHubPage({
  params,
}: {
  params: Promise<{ adminId: string; languageId: string }>;
}) {
  const { adminId, languageId } = use(params);

  // Features configuration for the 3-column layout
  const features = [
    {
      id: "foundation",
      title: "Foundation",
      badge: "Core Path",
      badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
      description: "Manage structured learning roadmaps, skill levels, and stage milestones.",
      accentColor: "from-emerald-500 to-green-600",
      borderColor: "border-emerald-200 hover:border-emerald-500",
      shadowColor: "shadow-[0_8px_0_0_#15803d]",
      icon: Map,
      stats: { primary: "12 Stages", secondary: "3 Roadmaps" },
      href: `/admin-portal/${adminId}/${languageId}/foundation`,
      btnText: "Manage Foundation",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_0_#15803d]",
    },
    {
      id: "story",
      title: "Story Quest",
      badge: "Text Scenario",
      badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
      description: "Configure interactive textual scenario games where choices impact narrative flow.",
      accentColor: "from-amber-400 to-orange-500",
      borderColor: "border-amber-200 hover:border-amber-500",
      shadowColor: "shadow-[0_8px_0_0_#b45309]",
      icon: BookOpenCheck,
      stats: { primary: "8 Stories", secondary: "24 Chapters" },
      href: `/admin-portal/${adminId}/${languageId}/story`,
      btnText: "Configure Stories",
      btnBg: "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_0_0_#b45309]",
    },
    {
      id: "ai-comm",
      title: "Speak with AI",
      badge: "AI Companion",
      badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
      description: "Setup real-time voice prompts and conversational practice parameters.",
      accentColor: "from-purple-500 to-indigo-600",
      borderColor: "border-purple-200 hover:border-purple-500",
      shadowColor: "shadow-[0_8px_0_0_#6b21a8]",
      icon: Bot,
      stats: { primary: "Interactive", secondary: "Voice Enabled" },
      href: `/admin-portal/${adminId}/${languageId}/conversation`,
      btnText: "Configure Agent",
      btnBg: "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_4px_0_0_#6b21a8]",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-600">
          <Sparkles className="w-4 h-4 text-green-500 fill-green-500" />
          <span>Active Workspace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          Select Learning Feature
        </h1>
        <p className="text-sm font-bold text-slate-500">
          Pick a domain below to edit content, adjust rules, or review student progression paths.
        </p>
      </div>

      {/* 3-Column Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`group relative bg-white border-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 ${item.borderColor} ${item.shadowColor} hover:-translate-y-1`}
            >
              <div className="space-y-4">
                
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.accentColor} flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-black text-[11px] px-2.5 py-1 rounded-xl ${item.badgeBg}`}
                  >
                    {item.badge}
                  </Badge>
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-2xl font-black text-slate-800 group-hover:text-slate-900">
                    {item.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                {/* Mini Stats Banner */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>{item.stats.primary}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{item.stats.secondary}</span>
                  </div>
                </div>

              </div>

              {/* 3D Action Button */}
              <div className="pt-6">
                <Link href={item.href} className="block">
                  <button
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-sm transition-all active:translate-y-1 cursor-pointer ${item.btnBg}`}
                  >
                    <span>{item.btnText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}