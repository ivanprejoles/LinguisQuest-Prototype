
'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useStorySceneAudio } from './useStorySceneAudio';
import { StoryScene } from '@/types/novel/scenario';

type PlatformViewport = 'mobile' | 'tablet' | 'desktop';

interface StoryScenePlayerProps {
  scene: StoryScene;
  sceneEntryKey: string;
  fx?: {
    backgroundClass: string;
    characterClass: string;
  };
  viewport?: PlatformViewport;
  dialogueIdx: number;
  isModal?: boolean;
  audioEnabled?: boolean;
  onSelectNode: (nodeId: string) => void;
  advanceDialogue: () => void;
}

/**
 * Tune these values while testing the visual novel.
 *
 * Background position:
 *   '50% 50%' = centered
 *   '50% 35%' = show more of the upper image
 *
 * Character position is relative to the scene viewport.
 */
export const SCENE_STYLE = {
  background: {
    fit: 'cover' as const,
    position: '50% 50%',
    transitionMs: 450,
  },

  character: {
    width: '42%',
    maxWidth: '680px',
    maxHeight: '88%',
    bottom: 'clamp(3.5rem, 10vh, 7rem)',
    left: '50%',
    fadeMs: 180,
  },

  dialogue: {
    panelMaxWidth: '56rem',
    textMaxWidth: '48rem',
    panelMaxHeight: '32%',
    paddingX: 'clamp(12px, 2vw, 28px)',
    paddingY: 'clamp(10px, 1.5vw, 22px)',
    titleFontSize: 'clamp(10px, 0.85vw, 14px)',
    fontSize: 'clamp(15px, 1.15vw, 22px)',
    longTextFontSize: 'clamp(13px, 0.95vw, 18px)',
    veryLongTextFontSize: 'clamp(12px, 0.85vw, 16px)',
    lineHeight: 1.55,
  },

  choices: {
    maxWidth: '34rem',
  },

  typewriter: {
    // Milliseconds per character.
    speedMs: 30,
  },
};

const EMPTY_FX = {
  backgroundClass: '',
  characterClass: '',
};

const BG_TRANSITION_MS = SCENE_STYLE.background.transitionMs;
const CHARACTER_FADE_MS = SCENE_STYLE.character.fadeMs;

function StoryScenePlayer({
  scene,
  sceneEntryKey,
  fx = EMPTY_FX,
  dialogueIdx,
  viewport = 'desktop',
  isModal = false,
  onSelectNode,
  audioEnabled = true,
  advanceDialogue,
}: StoryScenePlayerProps) {
  const dialogueText = scene.dialogue?.[dialogueIdx] || '...';

  // useStorySceneAudio({
  //   bgMusic: scene.bgMusic,
  //   sfx: scene.sfx,
  //   sceneEntryKey,
  // });
  useStorySceneAudio({
    bgMusic: audioEnabled ? scene.bgMusic : '',
    sfx: audioEnabled ? scene.sfx : '',
    sceneEntryKey: audioEnabled ? sceneEntryKey : '',
  });

  // --------------------------------------------------
  // Typewriter
  // Reset when the dialogue line OR scene entry changes.
  // --------------------------------------------------

  const [visibleChars, setVisibleChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typingTimer.current) {
      clearInterval(typingTimer.current);
      typingTimer.current = null;
    }

    let count = 0;

    setVisibleChars(0);
    setIsTyping(dialogueText.length > 0);

    if (!dialogueText.length) {
      setIsTyping(false);
      return;
    }

    typingTimer.current = setInterval(() => {
      count = Math.min(count + 1, dialogueText.length);
      setVisibleChars(count);

      if (count >= dialogueText.length) {
        if (typingTimer.current) {
          clearInterval(typingTimer.current);
          typingTimer.current = null;
        }

        setIsTyping(false);
      }
    }, SCENE_STYLE.typewriter.speedMs);

    return () => {
      if (typingTimer.current) {
        clearInterval(typingTimer.current);
        typingTimer.current = null;
      }
    };
  }, [sceneEntryKey, scene.nodeId, dialogueIdx, dialogueText]);

  const handleDialogueClick = () => {
    if (isTyping) {
      if (typingTimer.current) {
        clearInterval(typingTimer.current);
        typingTimer.current = null;
      }

      setVisibleChars(dialogueText.length);
      setIsTyping(false);
      return;
    }

    advanceDialogue();
  };

  const isAtDialogueEnd =
    dialogueIdx >= Math.max(0, (scene.dialogue?.length ?? 0) - 1);

  const showChoices =
    !isTyping && isAtDialogueEnd && (scene.choices?.length ?? 0) > 0;

  // --------------------------------------------------
  // Background transition
  // Only animate when the URL changes.
  // --------------------------------------------------

  const bgUrl = scene.bgImage || null;

  const previousBgRef = useRef<string | null>(bgUrl);
  const [oldBg, setOldBg] = useState<string | null>(null);
  const [shownBg, setShownBg] = useState<string | null>(bgUrl);
  const [bgTransitioning, setBgTransitioning] = useState(false);
  const [bgEntering, setBgEntering] = useState(false);

  useEffect(() => {
    const next = scene.bgImage || null;

    if (previousBgRef.current === next) return;

    const previous = previousBgRef.current;
    previousBgRef.current = next;

    setOldBg(previous);
    setShownBg(next);
    setBgTransitioning(true);
    setBgEntering(false);

    const startTimer = setTimeout(() => {
      setBgEntering(true);
    }, 20);

    const finishTimer = setTimeout(() => {
      setOldBg(null);
      setBgTransitioning(false);
      setBgEntering(false);
    }, BG_TRANSITION_MS + 30);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [scene.bgImage]);

  // --------------------------------------------------
  // Character transition
  // Only fade when the URL changes.
  // --------------------------------------------------

  const characterUrl = scene.characterImage || null;

  const previousCharacterRef = useRef<string | null>(characterUrl);
  const [shownCharacter, setShownCharacter] =
    useState<string | null>(characterUrl);
  const [characterVisible, setCharacterVisible] = useState(true);

  useEffect(() => {
    const next = scene.characterImage || null;

    if (previousCharacterRef.current === next) return;

    previousCharacterRef.current = next;
    setCharacterVisible(false);

    const timer = setTimeout(() => {
      setShownCharacter(next);
      setCharacterVisible(true);
    }, CHARACTER_FADE_MS);

    return () => clearTimeout(timer);
  }, [scene.characterImage]);

  // A few text-length tiers provide a readable fallback for longer lines.
  // Adjust the thresholds to match your content and target languages.
  const isMobileViewport = viewport === 'mobile';
  const isTabletViewport = viewport === 'tablet';
  const isSmallViewport = isMobileViewport || isTabletViewport;

  const dialogueFontSize = isSmallViewport
    ? dialogueText.length > 300
      ? isMobileViewport ? '10px' : '12px'
      : dialogueText.length > 180
        ? isMobileViewport ? '11px' : '13px'
        : isMobileViewport ? '12px' : '14px'
    : dialogueText.length > 300
      ? SCENE_STYLE.dialogue.veryLongTextFontSize
      : dialogueText.length > 180
        ? SCENE_STYLE.dialogue.longTextFontSize
        : SCENE_STYLE.dialogue.fontSize;

  const transitionClass =
    'transition-transform duration-[450ms] ease-in-out';

  return (
    <div className="relative isolate flex h-full w-full flex-col justify-end overflow-hidden bg-black">

      {/* Background layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden bg-black"
      >
        {oldBg && (
          <img
            src={oldBg}
            alt=""
            draggable={false}
            className={`absolute inset-0 h-full w-full select-none ${
              bgTransitioning ? transitionClass : ''
            } ${bgEntering ? '-translate-x-full' : 'translate-x-0'} ${
              fx.backgroundClass
            }`}
            style={{
              objectFit: SCENE_STYLE.background.fit,
              objectPosition: SCENE_STYLE.background.position,
            }}
          />
        )}

        {shownBg && (
          <img
            src={shownBg}
            alt=""
            draggable={false}
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full select-none ${
              bgTransitioning ? transitionClass : ''
            } ${
              bgTransitioning && !bgEntering
                ? 'translate-x-full'
                : 'translate-x-0'
            } ${fx.backgroundClass}`}
            style={{
              objectFit: SCENE_STYLE.background.fit,
              objectPosition: SCENE_STYLE.background.position,
            }}
          />
        )}
      </div>

      {/* Character layer */}
      {shownCharacter && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <img
            src={shownCharacter}
            alt=""
            draggable={false}
            decoding="async"
            className={`absolute h-auto max-w-none select-none object-contain
              drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]
              transition-opacity duration-[180ms] ease-in-out
              ${
                showChoices
                  ? 'opacity-30 blur-[1px]'
                  : characterVisible
                    ? 'opacity-100'
                    : 'opacity-0'
              }
              ${fx.characterClass}`}
            style={{
              width: isMobileViewport
                ? '76%'
                : isTabletViewport
                  ? '60%'
                  : SCENE_STYLE.character.width,

              maxWidth: isSmallViewport
                ? 'none'
                : SCENE_STYLE.character.maxWidth,

              maxHeight: isMobileViewport
                ? '78%'
                : isTabletViewport
                  ? '84%'
                  : SCENE_STYLE.character.maxHeight,

              bottom: isMobileViewport
                ? 'clamp(4.5rem, 13vh, 6rem)'
                : isTabletViewport
                  ? 'clamp(4.5rem, 10vh, 6.5rem)'
                  : SCENE_STYLE.character.bottom,

              left: SCENE_STYLE.character.left,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}

      {/* Choices */}
      {showChoices && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/35 p-4">
          <div
            className="flex max-h-[70%] w-full flex-col items-center justify-center gap-2 overflow-y-auto"
            style={{ maxWidth: SCENE_STYLE.choices.maxWidth }}
          >
            {scene.choices.map((choice, idx) => (
              <button
                key={`${choice.targetNodeId}-${idx}`}
                disabled={!choice.targetNodeId}
                onClick={(event) => {
                  event.stopPropagation();

                  if (choice.targetNodeId) {
                    onSelectNode(choice.targetNodeId);
                  }
                }}
                className={`w-full rounded-lg border border-white/20
                  bg-slate-950/90 text-center text-white shadow-xl
                  transition-colors hover:border-indigo-400
                  hover:bg-indigo-600 disabled:cursor-not-allowed
                  disabled:opacity-50 ${
                    isModal
                      ? 'px-5 py-3 text-sm sm:text-base'
                      : 'px-3 py-2 text-xs sm:text-sm'
                  }`}
              >
                {choice.text || `Option ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dialogue panel */}
      <div
        onClick={showChoices ? undefined : handleDialogueClick}
        className={`relative z-20 mx-auto ${
            isMobileViewport ? 'mb-2' : isTabletViewport ? 'mb-3' : 'mb-5'
          } flex w-[calc(100%-1rem)] cursor-pointer flex-col rounded-xl border border-white/15 bg-slate-950/90 text-white shadow-2xl backdrop-blur-sm transition-opacity ${
            showChoices ? 'pointer-events-none opacity-40' : ''
        }`}
        style={{
          maxWidth: isMobileViewport
            ? '100%'
            : isTabletViewport
              ? '42rem'
              : SCENE_STYLE.dialogue.panelMaxWidth,

          maxHeight: isSmallViewport ? '42%' : SCENE_STYLE.dialogue.panelMaxHeight,

          paddingInline: isMobileViewport
            ? '10px'
            : isTabletViewport
              ? '16px'
              : SCENE_STYLE.dialogue.paddingX,

          paddingBlock: isMobileViewport
            ? '8px'
            : isTabletViewport
              ? '12px'
              : SCENE_STYLE.dialogue.paddingY,
        }}
      >
        <div
          className="mb-2 shrink-0 font-bold uppercase tracking-[0.14em] text-indigo-300"
          style={{ fontSize: SCENE_STYLE.dialogue.titleFontSize }}
        >
          {scene.title || 'Speaker Character'}
        </div>

        <div
          className={`w-full pr-1 font-sans text-slate-100 ${
            isSmallViewport ? 'min-h-0 overflow-y-auto' : 'overflow-y-auto pr-2'
          }`}
          style={{
            maxWidth: SCENE_STYLE.dialogue.textMaxWidth,
            fontSize: dialogueFontSize,
            lineHeight: isMobileViewport ? 1.4 : SCENE_STYLE.dialogue.lineHeight,
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
            scrollbarWidth: 'thin',
          }}
        >
          {dialogueText.slice(0, visibleChars)}

          {isTyping && (
            <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-indigo-400 align-middle" />
          )}
        </div>

        {!isAtDialogueEnd && !isTyping && (
          <ChevronRight
            aria-hidden="true"
            className="absolute bottom-3 right-3 h-5 w-5 animate-pulse text-indigo-300"
          />
        )}
      </div>
    </div>
  );
}

export default memo(StoryScenePlayer);
