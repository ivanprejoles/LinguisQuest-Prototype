// src/app/page.tsx
'use client';
import { useGraphState } from '@/hooks/useGraphState';
import FlowGrid from '@/components/global/Canvas/flow-grid';
import LivePreview from '@/components/global/Preview/live-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileJson } from 'lucide-react';

export default function WorkspacePage() {
  const { nodes, selectedNodeId, setSelectedNodeId, activeNode, createNode, updateNode, removeNode } = useGraphState();

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nodes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "linguisquest_story_tree.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 overflow-hidden">
      
      {/* LEFT CANVAS WORKSPACE: Takes up all space that the sidebar leaves open */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shrink-0 shadow-md">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">Linguis Quest Navigable Flow Grid</h1>
            <p className="text-[11px] text-slate-400">Scroll Wheel to Zoom. Drag Background to Pan. Drag Cards to Connect.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createNode(150, 150)} variant="default" size="sm" className="h-8 text-xs gap-1 bg-indigo-600 hover:bg-indigo-500">
              <PlusCircle className="w-3.5 h-3.5" /> Spawn Scenario Box
            </Button>
            <Button onClick={handleExportJson} variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-800 hover:bg-slate-900">
              <FileJson className="w-3.5 h-3.5" /> Export JSON
            </Button>
          </div>
        </header>

        {/* Dynamic Infinite Pan Grid View Canvas Mount point */}
        <div className="flex-1 relative w-full h-full overflow-hidden bg-slate-950">
          <FlowGrid 
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNode={updateNode}
            onRemoveNode={removeNode}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR CONTROL DOCK */}
      <div className="w-[380px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-10">
        <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
          <TabsList className="grid grid-cols-4 bg-slate-950 p-1 m-3 rounded-lg shrink-0">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
            <TabsTrigger value="storage" className="text-xs">Storage</TabsTrigger>
            <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <TabsContent value="preview" className="m-0 mt-2">
              <LivePreview 
                activeNode={activeNode} 
                nodes={nodes} 
                onSelectNode={setSelectedNodeId} 
              />
            </TabsContent>

            <TabsContent value="editor" className="m-0 mt-2 space-y-4">
              {activeNode !== null ? (
                <div className="space-y-4 text-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Editing Node: <span className="font-mono text-indigo-400">{activeNode.id}</span>
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-slate-400 block font-medium">Title Heading</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      value={activeNode.title ?? ""} 
                      onChange={(e) => updateNode(activeNode.id, { title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 block font-medium">Path Routing Mode</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      value={activeNode.type ?? "normal"}
                      onChange={(e) => updateNode(activeNode.id, { type: e.target.value as any })}
                    >
                      <option value="normal">Normal Branching Tree</option>
                      <option value="linear_next">➡️ Linear Route Forward</option>
                      <option value="winning_ending">🏆 Success Ending Match</option>
                      <option value="deadend">💀 Deadend Termination</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  <p>No scenario segment selected.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Click a card on the grid canvas view to update options.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="storage" className="m-0 mt-2">
              <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                IndexedDB Shelf Storage asset loaders render here.
              </div>
            </TabsContent>

            <TabsContent value="json" className="m-0 mt-2">
              <pre className="text-[10px] font-mono bg-slate-950 p-3 rounded border border-slate-800 text-emerald-400 overflow-x-auto max-h-[500px]">
                {JSON.stringify(nodes, null, 2)}
              </pre>
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </div>
  );
}