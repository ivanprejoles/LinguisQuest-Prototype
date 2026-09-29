'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, Play } from 'lucide-react';

interface StorySession {
  id: string;
  title: string;
  updatedAt: string;
}

export default function StoryCatalogPage() {
  const [stories, setStories] = useState<StorySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStories() {
      try {
        const res = await fetch('/api/client/stories');
        if (res.ok && isMounted) {
          const data = await res.json();
          setStories(data);
        }
      } catch (err) {
        console.error('Failed loading stories catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStories();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative overflow-hidden select-none">
      {/* Background Ambient Lights */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <header className="max-w-6xl mx-auto text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
          <Sparkles className="w-4 h-4 animate-spin" /> Interactive Realm
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-200 to-sky-200 tracking-tight drop-shadow-md">
          Enchanted Story Vault
        </h1>
      </header>

      <main className="max-w-6xl mx-auto relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/40 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative bg-slate-900/60 backdrop-blur-md border border-amber-500/20 hover:border-amber-400/60 rounded-2xl p-6 shadow-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] flex flex-col justify-between overflow-hidden transform-gpu"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div>
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] uppercase font-mono tracking-wider">ID: #{story.id.slice(-6)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 group-hover:text-amber-200 transition-colors duration-200 line-clamp-2">
                    {story.title || "Untitled Story"}
                  </h2>
                </div>

                <Link
                  href={`/stories/${story.id}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" /> Play Story
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}