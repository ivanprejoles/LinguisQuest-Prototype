// 'use client';

// import React, { memo } from 'react';
// import { NodeProps, Node } from '@xyflow/react';
// import { ScenarioNodeBox, ScenarioNodeData } from './ScenarioNodeBox';
// import { useNodeStore } from '@/store/novel/useNodeStore';

// export const ScenarioNodeWrapper = memo(function ScenarioNodeWrapper(
//   props: NodeProps<Node<ScenarioNodeData>>
// ) {
//   const updateNodeLocally = useNodeStore((state) => state.updateNodeLocally);
//   const deleteNodeLocally = useNodeStore((state) => state.deleteNodeLocally);
//   const setSelectedNodeId = useNodeStore((state) => state.setSelectedNodeId);

//   const enrichedData: ScenarioNodeData = {
//     ...props.data,
//     onSelectNode: props.data.onSelectNode || setSelectedNodeId,
//     onUpdateNode: props.data.onUpdateNode || updateNodeLocally,
//     onRemoveNode: props.data.onRemoveNode || deleteNodeLocally,
//   };

//   return <ScenarioNodeBox {...props} data={enrichedData} />;
// });

'use client';

import React, { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { ScenarioNodeBox, ScenarioNodeData } from './ScenarioNodeBox';
import { useNodeStore } from '@/store/story/useNodeStore';

export const ScenarioNodeWrapper = memo(function ScenarioNodeWrapper(
  props: NodeProps<Node<ScenarioNodeData>>
) {
  const updateNodeLocally = useNodeStore((state) => state.updateNodeLocally);
  const deleteNodeLocally = useNodeStore((state) => state.deleteNodeLocally);
  const setSelectedNodeId = useNodeStore((state) => state.setSelectedNodeId);

  const enrichedData: ScenarioNodeData = {
    ...props.data,
    onSelectNode: props.data.onSelectNode || setSelectedNodeId,
    onUpdateNode: props.data.onUpdateNode || updateNodeLocally,
    onRemoveNode: props.data.onRemoveNode || deleteNodeLocally,
  };

  return <ScenarioNodeBox {...props} data={enrichedData} />;
});