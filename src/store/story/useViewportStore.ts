// src/store/novel/useViewportStore.ts
import { create } from 'zustand';

interface ViewportState {
  pan: { x: number; y: number };
  zoom: number;
  isDraggingCanvas: boolean;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setIsDraggingCanvas: (isDragging: boolean) => void;
  centerOnWorld: (wx: number, wy: number) => void;
}

export const useViewportStore = create<ViewportState>((set) => ({
  pan: { x: 150, y: 150 },
  zoom: 1.0,
  isDraggingCanvas: false,

  setPan: (panOrFn) =>
    set((state) => ({
      pan: typeof panOrFn === 'function' ? panOrFn(state.pan) : panOrFn,
    })),

  setZoom: (zoomOrFn) =>
    set((state) => ({
      zoom: typeof zoomOrFn === 'function' ? zoomOrFn(state.zoom) : zoomOrFn,
    })),

  setIsDraggingCanvas: (isDraggingCanvas) => set({ isDraggingCanvas }),

  centerOnWorld: (wx, wy) => {
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 600;
    set((state) => ({
      pan: {
        x: screenW / 2 - wx * state.zoom,
        y: screenH / 2 - wy * state.zoom,
      },
    }));
  },
}));