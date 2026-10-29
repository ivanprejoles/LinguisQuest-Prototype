
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Pencil,
  ImagePlus,
  Loader2,
  FolderOpen,
  X,
} from "lucide-react";

import { PageShell } from "@/components/global/admin/foundation/page-shell";

type Workspace = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  languageId: string;
  updatedAt: string;
};

type SaveWorkspaceVariables = {
  editingId: string | null;
  title: string;
  description: string;
  imageFile: File | null;
};

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
  } catch {
    // The API might return a non-JSON error.
  }

  return fallback;
}

export default function WorkspaceDashboard() {
  const params = useParams<{
    adminId: string;
    languageId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const { adminId, languageId } = params;

  const queryKey = ["admin-story-workspaces", languageId] as const;

  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const basePath = `/admin-portal/${adminId}/${languageId}/story`;

  // Release locally generated image previews when replaced or unmounted.
  useEffect(() => {
    if (!preview.startsWith("blob:")) return;

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 1. Fetch workspaces.
  const {
    data: workspaces = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery<Workspace[], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const search = new URLSearchParams({ languageId });

      const response = await fetch(
        `/api/admin/novel/workspace?${search.toString()}`,
        { signal },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to load workspaces."),
        );
      }

      return (await response.json()) as Workspace[];
    },
    enabled: Boolean(languageId),
    retry: 1,
  });

  // 2. Upload a cover image when one is selected.
  async function uploadCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "/api/admin/novel/workspace/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Cover image upload failed."),
      );
    }

    const data = await response.json();

    if (typeof data.url !== "string" || !data.url.trim()) {
      throw new Error("The image upload did not return a valid URL.");
    }

    return data.url;
  }

  // 3. Create or update a workspace.
  const saveMutation = useMutation<
    { id?: string },
    Error,
    SaveWorkspaceVariables
  >({
    mutationFn: async ({
      editingId: targetId,
      title: workspaceTitle,
      description: workspaceDescription,
      imageFile: selectedImage,
    }) => {
      let imageUrl: string | undefined;

      if (selectedImage) {
        imageUrl = await uploadCover(selectedImage);
      }

      const response = await fetch(
        targetId
          ? `/api/admin/novel/workspace/${encodeURIComponent(targetId)}`
          : "/api/admin/novel/workspace",
        {
          method: targetId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: workspaceTitle,
            description: workspaceDescription,
            ...(targetId ? {} : { languageId }),
            ...(imageUrl ? { imageUrl } : {}),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to save workspace.",
        );
      }

      return data as { id?: string };
    },
    onSuccess: async () => {
      setModalOpen(false);
      setImageFile(null);
      setPreview("");
      setError("");

      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (mutationError) => {
      setError(mutationError.message);
    },
  });

  // 4. Delete a workspace.
  const deleteMutation = useMutation<void, Error, Workspace>({
    mutationFn: async (workspace) => {
      const response = await fetch(
        `/api/admin/novel/workspace/${encodeURIComponent(workspace.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to delete workspace."),
        );
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      setError("");
    },

    onError: (mutationError) => {
      setError(mutationError.message);
    },
  });

  function openCreateModal() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageFile(null);
    setPreview("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(workspace: Workspace) {
    setEditingId(workspace.id);
    setTitle(workspace.title ?? "");
    setDescription(workspace.description ?? "");
    setImageFile(null);
    setPreview(workspace.imageUrl ?? "");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saveMutation.isPending) return;

    setModalOpen(false);
    setImageFile(null);
    setPreview("");
    setError("");
  }

  function handleImageChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The cover image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a workspace title.");
      return;
    }

    if (!languageId || saveMutation.isPending) return;

    setError("");

    saveMutation.mutate({
      editingId,
      title: title.trim(),
      description: description.trim(),
      imageFile,
    });
  }

  function handleDelete(workspace: Workspace) {
    if (deleteMutation.isPending) return;

    const confirmed = window.confirm(
      `Delete "${workspace.title}"? This may also affect its related data.`,
    );

    if (!confirmed) return;

    setError("");
    deleteMutation.mutate(workspace);
  }

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <div className="w-full space-y-6 pb-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-cyan-500" />
              Select Workspace
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create and manage your interactive stories.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-2xl font-black text-sm hover:bg-cyan-700 transition cursor-pointer shadow-[0_4px_0_0_#0e7490]"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        </header>

        {error && !modalOpen && (
          <div role="alert" className="mb-5 text-sm text-red-400">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-cyan-600" size={32} />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading stories...
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p role="alert" className="text-sm text-red-400">
              {queryError.message}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Try Again
            </button>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-20 text-center">
            <ImagePlus className="mx-auto mb-4 text-slate-500" size={42} />

            <h2 className="text-xl font-semibold">
              Your story library is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Create a workspace for a story, scenario, or interactive
              learning experience.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-6 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500"
            >
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((workspace) => (
              <article
                key={workspace.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-cyan-300 hover:shadow-md"
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() =>
                    router.push(`${basePath}/${workspace.id}`)
                  }
                >
                  <div className="aspect-video overflow-hidden bg-slate-800">
                    {workspace.imageUrl ? (
                      <img
                        src={workspace.imageUrl}
                        alt={workspace.title || ""}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImagePlus size={36} />
                      </div>
                    )}
                  </div>

                  <div className="p-4 pb-2">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {workspace.title?.trim() || "Untitled Workspace"}
                    </h2>

                    <p className="mt-2 min-h-10 line-clamp-2 text-sm text-slate-500">
                      {workspace.description?.trim() ||
                        "No description provided."}
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-between px-4 pb-4 pt-2">
                  <span className="text-xs text-slate-500">
                    {new Date(workspace.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${workspace.title}`}
                      onClick={() => openEditModal(workspace)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${workspace.title}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(workspace)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <form
            onSubmit={handleSave}
            className="my-auto w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Workspace" : "Create Workspace"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saveMutation.isPending}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Workspace cover
              </label>

              <label className="block cursor-pointer">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImagePlus className="mx-auto mb-2" size={30} />
                      <span className="text-sm">Choose cover image</span>
                      <p className="mt-1 text-xs">Maximum 5 MB</p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  disabled={saveMutation.isPending}
                  className="hidden"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0])
                  }
                />
              </label>
            </div>

            <div>
              <label
                htmlFor="workspace-title"
                className="mb-2 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="workspace-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                required
                disabled={saveMutation.isPending}
                placeholder="e.g. The Lost Kingdom"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label
                htmlFor="workspace-description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                rows={3}
                disabled={saveMutation.isPending}
                placeholder="Describe this story..."
                className="w-full resize-y rounded-lg border border-slate-700 px-3 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saveMutation.isPending}
                className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saveMutation.isPending || !title.trim()}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {saveMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {saveMutation.isPending
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Workspace"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  );
}
