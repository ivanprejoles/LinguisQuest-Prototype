 'use client';

import React from 'react';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';
import { ScenarioNode, StoryScene } from '@/types/novel/scenario';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StoryScenePlayer from '@/components/global/story/scene/StoryScenePlayer';

type PlatformViewport = 'mobile' | 'tablet' | 'desktop';

interface Props {
  activeNode: ScenarioNode;
  fx: {
    backgroundClass: string;
    characterClass: string;
  };
  dialogueIdx: number;
  onSelectNode: (id: string | null) => void;
  advanceDialogue: () => void;
  modalViewport: PlatformViewport;
  setModalViewport: (view: PlatformViewport) => void;
  modalViewportSizing: Record<PlatformViewport, string>;
  sceneEntryKey: string;
}

export default function EmulatorSection({
  activeNode,
  fx,
  dialogueIdx,
  onSelectNode,
  advanceDialogue,
  modalViewport,
  setModalViewport,
  modalViewportSizing,
  sceneEntryKey,
}: Props) {
  // Adapt the editor node to the shared scene-player type.
  const previewScene: StoryScene = {
    nodeId: activeNode.id,
    title: activeNode.title,
    type: activeNode.type,
    bgImage: activeNode.bgImage,
    characterImage: activeNode.characterImage,
    bgMusic: activeNode.bgMusic,
    sfx: activeNode.sfx,
    dialogue: activeNode.dialogue,
    choices: activeNode.choices,
  };

  const renderPlayer = (isModal: boolean) => (
    <StoryScenePlayer
      scene={previewScene}
      sceneEntryKey={sceneEntryKey}
      fx={fx}
      dialogueIdx={dialogueIdx}
      isModal={isModal}
      viewport={isModal ? modalViewport : 'mobile'}
      audioEnabled={isModal}
      onSelectNode={(id) => onSelectNode(id)}
      advanceDialogue={advanceDialogue}
    />
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-[#161f38] pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Fixed Mobile View
        </span>

        <Dialog>
          <DialogTrigger className="flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-600/20 px-2 py-0.5 text-[9px] font-medium text-indigo-400 transition-all hover:bg-indigo-600 hover:text-white active:scale-95 focus:outline-none">
            <Maximize2 className="h-2.5 w-2.5" />
            <span>Full Device Simulator</span>
          </DialogTrigger>

          <DialogContent className="flex h-[95vh] min-h-[95vh] w-[90vw] min-w-[90vw] max-w-6xl flex-col gap-0 overflow-hidden border-[#161f38] bg-[#090d16] p-0 text-slate-100 focus:outline-none">
            <DialogHeader className="flex h-16 w-full shrink-0 flex-row items-center justify-between space-y-0 border-b border-[#161f38] bg-[#0c1424] px-6">
              <DialogTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Cross-Platform Aspect Simulator
              </DialogTitle>

              <div className="mr-6 flex items-center gap-1 rounded-lg border border-[#161f38] bg-[#05070f] p-1">
                {(['mobile', 'tablet', 'desktop'] as PlatformViewport[]).map(
                  (view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setModalViewport(view)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        modalViewport === view
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {view === 'mobile' && (
                        <Smartphone className="h-3.5 w-3.5" />
                      )}
                      {view === 'tablet' && (
                        <Tablet className="h-3.5 w-3.5" />
                      )}
                      {view === 'desktop' && (
                        <Monitor className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{view}</span>
                    </button>
                  ),
                )}
              </div>
            </DialogHeader>

            <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#04060b] p-0">
              <div
                className={`flex items-center justify-center overflow-hidden bg-black shadow-2xl transition-all duration-300 ${modalViewportSizing[modalViewport]}`}
              >
                {renderPlayer(true)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex min-h-[200px] w-full items-center justify-center rounded-xl border border-[#161f38] bg-[#05070f] p-3">
        <div className="relative flex h-80 w-5/6 min-w-3/4 flex-col justify-end overflow-hidden rounded border border-slate-900 bg-black">
          {renderPlayer(false)}
        </div>
      </div>
    </div>
  );
}