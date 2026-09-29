"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Trash2,
  HelpCircle,
  ArrowRightLeft,
  AlignLeft,
  Layers,
  Pencil,
  Volume2,
  Ear,
  PenTool,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Stage } from "@/types/foundation/stage";

export interface StagesStackProps {
  stages: Stage[];
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onEdit: (stage: Stage) => void;
  onDragStart: (idx: number) => void;
  onDrop: (idx: number) => void;
}

export function StagesStack({
  stages,
  onDelete,
  onEdit,
  onDragStart,
  onDrop,
}: StagesStackProps) {
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "multipleChoice":
        return {
          label: "Multiple Choice",
          icon: HelpCircle,
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
      case "matching":
        return {
          label: "Matching Pairs",
          icon: ArrowRightLeft,
          color: "bg-purple-100 text-purple-700 border-purple-200",
        };
      case "sentenceBuilder":
        return {
          label: "Sentence Builder",
          icon: AlignLeft,
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "tapWhatYouHear":
        return {
          label: "Audio Dictation",
          icon: Volume2,
          color: "bg-amber-100 text-amber-700 border-amber-200",
        };
      case "fillInTheBlank":
        return {
          label: "Missing Word",
          icon: Ear,
          color: "bg-orange-100 text-orange-700 border-orange-200",
        };
      case "tracing":
        return {
          label: "Letter Tracing",
          icon: PenTool,
          color: "bg-indigo-100 text-indigo-700 border-indigo-200",
        };
      default:
        return {
          label: type,
          icon: Layers,
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingStageId) {
      onDelete(deletingStageId, e);
      setDeletingStageId(null);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-3">
        {stages.map((stg: Stage, index: number) => {
          const badge = getTypeBadge(stg.type);
          const Icon = badge.icon;
          const payload = stg.payload as Record<string, any> | undefined;
          const hasAudio = payload?.audioUrl || (stg as any).audioUrl;

          const displayText =
            stg.title ||
            payload?.question ||
            payload?.fullSentence ||
            payload?.targetSentence ||
            (payload?.targetLetter ? `Trace letter "${payload.targetLetter}"` : null) ||
            "Untitled Stage";

          return (
            <div
              key={stg.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              className="group relative bg-white border-2 border-slate-200 hover:border-green-500 rounded-2xl p-4 shadow-[0_4px_0_0_#e2e8f0] transition-all duration-150 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
            >
              {/* Left Content */}
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical className="w-5 h-5 text-slate-300 opacity-50 group-hover:opacity-100 shrink-0" />
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
                  {index + 1}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    {hasAudio && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                        🎙️ Audio
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-slate-800 text-sm leading-none truncate">
                    {displayText}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                  onClick={() => onEdit(stg)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  onClick={() => setDeletingStageId(stg.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={Boolean(deletingStageId)}
        onOpenChange={(open) => !open && setDeletingStageId(null)}
      >
        <AlertDialogContent className="rounded-3xl border-2 border-slate-100 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">
              Delete Stage Level?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-semibold text-slate-500">
              Are you sure you want to delete this stage? Associated audio and
              media files will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-2xl border-2 border-slate-200 font-bold cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-2xl bg-red-500 hover:bg-red-600 font-black text-white shadow-[0_4px_0_0_#b91c1c] cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}