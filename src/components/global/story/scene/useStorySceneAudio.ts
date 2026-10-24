
'use client';

import { useEffect, useRef } from 'react';

interface StorySceneAudioOptions {
  bgMusic?: string | null;
  sfx?: string | null;

  // Must change each time a scenario is entered.
  // Include a run ID if restarting a story at the same node.
  sceneEntryKey: string;
}

export function useStorySceneAudio({
  bgMusic,
  sfx,
  sceneEntryKey,
}: StorySceneAudioOptions) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicUrlRef = useRef<string | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const latestSfxRef = useRef(sfx);

  // Keep the latest SFX URL without making rerenders replay it.
  useEffect(() => {
    latestSfxRef.current = sfx;
  }, [sfx]);

  // Background music follows the track URL, not the node identity.
  useEffect(() => {
    const nextUrl = bgMusic || null;

    if (musicUrlRef.current === nextUrl) return;

    musicRef.current?.pause();
    musicRef.current = null;
    musicUrlRef.current = nextUrl;

    if (!nextUrl) return;

    const audio = new Audio(nextUrl);
    audio.loop = true;
    musicRef.current = audio;

    void audio.play().catch(() => {
      // Browsers may block autoplay until the user interacts.
      // A later explicit play control can resume the track.
    });
  }, [bgMusic]);

  // SFX follows scenario entry, not component rerenders.
  useEffect(() => {
    const url = latestSfxRef.current;
    if (!url) return;

    sfxRef.current?.pause();

    const audio = new Audio(url);
    sfxRef.current = audio;
    void audio.play().catch(() => {
      // Autoplay may be blocked by the browser.
    });
  }, [sceneEntryKey]);

  // Stop audio when this player instance is removed.
  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      sfxRef.current?.pause();
      musicRef.current = null;
      sfxRef.current = null;
      musicUrlRef.current = null;
    };
  }, []);
}
