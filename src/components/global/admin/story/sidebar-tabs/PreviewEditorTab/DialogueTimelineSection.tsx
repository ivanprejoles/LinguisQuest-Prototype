'use client';
import React from 'react';
import { Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScenarioNode } from '@/types/novel/scenario';

interface Props {
  activeNode: ScenarioNode;
  dialogueIdx: number;
  setDialogueIdx: (idx: number) => void;
  editingLineIdx: number | null;
  setEditingLineIdx: (idx: number | null) => void;
  editingLineText: string;
  setEditingLineText: (text: string) => void;
  addDialogueLine: () => void;
  saveDialogueLineUpdate: (idx: number) => void;
  deleteDialogueLine: (idx: number) => void;
}
{/* SECTION 4: DIALOGUE TIMELINE BOX */}
export default function DialogueTimelineSection({ activeNode, dialogueIdx, setDialogueIdx, editingLineIdx, setEditingLineIdx, editingLineText, setEditingLineText, addDialogueLine, saveDialogueLineUpdate, deleteDialogueLine }: Props) {
  return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-[#161f38] pb-1">
          <label className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Script Lines Timeline Box</label>
          <button 
            onClick={addDialogueLine}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded text-[9px] font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Line
          </button>
        </div>

        <div className="max-h-[170px] overflow-y-auto pr-1 space-y-1 bg-[#05070f]/30 rounded-lg p-1 border border-[#161f38] scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2a3754]">
          {activeNode.dialogue.map((line, idx) => (
            <div 
              key={idx} 
              className={`group relative flex items-center justify-between p-1.5 rounded transition-colors border ${
                dialogueIdx === idx ? 'bg-indigo-950/30 border-indigo-900/40 text-slate-100' : 'bg-[#0a0f1b] border-transparent text-slate-400 hover:bg-[#111726]/40'
              }`}
            >
              {editingLineIdx === idx ? (
                <div className="flex-1 flex gap-1 items-center w-full">
                  <input 
                    type="text"
                    value={editingLineText}
                    onChange={(e) => setEditingLineText(e.target.value)}
                    className="flex-1 bg-black border border-indigo-500 text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => saveDialogueLineUpdate(idx)}
                    className="px-1.5 py-0.5 bg-indigo-600 text-white rounded font-bold text-[9px] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <span 
                    onClick={() => setDialogueIdx(idx)}
                    className="truncate flex-1 font-sans text-[10px] cursor-pointer pr-6"
                  >
                    <strong className="text-slate-500 mr-1.5 font-mono">#{idx+1}</strong>{line}
                  </span>

                  <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer focus:outline-none">
                        <MoreVertical className="w-3 h-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-24 bg-slate-950 border-[#161f38] text-[10px] text-slate-300">
                        <DropdownMenuItem 
                          onClick={() => { setEditingLineIdx(idx); setEditingLineText(line); }}
                          className="focus:bg-slate-900 focus:text-white cursor-pointer py-1 gap-1"
                        >
                          <Edit2 className="w-2.5 h-2.5 text-sky-400" /> Edit Text
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteDialogueLine(idx)}
                          className="focus:bg-rose-950 focus:text-rose-200 cursor-pointer py-1 text-rose-400 gap-1 border-t border-slate-900"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
  );
}
