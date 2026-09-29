'use client';

import React, { memo, useEffect } from 'react';
import {
  Handle,
  Position,
  NodeProps,
  Node,
  useUpdateNodeInternals,
  useNodeId,
} from '@xyflow/react';
import { GraphNode, useNodeStore } from '@/store/story/useNodeStore';
import { useAssetStore } from '@/store/story/useAssetStore';
import { Trash2, X, ArrowRight } from 'lucide-react';

export type ScenarioNodeData = GraphNode & {
  onSelectNode?: (id: string | null) => void;
  onUpdateNode?: (id: string, fields: Partial<GraphNode>) => void;
  onRemoveNode?: (id: string) => void;
  [key: string]: unknown;
};

export type AppScenarioNode = Node<ScenarioNodeData, 'scenarioNode'>;

export type ScenarioNodeBoxProps = Omit<NodeProps, 'data'> & {
  data: ScenarioNodeData;
};

export const ScenarioNodeBox = memo(function ScenarioNodeBox({
  id: propId,
  data,
  selected,
}: ScenarioNodeBoxProps) {
  const reactFlowId = useNodeId();
  const id = reactFlowId || propId;
  const updateNodeInternals = useUpdateNodeInternals();

  // Store bindings
  const allNodes = useNodeStore((state) => state.nodes);
  const updateNodeLocally = useNodeStore((state) => state.updateNodeLocally);
  const deleteNodeLocally = useNodeStore((state) => state.deleteNodeLocally);
  const setSelectedNodeId = useNodeStore((state) => state.setSelectedNodeId);

  // Asset bindings
  const assets = useAssetStore((state) => state.assets || []);

  const onSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (data.onSelectNode) data.onSelectNode(nodeId);
  };

  const onUpdate = (nodeId: string, fields: Partial<GraphNode>) => {
    updateNodeLocally(nodeId, fields);
    if (data.onUpdateNode) data.onUpdateNode(nodeId, fields);
  };

  const onRemove = (nodeId: string) => {
    deleteNodeLocally(nodeId);
    if (data.onRemoveNode) data.onRemoveNode(nodeId);
  };

  const hasExistingStartNode = Object.values(allNodes).some(
    (n) => n.id !== id && n.type === 'starting'
  );

  // Field fallbacks
  const title = data.title || '';
  const dialogue = data.dialogue || [];
  const choices = data.choices || [];
  const bgImage = data.bgImage || '';
  const characterImage = data.characterImage || '';
  const bgMusic = data.bgMusic || '';
  const sfx = data.sfx || '';
  const currentType = data.type || 'normal';

  const availableTargetNodes = Object.values(allNodes).filter((n) => n.id !== id);

  // Asset type filters
  const assetBackgrounds = assets.filter((a) =>
    ['background_image', 'background', 'bg'].includes(a.rowType?.toLowerCase())
  );
  const assetCharacters = assets.filter((a) =>
    ['character_figure', 'character', 'figure'].includes(a.rowType?.toLowerCase())
  );
  const assetMusic = assets.filter((a) =>
    ['background_sound', 'music', 'sound'].includes(a.rowType?.toLowerCase())
  );
  const assetEffects = assets.filter((a) =>
    ['sound_effect', 'sfx', 'effect'].includes(a.rowType?.toLowerCase())
  );

  const typeConfig: Record<string, { border: string; bg: string; badge: string; text: string }> = {
    starting: { border: 'border-amber-500/60 shadow-amber-950/20', bg: 'bg-amber-950/20', badge: '🚀 Start Node', text: 'text-amber-400' },
    normal: { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', badge: '💬 Normal Branch', text: 'text-indigo-400' },
    linear_next: { border: 'border-sky-500/50', bg: 'bg-sky-500/10', badge: '➡️ Linear Continue', text: 'text-sky-400' },
    winning_ending: { border: 'border-emerald-500/60 shadow-emerald-950/20', bg: 'bg-emerald-950/20', badge: '🏆 Success', text: 'text-emerald-400' },
    deadend: { border: 'border-rose-600/60 shadow-rose-950/20', bg: 'bg-rose-950/30', badge: '💀 Deadend', text: 'text-rose-400' },
  };

  const activeStyle = typeConfig[currentType] || typeConfig.normal;
  const isLinear = currentType === 'linear_next';
  const isTerminal = currentType === 'winning_ending' || currentType === 'deadend';

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, choices.length, dialogue.length, currentType, isLinear, updateNodeInternals]);

  return (
    <div
      onClick={() => onSelect(id)}
      className={`scenario-node-box w-72 bg-[#131c31]/95 border-2 rounded-xl shadow-2xl flex flex-col relative transition-all ${activeStyle.border} ${
        selected ? 'border-indigo-500 shadow-indigo-500/40 ring-1 ring-indigo-500 z-30' : 'z-20'
      }`}
      data-node-id={id}
    >
      {/* Incoming Connection Target Handle */}
      {currentType !== 'starting' && (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          isConnectable={true}
          className="!w-4 !h-4 !bg-indigo-500 !border-2 !border-[#0c1020] hover:!bg-emerald-400 transition-all !cursor-crosshair z-50"
          style={{ top: -9 }}
        />
      )}

      {/* Header */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 rounded-t-xl cursor-move flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-mono font-bold text-slate-500 block mb-0.5">{id}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate(id, { title: e.target.value })}
            className="bg-transparent font-bold text-xs text-slate-100 focus:outline-none w-40 truncate nodrag nopan"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="p-1 hover:bg-rose-950 rounded text-slate-500 hover:text-rose-400 nodrag nopan"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node Type Selector */}
      <div className={`px-3 py-2 border-b border-slate-800/60 flex items-center gap-2 text-[10px] ${activeStyle.bg}`}>
        <span className={`font-bold uppercase tracking-wider ${activeStyle.text}`}>{activeStyle.badge}:</span>
        <select
          value={currentType}
          onChange={(e) => {
            const selectedType = e.target.value as GraphNode['type'];
            let updatedChoices = [...choices];

            if (selectedType === 'linear_next') {
              updatedChoices = choices.slice(0, 1);
              if (updatedChoices.length === 0) {
                updatedChoices = [{ text: 'Continue', targetNodeId: '' }];
              }
            } else if (selectedType === 'winning_ending' || selectedType === 'deadend') {
              updatedChoices = [];
            }

            onUpdate(id, { type: selectedType, choices: updatedChoices });
          }}
          className="flex-1 bg-slate-950 text-slate-200 font-medium p-1 border border-slate-800/80 rounded focus:outline-none focus:border-indigo-500 text-[10px] nodrag nopan cursor-pointer"
        >
          <option value="starting" disabled={hasExistingStartNode && currentType !== 'starting'}>
            🚀 Start Node {hasExistingStartNode && currentType !== 'starting' ? '(Already Set)' : ''}
          </option>
          <option value="normal">💬 Normal Branch</option>
          <option value="linear_next">➡️ Linear Continue</option>
          <option value="winning_ending">🏆 Success End</option>
          <option value="deadend">💀 Deadend End</option>
        </select>
      </div>

      {/* Asset Selection Controls */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-900/20 space-y-2 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-16 font-bold text-slate-400 flex items-center gap-1">🏞️ Image:</span>
          <select
            value={bgImage}
            onChange={(e) => onUpdate(id, { bgImage: e.target.value })}
            className="flex-1 bg-slate-950 text-slate-200 p-1 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 truncate nodrag nopan cursor-pointer"
          >
            <option value="">-- No Background --</option>
            {assetBackgrounds.map((a) => (
              <option key={a.fileId} value={a.url || a.fileId}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-16 font-bold text-slate-400 flex items-center gap-1">🎭 Character:</span>
          <select
            value={characterImage}
            onChange={(e) => onUpdate(id, { characterImage: e.target.value })}
            className="flex-1 bg-slate-950 text-slate-200 p-1 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 truncate nodrag nopan cursor-pointer"
          >
            <option value="">-- No Character --</option>
            {assetCharacters.map((a) => (
              <option key={a.fileId} value={a.url || a.fileId}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-16 font-bold text-slate-400 flex items-center gap-1">🎵 Ambient:</span>
          <select
            value={bgMusic}
            onChange={(e) => onUpdate(id, { bgMusic: e.target.value })}
            className="flex-1 bg-slate-950 text-slate-200 p-1 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 truncate nodrag nopan cursor-pointer"
          >
            <option value="">-- No Music Track --</option>
            {assetMusic.map((a) => (
              <option key={a.fileId} value={a.url || a.fileId}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-16 font-bold text-slate-400 flex items-center gap-1">💥 Effect:</span>
          <select
            value={sfx}
            onChange={(e) => onUpdate(id, { sfx: e.target.value })}
            className="flex-1 bg-slate-950 text-slate-200 p-1 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 truncate nodrag nopan cursor-pointer"
          >
            <option value="">-- No Sound FX --</option>
            {assetEffects.map((a) => (
              <option key={a.fileId} value={a.url || a.fileId}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dialogue Editor */}
      <div className="p-3 flex flex-col gap-1.5">
        <label className="text-[9px] font-bold uppercase text-slate-400 flex justify-between items-center">
          <span>Dialogue Lines ({dialogue.length})</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(id, { dialogue: [...dialogue, ''] });
            }}
            className="text-indigo-400 font-bold text-[10px] nodrag nopan"
          >
            + Add
          </button>
        </label>
        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 thin-scrollbar nodrag nopan">
          {dialogue.map((line, idx) => (
            <div key={`dialogue-${idx}`} className="flex gap-1 items-start group/line">
              <textarea
                value={line}
                rows={1}
                onChange={(e) => {
                  const arr = [...dialogue];
                  arr[idx] = e.target.value;
                  onUpdate(id, { dialogue: arr });
                }}
                className="w-full bg-slate-950 border border-slate-800 p-1 rounded text-[11px] text-slate-300 resize-none focus:outline-none focus:border-indigo-500 nodrag nopan"
              />
              {dialogue.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(id, { dialogue: dialogue.filter((_, i) => i !== idx) });
                  }}
                  className="p-0.5 text-slate-600 hover:text-rose-400 opacity-100 transition-opacity nodrag nopan"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision Paths & Source Handles */}
      {!isTerminal ? (
        <div className="mt-auto p-3 bg-slate-900/30 border-t border-slate-800/60 rounded-b-xl flex flex-col gap-2 relative">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase text-slate-400">
              {isLinear ? 'Next Sequence Step' : 'Decision Paths'}
            </span>
            {!isLinear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(id, { choices: [...choices, { text: 'Next Path Step', targetNodeId: '' }] });
                }}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded nodrag nopan"
              >
                + Path
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {choices.map((choice, idx) => (
              <div key={`choice-${idx}`} className="bg-slate-950/80 border border-slate-800 p-1.5 rounded-lg flex flex-col gap-1 relative">
                {!isLinear && (
                  <div className="flex gap-1 items-center">
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => {
                        const updatedChoices = choices.map((c, i) =>
                          i === idx ? { ...c, text: e.target.value } : c
                        );
                        onUpdate(id, { choices: updatedChoices });
                      }}
                      placeholder="Choice text..."
                      className="flex-1 bg-transparent text-[11px] text-slate-200 focus:outline-none border-b border-transparent focus:border-indigo-500 py-0.5 nodrag nopan"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(id, { choices: choices.filter((_, i) => i !== idx) });
                      }}
                      className="text-slate-500 hover:text-rose-400 ml-1 nodrag nopan"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex gap-1.5 items-center justify-between pr-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <ArrowRight className="w-3 h-3 text-indigo-400" /> Target Node:
                  </div>

                  {/* Manual Dropdown Target Switch */}
                  <select
                    value={choice.targetNodeId || ''}
                    onChange={(e) => {
                      const updatedChoices = choices.map((c, i) =>
                        i === idx ? { ...c, targetNodeId: e.target.value } : c
                      );
                      onUpdate(id, { choices: updatedChoices });
                    }}
                    className="w-28 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded text-center font-mono text-[10px] py-0.5 text-amber-400 focus:outline-none truncate cursor-pointer nodrag nopan"
                  >
                    <option value="" className="text-slate-500 bg-slate-950">
                      -- Unconnected --
                    </option>
                    {availableTargetNodes.map((target) => (
                      <option
                        key={target.id}
                        value={target.id}
                        className="text-slate-200 bg-slate-950"
                      >
                        {target.title ? `${target.title} (${target.id})` : target.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right Choice Handle for Branching */}
                {!isLinear && (
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`choice-${idx}`}
                    isConnectable={true}
                    className="!w-4 !h-4 !bg-indigo-400 hover:!bg-indigo-300 !border-2 !border-[#131c31] !cursor-crosshair z-50"
                    style={{ right: -8 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Bottom Single Handle for Linear Nodes */}
          {isLinear && choices[0] && (
            <Handle
              type="source"
              position={Position.Bottom}
              id="choice-0"
              isConnectable={true}
              className="!w-4 !h-4 !bg-sky-400 hover:!bg-sky-300 !border-2 !border-[#131c31] !cursor-crosshair z-50"
              style={{ bottom: -8 }}
            />
          )}
        </div>
      ) : (
        <div
          className={`mt-auto p-2 border-t text-center text-[10px] font-bold uppercase tracking-wider rounded-b-xl ${
            currentType === 'deadend'
              ? 'bg-rose-950/40 border-rose-900/60 text-rose-400'
              : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'
          }`}
        >
          {currentType === 'deadend' ? '🛑 Deadend Terminal Node' : '🎉 Success Terminal Node'}
        </div>
      )}
    </div>
  );
});