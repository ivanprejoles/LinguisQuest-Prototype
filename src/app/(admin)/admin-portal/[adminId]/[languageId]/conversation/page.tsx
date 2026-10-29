
"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MessageSquareText,
  LoaderCircle,
  FolderOpen,
  CheckCircle2,
  Clock3,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/global/admin/foundation/page-shell";
import {
  ConversationTopicModal,
  type ConversationTopic,
  type ConversationTopicForm,
} from "@/components/global/admin/ai-speak/modal/ConversationTopicModal";
import { ConversationTopicDeleteDialog } from "@/components/global/admin/ai-speak/modal/ConversationTopicDeleteDialog";

async function fetchTopics(): Promise<ConversationTopic[]> {
  const response = await fetch("/api/admin/conversation");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to load topics");
  }

  return data.topics ?? [];
}

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed");
  }

  return data;
}

type PageParams = {
  languageId: string;
};

export default function ConversationTopicsPage({
  params
}: {
  params: Promise<PageParams>
}) {
  const { languageId } = use(params);
  
  const queryClient = useQueryClient();
  const TOPICS_QUERY_KEY = ["admin-conversation", languageId];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] =
    useState<ConversationTopic | null>(null);
  const [topicToDelete, setTopicToDelete] =
    useState<ConversationTopic | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Fetch topics
  const topicsQuery = useQuery({
    queryKey: TOPICS_QUERY_KEY,
    queryFn: fetchTopics,
  });

  const topics = topicsQuery.data ?? [];
  const loading = topicsQuery.isPending;

  // Create and update topic
  const saveTopicMutation = useMutation({
    mutationFn: async ({
      values,
      topic,
    }: {
      values: ConversationTopicForm;
      topic: ConversationTopic | null;
    }) => {
      const response = await fetch("/api/admin/conversation", {
        method: topic ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(topic ? { id: topic.id } : {}),
          ...values,
        }),
      });

      await readApiResponse(response);

      return Boolean(topic);
    },

    onSuccess: async (wasEditing) => {
      setError("");
      setNotice(
        wasEditing
          ? "Topic updated successfully."
          : "Topic created successfully."
      );

      setDialogOpen(false);
      setEditingTopic(null);

      await queryClient.invalidateQueries({
        queryKey: TOPICS_QUERY_KEY,
      });
    },

    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Unable to save topic"
      );
    },
  });

  // Delete topic
  const deleteTopicMutation = useMutation({
    mutationFn: async (topic: ConversationTopic) => {
      const response = await fetch(
        `/api/admin/conversation?id=${encodeURIComponent(topic.id)}`,
        {
          method: "DELETE",
        }
      );

      await readApiResponse(response);

      return topic;
    },

    onSuccess: async () => {
      setTopicToDelete(null);
      setError("");
      setNotice("Topic deleted successfully.");

      await queryClient.invalidateQueries({
        queryKey: TOPICS_QUERY_KEY,
      });
    },

    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Unable to delete topic"
      );
    },
  });

  function openCreate() {
    setEditingTopic(null);
    setError("");
    setNotice("");
    saveTopicMutation.reset();
    setDialogOpen(true);
  }

  function openEdit(topic: ConversationTopic) {
    setEditingTopic(topic);
    setError("");
    setNotice("");
    saveTopicMutation.reset();
    setDialogOpen(true);
  }

  function closeTopicModal() {
    if (saveTopicMutation.isPending) return;

    setDialogOpen(false);
    setEditingTopic(null);
    setError("");
  }

  async function handleSaveTopic(values: ConversationTopicForm) {
    setError("");
    setNotice("");

    await saveTopicMutation.mutateAsync({
      values,
      topic: editingTopic,
    });
  }

  function openDeleteDialog(topic: ConversationTopic) {
    setTopicToDelete(topic);
    setError("");
    setNotice("");
    deleteTopicMutation.reset();
  }

  function closeDeleteDialog() {
    if (deleteTopicMutation.isPending) return;

    setTopicToDelete(null);
    setError("");
  }

  async function confirmDeleteTopic() {
    if (!topicToDelete || deleteTopicMutation.isPending) return;

    setError("");
    setNotice("");

    try {
      await deleteTopicMutation.mutateAsync(topicToDelete);
    } catch {
      // Mutation error is displayed in the delete dialog.
    }
  }

  const filteredTopics = topics.filter((topic) => {
    const query = search.toLowerCase().trim();

    return (
      (topic.title ?? "").toLowerCase().includes(query) ||
      (topic.description ?? "").toLowerCase().includes(query)
    );
  });

  const pageError = error || topicsQuery.error;

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto bg-white text-slate-900">
      <div className="mx-auto w-full space-y-6 pb-8">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-800">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                <FolderOpen className="h-5 w-5" />
              </span>
              Conversation Topics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage AI conversation scenarios and help learners practice
              real-world communication.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreate}
            className="h-11 shrink-0 gap-2 rounded-xl bg-cyan-600 px-5 font-bold text-white shadow-[0_4px_0_0_#0e7490] transition hover:bg-cyan-700 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="h-4 w-4" />
            Create Topic
          </Button>
        </header>

        {/* Status Messages */}
        {(pageError || notice) && (
          <div
            role={pageError ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              pageError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {pageError ? (
              <Trash2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <span>
              {error ||
                (topicsQuery.error
                  ? topicsQuery.error instanceof Error
                    ? topicsQuery.error.message
                    : "Unable to load topics"
                  : notice)}
            </span>
          </div>
        )}

        {/* Collection Toolbar */}
        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-black tracking-tight text-slate-800 sm:text-xl">
                  Your Collection
                </h2>

                {!loading && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-600">
                    {filteredTopics.length}
                    {search ? ` of ${topics.length}` : ""}{" "}
                    {filteredTopics.length === 1 ? "topic" : "topics"}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm text-slate-500">
                Browse, refine, and manage your conversation scenarios.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your topics..."
                aria-label="Search topics"
                className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-4 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-100"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-white shadow-sm">
                <LoaderCircle className="h-7 w-7 animate-spin text-cyan-600" />
              </div>

              <p className="mt-4 font-bold text-slate-800">
                Loading conversation topics
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Getting your conversation library ready.
              </p>
            </div>
          ) : topicsQuery.isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-6 text-center">
              <p className="font-bold text-red-700">
                Could not load conversation topics
              </p>

              <p className="mt-2 text-sm text-red-600">
                {topicsQuery.error instanceof Error
                  ? topicsQuery.error.message
                  : "Please try again."}
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => void topicsQuery.refetch()}
                className="mt-4 rounded-xl"
              >
                Try again
              </Button>
            </div>
          ) : filteredTopics.length === 0 ? (
            /* Empty State */
            <div className="relative flex min-h-80 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50/80 to-white px-6 py-12 text-center">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-50 blur-2xl" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-cyan-600 shadow-sm">
                {search ? (
                  <Search className="h-7 w-7" />
                ) : (
                  <MessageSquareText className="h-7 w-7" />
                )}
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                {search
                  ? "No matching topics"
                  : "Start your conversation library"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? "We couldn't find a topic matching your search. Try a different keyword."
                  : "Create your first scenario with a custom AI opening message and coaching instructions."}
              </p>

              {!search && (
                <Button
                  type="button"
                  onClick={openCreate}
                  className="mt-6 gap-2 rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4" />
                  Create your first topic
                </Button>
              )}
            </div>
          ) : (
            /* Topic Cards */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTopics.map((topic, index) => (
                <article
                  key={topic.id}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="h-1 bg-gradient-to-r from-cyan-500 via-cyan-600 to-sky-400" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                        <MessageSquareText className="h-5 w-5" />
                      </div>

                      <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold tabular-nums text-slate-400">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-700">
                        Conversation scenario
                      </span>

                      <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-slate-900">
                        {topic.title}
                      </h3>

                      <p className="mt-2 min-h-10 line-clamp-2 text-sm leading-6 text-slate-500">
                        {topic.description || "No description provided."}
                      </p>
                    </div>

                    {/* AI Opening Message */}
                    <div className="mt-5 flex-1 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-colors group-hover:border-cyan-100 group-hover:bg-cyan-50/40">
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-cyan-700 shadow-sm ring-1 ring-slate-100">
                          <WandSparkles className="h-3.5 w-3.5" />
                        </span>

                        <span className="text-xs font-bold text-slate-700">
                          AI opening message
                        </span>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {topic.aiOpeningMessage
                          ? `“${topic.aiOpeningMessage}”`
                          : "No opening message has been added yet."}
                      </p>
                    </div>

                    {/* Updated Date */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>
                        Updated{" "}
                        {topic.updatedAt
                          ? new Date(topic.updatedAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openEdit(topic)}
                      className="h-10 flex-1 gap-2 rounded-xl border-slate-200 bg-white font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit topic
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        deleteTopicMutation.isPending &&
                        deleteTopicMutation.variables?.id === topic.id
                      }
                      onClick={() => openDeleteDialog(topic)}
                      aria-label={`Delete ${topic.title}`}
                      className="h-10 gap-2 rounded-xl border-slate-200 bg-white px-3 font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      {deleteTopicMutation.isPending &&
                      deleteTopicMutation.variables?.id === topic.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Create/Edit Modal */}
        <ConversationTopicModal
          isOpen={dialogOpen}
          onClose={closeTopicModal}
          topicToEdit={editingTopic}
          onSubmit={handleSaveTopic}
          isSaving={saveTopicMutation.isPending}
          error={
            saveTopicMutation.isError ? error : undefined
          }
        />

        {/* Delete Confirmation Dialog */}
        <ConversationTopicDeleteDialog
          topic={topicToDelete}
          isDeleting={deleteTopicMutation.isPending}
          onClose={closeDeleteDialog}
          onConfirm={() => void confirmDeleteTopic()}
          error={
            deleteTopicMutation.isError && topicToDelete
              ? error
              : undefined
          }
        />
      </div>
    </PageShell>
  );
}
