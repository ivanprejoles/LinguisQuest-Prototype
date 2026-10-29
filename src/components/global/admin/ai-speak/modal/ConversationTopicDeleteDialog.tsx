
"use client";

import { LoaderCircle, Trash2 } from "lucide-react";

import type { ConversationTopic } from "@/components/global/admin/ai-speak/modal/ConversationTopicModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConversationTopicDeleteDialogProps {
  topic: ConversationTopic | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error?: string;
}

export function ConversationTopicDeleteDialog({
  topic,
  isDeleting,
  onClose,
  onConfirm,
  error,
}: ConversationTopicDeleteDialogProps) {
  return (
    <AlertDialog
      open={Boolean(topic)}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="max-w-md rounded-3xl border-2 border-slate-100 bg-white text-slate-900 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black text-slate-800">
            Delete conversation topic?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm font-semibold leading-6 text-slate-500">
            {topic ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-black text-slate-800">
                  “{topic.title}”
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              "Are you sure you want to delete this topic? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <AlertDialogFooter className="mt-2 gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isDeleting}
            className="mt-0 rounded-2xl border-2 border-slate-200 font-bold text-slate-700"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={!topic || isDeleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="gap-2 rounded-2xl bg-red-500 font-black text-white shadow-[0_4px_0_0_#b91c1c] hover:bg-red-600"
          >
            {isDeleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            {isDeleting ? "Deleting..." : "Delete topic"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
