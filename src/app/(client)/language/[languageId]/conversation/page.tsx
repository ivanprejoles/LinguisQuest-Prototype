"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ConversationTopic {
  id: string;
  title: string;
  description: string;
}

export default function ConversationTopicsPage() {
  const params = useParams<{ languageId: string }>();
  const languageId = params.languageId;

  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTopics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/client/conversation", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load conversation topics.");
        }

        const data: { topics: ConversationTopic[] } =
          await response.json();

        setTopics(data.topics);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading topics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTopics();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/language/${encodeURIComponent(languageId)}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to language
        </Link>

        <header className="mb-8 mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Linguisquest
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Choose a conversation
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Pick a topic and practice your target language through a
            conversation with your AI partner.
          </p>
        </header>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-red-200"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-400/15 px-4 py-2 text-sm font-semibold hover:bg-red-400/25"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && topics.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-lg font-semibold">
              No conversation topics yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Check back later for available topics.
            </p>
          </div>
        )}

        {!loading && !error && topics.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/language/${encodeURIComponent(languageId)}/conversation/${encodeURIComponent(topic.id)}`}
                className="group flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-violet-400/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-lg font-bold text-violet-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300">
                    →
                  </span>
                </div>

                <h2 className="mt-5 text-lg font-semibold text-white">
                  {topic.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                  {topic.description}
                </p>

                <span className="mt-auto pt-5 text-sm font-semibold text-violet-300">
                  Start practicing
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
