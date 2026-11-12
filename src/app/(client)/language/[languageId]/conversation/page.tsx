'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

import { GlassPanel } from '@/components/ui/glass-panel';

interface ConversationTopic {
  id: string;
  title: string;
  description: string;
}

interface ConversationResponse {
  topics: ConversationTopic[];
}

const kingdomBackground =
  'https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Cozy%20AI%20English%20Learning%20Chat.png?auto=format&fit=crop&w=1400&q=75';

async function fetchConversationTopics(
  languageId: string,
  signal: AbortSignal
): Promise<ConversationTopic[]> {
  const response = await fetch(
    `/api/client/conversation?languageId=${encodeURIComponent(languageId)}`,
    {
      method: 'GET',
      signal,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Unable to load conversation topics.');
  }

  const data: ConversationResponse = await response.json();

  if (!Array.isArray(data.topics)) {
    throw new Error('Invalid conversation topics response.');
  }

  return data.topics;
}

export default function ConversationTopicsPage() {
  const params = useParams<{ languageId: string }>();
  const languageId = params.languageId;

  const {
    data: topics = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<ConversationTopic[], Error>({
    queryKey: ['conversation-topics', languageId],
    enabled: Boolean(languageId),
    queryFn: ({ signal }) =>
      fetchConversationTopics(languageId, signal),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const hasTopics = useMemo(() => topics.length > 0, [topics]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-3 py-4 text-white sm:px-8 sm:py-10">
      {/* Fantasy background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-20 bg-slate-950 bg-cover bg-center"
        style={{ backgroundImage: `url("${kingdomBackground}")` }}
      />

      {/* Dark overlay for readability */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#080D1A]/75 via-[#10182A]/75 to-[#080D1A]/95"
      />

      {/* Ambient color accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-32 top-20 -z-10 size-96 rounded-full bg-amber-400/[0.08] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-32 bottom-10 -z-10 size-96 rounded-full bg-sky-400/[0.08] blur-3xl"
      />

      <div className="mx-auto max-w-5xl">
        {/* Glass header */}
        <GlassPanel className="mb-5 mt-2 p-3.5 sm:mb-8 sm:mt-8 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-300/10 text-amber-200 shadow-inner shadow-amber-200/5 sm:size-12 sm:rounded-2xl">
              <MessageCircle className="size-4 sm:size-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-amber-200 sm:mb-2 sm:gap-2 sm:text-xs sm:tracking-[0.2em]">
                <Sparkles className="size-3 sm:size-4" />
                AI Conversation Practice
              </div>

              <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                Build Your Fluency
              </h1>

              <p className="mt-2 max-w-2xl text-[11px] leading-[1.6] text-slate-300 sm:mt-3 sm:text-base sm:leading-7">
                Strengthen your communication skills through conversations with your
                AI partner. Choose a topic, apply what you’ve learned, and become
                more confident expressing yourself in your target language.
              </p>
            </div>
          </div>
        </GlassPanel>

        {/* Loading state */}
        {isPending && (
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            aria-label="Loading conversation topics"
            aria-busy="true"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <GlassPanel
                key={item}
                className="min-h-40 animate-pulse p-3.5 sm:min-h-52 sm:p-6"
              >
                <div className="size-9 rounded-xl bg-white/10 sm:size-10" />
                <div className="mt-4 h-5 w-3/4 rounded-lg bg-white/10 sm:mt-6" />
                <div className="mt-3 h-3 w-full rounded bg-white/[0.07]" />
                <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.07]" />
                <div className="mt-5 h-4 w-1/2 rounded bg-amber-200/10" />
              </GlassPanel>
            ))}
          </div>
        )}

        {/* Error state: shown when no cached topics are available */}
        {!isPending && isError && topics.length === 0 && (
          <GlassPanel className="p-8 sm:p-10" role="alert">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-200">
                <MessageCircle className="size-7" />
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                Unable to load conversations
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {error?.message ?? 'Something went wrong while loading topics.'}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isPending}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-200/30 bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-extrabold text-[#211708] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Try Again
              </button>
            </div>
          </GlassPanel>
        )}

        {/* Empty state */}
        {!isPending && !isError && !hasTopics && (
          <GlassPanel className="p-8 text-center sm:p-12">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-amber-200">
              <MessageCircle className="size-7" />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              No conversation topics yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
              Your next language adventure is still being prepared. Check
              back later for available topics.
            </p>
          </GlassPanel>
        )}

        {/* Conversation topic cards */}
        {!isPending && hasTopics && (
          <>
            {/* Keep cached topics visible if a background refresh fails. */}
            {isError && (
              <p
                role="status"
                className="mb-4 text-sm text-amber-200"
              >
                Could not refresh topics. Showing the previously loaded list.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {topics.map((topic, index) => (
                
<Link
  key={topic.id}
  href={`/language/${encodeURIComponent(languageId)}/conversation/${encodeURIComponent(topic.id)}`}
  className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182A]"
>
  <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-br from-[#49351f]/70 via-[#30251b]/80 to-[#171a27]/95 p-3.5 shadow-lg shadow-black/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-200/60 group-hover:shadow-xl group-hover:shadow-amber-950/30 sm:min-h-56 sm:p-5">

    {/* Decorative accent */}
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300/20 via-amber-300/80 to-amber-300/20"
    />

    {/* Card heading */}
    <div className="flex items-center justify-between">
      <span className="flex size-9 items-center justify-center rounded-xl border border-amber-200/40 bg-amber-300/15 text-xs font-black tracking-wider text-amber-200 shadow-inner sm:size-11 sm:text-sm">
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="flex items-center gap-1 rounded-full border border-amber-200/20 bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200/80 sm:text-[10px]">
        <Sparkles className="size-3" />
        Practice topic
      </span>
    </div>

    {/* Topic information */}
    <div className="mt-3 sm:mt-5">
      <h2 className="text-base font-extrabold leading-snug text-white transition-colors group-hover:text-amber-200 sm:text-lg">
        {topic.title}
      </h2>

      <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-slate-300 sm:mt-2 sm:text-sm sm:leading-6">
        {topic.description}
      </p>
    </div>

    {/* Clear clickable action */}
    <div className="mt-4 flex items-center justify-between border-t border-amber-100/15 pt-3 sm:mt-auto sm:pt-4">
      <span className="text-xs font-extrabold text-amber-200 sm:text-sm">
        Start conversation
      </span>

      <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[#30200d] shadow-md transition-transform duration-300 group-hover:translate-x-1 sm:size-9">
        <ArrowRight className="size-4" />
      </span>
    </div>
  </div>
</Link>

              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
