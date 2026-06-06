"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useControls } from "leva";
import gsap from "gsap";
import * as THREE from "three";

import Lifeform from "./Lifeform";
import SoundParticles from "./SoundParticles";
import { MusicLab, MemoryGarden, SoundTemple } from "./Zones";
import { GENRES } from "@/lib/audio";

// Cinematic camera push-in on first mount (GSAP).
function CameraIntro() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.4, 16);
    gsap.to(camera.position, { z: 6.2, y: 0.6, duration: 3.4, ease: "power3.out" });
  }, [camera]);
  return null;
}

export default function Experience({ audioRef, genre = "lofi" }) {
  const g = GENRES[genre] || GENRES.lofi;
  const accent = new THREE.Color().setHSL(g.hue, 0.7, 0.6);

  const { bloom, autoRotate } = useControls("Universe", {
    bloom: { value: 1.15, min: 0, max: 3, step: 0.05 },
    autoRotate: true,
  });

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.6, 6.2], fov: 55 }}
    >
      <color attach="background" args={["#06060c"]} />
      <fog attach="fog" args={["#06060c", 12, 26]} />
      <CameraIntro />

      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={6} distance={20} color={accent} />
      <pointLight position={[-8, 2, 0]} intensity={3} distance={16} color="#38bdf8" />
      <pointLight position={[8, 2, 0]} intensity={3} distance={16} color="#f9a8d4" />

      <Lifeform audioRef={audioRef} hue={g.hue} spikes={g.spikes} />
      <SoundParticles audioRef={audioRef} color={`#${accent.getHexString()}`} />

      <MusicLab audioRef={audioRef} />
      <MemoryGarden audioRef={audioRef} />
      <SoundTemple audioRef={audioRef} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.5}
        maxDistance={15}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        rotateSpeed={0.6}
        dampingFactor={0.08}
      />

      <EffectComposer disableNormalPass>
        <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.15} luminanceSmoothing={0.3} radius={0.8} />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
