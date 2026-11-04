"use client";

import React, { use, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Layers } from "lucide-react";

import { StageModal } from "@/components/global/admin/foundation/modals/StageModal";
import type { Stage } from "@/types/foundation/stage";
import { StagesStack } from "@/components/global/admin/foundation/grids/StagesStack";
import { PageShell } from "@/components/global/admin/foundation/page-shell";

export default function AdminStagesPage({
  params,
}: {
  params: Promise<{
    adminId: string;
    languageId: string;
    roadmapId: string;
  }>;
}) {
  const { roadmapId } = use(params);
  const queryClient = useQueryClient();

  // Keep the same key in StageModal.
  const queryKey = ["admin-stages", roadmapId] as const;

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Prevent delete/reorder actions from overlapping.
  const operationLock = useRef(false);

  // 1. Fetch stages.
  const {
    data: stages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Stage[], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const search = new URLSearchParams({ roadmapId });

      const res = await fetch(
        `/api/admin/foundation/stages?${search.toString()}`,
        { signal },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch stage levels.");
      }

      return res.json();
    },
    enabled: Boolean(roadmapId),
    retry: 1,
  });

  // 2. Delete a stage.
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/admin/foundation/stages?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        throw new Error("Failed to delete stage level.");
      }
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
    onSettled: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey });
      } finally {
        operationLock.current = false;
      }
    },
  });

  // 3. Reorder stages with optimistic update and rollback.
  const reorderMutation = useMutation<
    void,
    Error,
    Stage[],
    { previousStages: Stage[] | undefined }
  >({
    mutationFn: async (updatedStages) => {
      const res = await fetch("/api/admin/foundation/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "stage",
          items: updatedStages.map((stage, index) => ({
            id: stage.id,
            order: index,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save stage order.");
      }
    },

    onMutate: async (updatedStages) => {
      setActionError(null);
      await queryClient.cancelQueries({ queryKey });

      const previousStages =
        queryClient.getQueryData<Stage[]>(queryKey);

      queryClient.setQueryData(queryKey, updatedStages);

      return { previousStages };
    },

    onError: (error, _updatedStages, context) => {
      if (context?.previousStages !== undefined) {
        queryClient.setQueryData(queryKey, context.previousStages);
      }

      setActionError(error.message);
    },

    onSettled: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey });
      } finally {
        operationLock.current = false;
      }
    },
  });

  // 4. Handle drag-and-drop.
  const handleDragSort = (targetIdx: number) => {
    const sourceIdx = draggedIdx;
    setDraggedIdx(null);

    if (
      sourceIdx === null ||
      sourceIdx === targetIdx ||
      sourceIdx < 0 ||
      targetIdx < 0 ||
      sourceIdx >= stages.length ||
      targetIdx >= stages.length ||
      operationLock.current
    ) {
      return;
    }

    const updatedStages = [...stages];
    const [movedStage] = updatedStages.splice(sourceIdx, 1);

    if (!movedStage) return;

    updatedStages.splice(targetIdx, 0, movedStage);

    operationLock.current = true;
    setActionError(null);
    reorderMutation.mutate(updatedStages);
  };

  // 5. Handle deletion.
  const handleDelete = (id: string) => {
    if (operationLock.current) return;

    operationLock.current = true;
    setActionError(null);
    deleteMutation.mutate(id);
  };

  const openCreateModal = () => {
    setEditingStage(null);
    setStageModalOpen(true);
  };

  const closeStageModal = () => {
    setStageModalOpen(false);
    setEditingStage(null);
  };

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <div className="w-full space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-500" />
              Stage Levels
            </h1>

            <p className="text-sm font-semibold text-slate-500 mt-1">
              Configure learning activities and stage ordering for this roadmap.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-2xl font-black text-sm hover:bg-cyan-700 transition cursor-pointer shadow-[0_4px_0_0_#0e7490]"
          >
            <Plus className="w-4 h-4" /> Add Stage Level
          </button>
        </div>

        {actionError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
          >
            {actionError}
          </p>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            Loading stage levels...
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            <p className="font-bold">
              {error.message}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <StagesStack
            stages={stages}
            onEdit={(stage) => {
              setEditingStage(stage);
              setStageModalOpen(true);
            }}
            onDelete={handleDelete}
            onDragStart={setDraggedIdx}
            onDrop={handleDragSort}
          />
        )}

        {stageModalOpen && (
          <StageModal
            isOpen={stageModalOpen}
            roadmapId={roadmapId}
            stageToEdit={editingStage}
            onClose={closeStageModal}
          />
        )}
      </div>
    </PageShell>
  );
}
