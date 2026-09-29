'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Sparkles, ArrowLeft, Smartphone, Monitor } from 'lucide-react';
import { computeVisualTransitions } from '@/utils/story/transitions';

interface Choice {
  text: string;
  targetNodeId: string;
}

interface GraphNode {
  id: string;
  nodeId: string;
  title: string;
  type: string;
  bgImage: string;
  characterImage: string;
  bgMusic: string;
  sfx: string;
  dialogue: string[];
  choices: Choice[];
}

type PlatformViewport = 'mobile' | 'tablet' | 'desktop';

export default function StoryPlayerPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const router = useRouter();

  const [nodes, setNodes] = useState<Record<string, GraphNode>>({});
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Platform Detection State
  const [deviceClass, setDeviceClass] = useState<PlatformViewport>('desktop');
  const [viewport, setViewport] = useState<PlatformViewport>('desktop');

  const prevNodeRef = useRef<GraphNode | null>(null);
  const [prevNode, setPrevNode] = useState<GraphNode | null>(null);

  // 1. Detect platform hardware on client mount
  useEffect(() => {
    const ua = navigator.userAgent;
    let detected: PlatformViewport = 'desktop';

    if (/Mobi|Android|iPhone/i.test(ua) && !/iPad|Tablet/i.test(ua)) {
      detected = 'mobile';
    } else if (/iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
      detected = 'tablet';
    } else if (window.innerWidth < 640) {
      detected = 'mobile';
    } else if (window.innerWidth < 1024) {
      detected = 'tablet';
    }

    setDeviceClass(detected);
    setViewport(detected);
  }, []);

  // 2. Load Session and Graph Nodes
  useEffect(() => {
    let isMounted = true;
    async function fetchStory() {
      try {
        const res = await fetch(`/api/client/stories/${sessionId}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          const nodeMap: Record<string, GraphNode> = {};

          data.graphNodes.forEach((node: GraphNode) => {
            nodeMap[node.nodeId] = node;
          });

          setNodes(nodeMap);
          const startNode = data.graphNodes.find((n: GraphNode) => n.type === 'starting') || data.graphNodes[0];
          if (startNode) setActiveNodeId(startNode.nodeId);
        }
      } catch (err) {
        console.error('Error fetching story session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (sessionId) fetchStory();
    return () => { isMounted = false; };
  }, [sessionId]);

  const activeNode = activeNodeId ? nodes[activeNodeId] : null;

  useEffect(() => {
    if (activeNode?.nodeId !== prevNodeRef.current?.nodeId) {
      setPrevNode(prevNodeRef.current);
      setDialogueIdx(0);
    }
    prevNodeRef.current = activeNode;
  }, [activeNode]);

  if (loading) {
    return (
      <div className="w-screen h-dvh bg-slate-950 flex flex-col items-center justify-center text-amber-300 gap-3 select-none">
        <Sparkles className="w-8 h-8 animate-spin" />
        <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase">Opening Story Portal...</span>
      </div>
    );
  }

  if (!activeNode) {
    return (
      <div className="w-screen h-dvh bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4 select-none">
        <p className="text-xs sm:text-base">No nodes available in this story sequence.</p>
        <button onClick={() => router.push('/stories')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer text-xs sm:text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>
    );
  }

  const fx = computeVisualTransitions(prevNode as any, activeNode as any);
  const isAtDialogueEnd = dialogueIdx === (activeNode.dialogue?.length || 1) - 1;
  const showChoices = isAtDialogueEnd && activeNode.choices && activeNode.choices.length > 0;

  const advanceDialogue = () => {
    if (dialogueIdx < activeNode.dialogue.length - 1) {
      setDialogueIdx((prev) => prev + 1);
    } else if (activeNode.type === 'linear_next' && activeNode.choices[0]?.targetNodeId) {
      setActiveNodeId(activeNode.choices[0].targetNodeId);
    }
  };

  const viewportStyles: Record<PlatformViewport, string> = {
    mobile: 'w-full max-w-[390px] h-full sm:h-auto sm:max-h-[calc(100vh-5rem)] aspect-[9/16] sm:border-8 border-slate-800 rounded-none sm:rounded-[2.5rem] shadow-2xl',
    tablet: 'w-full max-w-[768px] h-full sm:h-auto sm:max-h-[calc(100vh-5rem)] aspect-[3/4] sm:border-8 border-slate-800 rounded-none sm:rounded-3xl shadow-2xl',
    desktop: 'w-full h-full rounded-none'
  };

  return (
    <div className="w-screen h-dvh bg-slate-950 flex flex-col overflow-hidden relative select-none">
      {/* Header Controls */}
      <header className="h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-50 shrink-0">
        <button
          onClick={() => router.push('/stories')}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vault
        </button>

        {/* Viewport Switcher - Only shown on Desktop */}
        {deviceClass === 'desktop' && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['desktop', 'mobile'] as PlatformViewport[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewport(mode)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${
                  viewport === mode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
                {mode === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
                <span className="capitalize">{mode}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Canvas Container */}
      <main className="flex-1 bg-black flex items-center justify-center relative overflow-hidden p-0 sm:p-2">
        <div className={`relative bg-black overflow-hidden flex flex-col items-center justify-end transition-all duration-300 ${viewportStyles[viewport]}`}>
          
          {/* Brightened & Sharp Background Layer (Anchored to Bottom-Center) */}
          <div className="absolute inset-0 overflow-hidden bg-slate-950">
            {activeNode.bgImage ? (
              <div
                className={`absolute inset-0 bg-cover bg-bottom bg-no-repeat transition-all duration-700 ease-out transform-gpu ${fx.backgroundClass}`}
                style={{
                  backgroundImage: `url(${activeNode.bgImage})`,
                  imageRendering: 'crisp-edges',
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
            )}

            {/* Subtle Gradient Overlay for Text Legibility without Darkening the View */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10 pointer-events-none" />
          </div>

          {/* Character Figure (Occupies 88% screen height, leaves top space, sits at bottom) */}
          {activeNode.characterImage && (
            <img
              key={activeNode.characterImage}
              src={activeNode.characterImage}
              alt="Character Frame"
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[88dvh] max-w-none object-contain object-bottom pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)] z-10 ${
                showChoices ? 'opacity-30 blur-[2px]' : 'opacity-100'
              } ${fx.characterClass}`}
            />
          )}

          {/* Choice Options Overlay */}
          <div
            className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 sm:p-6 gap-3 transition-all duration-300 ${
              showChoices ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
            }`}
          >
            <div className="w-full max-w-md flex flex-col gap-2.5">
              {activeNode.choices?.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (choice.targetNodeId) setActiveNodeId(choice.targetNodeId);
                  }}
                  className="w-full py-3 sm:py-3.5 px-4 sm:px-5 text-center bg-gradient-to-r from-slate-900/95 to-indigo-950/95 hover:from-indigo-600 hover:to-amber-600 text-slate-100 border border-amber-500/30 hover:border-amber-300 rounded-xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold tracking-wide transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  {choice.text || `Option ${i + 1}`}
                </button>
              ))}
            </div>
          </div>

          {/* End Screens */}
          {activeNode.type === 'winning_ending' && (
            <div className="absolute inset-0 bg-indigo-950/90 z-40 flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 animate-bounce mb-2" />
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 uppercase tracking-widest">Victory Achieved</h2>
              <button onClick={() => router.push('/stories')} className="mt-4 px-5 py-2 bg-amber-500 text-black font-bold rounded-lg cursor-pointer text-xs sm:text-sm">
                Return to Catalog
              </button>
            </div>
          )}

          {activeNode.type === 'deadend' && (
            <div className="absolute inset-0 bg-rose-950/90 z-40 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-rose-300 uppercase tracking-widest">Journey Ended</h2>
              <button onClick={() => router.push('/stories')} className="mt-4 px-5 py-2 bg-rose-600 text-white font-bold rounded-lg cursor-pointer text-xs sm:text-sm">
                Return to Catalog
              </button>
            </div>
          )}

          {/* Dialogue Box (Covers bottom 1/3 of character, max-w-3xl on Desktop) */}
          <div
            onClick={advanceDialogue}
            className={`w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] ${
              viewport === 'desktop' ? 'max-w-3xl' : 'max-w-none'
            } min-h-[130px] sm:min-h-[190px] mb-3 sm:mb-6 p-3.5 sm:p-6 bg-slate-950/95 border border-amber-500/40 rounded-2xl flex flex-col justify-between z-20 cursor-pointer relative shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-200 ${
              showChoices ? 'opacity-30 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="font-bold text-amber-300 text-[11px] sm:text-sm uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-amber-500/20 pb-1.5">
              <span>{activeNode.title || 'Narrator'}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                {dialogueIdx + 1} / {activeNode.dialogue?.length || 1}
              </span>
            </div>
            
            <p className="text-slate-100 text-xs sm:text-base leading-relaxed font-sans pr-5 flex-1 my-0.5 sm:my-1">
              {activeNode.dialogue?.[dialogueIdx] || '...'}
            </p>
            
            {!isAtDialogueEnd && (
              <ChevronRight className="text-amber-400 absolute bottom-3 right-3 sm:bottom-4 sm:right-4 animate-pulse w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}