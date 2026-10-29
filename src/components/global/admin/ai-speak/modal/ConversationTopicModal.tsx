
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConversationTopic = {
  id: string;
  title: string;
  description: string;
  aiOpeningMessage: string;
  coachingInstructions: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationTopicForm = Omit<
  ConversationTopic,
  "id" | "createdAt" | "updatedAt"
>;

const emptyForm: ConversationTopicForm = {
  title: "",
  description: "",
  aiOpeningMessage: "",
  coachingInstructions: "",
};

interface ConversationTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: ConversationTopic | null;
  onSubmit: (values: ConversationTopicForm) => Promise<void>;
  isSaving: boolean;
  error?: string;
}

export function ConversationTopicModal({
  isOpen,
  onClose,
  topicToEdit,
  onSubmit,
  isSaving,
  error,
}: ConversationTopicModalProps) {
  const isEditing = Boolean(topicToEdit);

  const [form, setForm] =
    useState<ConversationTopicForm>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (topicToEdit) {
      setForm({
        title: topicToEdit.title ?? "",
        description: topicToEdit.description ?? "",
        aiOpeningMessage: topicToEdit.aiOpeningMessage ?? "",
        coachingInstructions: topicToEdit.coachingInstructions ?? "",
      });
    } else {
      setForm({ ...emptyForm });
    }
  }, [isOpen, topicToEdit]);

  function updateField(
    field: keyof ConversationTopicForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOpenChange(open: boolean) {
    if (!open && !isSaving) {
      onClose();
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) return;

    try {
      await onSubmit(form);
    } catch {
      // The page handles the mutation error and passes it through props.
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-2xl">
        {/* Modal Header */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-cyan-50/80 to-white px-6 py-6 sm:px-7">
          <DialogHeader>
          
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
              {isEditing
                ? "Edit conversation topic"
                : "Create a conversation topic"}
            </DialogTitle>

            <DialogDescription className="max-w-lg text-sm leading-6 text-slate-500">
              {isEditing
                ? "Update the scenario details and fine-tune how your AI conversation partner responds."
                : "Design a scenario your learners can practice with. Give it a clear purpose and define how the AI should respond."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Scrollable Form Body */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-7">
            {/* Scenario Details */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                  <MessageSquareText className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Scenario details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Describe what the learner will practice.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic-title"
                  className="text-sm font-bold text-slate-800"
                >
                  Topic title <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="topic-title"
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="e.g. Ordering Food at a Café"
                  required
                  maxLength={10000}
                  className="h-11 rounded-xl border-slate-200 bg-white font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-100"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic-description"
                  className="text-sm font-bold text-slate-800"
                >
                  Description <span className="text-red-500">*</span>
                </Label>

                <Textarea
                  id="topic-description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="What will the learner practice in this scenario?"
                  required
                  maxLength={10000}
                  rows={3}
                  className="resize-y rounded-xl border-slate-200 bg-white leading-6 text-slate-900 placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-100"
                />
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* AI Conversation Setup */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <WandSparkles className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    AI conversation setup
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set the opening message and coaching behavior.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic-opening"
                  className="text-sm font-bold text-slate-800"
                >
                  AI opening message{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Textarea
                  id="topic-opening"
                  value={form.aiOpeningMessage}
                  onChange={(event) =>
                    updateField("aiOpeningMessage", event.target.value)
                  }
                  placeholder="Write the first message the AI will say to begin the conversation..."
                  required
                  maxLength={10000}
                  rows={3}
                  className="resize-y rounded-xl border-slate-200 bg-white leading-6 text-slate-900 placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-100"
                />

                <p className="text-xs leading-5 text-slate-400">
                  Start with a natural, inviting message that sets the scene.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic-coaching"
                  className="text-sm font-bold text-slate-800"
                >
                  Coaching instructions{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Textarea
                  id="topic-coaching"
                  value={form.coachingInstructions}
                  onChange={(event) =>
                    updateField("coachingInstructions", event.target.value)
                  }
                  placeholder="Define the AI's role, tone, correction style, and how it should guide the learner..."
                  required
                  maxLength={10000}
                  rows={5}
                  className="resize-y rounded-xl border-slate-200 bg-white leading-6 text-slate-900 placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-100"
                />

                <p className="text-xs leading-5 text-slate-400">
                  Explain how the AI should respond, correct mistakes, and
                  keep the conversation moving.
                </p>
              </div>
            </section>

            {/* Mutation Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:gap-2 sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 rounded-xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 gap-2 rounded-xl bg-cyan-600 px-5 font-bold text-white shadow-sm transition hover:bg-cyan-700"
            >
              {isSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}

              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
