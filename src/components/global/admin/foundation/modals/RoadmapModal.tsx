"use client";

import React, { useState, useEffect } from "react";
import { Roadmap } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageId: string;
  roadmapToEdit?: Roadmap | null;
}

export function RoadmapModal({
  isOpen,
  onClose,
  languageId,
  roadmapToEdit,
}: RoadmapModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(roadmapToEdit);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync form state on open / edit target change
  useEffect(() => {
    if (!isOpen) return;

    if (roadmapToEdit) {
      setTitle(roadmapToEdit.title || "");
      setDesc(roadmapToEdit.description || "");
      setImageFile(null);
      setPreviewUrl(roadmapToEdit.imageUrl || null);
    } else {
      setTitle("");
      setDesc("");
      setImageFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, roadmapToEdit]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // TanStack Query Mutation handling image upload + record saving in one atomic flow
  const saveMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = roadmapToEdit?.imageUrl || null;
      let imageFileId = roadmapToEdit?.imageFileId || null;

      // 1. Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("subfolder", "roadmaps");

        const uploadRes = await fetch("/api/admin/foundation/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
        imageFileId = uploadJson.fileId;
      }

      // 2. Prepare payload
      const payload = {
        ...(isEditing && roadmapToEdit ? { id: roadmapToEdit.id } : {}),
        title: title.trim(),
        description: desc.trim(),
        languageId,
        imageUrl,
        imageFileId,
      };

      // 3. Save or Update Roadmap
      const res = await fetch("/api/admin/foundation/roadmaps", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save roadmap");

      return res.json();
    },
    onSuccess: () => {
      // Invalidate specifically for the current languageId
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps", languageId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !languageId || saveMutation.isPending) return;
    saveMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800">
            {isEditing ? "Edit Roadmap" : "Create New Roadmap"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Title
            </label>
            <Input
              placeholder="e.g. Basics of Syntax"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium border-slate-200"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Description
            </label>
            <Textarea
              placeholder="Short description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="font-medium border-slate-200 min-h-[90px]"
            />
          </div>

          {/* Image Upload & Preview */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Illustration / Card Image
            </label>

            {previewUrl && (
              <div className="mb-2 flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-md border border-slate-200"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {imageFile
                    ? "New image selected."
                    : "Current image kept unless replaced."}
                </span>
              </div>
            )}

            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isPending || !title.trim()}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold h-11 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saveMutation.isPending
              ? "Saving..."
              : isEditing
              ? "Update Roadmap"
              : "Save Roadmap"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}