// src/types/scenario.ts

export type RoutePathType = 'starting'|'normal' | 'linear_next' | 'winning_ending' | 'deadend';

export interface ChoicePath {
  text: string;
  targetNodeId: string;
}

export interface ScenarioNode {
  id: string;
  title: string;
  type: RoutePathType;
  bgImage: string;
  characterImage: string;
  bgMusic: string;
  sfx: string;
  dialogue: string[];
  x: number;
  y: number;
  choices: ChoicePath[];
}

export interface GraphState {
  [key: string]: ScenarioNode;
}

// w-50 aspect-9/16 max-h-100px

// full view
// const modalViewportSizing: Record<PlatformViewport, string> = {
//   mobile: 'w-[320px] h-[95%] max-h-[580px] border-x-8 border-t-[24px] border-b-[24px] border-slate-800 rounded-[2rem]',
//   desktop: 'w-[90%] max-w-5xl aspect-[16/9] max-h-[100%] border-4 border-slate-800 rounded-xl'
// };

// <DialogContent className=" min-w-[90vw]  h-[90vh]  bg-[#090d16] border-[#161f38] text-slate-100 p-0 flex flex-col focus:outline-none overflow-hidden gap-0">