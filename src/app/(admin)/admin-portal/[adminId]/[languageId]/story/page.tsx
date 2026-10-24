
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Pencil,
  ImagePlus,
  Loader2,
  FolderOpen,
  X,
} from 'lucide-react';

type Workspace = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  languageId: string;
  updatedAt: string;
};

export default function WorkspaceDashboard() {
  const params = useParams<{
    adminId: string;
    languageId: string;
  }>();

  const router = useRouter();
  const { adminId, languageId } = params;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const basePath =
    `/admin-portal/${adminId}/${languageId}/story`;

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/novel/workspace?languageId=${encodeURIComponent(languageId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load workspaces');
      }

      setWorkspaces(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load workspaces'
      );
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  function openCreateModal() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setPreview('');
    setError('');
    setModalOpen(true);
  }

  function openEditModal(workspace: Workspace) {
    setEditingId(workspace.id);
    setTitle(workspace.title ?? '');
    setDescription(workspace.description ?? '');
    setImageFile(null);
    setPreview(workspace.imageUrl ?? '');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setImageFile(null);
    setError('');
  }

  function handleImageChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The cover image must be 5 MB or smaller.');
      return;
    }

    setError('');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadCover(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      '/api/admin/novel/workspace/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Cover image upload failed');
    }

    return data.url;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError('Please enter a workspace title.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        imageUrl = await uploadCover(imageFile);
      }

      const response = await fetch(
        editingId
          ? `/api/admin/novel/workspace/${editingId}`
          : '/api/admin/novel/workspace',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            ...(editingId ? {} : { languageId }),
            ...(imageUrl ? { imageUrl } : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save workspace');
      }

      closeModal();

      if (!editingId) {
        // Open the newly created workspace immediately.
        router.push(`${basePath}/${data.id}`);
        return;
      }

      await loadWorkspaces();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save workspace'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(workspace: Workspace) {
    const confirmed = window.confirm(
      `Delete "${workspace.title}"? This may also affect its related data.`
    );

    if (!confirmed) return;

    setError('');

    try {
      const response = await fetch(
        `/api/admin/novel/workspace/${workspace.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete workspace');
      }

      setWorkspaces((current) =>
        current.filter((item) => item.id !== workspace.id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete workspace'
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1329] text-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-300">
              <FolderOpen size={20} />
              <span className="text-sm font-medium">Story Studio</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Workspaces
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create and manage your interactive stories.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold hover:bg-indigo-500"
          >
            <Plus size={18} />
            Create Workspace
          </button>
        </header>

        {error && !modalOpen && (
          <div role="alert" className="mb-5 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-indigo-400" size={30} />
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
              onClick={openCreateModal}
              className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-500"
            >
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((workspace) => (
              <article
                key={workspace.id}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#111c35] transition hover:border-indigo-500/70"
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
                        alt={workspace.title || ''}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">
                        <ImagePlus size={36} />
                      </div>
                    )}
                  </div>

                  <div className="p-4 pb-2">
                    <h2 className="truncate text-lg font-semibold">
                      {workspace.title?.trim() || 'Untitled Workspace'}
                    </h2>

                    <p className="mt-2 min-h-10 line-clamp-2 text-sm text-slate-400">
                      {workspace.description?.trim() || 'No description provided.'}
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
                      onClick={() => void handleDelete(workspace)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
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
            className="my-auto w-full max-w-lg space-y-5 rounded-2xl border border-slate-700 bg-[#111c35] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Workspace' : 'Create Workspace'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Workspace cover
              </label>

              <label className="block cursor-pointer">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-600 bg-[#0b1329]">
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
                value={title ?? ''}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                required
                placeholder="e.g. The Lost Kingdom"
                className="w-full rounded-lg border border-slate-700 bg-[#0b1329] px-3 py-3 outline-none focus:border-indigo-500"
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
                placeholder="Describe this story..."
                className="w-full resize-y rounded-lg border border-slate-700 bg-[#0b1329] px-3 py-3 outline-none focus:border-indigo-500"
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
                disabled={saving}
                className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm hover:bg-slate-600 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !(title ?? '').trim()}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Create Workspace'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
