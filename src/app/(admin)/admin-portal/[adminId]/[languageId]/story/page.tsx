'use client';

import React, { useEffect } from 'react';
import { FlowCanvas } from '@/components/global/admin/story/FlowCanvas';
import EditorSidebar from '@/components/global/admin/story/EditorSidebar';
import { Plus } from 'lucide-react';
import { GraphNode, useNodeStore } from '@/store/story/useNodeStore';
import { useAssetStore } from '@/store/story/useAssetStore';
import { useViewportStore } from '@/store/story/useViewportStore';

const DEFAULT_SESSION_ID = "64bdf3219f1a2c3d4e5f6a7b";

export default function Home() {
  const addNodeLocally = useNodeStore((s) => s.addNodeLocally);
  const fetchNodes = useNodeStore((s) => s.fetchNodes);
  const saveNodesToCloud = useNodeStore((s) => s.saveNodesToCloud);
  const fetchAssets = useAssetStore((s) => s.fetchAssets);

  const [activeTab, setActiveTab] = React.useState<'preview_editor' | 'storage' | 'json'>('preview_editor');

  useEffect(() => {
    fetchNodes(DEFAULT_SESSION_ID);
    fetchAssets(DEFAULT_SESSION_ID);
  }, [fetchNodes, fetchAssets]);

  useEffect(() => {
    const saveLoop = setInterval(() => {
      saveNodesToCloud(DEFAULT_SESSION_ID);
    }, 30000);

    const handleBeforeUnload = () => {
      const { nodes, deletedNodeIds, hasUnsavedChanges } = useNodeStore.getState();

      if (!hasUnsavedChanges) return;

      const dirtyNodesList: GraphNode[] = [];
      Object.values(nodes).forEach((node) => {
        if (node.isDirty) {
          const { isDirty: _, ...cleanNode } = node;
          dirtyNodesList.push(cleanNode as GraphNode);
        }
      });

      const payload = JSON.stringify({
        sessionId: DEFAULT_SESSION_ID,
        upsertNodes: dirtyNodesList,
        deleteNodeIds: deletedNodeIds,
      });

      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/admin/novel/nodes/sync', blob);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveLoop);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveNodesToCloud]);

  const handleSpawnNode = () => {
    const { pan, zoom } = useViewportStore.getState();
    
    const uniqueId = `node_${Date.now()}`;
    const screenCenterX = (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2;
    const screenCenterY = (typeof window !== 'undefined' ? window.innerHeight : 600) / 2;

    const newNode: GraphNode = {
      id: uniqueId,
      title: 'Spawning Scene Node',
      type: 'normal',
      bgImage: '',
      characterImage: '',
      bgMusic: '',
      sfx: '',
      dialogue: ['New interaction script page...'],
      x: Math.round((screenCenterX - pan.x) / zoom),
      y: Math.round((screenCenterY - pan.y) / zoom),
      choices: [],
    };

    addNodeLocally(newNode);
  };

  return (
    <div className="w-full flex-1 flex min-h-0 bg-[#0b1329] text-slate-100 overflow-hidden font-sans relative">
      {/* Canvas Area */}
      <div className="flex-1 h-full relative">
        
        {/* Floating Toolbar Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#1e293b]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl">
          <button
            onClick={handleSpawnNode}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Spawn Scenario Box</span>
          </button>
        </div>

        <FlowCanvas />
      </div>

      {/* Editor Sidebar */}
      <EditorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionId={DEFAULT_SESSION_ID}
      />
    </div>
  );
}