// src/utils/transitions.ts
import { ScenarioNode } from '@/types/novel/scenario';

export interface TransitionStyles {
  characterClass: string;
  backgroundClass: string;
}

/**
 * Computes CSS animation classes dynamically by evaluating the structural delta 
 * between the previous timeline node and the active tracking segment node.
 */
export function computeVisualTransitions(
  prevNode: ScenarioNode | null,
  activeNode: ScenarioNode
): TransitionStyles {
  // 1. Core Default Rules Configuration
  let characterClass = "transition-all duration-500 ease-in-out";
  let backgroundClass = "transition-all duration-700 ease-in-out";

  // 2. Character Frame Evaluation Logic
  if (!prevNode || prevNode.characterImage !== activeNode.characterImage) {
    // Brand new character entity detected or actor completely changed -> Fade In Sequence
    characterClass += " animate-fade-in";
  } else {
    // Consistent actor sequence -> Static retainment state without firing re-render flashes
    characterClass += " opacity-100 scale-100";
  }

  // 3. Background Texture Sliding Evaluation Logic
  if (prevNode && prevNode.bgImage !== activeNode.bgImage && activeNode.bgImage) {
    // Different asset background texture mapped -> Slide Left Vector transition sequence
    backgroundClass += " animate-slide-left";
  } else {
    backgroundClass += " opacity-100";
  }

  return {
    characterClass,
    backgroundClass,
  };
}