// src/components/preview/LivePreview.tsx
'use client';
import { useState, useEffect } from 'react';
import { ScenarioNode, GraphState } from '@/types/scenario';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LivePreviewProps {
  activeNode: ScenarioNode | null; // Can be null initially
  nodes: GraphState;
  onSelectNode: (id: string) => void;
}

export default function LivePreview({ activeNode, nodes, onSelectNode }: LivePreviewProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // 1. Reset state safely when the active node changes
  useEffect(() => {
    setLineIdx(0);
    setShowOptions(false);
  }, [activeNode?.id]); // Safe optional chaining

  // 2. Type-safe text ticker engine
  useEffect(() => {
    // Crucial Guard: If null, do nothing
    if (!activeNode || !activeNode.dialogue[lineIdx]) return;
    
    setDisplayedText('');
    setShowOptions(false);
    const currentStr = activeNode.dialogue[lineIdx];
    let charIdx = 0;
    
    const ticker = setInterval(() => {
      if (charIdx < currentStr.length) {
        setDisplayedText(prev => prev + currentStr.charAt(charIdx));
        charIdx++;
      } else {
        clearInterval(ticker);
        if (lineIdx === activeNode.dialogue.length - 1) {
          setShowOptions(true);
        }
      }
    }, 15);

    return () => clearInterval(ticker);
  }, [activeNode, lineIdx]);

  // 🔥 THE CRITICAL TS GUARD: If null, render placeholder and exit early.
  // Everything below this line is now guaranteed to have a valid ScenarioNode!
  if (!activeNode) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-slate-800 rounded-xl">
        Select a scenario box from the flow grid to preview the scene.
      </div>
    );
  }

  const handleBoxClick = () => {
    // TS now knows activeNode is not null here
    const fullText = activeNode.dialogue[lineIdx];
    if (displayedText.length < fullText.length) {
      setDisplayedText(fullText);
      if (lineIdx === activeNode.dialogue.length - 1) setShowOptions(true);
      return;
    }

    if (lineIdx < activeNode.dialogue.length - 1) {
      setLineIdx(prev => prev + 1);
    } else if (activeNode.type === 'linear_next' && activeNode.choices[0]?.targetNodeId) {
      onSelectNode(activeNode.choices[0].targetNodeId);
    }
  };

  return (
    <Card className="relative w-full aspect-[9/16] max-w-[320px] mx-auto bg-slate-950 overflow-hidden border-4 border-slate-800 rounded-3xl shadow-2xl">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ 
          backgroundImage: activeNode.bgImage ? `url(${activeNode.bgImage})` : 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)' 
        }}
      />

      {activeNode.characterImage && (
        <img 
          src={activeNode.characterImage} 
          alt="Character" 
          className="absolute bottom-32 left-1/2 -translate-x-1/2 w-40 h-40 object-contain"
        />
      )}

      <div 
        onClick={handleBoxClick}
        className="absolute bottom-4 inset-x-4 h-28 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer z-20"
      >
        <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
          <span>{activeNode.title}</span>
          <span className="text-slate-500">Click to advance</span>
        </div>
        <p className="text-xs text-slate-100 font-mono mt-1">{displayedText}</p>
      </div>

      {showOptions && activeNode.type !== 'linear_next' && activeNode.choices.length > 0 && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-center items-center gap-2 p-4 z-30">
          {activeNode.choices.map((choice, i) => (
            <Button
              key={i}
              variant="secondary"
              className="w-full text-xs"
              onClick={() => choice.targetNodeId && onSelectNode(choice.targetNodeId)}
            >
              {choice.text}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}