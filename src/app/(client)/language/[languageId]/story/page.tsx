
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import {
//   ArrowUpRight,
//   BookOpen,
//   Search,
//   Sparkles,
//   RotateCcw,
// } from "lucide-react";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// type StorySession = {
//   id: string;
//   title: string | null;
//   description: string | null;
//   imageUrl: string | null;
//   updatedAt: string;
//   languageId: string;
// };


// function StoryCard({ story }: { story: StorySession }) {
//   const [imageError, setImageError] = useState(false);

//   const storyTitle = story.title?.trim() || "Untitled Story";
//   const storyDescription =
//     story.description?.trim() || "A new story waiting to unfold.";

//   const storyHref = `/language/${story.languageId}/story/${story.id}`;

//   return (
//     <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10182A]/30 p-1.5 shadow-xl shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C66A]/50 hover:shadow-2xl hover:shadow-black/30">
//       {/* Subtle gold highlight along the top */}
//       <div className="pointer-events-none absolute inset-x-6 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#F5C66A]/60 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />

//       {/* Cover image */}
//       <Link
//         href={storyHref}
//         aria-label={`Open ${storyTitle}`}
//         className="block shrink-0 overflow-hidden rounded-xl"
//       >
//         <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#171F32]">
//           {story.imageUrl && !imageError ? (
//             <img
//               src={story.imageUrl}
//               alt={storyTitle}
//               loading="lazy"
//               onError={() => setImageError(true)}
//               className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
//             />
//           ) : (
//             <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-[#30344B] via-[#1A2238] to-[#0B1020]">
//               {/* Atmospheric glow */}
//               <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#D5A94F]/15 blur-3xl" />
//               <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#6656A5]/20 blur-3xl" />

//               <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F5C66A]/25 bg-[#D5A94F]/10 shadow-lg shadow-black/20">
//                 <BookOpen className="h-10 w-10 text-[#F5C66A]" />
//                 <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-[#FFE4A0]" />
//               </div>

//               <div className="relative px-4 text-center">
//                 <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#F5C66A]/80">
//                   A new chapter
//                 </p>
//                 <p className="mt-2 text-sm font-medium text-[#F5F1E8]/80">
//                   A story awaits
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Cinematic image treatment */}
//           <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#080D19]/90" />

//           {/* Gold accent at the bottom of the image */}
//           <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F5C66A]/50 to-transparent" />

//           {/* Story title overlay */}
//           <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
//             <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#F5C66A]">
//               Your next adventure
//             </p>

//             <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white drop-shadow-md">
//               {storyTitle}
//             </h2>
//           </div>

//           {/* Subtle hover glow */}
//           <div className="pointer-events-none absolute inset-0 bg-[#F5C66A]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
//         </div>
//       </Link>

//       {/* Story information */}
//       <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
//         {/* Description */}
//         <Tooltip>
//           <TooltipTrigger
//             render={
//               <p className="line-clamp-2 min-h-[2.5rem] text-left text-xs leading-relaxed text-white/60">
//                 {storyDescription}
//               </p>
//             }
//           />
//           <TooltipContent>
//             <p className="max-w-sm">{storyDescription}</p>
//           </TooltipContent>
//         </Tooltip>

//         {/* Divider */}
//         <div className="mb-3 mt-4 h-px bg-gradient-to-r from-[#F5C66A]/25 via-white/10 to-transparent" />

//         {/* Continue action */}
//         <Link
//           href={storyHref}
//           className="mt-auto flex min-h-10 items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-medium text-[#F5D994] transition-colors hover:bg-[#F5C66A]/[0.08] hover:text-[#FFE7A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C66A]/60"
//         >
//           <span>Continue reading</span>

//           <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#F5C66A]/20 bg-[#D5A94F]/10 transition-all duration-300 group-hover:border-[#F5C66A]/40 group-hover:bg-[#D5A94F]/20">
//             <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//           </span>
//         </Link>
//       </div>
//     </article>
//   );
// }

// function StoryCardSkeleton() {
//   return (
//     <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10182A]/30 p-1.5 shadow-xl shadow-black/10 backdrop-blur-md">
//       {/* Cover placeholder */}
//       <div className="relative aspect-[4/5] animate-pulse overflow-hidden rounded-xl bg-[#1B2439]">
//         <div className="absolute inset-0 bg-gradient-to-t from-[#080D19]/80 via-transparent to-white/[0.02]" />

//         <div className="absolute inset-x-4 bottom-5">
//           <div className="mb-3 h-2 w-24 rounded bg-[#F5C66A]/20" />
//           <div className="h-5 w-4/5 rounded bg-white/10" />
//           <div className="mt-2 h-5 w-3/5 rounded bg-white/10" />
//         </div>
//       </div>

//       {/* Text and action placeholders */}
//       <div className="animate-pulse px-3 pb-3 pt-4">
//         <div className="h-3 w-full rounded bg-white/10" />
//         <div className="mt-2 h-3 w-4/5 rounded bg-white/[0.07]" />

//         <div className="mb-3 mt-4 h-px bg-white/10" />

//         <div className="flex items-center justify-between">
//           <div className="h-3 w-28 rounded bg-[#F5C66A]/20" />
//           <div className="h-7 w-7 rounded-lg bg-white/[0.07]" />
//         </div>
//       </div>
//     </div>
//   );
// }


// export default function StoryArchivesPage() {
//   const params = useParams<{ languageId: string }>();
//   const languageId = params.languageId;

//   const [stories, setStories] = useState<StorySession[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [retryKey, setRetryKey] = useState(0);

//   useEffect(() => {
//     if (!languageId) return;

//     const controller = new AbortController();

//     async function fetchStories() {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await fetch(
//           `/api/client/story?languageId=${encodeURIComponent(languageId)}`,
//           {
//             method: "GET",
//             signal: controller.signal,
//             cache: "no-store",
//           }
//         );

//         if (!response.ok) {
//           const result = await response.json().catch(() => null);
//           throw new Error(
//             result?.error || "Unable to load the story archives."
//           );
//         }

//         const data: unknown = await response.json();

//         if (!Array.isArray(data)) {
//           throw new Error("The server returned an invalid story list.");
//         }

//         setStories(data as StorySession[]);
//       } catch (err) {
//         if (err instanceof Error && err.name === "AbortError") return;

//         console.error("Failed to fetch story archives:", err);
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Something went wrong while loading stories."
//         );
//       } finally {
//         if (!controller.signal.aborted) {
//           setIsLoading(false);
//         }
//       }
//     }

//     fetchStories();

//     return () => controller.abort();
//   }, [languageId, retryKey]);

//   const filteredStories = useMemo(() => {
//     const query = searchQuery.trim().toLowerCase();

//     if (!query) return stories;

//     return stories.filter((story) => {
//       const title = story.title?.toLowerCase() || "";
//       const description = story.description?.toLowerCase() || "";

//       return title.includes(query) || description.includes(query);
//     });
//   }, [stories, searchQuery]);

  
// return (
//   <TooltipProvider delay={250}>
//     <main className="relative min-h-screen overflow-hidden bg-[#0B1020] text-[#F5F1E8]">
//       {/* Full-page Skybound Kingdom background */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none fixed inset-0 z-0"
//       >
//         <div
//           className="absolute inset-0 scale-[1.02] bg-cover bg-center bg-no-repeat"
//           style={{
//             backgroundImage:
//               "url('https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Adventurer_s%20View%20of%20the%20Skybound%20Kingdom.png?auto=format&fit=crop&w=1400&q=85')",
//           }}
//         />

//         {/* Cinematic overlay: keeps the scenery visible while improving readability */}
//         <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/45 via-[#0B1020]/70 to-[#0B1020]/95" />

//         {/* Gentle vignette around the edges */}
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(11,16,32,0.45)_100%)]" />

//         {/* Ambient gold and violet lighting */}
//         <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#D5A94F]/10 blur-[120px]" />
//         <div className="absolute -right-40 top-[30rem] h-[28rem] w-[28rem] rounded-full bg-[#6656A5]/15 blur-[120px]" />
//       </div>

//       {/* Page content */}
//       <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
//         {/* Archive header */}
//         <header className="mb-9 rounded-2xl border border-white/10 bg-[#0B1020]/30 px-5 py-6 shadow-lg shadow-black/10 backdrop-blur-sm sm:mb-10 sm:px-7 sm:py-8">
//           {/* Collection identity */}
//           <div className="mb-6 flex items-center gap-3">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F5C66A]/30 bg-[#D5A94F]/10 shadow-inner shadow-[#D5A94F]/5">
//               <BookOpen className="h-5 w-5 text-[#F5C66A]" />
//             </div>

//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#F5C66A]">
//                 Your next adventure
//               </p>
//               <p className="mt-1 text-xs text-white/65">
//                 Every story opens a new world
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
//             {/* Page title */}
//             <div className="max-w-2xl">
//               <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#F5C66A]/80">
//                 The journey begins here
//               </p>

//               <h1 className="text-3xl font-semibold tracking-tight text-[#FFF9EC] sm:text-4xl lg:text-5xl">
//                 The Story Archives
//               </h1>

//               <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
//                 Step into new worlds, meet unforgettable characters, and
//                 discover a new language one story at a time.
//               </p>

//               {!isLoading && !error && (
//                 <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#F5C66A]/20 bg-[#D5A94F]/10 px-3.5 py-2">
//                   <span className="h-1.5 w-1.5 rounded-full bg-[#F5C66A]" />
//                   <p className="text-xs font-medium text-[#F5E3B6]">
//                     {stories.length}{" "}
//                     {stories.length === 1 ? "story" : "stories"} in your
//                     collection
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Search */}
//             <div className="relative w-full lg:max-w-sm">
//               <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F5C66A]/75" />

//               <input
//                 type="search"
//                 value={searchQuery}
//                 onChange={(event) => setSearchQuery(event.target.value)}
//                 placeholder="Search your stories..."
//                 aria-label="Search stories"
//                 className="h-12 w-full rounded-xl border border-white/15 bg-[#0B1020]/65 pl-11 pr-4 text-sm text-[#FFF9EC] outline-none backdrop-blur-md transition placeholder:text-white/40 hover:border-white/25 focus:border-[#F5C66A]/60 focus:ring-2 focus:ring-[#F5C66A]/15"
//               />
//             </div>
//           </div>
//         </header>

//         {/* Loading state */}
//         {isLoading && (
//           <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
//             {Array.from({ length: 8 }).map((_, index) => (
//               <div
//                 key={index}
//                 className="overflow-hidden rounded-2xl border border-white/10 bg-[#11182A]/75 shadow-xl shadow-black/10 backdrop-blur-md"
//               >
//                 <StoryCardSkeleton />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Error state */}
//         {!isLoading && error && (
//           <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#11182A]/80 px-6 text-center shadow-xl shadow-black/10 backdrop-blur-md">
//             <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10">
//               <RotateCcw className="h-6 w-6 text-red-300" />
//             </div>

//             <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/80">
//               A little setback
//             </p>

//             <h2 className="text-xl font-semibold text-[#FFF9EC]">
//               Couldn&apos;t load your stories
//             </h2>

//             <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
//               {error}
//             </p>

//             <button
//               type="button"
//               onClick={() => setRetryKey((current) => current + 1)}
//               className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#F5C66A]/30 bg-[#D5A94F]/10 px-5 py-3 text-sm font-medium text-[#F5D994] transition hover:border-[#F5C66A]/50 hover:bg-[#D5A94F]/20"
//             >
//               <RotateCcw className="h-4 w-4" />
//               Try again
//             </button>
//           </div>
//         )}

//         {/* Empty state */}
//         {!isLoading && !error && filteredStories.length === 0 && (
//           <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#11182A]/45 px-6 text-center backdrop-blur-sm">
//             <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F5C66A]/20 bg-[#D5A94F]/10">
//               {searchQuery ? (
//                 <Search className="h-7 w-7 text-[#F5C66A]" />
//               ) : (
//                 <BookOpen className="h-7 w-7 text-[#F5C66A]" />
//               )}
//             </div>

//             <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C66A]/80">
//               {searchQuery ? "Lost in the archives?" : "A world awaits"}
//             </p>

//             <h2 className="text-xl font-semibold text-[#FFF9EC] sm:text-2xl">
//               {searchQuery ? "No stories found" : "Your next story is waiting"}
//             </h2>

//             <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
//               {searchQuery
//                 ? "Try another title or keyword to discover the story you're looking for."
//                 : "New adventures for this language will appear here when they're available. Your journey is only beginning."}
//             </p>

//             {searchQuery && (
//               <button
//                 type="button"
//                 onClick={() => setSearchQuery("")}
//                 className="mt-6 rounded-lg px-4 py-2 text-sm font-medium text-[#F5C66A] transition hover:bg-white/5 hover:text-[#FFE5A0]"
//               >
//                 Clear search
//               </button>
//             )}
//           </div>
//         )}

//         {/* Story cards */}
//         {!isLoading && !error && filteredStories.length > 0 && (
//           <section aria-label="Your stories">
//             <div className="mb-5 flex items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-[#FFF9EC]">
//                   Choose your adventure
//                 </h2>
//                 <p className="mt-1 text-xs text-white/55">
//                   Pick a story and continue your journey.
//                 </p>
//               </div>

//               <div className="hidden items-center gap-2 sm:flex">
//                 <span className="h-px w-8 bg-[#F5C66A]/40" />
//                 <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F5C66A]/80">
//                   Explore
//                 </span>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//               {filteredStories.map((story) => (
//                 <StoryCard key={story.id} story={story} />
//               ))}
//             </div>
//           </section>
//         )}
//       </div>
//     </main>
//   </TooltipProvider>
// );

// }

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  Sparkles,
  RotateCcw,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StorySession = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  updatedAt: string;
  languageId: string;
};

const STORY_ARCHIVES_STALE_TIME = 5 * 60 * 1000;

async function fetchStories(
  languageId: string,
  signal: AbortSignal,
): Promise<StorySession[]> {
  const response = await fetch(
    `/api/client/story?languageId=${encodeURIComponent(languageId)}`,
    {
      method: "GET",
      signal,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.error || "Unable to load the story archives.",
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The server returned an invalid story list.");
  }

  return data as StorySession[];
}

function StoryCard({ story }: { story: StorySession }) {
  const [imageError, setImageError] = useState(false);

  const storyTitle = story.title?.trim() || "Untitled Story";
  const storyDescription =
    story.description?.trim() || "A new story waiting to unfold.";

  const storyHref =
    `/language/${encodeURIComponent(story.languageId)}/story/` +
    encodeURIComponent(story.id);

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10182A]/30 p-1.5 shadow-xl shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C66A]/50 hover:shadow-2xl hover:shadow-black/30">
      {/* Subtle gold highlight along the top */}
      <div className="pointer-events-none absolute inset-x-6 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#F5C66A]/60 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />

      {/* Cover image */}
      <Link
        href={storyHref}
        aria-label={`Open ${storyTitle}`}
        className="block shrink-0 overflow-hidden rounded-xl"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#171F32]">
          {story.imageUrl && !imageError ? (
            <img
              src={story.imageUrl}
              alt={storyTitle}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-[#30344B] via-[#1A2238] to-[#0B1020]">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#D5A94F]/15 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#6656A5]/20 blur-3xl" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F5C66A]/25 bg-[#D5A94F]/10 shadow-lg shadow-black/20">
                <BookOpen className="h-10 w-10 text-[#F5C66A]" />
                <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-[#FFE4A0]" />
              </div>

              <div className="relative px-4 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#F5C66A]/80">
                  A new chapter
                </p>
                <p className="mt-2 text-sm font-medium text-[#F5F1E8]/80">
                  A story awaits
                </p>
              </div>
            </div>
          )}

          {/* Cinematic image treatment */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#080D19]/90" />

          {/* Gold accent at the bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F5C66A]/50 to-transparent" />

          {/* Story title overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#F5C66A]">
              Your next adventure
            </p>

            <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white drop-shadow-md">
              {storyTitle}
            </h2>
          </div>

          {/* Subtle hover glow */}
          <div className="pointer-events-none absolute inset-0 bg-[#F5C66A]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      {/* Story information */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="line-clamp-2 min-h-[2.5rem] text-left text-xs leading-relaxed text-white/60">
                {storyDescription}
              </p>
            }
          />
          <TooltipContent>
            <p className="max-w-sm">{storyDescription}</p>
          </TooltipContent>
        </Tooltip>

        <div className="mb-3 mt-4 h-px bg-gradient-to-r from-[#F5C66A]/25 via-white/10 to-transparent" />

        {/* Continue action */}
        <Link
          href={storyHref}
          className="mt-auto flex min-h-10 items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-medium text-[#F5D994] transition-colors hover:bg-[#F5C66A]/[0.08] hover:text-[#FFE7A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C66A]/60"
        >
          <span>Continue reading</span>

          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#F5C66A]/20 bg-[#D5A94F]/10 transition-all duration-300 group-hover:border-[#F5C66A]/40 group-hover:bg-[#D5A94F]/20">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
      </div>
    </article>
  );
}

function StoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10182A]/30 p-1.5 shadow-xl shadow-black/10 backdrop-blur-md">
      <div className="relative aspect-[4/5] animate-pulse overflow-hidden rounded-xl bg-[#1B2439]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D19]/80 via-transparent to-white/[0.02]" />

        <div className="absolute inset-x-4 bottom-5">
          <div className="mb-3 h-2 w-24 rounded bg-[#F5C66A]/20" />
          <div className="h-5 w-4/5 rounded bg-white/10" />
          <div className="mt-2 h-5 w-3/5 rounded bg-white/10" />
        </div>
      </div>

      <div className="animate-pulse px-3 pb-3 pt-4">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="mt-2 h-3 w-4/5 rounded bg-white/[0.07]" />

        <div className="mb-3 mt-4 h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <div className="h-3 w-28 rounded bg-[#F5C66A]/20" />
          <div className="h-7 w-7 rounded-lg bg-white/[0.07]" />
        </div>
      </div>
    </div>
  );
}

export default function StoryArchivesPage() {
  const params = useParams<{ languageId: string }>();
  const languageId = params.languageId;

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: stories = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<StorySession[], Error>({
    queryKey: ["story-archives", languageId],
    enabled: Boolean(languageId),
    staleTime: STORY_ARCHIVES_STALE_TIME,
    retry: 1,
    queryFn: ({ signal }) => fetchStories(languageId, signal),
  });

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return stories;

    return stories.filter((story) => {
      const title = story.title?.toLowerCase() || "";
      const description = story.description?.toLowerCase() || "";

      return title.includes(query) || description.includes(query);
    });
  }, [stories, searchQuery]);

  const showLoading = isPending;
  const showError = isError && stories.length === 0;

  return (
    <TooltipProvider delay={250}>
      <main className="relative min-h-screen overflow-hidden bg-[#0B1020] text-[#F5F1E8]">
        {/* Full-page Skybound Kingdom background */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
        >
          <div
            className="absolute inset-0 scale-[1.02] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Adventurer_s%20View%20of%20the%20Skybound%20Kingdom.png?auto=format&fit=crop&w=1400&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/45 via-[#0B1020]/70 to-[#0B1020]/95" />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(11,16,32,0.45)_100%)]" />

          <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#D5A94F]/10 blur-[120px]" />
          <div className="absolute -right-40 top-[30rem] h-[28rem] w-[28rem] rounded-full bg-[#6656A5]/15 blur-[120px]" />
        </div>

        {/* Page content */}
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {/* Archive header */}
          <header className="mb-9 rounded-2xl border border-white/10 bg-[#0B1020]/30 px-5 py-6 shadow-lg shadow-black/10 backdrop-blur-sm sm:mb-10 sm:px-7 sm:py-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F5C66A]/30 bg-[#D5A94F]/10 shadow-inner shadow-[#D5A94F]/5">
                <BookOpen className="h-5 w-5 text-[#F5C66A]" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#F5C66A]">
                  Your next adventure
                </p>
                <p className="mt-1 text-xs text-white/65">
                  Every story opens a new world
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#F5C66A]/80">
                  The journey begins here
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-[#FFF9EC] sm:text-4xl lg:text-5xl">
                  The Story Archives
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Step into new worlds, meet unforgettable characters, and
                  discover a new language one story at a time.
                </p>

                {!showLoading && !showError && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#F5C66A]/20 bg-[#D5A94F]/10 px-3.5 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F5C66A]" />
                    <p className="text-xs font-medium text-[#F5E3B6]">
                      {stories.length}{" "}
                      {stories.length === 1 ? "story" : "stories"} in your
                      collection
                    </p>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F5C66A]/75" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search your stories..."
                  aria-label="Search stories"
                  className="h-12 w-full rounded-xl border border-white/15 bg-[#0B1020]/65 pl-11 pr-4 text-sm text-[#FFF9EC] outline-none backdrop-blur-md transition placeholder:text-white/40 hover:border-white/25 focus:border-[#F5C66A]/60 focus:ring-2 focus:ring-[#F5C66A]/15"
                />
              </div>
            </div>
          </header>

          {/* Loading state */}
          {showLoading && (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#11182A]/75 shadow-xl shadow-black/10 backdrop-blur-md"
                >
                  <StoryCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {showError && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#11182A]/80 px-6 text-center shadow-xl shadow-black/10 backdrop-blur-md">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10">
                <RotateCcw className="h-6 w-6 text-red-300" />
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/80">
                A little setback
              </p>

              <h2 className="text-xl font-semibold text-[#FFF9EC]">
                Couldn&apos;t load your stories
              </h2>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                {error?.message || "Something went wrong while loading stories."}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#F5C66A]/30 bg-[#D5A94F]/10 px-5 py-3 text-sm font-medium text-[#F5D994] transition hover:border-[#F5C66A]/50 hover:bg-[#D5A94F]/20"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!showLoading && !showError && filteredStories.length === 0 && (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#11182A]/45 px-6 text-center backdrop-blur-sm">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F5C66A]/20 bg-[#D5A94F]/10">
                {searchQuery ? (
                  <Search className="h-7 w-7 text-[#F5C66A]" />
                ) : (
                  <BookOpen className="h-7 w-7 text-[#F5C66A]" />
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C66A]/80">
                {searchQuery ? "Lost in the archives?" : "A world awaits"}
              </p>

              <h2 className="text-xl font-semibold text-[#FFF9EC] sm:text-2xl">
                {searchQuery ? "No stories found" : "Your next story is waiting"}
              </h2>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                {searchQuery
                  ? "Try another title or keyword to discover the story you're looking for."
                  : "New adventures for this language will appear here when they're available. Your journey is only beginning."}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-6 rounded-lg px-4 py-2 text-sm font-medium text-[#F5C66A] transition hover:bg-white/5 hover:text-[#FFE5A0]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Story cards */}
          {!showLoading && !showError && filteredStories.length > 0 && (
            <section aria-label="Your stories">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#FFF9EC]">
                    Choose your adventure
                  </h2>
                  <p className="mt-1 text-xs text-white/55">
                    Pick a story and continue your journey.
                  </p>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <span className="h-px w-8 bg-[#F5C66A]/40" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F5C66A]/80">
                    Explore
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}
