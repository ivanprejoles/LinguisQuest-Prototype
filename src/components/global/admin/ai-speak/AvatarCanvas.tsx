// Inside AvatarCanvas / CharacterModel component
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";

export function CharacterModel({ audioRef, emotion }: { audioRef: React.RefObject<HTMLAudioElement>; emotion: string }) {
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    // Create Web Audio API pipeline when audio starts playing
    const handlePlay = () => {
      if (!analyserRef.current && audioRef.current) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(audioRef.current);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyserRef.current = analyser;
      }
    };

    const audioEl = audioRef.current;
    audioEl.addEventListener("play", handlePlay);
    return () => audioEl.removeEventListener("play", handlePlay);
  }, [audioRef]);

  // Frame loop for lip sync morph targets
  useFrame(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Average audio volume
      const averageVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      // Adjust blend shapes/morph targets based on volume (0.0 to 1.0)
      // Example: nodes.Head.morphTargetInfluences[mouthOpenIndex] = averageVolume / 128;
    }
  });

  return null; // Your GLTF character rendering logic
}