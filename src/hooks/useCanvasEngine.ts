// src/hooks/useCanvasEngine.ts
import { useState, useRef, useCallback } from 'react';
import { GraphState, ScenarioNode } from '@/types/novel/scenario';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 1.8;
const NODE_WIDTH = 260;

export function useCanvasEngine(
  nodes: GraphState,
  onUpdateNode: (id: string, fields: Partial<ScenarioNode>) => void
) {
  const [pan, setPan] = useState({ x: 120, y: 150 });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragAnchorRef = useRef({ x: 0, y: 0 });

  // 🔍 Exact focal point tracking math from your original setup
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    const scaleFactor = 1.08;
    let nextZoom = e.deltaY < 0 ? zoom * scaleFactor : zoom / scaleFactor;
    nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));

    setPan({
      x: mouseX - worldX * nextZoom,
      y: mouseY - worldY * nextZoom,
    });
    setZoom(nextZoom);
  }, [pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent, selectedNodeId: string | null, onSelectNode: (id: string | null) => void) => {
    // Avoid triggering drag/pan if the user clicks a button, input form, or connection dot
    if ((e.target as HTMLElement).closest('.native-form-input') || (e.target as HTMLElement).closest('.pin-connector-dot')) {
      return;
    }

    const nodeCard = (e.target as HTMLElement).closest('.scenario-node-box');
    const nodeId = nodeCard?.getAttribute('data-node-id');

    if (nodeId) {
      setDraggingNodeId(nodeId);
      onSelectNode(nodeId);
      dragAnchorRef.current = { 
        x: e.clientX - nodes[nodeId].x * zoom, 
        y: e.clientY - nodes[nodeId].y * zoom 
      };
    } else {
      setIsPanning(true);
      onSelectNode(null);
      dragAnchorRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  }, [nodes, pan, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - dragAnchorRef.current.x, y: e.clientY - dragAnchorRef.current.y });
    } else if (draggingNodeId && nodes[draggingNodeId]) {
      const nextX = (e.clientX - dragAnchorRef.current.x) / zoom;
      const nextY = (e.clientY - dragAnchorRef.current.y) / zoom;
      onUpdateNode(draggingNodeId, { x: Math.round(nextX), y: Math.round(nextY) });
    }
  }, [isPanning, draggingNodeId, nodes, zoom, onUpdateNode]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  const getOutboundPinCoords = useCallback((node: ScenarioNode, index: number) => {
    const startTopOffset = 152;
    const rowHeight = 32;

    if (node.type === 'linear_next') {
      return { x: node.x + NODE_WIDTH / 2, y: node.y + 135 };
    }
    return { x: node.x + NODE_WIDTH / 2, y: node.y + startTopOffset + (index * rowHeight) + rowHeight };
  }, []);

  return {
    pan,
    setPan,
    zoom,
    viewportRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getOutboundPinCoords,
    NODE_WIDTH
  };
}