
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MessageSquareText,
  Sparkles,
  LoaderCircle,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Topic = {
  id: string;
  title: string;
  description: string;
  aiOpeningMessage: string;
  coachingInstructions: string;
  createdAt: string;
  updatedAt: string;
};

type TopicForm = Omit<Topic, "id" | "createdAt" | "updatedAt">;

const emptyForm: TopicForm = {
  title: "",
  description: "",
  aiOpeningMessage: "",
  coachingInstructions: "",
};

export default function ConversationTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState<TopicForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/conversation");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unable to load topics");

      setTopics(data.topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load topics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setDialogOpen(true);
  }

  function openEdit(topic: Topic) {
    setEditingId(topic.id);
    setForm({
      title: topic.title,
      description: topic.description,
      aiOpeningMessage: topic.aiOpeningMessage,
      coachingInstructions: topic.coachingInstructions,
    });
    setError("");
    setNotice("");
    setDialogOpen(true);
  }

  function updateField(field: keyof TopicForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/conversation", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unable to save topic");

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setNotice(editingId ? "Topic updated successfully." : "Topic created successfully.");
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save topic");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTopic(topic: Topic) {
    if (!window.confirm(`Delete "${topic.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(topic.id);
    setError("");
    setNotice("");

    try {
      const res = await fetch(
        `/api/admin/conversation?id=${encodeURIComponent(topic.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unable to delete topic");

      setNotice("Topic deleted successfully.");
      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete topic");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredTopics = topics.filter((topic) => {
    const query = search.toLowerCase().trim();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query)
    );
  });

  const fields: {
    name: keyof TopicForm;
    label: string;
    placeholder: string;
    rows: number;
  }[] = [
    {
      name: "title",
      label: "Topic title",
      placeholder: "e.g. Ordering Food at a Café",
      rows: 1,
    },
    {
      name: "description",
      label: "Description",
      placeholder: "What will the learner practice?",
      rows: 2,
    },
    {
      name: "aiOpeningMessage",
      label: "AI opening message",
      placeholder: "The first message the AI will say...",
      rows: 3,
    },
    {
      name: "coachingInstructions",
      label: "Coaching instructions",
      placeholder: "Define the AI's role, tone, and correction style...",
      rows: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-5 border-b pb-7 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <MessageSquareText className="size-6" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Admin</span>
                <span>/</span>
                <span>Conversation library</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Conversation Topics
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Build reusable AI conversation scenarios for every language.
              </p>
            </div>
          </div>

          <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
            <Plus className="size-4" />
            Add topic
          </Button>
        </header>

        {(error || notice) && (
          <div
            role={error ? "alert" : "status"}
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {error || notice}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total topics</p>
                <p className="text-2xl font-bold tabular-nums">
                  {loading ? "—" : topics.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm sm:col-span-2">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="font-medium">One library, every language</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Each topic can be reused with a different target language.
                  Keep language selection in your conversation flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold">Your collection</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage the scenarios available to learners.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search topics..."
                aria-label="Search topics"
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed bg-background">
              <LoaderCircle className="mr-2 size-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading collection...</span>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-background px-6 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                {search ? (
                  <Search className="size-6 text-muted-foreground" />
                ) : (
                  <MessageSquareText className="size-6 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold">
                {search ? "No matching topics" : "Your collection is empty"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Try another search term."
                  : "Create your first conversation topic to start building your library."}
              </p>
              {!search && (
                <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                  <Plus className="size-4" />
                  Create your first topic
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTopics.map((topic, index) => (
                <Card
                  key={topic.id}
                  className="group flex min-w-0 flex-col overflow-hidden border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="h-1 bg-gradient-to-r from-primary/80 via-violet-500/70 to-sky-500/70" />

                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                        <MessageSquareText className="size-3.5" />
                        Conversation
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <CardTitle className="line-clamp-2 text-lg leading-snug">
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 min-h-[3.75rem] leading-relaxed">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pb-5">
                    <div className="rounded-xl bg-muted/60 p-3.5">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="size-3.5" />
                        AI opening message
                      </div>
                      <p className="line-clamp-3 text-sm leading-relaxed">
                        “{topic.aiOpeningMessage}”
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>
                        Updated{" "}
                        {new Date(topic.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        View details <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2 border-t bg-muted/20 px-5 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(topic)}
                      className="flex-1 gap-2 bg-background"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === topic.id}
                      onClick={() => void deleteTopic(topic)}
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${topic.title}`}
                    >
                      {deletingId === topic.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingId ? "Edit conversation topic" : "Create conversation topic"}
              </DialogTitle>
              <DialogDescription>
                Set up the scenario and how your AI conversation partner should behave.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={saveTopic} className="space-y-5 py-2">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.rows === 1 ? (
                    <Input
                      id={field.name}
                      value={form[field.name]}
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      required
                      maxLength={10000}
                    />
                  ) : (
                    <Textarea
                      id={field.name}
                      value={form[field.name]}
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      required
                      maxLength={10000}
                      rows={field.rows}
                      className="resize-y leading-relaxed"
                    />
                  )}
                </div>
              ))}

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <DialogFooter className="gap-2 pt-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <LoaderCircle className="size-4 animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create topic"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
