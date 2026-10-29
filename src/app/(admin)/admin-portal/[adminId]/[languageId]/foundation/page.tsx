"use client";

import React, { use, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Map, Loader2 } from "lucide-react";

import { RoadmapsGrid } from "@/components/global/admin/foundation/grids/RoadmapsGrid";
import { RoadmapModal } from "@/components/global/admin/foundation/modals/RoadmapModal";
import { PageShell } from "@/components/global/admin/foundation/page-shell";

import type { Roadmap } from "@prisma/client";

type PageParams = {
  adminId: string;
  languageId: string;
};

type MutationContext = {
  previousRoadmaps: Roadmap[] | undefined;
};

export default function AdminRoadmapsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { adminId, languageId } = use(params);

  const queryClient = useQueryClient();
  const queryKey = ["admin-roadmaps", languageId];

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [roadmapModal, setRoadmapModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] =
    useState<Roadmap | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reorderLockRef = useRef(false);
  const deleteLockRef = useRef(false);

  // Fetch roadmaps
  const {
    data: roadmaps = [],
    isPending: isLoading,
    isError: isFetchError,
    error: fetchError,
    refetch: refetchRoadmaps,
  } = useQuery<Roadmap[], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams({ languageId });

      const response = await fetch(
        `/api/admin/foundation/roadmaps?${searchParams.toString()}`,
        { signal },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roadmaps.");
      }

      return (await response.json()) as Roadmap[];
    },
    enabled: Boolean(languageId),
    retry: 1,
  });

  // Delete roadmap
  const deleteMutation = useMutation<
    void,
    Error,
    string,
    MutationContext
  >({
    mutationFn: async (id) => {
      const response = await fetch(
        `/api/admin/foundation/roadmaps?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete roadmap.");
      }
    },

    onMutate: async (id) => {
      setActionError(null);

      await queryClient.cancelQueries({ queryKey });

      const previousRoadmaps =
        queryClient.getQueryData<Roadmap[]>(queryKey);

      if (previousRoadmaps) {
        queryClient.setQueryData<Roadmap[]>(
          queryKey,
          previousRoadmaps.filter((roadmap) => roadmap.id !== id),
        );
      }

      return { previousRoadmaps };
    },

    onError: (error, _id, context) => {
      if (context?.previousRoadmaps) {
        queryClient.setQueryData(
          queryKey,
          context.previousRoadmaps,
        );
      }

      setActionError(error.message);
    },

    onSettled: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey });
      } finally {
        deleteLockRef.current = false;
      }
    },
  });

  // Reorder roadmaps
  const reorderMutation = useMutation<
    void,
    Error,
    Roadmap[],
    MutationContext
  >({
    mutationFn: async (updatedRoadmaps) => {
      const response = await fetch("/api/admin/foundation/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "roadmap",
          items: updatedRoadmaps.map((roadmap, index) => ({
            id: roadmap.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save roadmap order.");
      }
    },

    onMutate: async (updatedRoadmaps) => {
      setActionError(null);

      await queryClient.cancelQueries({ queryKey });

      const previousRoadmaps =
        queryClient.getQueryData<Roadmap[]>(queryKey);

      queryClient.setQueryData<Roadmap[]>(
        queryKey,
        updatedRoadmaps,
      );

      return { previousRoadmaps };
    },

    onError: (error, _updatedRoadmaps, context) => {
      if (context?.previousRoadmaps) {
        queryClient.setQueryData(
          queryKey,
          context.previousRoadmaps,
        );
      }

      setActionError(error.message);
    },

    onSettled: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey });
      } finally {
        reorderLockRef.current = false;
      }
    },
  });

  // Handle drag-and-drop ordering
  const handleDragSort = (targetIdx: number) => {
    const sourceIdx = draggedIdx;
    setDraggedIdx(null);

    if (
      sourceIdx === null ||
      sourceIdx === targetIdx ||
      sourceIdx < 0 ||
      targetIdx < 0 ||
      sourceIdx >= roadmaps.length ||
      targetIdx >= roadmaps.length
    ) {
      return;
    }

    if (
      reorderLockRef.current ||
      deleteLockRef.current ||
      deleteMutation.isPending ||
      reorderMutation.isPending
    ) {
      return;
    }

    const updatedRoadmaps = [...roadmaps];
    const [movedRoadmap] = updatedRoadmaps.splice(sourceIdx, 1);

    if (!movedRoadmap) return;

    updatedRoadmaps.splice(targetIdx, 0, movedRoadmap);

    reorderLockRef.current = true;
    reorderMutation.mutate(updatedRoadmaps);
  };

  // Handle deleting a roadmap
  const handleDelete = (
    id: string,
    event?: React.MouseEvent,
  ) => {
    event?.stopPropagation();

    if (
      deleteLockRef.current ||
      reorderLockRef.current ||
      deleteMutation.isPending ||
      reorderMutation.isPending
    ) {
      return;
    }

    deleteLockRef.current = true;
    deleteMutation.mutate(id);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingRoadmap(null);
    setRoadmapModal(true);
  };

  // Open edit modal
  const openEditModal = (
    roadmap: Roadmap,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setEditingRoadmap(roadmap);
    setRoadmapModal(true);
  };

  // Close modal without unnecessary refetching
  const closeRoadmapModal = () => {
    setRoadmapModal(false);
    setEditingRoadmap(null);
  };

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <div className="w-full space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <Map className="w-6 h-6 text-cyan-500" />
              Select Roadmap
            </h1>

            <p className="text-sm font-semibold text-slate-500 mt-1">
              Manage learning tracks and lesson stages for this language workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-2xl font-black text-sm hover:bg-cyan-700 transition cursor-pointer shadow-[0_4px_0_0_#0e7490]"
          >
            <Plus className="w-4 h-4" />
            Create Roadmap
          </button>
        </div>

        {actionError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            <span>{actionError}</span>

            <button
              type="button"
              onClick={() => setActionError(null)}
              className="shrink-0 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-cyan-600" size={32} />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading roadmaps...
            </p>
          </div>
        ) : isFetchError ? (
          <div className="p-12 text-center">
            <p className="font-bold text-red-600">
              {fetchError?.message ?? "Failed to load roadmaps."}
            </p>

            <button
              type="button"
              onClick={() => void refetchRoadmaps()}
              className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white transition hover:bg-cyan-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <RoadmapsGrid
            roadmapPath={`/admin-portal/${adminId}/${languageId}/foundation`}
            roadmaps={roadmaps}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onDragStart={setDraggedIdx}
            onDrop={handleDragSort}
          />
        )}

        {roadmapModal && (
          <RoadmapModal
            isOpen={roadmapModal}
            languageId={languageId}
            onClose={closeRoadmapModal}
            roadmapToEdit={editingRoadmap}
          />
        )}
      </div>
    </PageShell>
  );
}
