"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DynamicActivityForm } from "@/components/global/admin/foundation/DynamicActivityForm";
import {
  Sparkles,
  PenTool,
  CheckCircle2,
  Volume2,
  Ear,
  Layers,
  ChevronDown,
  Check,
  Puzzle,
} from "lucide-react";
import { Stage } from "@/types/foundation/stage";
import { ActivityPayload, ActivityType } from "@/types/foundation/materials";

interface StageModalProps {
  isOpen: boolean;
  roadmapId: string;
  stageToEdit?: Stage | null;
  onClose: () => void;
}

const ACTIVITY_TYPES = [
  {
    id: "sentenceBuilder",
    title: "Sentence Builder",
    category: "Grammar",
    icon: Layers,
    color: "text-blue-500 bg-blue-50 border-blue-200",
  },
  {
    id: "matching",
    title: "Matching Pairs",
    category: "Vocabulary",
    icon: Puzzle,
    color: "text-purple-500 bg-purple-50 border-purple-200",
  },
  {
    id: "multipleChoice",
    title: "Multiple Choice",
    category: "Quiz",
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
  },
  {
    id: "tapWhatYouHear",
    title: "Audio Dictation",
    category: "Listening",
    icon: Volume2,
    color: "text-amber-500 bg-amber-50 border-amber-200",
  },
  {
    id: "fillInTheBlank",
    title: "Missing Word",
    category: "Listening",
    icon: Ear,
    color: "text-orange-500 bg-orange-50 border-orange-200",
  },
  {
    id: "tracing",
    title: "Letter Tracing",
    category: "Writing",
    icon: PenTool,
    color: "text-indigo-500 bg-indigo-50 border-indigo-200",
  },
];

export function StageModal({
  isOpen,
  roadmapId,
  stageToEdit,
  onClose,
}: StageModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(stageToEdit?.id);

  const [type, setType] = useState("sentenceBuilder");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(stageToEdit?.type || "sentenceBuilder");
      setErrorMessage(null);
    }
  }, [isOpen, stageToEdit]);

  const saveMutation = useMutation({
    mutationFn: async (payload: ActivityPayload) => {
      const formData = new FormData();
      formData.append("roadmapId", roadmapId);

      const rawPayload = { ...payload } as Record<string, unknown>;
      delete rawPayload.isValid;

      const rawAudioFile = rawPayload.audioFile || rawPayload.mainAudio;
      if (rawAudioFile instanceof File) {
        formData.append("audioFile", rawAudioFile);
      }
      delete rawPayload.audioFile;
      delete rawPayload.mainAudio;

      if (type === "multipleChoice" && Array.isArray(rawPayload.options)) {
        rawPayload.options = rawPayload.options.map(
          (opt: Record<string, unknown>, index: number) => {
            const { imageFile, ...restOption } = opt;
            if (imageFile instanceof File) {
              formData.append(`option_image_${index}`, imageFile);
            }
            return restOption;
          }
        );
      }

      formData.append("payload", JSON.stringify({ type, ...rawPayload }));

      const endpoint =
        isEditing && stageToEdit
          ? `/api/admin/foundation/stages?id=${stageToEdit.id}`
          : "/api/admin/foundation/stages";

      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || `Failed to ${isEditing ? "update" : "save"} stage level`
        );
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages", roadmapId] });
      onClose();
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "An unexpected error occurred.");
    },
  });

  const handleFormSubmit = (payload: ActivityPayload) => {
    setErrorMessage(null);

    if (!payload.isValid) {
      const formError = (payload as { error?: string }).error;
      setErrorMessage(
        formError || "Please complete all required fields for this activity."
      );
      return;
    }

    if (!roadmapId || saveMutation.isPending) return;

    saveMutation.mutate(payload);
  };

  const selectedActivity = ACTIVITY_TYPES.find((act) => act.id === type);

  const initialFormData = stageToEdit?.payload
    ? { ...stageToEdit.payload, type: stageToEdit.type as ActivityType }
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl h-[85vh] min-w-1/2 overflow-y-auto rounded-3xl scrollbar-none">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            {isEditing ? "Edit Stage Level" : "Configure Stage Level"}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isEditing
              ? "Modify the activity format and update stage details"
              : "Select an activity format and setup the stage details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 min-h-50">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase text-slate-500 tracking-wider">
              Activity Type
            </label>

            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 hover:border-green-500 focus:outline-none transition-all shadow-sm flex items-center justify-between cursor-pointer"
                  >
                    {selectedActivity && (
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg border shrink-0 ${selectedActivity.color}`}
                        >
                          <selectedActivity.icon className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-slate-800 text-sm truncate">
                          {selectedActivity.title}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                          {selectedActivity.category}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </button>
                }
              />

              <PopoverContent
                side="bottom"
                align="start"
                sideOffset={6}
                className="w-[var(--radix-popover-trigger-width)] max-w-xl p-2 rounded-2xl border-2 border-slate-200 bg-white shadow-xl z-[100]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ACTIVITY_TYPES.map((activity) => {
                    const Icon = activity.icon;
                    const isSelected = activity.id === type;

                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => {
                          setType(activity.id);
                          setPopoverOpen(false);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 relative cursor-pointer ${
                          isSelected
                            ? "border-green-500 bg-green-50/60"
                            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg border shrink-0 ${activity.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-slate-800 text-xs truncate">
                            {activity.title}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {activity.category}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-green-600 stroke-[3] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="bg-slate-50/50 rounded-2xl border-2 border-slate-100 p-4 space-y-4">
            <DynamicActivityForm
              type={type}
              activityId={stageToEdit?.id || "new"}
              initialData={initialFormData}
              onSubmit={handleFormSubmit}
            />
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            form="stage-activity-form"
            disabled={saveMutation.isPending}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-black text-base rounded-2xl shadow-[0_4px_0_0_#15803d] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            {saveMutation.isPending
              ? isEditing
                ? "Updating..."
                : "Saving..."
              : isEditing
              ? "Update Stage Level"
              : "Save Stage Level"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}