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


export interface StorySceneChoice {
  text: string;
  targetNodeId: string;
}

export interface StoryScene {
  nodeId: string;
  title: string;
  type: string;
  bgImage: string;
  characterImage: string;
  bgMusic: string;
  sfx: string;
  dialogue: string[];
  choices: StorySceneChoice[];
}

export interface StoryGraphResponse {
  id: string;
  title: string | null;
  graphNodes: StoryScene[];
}