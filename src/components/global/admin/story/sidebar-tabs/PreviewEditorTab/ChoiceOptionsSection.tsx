'use client';
import React from 'react';
import { Trash2, Plus, Link2 } from 'lucide-react';
import { ScenarioNode } from '@/types/novel/scenario';

interface ChoiceOptionBlock { text: string; targetNodeId: string; }
interface TargetNode { id: string; title?: string | null; }
interface Props {
  activeNode: ScenarioNode;
  availableTargetNodes: TargetNode[];
  addChoiceOption: () => void;
  updateChoiceOption: (idx: number, fields: Partial<ChoiceOptionBlock>) => void;
  deleteChoiceOption: (idx: number) => void;
}
{/* SECTION 5: PLAYER CHOICES DOCK */}
export default function ChoiceOptionsSection({ activeNode, availableTargetNodes, addChoiceOption, updateChoiceOption, deleteChoiceOption }: Props) {
  return (
      <div className="space-y-1.5 pt-1 w-full max-w-full">
        <div className="flex items-center justify-between border-b border-[#161f38] pb-1">
          <label className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Player Choice Vectors & Node Links</label>
          <button 
            onClick={addChoiceOption}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded text-[9px] font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Choice
          </button>
        </div>

        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 bg-[#05070f]/30 rounded-lg p-1.5 border border-[#161f38] w-full max-w-full overflow-x-hidden scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2a3754]">
          {activeNode.choices && activeNode.choices.length > 0 ? (
            activeNode.choices.map((choice: any, i: number) => (
              <div 
                key={i} 
                className="group relative flex flex-col gap-1.5 bg-[#0a0f1b] border border-[#161f38] rounded-md p-2 hover:border-[#1e2d54] transition-all w-full max-w-full overflow-hidden"
              >
                <div className="flex items-center gap-1 w-full justify-between">
                  <input 
                    type="text"
                    value={choice.text}
                    onChange={(e) => updateChoiceOption(i, { text: e.target.value })}
                    className="flex-1 bg-black border border-[#161f38] focus:border-indigo-500 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none min-w-0"
                    placeholder={`Choice Option Button Text #${i+1}`}
                  />
                  
                  <button 
                    onClick={() => deleteChoiceOption(i)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded cursor-pointer transition-all shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* FIXED: Added strict width constraints and truncation to prevent horizontal page scrolling */}
                <div className="flex items-center gap-1 w-full bg-black/40 px-1.5 py-1 rounded border border-[#161f38]/60 min-w-0">
                  <Link2 className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wide shrink-0">Routes To:</span>
                  <select
                    value={choice.targetNodeId || ''}
                    onChange={(e) => updateChoiceOption(i, { targetNodeId: e.target.value })}
                    className="flex-1 bg-transparent text-slate-300 focus:outline-none cursor-pointer text-[10px] min-w-0 max-w-[160px] truncate"
                  >
                    <option value="" className="bg-[#090d16] text-rose-400 font-medium">-- Disconnected Route --</option>
                    {availableTargetNodes.map((node) => (
                      <option key={node.id} value={node.id} className="bg-[#090d16] text-slate-200 truncate">
                        {node.title ? `"${node.title}" (${node.id})` : `Node (${node.id})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-3 text-slate-600 text-[10px] italic">
              No choices added. Make sure Game Flow type is set to "Branching Screen" to display player options.
            </div>
          )}
        </div>
      </div>
  );
}
