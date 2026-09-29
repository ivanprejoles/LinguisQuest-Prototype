"use client";

import React, { useRef, useEffect, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface CharacterProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  emotion: string;
}

// 1. Isolate and memoize the 3D model to prevent React re-renders
const CharacterModel = memo(function CharacterModel({ audioRef, emotion }: CharacterProps) {
  const { scene } = useGLTF("/models/character.glb");
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Traverse the scene once to locate the head mesh
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).morphTargetDictionary) {
        headMeshRef.current = child as THREE.Mesh;
      }
    });
  }, [scene]);

  // Attach Web Audio API analyser to the audio element
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    let audioCtx: AudioContext | null = null;

    const setupAudio = () => {
      if (analyserRef.current) return;
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      try {
        const source = audioCtx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyserRef.current = analyser;
      } catch {
        // MediaSource bound check
      }
    };

    audioEl.addEventListener("play", setupAudio, { once: true });
    return () => audioEl.removeEventListener("play", setupAudio);
  }, [audioRef]);

  // 2. Drive mouth & facial morphs at 60 FPS WITHOUT React state updates
  useFrame(() => {
    const mesh = headMeshRef.current;
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    // Direct mutation based on audio frequency data
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;

      if (dict["mouthOpen"] !== undefined) {
        influences[dict["mouthOpen"]] = volume * 2.0; // Scale intensity
      }
    }

    // Direct mutation for emotion expressions
    if (dict["mouthSmile"] !== undefined) {
      influences[dict["mouthSmile"]] = emotion === "happy" ? 0.8 : 0;
    }
  });

  return <primitive object={scene} position={[0, -1.4, 0]} scale={1.7} />;
});

// 3. Static 3D Canvas container
export const AvatarCanvas = memo(function AvatarCanvas({ audioRef, emotion }: CharacterProps) {
  return (
    <div className="w-full h-[320px] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ powerPreference: "high-performance", antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 2, 2]} />
        <CharacterModel audioRef={audioRef} emotion={emotion} />
      </Canvas>
    </div>
  );
});