'use client';
import React from 'react';
import { AssetRecord } from '@/types/novel/canvas';
import { MonitorPlay, Database, Code } from 'lucide-react';
import { useNodeStore } from '@/store/story/useNodeStore';

import PreviewEditorTab from './sidebar-tabs/PreviewEditorTab';
import StorageTab from './sidebar-tabs/StorageTab';
import JsonTab from './sidebar-tabs/JsonTab';

interface EditorSidebarProps {
  activeTab: 'preview_editor' | 'storage' | 'json';
  setActiveTab: (tab: 'preview_editor' | 'storage' | 'json') => void;
  sessionId: string
  // dbAssets: AssetRecord[];
  // onAssetChange: () => void;
}

export default function EditorSidebar({
  activeTab,
  setActiveTab,
  sessionId,
  // dbAssets,
  // onAssetChange
}: EditorSidebarProps) {
  // Pull core state management hooks directly from Zustand global storage
  const nodes = useNodeStore((state) => state.nodes);
  const selectedNodeId = useNodeStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useNodeStore((state) => state.setSelectedNodeId);
  const updateNode = useNodeStore((state) => state.updateNodeLocally);

  // Compute active node object layout context safely
  const activeNode = selectedNodeId ? nodes[selectedNodeId] || null : null;

  return (
    <div className="w-80 h-full bg-[#090d16] border-r border-[#161f38] flex flex-col shrink-0 select-none z-40">
      
      {/* Refactored 3-Tab Header Row Matrix */}
      <div className="h-12 border-b border-[#161f38] flex bg-[#0d1321] text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <button
          onClick={() => setActiveTab('preview_editor')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'preview_editor' 
              ? 'border-indigo-500 text-indigo-400 bg-[#090d16]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111726]/30'
          }`}
        >
          <MonitorPlay className="w-3.5 h-3.5" /> Studio Editor
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'storage' 
              ? 'border-indigo-500 text-emerald-400 bg-[#090d16]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111726]/30'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Storage
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'json' 
              ? 'border-indigo-500 text-amber-400 bg-[#090d16]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111726]/30'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> JSON Output
        </button>
      </div>

      {/* Main Form Display Body Layout */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 pr-2 bg-[#090d16] select-text [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#05070f] [&::-webkit-scrollbar-thumb]:bg-[#2a3754] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500">
        {activeTab === 'preview_editor' && (
          <PreviewEditorTab 
            activeNode={activeNode} 
            onSelectNode={setSelectedNodeId} 
            onUpdateNode={updateNode} 
          />
        )}
        {activeTab === 'storage' && (
          <StorageTab sessionId={sessionId} />
        )}
        {activeTab === 'json' && (
          <JsonTab nodes={nodes} />
        )}
      </div>
    </div>
  );
}