'use client';
import React, { useState, useEffect } from 'react';
import { ScenarioNode } from '@/types/novel/scenario';

interface UIPreviewTabProps {
  activeNode: ScenarioNode | null;
  onSelectNode: (id: string | null) => void;
}

export default function UIPreviewTab({ activeNode, onSelectNode }: UIPreviewTabProps) {
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState(0);

  useEffect(() => {
    setCurrentDialogueIdx(0);
  }, [activeNode?.id]);

  const handleNextLine = () => {
    if (!activeNode) return;
    if (currentDialogueIdx < activeNode.dialogue.length - 1) {
      setCurrentDialogueIdx(prev => prev + 1);
    }
  };

  if (!activeNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-slate-500 text-[11px] italic">
        Select a node box on the canvas to load the live preview screen.
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Visual Canvas Simulator screen view */}
      <div 
        className="w-full aspect-[4/3] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800 flex flex-col justify-end"
        style={{
          backgroundImage: activeNode.bgImage ? `url(${activeNode.bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!activeNode.bgImage && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 italic">
            [No Background Image Selected]
          </div>
        )}

        {activeNode.characterImage && (
          <img 
            src={activeNode.characterImage} 
            alt="character frame viewport" 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 h-36 object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          />
        )}

        <div 
          onClick={handleNextLine}
          className={`m-2.5 p-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg min-h-[55px] flex flex-col justify-between z-10 transition-all ${
            activeNode.dialogue.length > 1 && currentDialogueIdx < activeNode.dialogue.length - 1 ? 'cursor-pointer hover:border-indigo-500/60' : ''
          }`}
        >
          <div className="text-[10px] font-bold text-indigo-400 tracking-wide font-mono uppercase truncate">
            {activeNode.title || "Dialogue Segment"}
          </div>
          <div className="text-[11px] text-slate-200 leading-relaxed font-sans line-clamp-2">
            {activeNode.dialogue[currentDialogueIdx] || "..."}
          </div>
          
          {activeNode.dialogue.length > 1 && (
            <div className="text-[8px] font-bold text-slate-500 text-right uppercase tracking-wider mt-0.5">
              {currentDialogueIdx < activeNode.dialogue.length - 1 ? "Click to Advance ➔" : "End of node track"}
            </div>
          )}
        </div>
      </div>

      {/* Playable Staging Buttons */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Interactive Choice Branches:</span>
        {activeNode.choices.length === 0 ? (
          <div className="text-[10px] text-slate-500 italic p-2 border border-slate-800 border-dashed rounded-lg text-center">
            Terminal Node Segment. No target paths options configured.
          </div>
        ) : (
          <div className="space-y-1">
            {activeNode.choices.map((choice, idx) => (
              <button
                key={idx}
                disabled={!choice.targetNodeId}
                onClick={() => choice.targetNodeId && onSelectNode(choice.targetNodeId)}
                className={`w-full text-left p-2 rounded-lg text-[11px] font-medium transition-all border flex items-center justify-between group ${
                  choice.targetNodeId 
                    ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-200' 
                    : 'bg-slate-950/50 border-slate-900/80 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span className="truncate flex-1 pr-2">{choice.text || `[Empty Option Step ${idx + 1}]`}</span>
                {choice.targetNodeId && (
                  <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-800/60 px-1 py-0.5 rounded text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {choice.targetNodeId}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}