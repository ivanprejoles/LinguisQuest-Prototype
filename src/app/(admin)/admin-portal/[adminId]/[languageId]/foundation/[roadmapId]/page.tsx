"use client";

import React, { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Layers } from "lucide-react";


import { StageModal } from "@/components/global/admin/foundation/modals/StageModal";
import { Stage } from "@/types/foundation/stage";
import { StagesStack } from "@/components/global/admin/foundation/grids/StagesStack";
import { PageShell } from "@/components/global/admin/foundation/page-shell";

export default function AdminStagesPage({
  params,
}: {
  params: Promise<{ adminId: string; languageId: string; roadmapId: string }>;
}) {
  const { roadmapId } = use(params);
  const queryClient = useQueryClient();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  // 1. Fetch Stages for current roadmapId
  const { data: stages = [], isLoading } = useQuery<Stage[]>({
    queryKey: ["stages", roadmapId],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/foundation/stages?roadmapId=${roadmapId}`
      );
      if (!res.ok) throw new Error("Failed to fetch stages");
      return res.json();
    },
  });

  // 2. Delete Stage Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/foundation/stages?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete stage");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages", roadmapId] });
    },
  });

  // 3. Optimistic Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async (updatedStages: Stage[]) => {
      await fetch("/api/admin/foundation/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "stage",
          items: updatedStages.map((item, idx) => ({
            id: item.id,
            order: idx,
          })),
        }),
      });
    },
    onMutate: async (updatedStages) => {
      await queryClient.cancelQueries({ queryKey: ["stages", roadmapId] });
      const previous = queryClient.getQueryData<Stage[]>(["stages", roadmapId]);
      queryClient.setQueryData(["stages", roadmapId], updatedStages);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["stages", roadmapId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stages", roadmapId] });
    },
  });

  const handleDragSort = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const items = [...stages];
    const [moved] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, moved);
    setDraggedIdx(null);
    reorderMutation.mutate(items);
  };

  return (
    <PageShell>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                <Layers className="w-6 h-6 text-green-500" />
                Stage Levels
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
                Configure learning activities and stage ordering for this roadmap.
            </p>
            </div>

            <button
            onClick={() => {
                setEditingStage(null);
                setStageModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-2xl font-black text-sm hover:bg-green-700 transition cursor-pointer shadow-[0_4px_0_0_#15803d]"
            >
            <Plus className="w-4 h-4" /> Add Stage Level
            </button>
        </div>

        {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-bold">
            Loading stage levels...
            </div>
        ) : (
            <StagesStack
            stages={stages}
            onEdit={(stage) => {
                setEditingStage(stage);
                setStageModalOpen(true);
            }}
            onDelete={(id) => {
                deleteMutation.mutate(id);
            }}
            onDragStart={setDraggedIdx}
            onDrop={handleDragSort}
            />
        )}

        {stageModalOpen && (
            <StageModal
            isOpen={stageModalOpen}
            roadmapId={roadmapId}
            stageToEdit={editingStage}
            onClose={() => {
                setStageModalOpen(false);
                setEditingStage(null);
            }}
            />
        )}
        </div>
    </PageShell>
  );
}