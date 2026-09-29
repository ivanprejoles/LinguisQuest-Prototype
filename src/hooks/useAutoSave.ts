// src/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useNodeStore } from '@/store/story/useNodeStore';

export function useAutoSave(sessionId: string, intervalMs: number = 30000) {
  const saveNodeToCloud = useNodeStore((state) => state.saveNodesToCloud);
  const hasUnsavedChanges = useNodeStore((state) => state.hasUnsavedChanges);
  
  // Cache the latest active state configurations so asynchronous event references stay valid
  const stateRef = useRef({ saveNodeToCloud, hasUnsavedChanges, sessionId });

  useEffect(() => {
    stateRef.current = { saveNodeToCloud, hasUnsavedChanges, sessionId };
  }, [saveNodeToCloud, hasUnsavedChanges, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    // 1. STANDARD INTERVAL LOOP (Every 30 seconds)
    const interval = setInterval(() => {
      const { hasUnsavedChanges, saveNodeToCloud, sessionId } = stateRef.current;
      if (hasUnsavedChanges) {
        console.log("[Auto-Save]: 30s Interval fired. Syncing changes...");
        saveNodeToCloud(sessionId);
      }
    }, intervalMs);

    // 2. BROWSER UNLOAD GUARD (Tab Close / Reload / External Links)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { hasUnsavedChanges, saveNodeToCloud, sessionId } = stateRef.current;
      
      if (hasUnsavedChanges) {
        // Option A: Fire a background fetch beacon so the data saves even as the browser closes
        saveNodeToCloud(sessionId);
        
        // Option B: Standard browser prompt warning the user they have modifications
        e.preventDefault();
        e.returnValue = "You have unsaved workspace changes.";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 3. REACT LAYER CLEANUP (Component unmount, redirecting to another internal page)
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      const { hasUnsavedChanges, saveNodeToCloud, sessionId } = stateRef.current;
      if (hasUnsavedChanges) {
        console.log("[Auto-Save]: Component unmounting/destroying state. Performing emergency flush save...");
        saveNodeToCloud(sessionId);
      }
    };
  }, [intervalMs, sessionId]);
}