"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";

import { LanguagesGrid } from "@/components/global/admin/foundation/grids/LanguagesGrid";
import { LanguageModal } from "@/components/global/admin/foundation/modals/LanguageModal";
import { Language } from "@prisma/client";
import { PageShell } from "@/components/global/admin/foundation/page-shell";

export default function AdminLanguagesPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [langModal, setLangModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  // 1. Fetch languages
  const { data: languages = [], isLoading } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/foundation/languages");
      if (!res.ok) throw new Error("Failed to fetch languages");
      return res.json();
    },
  });

  // 2. Delete language mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/foundation/languages?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete language");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  // 3. Optimistic reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (updatedLanguages: Language[]) => {
      await fetch("/api/admin/foundation/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "language",
          items: updatedLanguages.map((item, idx) => ({ id: item.id, order: idx })),
        }),
      });
    },
    onMutate: async (updatedLanguages) => {
      await queryClient.cancelQueries({ queryKey: ["languages"] });
      const previous = queryClient.getQueryData<Language[]>(["languages"]);
      queryClient.setQueryData(["languages"], updatedLanguages);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["languages"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  const handleDragSort = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const items = [...languages];
    const [moved] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, moved);
    setDraggedIdx(null);
    reorderMutation.mutate(items);
  };

  // const handleSelectLanguage = (lang: Language) => {
  //   router.push(`/admin-portal/${adminId}/${lang.id}`);
  // };

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-500 fill-green-500" />
              Select Target Language
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Choose a language workspace to manage Foundation roadmaps, Novels, or AI settings.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingLanguage(null);
              setLangModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-2xl font-black text-sm hover:bg-green-700 transition cursor-pointer shadow-[0_4px_0_0_#15803d]"
          >
            <Plus className="w-4 h-4" /> Add Language
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            Loading active languages...
          </div>
        ) : (
          <LanguagesGrid
            languagePath={`/admin-portal/${adminId}`}
            languages={languages}
            // onSelect={handleSelectLanguage}
            onEdit={(lang, e) => {
              e.stopPropagation();
              setEditingLanguage(lang);
              setLangModal(true);
            }}
            onDelete={(id, e) => {
              e.stopPropagation();
              deleteMutation.mutate(id);
            }}
            onDragStart={setDraggedIdx}
            onDrop={handleDragSort}
          />
        )}

        {langModal && (
          <LanguageModal
            isOpen={langModal}
            onClose={() => {
              setLangModal(false);
              setEditingLanguage(null);
            }}
            languageToEdit={editingLanguage}
          />
        )}
      </div>
    </PageShell>
  );
}