
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import StoryScenePlayer from '@/components/global/story/scene/StoryScenePlayer';
import StoryIntroScreen from '@/components/global/story/scene/StoryIntroScreen';
import StoryEndingScreen from '@/components/global/story/scene/StoryEndingScreen';

import type {
  StoryGraphResponse,
  StoryScene,
} from '@/types/novel/scenario';

import { useStoryProgressStore } from '@/store/story/story-progress-store';
import type { StoryOutcome } from '@/store/story/story-progress-store';

// -----------------------------------------------------------------------------
// Constants and types
// -----------------------------------------------------------------------------

const AUTOSAVE_INTERVAL = 30_000;

type PlatformViewport = 'mobile' | 'tablet' | 'desktop';

interface ProgressResponse {
  sessionId: string;
  currentNodeId: string;
  winCount: number;
  lossCount: number;
}

// -----------------------------------------------------------------------------
// API helper
// -----------------------------------------------------------------------------

async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

// -----------------------------------------------------------------------------
// Story player page
// -----------------------------------------------------------------------------

export default function StoryPlayerPage() {
  // Route parameters
  const { languageId, sessionId } = useParams<{
    languageId: string;
    sessionId: string;
  }>();

  const router = useRouter();
  const baseUrl = `/api/client/story/${sessionId}`;

  // Zustand actions
  const setCheckpoint = useStoryProgressStore(
    (state) => state.setCheckpoint,
  );

  const hydrate = useStoryProgressStore(
    (state) => state.hydrate,
  );

  // Page state
  const [ending, setEnding] = useState<{
    outcome: StoryOutcome;
    node: StoryScene;
  } | null>(null);

  const [activeNodeId, setActiveNodeId] = useState('');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [sceneEntryCount, setSceneEntryCount] = useState(0);
  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([]);
  const [navigationError, setNavigationError] = useState<string | null>(
    null,
  );
  const [initialized, setInitialized] = useState(false);
  const [viewport, setViewport] = useState<PlatformViewport>('mobile');
  const [hasStarted, setHasStarted] = useState(false);

  // Refs
  const initializedKeyRef = useRef('');
  const handledEndingRef = useRef('');
  const saveInFlightRef = useRef(false);
  const outcomeInFlightRef = useRef(false);

  const pendingOutcomeRef = useRef<{
    outcome: StoryOutcome;
    endingNodeId: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const graphQuery = useQuery({
    queryKey: ['story-graph', languageId, sessionId],
    queryFn: () =>
      fetchJson<StoryGraphResponse>(
        `${baseUrl}?languageId=${encodeURIComponent(languageId)}`,
      ),
    enabled: Boolean(languageId && sessionId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const progressQuery = useQuery({
    queryKey: ['story-progress', sessionId],
    queryFn: () =>
      fetchJson<ProgressResponse>(`${baseUrl}/progress`),
    enabled: Boolean(sessionId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // ---------------------------------------------------------------------------
  // Derived story data
  // ---------------------------------------------------------------------------

  const graph = graphQuery.data?.graphNodes ?? [];

  const nodesById = useMemo(
    () =>
      new Map<string, StoryScene>(
        graph.map((node) => [node.nodeId, node]),
      ),
    [graph],
  );

  const startingNode = useMemo(
    () =>
      graph.find((node) => node.type === 'starting') ??
      graph[0] ??
      null,
    [graph],
  );

  const activeNode = activeNodeId
    ? nodesById.get(activeNodeId) ?? null
    : null;

  // ---------------------------------------------------------------------------
  // Viewport detection
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const tabletQuery = window.matchMedia(
      '(min-width: 768px) and (max-width: 1023px)',
    );

    const updateViewport = () => {
      const nextViewport: PlatformViewport = mobileQuery.matches
        ? 'mobile'
        : tabletQuery.matches
          ? 'tablet'
          : 'desktop';

      setViewport((current) =>
        current === nextViewport ? current : nextViewport,
      );
    };

    updateViewport();

    mobileQuery.addEventListener('change', updateViewport);
    tabletQuery.addEventListener('change', updateViewport);

    return () => {
      mobileQuery.removeEventListener('change', updateViewport);
      tabletQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Progress initialization
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!progressQuery.data) return;

    hydrate(progressQuery.data);
  }, [progressQuery.data, hydrate]);

  useEffect(() => {
    if (
      graphQuery.isPending ||
      progressQuery.isPending ||
      graphQuery.isError ||
      progressQuery.isError ||
      graph.length === 0 ||
      !startingNode
    ) {
      return;
    }

    const key = `${languageId}:${sessionId}`;

    if (initializedKeyRef.current === key) return;

    const localProgress =
      useStoryProgressStore.getState().progress[sessionId];

    const savedNodeId =
      localProgress?.currentNodeId ??
      progressQuery.data?.currentNodeId;

    const restoredNode =
      (savedNodeId ? nodesById.get(savedNodeId) : undefined) ??
      startingNode;

    initializedKeyRef.current = key;

    setActiveNodeId(restoredNode.nodeId);
    setDialogueIdx(0);
    setSceneEntryCount((count) => count + 1);
    setVisitedNodeIds([restoredNode.nodeId]);
    setNavigationError(null);
    setHasStarted(false);
    setInitialized(true);

    if (!localProgress && !progressQuery.data) {
      setCheckpoint(sessionId, startingNode.nodeId);
    }
  }, [
    graphQuery.isPending,
    graphQuery.isError,
    progressQuery.isPending,
    progressQuery.isError,
    progressQuery.data,
    graph,
    nodesById,
    startingNode,
    languageId,
    sessionId,
    setCheckpoint,
  ]);

  // ---------------------------------------------------------------------------
  // Story navigation
  // ---------------------------------------------------------------------------

  const enterNode = useCallback(
    (nodeId: string) => {
      const node = nodesById.get(nodeId);

      if (!node) {
        setNavigationError(`Story node not found: ${nodeId}`);
        return;
      }

      setNavigationError(null);
      setActiveNodeId(nodeId);
      setDialogueIdx(0);
      setSceneEntryCount((count) => count + 1);

      setVisitedNodeIds((previous) =>
        previous.includes(nodeId)
          ? previous
          : [...previous, nodeId],
      );

      setCheckpoint(sessionId, nodeId);
    },
    [nodesById, sessionId, setCheckpoint],
  );

  // ---------------------------------------------------------------------------
  // Progress saving
  // ---------------------------------------------------------------------------

  const saveProgress = useCallback(
    async (keepalive = false): Promise<boolean> => {
      if (outcomeInFlightRef.current) return false;

      const store = useStoryProgressStore.getState();
      const current = store.progress[sessionId];

      if (!current) return false;

      if (!store.dirty[sessionId]) return true;

      if (saveInFlightRef.current) return false;

      saveInFlightRef.current = true;

      const snapshot = {
        currentNodeId: current.currentNodeId,
        winCount: current.winCount,
        lossCount: current.lossCount,
      };

      try {
        const response = await fetch(`${baseUrl}/progress`, {
          method: 'PUT',
          cache: 'no-store',
          keepalive,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentNodeId: snapshot.currentNodeId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Save failed (${response.status})`);
        }

        const latestStore = useStoryProgressStore.getState();
        const latest = latestStore.progress[sessionId];

        if (
          latest &&
          latest.currentNodeId === snapshot.currentNodeId &&
          latest.winCount === snapshot.winCount &&
          latest.lossCount === snapshot.lossCount
        ) {
          latestStore.markClean(sessionId);
          return true;
        }

        return false;
      } catch (error) {
        console.error('Checkpoint save failed:', error);
        return false;
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [baseUrl, sessionId],
  );

  // ---------------------------------------------------------------------------
  // Ending outcome persistence
  // ---------------------------------------------------------------------------

  const retryPendingOutcome = useCallback(async () => {
    const pending = pendingOutcomeRef.current;

    if (!pending || outcomeInFlightRef.current) return;

    if (saveInFlightRef.current) return;

    outcomeInFlightRef.current = true;

    try {
      const response = await fetch(
        `${baseUrl}/progress/outcome`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pending),
        },
      );

      if (!response.ok) {
        throw new Error('Outcome save failed');
      }

      const saved: ProgressResponse = await response.json();

      if (pendingOutcomeRef.current !== pending) return;

      pendingOutcomeRef.current = null;

      const store = useStoryProgressStore.getState();

      store.markClean(sessionId);
      store.hydrate(saved);

      setNavigationError(null);
    } catch (error) {
      console.error('Outcome save failed; will retry:', error);
    } finally {
      outcomeInFlightRef.current = false;
    }
  }, [baseUrl, sessionId]);

  // ---------------------------------------------------------------------------
  // Story ending
  // ---------------------------------------------------------------------------

  const finishStory = useCallback(
    async (outcome: StoryOutcome, endingNodeId: string) => {
      if (!startingNode || !activeNode || outcomeInFlightRef.current) {
        return;
      }

      const endingKey =
        `${sessionId}:${endingNodeId}:${sceneEntryCount}`;

      if (handledEndingRef.current === endingKey) return;

      const checkpointSaved = await saveProgress();

      if (!checkpointSaved) {
        setNavigationError(
          'Unable to save the ending checkpoint. Please try again.',
        );
        return;
      }

      handledEndingRef.current = endingKey;

      setEnding({
        outcome,
        node: activeNode,
      });

      pendingOutcomeRef.current = {
        outcome,
        endingNodeId,
      };

      await retryPendingOutcome();
    },
    [
      sessionId,
      startingNode,
      activeNode,
      sceneEntryCount,
      saveProgress,
      retryPendingOutcome,
    ],
  );

  // ---------------------------------------------------------------------------
  // Dialogue and choice handling
  // ---------------------------------------------------------------------------

  const advanceDialogue = useCallback(() => {
    if (!activeNode) return;

    const dialogues = activeNode.dialogue ?? [];

    if (dialogueIdx < dialogues.length - 1) {
      setDialogueIdx((index) => index + 1);
      return;
    }

    if (activeNode.type === 'winning_ending') {
      void finishStory('win', activeNode.nodeId);
      return;
    }

    if (activeNode.type === 'deadend') {
      void finishStory('loss', activeNode.nodeId);
      return;
    }

    if (activeNode.type === 'linear_next') {
      const nextNodeId = activeNode.choices[0]?.targetNodeId;

      if (nextNodeId) {
        enterNode(nextNodeId);
      }

      return;
    }
  }, [activeNode, dialogueIdx, finishStory, enterNode]);

  const selectChoice = useCallback(
    (nodeId: string) => {
      enterNode(nodeId);
    },
    [enterNode],
  );

  // ---------------------------------------------------------------------------
  // Autosave and page visibility
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!initialized) return;

    const timer = window.setInterval(() => {
      if (pendingOutcomeRef.current) {
        void retryPendingOutcome();
      } else {
        void saveProgress();
      }
    }, AUTOSAVE_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;

      if (pendingOutcomeRef.current) {
        void retryPendingOutcome();
      } else {
        void saveProgress(true);
      }
    };

    const handlePageHide = () => {
      if (!pendingOutcomeRef.current) {
        void saveProgress(true);
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.clearInterval(timer);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );

      window.removeEventListener('pagehide', handlePageHide);

      void saveProgress(true);
    };
  }, [initialized, saveProgress, retryPendingOutcome]);

  // ---------------------------------------------------------------------------
  // Loading and error states
  // ---------------------------------------------------------------------------

  if (graphQuery.isPending || progressQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading story...
      </div>
    );
  }

  if (graphQuery.isError || progressQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p>Unable to load your story.</p>

        <button
          type="button"
          className="rounded border px-4 py-2"
          onClick={() => {
            void graphQuery.refetch();
            void progressQuery.refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (graph.length === 0) {
    return (
      <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <section
          className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
          role="status"
        >
          <h1 className="text-lg font-semibold text-gray-900">
            No Story Scenario Available
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            This story doesn&apos;t have any scenarios available
            at the moment. Please try again later or contact
            your instructor if you believe this is an error.
          </p>
        </section>
      </main>
    );
  }

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading story...
      </div>
    );
  }

  if (!activeNode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        No story node is available.
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Story introduction
  // ---------------------------------------------------------------------------

  if (!hasStarted) {
    return (
      <StoryIntroScreen
        title={
          graphQuery.data?.title ||
          startingNode?.title ||
          'Untitled Story'
        }
        description={graphQuery.data?.description || ''}
        image={
          graphQuery.data?.imageUrl ||
          startingNode?.bgImage
        }
        onStart={() => setHasStarted(true)}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Story ending screen
  // ---------------------------------------------------------------------------

  if (ending) {
    return (
      <StoryEndingScreen
        outcome={ending.outcome === 'win' ? 'win' : 'loss'}
        title={ending.node.title}
        image={ending.node.bgImage}
        onReturn={() => {
          router.push(`/language/${languageId}/story`);
        }}
        onReplay={() => {
          setEnding(null);
          handledEndingRef.current = '';
          pendingOutcomeRef.current = null;

          enterNode(startingNode!.nodeId);
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Main story scene
  // ---------------------------------------------------------------------------

  return (
    <main className="relative h-full w-full bg-black">
      {navigationError && (
        <p role="alert" className="p-2 text-sm text-red-500">
          {navigationError}
        </p>
      )}

      <StoryScenePlayer
        scene={activeNode}
        sceneEntryKey={`${languageId}:${sessionId}:${sceneEntryCount}:${activeNode.nodeId}`}
        viewport={viewport}
        dialogueIdx={dialogueIdx}
        onSelectNode={selectChoice}
        advanceDialogue={advanceDialogue}
      />
    </main>
  );
}
