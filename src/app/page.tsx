import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  Swords, 
  Bot, 
  Play, 
  CheckCircle2, 
  Globe, 
  ArrowRight 
} from "lucide-react";

export default function LinguisQuestHome() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ================= HEADER BAR ================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                Linguis<span className="text-emerald-400">Quest</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">
                Gamified AI RPG
              </span>
            </div>
          </Link>

          {/* Gamified Header Stats (Visual Polish) */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
              <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
              <span>7 Day Streak</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm">
              <Trophy className="w-4 h-4" />
              <span>1,250 XP</span>
            </div>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:translate-y-0.5 border-b-4 border-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Sign Up Free
            </Link>
          </div>

        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-7xl px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Call to Action */}
          <div className="flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Language Quest
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
              Master Languages through <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">RPG Scenarios</span> & AI Companions.
            </h1>

            <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
              Level up your fluency naturally. Complete interactive text quests, engage in real-time voice conversations with AI avatars, and climb the leaderboard.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <Link
                href="/sign-up"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:translate-y-1 border-b-4 border-emerald-600 transition-all shadow-xl shadow-emerald-500/25"
              >
                <span>GET STARTED NOW</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#game-preview"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>See Game Path</span>
              </Link>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Forever</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Voice AI Companions</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gamified Progression</span>
            </div>
          </div>

          {/* Right Column: Duolingo-style Game Path UI Showcase */}
          <div id="game-preview" className="relative w-full flex justify-center">
            {/* Outer Game Container Box */}
            <div className="w-full max-w-md bg-slate-900/90 rounded-3xl border-2 border-slate-800 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              {/* Top Unit Banner */}
              <div className="w-full bg-emerald-500 rounded-2xl p-4 text-slate-950 font-black mb-8 border-b-4 border-emerald-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-950 font-bold">Unit 1: Foundations</span>
                  <h3 className="text-lg leading-none">The Market Quest</h3>
                </div>
                <Swords className="w-6 h-6 text-emerald-950" />
              </div>

              {/* Duolingo Quest Path Nodes */}
              <div className="flex flex-col items-center gap-6 py-4 relative">
                
                {/* Connecting Path Line */}
                <div className="absolute top-8 bottom-8 w-3 bg-slate-800 rounded-full z-0" />

                {/* Completed Node 1 */}
                <div className="z-10 flex flex-col items-center gap-1 translate-x-0">
                  <div className="w-16 h-16 rounded-full bg-emerald-400 border-b-4 border-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg cursor-pointer hover:scale-105 transition">
                    <CheckCircle2 className="w-8 h-8 text-slate-950" />
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wide">Stage 1: Greeting</span>
                </div>

                {/* Active Node 2 (Current Quest) */}
                <div className="z-10 flex flex-col items-center gap-1 -translate-x-12 relative">
                  {/* Floating Speech Bubble */}
                  <div className="absolute -top-10 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border-b-2 border-amber-600 uppercase tracking-wider animate-bounce shadow-md">
                    Start Here!
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-b-4 border-amber-600 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 cursor-pointer hover:scale-105 transition ring-4 ring-amber-400/30">
                    <Play className="w-8 h-8 text-slate-950 fill-slate-950 ml-1" />
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wide">Stage 2: AI Dialog</span>
                </div>

                {/* Locked Node 3 */}
                <div className="z-10 flex flex-col items-center gap-1 translate-x-8 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-b-4 border-slate-950 flex items-center justify-center text-slate-500 font-black">
                    <Swords className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Stage 3: RPG Boss</span>
                </div>

              </div>

              {/* Floating AI Companion Avatar Card */}
              <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">AI Tutor "Lingo" Ready</span>
                  <span className="text-[10px] font-medium text-slate-400">Practice live voice response in Target Language</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* ================= FEATURES GRID ================= */}
        <section className="w-full bg-slate-900/50 border-t border-slate-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-black text-white">Why Learn with LinguisQuest?</h2>
              <p className="text-slate-400 text-sm font-medium mt-2">
                Combining classic RPG mechanics with modern Gemini AI for high-retention learning.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Textual Scenario RPGs</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Choose your own adventure style dialogues where every decision shapes your vocabulary and grammar score.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-sky-500/50 transition">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">3D Voice AI Companions</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Practice natural speaking with real-time lip-synced 3D avatars that evaluate pronunciation and give feedback.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Multi-Language Questlines</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Learn Tagalog, English, French, Spanish, and more through custom-crafted cultural roadmaps.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LinguisQuest. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-300 transition">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}