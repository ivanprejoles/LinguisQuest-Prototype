
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

function StoryCard({ story }: { story: StorySession }) {
  const [imageError, setImageError] = useState(false);

  const storyTitle = story.title?.trim() || "Untitled Story";
  const storyDescription =
    story.description?.trim() || "A new story waiting to unfold.";

  const storyHref = `/language/${story.languageId}/story/${story.id}`;

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-[#E6E0D5] bg-white p-1 shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C99A35]/50 hover:shadow-xl hover:shadow-black/10 dark:border-[#34364D] dark:bg-[#151B30] dark:shadow-black/10 dark:hover:border-[#F5C66A]/50 dark:hover:shadow-black/20">
      {/* Cover image */}
      <Link
        href={storyHref}
        aria-label={`Open ${storyTitle}`}
        className="block shrink-0 overflow-hidden rounded-xl"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F0ECE3] dark:bg-[#20263B]">
          {story.imageUrl && !imageError ? (
            <img
              src={story.imageUrl}
              alt={storyTitle}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#F4EBD8] via-[#F8F5EE] to-[#E8E3D7] dark:from-[#252B42] dark:via-[#1A2035] dark:to-[#0B1020]">
              <BookOpen className="h-14 w-14 text-[#B58A32] dark:text-[#E9C77E]" />
              <Sparkles className="h-5 w-5 text-[#C99A35]/70 dark:text-[#F5C66A]/70" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#787567] dark:text-[#A8AEC3]">
                A story awaits
              </span>
            </div>
          )}

          {/* Image overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </Link>

      {/* Story information */}
      <div className="flex flex-1 flex-col px-2 pb-2 pt-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <h2 className="line-clamp-1 text-left text-sm font-semibold leading-snug text-[#292A3D] dark:text-[#F5F1E8]">
                {storyTitle}
              </h2>
            }
          />
          <TooltipContent>
            <p className="max-w-xs">{storyTitle}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <p className="mt-2 line-clamp-1 text-xs leading-relaxed text-left text-[#77786F] dark:text-[#A8AEC3]">
                {storyDescription}
              </p>
            }
          />
          <TooltipContent>
            <p className="max-w-sm">{storyDescription}</p>
          </TooltipContent>
        </Tooltip>

        {/* Push the action to the bottom for consistent card alignment */}
        <Link
          href={storyHref}
          className="flex items-center justify-between gap-3 text-sm font-medium text-[#98701E] transition-colors hover:text-[#B58A32] dark:text-[#E9C77E] dark:hover:text-[#F5C66A]"
        >
          <span>Continue reading</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

function StoryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E6E0D5] bg-white p-3 dark:border-[#34364D] dark:bg-[#151B30]">
      <div className="aspect-[4/5] rounded-xl bg-[#F0ECE3] dark:bg-[#252B42]" />

      <div className="px-2 pb-2 pt-4">
        <div className="mb-3 h-2 w-20 rounded bg-[#E6E0D5] dark:bg-[#34364D]" />
        <div className="h-5 w-4/5 rounded bg-[#F0ECE3] dark:bg-[#252B42]" />
        <div className="mt-3 h-3 w-full rounded bg-[#F0ECE3] dark:bg-[#252B42]" />
        <div className="mt-2 h-3 w-3/4 rounded bg-[#F0ECE3] dark:bg-[#252B42]" />

        <div className="mt-6 border-t border-[#E6E0D5] pt-4 dark:border-[#34364D]">
          <div className="h-3 w-32 rounded bg-[#F0ECE3] dark:bg-[#252B42]" />
        </div>
      </div>
    </div>
  );
}

export default function StoryArchivesPage() {
  const params = useParams<{ languageId: string }>();
  const languageId = params.languageId;

  const [stories, setStories] = useState<StorySession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!languageId) return;

    const controller = new AbortController();

    async function fetchStories() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/client/story?languageId=${encodeURIComponent(languageId)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(
            result?.error || "Unable to load the story archives."
          );
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid story list.");
        }

        setStories(data as StorySession[]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Failed to fetch story archives:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading stories."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchStories();

    return () => controller.abort();
  }, [languageId, retryKey]);

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return stories;

    return stories.filter((story) => {
      const title = story.title?.toLowerCase() || "";
      const description = story.description?.toLowerCase() || "";

      return title.includes(query) || description.includes(query);
    });
  }, [stories, searchQuery]);

  return (
    <TooltipProvider delay={250}>
      <main className="relative min-h-screen overflow-hidden bg-[#FAF9F6] text-[#292A3D] dark:bg-[#0B1020] dark:text-[#F5F1E8]">
        {/* Ambient background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#D5A94F]/[0.10] blur-[120px] dark:bg-[#D5A94F]/[0.06]" />
          <div className="absolute -right-40 top-[30rem] h-[28rem] w-[28rem] rounded-full bg-[#6656A5]/[0.05] blur-[120px] dark:bg-[#6656A5]/[0.08]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {/* Archive header */}
          <header className="mb-9 border-b border-[#E6E0D5]/80 pb-8 sm:mb-10 sm:pb-10 dark:border-[#34364D]/80">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C99A35]/25 bg-[#C99A35]/[0.08] dark:border-[#F5C66A]/25 dark:bg-[#F5C66A]/[0.08]">
                <BookOpen className="h-5 w-5 text-[#98701E] dark:text-[#F5C66A]" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#98701E] dark:text-[#E9C77E]">
                  Your collection
                </p>
                <p className="mt-1 text-xs text-[#77786F] dark:text-[#858CA5]">
                  A library of worlds and possibilities
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-[#292A3D] sm:text-4xl dark:text-[#F5F1E8]">
                  The Story Archives
                </h1>

                {!isLoading && !error && (
                  <p className="mt-4 text-xs text-[#77786F] dark:text-[#858CA5]">
                    {stories.length}{" "}
                    {stories.length === 1 ? "story" : "stories"} in your
                    collection
                  </p>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858577] dark:text-[#858CA5]" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search your stories..."
                  aria-label="Search stories"
                  className="h-12 w-full rounded-xl border border-[#E2DDD2] bg-white/90 pl-11 pr-4 text-sm text-[#292A3D] outline-none transition placeholder:text-[#929186] focus:border-[#C99A35]/60 focus:ring-2 focus:ring-[#C99A35]/10 dark:border-[#34364D] dark:bg-[#151B30]/90 dark:text-[#F5F1E8] dark:placeholder:text-[#737B95] dark:focus:border-[#F5C66A]/60 dark:focus:ring-[#F5C66A]/10"
                />
              </div>
            </div>
          </header>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <StoryCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E6E0D5] bg-white/70 px-6 text-center dark:border-[#34364D] dark:bg-[#151B30]/70">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <RotateCcw className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>

              <h2 className="text-lg font-semibold text-[#292A3D] dark:text-[#F5F1E8]">
                Couldn&apos;t load your stories
              </h2>

              <p className="mt-2 max-w-md text-sm text-[#77786F] dark:text-[#A8AEC3]">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#C99A35]/30 px-4 py-2.5 text-sm font-medium text-[#98701E] transition hover:bg-[#C99A35]/10 dark:border-[#F5C66A]/30 dark:text-[#E9C77E] dark:hover:bg-[#F5C66A]/10"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredStories.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCD6CA] px-6 text-center dark:border-[#34364D]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E6E0D5] bg-white dark:border-[#34364D] dark:bg-[#151B30]">
                {searchQuery ? (
                  <Search className="h-7 w-7 text-[#98701E] dark:text-[#E9C77E]" />
                ) : (
                  <BookOpen className="h-7 w-7 text-[#98701E] dark:text-[#E9C77E]" />
                )}
              </div>

              <h2 className="text-xl font-semibold text-[#292A3D] dark:text-[#F5F1E8]">
                {searchQuery ? "No stories found" : "Your archive is waiting"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#77786F] dark:text-[#A8AEC3]">
                {searchQuery
                  ? "Try another title or keyword to find the story you're looking for."
                  : "Stories for this language will appear here when they're available."}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 text-sm font-medium text-[#98701E] transition hover:text-[#B58A32] dark:text-[#E9C77E] dark:hover:text-[#F5C66A]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Story cards */}
          {!isLoading && !error && filteredStories.length > 0 && (
            <div className="grid grid-cols-1 items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}
