"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Language } from "@prisma/client";
import { Trash2, Edit, GripVertical } from "lucide-react";

import ErrorMessage from "../ErrorMessage";

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

interface LanguagesGridProps {
  languagePath: string;
  languages: Language[];
  onEdit: (language: Language, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;

  // Optional reusable error display
  errorTitle?: string;
  errorDescription?: string;
  errorActionLabel?: string;
  onErrorAction?: () => void;
}

export function LanguagesGrid({
  languagePath,
  languages,
  onEdit,
  onDelete,
  onDragStart,
  onDrop,
  errorTitle,
  errorDescription,
  errorActionLabel,
  onErrorAction,
}: LanguagesGridProps) {
  const [deletingLanguageId, setDeletingLanguageId] =
    useState<string | null>(null);

  const handleConfirmDelete = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();

    if (!deletingLanguageId) return;

    onDelete(deletingLanguageId, e);
    setDeletingLanguageId(null);
  };

  return (
    <>
      {errorTitle && errorDescription && (
        <div className="mb-4">
          <ErrorMessage
            title={errorTitle}
            description={errorDescription}
            actionLabel={errorActionLabel}
            onAction={onErrorAction}
          />
        </div>
      )}

      {languages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-bold text-slate-800">
            No languages yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Add a language to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {languages.map((lang, idx) => (
            <div
              key={lang.id}
              draggable
              onDragStart={(e) => {
                // Prevent dragging from an action button.
                if (
                  (e.target as HTMLElement).closest("button")
                ) {
                  e.preventDefault();
                  return;
                }

                onDragStart(idx);

                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", lang.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDrop(idx);
              }}
              className="group relative flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-green-500 hover:shadow-md"
            >
              <Link
                href={`${languagePath}/${lang.id}`}
                draggable={false}
                className="flex min-w-0 flex-1 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                aria-label={`Open ${lang.name}`}
              >
                <GripVertical
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 cursor-grab text-slate-300 group-hover:text-slate-400"
                />

                <img
                  src={`https://flagcdn.com/w80/${lang.countryCode.toLowerCase()}.png`}
                  alt={`${lang.name} flag`}
                  loading="lazy"
                  className="h-6 w-8 shrink-0 rounded border border-slate-200 object-cover"
                />

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-slate-800">
                    {lang.name}
                  </h3>

                  <p className="truncate text-xs font-medium text-slate-400">
                    {lang.voiceLanguage}
                  </p>
                </div>
              </Link>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lang, e);
                  }}
                  aria-label={`Edit ${lang.name}`}
                  title="Edit Language"
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <Edit
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingLanguageId(lang.id);
                  }}
                  aria-label={`Delete ${lang.name}`}
                  title="Delete Language"
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(deletingLanguageId)}
        onOpenChange={(open) => {
          if (!open) setDeletingLanguageId(null);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-3xl border-2 border-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">
              Delete Language?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm font-semibold text-slate-500">
              Are you sure you want to delete this language?
              Cascading delete will also remove all associated
              roadmaps, stage levels, and vocabulary data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-2xl border-2 border-slate-200 font-bold">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-2xl bg-red-500 font-black text-white shadow-[0_4px_0_0_#b91c1c] hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
