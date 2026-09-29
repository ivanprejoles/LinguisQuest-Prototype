"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Map } from "lucide-react";

import { RoadmapsGrid } from "@/components/global/admin/foundation/grids/RoadmapsGrid";
import { RoadmapModal } from "@/components/global/admin/foundation/modals/RoadmapModal";
import { Roadmap } from "@prisma/client";
import { PageShell } from "@/components/global/admin/foundation/page-shell";

export default function AdminRoadmapsPage({
  params,
}: {
  params: Promise<{ adminId: string; languageId: string }>;
}) {
  const { adminId, languageId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [roadmapModal, setRoadmapModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);

  // 1. Fetch Roadmaps scoped to current languageId parameter
  const { data: roadmaps = [], isLoading } = useQuery<Roadmap[]>({
    queryKey: ["roadmaps", languageId],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/foundation/roadmaps?languageId=${languageId}`
      );
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      return res.json();
    },
  });

  // 2. Delete Roadmap mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/foundation/roadmaps?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete roadmap");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", languageId] });
    },
  });

  // 3. Optimistic reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (updatedRoadmaps: Roadmap[]) => {
      await fetch("/api/admin/foundation/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "roadmap",
          items: updatedRoadmaps.map((item, idx) => ({
            id: item.id,
            order: idx,
          })),
        }),
      });
    },
    onMutate: async (updatedRoadmaps) => {
      await queryClient.cancelQueries({ queryKey: ["roadmaps", languageId] });
      const previous = queryClient.getQueryData<Roadmap[]>([
        "roadmaps",
        languageId,
      ]);
      queryClient.setQueryData(["roadmaps", languageId], updatedRoadmaps);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["roadmaps", languageId],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", languageId] });
    },
  });

  const handleDragSort = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const items = [...roadmaps];
    const [moved] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, moved);
    setDraggedIdx(null);
    reorderMutation.mutate(items);
  };

  const handleSelectRoadmap = (roadmap: Roadmap) => {
    router.push(`/admin-portal/${adminId}/${languageId}/foundation/${roadmap.id}`);
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <Map className="w-6 h-6 text-green-500" />
              Select Roadmap
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Manage learning tracks and lesson stages for this language workspace.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingRoadmap(null);
              setRoadmapModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-2xl font-black text-sm hover:bg-green-700 transition cursor-pointer shadow-[0_4px_0_0_#15803d]"
          >
            <Plus className="w-4 h-4" /> Add Roadmap
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            Loading roadmaps...
          </div>
        ) : (
          <RoadmapsGrid
            roadmapPath={`/admin-portal/${adminId}/${languageId}/foundation`}
            roadmaps={roadmaps}
            // onSelect={handleSelectRoadmap}
            onEdit={(roadmap, e) => {
              e.stopPropagation();
              setEditingRoadmap(roadmap);
              setRoadmapModal(true);
            }}
            onDelete={(id, e) => {
              deleteMutation.mutate(id);
            }}
            onDragStart={setDraggedIdx}
            onDrop={handleDragSort}
          />
        )}

        {roadmapModal && (
          <RoadmapModal
            isOpen={roadmapModal}
            languageId={languageId}
            onClose={() => {
              setRoadmapModal(false);
              setEditingRoadmap(null);
            }}
            roadmapToEdit={editingRoadmap}
          />
        )}
      </div>
    </PageShell>
  );
}