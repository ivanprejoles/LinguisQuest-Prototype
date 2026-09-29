import { create } from 'zustand';

export interface Choice {
  text: string;
  targetNodeId: string;
}

export interface GraphNode {
  id: string; 
  title: string;
  type: 'starting'|'normal' | 'winning_ending' | 'deadend' | 'linear_next';
  bgImage: string;
  characterImage: string;
  bgMusic: string; 
  sfx: string;     
  dialogue: string[];
  x: number;
  y: number;
  choices: Choice[];
  isDirty?: boolean; 
}

interface NodeState {
  nodes: Record<string, GraphNode>;
  deletedNodeIds: string[];
  hasUnsavedChanges: boolean;
  isSavingNodes: boolean;
  selectedNodeId: string | null;
  
  fetchNodes: (sessionId: string) => Promise<void>;
  saveNodesToCloud: (sessionId: string) => Promise<boolean>;

  addNodeLocally: (node: GraphNode) => void;
  deleteNodeLocally: (nodeId: string) => void;
  updateNodeLocally: (nodeId: string, fields: Partial<GraphNode>) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  clearStore: () => void;
}

export const useNodeStore = create<NodeState>((set, get) => ({
  nodes: {},
  deletedNodeIds: [],
  hasUnsavedChanges: false,
  isSavingNodes: false,
  selectedNodeId: null,

  // Streamlined fetch call using URL query parameters
  fetchNodes: async (sessionId) => {
    set({ isSavingNodes: false, hasUnsavedChanges: false, deletedNodeIds: [] });
    try {
      const res = await fetch(`/api/admin/novel/nodes/get?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        set({ nodes: data.nodes || {} });
      }
    } catch (err) {
      console.error("Failed loading node tracking data:", err);
    }
  },

  // Streamlined sync action sending JSON with an embedded sessionId
  saveNodesToCloud: async (sessionId) => {
    const { hasUnsavedChanges, isSavingNodes, nodes, deletedNodeIds } = get();
    if (!hasUnsavedChanges || isSavingNodes) return false;

    set({ isSavingNodes: true });

    const dirtyNodesList: any[] = [];
    Object.values(nodes).forEach((node) => {
      if (node.isDirty) {
        const { isDirty, ...cleanNode } = node;
        dirtyNodesList.push(cleanNode);
      }
    });

    try {
      const res = await fetch('/api/admin/novel/nodes/sync', {
        method: 'POST', // Changed to POST to match your upload endpoint behavior
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, // Passed directly in the body
          upsertNodes: dirtyNodesList,
          deleteNodeIds: deletedNodeIds
        })
      });

      if (res.ok) {
        set((state) => {
          const resetNodes = { ...state.nodes };
          Object.keys(resetNodes).forEach(id => {
            if (resetNodes[id].isDirty) resetNodes[id].isDirty = false;
          });
          return {
            nodes: resetNodes,
            deletedNodeIds: [],
            hasUnsavedChanges: false
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Background layout synchronization failed:", err);
      return false;
    } finally {
      set({ isSavingNodes: false });
    }
  },

  addNodeLocally: (node) => {
    set((state) => {
      const updatedNodes = { ...state.nodes };

      // If the new node is 'starting', reset any existing starting node to 'normal'
      if (node.type === 'starting') {
        Object.keys(updatedNodes).forEach((id) => {
          if (updatedNodes[id].type === 'starting') {
            updatedNodes[id] = { ...updatedNodes[id], type: 'normal', isDirty: true };
          }
        });
      }

      updatedNodes[node.id] = { ...node, isDirty: true };

      return {
        nodes: updatedNodes,
        hasUnsavedChanges: true
      };
    });
  },

  deleteNodeLocally: (nodeId) => {
    set((state) => {
      const updatedNodes = { ...state.nodes };
      const wasSavedOnCloud = !updatedNodes[nodeId]?.isDirty;

      delete updatedNodes[nodeId];

      Object.keys(updatedNodes).forEach((id) => {
        let connectedPathBroken = false;
        const mappedChoices = updatedNodes[id].choices.map((c) => {
          if (c.targetNodeId === nodeId) {
            connectedPathBroken = true;
            return { ...c, targetNodeId: '' };
          }
          return c;
        });

        if (connectedPathBroken) {
          updatedNodes[id].choices = mappedChoices;
          updatedNodes[id].isDirty = true;
        }
      });

      return {
        nodes: updatedNodes,
        hasUnsavedChanges: true,
        deletedNodeIds: wasSavedOnCloud ? [...state.deletedNodeIds, nodeId] : state.deletedNodeIds
      };
    });
  },

  updateNodeLocally: (nodeId, fields) => {
    set((state) => {
      if (!state.nodes[nodeId]) return state;
      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...state.nodes[nodeId],
            ...fields,
            isDirty: true 
          }
        },
        hasUnsavedChanges: true
      };
    });
  },

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  clearStore: () => {
    set({
      nodes: {},
      deletedNodeIds: [],
      hasUnsavedChanges: false,
      isSavingNodes: false,
      selectedNodeId: null
    });
  }
}));