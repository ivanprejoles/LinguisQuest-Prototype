import { ScenarioNode } from '@/types/novel/scenario';

export interface TransitionStyles {
  characterClass: string;
  backgroundClass: string;
}

export function computeVisualTransitions(
  prevNode: ScenarioNode | null,
  activeNode: ScenarioNode
): TransitionStyles {
  let characterClass = "transition-all duration-500 ease-in-out";
  let backgroundClass = "transition-all duration-700 ease-in-out";

  if (!prevNode || prevNode.characterImage !== activeNode.characterImage) {
    characterClass += " animate-fade-in";
  } else {
    characterClass += " opacity-100 scale-100";
  }

  if (prevNode && prevNode.bgImage !== activeNode.bgImage && activeNode.bgImage) {
    backgroundClass += " animate-slide-left";
  } else {
    backgroundClass += " opacity-100";
  }

  return {
    characterClass,
    backgroundClass,
  };
}