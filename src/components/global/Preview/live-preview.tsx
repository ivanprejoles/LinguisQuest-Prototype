// src/components/preview/LivePreview.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { ScenarioNode, GraphState } from '@/types/scenario';
import { ChevronDown, Expand } from 'lucide-react';

interface LivePreviewProps {
  activeNode: ScenarioNode | null;
  nodes: GraphState;
  onSelectNode: (id: string | null) => void;
  onOpenModal: () => void;
}

export default function LivePreview({ activeNode, nodes, onSelectNode, onOpenModal }: LivePreviewProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLineIdx(0);
    setDisplayedText('');
    setShowOptions(false);
  }, [activeNode?.id]);

  useEffect(() => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    if (!activeNode || !activeNode.dialogue[lineIdx]) return;

    setDisplayedText('');
    setShowOptions(false);

    const fullStr = activeNode.dialogue[lineIdx];
    let charIdx = 0;

    typewriterRef.current = setInterval(() => {
      if (charIdx < fullStr.length) {
        setDisplayedText((prev) => prev + fullStr.charAt(charIdx));
        charIdx++;
      } else {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        if (lineIdx === activeNode.dialogue.length - 1) {
          setShowOptions(true);
        }
      }
    }, 15);

    return () => { if (typewriterRef.current) clearInterval(typewriterRef.current); };
  }, [activeNode, lineIdx]);

  if (!activeNode) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-slate-500 border border-dashed border-slate-700 h-64 rounded-xl">
        <span>Click any scenario event box inside the grid system to display its live view simulator here.</span>
      </div>
    );
  }

  const handleAdvanceClick = () => {
    const fullText = activeNode.dialogue[lineIdx] ?? '';

    if (displayedText.length < fullText.length) {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      setDisplayedText(fullText);
      if (lineIdx === activeNode.dialogue.length - 1) setShowOptions(true);
      return;
    }

    if (lineIdx < activeNode.dialogue.length - 1) {
      setLineIdx((prev) => prev + 1);
    } else if (activeNode.type === 'linear_next' && activeNode.choices[0]?.targetNodeId) {
      onSelectNode(activeNode.choices[0].targetNodeId);
    }
  };

  const currentBg = activeNode.bgImage?.trim() || 'FALLBACK';

  return (
    <div className="w-full bg-[#1e293b] rounded-xl p-3 border border-slate-700">
      <div className="flex justify-between items-center text-xs text-slate-200 mb-2 font-semibold">
        <span className="flex items-center gap-1">🎮 Scenario Simulation</span>
        <button onClick={onOpenModal} className="text-slate-400 hover:text-white p-1 transition-colors">
          <Expand className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative w-full aspect-[9/16] max-w-[260px] mx-auto bg-slate-950 overflow-hidden border-4 border-slate-800 rounded-2xl shadow-2xl">
        {/* Render Background Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 animate-fade-in"
          style={{
            backgroundImage: currentBg === 'FALLBACK'
              ? 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)'
              : `url(${currentBg})`
          }}
        />

        {/* Character Figure Graphic */}
        {activeNode.characterImage?.trim() && (
          <img
            src={activeNode.characterImage}
            alt="NPC Sprite"
            className="absolute bottom-28 left-1/2 -translate-x-1/2 w-32 h-32 object-contain drop-shadow-2xl transition-all duration-200"
          />
        )}

        {/* Floating Choice Backdrops Overlay */}
        {showOptions && activeNode.type !== 'linear_next' && activeNode.choices.length > 0 && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-center items-center gap-2 p-3 z-30">
            {activeNode.choices.map((choice, i) => {
              const isValid = choice.targetNodeId && nodes[choice.targetNodeId];
              return (
                <button
                  key={i}
                  disabled={!isValid}
                  className="w-full text-[10px] text-left p-2 rounded border border-slate-700 bg-[#1e293b] text-slate-100 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  onClick={() => isValid && onSelectNode(choice.targetNodeId)}
                >
                  {choice.text || 'Path Choice Route...'}
                </button>
              );
            })}
          </div>
        )}

        {/* Text Story Dialogue Layout Block */}
        <div
          onClick={handleAdvanceClick}
          className="absolute bottom-3 inset-x-3 h-24 bg-[#0b1329]/95 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between cursor-pointer z-20 hover:border-slate-700 transition-colors shadow-xl"
        >
          <div className="flex justify-between items-center text-[8px] text-indigo-400 font-bold uppercase">
            <span>{activeNode.title || 'Scene Step'}</span>
            {displayedText.length === (activeNode.dialogue[lineIdx] ?? '').length && lineIdx < activeNode.dialogue.length - 1 ? (
              <span className="text-slate-400 flex items-center gap-0.5 animate-bounce">
                Next <ChevronDown className="w-2 h-2" />
              </span>
            ) : (
              <span className="text-slate-500 font-normal">Click to skip</span>
            )}
          </div>
          <p className="text-[10px] text-slate-200 font-mono mt-0.5 leading-snug h-14 overflow-y-auto antialiased">
            {displayedText}
          </p>
        </div>
      </div>
    </div>
  );
}