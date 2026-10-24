'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ScenarioNode } from '@/types/novel/scenario';
import EmulatorSection from './PreviewEditorTab/EmulatorSection';
import ScenarioIdentitySection from './PreviewEditorTab/ScenarioIdentitySection';
import SceneAssetsSection from './PreviewEditorTab/SceneAssetsSection';
import DialogueTimelineSection from './PreviewEditorTab/DialogueTimelineSection';
import ChoiceOptionsSection from './PreviewEditorTab/ChoiceOptionsSection';
import { computeVisualTransitions } from '@/utils/story/transitions';

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
  
  const [previewEntryCount, setPreviewEntryCount] = useState(0);
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

  // useEffect(() => {
  //   if (activeNode?.id !== prevNodeRef.current?.id) {
  //     setActivePrevNode(prevNodeRef.current);
  //     setDialogueIdx(0);
  //     setEditingLineIdx(null);
  //   }
  //   prevNodeRef.current = activeNode;
  // }, [activeNode]);
  useEffect(() => {
    if (activeNode?.id !== prevNodeRef.current?.id) {
      setActivePrevNode(prevNodeRef.current);
      setDialogueIdx(0);
      setEditingLineIdx(null);
      setPreviewEntryCount((count) => count + 1);
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



  return (
    <div className="space-y-5 flex flex-col  select-text pb-6 text-[11px] w-full max-w-full overflow-x-hidden">
      
      {/* <EmulatorSection 
        activeNode={activeNode} 
        fx={fx} 
        dialogueIdx={dialogueIdx} 
        onSelectNode={onSelectNode} 
        advanceDialogue={advanceDialogue} 
        modalViewport={modalViewport} 
        setModalViewport={setModalViewport} 
        modalViewportSizing={modalViewportSizing} 
      /> */}
      <EmulatorSection
        activeNode={activeNode}
        fx={fx}
        dialogueIdx={dialogueIdx}
        onSelectNode={onSelectNode}
        advanceDialogue={advanceDialogue}
        modalViewport={modalViewport}
        setModalViewport={setModalViewport}
        modalViewportSizing={modalViewportSizing}
        sceneEntryKey={`admin-preview:${activeNode.id}:${previewEntryCount}`}
      />

      <ScenarioIdentitySection 
        activeNode={activeNode} 
        onUpdateNode={onUpdateNode} 
      />

      <SceneAssetsSection 
        activeNode={activeNode} 
        onUpdateNode={onUpdateNode} 
        backgrounds={backgrounds} 
        characters={characters} 
        bgm={bgm} 
        sfx={sfx} 
      />

      <DialogueTimelineSection 
        activeNode={activeNode} 
        dialogueIdx={dialogueIdx} 
        setDialogueIdx={setDialogueIdx} 
        editingLineIdx={editingLineIdx} 
        setEditingLineIdx={setEditingLineIdx} 
        editingLineText={editingLineText} 
        setEditingLineText={setEditingLineText} 
        addDialogueLine={addDialogueLine} 
        saveDialogueLineUpdate={saveDialogueLineUpdate} 
        deleteDialogueLine={deleteDialogueLine} 
      />

      <ChoiceOptionsSection 
        activeNode={activeNode} 
        availableTargetNodes={availableTargetNodes} 
        addChoiceOption={addChoiceOption} 
        updateChoiceOption={updateChoiceOption} 
        deleteChoiceOption={deleteChoiceOption} 
      />

    </div>
  );
}