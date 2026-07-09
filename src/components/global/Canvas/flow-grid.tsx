// src/components/canvas/FlowGrid.tsx
'use client';
import React, { useState, useRef } from 'react';
import { GraphState, ScenarioNode, RoutePathType } from '@/types/scenario';
import { Trash2, PlusCircle, X } from 'lucide-react';

interface FlowGridProps {
  nodes: GraphState;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, fields: Partial<ScenarioNode>) => void;
  onRemoveNode: (id: string) => void;
}

interface DragWireState {
  sourceNodeId: string;
  choiceIndex: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const CANVAS_VIRTUAL_BOUNDS = 4000;
const NODE_WIDTH = 260;

export default function FlowGrid({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onRemoveNode,
}: FlowGridProps) {
  const [pan, setPan] = useState({ x: 120, y: 150 });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [activeWire, setActiveWire] = useState<DragWireState | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragAnchorRef = useRef({ x: 0, y: 0 });

  const getRouteTypeColor = (type: RoutePathType) => {
    switch (type) {
      case 'winning_ending': return '#10b981';
      case 'deadend': return '#f43f5e';
      case 'linear_next': return '#0284c7';
      default: return '#475569';
    }
  };

  // 📐 Calculates coordinates directly at the BOTTOM CENTER of each option item slot
  const getOutboundPinCoords = (node: ScenarioNode, index: number) => {
    const startTopOffset = 152; // Header down to choices layout start height
    const rowHeight = 32;       // Exact computed row block height

    if (node.type === 'linear_next') {
      return {
        x: node.x + NODE_WIDTH / 2,
        y: node.y + 135
      };
    }

    return {
      x: node.x + NODE_WIDTH / 2,
      y: node.y + startTopOffset + (index * rowHeight) + rowHeight
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.08;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    let nextZoom = e.deltaY < 0 ? zoom * scaleFactor : zoom / scaleFactor;
    nextZoom = Math.max(0.15, Math.min(2.0, nextZoom));

    setPan({
      x: mouseX - worldX * nextZoom,
      y: mouseY - worldY * nextZoom,
    });
    setZoom(nextZoom);
  };

  const handlePinMouseDown = (e: React.MouseEvent, sourceNode: ScenarioNode, choiceIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    const pinCoords = getOutboundPinCoords(sourceNode, choiceIndex);
    setActiveWire({
      sourceNodeId: sourceNode.id,
      choiceIndex,
      startX: pinCoords.x,
      startY: pinCoords.y,
      currentX: pinCoords.x,
      currentY: pinCoords.y,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.native-form-input') || (e.target as HTMLElement).closest('.pin-connector-dot')) return;

    const nodeCard = (e.target as HTMLElement).closest('.scenario-node-box');
    const nodeId = nodeCard?.getAttribute('data-node-id');

    if (nodeId) {
      setDraggingNodeId(nodeId);
      onSelectNode(nodeId);
      dragAnchorRef.current = { x: e.clientX - nodes[nodeId].x * zoom, y: e.clientY - nodes[nodeId].y * zoom };
    } else {
      setIsPanning(true);
      dragAnchorRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const viewRect = viewportRef.current?.getBoundingClientRect();
    if (!viewRect) return;

    if (activeWire) {
      setActiveWire((prev) =>
        prev ? { ...prev, currentX: (e.clientX - viewRect.left - pan.x) / zoom, currentY: (e.clientY - viewRect.top - pan.y) / zoom } : null
      );
      return;
    }

    if (isPanning) {
      setPan({ x: e.clientX - dragAnchorRef.current.x, y: e.clientY - dragAnchorRef.current.y });
    } else if (draggingNodeId && nodes[draggingNodeId]) {
      const nextX = (e.clientX - dragAnchorRef.current.x) / zoom;
      const nextY = (e.clientY - dragAnchorRef.current.y) / zoom;
      onUpdateNode(draggingNodeId, { x: Math.round(nextX), y: Math.round(nextY) });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (activeWire) {
      const targetPin = (e.target as HTMLElement).closest('.pin-input-receptor');
      const targetNodeId = targetPin?.getAttribute('data-node-target');

      if (targetNodeId && targetNodeId !== activeWire.sourceNodeId) {
        const sourceNode = nodes[activeWire.sourceNodeId];
        if (sourceNode) {
          const updatedChoices = [...sourceNode.choices];
          if (!updatedChoices[activeWire.choiceIndex]) {
            updatedChoices[activeWire.choiceIndex] = { text: '', targetNodeId: '' };
          }
          updatedChoices[activeWire.choiceIndex].targetNodeId = targetNodeId;
          onUpdateNode(activeWire.sourceNodeId, { choices: updatedChoices });
        }
      }
      setActiveWire(null);
    }
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  return (
    <div
      ref={viewportRef}
      className="w-full h-full relative overflow-hidden bg-[#0c1020] cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Background Micro Grid Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Global Sandbox Layer Viewport */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* LAYER 1: Background Vector Paths (Lines go underneath other boxes unless actively connected) */}
        <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full z-10">
          {Object.values(nodes).map((sourceNode: any) =>
            sourceNode.choices?.map((choice: any, choiceIdx: number) => {
              const targetNode = nodes[choice.targetNodeId];
              if (!targetNode) return null;

              const pinStart = getOutboundPinCoords(sourceNode, choiceIdx);
              const endX = targetNode.x + NODE_WIDTH / 2;
              const endY = targetNode.y;
              const deltaY = Math.abs(endY - pinStart.y) * 0.5;

              return (
                <path
                  key={`${sourceNode.id}-path-${choiceIdx}`}
                  d={`M ${pinStart.x} ${pinStart.y} C ${pinStart.x} ${pinStart.y + deltaY}, ${endX} ${endY - deltaY}, ${endX} ${endY}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              );
            })
          )}
        </svg>

        {/* LAYER 2: Dynamic Scenario Card Component Layer */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {Object.values(nodes).map((node: any) => {
            const isSelected = selectedNodeId === node.id;
            const isLinear = node.type === 'linear_next';
            const currentBorderColor = getRouteTypeColor(node.type);

            return (
              <div
                key={node.id}
                data-node-id={node.id}
                className="scenario-node-box absolute pointer-events-auto w-[260px] bg-[#1a233d] rounded-xl p-3 flex flex-col gap-2! !overflow-visible"
                style={{
                  left: node.x,
                  top: node.y,
                  border: `2px solid ${isSelected ? '#3b82f6' : currentBorderColor}`,
                  boxShadow: isSelected ? '0 0 14px rgba(59, 130, 246, 0.45)' : 'none',
                  zIndex: isSelected ? 40 : 20,
                }}
              >
                {/* Top Input Receptor Target Pin */}
                <div
                  data-node-target={node.id}
                  className="pin-input-receptor absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#0c1020] border-2 border-slate-500 rounded-full cursor-crosshair hover:bg-blue-500 transition-colors z-50"
                />

                {/* Operations Menu Header controls */}
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{node.id}</span>
                    <select
                      className="native-form-input bg-[#0c1020] text-[10px] border border-slate-700 px-1 py-0.5 rounded text-slate-200 font-medium focus:outline-none"
                      value={node.type}
                      onChange={(e) => onUpdateNode(node.id, { type: e.target.value as RoutePathType })}
                    >
                      <option value="normal">Normal Branch</option>
                      <option value="linear_next">➡️ Linear Route</option>
                      <option value="winning_ending">🏆 Winner End</option>
                      <option value="deadend">💀 Deadend Link</option>
                    </select>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveNode(node.id); }}
                    className="native-form-input text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Form Input fields */}
                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <label className="text-slate-400 block text-[9px] uppercase font-bold">Node Title</label>
                    <input
                      type="text"
                      className="native-form-input w-full bg-[#0c1020] border border-slate-700 p-1 rounded text-slate-100 focus:outline-none"
                      value={node.title}
                      onChange={(e) => onUpdateNode(node.id, { title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block text-[9px] uppercase font-bold">Dialogue Pipeline</label>
                    <div className="space-y-1 max-h-[60px] overflow-y-auto pr-0.5">
                      {node.dialogue.map((line: any, idx: number) => (
                        <div key={idx} className="flex gap-1 items-center">
                          <input
                            type="text"
                            className="native-form-input flex-1 bg-[#0c1020] border border-slate-700 p-1 rounded text-slate-200 text-[10px]"
                            value={line}
                            onChange={(e) => {
                              const nextDiag = [...node.dialogue];
                              nextDiag[idx] = e.target.value;
                              onUpdateNode(node.id, { dialogue: nextDiag });
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (node.dialogue.length <= 1) return;
                              onUpdateNode(node.id, { dialogue: node.dialogue.filter((_: any, i: number) => i !== idx) });
                            }}
                            className="native-form-input text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateNode(node.id, { dialogue: [...node.dialogue, 'New text line...'] });
                      }}
                      className="native-form-input text-indigo-400 hover:text-indigo-300 text-[9px] font-semibold flex items-center gap-0.5 mt-0.5"
                    >
                      <PlusCircle className="w-3 h-3" /> Insert Row Line
                    </button>
                  </div>
                </div>

                {/* Option Matrix Outbound Channels */}
                {isLinear ? (
                  <div className="relative mt-1 pt-1.5 border-t border-slate-700 flex flex-col items-center justify-center h-6 !overflow-visible">
                    <div
                      onMouseDown={(e) => handlePinMouseDown(e, node, 0)}
                      className={`pin-connector-dot absolute bottom-0 translate-y-1/2 w-3.5 h-3.5 border-2 rounded-full cursor-crosshair transition-colors z-50 ${
                        node.choices[0]?.targetNodeId ? 'bg-blue-500 border-blue-400' : 'bg-[#0c1020] border-blue-400'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="space-y-1 mt-1 pt-1 border-t border-slate-700 !overflow-visible">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                      <span className="text-[9px] uppercase font-bold">Choices Matrix Outbound</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateNode(node.id, { choices: [...node.choices, { text: 'New Choice...', targetNodeId: '' }] });
                        }}
                        className="native-form-input text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      >
                        <PlusCircle className="w-3 h-3" /> Add Choice
                      </button>
                    </div>
                    
                    <div className="space-y-2 !overflow-visible">
                      {node.choices?.map((choice: any, idx: number) => (
                        <div key={idx} className="relative h-7 flex gap-1 items-center bg-[#0c1020]/40 px-1 border border-slate-700/80 rounded mb-1 !overflow-visible">
                          <input
                            type="text"
                            className="native-form-input flex-1 bg-[#0c1020] border border-slate-700/60 px-1 py-0.5 rounded text-[10px] text-slate-200"
                            value={choice.text}
                            onChange={(e) => {
                              const nextChoices = [...node.choices];
                              nextChoices[idx] = { ...nextChoices[idx], text: e.target.value };
                              onUpdateNode(node.id, { choices: nextChoices });
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateNode(node.id, { choices: node.choices.filter((_: any, i: number) => i !== idx) });
                            }}
                            className="native-form-input text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          
                          {/* 🔘 The choice connecting dot is placed directly into the row, matching its click zone */}
                          <div
                            onMouseDown={(e) => handlePinMouseDown(e, node, idx)}
                            className={`pin-connector-dot absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 border-2 rounded-full cursor-crosshair transition-colors z-50 ${
                              choice.targetNodeId ? 'bg-blue-500 border-blue-300' : 'bg-[#0c1020] border-blue-400'
                            }`}
                            title={choice.targetNodeId ? `Connected to ${choice.targetNodeId}` : 'Open Channel'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* LAYER 3: User Interaction Active Pointer Wires */}
        <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full z-40">
          {activeWire && (
            <path
              d={`M ${activeWire.startX} ${activeWire.startY} C ${activeWire.startX} ${activeWire.startY + 50}, ${activeWire.currentX} ${activeWire.currentY - 50}, ${activeWire.currentX} ${activeWire.currentY}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          )}
        </svg>
      </div>

      {/* Mini Map Navigation Radar panel */}
      <div className="absolute bottom-4 left-4 bg-[#1a233d] border border-slate-700/80 rounded-xl p-2.5 shadow-2xl w-44 z-50">
        <div className="text-[10px] font-mono font-bold text-slate-400 mb-1.5 border-b border-slate-700 pb-1 uppercase tracking-wider">
          Radar Viewport Tracker
        </div>
        <div
          onClick={(e: any) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const virtualOffset = CANVAS_VIRTUAL_BOUNDS / 2;
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const targetWorldX = (clickX / rect.width) * CANVAS_VIRTUAL_BOUNDS - virtualOffset;
            const targetWorldY = (clickY / rect.height) * CANVAS_VIRTUAL_BOUNDS - virtualOffset;

            if (viewportRef.current) {
              setPan({
                x: viewportRef.current.clientWidth / 2 - targetWorldX * zoom,
                y: viewportRef.current.clientHeight / 2 - targetWorldY * zoom
              });
            }
          }}
          className="relative h-24 w-full bg-[#0c1020] rounded-lg border border-slate-800 overflow-hidden cursor-crosshair"
        >
          {Object.values(nodes).map((node: any) => {
            const worldOffset = CANVAS_VIRTUAL_BOUNDS / 2;
            const markerLeft = ((node.x + worldOffset) / CANVAS_VIRTUAL_BOUNDS) * 160;
            const markerTop = ((node.y + worldOffset) / CANVAS_VIRTUAL_BOUNDS) * 96;
            return (
              <div
                key={`radar-marker-${node.id}`}
                className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 border border-slate-950 shadow"
                style={{
                  left: `${markerLeft}px`,
                  top: `${markerTop}px`,
                  backgroundColor: getRouteTypeColor(node.type)
                }}
              />
            );
          })}

          <div
            className="absolute border border-blue-500 pointer-events-none opacity-40 bg-blue-500/10"
            style={{
              left: `${((-pan.x / zoom + (CANVAS_VIRTUAL_BOUNDS / 2)) / CANVAS_VIRTUAL_BOUNDS) * 160}px`,
              top: `${((-pan.y / zoom + (CANVAS_VIRTUAL_BOUNDS / 2)) / CANVAS_VIRTUAL_BOUNDS) * 96}px`,
              width: viewportRef.current ? `${((viewportRef.current.clientWidth / zoom) / CANVAS_VIRTUAL_BOUNDS) * 160}px` : '32px',
              height: viewportRef.current ? `${((viewportRef.current.clientHeight / zoom) / CANVAS_VIRTUAL_BOUNDS) * 96}px` : '20px',
            }}
          />
        </div>
        <div className="text-[9px] font-mono text-slate-400 mt-1 flex justify-between">
          <span>Scale Matrix:</span>
          <span className="text-blue-400 font-bold">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
}