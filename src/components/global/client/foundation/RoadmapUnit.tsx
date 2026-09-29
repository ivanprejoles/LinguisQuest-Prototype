"use client";

import React from "react";
import { Roadmap, Stage } from "@prisma/client";
import { StageNode } from "./StageNode";
import { BookOpen, Sparkles } from "lucide-react";

interface RoadmapUnitProps {
  roadmap: Roadmap;
  unitNumber: number;
  stages: Stage[];
  completedStageIds: string[];
  onStartStage: (stage: Stage) => void;
}

export function RoadmapUnit({
  roadmap,
  unitNumber,
  stages,
  completedStageIds,
  onStartStage,
}: RoadmapUnitProps) {
  return (
    <section className="w-full max-w-md mx-auto mb-12">
      {/* Unit Banner Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-5 text-white shadow-[0_6px_0_0_#059669] border-2 border-emerald-400 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-emerald-200 block mb-0.5">
              Unit {unitNumber}
            </span>
            <h2 className="text-xl font-black">{roadmap.title}</h2>
            {roadmap.description && (
              <p className="text-xs font-semibold text-emerald-100 mt-1">
                {roadmap.description}
              </p>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Stage Path Nodes */}
      <div className="flex flex-col items-center py-2 relative">
        {stages.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-bold text-sm bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl w-full">
            No stages configured for this unit yet.
          </div>
        ) : (
          stages.map((stage, idx) => {
            const isCompleted = completedStageIds.includes(stage.id);
            // First stage or previous stage is completed unlocks the node
            const isUnlocked =
              idx === 0 || completedStageIds.includes(stages[idx - 1]?.id);

            return (
              <StageNode
                key={stage.id}
                stage={stage}
                index={idx}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                onStartStage={onStartStage}
              />
            );
          })
        )}
      </div>
    </section>
  );
}