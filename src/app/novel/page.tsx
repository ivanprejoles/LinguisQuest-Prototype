"use client"

import { Button } from '@/components/ui/button';
import { useGraphState } from '@/hooks/useGraphState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileJson, PlusCircle } from 'lucide';
import React from 'react'
import LivePreview from '@/components/global/Preview/live-preview';

type Props = {}

const NovelPage = (props: Props) => {
    const { nodes, selectedNodeId, setSelectedNodeId, createNode, updateNode } = useGraphState();
    const activeNode = selectedNodeId ? nodes[selectedNodeId] : null;

    return (
        <>
        
        <div className="flex-1 relative flex flex-col">
            <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold tracking-tight">Linguis Quest Navigable Flow Grid</h1>
                    <p className="text-xs text-slate-400">Node graph orchestration engine matrix platform workspace.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => createNode(200, 200)} variant="default" size="sm" className="gap-1">
                        {/* <PlusCircle className="w-4 h-4" /> Spawn Scenario Box */}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                        {/* <FileJson className="w-4 h-4" /> Export JSON */}
                    </Button>
                </div>
            </header>

            <div className="flex-1 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#f8fafc_1px,transparent_1px)] [background-size:16px_16px]" />
                <p className="p-4 text-xs text-muted-foreground">
                    [Canvas view displaying {Object.keys(nodes).length} boxes loaded]
                </p>
            
                {/* Node Render mapping block placeholder */}
                <div className="p-4 flex flex-wrap gap-4">
                    {Object.keys(nodes).map(id => (
                        <div 
                            key={id}
                            onClick={() => setSelectedNodeId(id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedNodeId === id ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900 border-slate-800'
                            }`}
                        >
                            <span className="text-[10px] text-slate-500 font-mono block">{id}</span>
                            <span className="text-sm font-semibold">{nodes[id].title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      {/* RIGHT SIDEBAR: Control Management Dock Panels */}
      <div className="w-[380px] bg-slate-900 border-l border-slate-800 flex flex-col">
        <Tabs defaultValue="preview" className="w-full flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 bg-slate-950 p-1 m-2 rounded-lg">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
            <TabsTrigger value="storage" className="text-xs">Storage</TabsTrigger>
            <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="preview" className="m-0">
              <LivePreview 
                activeNode={activeNode} 
                nodes={nodes} 
                onSelectNode={setSelectedNodeId} 
              />
            </TabsContent>

            <TabsContent value="editor" className="m-0 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400">Scenario Box Inspector</h3>
              {activeNode !== null  ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Title Heading</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded"
                      value={activeNode.title}
                      onChange={(e) => updateNode(activeNode.id, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Path Target Routing Mode</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded"
                      value={activeNode.type}
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
                <p className="text-muted-foreground text-center pt-8">No node selected.</p>
              )}
            </TabsContent>

            <TabsContent value="storage" className="m-0">
              <p className="text-xs text-muted-foreground">IndexedDB Media asset carousels load here.</p>
            </TabsContent>

            <TabsContent value="json" className="m-0 h-full">
              <pre className="text-[10px] font-mono bg-slate-950 p-3 rounded border border-slate-800 text-emerald-400 overflow-x-auto max-h-[500px]">
                {JSON.stringify(nodes, null, 2)}
              </pre>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      </>
    )
}

export default NovelPage