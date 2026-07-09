// src/types/index.ts

export type RoutePathType = 'normal' | 'linear_next' | 'winning_ending' | 'deadend';

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
  dialogue: string[];
  x: number;
  y: number;
  choices: ChoicePath[];
}

export interface GraphState {
  [key: string]: ScenarioNode;
}

export interface AssetRecord {
  id?: number;
  name: string;
  rowType: 'background_image' | 'character_figure' | 'background_sound' | 'sound_effect';
  fileBlob: File;
  timestamp: number;
}