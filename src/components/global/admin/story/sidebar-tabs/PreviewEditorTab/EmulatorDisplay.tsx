'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ScenarioNode } from '@/types/novel/scenario';

interface EmulatorDisplayProps {
  activeNode: ScenarioNode;
  fx: { backgroundClass: string; characterClass: string };
  dialogueIdx: number;
  isModal: boolean;
  onSelectNode: (id: string | null) => void;
  advanceDialogue: () => void;
}

const TYPEWRITER_SPEED = 30;
const BACKGROUND_TRANSITION_DURATION = 450;
const CHARACTER_FADE_DURATION = 180;
const CHARACTER_FADE_OUT_DELAY = 100;

export default function EmulatorDisplay({
  activeNode,
  fx,
  dialogueIdx,
  isModal,
  onSelectNode,
  advanceDialogue,
}: EmulatorDisplayProps) {
  const dialogueText = activeNode.dialogue[dialogueIdx] || '...';

  // --------------------------------------------------
  // 1. DIALOGUE TYPEWRITER EFFECT
  // --------------------------------------------------

  const [visibleChars, setVisibleChars] = useState(0);
  const [isTyping, setIsTyping] = useState(
    () => dialogueText.length > 0
  );

  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setVisibleChars(0);
    setIsTyping(dialogueText.length > 0);

    if (!dialogueText.length) {
      return;
    }

    let currentChar = 0;

    typingIntervalRef.current = setInterval(() => {
      currentChar += 1;
      setVisibleChars(currentChar);

      if (currentChar >= dialogueText.length) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }

        setIsTyping(false);
      }
    }, TYPEWRITER_SPEED);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [activeNode, dialogueIdx, dialogueText]);

  const handleDialogueClick = () => {
    // First click: reveal the entire current line.
    if (isTyping) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }

      setVisibleChars(dialogueText.length);
      setIsTyping(false);
      return;
    }

    // Next click: continue to the next line or event.
    advanceDialogue();
  };

  // Show choices only after the final dialogue has finished typing.
  const isAtDialogueEnd =
    dialogueIdx === activeNode.dialogue.length - 1;

  const showChoicesOverlay =
    !isTyping &&
    isAtDialogueEnd &&
    !!activeNode.choices?.length;

  // --------------------------------------------------
  // 2. HORIZONTAL BACKGROUND TRANSITION
  // --------------------------------------------------

  const nextBackground = activeNode.bgImage || null;

  const backgroundRef = useRef<string | null>(nextBackground);

  const [displayedBackground, setDisplayedBackground] =
    useState<string | null>(nextBackground);

  const [previousBackground, setPreviousBackground] =
    useState<string | null>(null);

  const [isBackgroundTransitioning, setIsBackgroundTransitioning] =
    useState(false);

  const [backgroundSlideStarted, setBackgroundSlideStarted] =
    useState(true);

  useEffect(() => {
    const next = activeNode.bgImage || null;

    if (backgroundRef.current === next) {
      return;
    }

    const previous = backgroundRef.current;

    backgroundRef.current = next;

    setPreviousBackground(previous);
    setDisplayedBackground(next);
    setIsBackgroundTransitioning(true);
    setBackgroundSlideStarted(false);

    // Give the browser a moment to render the starting positions.
    const startTimer = setTimeout(() => {
      setBackgroundSlideStarted(true);
    }, 20);

    const finishTimer = setTimeout(() => {
      setPreviousBackground(null);
      setIsBackgroundTransitioning(false);
    }, BACKGROUND_TRANSITION_DURATION + 30);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [activeNode.bgImage]);

  // --------------------------------------------------
  // 3. CHARACTER FADE TRANSITION
  // --------------------------------------------------

  const nextCharacter = activeNode.characterImage || null;

  const characterRef = useRef<string | null>(nextCharacter);

  const [displayedCharacter, setDisplayedCharacter] =
    useState<string | null>(nextCharacter);

  const [characterVisible, setCharacterVisible] = useState(true);

  useEffect(() => {
    const next = activeNode.characterImage || null;

    if (characterRef.current === next) {
      return;
    }

    characterRef.current = next;
    setCharacterVisible(false);

    const swapTimer = setTimeout(() => {
      setDisplayedCharacter(next);
      setCharacterVisible(true);
    }, CHARACTER_FADE_OUT_DELAY);

    return () => clearTimeout(swapTimer);
  }, [activeNode.characterImage]);

  // --------------------------------------------------
  // 4. RENDER
  // --------------------------------------------------

  return (
    <div className="relative bg-black overflow-hidden flex flex-col justify-end transition-all duration-300 w-full h-full">

      {/* Background: old image slides out, new image slides in */}
      {isBackgroundTransitioning && previousBackground && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center ${fx.backgroundClass}
            transition-transform duration-[450ms] ease-in-out ${
              backgroundSlideStarted
                ? '-translate-x-full'
                : 'translate-x-0'
            }`}
          style={{
            backgroundImage: `url(${previousBackground})`,
          }}
        />
      )}

      <div
        className={`absolute inset-0 bg-cover bg-center ${fx.backgroundClass} ${
          isBackgroundTransitioning
            ? `transition-transform duration-[450ms] ease-in-out ${
                backgroundSlideStarted
                  ? 'translate-x-0'
                  : 'translate-x-full'
              }`
            : ''
        }`}
        style={{
          backgroundImage: displayedBackground
            ? `url(${displayedBackground})`
            : 'none',
        }}
      />

      {/* Character: quick fade out and fade in */}
      {displayedCharacter && (
        <img
          src={displayedCharacter}
          alt="Actor Frame"
          className={`absolute bottom-14 left-1/2 -translate-x-1/2 object-contain pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)] z-10 transition-opacity duration-[180ms] ease-in-out ${
            isModal ? 'h-64' : 'h-24'
          } ${
            showChoicesOverlay
              ? 'opacity-30 blur-[1px]'
              : characterVisible
                ? 'opacity-100'
                : 'opacity-0'
          } ${fx.characterClass}`}
        />
      )}

      {/* Choices */}
      {showChoicesOverlay && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-4 gap-2">
          <div className="w-full flex flex-col gap-1.5 overflow-y-auto max-h-[70%] pr-1 scrollbar-none justify-center items-center">
            {activeNode.choices!.map((choice: any, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();

                  if (choice.targetNodeId) {
                    onSelectNode(choice.targetNodeId);
                  }
                }}
                className={`w-full max-w-md text-center bg-slate-900/90 hover:bg-indigo-600 text-slate-100 border border-slate-700 hover:border-indigo-400 rounded-md shadow-xl backdrop-blur-md transition-all ${
                  isModal
                    ? 'py-2 px-4 text-[12px]'
                    : 'py-1 px-2 text-[8px]'
                }`}
              >
                {choice.text || `Option ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue box */}
      <div
        onClick={handleDialogueClick}
        className={`m-2 p-2 bg-slate-950/95 backdrop-blur-sm border border-slate-800/80 rounded-lg flex flex-col justify-between z-20 cursor-pointer relative ${
          isModal ? 'min-h-[70px]' : 'min-h-[44px]'
        } ${showChoicesOverlay ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <div
          className={`font-bold text-indigo-400 uppercase tracking-wide truncate ${
            isModal ? 'text-[11px]' : 'text-[8px]'
          }`}
        >
          {activeNode.title || 'Speaker Character'}
        </div>

        <div
          className={`text-slate-200 leading-normal font-sans line-clamp-2 pr-4 ${
            isModal ? 'text-[12px] mt-0.5' : 'text-[9px]'
          }`}
        >
          {dialogueText.slice(0, visibleChars)}
          {isTyping && (
            <span className="inline-block w-[1px] h-[1em] ml-[1px] bg-indigo-400 animate-pulse align-middle" />
          )}
        </div>

        {!isAtDialogueEnd && !isTyping && (
          <ChevronRight
            className={`text-indigo-400 absolute bottom-1.5 right-1.5 animate-pulse ${
              isModal ? 'w-4 h-4' : 'w-2.5 h-2.5'
            }`}
          />
        )}
      </div>
    </div>
  );
}
