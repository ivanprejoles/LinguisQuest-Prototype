// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";

// import { GlassPanel } from "@/components/ui/glass-panel";

// interface ConversationTopic {
//   id: string;
//   title: string;
//   description: string;
// }

// const kingdomBackground =
//   "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Cozy%20AI%20English%20Learning%20Chat.png?auto=format&fit=crop&w=1400&q=75";

// export default function ConversationTopicsPage() {
//   const params = useParams<{ languageId: string }>();
//   const languageId = params.languageId;

//   const [topics, setTopics] = useState<ConversationTopic[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const controller = new AbortController();

//     async function fetchTopics() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch("/api/client/conversation", {
//           method: "GET",
//           signal: controller.signal,
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           throw new Error("Unable to load conversation topics.");
//         }

//         const data: { topics: ConversationTopic[] } =
//           await response.json();

//         setTopics(data.topics);
//       } catch (err) {
//         if (err instanceof Error && err.name === "AbortError") {
//           return;
//         }

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Something went wrong while loading topics."
//         );
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     }

//     fetchTopics();

//     return () => controller.abort();
//   }, []);

//   return (
//     <main className="relative isolate min-h-screen overflow-hidden px-4 py-10 text-white sm:px-8">
//       {/* Fantasy background */}
//       <div
//         aria-hidden="true"
//         className="fixed inset-0 -z-20 bg-slate-950 bg-cover bg-center"
//         style={{ backgroundImage: `url("${kingdomBackground}")` }}
//       />

//       {/* Dark overlay for readability */}
//       <div
//         aria-hidden="true"
//         className="fixed inset-0 -z-10 bg-gradient-to-b from-[#080D1A]/75 via-[#10182A]/75 to-[#080D1A]/95"
//       />

//       {/* Ambient color accents */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none fixed -left-32 top-20 -z-10 size-96 rounded-full bg-amber-400/[0.08] blur-3xl"
//       />
//       <div
//         aria-hidden="true"
//         className="pointer-events-none fixed -right-32 bottom-10 -z-10 size-96 rounded-full bg-sky-400/[0.08] blur-3xl"
//       />

//       <div className="mx-auto max-w-5xl">
//         {/* Glass header */}
//         <GlassPanel className="mb-8 mt-8 p-6 sm:p-8">
//           <div className="flex items-start gap-4">
//             <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-amber-200 shadow-inner shadow-amber-200/5">
//               <MessageCircle className="size-6" />
//             </div>

//             <div className="min-w-0">
//               <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-amber-200">
//                 <MessageCircle className="size-4" />
//                 AI Conversation Practice
//               </div>

//               <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
//                 Build Your Fluency
//               </h1>

//               <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
//                 Strengthen your communication skills through conversations with your
//                 AI partner. Choose a topic, apply what you’ve learned, and become
//                 more confident expressing yourself in your target language.
//               </p>
//             </div>
//           </div>
//         </GlassPanel>

//         {/* Loading state */}
//         {loading && (
//           <div
//             className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
//             aria-label="Loading conversation topics"
//             aria-busy="true"
//           >
//             {[1, 2, 3, 4, 5, 6].map((item) => (
//               <GlassPanel
//                 key={item}
//                 className="min-h-52 animate-pulse p-6"
//               >
//                 <div className="size-10 rounded-xl bg-white/10" />
//                 <div className="mt-6 h-5 w-3/4 rounded-lg bg-white/10" />
//                 <div className="mt-3 h-3 w-full rounded bg-white/[0.07]" />
//                 <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.07]" />
//                 <div className="mt-6 h-4 w-1/2 rounded bg-amber-200/10" />
//               </GlassPanel>
//             ))}
//           </div>
//         )}

//         {/* Error state */}
//         {!loading && error && (
//           <GlassPanel
//             className="p-8 sm:p-10"
//             role="alert"
//           >
//             <div className="mx-auto flex max-w-md flex-col items-center text-center">
//               <div className="flex size-14 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-200">
//                 <MessageCircle className="size-7" />
//               </div>

//               <h2 className="mt-5 text-xl font-black text-white">
//                 Unable to load conversations
//               </h2>

//               <p className="mt-3 text-sm leading-6 text-slate-300">
//                 {error}
//               </p>

//               <button
//                 type="button"
//                 onClick={() => window.location.reload()}
//                 className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-200/30 bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-extrabold text-[#211708] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
//               >
//                 Try Again
//               </button>
//             </div>
//           </GlassPanel>
//         )}

//         {/* Empty state */}
//         {!loading && !error && topics.length === 0 && (
//           <GlassPanel className="p-8 text-center sm:p-12">
//             <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-amber-200">
//               <MessageCircle className="size-7" />
//             </div>

//             <h2 className="mt-5 text-xl font-black text-white">
//               No conversation topics yet
//             </h2>

//             <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
//               Your next language adventure is still being prepared. Check
//               back later for available topics.
//             </p>
//           </GlassPanel>
//         )}

//         {/* Conversation topic cards */}
//         {!loading && !error && topics.length > 0 && (
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//             {topics.map((topic, index) => (
//               <Link
//                 key={topic.id}
//                 href={`/language/${encodeURIComponent(languageId)}/conversation/${encodeURIComponent(topic.id)}`}
//                 className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182A]"
//               >
//                 <GlassPanel className="flex h-full min-h-56 flex-col p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-200/40 group-hover:shadow-2xl group-hover:shadow-amber-950/20">
//                   {/* Card accent */}
//                   <div
//                     aria-hidden="true"
//                     className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent opacity-50 transition-opacity group-hover:opacity-100"
//                   />

//                   <div className="flex items-center justify-between">
//                     <span className="flex size-11 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-300/10 text-sm font-black tracking-wider text-amber-200 transition-colors group-hover:bg-amber-300/20">
//                       {String(index + 1).padStart(2, "0")}
//                     </span>

//                     <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 group-hover:border-amber-200/30 group-hover:bg-amber-300/10 group-hover:text-amber-200">
//                       <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
//                     </span>
//                   </div>

//                   <h2 className="mt-6 text-lg font-extrabold leading-snug text-white transition-colors group-hover:text-amber-100">
//                     {topic.title}
//                   </h2>

//                   <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
//                     {topic.description}
//                   </p>

//                   <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-extrabold text-amber-200">
//                     <Sparkles className="size-4" />
//                     <span>Start practicing</span>
//                     <ArrowRight className="ml-auto size-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
//                   </div>
//                 </GlassPanel>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
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
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-10 text-white sm:px-8">
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
        <GlassPanel className="mb-8 mt-8 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-amber-200 shadow-inner shadow-amber-200/5">
              <MessageCircle className="size-6" />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-amber-200">
                <MessageCircle className="size-4" />
                AI Conversation Practice
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Build Your Fluency
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
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
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading conversation topics"
            aria-busy="true"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <GlassPanel
                key={item}
                className="min-h-52 animate-pulse p-6"
              >
                <div className="size-10 rounded-xl bg-white/10" />
                <div className="mt-6 h-5 w-3/4 rounded-lg bg-white/10" />
                <div className="mt-3 h-3 w-full rounded bg-white/[0.07]" />
                <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.07]" />
                <div className="mt-6 h-4 w-1/2 rounded bg-amber-200/10" />
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

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, index) => (
                <Link
                  key={topic.id}
                  href={`/language/${encodeURIComponent(languageId)}/conversation/${encodeURIComponent(topic.id)}`}
                  className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10182A]"
                >
                  <GlassPanel className="flex h-full min-h-56 flex-col p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-200/40 group-hover:shadow-2xl group-hover:shadow-amber-950/20">
                    {/* Card accent */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent opacity-50 transition-opacity group-hover:opacity-100"
                    />

                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-300/10 text-sm font-black tracking-wider text-amber-200 transition-colors group-hover:bg-amber-300/20">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 group-hover:border-amber-200/30 group-hover:bg-amber-300/10 group-hover:text-amber-200">
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <h2 className="mt-6 text-lg font-extrabold leading-snug text-white transition-colors group-hover:text-amber-100">
                      {topic.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
                      {topic.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-extrabold text-amber-200">
                      <Sparkles className="size-4" />
                      <span>Start practicing</span>
                      <ArrowRight className="ml-auto size-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                  </GlassPanel>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
