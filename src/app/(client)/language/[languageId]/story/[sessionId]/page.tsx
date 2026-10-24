'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type {
  StoryGraphResponse,
  StoryScene,
} from '@/types/novel/scenario';
import StoryScenePlayer from '@/components/global/story/scene/StoryScenePlayer';

export default function StoryPlayerPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [graph, setGraph] = useState<StoryScene[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [sceneEntryCount, setSceneEntryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracks nodes visited in this page session.
  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(
    () => new Set()
  );

  // Build the lookup once whenever the fetched graph changes.
  const nodesById = useMemo(() => {
    const lookup: Record<string, StoryScene> = {};

    for (const node of graph) {
      lookup[node.nodeId] = node;
    }

    return lookup;
  }, [graph]);

  const activeNode = activeNodeId
    ? nodesById[activeNodeId] ?? null
    : null;

  // Fetch the graph once per sessionId.
  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();

    async function loadStory() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/client/story/${encodeURIComponent(sessionId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Could not load this story.');
        }

        const data: StoryGraphResponse = await response.json();

        if (!data.graphNodes?.length) {
          throw new Error('This story has no scenarios yet.');
        }

        setGraph(data.graphNodes);

        // TODO: replace this initial-node selection with the saved
        // checkpoint once the learner progress API is connected.
        const startingNode =
          data.graphNodes.find((node) => node.type === 'starting') ??
          data.graphNodes[0];

        setActiveNodeId(startingNode.nodeId);
        setDialogueIdx(0);
        setVisitedNodeIds(new Set([startingNode.nodeId]));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadStory();

    return () => controller.abort();
  }, [sessionId]);

  // Navigate using the graph already in memory.
  const enterNode = useCallback(
    (nodeId: string) => {
      if (!nodesById[nodeId]) {
        setError(`Scenario "${nodeId}" was not found in this story.`);
        return;
      }

      setError(null);
      setActiveNodeId(nodeId);
      setDialogueIdx(0);
      setSceneEntryCount((count) => count + 1);

      setVisitedNodeIds((previous) => {
        const next = new Set(previous);
        next.add(nodeId);
        return next;
      });
    },
    [nodesById]
  );

  const advanceDialogue = useCallback(() => {
    if (!activeNode) return;

    const dialogue = activeNode.dialogue ?? [];

    // More dialogue remains in the current scenario.
    if (dialogueIdx < dialogue.length - 1) {
      setDialogueIdx((index) => index + 1);
      return;
    }

    // Follow the next node automatically for linear scenarios.
    if (activeNode.type === 'linear_next') {
      const nextChoice = activeNode.choices?.[0];

      if (nextChoice?.targetNodeId) {
        enterNode(nextChoice.targetNodeId);
      }
    }

    // Winning/losing endings should be handled by your existing
    // ending UI and result API logic.
  }, [activeNode, dialogueIdx, enterNode]);

  const selectChoice = useCallback(
    (targetNodeId: string) => {
      if (!nodesById[targetNodeId]) {
        setError('The selected branch points to a missing scenario.');
        return;
      }

      enterNode(targetNodeId);
    },
    [nodesById, enterNode]
  );

  if (loading) return <p>Loading story...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!activeNode) return <p>No scenario is available.</p>;

  // Keep your existing layout and ending UI around the shared player.
  return (
    <main className="w-full h-full">
          <StoryScenePlayer
            scene={activeNode}
            sceneEntryKey={`${sessionId}:${sceneEntryCount}:${activeNode.nodeId}`}
            dialogueIdx={dialogueIdx}
            onSelectNode={selectChoice}
            advanceDialogue={advanceDialogue}
          />
    </main>
  );
}