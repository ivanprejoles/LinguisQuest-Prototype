
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
    transitionMs: 500,
  },

  character: {
    width: '42%',
    maxWidth: '680px',
    maxHeight: '88%',
    bottom: 'clamp(3.5rem, 10vh, 7rem)',
    left: '50%',
    fadeMs: 500,
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
    speedMs: 10,
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
  const rawDialogueText = scene.dialogue?.[dialogueIdx] || '...';

  // Supports dialogue written as: "Robin: Thank you for your support."
  const speakerMatch = rawDialogueText.match(/^([^:\n]{1,40}):\s*/);

  const speakerName =
    speakerMatch?.[1].trim() || scene.title || 'Narration';

  const dialogueText = speakerMatch
    ? rawDialogueText.slice(speakerMatch[0].length)
    : rawDialogueText;

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
  const [choicesRevealed, setChoicesRevealed] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setChoicesRevealed(false);

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

  const isAtDialogueEnd =
    dialogueIdx >= Math.max(0, (scene.dialogue?.length ?? 0) - 1);

  const choiceCount = scene.choices?.length ?? 0;

  const hasChoices = choiceCount > 0;
  const hasMultipleChoices = choiceCount > 1;

  const showChoices =
    choicesRevealed &&
    !isTyping &&
    isAtDialogueEnd &&
    hasMultipleChoices;

  const handleDialogueClick = () => {
    // First click: reveal the complete dialogue.
    if (isTyping) {
      if (typingTimer.current) {
        clearInterval(typingTimer.current);
        typingTimer.current = null;
      }

      setVisibleChars(dialogueText.length);
      setIsTyping(false);
      return;
    }

    // Final dialogue with exactly one choice:
    // Automatically follow that path.
    if (isAtDialogueEnd && choiceCount === 1 && !choicesRevealed) {
      const onlyChoice = scene.choices?.[0];

      if (onlyChoice?.targetNodeId) {
        onSelectNode(onlyChoice.targetNodeId);
      } else {
        advanceDialogue();
      }

      return;
    }

    // Multiple choices: reveal the choice screen.
    if (isAtDialogueEnd && hasMultipleChoices && !choicesRevealed) {
      setChoicesRevealed(true);
      return;
    }

    // Normal dialogue advancement.
    advanceDialogue();
  };
  
  // --------------------------------------------------
  // Background transition
  // Slide from right to left only when the image changes.
  // Preload the next image before starting the animation.
  // --------------------------------------------------

  const bgUrl = scene.bgImage || null;

  const previousBgRef = useRef<string | null>(bgUrl);
  const [displayedBg, setDisplayedBg] = useState<string | null>(bgUrl);

  const [bgTransition, setBgTransition] = useState<{
    from: string | null;
    to: string | null;
    phase: 'start' | 'moving';
  } | null>(null);

  useEffect(() => {
    const next = scene.bgImage || null;
    const previous = previousBgRef.current;

    if (previous === next) return;

    previousBgRef.current = next;

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;

    const beginTransition = () => {
      if (cancelled) return;

      setBgTransition({
        from: previous,
        to: next,
        phase: 'start',
      });

      // Give the browser a chance to paint the starting positions.
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (!cancelled) {
            setBgTransition((current) =>
              current
                ? { ...current, phase: 'moving' }
                : current
            );
          }
        });
      });

      finishTimer = setTimeout(() => {
        if (cancelled) return;

        setDisplayedBg(next);
        setBgTransition(null);
      }, BG_TRANSITION_MS + 50);
    };

    if (!next) {
      beginTransition();
    } else {
      const image = new Image();

      image.onload = beginTransition;
      image.onerror = beginTransition;
      image.src = next;

      // Already cached images may have completed before onload is assigned.
      if (image.complete) {
        beginTransition();
      }
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);

      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [scene.bgImage]);


  
  // --------------------------------------------------
  // Character transition
  // Crossfade only when the character image changes.
  // The old character fades out while the new one fades in.
  // --------------------------------------------------

  const characterUrl = scene.characterImage || null;

  const previousCharacterRef = useRef<string | null>(characterUrl);

  const [displayedCharacter, setDisplayedCharacter] =
    useState<string | null>(characterUrl);

  const [characterTransition, setCharacterTransition] = useState<{
    from: string | null;
    to: string | null;
    phase: 'start' | 'moving';
  } | null>(null);

  useEffect(() => {
    const next = scene.characterImage || null;
    const previous = previousCharacterRef.current;

    if (previous === next) return;

    previousCharacterRef.current = next;

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;

    const beginTransition = () => {
      if (cancelled) return;

      setCharacterTransition({
        from: previous,
        to: next,
        phase: 'start',
      });

      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (!cancelled) {
            setCharacterTransition((current) =>
              current
                ? { ...current, phase: 'moving' }
                : current
            );
          }
        });
      });

      finishTimer = setTimeout(() => {
        if (cancelled) return;

        setDisplayedCharacter(next);
        setCharacterTransition(null);
      }, CHARACTER_FADE_MS + 80);
    };

    if (!next) {
      beginTransition();
    } else {
      const image = new Image();

      image.onload = beginTransition;
      image.onerror = beginTransition;
      image.src = next;

      if (image.complete) {
        beginTransition();
      }
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);

      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [scene.characterImage]);


  // A few text-length tiers provide a readable fallback for longer lines.
  // Adjust the thresholds to match your content and target languages.
  const isMobileViewport = viewport === 'mobile';
  const isTabletViewport = viewport === 'tablet';
  const isSmallViewport = isMobileViewport || isTabletViewport;

  const dialogueFontSize = isMobileViewport
  ? dialogueText.length > 300
    ? '12px'
    : dialogueText.length > 180
      ? '13px'
      : '14px'
  : isTabletViewport
    ? dialogueText.length > 300
      ? '13px'
      : dialogueText.length > 180
        ? '14px'
        : '16px'
    : dialogueText.length > 300
      ? SCENE_STYLE.dialogue.veryLongTextFontSize
      : dialogueText.length > 180
        ? SCENE_STYLE.dialogue.longTextFontSize
        : SCENE_STYLE.dialogue.fontSize;

  const transitionClass =
    'transition-transform duration-[450ms] ease-in-out';

  return (
    <div
      className={`relative isolate mx-auto flex h-full w-full flex-col justify-end overflow-hidden bg-black ${
        viewport === 'desktop' ? 'max-w-5xl' : ''
      }`}
    >

      
  {/* Background layer */}
  <div
    aria-hidden="true"
    className="absolute inset-0 overflow-hidden bg-black"
  >
    {bgTransition ? (
      <>
        {/* Previous background slides out to the left */}
        {bgTransition.from && (
          <img
            src={bgTransition.from}
            alt=""
            draggable={false}
            className={`absolute inset-0 h-full w-full select-none ${
              bgTransition.phase === 'moving'
                ? '-translate-x-full'
                : 'translate-x-0'
            } ${fx.backgroundClass}`}
            style={{
              objectFit: SCENE_STYLE.background.fit,
              objectPosition: SCENE_STYLE.background.position,
              transition: `transform ${BG_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        )}

        {/* New background enters from the right */}
        {bgTransition.to && (
          <img
            src={bgTransition.to}
            alt=""
            draggable={false}
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full select-none ${
              bgTransition.phase === 'moving'
                ? 'translate-x-0'
                : 'translate-x-full'
            } ${fx.backgroundClass}`}
            style={{
              objectFit: SCENE_STYLE.background.fit,
              objectPosition: SCENE_STYLE.background.position,
              transition: `transform ${BG_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        )}
      </>
    ) : (
      displayedBg && (
        <img
          src={displayedBg}
          alt=""
          draggable={false}
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full select-none ${fx.backgroundClass}`}
          style={{
            objectFit: SCENE_STYLE.background.fit,
            objectPosition: SCENE_STYLE.background.position,
          }}
        />
      )
    )}
  </div>


      
  {/* Character layer */}
  {(characterTransition || displayedCharacter) && (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {characterTransition ? (
        <>
          {/* Previous character fades out */}
          {characterTransition.from && (
            <img
              src={characterTransition.from}
              alt=""
              draggable={false}
              decoding="async"
              className={`absolute h-auto max-w-none select-none object-contain
                drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]
                ${characterTransition.phase === 'moving'
                  ? 'opacity-0'
                  : 'opacity-100'
                }
                ${showChoices ? 'blur-[1px]' : ''}
                ${fx.characterClass}`}
              style={{
                height: isMobileViewport
                  ? '72%'
                  : isTabletViewport
                    ? '84%'
                    : '88%',

                width: isMobileViewport
                  ? 'auto'
                  : isTabletViewport
                    ? '60%'
                    : SCENE_STYLE.character.width,

                maxHeight: isMobileViewport
                  ? '72%'
                  : isTabletViewport
                    ? '84%'
                    : SCENE_STYLE.character.maxHeight,

                maxWidth: isSmallViewport
                  ? 'none'
                  : SCENE_STYLE.character.maxWidth,

                objectFit: 'contain',

                bottom: isMobileViewport
                  ? 'clamp(3.5rem, 9vh, 5rem)'
                  : isTabletViewport
                    ? 'clamp(4.5rem, 10vh, 6.5rem)'
                    : SCENE_STYLE.character.bottom,

                left: '50%',
                transform: 'translateX(-50%)',
                transition: `opacity ${CHARACTER_FADE_MS}ms ease-in-out`,
              }}
            />
          )}

          {/* New character fades in */}
          {characterTransition.to && (
            <img
              src={characterTransition.to}
              alt=""
              draggable={false}
              decoding="async"
              className={`absolute h-auto max-w-none select-none object-contain
                drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]
                ${characterTransition.phase === 'moving'
                  ? 'opacity-100'
                  : 'opacity-0'
                }
                ${showChoices ? 'blur-[1px]' : ''}
                ${fx.characterClass}`}
              style={{
                height: isMobileViewport
                  ? '72%'
                  : isTabletViewport
                    ? '84%'
                    : '88%',

                width: isMobileViewport
                  ? 'auto'
                  : isTabletViewport
                    ? '60%'
                    : SCENE_STYLE.character.width,

                maxHeight: isMobileViewport
                  ? '72%'
                  : isTabletViewport
                    ? '84%'
                    : SCENE_STYLE.character.maxHeight,

                maxWidth: isSmallViewport
                  ? 'none'
                  : SCENE_STYLE.character.maxWidth,

                objectFit: 'contain',

                bottom: isMobileViewport
                  ? 'clamp(3.5rem, 9vh, 5rem)'
                  : isTabletViewport
                    ? 'clamp(4.5rem, 10vh, 6.5rem)'
                    : SCENE_STYLE.character.bottom,

                left: '50%',
                transform: 'translateX(-50%)',
                transition: `opacity ${CHARACTER_FADE_MS}ms ease-in-out`,
              }}
            />
          )}
        </>
      ) : (
        displayedCharacter && (
          <img
            src={displayedCharacter}
            alt=""
            draggable={false}
            decoding="async"
            className={`absolute h-auto max-w-none select-none object-contain
              drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]
              ${showChoices ? 'opacity-30 blur-[1px]' : 'opacity-100'}
              ${fx.characterClass}`}
            style={{
              height: isMobileViewport
                ? '72%'
                : isTabletViewport
                  ? '84%'
                  : '88%',

              width: isMobileViewport
                ? 'auto'
                : isTabletViewport
                  ? '60%'
                  : SCENE_STYLE.character.width,

              maxHeight: isMobileViewport
                ? '72%'
                : isTabletViewport
                  ? '84%'
                  : SCENE_STYLE.character.maxHeight,

              maxWidth: isSmallViewport
                ? 'none'
                : SCENE_STYLE.character.maxWidth,

              objectFit: 'contain',

              bottom: isMobileViewport
                ? 'clamp(3.5rem, 9vh, 5rem)'
                : isTabletViewport
                  ? 'clamp(4.5rem, 10vh, 6.5rem)'
                  : SCENE_STYLE.character.bottom,

              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )
      )}
    </div>
  )}


      
    
{/* Storybook Glass Choices */}
{showChoices && (
  <div
    className="absolute inset-0 z-30 flex items-center justify-center
      bg-black/25 p-3 sm:p-5"
  >
    <div
      className="relative flex max-h-[78%] w-full flex-col
        overflow-hidden rounded-2xl
        border border-[#d9b978]/70
        bg-gradient-to-br from-[#49351f]/85
        via-[#30251b]/80 to-[#1e1915]/85
        p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]
        backdrop-blur-xl sm:p-6"
      style={{ maxWidth: SCENE_STYLE.choices.maxWidth }}
    >
      {/* Inner decorative border */}
      <div className="pointer-events-none absolute inset-[5px]
        rounded-xl border border-[#e5c98e]/20" />

      {/* Decorative top ornament */}
      <div className="relative mb-4 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r
            from-transparent to-[#d9b978]" />

          <span className="font-serif text-[#e8cd91]">
            ✦
          </span>

          <span className="h-px w-10 bg-gradient-to-l
            from-transparent to-[#d9b978]" />
        </div>

        <h3 className="font-serif text-lg font-bold tracking-wide
          text-[#fff0cb] sm:text-xl">
          What will you do?
        </h3>

        <p className="mt-1 font-serif text-xs italic
          tracking-wide text-[#d9c39b]/75 sm:text-sm">
          Choose your path
        </p>
      </div>

      {/* Choice buttons */}
      <div className="relative flex min-h-0 flex-col
        gap-2.5 overflow-y-auto px-1 py-1">
        {scene.choices.map((choice, idx) => (
          <button
            key={`${choice.targetNodeId}-${idx}`}
            type="button"
            disabled={!choice.targetNodeId}
            onClick={() => {
              if (choice.targetNodeId) {
                onSelectNode(choice.targetNodeId);
              }
            }}
            className="group relative flex w-full items-center gap-3
              overflow-hidden rounded-lg
              border border-[#d9b978]/55
              bg-gradient-to-r from-[#f5e8c9]/95
              via-[#fff5df]/95 to-[#ead5a8]/95
              px-3 py-3 text-left font-serif
              text-sm text-[#493619]
              shadow-[0_3px_10px_rgba(0,0,0,0.2)]
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-[#ffe2a1]
              hover:from-[#fff5dc]
              hover:via-[#fff9eb]
              hover:to-[#f3dfb5]
              hover:shadow-[0_5px_16px_rgba(0,0,0,0.3)]
              active:translate-y-0
              disabled:cursor-not-allowed disabled:opacity-50
              sm:px-4 sm:py-3.5 sm:text-base"
          >
            {/* Subtle gold accent */}
            <span className="absolute inset-y-0 left-0 w-[3px]
              bg-gradient-to-b from-[#f6dfa9]
              via-[#b38a43] to-[#f6dfa9]" />

            {/* Number ornament */}
            <span className="flex h-7 w-7 shrink-0 items-center
              justify-center rounded-full
              border border-[#b38a43]/70
              bg-[#e9d5a9] font-serif text-xs font-bold
              text-[#765526] shadow-inner
              transition-colors group-hover:bg-[#dfc28a]">
              {idx + 1}
            </span>

            {/* Choice text */}
            <span className="min-w-0 flex-1 leading-relaxed">
              {choice.text || `Option ${idx + 1}`}
            </span>

            <ChevronRight
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-[#987137]
                opacity-60 transition-all duration-200
                group-hover:translate-x-1
                group-hover:opacity-100"
            />
          </button>
        ))}
      </div>

      {/* Decorative footer */}
      <div className="relative mt-4 flex items-center
        justify-center gap-3 border-t border-[#d9b978]/25 pt-3">
        <span className="h-px w-6 bg-[#d9b978]/40" />

        <p className="font-serif text-[10px] italic
          tracking-wider text-[#e3cca0]/70 sm:text-xs">
          Every choice shapes your story
        </p>

        <span className="h-px w-6 bg-[#d9b978]/40" />
      </div>
    </div>
  </div>
)}


      
      {/* Storybook Dialogue Panel */}
      <div
        className={`relative z-20 mx-auto ${
          isMobileViewport ? 'mb-2' : isTabletViewport ? 'mb-3' : 'mb-5'
        } flex w-[calc(100%-1rem)] flex-col rounded-xl border-[3px]
          border-[#a77a32] bg-gradient-to-b from-[#fff4d3]
          via-[#f5e6bd] to-[#e9d3a0] text-[#3c2b18]
          shadow-[0_5px_20px_rgba(0,0,0,0.45)]
          ${
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
            ? '12px'
            : isTabletViewport
              ? '18px'
              : SCENE_STYLE.dialogue.paddingX,

          paddingTop: isMobileViewport ? '15px' : '22px',
          paddingBottom: isMobileViewport ? '6px' : '14px',
        }}
      >
        {/* Speaker / Scene Name Plaque */}
        <div
          className="absolute -top-3 left-3 z-10
            max-w-[85%] rounded-md border-2 border-[#a77a32]
            bg-gradient-to-b from-[#fff4cf] to-[#e7ca83]
            px-3 py-1 font-serif font-bold
            text-[#493619] shadow-md sm:-top-[17px] sm:left-4 sm:max-w-[80%] sm:px-5 sm:py-1"
          style={{
            fontSize: isMobileViewport ? '11px' : '16px',
          }}
        >
          <span className="block whitespace-normal break-words leading-tight">
            {speakerName}
          </span>
        </div>

        {/* Dialogue Text */}
        {/* <div
          className={`w-full pr-1 font-serif text-[#382817] ${
            isSmallViewport
              ? 'min-h-0 overflow-y-auto'
              : 'overflow-y-auto pr-2'
          }`}
          style={{
            maxWidth: SCENE_STYLE.dialogue.textMaxWidth,
            fontSize: dialogueFontSize,
            lineHeight: isMobileViewport
              ? 1.5
              : SCENE_STYLE.dialogue.lineHeight,
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
            scrollbarWidth: 'thin',
            paddingBottom: '8px',
          }}
        >
          {dialogueText.slice(0, visibleChars)}

          {isTyping && (
            <span
              className="ml-1 inline-block h-[1em] w-[2px]
                animate-pulse bg-[#9b7134] align-middle"
            />
          )}
        </div> */}
        {/* Dialogue Text */}
<div
  className={`w-full min-w-0 pr-1 font-serif text-[#382817] ${
    isSmallViewport
      ? 'min-h-0 overflow-y-auto'
      : 'overflow-y-auto pr-2'
  }`}
  style={{
    maxWidth: SCENE_STYLE.dialogue.textMaxWidth,
    fontSize: dialogueFontSize,
    lineHeight: isMobileViewport ? 1.4 : SCENE_STYLE.dialogue.lineHeight,
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    scrollbarWidth: 'thin',
    paddingBottom: '4px',
  }}
>
  {dialogueText.slice(0, visibleChars)}

  {isTyping && (
    <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-[#9b7134] align-middle" />
  )}
</div>

        {/* Dedicated Continue Button */}
        {!showChoices && (
          <div className="mt-1 flex shrink-0 justify-end">
            <button
              type="button"
              onClick={handleDialogueClick}
              className="inline-flex items-center gap-2 rounded-md
                border border-[#a77a32] bg-gradient-to-b
                from-[#f8e7b5] to-[#d9b76b]
                px-4 py-1.5 font-serif text-sm font-bold
                text-[#493619] shadow-md
                transition-all duration-150
                hover:brightness-105 hover:shadow-lg
                active:translate-y-px active:shadow-sm
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-[#a77a32]
                focus-visible:ring-offset-2"
              aria-label={isTyping ? 'Show full dialogue' : 'Continue story'}
            >
              <span>{isTyping ? 'Skip' : 'Continue'}</span>
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default memo(StoryScenePlayer);
