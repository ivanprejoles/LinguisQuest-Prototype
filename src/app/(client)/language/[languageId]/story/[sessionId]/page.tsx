// // 'use client';

// // import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// // import { useParams } from 'next/navigation';
// // import { useQuery } from '@tanstack/react-query';
// // import type {
// //   StoryGraphResponse,
// //   StoryScene,
// // } from '@/types/novel/scenario';
// // import StoryScenePlayer from '@/components/global/story/scene/StoryScenePlayer';

// // async function fetchStoryGraph(
// //   languageId: string,
// //   sessionId: string,
// //   signal: AbortSignal
// // ): Promise<StoryGraphResponse> {
// //   const response = await fetch(
// //     `/api/client/story/${encodeURIComponent(sessionId)}?languageId=${encodeURIComponent(languageId)}`,
// //     {
// //       method: 'GET',
// //       signal,
// //       cache: 'no-store',
// //     }
// //   );

// //   if (!response.ok) {
// //     throw new Error('Could not load this story.');
// //   }

// //   const data: StoryGraphResponse = await response.json();

// //   console.log(data)

// //   return data;
// // }

// // export default function StoryPlayerPage() {
// //   const params = useParams<{
// //     languageId: string;
// //     sessionId: string;
// //   }>();

// //   const languageId = params.languageId;
// //   const sessionId = params.sessionId;

// //   const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
// //   const [dialogueIdx, setDialogueIdx] = useState(0);
// //   const [sceneEntryCount, setSceneEntryCount] = useState(0);
// //   const [navigationError, setNavigationError] = useState<string | null>(null);

// //   // Tracks nodes visited in this page session.
// //   const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(
// //     () => new Set()
// //   );

// //   // Prevents background refetches from resetting the learner's progress.
// //   const initializedSessionKey = useRef<string | null>(null);

// //   const {
// //     data,
// //     isPending,
// //     isError,
// //     error,
// //   } = useQuery<StoryGraphResponse, Error>({
// //     queryKey: ['story-graph', languageId, sessionId],
// //     enabled: Boolean(languageId && sessionId),
// //     queryFn: ({ signal }) =>
// //       fetchStoryGraph(languageId, sessionId, signal),
// //     staleTime: 30 * 60 * 1000, // 30 minutes
// //     refetchOnMount: true,
// //     refetchOnWindowFocus: true,
// //     retry: 1,
// //   });

// //   console.log(data)

// //   const graph = data?.graphNodes ?? [];

// //   // Build the lookup whenever the fetched graph changes.
// //   const nodesById = useMemo(() => {
// //     const lookup: Record<string, StoryScene> = {};

// //     for (const node of graph) {
// //       lookup[node.nodeId] = node;
// //     }

// //     return lookup;
// //   }, [graph]);

// //   const activeNode = activeNodeId
// //     ? nodesById[activeNodeId] ?? null
// //     : null;

// //   // Initialize the starting node once per language/story combination.
// //   useEffect(() => {
// //     if (!languageId || !sessionId || !graph.length) return;

// //     const sessionKey = `${languageId}:${sessionId}`;

// //     if (initializedSessionKey.current === sessionKey) return;

// //     const startingNode =
// //       graph.find((node) => node.type === 'starting') ?? graph[0];

// //     initializedSessionKey.current = sessionKey;

// //     // TODO: replace this initial-node selection with the saved
// //     // checkpoint once the learner progress API is connected.
// //     setActiveNodeId(startingNode.nodeId);
// //     setDialogueIdx(0);
// //     setSceneEntryCount(0);
// //     setNavigationError(null);
// //     setVisitedNodeIds(new Set([startingNode.nodeId]));
// //   }, [languageId, sessionId, graph]);

// //   // Navigate using the graph already in memory.
// //   const enterNode = useCallback(
// //     (nodeId: string) => {
// //       if (!nodesById[nodeId]) {
// //         setNavigationError(
// //           `Scenario "${nodeId}" was not found in this story.`
// //         );
// //         return;
// //       }

// //       setNavigationError(null);
// //       setActiveNodeId(nodeId);
// //       setDialogueIdx(0);
// //       setSceneEntryCount((count) => count + 1);

// //       setVisitedNodeIds((previous) => {
// //         const next = new Set(previous);
// //         next.add(nodeId);
// //         return next;
// //       });
// //     },
// //     [nodesById]
// //   );

// //   const advanceDialogue = useCallback(() => {
// //     if (!activeNode) return;

// //     const dialogue = activeNode.dialogue ?? [];

// //     // More dialogue remains in the current scenario.
// //     if (dialogueIdx < dialogue.length - 1) {
// //       setDialogueIdx((index) => index + 1);
// //       return;
// //     }

// //     // Follow the next node automatically for linear scenarios.
// //     if (activeNode.type === 'linear_next') {
// //       const nextChoice = activeNode.choices?.[0];

// //       if (nextChoice?.targetNodeId) {
// //         enterNode(nextChoice.targetNodeId);
// //       }
// //     }

// //     // Winning/losing endings should be handled by your existing
// //     // ending UI and result API logic.
// //   }, [activeNode, dialogueIdx, enterNode]);

// //   const selectChoice = useCallback(
// //     (targetNodeId: string) => {
// //       if (!nodesById[targetNodeId]) {
// //         setNavigationError(
// //           'The selected branch points to a missing scenario.'
// //         );
// //         return;
// //       }

// //       enterNode(targetNodeId);
// //     },
// //     [nodesById, enterNode]
// //   );

// //   if (isPending) {
// //     return (
// //       <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
// //         <p className="text-sm text-gray-500" role="status">
// //           Loading story...
// //         </p>
// //       </main>
// //     );
// //   }

// //   // Show the query error when no cached story data is available.
// //   if (isError && !data) {
// //     return (
// //       <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
// //         <section
// //           className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
// //           role="alert"
// //         >
// //           <h1 className="text-lg font-semibold text-gray-900">
// //             Unable to Load Story
// //           </h1>

// //           <p className="mt-2 text-sm leading-6 text-gray-600">
// //             We couldn&apos;t load this story right now.
// //             Please check your connection and try again.
// //           </p>

// //           <button
// //             type="button"
// //             onClick={() => window.location.reload()}
// //             className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
// //           >
// //             Try Again
// //           </button>
// //         </section>
// //       </main>
// //     );
// //   }

// //   if (!data?.graphNodes?.length) {
// //     return (
// //       <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
// //         <section
// //           className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
// //           role="status"
// //         >
// //           <div
// //             className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500"
// //             aria-hidden="true"
// //           >
// //             <svg
// //               xmlns="http://www.w3.org/2000/svg"
// //               width="28"
// //               height="28"
// //               viewBox="0 0 24 24"
// //               fill="none"
// //               stroke="currentColor"
// //               strokeWidth="1.5"
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //             >
// //               <path d="M8 6h13" />
// //               <path d="M8 12h13" />
// //               <path d="M8 18h13" />
// //               <path d="M3 6h.01" />
// //               <path d="M3 12h.01" />
// //               <path d="M3 18h.01" />
// //             </svg>
// //           </div>

// //           <h1 className="mt-4 text-lg font-semibold text-gray-900">
// //             No Story Scenario Available
// //           </h1>

// //           <p className="mt-2 text-sm leading-6 text-gray-600">
// //             This story doesn&apos;t have any scenarios available
// //             at the moment. Please try again later or contact
// //             your instructor if you believe this is an error.
// //           </p>
// //         </section>
// //       </main>
// //     );
// //   }

// //   if (navigationError) {
// //     return <p role="alert">{navigationError}</p>;
// //   }

// //   if (!activeNode) {
// //     return <p>No scenario is available.</p>;
// //   }

// //   return (
// //     <main className="w-full h-full">
// //       <StoryScenePlayer
// //         scene={activeNode}
// //         sceneEntryKey={`${languageId}:${sessionId}:${sceneEntryCount}:${activeNode.nodeId}`}
// //         dialogueIdx={dialogueIdx}
// //         onSelectNode={selectChoice}
// //         advanceDialogue={advanceDialogue}
// //       />
// //     </main>
// //   );
// // }

// 'use client';

// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { useParams } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';

// import type {
//   StoryGraphResponse,
//   StoryScene,
// } from '@/types/novel/scenario';

// import StoryScenePlayer from '@/components/global/story/scene/StoryScenePlayer';
// import { useStoryProgressStore } from '@/store/story/story-progress-store';

// interface ServerStoryProgress {
//   sessionId: string;
//   currentNodeId: string;
//   winCount: number;
//   lossCount: number;
// }

// async function fetchStoryGraph(
//   languageId: string,
//   sessionId: string,
//   signal: AbortSignal,
// ): Promise<StoryGraphResponse> {
//   const response = await fetch(
//     `/api/client/story/${encodeURIComponent(sessionId)}?languageId=${encodeURIComponent(languageId)}`,
//     {
//       method: 'GET',
//       signal,
//       cache: 'no-store',
//     },
//   );

//   if (!response.ok) {
//     throw new Error('Could not load this story.');
//   }

//   return response.json();
// }

// async function fetchStoryProgress(
//   sessionId: string,
//   signal: AbortSignal,
// ): Promise<ServerStoryProgress> {
//   const response = await fetch(
//     `/api/client/story/${encodeURIComponent(sessionId)}/progress`,
//     {
//       method: 'GET',
//       signal,
//       cache: 'no-store',
//     },
//   );

//   if (!response.ok) {
//     throw new Error('Could not load your story progress.');
//   }

//   return response.json();
// }

// async function saveStoryProgress(
//   sessionId: string,
//   currentNodeId: string,
//   options?: {
//     keepalive?: boolean;
//   },
// ): Promise<void> {
//   const response = await fetch(
//     `/api/client/story/${encodeURIComponent(sessionId)}/progress`,
//     {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       keepalive: options?.keepalive ?? false,
//       body: JSON.stringify({
//         currentNodeId,
//       }),
//     },
//   );

//   if (!response.ok) {
//     throw new Error('Could not save story progress.');
//   }
// }

// export default function StoryPlayerPage() {
//   const params = useParams<{
//     languageId: string;
//     sessionId: string;
//   }>();

//   const languageId = params.languageId;
//   const sessionId = params.sessionId;

//   const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
//   const [dialogueIdx, setDialogueIdx] = useState(0);
//   const [sceneEntryCount, setSceneEntryCount] = useState(0);
//   const [navigationError, setNavigationError] = useState<string | null>(null);

//   const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(
//     () => new Set(),
//   );

//   const initializedKeyRef = useRef<string | null>(null);
//   const inFlightRef = useRef(false);

//   // Zustand selectors.
//   const localProgress = useStoryProgressStore(
//     (state) => state.progress[sessionId],
//   );

//   const isDirty = useStoryProgressStore(
//     (state) => state.dirty[sessionId] ?? false,
//   );

//   const hydrateProgress = useStoryProgressStore(
//     (state) => state.hydrate,
//   );

//   const setCheckpoint = useStoryProgressStore(
//     (state) => state.setCheckpoint,
//   );

//   const markClean = useStoryProgressStore(
//     (state) => state.markClean,
//   );

//   // --------------------------------------------------
//   // Story graph query
//   // --------------------------------------------------

//   const {
//     data: storyData,
//     isPending: graphPending,
//     isError: graphError,
//     error: graphErrorValue,
//     refetch: refetchGraph,
//   } = useQuery<StoryGraphResponse, Error>({
//     queryKey: ['story-graph', languageId, sessionId],
//     enabled: Boolean(languageId && sessionId),
//     queryFn: ({ signal }) =>
//       fetchStoryGraph(languageId, sessionId, signal),
//     staleTime: 30 * 60 * 1000,
//     refetchOnWindowFocus: true,
//     retry: 1,
//   });

//   // --------------------------------------------------
//   // Initial progress query
//   // --------------------------------------------------

//   const {
//     data: serverProgress,
//     isPending: progressPending,
//     isError: progressError,
//     error: progressErrorValue,
//     refetch: refetchProgress,
//   } = useQuery<ServerStoryProgress, Error>({
//     queryKey: ['story-progress', sessionId],
//     enabled: Boolean(sessionId),
//     queryFn: ({ signal }) =>
//       fetchStoryProgress(sessionId, signal),
//     staleTime: 0,
//     refetchOnWindowFocus: false,
//     retry: 1,
//   });

//   const graph = storyData?.graphNodes ?? [];

//   const nodesById = useMemo(() => {
//     const lookup: Record<string, StoryScene> = {};

//     for (const node of graph) {
//       lookup[node.nodeId] = node;
//     }

//     return lookup;
//   }, [graph]);

//   const startingNode = useMemo(
//     () =>
//       graph.find((node) => node.type === 'starting') ??
//       graph[0] ??
//       null,
//     [graph],
//   );

//   const activeNode = activeNodeId
//     ? nodesById[activeNodeId] ?? null
//     : null;

//   // --------------------------------------------------
//   // Hydrate Zustand from the server
//   // --------------------------------------------------

//   useEffect(() => {
//     if (!serverProgress || !sessionId) return;

//     hydrateProgress({
//       sessionId: serverProgress.sessionId,
//       currentNodeId: serverProgress.currentNodeId,
//       winCount: serverProgress.winCount,
//       lossCount: serverProgress.lossCount,
//     });
//   }, [serverProgress, sessionId, hydrateProgress]);

//   // --------------------------------------------------
//   // Initialize the player only after both queries finish
//   // --------------------------------------------------

//   useEffect(() => {
//     if (
//       graphPending ||
//       progressPending ||
//       graphError ||
//       progressError ||
//       !graph.length ||
//       !startingNode
//     ) {
//       return;
//     }

//     const initializationKey = `${languageId}:${sessionId}`;

//     if (initializedKeyRef.current === initializationKey) {
//       return;
//     }

//     const currentLocalProgress =
//       useStoryProgressStore.getState().progress[sessionId];

//     // Dirty local progress wins over server progress.
//     const savedNodeId = currentLocalProgress?.currentNodeId;

//     const initialNode =
//       (savedNodeId ? nodesById[savedNodeId] : undefined) ??
//       startingNode;

//     initializedKeyRef.current = initializationKey;

//     setActiveNodeId(initialNode.nodeId);
//     setDialogueIdx(0);
//     setSceneEntryCount(0);
//     setNavigationError(null);
//     setVisitedNodeIds(new Set([initialNode.nodeId]));

//     // If the saved node no longer exists, correct the checkpoint.
//     if (savedNodeId && !nodesById[savedNodeId]) {
//       setCheckpoint(sessionId, initialNode.nodeId);
//     }
//   }, [
//     languageId,
//     sessionId,
//     graph,
//     nodesById,
//     startingNode,
//     graphPending,
//     progressPending,
//     graphError,
//     progressError,
//     setCheckpoint,
//   ]);

//   // --------------------------------------------------
//   // Enter a node and update the local checkpoint
//   // --------------------------------------------------

//   const enterNode = useCallback(
//     (nodeId: string) => {
//       if (!nodesById[nodeId]) {
//         setNavigationError(
//           `Scenario "${nodeId}" was not found in this story.`,
//         );
//         return;
//       }

//       setNavigationError(null);
//       setActiveNodeId(nodeId);
//       setDialogueIdx(0);
//       setSceneEntryCount((count) => count + 1);

//       setVisitedNodeIds((previous) => {
//         const next = new Set(previous);
//         next.add(nodeId);
//         return next;
//       });

//       // Local update only; the autosave effect persists it later.
//       setCheckpoint(sessionId, nodeId);
//     },
//     [nodesById, sessionId, setCheckpoint],
//   );

//   // --------------------------------------------------
//   // Advance dialogue and handle linear nodes
//   // --------------------------------------------------

//   const advanceDialogue = useCallback(() => {
//     if (!activeNode) return;

//     const dialogue = activeNode.dialogue ?? [];

//     if (dialogueIdx < dialogue.length - 1) {
//       setDialogueIdx((index) => index + 1);
//       return;
//     }

//     if (activeNode.type === 'linear_next') {
//       const nextNodeId = activeNode.choices?.[0]?.targetNodeId;

//       if (nextNodeId) {
//         enterNode(nextNodeId);
//       }

//       return;
//     }

//     // Ending processing will be connected to the result API separately.
//     // Do not count wins/losses just because the final line was clicked.
//   }, [activeNode, dialogueIdx, enterNode]);

//   const selectChoice = useCallback(
//     (targetNodeId: string) => {
//       if (!nodesById[targetNodeId]) {
//         setNavigationError(
//           'The selected branch points to a missing scenario.',
//         );
//         return;
//       }

//       enterNode(targetNodeId);
//     },
//     [nodesById, enterNode],
//   );

//   // --------------------------------------------------
//   // Save dirty progress
//   // --------------------------------------------------

//   const saveProgress = useCallback(
//     async (keepalive = false) => {
//       if (!sessionId || inFlightRef.current) return;

//       const state = useStoryProgressStore.getState();

//       if (!state.dirty[sessionId]) return;

//       const snapshot = state.progress[sessionId];

//       if (!snapshot) return;

//       inFlightRef.current = true;

//       try {
//         await saveStoryProgress(
//           sessionId,
//           snapshot.currentNodeId,
//           { keepalive },
//         );

//         // Do not mark clean if the player moved to another node
//         // while this request was running.
//         const latest = useStoryProgressStore.getState();
//         const latestProgress = latest.progress[sessionId];

//         if (
//           latestProgress?.currentNodeId === snapshot.currentNodeId
//         ) {
//           markClean(sessionId);
//         }
//       } catch (error) {
//         // Leave dirty=true so a future save can retry.
//         console.error('Story progress save failed:', error);
//       } finally {
//         inFlightRef.current = false;
//       }
//     },
//     [sessionId, markClean],
//   );

//   // Autosave every 30 seconds and when the page is hidden.
//   useEffect(() => {
//     if (!sessionId) return;

//     const intervalId = window.setInterval(() => {
//       void saveProgress();
//     }, 30_000);

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'hidden') {
//         void saveProgress(true);
//       }
//     };

//     const handlePageHide = () => {
//       void saveProgress(true);
//     };

//     document.addEventListener(
//       'visibilitychange',
//       handleVisibilityChange,
//     );

//     window.addEventListener('pagehide', handlePageHide);

//     return () => {
//       window.clearInterval(intervalId);

//       document.removeEventListener(
//         'visibilitychange',
//         handleVisibilityChange,
//       );

//       window.removeEventListener('pagehide', handlePageHide);

//       // Best-effort cleanup save. The browser may terminate this request.
//       void saveProgress(true);
//     };
//   }, [sessionId, saveProgress]);

//   // --------------------------------------------------
//   // Loading and error states
//   // --------------------------------------------------

//   if (graphPending || progressPending) {
//     return (
//       <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
//         <p className="text-sm text-gray-500" role="status">
//           Loading story...
//         </p>
//       </main>
//     );
//   }

//   if (graphError || progressError) {
//     return (
//       <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
//         <section
//           className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm"
//           role="alert"
//         >
//           <h1 className="text-lg font-semibold text-gray-900">
//             Unable to Load Story
//           </h1>

//           <p className="mt-2 text-sm leading-6 text-gray-600">
//             {graphError
//               ? graphErrorValue?.message
//               : progressErrorValue?.message}
//           </p>

//           <button
//             type="button"
//             onClick={() => {
//               void refetchGraph();
//               void refetchProgress();
//             }}
//             className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
//           >
//             Try Again
//           </button>
//         </section>
//       </main>
//     );
//   }

//   if (!graph.length) {
//     return (
//       <main className="flex min-h-[60vh] w-full items-center justify-center p-6">
//         <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
//           <h1 className="text-lg font-semibold text-gray-900">
//             No Story Scenario Available
//           </h1>

//           <p className="mt-2 text-sm leading-6 text-gray-600">
//             This story has no available scenarios.
//           </p>
//         </section>
//       </main>
//     );
//   }

//   if (navigationError) {
//     return <p role="alert">{navigationError}</p>;
//   }

//   if (!activeNode) {
//     return (
//       <p role="status">
//         Preparing story...
//       </p>
//     );
//   }

//   return (
//     <main className="h-full w-full">
//       <StoryScenePlayer
//         scene={activeNode}
//         sceneEntryKey={`${languageId}:${sessionId}:${sceneEntryCount}:${activeNode.nodeId}`}
//         dialogueIdx={dialogueIdx}
//         onSelectNode={selectChoice}
//         advanceDialogue={advanceDialogue}
//       />
//     </main>
//   );
// }

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import StoryScenePlayer from '@/components/global/story/scene/StoryScenePlayer';
import type {
  StoryGraphResponse,
  StoryScene,
} from '@/types/novel/scenario';

import { useStoryProgressStore } from '@/store/story/story-progress-store';
import type { StoryOutcome } from '@/store/story/story-progress-store';

const AUTOSAVE_INTERVAL = 30_000;

interface ProgressResponse {
  sessionId: string;
  currentNodeId: string;
  winCount: number;
  lossCount: number;
}

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

export default function StoryPlayerPage() {
  const { languageId, sessionId } = useParams<{
    languageId: string;
    sessionId: string;
  }>();

  const baseUrl = `/api/client/story/${sessionId}`;

  // Zustand selectors
  // const progress = useStoryProgressStore(
  //   (state) => state.progress[sessionId],
  // );

  // const isDirty = useStoryProgressStore(
  //   (state) => state.dirty[sessionId] ?? false,
  // );

  const setCheckpoint = useStoryProgressStore(
    (state) => state.setCheckpoint,
  );

  const hydrate = useStoryProgressStore(
    (state) => state.hydrate,
  );

  const recordOutcome = useStoryProgressStore(
    (state) => state.recordOutcome,
  );

  const markClean = useStoryProgressStore(
    (state) => state.markClean,
  );

  // Page state
  const [activeNodeId, setActiveNodeId] = useState('');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [sceneEntryCount, setSceneEntryCount] = useState(0);
  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([]);
  const [navigationError, setNavigationError] = useState<string | null>(
    null,
  );
  const [initialized, setInitialized] = useState(false);

  // Refs prevent duplicate work.
  const initializedKeyRef = useRef('');
  const handledEndingRef = useRef('');
  const saveInFlightRef = useRef(false);
  const outcomeInFlightRef = useRef(false);
  const pendingOutcomeRef = useRef<{
    outcome: StoryOutcome;
    endingNodeId: string;
  } | null>(null);

  // Fetch the story graph.
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

  // Fetch the user's saved progress.
  const progressQuery = useQuery({
    queryKey: ['story-progress', sessionId],
    queryFn: () =>
      fetchJson<ProgressResponse>(`${baseUrl}/progress`),
    enabled: Boolean(sessionId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const graph = graphQuery.data?.graphNodes ?? [];

  const nodesById = useMemo(
    () => new Map<string, StoryScene>(
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

  // Hydrate from the database without marking the data dirty.
  useEffect(() => {
    if (!progressQuery.data) return;

    hydrate(progressQuery.data);
  }, [progressQuery.data, hydrate]);

  // Restore the checkpoint once both queries have completed.
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
    setInitialized(true);

    // Create initial local progress if the API returned no record.
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

  // Navigate to a node and update local progress.
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

  // Persist ordinary checkpoints only when dirty.
  // const saveProgress = useCallback(
  //   async (keepalive = false) => {
  //     if (outcomeInFlightRef.current) return;

  //     const store = useStoryProgressStore.getState();
  //     const current = store.progress[sessionId];

  //     if (
  //       !current ||
  //       !store.dirty[sessionId] ||
  //       saveInFlightRef.current
  //     ) {
  //       return;
  //     }

  //     saveInFlightRef.current = true;

  //     const snapshot = {
  //       currentNodeId: current.currentNodeId,
  //       winCount: current.winCount,
  //       lossCount: current.lossCount,
  //     };

  //     try {
  //       const response = await fetch(
  //         `${baseUrl}/progress`,
  //         {
  //           method: 'PUT',
  //           cache: 'no-store',
  //           keepalive,
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             currentNodeId: snapshot.currentNodeId,
  //           }),
  //         },
  //       );

  //       if (!response.ok) {
  //         throw new Error(`Save failed (${response.status})`);
  //       }

  //       const latest =
  //         useStoryProgressStore.getState().progress[sessionId];

  //       // A newer change must remain dirty.
  //       if (
  //         latest &&
  //         latest.currentNodeId === snapshot.currentNodeId &&
  //         latest.winCount === snapshot.winCount &&
  //         latest.lossCount === snapshot.lossCount
  //       ) {
  //         markClean(sessionId);
  //       }
  //     } catch (error) {
  //       // Keep dirty=true so the next autosave can retry.
  //       console.error('Checkpoint save failed:', error);
  //     } finally {
  //       saveInFlightRef.current = false;
  //     }
  //   },
  //   [baseUrl, sessionId, markClean],
  // );
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

        // The local checkpoint changed while the save was running.
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

  // Retry a pending ending outcome when the autosave timer runs.
  // const retryPendingOutcome = useCallback(async () => {
  //   const pending = pendingOutcomeRef.current;

  //   if (!pending || outcomeInFlightRef.current) return;

  //   outcomeInFlightRef.current = true;

  //   try {
  //     const response = await fetch(
  //       `${baseUrl}/progress/outcome`,
  //       {
  //         method: 'POST',
  //         cache: 'no-store',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(pending),
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Outcome save failed (${response.status})`);
  //     }

  //     // Clear only the outcome that was successfully sent.
  //     if (pendingOutcomeRef.current === pending) {
  //       pendingOutcomeRef.current = null;
  //     }

  //     const latest =
  //       useStoryProgressStore.getState().progress[sessionId];

  //     if (latest) {
  //       markClean(sessionId);
  //     }
  //   } catch (error) {
  //     console.error('Outcome save failed; will retry:', error);
  //   } finally {
  //     outcomeInFlightRef.current = false;
  //   }
  // }, [baseUrl, sessionId, markClean]);
  const retryPendingOutcome = useCallback(async () => {
    const pending = pendingOutcomeRef.current;

    if (!pending || outcomeInFlightRef.current) return;

    // Never submit while a checkpoint save is still running.
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
        throw new Error(`Outcome save failed (${response.status})`);
      }

      const saved: ProgressResponse = await response.json();

      if (pendingOutcomeRef.current !== pending) return;

      pendingOutcomeRef.current = null;

      const store = useStoryProgressStore.getState();

      // The API response is authoritative for the checkpoint and counts.
      store.markClean(sessionId);
      store.hydrate(saved);

      setActiveNodeId(saved.currentNodeId);
      setDialogueIdx(0);
      setSceneEntryCount((count) => count + 1);
      setVisitedNodeIds([saved.currentNodeId]);
      setNavigationError(null);
    } catch (error) {
      // Keep the pending outcome so the timer can retry it.
      console.error('Outcome save failed; will retry:', error);
    } finally {
      outcomeInFlightRef.current = false;
    }
  }, [baseUrl, sessionId]);


  // Handle an ending: update the UI immediately, then persist the outcome.
  // const finishStory = useCallback(
  //   async (outcome: StoryOutcome, endingNodeId: string) => {
  //     if (!startingNode || outcomeInFlightRef.current) return;

  //     const endingKey =
  //       `${sessionId}:${endingNodeId}:${sceneEntryCount}`;

  //     if (handledEndingRef.current === endingKey) return;

  //     handledEndingRef.current = endingKey;

  //     const pending = { outcome, endingNodeId };
  //     pendingOutcomeRef.current = pending;

  //     // Update Zustand immediately: reset checkpoint and increment count.
  //     recordOutcome(sessionId, startingNode.nodeId, outcome);

  //     // Reset the visible scene to the starting node.
  //     setActiveNodeId(startingNode.nodeId);
  //     setDialogueIdx(0);
  //     setSceneEntryCount((count) => count + 1);

  //     setVisitedNodeIds((previous) =>
  //       previous.includes(startingNode.nodeId)
  //         ? previous
  //         : [...previous, startingNode.nodeId],
  //     );

  //     await retryPendingOutcome();
  //   },
  //   [
  //     sessionId,
  //     startingNode,
  //     sceneEntryCount,
  //     recordOutcome,
  //     retryPendingOutcome,
  //   ],
  // );
  const finishStory = useCallback(
    async (outcome: StoryOutcome, endingNodeId: string) => {
      if (!startingNode || outcomeInFlightRef.current) return;

      const endingKey =
        `${sessionId}:${endingNodeId}:${sceneEntryCount}`;

      if (handledEndingRef.current === endingKey) return;

      // Make sure the database knows the player reached this ending.
      const checkpointSaved = await saveProgress();

      if (!checkpointSaved) {
        setNavigationError(
          'Unable to save the ending checkpoint. Please try again.',
        );
        return;
      }

      handledEndingRef.current = endingKey;

      pendingOutcomeRef.current = {
        outcome,
        endingNodeId,
      };

      await retryPendingOutcome();
    },
    [
      sessionId,
      startingNode,
      sceneEntryCount,
      saveProgress,
      retryPendingOutcome,
    ],
  );

  // Advance dialogue, follow linear nodes, or process endings.
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

    // Normal nodes with choices wait for the player to select one.
  }, [activeNode, dialogueIdx, finishStory, enterNode]);

  const selectChoice = useCallback(
    (nodeId: string) => {
      enterNode(nodeId);
    },
    [enterNode],
  );

  // One timer per mounted page; no continuous polling.
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
      // Outcome retries on pagehide are not guaranteed to finish.
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
  }, [
    initialized,
    saveProgress,
    retryPendingOutcome,
  ]);

  // 1. Still fetching data.
  if (graphQuery.isPending || progressQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading story...
      </div>
    );
  }

  // 2. A request failed.
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

  // 3. The graph loaded successfully but has no nodes.
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

  // 4. Data is loaded, but checkpoint initialization hasn't finished.
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading story...
      </div>
    );
  }

  // 5. The graph has nodes, but the active node couldn't be resolved.
  if (!activeNode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        No story node is available.
      </div>
    );
  }

  return (
  <main className="relative w-full h-full">
    {navigationError && (
      <p role="alert" className="p-2 text-sm text-red-500">
        {navigationError}
      </p>
    )}

    <StoryScenePlayer
      scene={activeNode}
      sceneEntryKey={`${languageId}:${sessionId}:${sceneEntryCount}:${activeNode.nodeId}`}
      dialogueIdx={dialogueIdx}
      onSelectNode={selectChoice}
      advanceDialogue={advanceDialogue}
    />
  </main>
);
}
