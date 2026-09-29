// 'use client';

// import React, { useMemo, useCallback } from 'react';
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   Node,
//   Edge,
//   OnNodeDrag,
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// import { useNodeStore, GraphNode } from '@/store/novel/useNodeStore';
// import { ScenarioNodeWrapper } from './ScenarioNodeWrapper';
// import { ScenarioNodeData } from './ScenarioNodeBox';
// import { Asset } from '@/store/novel/useAssetStore';

// interface FlowCanvasProps {
//   dbAssets?: Asset[];
// }

// const NODE_TYPES = {
//   scenarioNode: ScenarioNodeWrapper,
// };

// const RADAR_COLORS: Record<string, string> = {
//   normal: '#b066ff',         // Neon Purple
//   linear_next: '#00f3ff',    // Neon Cyan
//   winning_ending: '#39ff14', // Neon Bright Green
//   deadend: '#ff0055',        // Neon Hot Pink
// };

// // Standard approximate dimensions for your custom node cards
// const NODE_WIDTH = 260;
// const NODE_HEIGHT = 140;

// const getMiniMapNodeColor = (node: Node<ScenarioNodeData>) => {
//   const nodeType = node.data?.type || 'normal';
//   return RADAR_COLORS[nodeType] || RADAR_COLORS.normal;
// };

// export function FlowCanvas({ dbAssets = [] }: FlowCanvasProps) {
//   const nodesDict = useNodeStore((state) => state.nodes);
//   const selectedNodeId = useNodeStore((state) => state.selectedNodeId);

//   const setSelectedNodeId = useNodeStore((state) => state.setSelectedNodeId);
//   const updateNodeLocally = useNodeStore((state) => state.updateNodeLocally);
//   const deleteNodeLocally = useNodeStore((state) => state.deleteNodeLocally);

//   // Map state nodes with explicit width and height for SVG rendering
//   const flowNodes: Node<ScenarioNodeData>[] = useMemo(() => {
//     return Object.values(nodesDict).map((node: GraphNode) => ({
//       id: node.id,
//       type: 'scenarioNode',
//       position: { x: node.x ?? 0, y: node.y ?? 0 },
//       width: NODE_WIDTH,   // Explicit width for MiniMap bounds
//       height: NODE_HEIGHT, // Explicit height for MiniMap bounds
//       selected: node.id === selectedNodeId,
//       data: {
//         ...node,
//         dbAssets,
//         onSelectNode: setSelectedNodeId,
//         onUpdateNode: updateNodeLocally,
//         onRemoveNode: deleteNodeLocally,
//       },
//     }));
//   }, [nodesDict, selectedNodeId, dbAssets, setSelectedNodeId, updateNodeLocally, deleteNodeLocally]);

//   const flowEdges: Edge[] = useMemo(() => {
//     const edges: Edge[] = [];

//     Object.values(nodesDict).forEach((node) => {
//       if (node.choices && node.choices.length > 0) {
//         node.choices.forEach((choice, index) => {
//           if (choice.targetNodeId) {
//             edges.push({
//               id: `edge-${node.id}-${choice.targetNodeId}-${index}`,
//               source: node.id,
//               sourceHandle: node.type === 'linear_next' ? 'choice-0' : `choice-${index}`,
//               target: choice.targetNodeId,
//               targetHandle: 'target',
//               animated: true,
//               style: { stroke: '#6366f1', strokeWidth: 2 },
//             });
//           }
//         });
//       }
//     });

//     return edges;
//   }, [nodesDict]);

//   const onNodeDragStop: OnNodeDrag<Node<ScenarioNodeData>> = useCallback(
//     (_, node) => {
//       updateNodeLocally(node.id, { x: node.position.x, y: node.position.y });
//     },
//     [updateNodeLocally]
//   );

//   const handleNodeClick = useCallback(
//     (_: React.MouseEvent, node: Node) => {
//       setSelectedNodeId(node.id);
//     },
//     [setSelectedNodeId]
//   );

//   const handlePaneClick = useCallback(() => {
//     setSelectedNodeId(null);
//   }, [setSelectedNodeId]);

//   return (
//     <div className="w-full h-full bg-[#0c1020]" id="flow-canvas-container">
//       <ReactFlow
//         nodes={flowNodes}
//         edges={flowEdges}
//         nodeTypes={NODE_TYPES}
//         onNodeDragStop={onNodeDragStop}
//         onNodeClick={handleNodeClick}
//         onPaneClick={handlePaneClick}
//         minZoom={0.05} // Allows zooming out up to 20x further (default is 0.5)
//         maxZoom={4}
//         fitView
//       >
//         <Background color="#1e293b" gap={16} />
//         <Controls className="bg-slate-900 border-slate-800 text-slate-200 fill-slate-200" />
        
//         <MiniMap
//           nodeColor={getMiniMapNodeColor}
//           nodeStrokeColor="#ffffff"
//           nodeStrokeWidth={1}
//           nodeBorderRadius={3}
//           maskColor="rgba(0, 0, 0, 0.85)"
//           maskStrokeColor="#ffffff"
//           maskStrokeWidth={2}
//           zoomable
//           pannable
//           style={{ backgroundColor: '#000000' }}
//           className="bg-black border-2 border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.4)] rounded-xl overflow-hidden"
//         />
//       </ReactFlow>
//     </div>
//   );
// }

'use client';

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodeDrag,
  OnConnect,
  OnEdgesDelete,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useNodeStore, GraphNode } from '@/store/story/useNodeStore';
import { ScenarioNodeWrapper } from './ScenarioNodeWrapper';
import { ScenarioNodeData } from './ScenarioNodeBox';
import { Asset } from '@/store/story/useAssetStore';

interface FlowCanvasProps {
  dbAssets?: Asset[];
}

const NODE_TYPES = {
  scenarioNode: ScenarioNodeWrapper,
};

const RADAR_COLORS: Record<string, string> = {
  starting: '#ffb700',       // Neon Gold / Amber
  normal: '#b066ff',         // Neon Purple
  linear_next: '#00f3ff',    // Neon Cyan
  winning_ending: '#39ff14', // Neon Bright Green
  deadend: '#ff0055',        // Neon Hot Pink
};

const NODE_WIDTH = 280;
const NODE_HEIGHT = 200;

const getMiniMapNodeColor = (node: Node<ScenarioNodeData>) => {
  const nodeType = node.data?.type || 'normal';
  return RADAR_COLORS[nodeType] || RADAR_COLORS.normal;
};

export function FlowCanvas({ dbAssets = [] }: FlowCanvasProps) {
  const nodesDict = useNodeStore((state) => state.nodes);
  const selectedNodeId = useNodeStore((state) => state.selectedNodeId);

  const setSelectedNodeId = useNodeStore((state) => state.setSelectedNodeId);
  const updateNodeLocally = useNodeStore((state) => state.updateNodeLocally);
  const deleteNodeLocally = useNodeStore((state) => state.deleteNodeLocally);

  // Map state nodes to React Flow nodes
  const flowNodes: Node<ScenarioNodeData>[] = useMemo(() => {
    return Object.values(nodesDict).map((node: GraphNode) => ({
      id: node.id,
      type: 'scenarioNode',
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      selected: node.id === selectedNodeId,
      data: {
        ...node,
        dbAssets,
        onSelectNode: setSelectedNodeId,
        onUpdateNode: updateNodeLocally,
        onRemoveNode: deleteNodeLocally,
      },
    }));
  }, [nodesDict, selectedNodeId, dbAssets, setSelectedNodeId, updateNodeLocally, deleteNodeLocally]);

  // Derived edges from choices structure
  const flowEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    Object.values(nodesDict).forEach((node) => {
      if (node.choices && node.choices.length > 0) {
        node.choices.forEach((choice, index) => {
          if (choice.targetNodeId) {
            edges.push({
              id: `edge-${node.id}-${choice.targetNodeId}-${index}`,
              source: node.id,
              sourceHandle: node.type === 'linear_next' ? 'choice-0' : `choice-${index}`,
              target: choice.targetNodeId,
              targetHandle: 'target',
              animated: true,
              style: { stroke: '#6366f1', strokeWidth: 2 },
            });
          }
        });
      }
    });

    return edges;
  }, [nodesDict]);

  // Update node coordinates when dragged
  const onNodeDragStop: OnNodeDrag<Node<ScenarioNodeData>> = useCallback(
    (_, node) => {
      updateNodeLocally(node.id, { x: node.position.x, y: node.position.y });
    },
    [updateNodeLocally]
  );

  // Connect choice handle to target node via drag-and-drop
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const { source, sourceHandle, target } = connection;
      if (!source || !target || !sourceHandle) return;

      const sourceNode = nodesDict[source];
      if (!sourceNode) return;

      // Extract index from source handle string format "choice-X"
      const choiceIndex = parseInt(sourceHandle.replace('choice-', ''), 10);
      if (isNaN(choiceIndex) || !sourceNode.choices[choiceIndex]) return;

      const updatedChoices = [...sourceNode.choices];
      updatedChoices[choiceIndex] = {
        ...updatedChoices[choiceIndex],
        targetNodeId: target,
      };

      updateNodeLocally(source, { choices: updatedChoices });
    },
    [nodesDict, updateNodeLocally]
  );

  // Disconnect choices when an edge is deleted on canvas
  const onEdgesDelete: OnEdgesDelete = useCallback(
    (edgesToDelete) => {
      edgesToDelete.forEach((edge) => {
        const sourceNode = nodesDict[edge.source];
        if (!sourceNode || !edge.sourceHandle) return;

        const choiceIndex = parseInt(edge.sourceHandle.replace('choice-', ''), 10);
        if (isNaN(choiceIndex) || !sourceNode.choices[choiceIndex]) return;

        const updatedChoices = [...sourceNode.choices];
        updatedChoices[choiceIndex] = {
          ...updatedChoices[choiceIndex],
          targetNodeId: '',
        };

        updateNodeLocally(edge.source, { choices: updatedChoices });
      });
    },
    [nodesDict, updateNodeLocally]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full bg-[#0c1020]" id="flow-canvas-container">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={NODE_TYPES}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        minZoom={0.05}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        // fitView
      >
        <Background color="#1e293b" gap={16} />
        <Controls className="bg-slate-900 border-slate-800 text-slate-200 fill-slate-200" />

        <MiniMap
          nodeColor={getMiniMapNodeColor}
          nodeStrokeColor="#ffffff"
          nodeStrokeWidth={1}
          nodeBorderRadius={3}
          maskColor="rgba(0, 0, 0, 0.85)"
          maskStrokeColor="#ffffff"
          maskStrokeWidth={2}
          zoomable
          pannable
          style={{ backgroundColor: '#000000' }}
          className="bg-black border-2 border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.4)] rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}