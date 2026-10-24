'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ScenarioNode, RoutePathType } from '@/types/novel/scenario';
import { 
  Smartphone, Tablet, Monitor, ChevronRight, Maximize2, 
  Plus, MoreVertical, Trash2, Edit2, Link2, 
  Image, User, Volume2, Music, ListPlus, 
  ScrollText
} from 'lucide-react';
import { computeVisualTransitions } from '@/utils/story/transitions';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssetStore } from '@/store/story/useAssetStore';
import { useNodeStore } from '@/store/story/useNodeStore';

// Local structural typing reflecting the actual schema definitions
interface ChoiceOptionBlock {
  text: string;
  targetNodeId: string;
}

interface PreviewEditorTabProps {
  activeNode: ScenarioNode | null;  
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, fields: Partial<ScenarioNode>) => void;
}

type PlatformViewport = 'mobile' | 'tablet' | 'desktop';

export default function PreviewEditorTab({ 
  activeNode, 
  onSelectNode, 
  onUpdateNode 
}: PreviewEditorTabProps) {
  const [modalViewport, setModalViewport] = useState<PlatformViewport>('desktop');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  
  const [editingLineIdx, setEditingLineIdx] = useState<number | null>(null);
  const [editingLineText, setEditingLineText] = useState('');

  const prevNodeRef = useRef<ScenarioNode | null>(null);
  const [activePrevNode, setActivePrevNode] = useState<ScenarioNode | null>(null);

  // 1. Fetch flat assets array and filter by rowType
  const { assets = [] } = useAssetStore();
  const backgrounds = assets.filter((a) => a.rowType === 'background_image');
  const characters  = assets.filter((a) => a.rowType === 'character_figure');
  const bgm         = assets.filter((a) => a.rowType === 'background_sound');
  const sfx         = assets.filter((a) => a.rowType === 'sound_effect');

  // 2. Fetch dictionary nodes Record<string, GraphNode> from useNodeStore
  const { nodes = {} } = useNodeStore();

  // 3. Convert nodes dictionary to array and filter out activeNode
  const availableTargetNodes = Object.values(nodes).filter((n) => n.id !== activeNode?.id);

  useEffect(() => {
    if (activeNode?.id !== prevNodeRef.current?.id) {
      setActivePrevNode(prevNodeRef.current);
      setDialogueIdx(0);
      setEditingLineIdx(null);
    }
    prevNodeRef.current = activeNode;
  }, [activeNode]);

  if (!activeNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#161f38] rounded-xl bg-slate-950/20 text-slate-500 text-[11px] italic">
        Select a node element box on the canvas board layer to generate workspace parameters.
      </div>
    );
  }

  const fx = computeVisualTransitions(activePrevNode, activeNode);

  const modalViewportSizing: Record<PlatformViewport, string> = {
    mobile: 'w-[300px] h-[95%] max-h-[580px] border-x-8 border-t-[24px] border-b-[24px] border-slate-800 rounded-[2rem]',
    tablet: 'w-[500px] h-[95%] max-h-[680px] aspect-[3/4] border-12 border-slate-800 rounded-2xl',
    desktop: 'w-[95%] max-w-5xl aspect-[16/9] max-h-[90%] border-4 border-slate-800 rounded-xl'
  };

  const advanceDialogue = () => {
    if (dialogueIdx < activeNode.dialogue.length - 1) {
      setDialogueIdx(prev => prev + 1);
    }
  };

  const addDialogueLine = () => {
    const updated = [...(activeNode.dialogue || []), "New script line..."];
    onUpdateNode(activeNode.id, { dialogue: updated });
    setDialogueIdx(updated.length - 1);
  };

  const deleteDialogueLine = (indexToRemove: number) => {
    const updated = activeNode.dialogue.filter((_, idx) => idx !== indexToRemove);
    onUpdateNode(activeNode.id, { dialogue: updated.length > 0 ? updated : ["..."] });
    setDialogueIdx(0);
  };

  const saveDialogueLineUpdate = (indexToSave: number) => {
    const updated = [...activeNode.dialogue];
    updated[indexToSave] = editingLineText;
    onUpdateNode(activeNode.id, { dialogue: updated });
    setEditingLineIdx(null);
  };

  const addChoiceOption = () => {
    const freshChoice: ChoiceOptionBlock = { text: "New alternative choice...", targetNodeId: "" };
    onUpdateNode(activeNode.id, { choices: [...(activeNode.choices || []), freshChoice] as any });
  };

  const updateChoiceOption = (choiceIdx: number, fields: Partial<ChoiceOptionBlock>) => {
    const updatedChoices = activeNode.choices.map((item: any, idx) => {
      if (idx === choiceIdx) return { ...item, ...fields };
      return item;
    });
    onUpdateNode(activeNode.id, { choices: updatedChoices });
  };

  const deleteChoiceOption = (choiceIdx: number) => {
    onUpdateNode(activeNode.id, { choices: activeNode.choices.filter((_, idx) => idx !== choiceIdx) });
  };

  const renderEmulatorDisplay = (isModal: boolean) => {
    const isAtDialogueEnd = dialogueIdx === activeNode.dialogue.length - 1;
    const showChoicesOverlay = isAtDialogueEnd && activeNode.choices && activeNode.choices.length > 0;

    return (
      <div className="relative bg-black overflow-hidden flex flex-col justify-end transition-all duration-300 w-full h-full">
        <div 
          className={`absolute inset-0 bg-cover bg-center ${fx.backgroundClass}`}
          style={{ backgroundImage: activeNode.bgImage ? `url(${activeNode.bgImage})` : 'none' }}
        />
        
        {activeNode.characterImage && (
          <img 
            src={activeNode.characterImage} 
            alt="Actor Frame" 
            className={`absolute bottom-14 left-1/2 -translate-x-1/2 object-contain pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)] z-10 transition-all ${
              isModal ? 'h-64' : 'h-24'
            } ${showChoicesOverlay ? 'opacity-30 blur-[1px]' : 'opacity-100'} ${fx.characterClass}`}
          />
        )}

        {showChoicesOverlay && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-full flex flex-col gap-1.5 overflow-y-auto max-h-[70%] pr-1 scrollbar-none justify-center items-center">
              {activeNode.choices.map((choice: any, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (choice.targetNodeId) onSelectNode(choice.targetNodeId);
                  }}
                  className={`w-full max-w-md text-center bg-slate-900/90 hover:bg-indigo-600 text-slate-100 border border-slate-700 hover:border-indigo-400 rounded-md shadow-xl backdrop-blur-md transition-all ${
                    isModal ? 'py-2 px-4 text-[12px]' : 'py-1 px-2 text-[8px]'
                  }`}
                >
                  {choice.text || `Option ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div 
          onClick={advanceDialogue}
          className={`m-2 p-2 bg-slate-950/95 backdrop-blur-sm border border-slate-800/80 rounded-lg flex flex-col justify-between z-20 cursor-pointer relative ${
            isModal ? 'min-h-[70px]' : 'min-h-[44px]'
          } ${showChoicesOverlay ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <div className={`font-bold text-indigo-400 uppercase tracking-wide truncate ${isModal ? 'text-[11px]' : 'text-[8px]'}`}>
            {activeNode.title || "Speaker Character"}
          </div>
          <div className={`text-slate-200 leading-normal font-sans line-clamp-2 pr-4 ${isModal ? 'text-[12px] mt-0.5' : 'text-[9px]'}`}>
            {activeNode.dialogue[dialogueIdx] || "..."}
          </div>
          {!isAtDialogueEnd && (
            <ChevronRight className={`text-indigo-400 absolute bottom-1.5 right-1.5 animate-pulse ${isModal ? 'w-4 h-4' : 'w-2.5 h-2.5'}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 flex flex-col  select-text pb-6 text-[11px] w-full max-w-full overflow-x-hidden">
      
      {/* SECTION 1: EMULATOR HEADER & TRIGGER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-[#161f38] pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed Mobile View</span>
          
          <Dialog>
            <DialogTrigger className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded transition-all cursor-pointer active:scale-95 focus:outline-none">
              <Maximize2 className="w-2.5 h-2.5" />
              <span>Full Device Simulator</span>
            </DialogTrigger>

            <DialogContent className="w-[90vw] min-w-[90vw] max-w-6xl h-[95vh] min-h-[95vh] bg-[#090d16] border-[#161f38] text-slate-100 p-0 flex flex-col focus:outline-none overflow-hidden gap-0">
              <DialogHeader className="w-full h-16 flex flex-row items-center justify-between px-6 border-b border-[#161f38] space-y-0 shrink-0 bg-[#0c1424]">
                <div>
                  <DialogTitle className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Cross-Platform Aspect Simulator
                  </DialogTitle>
                </div>

                <div className="flex items-center gap-1 bg-[#05070f] p-1 rounded-lg border border-[#161f38] mr-6">
                  {(['mobile', 'tablet', 'desktop'] as PlatformViewport[]).map((view) => (
                    <button
                      key={view}
                      onClick={() => setModalViewport(view)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                        modalViewport === view ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {view === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
                      {view === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                      {view === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
                      <span className="capitalize">{view}</span>
                    </button>
                  ))}
                </div>
              </DialogHeader>

              <div className="flex-1 w-full bg-[#04060b] flex items-center justify-center p-0 overflow-hidden">
                <div className={`transition-all duration-300 flex shadow-2xl bg-black overflow-hidden items-center justify-center ${modalViewportSizing[modalViewport]}`}>
                  {renderEmulatorDisplay(true)}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full bg-[#05070f] border border-[#161f38] rounded-xl p-3 flex items-center justify-center min-h-[200px]">
          <div className="min-w-3/4 w-5/6 h-80.5 relative bg-black rounded overflow-hidden border border-slate-900 flex flex-col justify-end">
            {renderEmulatorDisplay(false)}
          </div>
        </div>
      </div>

      {/* SECTION 2: SCENARIO IDENTITY */}
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

      {/* SECTION 3: STORAGE ASSETS SELECTION MATRIX (CONVERTED TO DROPDOWNS) */}
      <div className="space-y-3 bg-[#05070f]/50 p-3 rounded-lg border border-[#161f38]">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block border-b border-[#161f38] pb-1.5">
          Scene Assets (From Storage Vault)
        </span>
        
        {/* Background Image Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <Image className="w-2.5 h-2.5 text-sky-400" /> Background Scene Image
          </label>
          <select
            value={activeNode.bgImage || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { bgImage: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- No Background / Transparent --</option>
            {backgrounds.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Character Sprite Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <User className="w-2.5 h-2.5 text-emerald-400" /> Character Sprite Asset
          </label>
          <select
            value={activeNode.characterImage || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { characterImage: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- No Character Sprite Loaded --</option>
            {characters.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* BGM Track Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <Music className="w-2.5 h-2.5 text-indigo-400" /> Ambient Background Audio Track
          </label>
          <select
            value={activeNode.bgMusic || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { bgMusic: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- Silence / Mute Music --</option>
            {bgm.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* SFX Action Track Dropdown */}
        <div>
          <label className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 mb-1">
            <Volume2 className="w-2.5 h-2.5 text-amber-400" /> Sound Effect (SFX) Action Trigger
          </label>
          <select
            value={activeNode.sfx || ''}
            onChange={(e) => onUpdateNode(activeNode.id, { sfx: e.target.value })}
            className="w-full bg-[#05070f] border border-[#161f38] px-2 py-2 rounded text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/80 cursor-pointer truncate"
          >
            <option value="">-- No Effect Trigger --</option>
            {sfx.map((asset) => (
              <option key={asset.fileId} value={asset.url}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 4: DIALOGUE TIMELINE BOX */}
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

      {/* SECTION 5: PLAYER CHOICES DOCK */}
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

    </div>
  );
}