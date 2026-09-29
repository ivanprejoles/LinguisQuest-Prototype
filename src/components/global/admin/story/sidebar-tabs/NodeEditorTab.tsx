'use client';
import React from 'react';
import { ScenarioNode, RoutePathType } from '@/types/novel/scenario';

interface NodeEditorTabProps {
  activeNode: ScenarioNode | null;
  onUpdateNode: (id: string, fields: Partial<ScenarioNode>) => void;
}

export default function NodeEditorTab({ activeNode, onUpdateNode }: NodeEditorTabProps) {
  if (!activeNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-slate-500 text-[11px] italic">
        Select a node box on the canvas to access structural fields properties.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[11px]">
      <div className="flex flex-col gap-1">
        <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Node Title Name</label>
        <input 
          type="text"
          value={activeNode.title}
          onChange={(e) => onUpdateNode(activeNode.id, { title: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 p-2 rounded focus:outline-none focus:border-indigo-500 text-slate-200"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Route Mechanics Mode</label>
        <select
          value={activeNode.type}
          onChange={(e) => onUpdateNode(activeNode.id, { type: e.target.value as RoutePathType })}
          className="w-full bg-slate-950 border border-slate-800 p-2 rounded focus:outline-none focus:border-indigo-500 text-slate-200"
        >
          <option value="normal">Branching Multi-Choice</option>
          <option value="linear_next">Linear Sequence Step</option>
          <option value="winning_ending">Victory Condition Fin</option>
          <option value="deadend">Terminal Failure End</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 bg-slate-950/40 p-2 border border-slate-900 rounded-lg">
        <span className="text-slate-500 font-mono text-[9px] font-bold">Node Unique Graph Hash ID:</span>
        <span className="text-amber-400 font-mono text-[10px] font-bold">{activeNode.id}</span>
      </div>
    </div>
  );
}