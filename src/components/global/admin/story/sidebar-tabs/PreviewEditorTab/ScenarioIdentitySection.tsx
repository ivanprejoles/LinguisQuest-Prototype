'use client';
import React from 'react';
import { RoutePathType, ScenarioNode } from '@/types/novel/scenario';
import { ScrollText, ListPlus } from 'lucide-react';

interface Props {
  activeNode: ScenarioNode;
  onUpdateNode: (id: string, fields: Partial<ScenarioNode>) => void;
}
{/* SECTION 2: SCENARIO IDENTITY */}
export default function ScenarioIdentitySection({ activeNode, onUpdateNode }: Props) {
  return (
      <div className="space-y-3 pt-2 border-t border-[#161f38]">
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <ScrollText className="w-2.5 h-2.5 text-indigo-400" /> Title
          </label>
          <input 
            type="text"
            value={activeNode.title || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { title: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-slate-200 focus:outline-none focus:border-indigo-500/80"
            placeholder="e.g. Hero, Narrator, System Dialogue"
          />
        </div>

        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <ListPlus className="w-2.5 h-2.5 text-indigo-400" /> Game Level Flow Type
          </label>
          <select
            value={activeNode.type}
            onChange={(e) => onUpdateNode(activeNode.id, { type: e.target.value as RoutePathType })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
          >
            <option value="normal">Branching Screen (Displays Custom Choice Buttons)</option>
            <option value="linear_next">Standard Path (Auto-Advances to Next Connected Node)</option>
            <option value="winning_ending">🎉 Victory Screen (Player Wins & Game Completes)</option>
            <option value="deadend">💀 Game Over Screen (Player Loses / Terminal Failure)</option>
          </select>
        </div>
      </div>
  );
}
