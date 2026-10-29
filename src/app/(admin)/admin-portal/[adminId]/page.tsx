
"use client";

import { use, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import type { Language } from "@prisma/client";

import { LanguagesGrid } from "@/components/global/admin/foundation/grids/LanguagesGrid";
import {LanguageModal} from "@/components/global/admin/foundation/modals/LanguageModal";
import { PageShell } from "@/components/global/admin/foundation/page-shell";

const languageQueryKey = ["admin-languages"] as const;

export default function AdminLanguagesPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = use(params);
  const queryClient = useQueryClient();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [langModal, setLangModal] = useState(false);
  const [editingLanguage, setEditingLanguage] =
    useState<Language | null>(null);

  // 1. Fetch languages
  const {
    data: languages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Language[]>({
    queryKey: languageQueryKey,
    queryFn: async ({ signal }) => {
      const res = await fetch("/api/admin/foundation/languages", {
        signal,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch languages");
      }

      return res.json();
    },
  });

  // 2. Delete language mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/admin/foundation/languages?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete language");
      }
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: languageQueryKey,
      });
    },
  });

  // 3. Optimistic reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (updatedLanguages: Language[]) => {
      const res = await fetch("/api/admin/foundation/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity: "language",
          items: updatedLanguages.map((item, idx) => ({
            id: item.id,
            order: idx,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reorder languages");
      }
    },

    onMutate: async (updatedLanguages) => {
      await queryClient.cancelQueries({
        queryKey: languageQueryKey,
      });

      const previous =
        queryClient.getQueryData<Language[]>(languageQueryKey);

      queryClient.setQueryData<Language[]>(
        languageQueryKey,
        updatedLanguages
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          languageQueryKey,
          context.previous
        );
      }
    },

    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: languageQueryKey,
      });
    },
  });

  // 4. Handle drag-and-drop sorting
  const handleDragSort = (targetIdx: number) => {
    if (draggedIdx === null) return;

    if (
      draggedIdx === targetIdx ||
      targetIdx < 0 ||
      targetIdx >= languages.length
    ) {
      setDraggedIdx(null);
      return;
    }

    const items = [...languages];
    const [moved] = items.splice(draggedIdx, 1);

    if (!moved) {
      setDraggedIdx(null);
      return;
    }

    items.splice(targetIdx, 0, moved);
    setDraggedIdx(null);

    reorderMutation.mutate(items);
  };

  // 5. Modal handlers
  const openCreateModal = () => {
    setEditingLanguage(null);
    setLangModal(true);
  };

  const openEditModal = (language: Language) => {
    setEditingLanguage(language);
    setLangModal(true);
  };

  const closeModal = () => {
    setLangModal(false);
    setEditingLanguage(null);
  };

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <div className="w-full space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-500 fill-cyan-500" />
              Select Target Language
            </h1>

            <p className="text-sm font-semibold text-slate-500 mt-1">
              Choose a language workspace to manage Foundation roadmaps, Novels, or AI settings.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 font-black text-sm text-white shadow-[0_4px_0_0_#0e7490] transition hover:bg-cyan-700"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </button>
        </div>

        {/* Fetch error */}
        {isError ? (
          <div className="p-12 text-center space-y-3">
            <p className="font-bold text-red-500">
              {error.message}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            Loading active languages...
          </div>
        ) : (
          <LanguagesGrid
            languagePath={`/admin-portal/${adminId}`}
            languages={languages}
            onEdit={(lang, e) => {
              e.stopPropagation();
              openEditModal(lang);
            }}
            onDelete={(id, e) => {
              e.stopPropagation();
              deleteMutation.mutate(id);
            }}
            onDragStart={setDraggedIdx}
            onDrop={handleDragSort}
          />
        )}

        {/* Mutation feedback */}
        {deleteMutation.isError && (
          <p role="alert" className="text-sm font-semibold text-red-500">
            {deleteMutation.error.message}
          </p>
        )}

        {reorderMutation.isError && (
          <p role="alert" className="text-sm font-semibold text-red-500">
            {reorderMutation.error.message}
          </p>
        )}

        {reorderMutation.isPending && (
          <p className="text-sm font-medium text-slate-400">
            Saving language order...
          </p>
        )}

        {/* Create / Edit modal */}
        {langModal && (
          <LanguageModal
            isOpen={langModal}
            onClose={closeModal}
            languageToEdit={editingLanguage}
          />
        )}
      </div>
    </PageShell>
  );
}
