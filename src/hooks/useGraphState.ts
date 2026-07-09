// src/hooks/useGraphState.ts
import { useState } from 'react';
import { GraphState, ScenarioNode, RoutePathType } from '@/types/scenario';

export function useGraphState() {
  const [nodes, setNodes] = useState<GraphState>({
    node_1: {
      id: 'node_1',
      title: 'Cafe Entrance Scene',
      type: 'normal',
      bgImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
      characterImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=barista',
      dialogue: [
        'You approach the counter as the aroma of roasted coffee fills the air.',
        'The barista smiles warmly and addresses you:',
        '¡Hola! Bienvenidos a Linguis Café. ¿Qué te pongo?'
      ],
      x: 100, y: 120,
      choices: [
        { text: '¡Buenos días! Quisiera un café.', targetNodeId: 'node_2' },
        { text: 'Uhh... can I get a coffee please?', targetNodeId: 'node_3' }
      ]
    },
    node_2: {
      id: 'node_2',
      title: 'Successful Exchange',
      type: 'winning_ending',
      bgImage: '', characterImage: '',
      dialogue: ["The barista's eyes light up with joy!", "Success!"],
      x: 60, y: 500, choices: []
    },
    node_3: {
      id: 'node_3',
      title: 'Language Disconnect',
      type: 'deadend',
      bgImage: '', characterImage: '',
      dialogue: ['A look of confusion crosses her face.'],
      x: 460, y: 420, choices: []
    }
  });
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Cleaned up ternary lookup to keep TypeScript happy
  const activeNode: ScenarioNode | null = selectedNodeId && nodes[selectedNodeId] 
    ? nodes[selectedNodeId] 
    : null;

  const createNode = (x = 200, y = 150) => {
    const nextId = `node_${Object.keys(nodes).length + 1}`;
    const newNode: ScenarioNode = {
      id: nextId,
      title: `Scenario Segment ${Object.keys(nodes).length + 1}`,
      type: 'normal',
      bgImage: '', characterImage: '',
      dialogue: ['First narration scene line...'],
      x, y, choices: []
    };
    setNodes(prev => ({ ...prev, [nextId]: newNode }));
    setSelectedNodeId(nextId);
  };

  const updateNode = (id: string, updatedFields: Partial<ScenarioNode>) => {
    setNodes(prev => {
      if (!prev[id]) return prev;
      const copy = { ...prev[id], ...updatedFields };
      
      // Cleanup handling constraint when switched to Linear
      if (updatedFields.type === 'linear_next') {
        copy.choices = copy.choices.slice(0, 1);
      }
      return { ...prev, [id]: copy };
    });
  };

  const removeNode = (id: string) => {
    setNodes(prev => {
      const copy = { ...prev };
      delete copy[id];
      // Sever wire relationships matching dead endpoint reference
      Object.keys(copy).forEach(k => {
        copy[k].choices = copy[k].choices.map(c => 
          c.targetNodeId === id ? { ...c, targetNodeId: '' } : c
        );
      });
      return copy;
    });
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // 🔥 ADDED activeNode TO THE RETURN VALUE HERE SO COMPONENT FILES CAN BIND SAFELY
  return { 
    nodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    activeNode, 
    createNode, 
    updateNode, 
    removeNode, 
    setNodes 
  };
}