
'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FlowCanvas } from '@/components/global/admin/story/FlowCanvas';
import EditorSidebar from '@/components/global/admin/story/EditorSidebar';
import { Plus, ArrowLeft } from 'lucide-react';
import { GraphNode, useNodeStore } from '@/store/story/useNodeStore';
import { useAssetStore } from '@/store/story/useAssetStore';
import { useViewportStore } from '@/store/story/useViewportStore';

export default function StoryEditorPage() {
  const params = useParams<{
    adminId: string;
    languageId: string;
    workspaceId: string;
  }>();

  const router = useRouter();
  const { adminId, languageId, workspaceId } = params;

  const addNodeLocally = useNodeStore((s) => s.addNodeLocally);
  const fetchNodes = useNodeStore((s) => s.fetchNodes);
  const saveNodesToCloud = useNodeStore((s) => s.saveNodesToCloud);
  const fetchAssets = useAssetStore((s) => s.fetchAssets);

  const [activeTab, setActiveTab] = React.useState<
    'preview_editor' | 'storage' | 'json'
  >('preview_editor');

  const [workspaceTitle, setWorkspaceTitle] = React.useState('');

  const dashboardPath =
    `/admin-portal/${adminId}/${languageId}/story`;

  // Load the selected workspace metadata.
  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const response = await fetch(
          `/api/admin/novel/workspace/${workspaceId}`
        );

        if (!response.ok) {
          throw new Error('Workspace not found');
        }

        const workspace = await response.json();

        if (!cancelled) {
          // Guard against a workspace belonging to another language.
          if (workspace.languageId !== languageId) {
            router.replace(dashboardPath);
            return;
          }

          setWorkspaceTitle(workspace.title);
        }
      } catch {
        if (!cancelled) {
          router.replace(dashboardPath);
        }
      }
    }

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, languageId, dashboardPath, router]);

  // Load nodes and assets for the selected workspace.
  useEffect(() => {
    if (!workspaceId) return;

    fetchNodes(workspaceId);
    fetchAssets(workspaceId);
  }, [workspaceId, fetchNodes, fetchAssets]);

  // Autosave the currently selected workspace.
  useEffect(() => {
    if (!workspaceId) return;

    const saveLoop = setInterval(() => {
      void saveNodesToCloud(workspaceId);
    }, 30000);

    const handleBeforeUnload = () => {
      const {
        nodes,
        deletedNodeIds,
        hasUnsavedChanges,
      } = useNodeStore.getState();

      if (!hasUnsavedChanges) return;

      const dirtyNodesList: GraphNode[] = [];

      Object.values(nodes).forEach((node) => {
        if (node.isDirty) {
          const { isDirty: _, ...cleanNode } = node;
          dirtyNodesList.push(cleanNode as GraphNode);
        }
      });

      const payload = JSON.stringify({
        sessionId: workspaceId,
        upsertNodes: dirtyNodesList,
        deleteNodeIds: deletedNodeIds,
      });

      const blob = new Blob([payload], {
        type: 'application/json',
      });

      navigator.sendBeacon(
        '/api/admin/novel/nodes/sync',
        blob
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveLoop);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [workspaceId, saveNodesToCloud]);

  const handleSpawnNode = () => {
    const { pan, zoom } = useViewportStore.getState();

    const uniqueId = `node_${Date.now()}`;

    const screenCenterX =
      (typeof window !== 'undefined' ? window.innerWidth : 1000) / 2;

    const screenCenterY =
      (typeof window !== 'undefined' ? window.innerHeight : 600) / 2;

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
    <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="relative flex flex-1 min-h-0 min-w-0 w-full overflow-hidden bg-[#0b1329] font-sans text-slate-100">

        {/* Canvas Area */}
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">

          {/* Editor toolbar */}
          <div className="absolute left-4 top-4 z-20 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl border border-slate-700/80 bg-[#1e293b]/95 p-1.5 shadow-xl backdrop-blur-md">
            <button
              onClick={() => router.push(dashboardPath)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft size={16} />
              Workspaces
            </button>

            <div className="max-w-48 truncate border-l border-slate-700 pl-3 text-xs font-semibold">
              {workspaceTitle || 'Loading workspace...'}
            </div>

            <button
              onClick={handleSpawnNode}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
            >
              <Plus size={16} />
              Spawn Scenario Box
            </button>
          </div>

          <FlowCanvas />
        </div>

        {/* Editor Sidebar */}
        <EditorSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sessionId={workspaceId}
        />

      </div>
    </div>
  );

}
