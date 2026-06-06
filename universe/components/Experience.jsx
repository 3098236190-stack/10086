"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import gsap from "gsap";
import * as THREE from "three";

import Lifeform from "./Lifeform";
import SoundParticles from "./SoundParticles";
import { MusicLab, MemoryGarden, SoundTemple } from "./Zones";
import { GENRES } from "@/lib/audio";

// Cinematic camera push-in (GSAP) — like a film's opening shot.
function CameraIntro() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.6, 19);
    gsap.to(camera.position, { z: 7.2, y: 0.8, duration: 5.5, ease: "power2.out" });
  }, [camera]);
  return null;
}

// Mouse-influenced parallax with inertia + lens breathing. The world tilts
// gently toward the cursor; the camera never snaps.
function CameraRig({ worldRef }) {
  const { camera } = useThree();
  const baseFov = useRef(camera.fov);
  useFrame((state, dt) => {
    const k = Math.min(1, dt * 1.6);
    if (worldRef.current) {
      worldRef.current.rotation.y += (state.pointer.x * 0.35 - worldRef.current.rotation.y) * k * 0.4;
      worldRef.current.rotation.x += (-state.pointer.y * 0.18 - worldRef.current.rotation.x) * k * 0.4;
    }
    // lens breathing
    camera.fov = baseFov.current + Math.sin(state.clock.elapsedTime * 0.18) * 0.7;
    camera.updateProjectionMatrix();
  });
  return null;
}

// Click = resonance waves rippling out across the ancient floor.
function Resonance() {
  const N = 6;
  const meshes = useRef([]);
  const slots = useRef(Array.from({ length: N }, () => ({ active: false, t: 0 })));
  useEffect(() => {
    const onDown = () => {
      const s = slots.current.find((x) => !x.active) || slots.current[0];
      s.active = true;
      s.t = 0;
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  useFrame((_, dt) => {
    slots.current.forEach((s, i) => {
      const m = meshes.current[i];
      if (!m) return;
      if (s.active) {
        s.t += dt;
        const k = s.t / 2.2;
        if (k >= 1) {
          s.active = false;
          m.visible = false;
        } else {
          m.visible = true;
          m.scale.setScalar(1 + k * 11);
          m.material.opacity = (1 - k) * 0.4;
        }
      }
    });
  });
  return (
    <group position={[0, -1.6, 0]}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(el) => (meshes.current[i] = el)} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.92, 1.0, 80]} />
          <meshBasicMaterial
            color="#9ec2ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Experience({ audioRef, genre = "lofi" }) {
  const g = GENRES[genre] || GENRES.lofi;
  const accent = new THREE.Color().setHSL(g.hue, 0.5, 0.55);
  const worldRef = useRef();

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.8, 7.2], fov: 50 }}
    >
      {/* Ancient, hazy void — cinematic grade, not pure black. */}
      <color attach="background" args={["#0a0c12"]} />
      <fogExp2 attach="fog" args={["#0a0c12", 0.055]} />
      <CameraIntro />
      <CameraRig worldRef={worldRef} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={5} distance={22} color={accent} />
      <pointLight position={[-9, 3, -2]} intensity={2} distance={18} color="#2a4a6a" />
      <pointLight position={[9, 2, -2]} intensity={1.6} distance={18} color="#6a3a52" />

      <group ref={worldRef}>
        <Lifeform audioRef={audioRef} hue={g.hue} spikes={g.spikes} />
        <SoundParticles audioRef={audioRef} color={`#${accent.getHexString()}`} />
        <MusicLab audioRef={audioRef} />
        <MemoryGarden audioRef={audioRef} />
        <SoundTemple audioRef={audioRef} />
        <Resonance />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={16}
        autoRotate
        autoRotateSpeed={0.18}
        rotateSpeed={0.5}
      />

      <EffectComposer disableNormalPass>
        <DepthOfField focusDistance={0.012} focalLength={0.045} bokehScale={3.2} height={480} />
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.2} luminanceSmoothing={0.4} radius={0.85} />
        <Vignette eskil={false} offset={0.2} darkness={0.92} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
